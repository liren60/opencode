import { DatabaseSync } from "node:sqlite"

export type Slot = {
  name: "A" | "B"
  directory: string
  version: string
  cli_hash: string
  storage_hash: string
  files: string
  reporting: number
  profile?: string
}

export type LaunchState = {
  active: "A" | "B" | null
  previous: "A" | "B" | null
  pending: "A" | "B" | null
  guardian_pid: number | null
}

export type LaunchRun = {
  id: string
  slot: "A" | "B"
  pid: number | null
  status: "booting" | "ready" | "clean" | "fault"
  ready_at: number | null
}

/** Shared with the independent launcher: SQLite keeps version switches and handoffs atomic. */
export class RenicodeLauncherStore {
  readonly db: DatabaseSync

  constructor(file: string) {
    this.db = new DatabaseSync(file)
    this.db.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS control (
        id INTEGER PRIMARY KEY CHECK (id = 1), active TEXT, previous TEXT, pending TEXT, guardian_pid INTEGER
      );
      INSERT OR IGNORE INTO control (id) VALUES (1);
      CREATE TABLE IF NOT EXISTS slot (
        name TEXT PRIMARY KEY, directory TEXT NOT NULL, version TEXT NOT NULL,
        cli_hash TEXT NOT NULL, storage_hash TEXT NOT NULL, files TEXT NOT NULL, reporting INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS run (
        id TEXT PRIMARY KEY, slot TEXT NOT NULL, pid INTEGER, status TEXT NOT NULL, ready_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS handoff (
        id INTEGER PRIMARY KEY, time INTEGER NOT NULL, phase TEXT NOT NULL, slot TEXT,
        session_id TEXT, note TEXT
      );
      CREATE TABLE IF NOT EXISTS slot_profile (name TEXT PRIMARY KEY, directory TEXT NOT NULL);
    `)
  }

  state() {
    // SAFETY: the constructor creates the singleton row; launcher writes preserve these columns and slot names.
    return this.db
      .prepare("SELECT active, previous, pending, guardian_pid FROM control WHERE id = 1")
      .get() as LaunchState
  }

  slot(name: "A" | "B") {
    // SAFETY: install writes Slot fields in schema order; a missing name returns undefined.
    const slot = this.db.prepare("SELECT * FROM slot WHERE name = ?").get(name) as Slot | undefined

    if (!slot) return undefined
    const profile = this.db.prepare("SELECT directory FROM slot_profile WHERE name = ?").get(name)

    return profile ? { ...slot, profile: String(profile.directory) } : slot
  }

  install(slot: Slot, session?: string, note?: string) {
    return this.transaction(() => {
      const state = this.state()

      if (state.pending || state.active === slot.name) throw new Error("Slot is active or an update is already pending")
      const active = state.active ? this.slot(state.active) : undefined

      if (
        active &&
        (active.cli_hash !== slot.cli_hash || active.storage_hash !== slot.storage_hash) &&
        (!slot.reporting || !slot.profile || slot.profile === active.profile)
      )
        throw new Error("Update changes the backend or desktop storage contract; rollback is not safe")

      if (active && active.cli_hash === slot.cli_hash && active.storage_hash === slot.storage_hash && slot.profile !== active.profile)
        throw new Error("A compatible update must retain the active profile")
      // Reusing the inactive slot replaces the older fallback, not the current stable version.
      this.db.prepare("UPDATE control SET previous = NULL WHERE id = 1 AND previous = ?").run(slot.name)
      this.db
        .prepare("INSERT OR REPLACE INTO slot VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(slot.name, slot.directory, slot.version, slot.cli_hash, slot.storage_hash, slot.files, slot.reporting)
      this.db.prepare("DELETE FROM slot_profile WHERE name = ?").run(slot.name)

      if (slot.profile) this.db.prepare("INSERT INTO slot_profile VALUES (?, ?)").run(slot.name, slot.profile)
      this.db
        .prepare(active ? "UPDATE control SET pending = ? WHERE id = 1" : "UPDATE control SET active = ? WHERE id = 1")
        .run(slot.name)
      this.record(active ? "staged" : "baseline", slot.name, session, note)
    })
  }

  confirm(name: "A" | "B") {
    this.transaction(() => {
      if (this.state().pending !== name) throw new Error("Candidate is no longer pending")
      this.db.prepare("UPDATE control SET previous = active, active = pending, pending = NULL WHERE id = 1").run()
      this.record("confirmed", name)
    })
  }

  rollback() {
    this.transaction(() => {
      const state = this.state()

      if (state.pending) {
        this.db.prepare("UPDATE control SET pending = NULL WHERE id = 1").run()
        this.record("rejected", state.pending)

        return
      }

      if (!state.previous) throw new Error("No previous version is available")
      this.db.prepare("UPDATE control SET active = previous, previous = active WHERE id = 1").run()
      this.record("rolled-back", state.previous)
    })
  }

  begin(id: string, slot: "A" | "B") {
    this.db.prepare("INSERT INTO run (id, slot, status) VALUES (?, ?, 'booting')").run(id, slot)
  }

  run(id: string) {
    // SAFETY: begin and report own all run writes and preserve LaunchRun fields; an unknown ID returns undefined.
    return this.db.prepare("SELECT * FROM run WHERE id = ?").get(id) as LaunchRun | undefined
  }

  report(id: string, status: LaunchRun["status"]) {
    // A renderer crash must not later become a clean exit or a successful startup.
    this.db
      .prepare(
        "UPDATE run SET status = ?, ready_at = CASE WHEN ? = 'ready' THEN COALESCE(ready_at, ?) ELSE ready_at END WHERE id = ? AND status NOT IN ('fault', 'clean')",
      )
      .run(status, status, Date.now(), id)
  }

  record(phase: string, slot?: "A" | "B", session?: string, note?: string) {
    this.db
      .prepare("INSERT INTO handoff (time, phase, slot, session_id, note) VALUES (?, ?, ?, ?, ?)")
      .run(Date.now(), phase, slot ?? null, session ?? null, note ?? null)
  }

  close() {
    this.db.close()
  }

  transaction<T>(fn: () => T): T {
    this.db.exec("BEGIN IMMEDIATE")

    try {
      const result = fn()
      this.db.exec("COMMIT")

      return result
    } catch (error) {
      this.db.exec("ROLLBACK")
      throw error
    }
  }
}
