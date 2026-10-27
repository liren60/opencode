import { expect } from "bun:test"
import { Bus } from "@opencode/core/bus"
import { Config } from "@opencode/core/config"
import { AppNodeBuilder } from "@opencode/core/effect/app-node-builder"
import { Environment } from "@opencode/core/environment/index"
import { FileAccess } from "@opencode/core/file-access"
import { FileMutation } from "@opencode/core/file-mutation"
import { Formatter } from "@opencode/core/formatter"
import { Job } from "@opencode/core/job"
import { Location } from "@opencode/core/location"
import { Permission } from "@opencode/core/permission"
import { Plugin } from "@opencode/core/plugin"
import { PluginHost } from "@opencode/core/plugin/host"
import { PluginHooks } from "@opencode/core/plugin/hooks"
import { PluginPromise } from "@opencode/core/plugin/promise"
import { Session } from "@opencode/core/session"
import { SessionEvent } from "@opencode/core/session/event"
import { Shell } from "@opencode/core/shell"
import { ShellSelect } from "@opencode/core/shell/select"
import { Tool } from "@opencode/core/tool"
import { ShellTool } from "@opencode/core/tool/plugin/shell"
import { WriteTool } from "@opencode/core/tool/plugin/write"
import type { PluginOptions } from "@opencode/plugin"
import { Model } from "@opencode/schema/model"
import { Provider } from "@opencode/schema/provider"
import { LayerNode } from "@opencode/util/effect/layer-node"
import { Deferred, Effect, Fiber, Schema } from "effect"
import improvement from "../../plugins/improvement/index"
import { Memory, Task } from "../../plugins/improvement/src/model"
import { store } from "../../plugins/improvement/src/store"
import { tempLocationLayer } from "./fixture/location"
import { offlineModels } from "./fixture/models"
import { testEffect } from "./lib/effect"
import { executeTool, toolIdentity } from "./lib/tool"
import type { ToolExecution } from "./lib/tool"

const it = testEffect(
  AppNodeBuilder.build(
    LayerNode.group([
      PluginHost.requirements,
      Plugin.node,
      Config.node,
      Job.node,
      Shell.node,
      ShellSelect.node,
      Environment.node,
      FileAccess.node,
      FileMutation.node,
      Formatter.node,
    ]),
    [Location.node.replace(tempLocationLayer), Config.node.replace(Config.testLayer()), offlineModels],
  ),
)

function setup(options: PluginOptions = {}) {
  return Effect.gen(function* () {
    const plugins = yield* Plugin.Service
    const sessions = yield* Session.Service
    const location = yield* Location.Service
    const host = yield* PluginHost.make(plugins, improvement.id)
    yield* PluginPromise.fromPromise(improvement).effect({ ...host, options })
    const session = yield* sessions.create({
      location: Location.Ref.make({ directory: location.directory }),
      model: Model.Ref.make({ providerID: Provider.ID.make("test"), id: Model.ID.make("alpha") }),
      permissions: [{ action: "*", resource: "*", effect: "allow" }],
    })
    const registry = yield* Tool.Service
    const run = (name: string, input: unknown, sessionID = session.id) =>
      executeTool(registry, {
        sessionID,
        ...toolIdentity,
        call: {
          type: "tool-call",
          id: `call_${crypto.randomUUID()}`,
          name: "execute",
          input: { code: `return await tools.improvement.${name}(${JSON.stringify(input)})` },
        },
      })
    return { host, session, run, sessions, location }
  })
}

function decoded<S extends Schema.ConstraintDecoder<unknown>>(schema: S, result: ToolExecution) {
  const content = result.content?.[0]
  if (content?.type !== "text") throw new Error("Missing tool result")
  if (result.status !== "completed") throw new Error(content.text)
  return Schema.decodeUnknownSync(schema)(JSON.parse(content.text))
}

function approve(run: Effect.Effect<ToolExecution>, action: string, reply: "once" | "reject" = "once") {
  return Effect.gen(function* () {
    const bus = yield* Bus.Service
    const permissions = yield* Permission.Service
    const asked = yield* Deferred.make<Permission.Request>()
    const unsubscribe = yield* bus.listen((event) => {
      if (event.type !== Permission.Event.Asked.type) return Effect.void
      const request = Schema.decodeUnknownSync(Permission.Request)(event.data)
      return request.action === action ? Deferred.succeed(asked, request).pipe(Effect.asVoid) : Effect.void
    })
    const fiber = yield* run.pipe(Effect.forkScoped)
    const request = yield* Deferred.await(asked)
    expect(request.save).toEqual([])
    expect(request.metadata).toBeDefined()
    yield* permissions.reply({
      requestID: request.id,
      reply,
      ...(reply === "reject" ? { message: "Do not save this" } : {}),
    })
    const result = yield* Fiber.join(fiber)
    yield* unsubscribe
    return { result, request }
  })
}

it.live("improvement memory requires real approval and recalls only active notes", () =>
  Effect.gen(function* () {
    const fixture = yield* setup()
    const bus = yield* Bus.Service
    const hooks = yield* PluginHooks.Service
    const message = yield* fixture.sessions.prompt({
      sessionID: fixture.session.id,
      text: "Please keep your answers concise.",
      resume: false,
    })
    yield* bus.publish(SessionEvent.InboxDelivered, { sessionID: fixture.session.id, inboxID: message.id })
    const memory = decoded(
      Memory,
      yield* fixture.run("memory_propose", {
        content: "Keep answers concise.",
        messageID: message.id,
        quote: "keep your answers concise",
      }),
    )
    expect(memory.status).toBe("pending")
    const invalid = yield* fixture.run("memory_propose", {
      content: "Invented note",
      messageID: message.id,
      quote: "Never said this",
    })
    expect(invalid.content).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining("Quote must occur") })]),
    )
    const model = fixture.session.model
    if (!model) throw new Error("Missing fixture model")
    const context = () =>
      hooks
        .trigger("session", "context", {
          sessionID: fixture.session.id,
          agent: toolIdentity.agent,
          model,
          system: [],
          messages: [],
          tools: {},
          options: {},
        })
        .pipe(Effect.map((event) => event.system.map((part) => (part.type === "text" ? part.text : "")).join("\n")))
    expect(yield* context()).not.toContain(memory.content)
    yield* fixture.sessions.setPermissions({
      sessionID: fixture.session.id,
      permissions: [
        { action: "*", resource: "*", effect: "allow" },
        { action: "improvement.memory.activate", resource: "*", effect: "deny" },
      ],
    })
    const denied = yield* fixture.run("memory_review", { id: memory.id, decision: "activate" })
    expect(denied.content).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining("Permission") })]),
    )
    expect(decoded(Schema.Array(Memory), yield* fixture.run("memory_list", {}))[0]?.status).toBe("pending")
    yield* fixture.sessions.setPermissions({
      sessionID: fixture.session.id,
      permissions: [{ action: "*", resource: "*", effect: "allow" }],
    })
    const approved = yield* approve(
      fixture.run("memory_review", { id: memory.id, decision: "activate" }),
      "improvement.memory.activate",
    )
    expect(approved.request.metadata).toMatchObject({
      memory: { content: memory.content, source: { messageID: message.id } },
    })
    expect(decoded(Memory, approved.result).status).toBe("active")
    expect(yield* context()).toContain(memory.content)
    yield* approve(fixture.run("memory_review", { id: memory.id, decision: "suspend" }), "improvement.memory.suspend")
    expect(yield* context()).not.toContain(memory.content)
    yield* approve(
      fixture.run("memory_review", { id: memory.id, decision: "activate" }),
      "improvement.memory.activate",
      "reject",
    )
    expect(decoded(Schema.Array(Memory), yield* fixture.run("memory_list", {}))[0]?.status).toBe("suspended")
    yield* approve(fixture.run("memory_review", { id: memory.id, decision: "forget" }), "improvement.memory.forget")
    expect(decoded(Schema.Array(Memory), yield* fixture.run("memory_list", {}))).toEqual([])
  }),
)

it.live("improvement verification delegates to real Shell and respects Shell denies", () =>
  Effect.gen(function* () {
    const fixture = yield* setup()
    yield* ShellTool.Plugin.effect(fixture.host)
    yield* WriteTool.Plugin.effect(fixture.host)
    const task = decoded(
      Task,
      yield* fixture.run("task_start", {
        objective: "Verify command execution",
        variant: "baseline",
        checks: [{ id: "success", command: 'bun -e "process.exit(0)"', workdir: fixture.location.directory }],
      }),
    )
    expect(decoded(Schema.Json, yield* fixture.run("verify", { taskID: task.id, checkID: "success" }))).toMatchObject({
      evidence: { status: "passed", exit: 0 },
      report: { status: "passed" },
    })
    yield* fixture.sessions.setPermissions({
      sessionID: fixture.session.id,
      permissions: [
        { action: "*", resource: "*", effect: "allow" },
        { action: "shell", resource: "*", effect: "deny" },
      ],
    })
    yield* fixture.run("verify", { taskID: task.id, checkID: "success" })
    expect(decoded(Schema.Json, yield* fixture.run("task_report", { taskID: task.id }))).toMatchObject({
      status: "unverified",
    })
    yield* fixture.sessions.setPermissions({
      sessionID: fixture.session.id,
      permissions: [{ action: "*", resource: "*", effect: "allow" }],
    })
    yield* fixture.run("verify", { taskID: task.id, checkID: "success" })
    const registry = yield* Tool.Service
    const written = yield* executeTool(registry, {
      sessionID: fixture.session.id,
      ...toolIdentity,
      call: {
        type: "tool-call",
        id: "call-write",
        name: "write",
        input: { path: "evidence.txt", content: "Changed after verification" },
      },
    })
    expect(written.status).toBe("completed")
    expect(decoded(Schema.Json, yield* fixture.run("task_report", { taskID: task.id }))).toMatchObject({
      status: "stale",
    })
    yield* fixture.run("verify", { taskID: task.id, checkID: "success" })
    yield* fixture.run("invalidate", {})
    expect(decoded(Schema.Json, yield* fixture.run("task_report", { taskID: task.id }))).toMatchObject({
      status: "stale",
    })
    const feedback = yield* approve(
      fixture.run("feedback", { taskID: task.id, outcome: "rework", note: "Rerun after the edit" }),
      "improvement.feedback",
    )
    expect(feedback.request.metadata).toMatchObject({ feedback: { outcome: "rework", status: "stale" } })
    const other = yield* fixture.sessions.create({
      location: Location.Ref.make({ directory: fixture.location.directory }),
      model: fixture.session.model,
      permissions: [{ action: "*", resource: "*", effect: "allow" }],
    })
    const crossSession = yield* fixture.run("task_report", { taskID: task.id }, other.id)
    expect(crossSession.content).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining("another session") })]),
    )
  }),
)

it.live("improvement fixed cases cannot be overridden and comparison requires both variants", () =>
  Effect.gen(function* () {
    const fixture = yield* setup({
      cases: [
        { id: "regression", objective: "Fixed objective", checks: [{ id: "test", command: "bun test", workdir: "." }] },
      ],
    })
    const override = yield* fixture.run("task_start", {
      caseID: "regression",
      variant: "baseline",
      checks: [{ id: "weak", command: "echo ok", workdir: "." }],
    })
    expect(override.content).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining("cannot be overridden") })]),
    )
    const task = decoded(Task, yield* fixture.run("task_start", { caseID: "regression", variant: "baseline" }))
    expect(task).toMatchObject({ objective: "Fixed objective", checks: [{ command: "bun test" }] })
    yield* approve(
      fixture.run("feedback", { taskID: task.id, outcome: "rework", note: "Not executed yet" }),
      "improvement.feedback",
    )
    expect(
      decoded(Schema.Json, yield* fixture.run("evaluate", { baseline: "baseline", candidate: "candidate" })),
    ).toMatchObject({ comparable: false, groups: [{ runs: 1 }, { runs: 0, missing: ["regression"] }] })
  }),
)

it.live("improvement storage is persistent, project-scoped and paginated", () =>
  Effect.gen(function* () {
    const fixture = yield* setup()
    const runtime = yield* Effect.context()
    const storage = {
      get: (key: string) => Effect.runPromiseWith(runtime)(fixture.host.storage.get(key)),
      set: (key: string, value: Schema.Json) => Effect.runPromiseWith(runtime)(fixture.host.storage.set(key, value)),
      remove: (key: string) => Effect.runPromiseWith(runtime)(fixture.host.storage.remove(key)),
      scan: (options: { prefix: string; after?: string; limit?: number }) =>
        Effect.runPromiseWith(runtime)(fixture.host.storage.scan(options)),
    }
    const first = store(storage, "project-a")
    const second = store(storage, "project-b")
    const memory: Memory = {
      id: "note",
      content: "Scoped note",
      source: { sessionID: "session", messageID: "message", quote: "Scoped" },
      status: "active",
      createdAt: 1,
      updatedAt: 1,
    }
    yield* Effect.promise(() => first.saveMemory(memory))
    expect(yield* Effect.promise(() => store(storage, "project-a").memories())).toEqual([memory])
    expect(yield* Effect.promise(() => second.memories())).toEqual([])
    const before = yield* Effect.promise(() => first.revision())
    // Cross the real KV page limit without process spawns or timer waits.
    yield* Effect.promise(() => Promise.all(Array.from({ length: 1001 }, () => first.invalidate())))
    expect(yield* Effect.promise(() => first.revision())).not.toBe(before)
    expect(yield* Effect.promise(() => second.revision())).toBe(before)
    expect(decoded(Schema.Array(Memory), yield* fixture.run("memory_list", {}))).toEqual([])
  }),
)
