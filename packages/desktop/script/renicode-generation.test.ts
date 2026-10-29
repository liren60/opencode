import { expect, test } from "bun:test"
import { mkdir, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import { prepareGeneration } from "./renicode-generation"
import { renicodeEnvironment } from "../src/main/lifecycle/renicode-profile"

// The copy boundary owns cold-profile safety: live lease, recovery claim and existing target must not publish.
test.each(["stopped", "live", "claimed", "existing", "corrupt"] as const)("generation copy with %s profile retains source data", async (state) => {
  const root = await mkdtemp(path.join(tmpdir(), "renicode-generation-"))
  const source = path.join(root, "old")
  const destination = path.join(root, "new")
  await mkdir(source)
  const env = renicodeEnvironment(source)
  await mkdir(path.join(env.XDG_STATE_HOME, "opencode"), { recursive: true })
  await mkdir(env.OPENCODE_CONFIG_DIR, { recursive: true })
  const db = new DatabaseSync(path.join(source, "drafts.sqlite"))
  db.exec("CREATE TABLE document (key TEXT PRIMARY KEY, value TEXT); INSERT INTO document VALUES ('draft', 'synthetic citation snapshot'); CREATE TABLE session_v2 (time_suspended INTEGER)")

  if (state === "claimed") db.exec("INSERT INTO session_v2 VALUES (1)")

  db.close()
  const bytes = await Bun.file(path.join(source, "drafts.sqlite")).bytes()
  const registration = path.join(env.XDG_STATE_HOME, "opencode", "service.json")

  if (state === "live") await Bun.write(registration, JSON.stringify({ pid: process.pid }))

  if (state === "existing") await mkdir(destination)

  if (state === "corrupt") await Bun.write(path.join(source, "other.db"), "not sqlite")

  const config = { password: "synthetic", env: { OPENCODE_DB: "original.db", XDG_DATA_HOME: "original", KEEP_PROVIDER_OPTION: "synthetic" } }
  await Bun.write(path.join(env.OPENCODE_CONFIG_DIR, "service.json"), JSON.stringify(config))

  try {
    if (state !== "stopped") {
      await expect(prepareGeneration(source, destination)).rejects.toThrow()
      expect(await Bun.file(path.join(destination, "renicode-generation.json")).exists()).toBe(false)

      return
    }

    expect(await prepareGeneration(source, destination)).toMatchObject({ directory: destination })
    const copied = new DatabaseSync(path.join(destination, "drafts.sqlite"), { readOnly: true })
    expect(copied.prepare("SELECT * FROM document").all()).toEqual([{ key: "draft", value: "synthetic citation snapshot" }])
    copied.close()
    expect(await Bun.file(path.join(renicodeEnvironment(destination).XDG_STATE_HOME, "opencode", "service.json")).exists()).toBe(false)
    expect(await Bun.file(path.join(renicodeEnvironment(destination).OPENCODE_CONFIG_DIR, "service.json")).json()).toEqual({ password: "synthetic", env: { KEEP_PROVIDER_OPTION: "synthetic" } })
  } finally {
    expect(await Bun.file(path.join(source, "drafts.sqlite")).bytes()).toEqual(bytes)
    expect(await Bun.file(path.join(env.OPENCODE_CONFIG_DIR, "service.json")).json()).toEqual(config)
    await rm(root, { recursive: true, force: true })
  }
})
