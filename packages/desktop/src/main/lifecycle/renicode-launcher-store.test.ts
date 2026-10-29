import { afterEach, expect, setSystemTime, test } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { RenicodeLauncherStore, type Slot } from "./renicode-launcher-store"

afterEach(() => setSystemTime())

const baseline: Slot = {
  name: "A",
  directory: "stable",
  version: "1",
  cli_hash: "backend",
  storage_hash: "storage",
  files: "{}",
  reporting: 0,
}

test("deployment and task handoff survive closing and reopening the independent launcher", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "renicode-launcher-"))
  const first = new RenicodeLauncherStore(path.join(root, "launcher.sqlite"))

  try {
    first.install(baseline)
    first.install({ ...baseline, name: "B", directory: "candidate" }, "ses_resume", "verify candidate")
    first.begin("startup", "B")
  } finally {
    first.close()
  }

  const resumed = new RenicodeLauncherStore(path.join(root, "launcher.sqlite"))

  try {
    expect(resumed.state()).toMatchObject({ active: "A", pending: "B" })
    expect(resumed.run("startup")?.status).toBe("booting")
    expect(resumed.db.prepare("SELECT session_id, note FROM handoff WHERE phase = 'staged'").get()).toEqual({
      session_id: "ses_resume",
      note: "verify candidate",
    })
    resumed.confirm("B")
    expect(resumed.state()).toMatchObject({ active: "B", previous: "A", pending: null })
  } finally {
    resumed.close()
    await rm(root, { recursive: true, force: true })
  }
})

test("reusing the inactive slot cannot turn an untested candidate into the previous stable version", () => {
  const store = new RenicodeLauncherStore(":memory:")

  try {
    store.install(baseline)
    store.install({ ...baseline, name: "B", directory: "stable-b" })
    store.confirm("B")
    store.install({ ...baseline, directory: "untested-a" })
    expect(store.state()).toMatchObject({ active: "B", pending: "A", previous: null })
    store.rollback()
    expect(store.state()).toMatchObject({ active: "B", pending: null, previous: null })
    expect(() => store.rollback()).toThrow("No previous version")
  } finally {
    store.close()
  }
})

test.each([
  { name: "healthy candidate is promoted and keeps the previous slot", action: "confirm", active: "B", previous: "A" },
  { name: "failed candidate leaves the stable slot active", action: "reject", active: "A", previous: null },
  { name: "confirmed candidate can roll back to its previous slot", action: "rollback", active: "A", previous: "B" },
])("$name", (row) => {
  const store = new RenicodeLauncherStore(":memory:")

  try {
    store.install(baseline)
    store.install({ ...baseline, name: "B", directory: "candidate", reporting: 1 }, "ses_example", "verify update")
    expect(store.state()).toMatchObject({ active: "A", pending: "B", previous: null })

    if (row.action !== "reject") store.confirm("B")

    if (row.action !== "confirm") store.rollback()
    expect(store.state()).toMatchObject({ active: row.active, previous: row.previous, pending: null })
    expect(store.db.prepare("SELECT session_id, note FROM handoff WHERE phase = 'staged'").get()).toEqual({
      session_id: "ses_example",
      note: "verify update",
    })
  } finally {
    store.close()
  }
})

test.each([
  { name: "backend change", candidate: { ...baseline, name: "B" as const, cli_hash: "different" } },
  { name: "desktop migration change", candidate: { ...baseline, name: "B" as const, storage_hash: "different" } },
  { name: "active slot overwrite", candidate: { ...baseline, directory: "replacement" } },
])("$name is rejected without changing the deployment", (row) => {
  const store = new RenicodeLauncherStore(":memory:")

  try {
    store.install(baseline)
    expect(() => store.install(row.candidate)).toThrow()
    expect(store.state()).toMatchObject({ active: "A", pending: null })
    expect(store.slot("A")).toEqual(baseline)
    expect(store.slot("B")).toBeUndefined()
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM handoff").get()).toEqual({ count: 1 })
  } finally {
    store.close()
  }
})

test.each([{ status: "clean" as const }, { status: "fault" as const }])(
  "$status cannot be overwritten by delayed readiness",
  (row) => {
    const store = new RenicodeLauncherStore(":memory:")

    try {
      store.begin("run", "A")
      setSystemTime(new Date("2026-10-26T00:00:00Z"))
      store.report("run", "ready")
      expect(store.run("run")?.ready_at).toBe(Date.parse("2026-10-26T00:00:00Z"))
      store.report("run", row.status)
      store.report("run", "ready")
      store.report("run", "clean")
      expect(store.run("run")?.status).toBe(row.status)
    } finally {
      store.close()
    }
  },
)

test("incompatible generation retains separate profiles through promotion and rollback", () => {
  const store = new RenicodeLauncherStore(":memory:")

  try {
    store.install(baseline)
    expect(() => store.install({ ...baseline, name: "B", cli_hash: "new", reporting: 1 })).toThrow()
    store.install({ ...baseline, name: "B", cli_hash: "new", storage_hash: "new-storage", reporting: 1, profile: "new-profile" })
    store.confirm("B")
    expect(store.slot("B")?.profile).toBe("new-profile")
    expect(store.slot("A")?.profile).toBeUndefined()
    expect(() => store.install({ ...baseline, cli_hash: "newer", profile: "new-profile", reporting: 1 })).toThrow()
    store.rollback()
    expect(store.state().active).toBe("A")
    expect(store.slot("B")?.profile).toBe("new-profile")
    store.rollback()
    expect(store.state().active).toBe("B")
    expect(store.slot("B")?.profile).toBe("new-profile")
  } finally { store.close() }
})
