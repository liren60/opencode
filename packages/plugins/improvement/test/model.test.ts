import { describe, expect, test } from "bun:test"
import { Schema } from "effect"
import { Evidence, Feedback, Options, Task, compare, fingerprint, report, settle, uniqueIDs } from "../src/model.js"

const task: Task = {
  id: "task-1",
  sessionID: "session-1",
  objective: "Verify the implementation",
  checks: [{ id: "test", command: "bun test", workdir: "." }],
  caseID: "",
  suite: "",
  variant: "baseline",
  createdAt: 1,
}
const attempt: Evidence = {
  id: "attempt-1",
  taskID: task.id,
  checkID: "test",
  revision: "revision-1",
  status: "unverified",
  reason: "No completion",
  startedAt: 1,
  completedAt: 0,
}

describe("verification evidence", () => {
  test.each([
    [{ status: "completed", exit: 0 }, "passed"],
    [{ status: "completed", exit: 1 }, "failed"],
    [{ status: "completed", exit: 0, timeout: true }, "failed"],
    [{ status: "completed", signal: "SIGTERM" }, "failed"],
    [{ status: "completed", timeout: true }, "failed"],
    [{ status: "running", exit: 0 }, "unverified"],
    [{ status: "completed" }, "unverified"],
    [{ exit: 0 }, "unverified"],
    [{ status: "completed", exit: "0" }, "unverified"],
    [undefined, "unverified"],
  ] as const)("derives status from structured Shell output %j", (output, expected) => {
    expect(settle(attempt, output).status).toBe(expected)
  })

  test("an interrupted retry supersedes old success; unrelated evidence cannot pass a check", () => {
    expect(report(task, [], "revision-1").status).toBe("unverified")
    const success = settle(attempt, { status: "completed", exit: 0 })
    expect(report(task, [success], "revision-1").status).toBe("passed")
    expect(report(task, [success, { ...attempt, id: "attempt-2", startedAt: 2 }], "revision-1").status).toBe(
      "unverified",
    )
    expect(report(task, [{ ...success, taskID: "other-task" }], "revision-1").status).toBe("unverified")
    expect(report(task, [success], "revision-2")).toMatchObject({
      status: "stale",
      checks: [{ status: "stale", evidenceID: success.id }],
    })
  })

  test("all declared checks must pass", () => {
    const multiple = { ...task, checks: [...task.checks, { id: "typecheck", command: "bun typecheck", workdir: "." }] }
    expect(report(multiple, [settle(attempt, { status: "completed", exit: 0 })], "revision-1").status).toBe(
      "unverified",
    )
  })
})

describe("fixed-suite comparison", () => {
  const cases = [{ id: "regression", objective: task.objective, checks: task.checks }]
  const feedback: Feedback = {
    taskID: "task-baseline",
    caseID: "regression",
    suite: fingerprint(cases),
    variant: "baseline",
    outcome: "rework",
    note: "Needs another pass",
    status: "failed",
    report: {},
    verificationMs: 100,
    createdAt: 1,
  }
  const candidate: Feedback = {
    ...feedback,
    taskID: "task-candidate",
    variant: "candidate",
    outcome: "accepted",
    status: "passed",
    verificationMs: 80,
  }

  test("compares complete matching suites using reviewed outcomes and verification separately", () => {
    expect(compare(cases, [feedback, candidate], ["baseline", "candidate"])).toMatchObject({
      comparable: true,
      delta: { verifiedRate: 1, acceptedRate: 1 },
      groups: [
        { verifiedRate: 0, acceptedRate: 0, verificationMs: 100 },
        { verifiedRate: 1, acceptedRate: 1, verificationMs: 80 },
      ],
    })
  })

  test.each([
    { runs: [feedback] },
    { runs: [feedback, candidate, { ...candidate, taskID: "duplicate" }] },
    { runs: [feedback, { ...candidate, suite: "changed-suite" }] },
    { runs: [feedback, { ...candidate, caseID: "unknown-case" }] },
  ])("does not report improvement for incomplete or incompatible runs %j", ({ runs }) => {
    const result = compare(cases, runs, ["baseline", "candidate"])
    expect(result.comparable).toBe(false)
    expect(result).not.toHaveProperty("delta")
  })

  test("empty suites and same variants cannot establish an improvement", () => {
    expect(compare([], [], ["baseline", "candidate"]).comparable).toBe(false)
    expect(() => compare(cases, [], ["baseline", "baseline"])).toThrow("distinct")
  })

  test("validates bounded cases and unique IDs", () => {
    expect(() => uniqueIDs([...cases, ...cases])).toThrow("unique")
    expect(() => Schema.decodeUnknownSync(Options)({ cases: [{ ...cases[0], checks: [] }] })).toThrow()
    expect(() => Schema.decodeUnknownSync(Options)({ cases: [{ ...cases[0], objective: "x".repeat(2001) }] })).toThrow()
  })
})
