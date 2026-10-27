import type { StorageDomain } from "@opencode/plugin/promise/storage"
import { Schema } from "effect"
import { Evidence, Feedback, Memory, Task, fingerprint } from "./model.js"

export function store(storage: StorageDomain, project: string) {
  const prefix = `improvement/v1/${fingerprint(project)}/`
  const list = async <S extends Schema.ConstraintDecoder<unknown>>(kind: string, schema: S) => {
    const entries = []
    let after: string | undefined
    do {
      const page = await storage.scan({ prefix: prefix + kind + "/", ...(after ? { after } : {}), limit: 1000 })
      entries.push(...page.entries.map((item) => Schema.decodeUnknownSync(schema)(item.value)))
      after = page.next
    } while (after)
    return entries
  }
  const get = async <S extends Schema.ConstraintDecoder<unknown>>(kind: string, id: string, schema: S) => {
    const value = await storage.get(prefix + kind + "/" + id)
    if (value === undefined) throw new Error(`Unknown ${kind}: ${id}`)
    return Schema.decodeUnknownSync(schema)(value)
  }
  return {
    memories: () => list("memory", Memory),
    memory: (id: string) => get("memory", id, Memory),
    saveMemory: (value: Memory) => storage.set(prefix + "memory/" + value.id, value),
    forget: (id: string) => storage.remove(prefix + "memory/" + id),
    tasks: () => list("task", Task),
    task: (id: string) => get("task", id, Task),
    saveTask: (value: Task) => storage.set(prefix + "task/" + value.id, value),
    evidence: async () => (await list("evidence", Evidence)).sort((a, b) => a.startedAt - b.startedAt),
    saveEvidence: (value: Evidence) => storage.set(prefix + "evidence/" + value.id, value),
    feedback: () => list("feedback", Feedback),
    saveFeedback: (value: Feedback) => storage.set(prefix + "feedback/" + value.taskID, value),
    invalidate: () => storage.set(prefix + "edit/" + crypto.randomUUID(), true),
    revision: async () => fingerprint(await list("edit", Schema.Boolean)),
  }
}
