import { cp, lstat, mkdir, readdir, rename, rm } from "node:fs/promises"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import { Schema } from "effect"
import { hash } from "./renicode-launcher-runtime"
import { renicodeEnvironment } from "../src/main/lifecycle/renicode-profile"

/** Copy only a stopped profile. The source is never changed and failed copies remain unpublished. */
export async function prepareGeneration(source: string, destination: string) {
  const from = path.resolve(source)
  const to = path.resolve(destination)
  const relative = path.relative(from, to)

  if (!relative || (!relative.startsWith("..") && !path.isAbsolute(relative)))
    throw new Error("Generation destination must be outside the source profile")

  if (await lstat(to).then(() => true, (error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return false

    throw error
  }))
    throw new Error("Generation already exists; refusing to overwrite")
  // A live or unreadable registration is not evidence of a stopped server.
  await assertProfileStopped(from)
  const state = path.join(renicodeEnvironment(from).XDG_STATE_HOME, "opencode")

  const registrations = await readdir(state).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return []

    throw error
  })

  const files = await inventory(from)

  if (!files.includes("drafts.sqlite")) throw new Error("Source desktop database is missing")

  for (const name of files.filter((name) => /\.(sqlite|db)$/.test(name))) validateDatabase(path.join(from, name))

  const before = Object.fromEntries(await Promise.all(files.map(async (name) => [name, await hash(path.join(from, name))])))
  const temp = to + ".preparing"
  // mkdir, rather than a recursive copy, rejects an existing or interrupted destination.
  await mkdir(temp)
  await Promise.all((await readdir(from)).map((name) => cp(path.join(from, name), path.join(temp, name), { recursive: true, errorOnExist: true, force: false })))

  for (const name of files) {
    if ((await hash(path.join(temp, name))) !== before[name] || (await hash(path.join(from, name))) !== before[name])
      throw new Error("Profile changed during generation copy; nothing was published")
  }

  for (const name of files.filter((name) => /\.(sqlite|db)$/.test(name))) validateDatabase(path.join(temp, name))

  // A copied lease would let Service.ensure replace the old process after it restarts.
  for (const name of registrations.filter((name) => /^service.*\.json$/.test(name)))
    await rm(path.join(renicodeEnvironment(temp).XDG_STATE_HOME, "opencode", name))
  const config = path.join(renicodeEnvironment(temp).OPENCODE_CONFIG_DIR, "service.json")

  if (await Bun.file(config).exists()) {
    const value = Schema.decodeUnknownSync(Schema.Record(Schema.String, Schema.Json))(await Bun.file(config).json())

    if (value.remote) throw new Error("Remote service binding requires a separate migration decision")

    if (value.env) Object.assign(value, {
      env: Object.fromEntries(Object.entries(Schema.decodeUnknownSync(Schema.Record(Schema.String, Schema.String))(value.env)).filter(([key]) => !/^(XDG_|OPENCODE_DB$|OPENCODE_CONFIG|RENICODE_)/.test(key))),
    })

    await Bun.write(config, JSON.stringify(value, null, 2))
  }

  await assertProfileStopped(from)
  await Bun.write(path.join(temp, "renicode-generation.json"), JSON.stringify({ source: from, created: Date.now(), files: before }, null, 2))
  await rename(temp, to)

  return { directory: to, files: files.length }
}

export async function assertProfileStopped(directory: string) {
  const state = path.join(renicodeEnvironment(directory).XDG_STATE_HOME, "opencode")

  const registrations = await readdir(state).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return []

    throw error
  })

  for (const name of registrations.filter((name) => /^service.*\.json$/.test(name))) {
    const value = Schema.decodeUnknownSync(Schema.Struct({ pid: Schema.Int }))(await Bun.file(path.join(state, name)).json())

    try {
      process.kill(value.pid, 0)
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ESRCH") continue

      throw error
    }

    throw new Error("Source backend is still running; normal shutdown is required")
  }
}

async function inventory(root: string, directory = ""): Promise<string[]> {
  return (await Promise.all((await readdir(path.join(root, directory))).map(async (name) => {
    const relative = path.join(directory, name)
    const stat = await lstat(path.join(root, relative))

    if (stat.isSymbolicLink()) throw new Error("Profile contains a link; explicit migration review is required")

    if (stat.isDirectory()) return inventory(root, relative)

    if (!stat.isFile()) throw new Error("Profile contains a non-regular file")

    return [relative]
  }))).flat()
}

function validateDatabase(filename: string) {
  const db = new DatabaseSync(filename, { readOnly: true })

  try {
    if (db.prepare("PRAGMA integrity_check").get()?.integrity_check !== "ok" || db.prepare("PRAGMA foreign_key_check").all().length)
      throw new Error("Profile database integrity check failed")

    if (db.prepare("SELECT name FROM sqlite_master WHERE name = 'session_v2'").get() &&
      db.prepare("SELECT 1 FROM session_v2 WHERE time_suspended IS NOT NULL LIMIT 1").get())
      throw new Error("Profile has an execution recovery claim; resolve it before migration")
  } finally { db.close() }
}
