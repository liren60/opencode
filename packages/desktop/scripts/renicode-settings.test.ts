import { expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import { migrateDatabase } from "../src/main/storage/migration"
import { copyRenicodeSettings } from "./renicode-settings"

test("settings migration copies preferences but not prompts, server selections, or update handoffs", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "renicode-settings-"))
  const config = path.join(root, "config")
  const desktop = path.join(root, "desktop")
  const destination = path.join(root, "renicode")
  await Promise.all([config, desktop, destination].map((directory) => mkdir(directory)))
  const snapshot = path.join(desktop, "drafts.sqlite")
  const source = new DatabaseSync(snapshot)

  try {
    try {
      migrateDatabase(source)
      source.prepare("INSERT INTO document (key, value) VALUES (?, ?)").run("prompt-history", "private conversation")
      const insert = source.prepare("INSERT INTO state (name, key, value, updated_at) VALUES (?, ?, ?, 1)")

      for (const row of [
        ["default.dat", "settings.v3", '{"theme":"dark"}'],
        ["opencode.global.dat", "model", '{"id":"test/model"}'],
        ["opencode.global.dat", "server", '{"url":"http://localhost:4096"}'],
        ["extension.updater", "ready", '"old-installer"'],
        ["opencode.workspace.test.dat", "session:test:comments", '"private comment"'],
      ])
        insert.run(...row)
    } finally {
      source.close()
    }

    await writeFile(path.join(config, "opencode.jsonc"), '{"model":"test/model"}')
    await writeFile(path.join(config, "service.json"), '{"port":4096}')
    await writeFile(path.join(desktop, "opencode.settings"), '{"backgroundColor":"#123456","windowIds":["old"]}')
    const result = await copyRenicodeSettings({ config, desktop, snapshot, destination })
    expect(result.preferences).toBe(2)
    expect(JSON.parse(await readFile(path.join(destination, "opencode.settings"), "utf8"))).toEqual({
      backgroundColor: "#123456",
    })
    expect(await Bun.file(path.join(destination, "profile/config/opencode/opencode.jsonc")).text()).toBe(
      '{"model":"test/model"}',
    )
    expect(await Bun.file(path.join(destination, "profile/config/opencode/service.json")).exists()).toBe(false)
    const target = new DatabaseSync(path.join(destination, "drafts.sqlite"), { readOnly: true })

    try {
      expect(target.prepare("SELECT key FROM state ORDER BY key").all()).toEqual([
        { key: "model" },
        { key: "settings.v3" },
      ])
      expect(target.prepare("SELECT count(*) AS count FROM document").get()).toEqual({ count: 0 })
    } finally {
      target.close()
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
