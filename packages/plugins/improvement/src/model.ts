import { createHash } from "node:crypto"
import { Option, Schema } from "effect"

export const Text = Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(2000))
export const ID = Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(200))
export const Check = Schema.Struct({ id: ID, command: Text, workdir: Text })
export const Checks = Schema.Array(Check).check(Schema.isMinLength(1), Schema.isMaxLength(20))
export const Case = Schema.Struct({ id: ID, objective: Text, checks: Checks })
export const Options = Schema.Struct({
  cases: Schema.optionalKey(Schema.Array(Case).check(Schema.isMaxLength(50))),
})

export const Memory = Schema.Struct({
  id: ID,
  content: Text,
  source: Schema.Struct({ sessionID: ID, messageID: ID, quote: Text }),
  status: Schema.Literals(["pending", "active", "rejected", "suspended"]),
  createdAt: Schema.Number,
  updatedAt: Schema.Number,
})
export type Memory = typeof Memory.Type

export const Task = Schema.Struct({
  id: ID,
  sessionID: ID,
  objective: Text,
  checks: Checks,
  caseID: Schema.String,
  suite: Schema.String,
  variant: ID,
  createdAt: Schema.Number,
})
export type Task = typeof Task.Type

export const Evidence = Schema.Struct({
  id: ID,
  taskID: ID,
  checkID: ID,
  revision: Schema.String,
  status: Schema.Literals(["passed", "failed", "unverified"]),
  exit: Schema.optionalKey(Schema.Number),
  reason: Schema.String,
  startedAt: Schema.Number,
  completedAt: Schema.Number,
})
export type Evidence = typeof Evidence.Type

export type CheckReport = {
  id: string
  command: string
  workdir: string
  status: "passed" | "failed" | "unverified" | "stale"
  evidenceID?: string
  exit?: number
  reason: string
}
export type Report = {
  taskID: string
  objective: string
  status: CheckReport["status"]
  checks: CheckReport[]
}

export const Feedback = Schema.Struct({
  taskID: ID,
  caseID: Schema.String,
  suite: Schema.String,
  variant: ID,
  outcome: Schema.Literals(["accepted", "rework", "rejected"]),
  note: Text,
  status: Schema.Literals(["passed", "failed", "unverified", "stale"]),
  report: Schema.Json,
  verificationMs: Schema.Number,
  createdAt: Schema.Number,
})
export type Feedback = typeof Feedback.Type

// This is the boundary for structured output from the existing Shell executor.
export const ShellOutput = Schema.Struct({
  exit: Schema.optionalKey(Schema.Number),
  signal: Schema.optionalKey(Schema.String),
  timeout: Schema.optionalKey(Schema.Boolean),
  status: Schema.optionalKey(Schema.Literals(["completed", "running"])),
})

export function fingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex")
}

export function uniqueIDs(items: ReadonlyArray<{ id: string }>) {
  if (new Set(items.map((item) => item.id)).size !== items.length) throw new Error("IDs must be unique")
}

export function settle(attempt: Evidence, result: unknown): Evidence {
  const output = Option.getOrUndefined(Schema.decodeUnknownOption(ShellOutput)(result))
  const status =
    !output || output.status !== "completed"
      ? "unverified"
      : output.timeout || output.signal || (output.exit !== undefined && output.exit !== 0)
        ? "failed"
        : output.exit === 0
          ? "passed"
          : "unverified"
  return {
    ...attempt,
    status,
    ...(output?.exit === undefined ? {} : { exit: output.exit }),
    reason:
      status === "passed"
        ? "Declared command exited successfully"
        : status === "failed"
          ? "Command failed, timed out or was signalled"
          : "No recognized foreground completion",
    completedAt: performance.timeOrigin + performance.now(),
  }
}

export function report(task: Task, evidence: readonly Evidence[], revision: string): Report {
  const checks = task.checks.map((check): CheckReport => {
    const latest = evidence.findLast((item) => item.taskID === task.id && item.checkID === check.id)
    if (!latest) return { ...check, status: "unverified", reason: "No verification attempt recorded" }
    return {
      ...check,
      status: latest.revision !== revision ? "stale" : latest.status,
      evidenceID: latest.id,
      ...(latest.exit === undefined ? {} : { exit: latest.exit }),
      reason: latest.revision !== revision ? "Observed edits changed after verification began" : latest.reason,
    }
  })
  return {
    taskID: task.id,
    objective: task.objective,
    status: checks.some((check) => check.status === "failed")
      ? "failed"
      : checks.some((check) => check.status === "stale")
        ? "stale"
        : checks.every((check) => check.status === "passed")
          ? "passed"
          : "unverified",
    checks,
  }
}

export function compare(
  cases: readonly (typeof Case.Type)[],
  feedback: readonly Feedback[],
  variants: readonly string[],
) {
  if (variants.length !== 2 || variants[0] === variants[1]) throw new Error("Choose two distinct variants")
  const suite = fingerprint(cases)
  const groups = variants.map((variant) => {
    const runs = feedback.filter((item) => item.variant === variant && item.caseID !== "")
    const missing = cases.filter((item) => !runs.some((run) => run.caseID === item.id)).map((item) => item.id)
    const duplicate = cases
      .filter((item) => runs.filter((run) => run.caseID === item.id).length > 1)
      .map((item) => item.id)
    const mismatched = runs.filter((item) => item.suite !== suite || !cases.some((entry) => entry.id === item.caseID))
    return {
      variant,
      runs: runs.length,
      missing,
      duplicate,
      mismatched: mismatched.map((item) => item.taskID),
      verifiedRate: runs.length ? runs.filter((item) => item.status === "passed").length / runs.length : 0,
      acceptedRate: runs.length ? runs.filter((item) => item.outcome === "accepted").length / runs.length : 0,
      verificationMs: runs.reduce((total, item) => total + item.verificationMs, 0),
    }
  })
  const comparable =
    cases.length > 0 &&
    groups.every((item) => !item.missing.length && !item.duplicate.length && !item.mismatched.length)
  const baseline = groups[0]
  const candidate = groups[1]
  return {
    suite,
    comparable,
    groups,
    ...(comparable && baseline && candidate
      ? {
          delta: {
            verifiedRate: candidate.verifiedRate - baseline.verifiedRate,
            acceptedRate: candidate.acceptedRate - baseline.acceptedRate,
          },
        }
      : {}),
    warning:
      "Small-sample descriptive comparison, not proof of model improvement. Keep model and environment comparable.",
  }
}
