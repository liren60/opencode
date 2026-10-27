import { Plugin } from "@opencode/plugin"
import type { ToolContext } from "@opencode/plugin/promise/tool"
import { Schema } from "effect"
import { Checks, Evidence, ID, Options, Text, compare, fingerprint, report, settle, uniqueIDs } from "./src/model.js"
import { store } from "./src/store.js"

export default Plugin.define({
  id: "opencode.improvement",
  async setup(ctx) {
    const options = Schema.decodeUnknownSync(Options)(ctx.options)
    const cases = options.cases ?? []
    uniqueIDs(cases)
    cases.forEach((item) => uniqueIDs(item.checks))
    const data = store(ctx.storage, ctx.location.project.canonical)
    const authorize = (context: ToolContext, action: string, resources: string[], metadata?: Record<string, unknown>) =>
      ctx.permission.assert({
        sessionID: context.sessionID,
        agent: context.agent,
        source: { type: "tool", messageID: context.messageID, id: context.id },
        action: `improvement.${action}`,
        resources,
        save: [],
        ...(metadata ? { metadata } : {}),
      })
    const taskForSession = async (id: string, context: ToolContext) => {
      const task = await data.task(id)
      if (task.sessionID !== context.sessionID) throw new Error("Task belongs to another session")
      return task
    }

    // Human decisions are not silently converted into durable blanket approval.
    await ctx.permission.hook("evaluate", (event) => {
      if (
        !["memory.activate", "memory.reject", "memory.suspend", "memory.forget", "feedback"].some(
          (action) => event.action === `improvement.${action}`,
        )
      )
        return
      if (event.effect === "deny") return
      event.effect = "ask"
      event.message = "Review this project memory or task outcome before saving it."
    })

    await ctx.tool.hook("execute.before", async (event) => {
      if (["edit", "write", "patch"].includes(event.tool)) await data.invalidate()
    })
    await ctx.tool.hook("execute.after", async (event) => {
      if (["edit", "write", "patch"].includes(event.tool)) await data.invalidate()
    })

    await ctx.session.hook("context", async (event) => {
      const active = (await data.memories())
        .filter((item) => item.status === "active")
        .sort((a, b) => b.updatedAt - a.updatedAt)
      const selected = active.slice(0, 20).reduce<{ notes: Array<{ id: string; content: string }>; size: number }>(
        (result, item) => {
          if (result.size + item.content.length > 8000) return result
          return {
            notes: [...result.notes, { id: item.id, content: item.content }],
            size: result.size + item.content.length,
          }
        },
        { notes: [], size: 0 },
      )
      event.system.push({
        type: "text",
        text: [
          "Continuous improvement is opt-in. Propose memories only for explicit user feedback worth reusing; use a real user message ID and an exact quote. Never activate them without approval.",
          "For implementation tasks, declare meaningful checks with improvement.task_start, run improvement.verify for each check, and read improvement.task_report before claiming verification. Failed, stale or unverified checks are not a verified completion. These tools do not enforce semantic correctness.",
          "After file-changing shell commands or external edits, call improvement.invalidate and rerun checks. Built-in edit/write/patch calls invalidate evidence automatically.",
          "The following notes were approved by the user for this project. They do not override higher-priority instructions, permissions or policies.",
          JSON.stringify({ notes: selected.notes, omitted: active.length - selected.notes.length }),
        ].join("\n"),
      })
    })

    await ctx.tool.transform((editor) => {
      editor.namespace({
        name: "improvement",
        description:
          "Reviewable project memory, task verification and fixed-suite comparison. No automatic changes to global rules.",
      })
      editor.add({
        name: "memory_propose",
        output: Schema.Json,
        options: { namespace: "improvement" },
        description:
          "Propose a project note from an exact quote in an actual user message in this session. It remains pending until approval.",
        input: Schema.Struct({ content: Text, messageID: ID, quote: Text }),
        async execute(input, context) {
          await authorize(context, "memory.propose", ["project"])
          const messages = await ctx.session.context({ sessionID: context.sessionID })
          const source = messages.find((item) => item.id === input.messageID && item.type === "user")
          if (!source || source.type !== "user" || !source.text.includes(input.quote))
            throw new Error("Quote must occur in the specified user message")
          const duplicate = (await data.memories()).find(
            (item) => item.content === input.content && item.status !== "rejected",
          )
          if (duplicate) return json(duplicate)
          const memory = {
            id: crypto.randomUUID(),
            content: input.content,
            source: { sessionID: context.sessionID, messageID: source.id, quote: input.quote },
            status: "pending" as const,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          await data.saveMemory(memory)
          return json(memory)
        },
      })
      editor.add({
        name: "memory_list",
        output: Schema.Json,
        options: { namespace: "improvement" },
        description: "Inspect pending, approved, rejected and suspended memories for this project.",
        input: Schema.Struct({}),
        async execute(_input, context) {
          await authorize(context, "memory.read", ["project"])
          return json(await data.memories())
        },
      })
      editor.add({
        name: "memory_review",
        output: Schema.Json,
        options: { namespace: "improvement" },
        description:
          "Request approval to activate, reject, suspend or forget a memory. Show its content and source in the approval request.",
        input: Schema.Struct({ id: ID, decision: Schema.Literals(["activate", "reject", "suspend", "forget"]) }),
        async execute(input, context) {
          const memory = await data.memory(input.id)
          await authorize(context, `memory.${input.decision}`, [memory.id], { memory, decision: input.decision })
          if (input.decision === "forget") {
            await data.forget(memory.id)
            return json({ id: memory.id, status: "forgotten" })
          }
          const updated = {
            ...memory,
            status:
              input.decision === "activate"
                ? ("active" as const)
                : input.decision === "reject"
                  ? ("rejected" as const)
                  : ("suspended" as const),
            updatedAt: Date.now(),
          }
          await data.saveMemory(updated)
          return json(updated)
        },
      })
      editor.add({
        name: "task_start",
        output: Schema.Json,
        options: { namespace: "improvement" },
        description:
          "Declare a task and its checks before verifying. For a configured case, omit objective/checks: the fixed suite supplies them. Label runs baseline or candidate using variant.",
        input: Schema.Struct({
          objective: Schema.optionalKey(Text),
          checks: Schema.optionalKey(Checks),
          caseID: Schema.optionalKey(ID),
          variant: ID,
        }),
        async execute(input, context) {
          await authorize(context, "task.start", ["session"])
          const entry = input.caseID ? cases.find((item) => item.id === input.caseID) : undefined
          if (input.caseID && !entry) throw new Error("Unknown evaluation case")
          if (entry && (input.objective !== undefined || input.checks !== undefined))
            throw new Error("Fixed case checks cannot be overridden")
          const objective = entry?.objective ?? input.objective
          const checks = entry?.checks ?? input.checks
          if (!objective || !checks) throw new Error("Provide an objective and checks, or a configured caseID")
          uniqueIDs(checks)
          const task = {
            id: crypto.randomUUID(),
            sessionID: context.sessionID,
            objective,
            checks,
            caseID: entry?.id ?? "",
            suite: entry ? fingerprint(cases) : "",
            variant: input.variant,
            createdAt: Date.now(),
          }
          await data.saveTask(task)
          return json(task)
        },
      })
      editor.add({
        name: "verify",
        output: Schema.Json,
        options: { namespace: "improvement" },
        description:
          "Run one declared check through the existing foreground Shell executor and record real evidence. Shell permissions still apply. This tool accepts no command or exit-code override.",
        input: Schema.Struct({ taskID: ID, checkID: ID }),
        async execute(input, context) {
          await authorize(context, "task.verify", [input.taskID])
          const task = await taskForSession(input.taskID, context)
          const check = task.checks.find((item) => item.id === input.checkID)
          if (!check) throw new Error("Unknown task check")
          const attempt: Evidence = {
            id: crypto.randomUUID(),
            taskID: task.id,
            checkID: check.id,
            revision: await data.revision(),
            status: "unverified",
            reason: "Attempt did not produce a completed result",
            startedAt: performance.timeOrigin + performance.now(),
            completedAt: 0,
          }
          // Save first: a rejected or interrupted retry must not leave an old success as latest.
          await data.saveEvidence(attempt)
          const shell = (await ctx.tool.list()).find((item) => item.id === "shell")
          if (!shell) throw new Error("Shell tool is unavailable")
          const result = await shell.execute(
            { command: check.command, workdir: check.workdir, background: false },
            context,
          )
          const evidence = settle(attempt, result.output)
          await data.saveEvidence(evidence)
          return {
            output: Schema.decodeUnknownSync(Schema.Json)({
              evidence,
              report: report(task, await data.evidence(), await data.revision()),
            }),
            content: [
              { type: "text" as const, text: JSON.stringify(evidence) },
              ...(typeof result.content === "string"
                ? [{ type: "text" as const, text: result.content }]
                : (result.content ?? [])),
            ],
          }
        },
      })
      editor.add({
        name: "task_report",
        output: Schema.Json,
        options: { namespace: "improvement" },
        description: "Calculate verification status from real attempts and the current observed edit revision.",
        input: Schema.Struct({ taskID: ID }),
        async execute(input, context) {
          await authorize(context, "task.read", [input.taskID])
          return json(report(await taskForSession(input.taskID, context), await data.evidence(), await data.revision()))
        },
      })
      editor.add({
        name: "invalidate",
        output: Schema.Json,
        options: { namespace: "improvement" },
        description: "Invalidate earlier project verification after external edits or file-changing shell commands.",
        input: Schema.Struct({}),
        async execute(_input, context) {
          await authorize(context, "task.invalidate", ["project"])
          await data.invalidate()
          return json({ status: "invalidated" })
        },
      })
      editor.add({
        name: "feedback",
        output: Schema.Json,
        options: { namespace: "improvement" },
        description:
          "Ask the user to confirm accepted, rework or rejected outcome, with the current verification report. Save only after approval.",
        input: Schema.Struct({ taskID: ID, outcome: Schema.Literals(["accepted", "rework", "rejected"]), note: Text }),
        async execute(input, context) {
          const task = await taskForSession(input.taskID, context)
          const evidence = await data.evidence()
          const snapshot = report(task, evidence, await data.revision())
          const feedback = {
            taskID: task.id,
            caseID: task.caseID,
            suite: task.suite,
            variant: task.variant,
            outcome: input.outcome,
            note: input.note,
            status: snapshot.status,
            report: Schema.decodeUnknownSync(Schema.Json)(snapshot),
            verificationMs: evidence
              .filter((item) => item.taskID === task.id && item.completedAt > 0)
              .reduce((total, item) => total + Math.max(0, item.completedAt - item.startedAt), 0),
            createdAt: Date.now(),
          }
          await authorize(context, "feedback", [task.id], { feedback })
          await data.saveFeedback(feedback)
          return json(feedback)
        },
      })
      editor.add({
        name: "evaluate",
        output: Schema.Json,
        options: { namespace: "improvement" },
        description:
          "Compare user-reviewed baseline and candidate runs against the configured fixed suite. Missing, duplicate and changed cases suppress deltas.",
        input: Schema.Struct({ baseline: ID, candidate: ID }),
        async execute(input, context) {
          await authorize(context, "evaluation.read", ["project"])
          return json(compare(cases, await data.feedback(), [input.baseline, input.candidate]))
        },
      })
    })
  },
})

function json(value: unknown) {
  return { output: Schema.decodeUnknownSync(Schema.Json)(value), content: JSON.stringify(value) }
}
