import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { DatabaseSync } from "node:sqlite"
import { Schema } from "effect"
import { migrateDatabase } from "../src/main/storage/migration"
import { renicodeEnvironment } from "../src/main/lifecycle/renicode-profile"

/** Import settings from a consistent desktop snapshot, without drafts, history, or service registrations. */
export async function copyRenicodeSettings(input: {
  config: string
  desktop: string
  snapshot: string
  destination: string
}) {
  const env = renicodeEnvironment(input.destination)
  await mkdir(env.OPENCODE_CONFIG_DIR, { recursive: true })

  const entries = (await readdir(input.config, { withFileTypes: true })).filter(
    (entry) => !/^service(?:-.*)?\.json$/.test(entry.name) && !["node_modules", ".git"].includes(entry.name),
  )

  for (const entry of entries) {
    await cp(path.join(input.config, entry.name), path.join(env.OPENCODE_CONFIG_DIR, entry.name), {
      recursive: true,
      errorOnExist: true,
      force: false,
    })
  }

  const settings = Schema.decodeUnknownSync(Schema.fromJsonString(Schema.Record(Schema.String, Schema.Json)))(
    await readFile(path.join(input.desktop, "opencode.settings"), "utf8"),
  )
  // Only preferences migrate; window IDs and service/update caches belong to the old installation.

  const selected = Object.fromEntries(
    Object.entries(settings).filter(([key]) =>
      ["firstLaunchOnboardingComplete", "backgroundColor", "pinchZoomEnabled"].includes(key),
    ),
  )

  await writeFile(path.join(input.destination, "opencode.settings"), JSON.stringify(selected), { flag: "wx" })

  const source = new DatabaseSync(input.snapshot, { readOnly: true })
  const target = new DatabaseSync(path.join(input.destination, "drafts.sqlite"))

  try {
    migrateDatabase(target)

    const rows = Schema.decodeUnknownSync(
      Schema.Array(
        Schema.Struct({ name: Schema.String, key: Schema.String, value: Schema.String, updated_at: Schema.Number }),
      ),
    )(
      source
        .prepare(
          `
      SELECT name, key, value, updated_at FROM state
      WHERE (name = 'default.dat' AND key = 'settings.v3')
         OR (name = 'opencode.global.dat' AND key IN ('language', 'theme', 'model', 'extension.file.tree'))
         OR (name LIKE 'opencode.workspace.%' AND key = 'workspace:model-selection')
    `,
        )
        .all(),
    )

    const insert = target.prepare("INSERT INTO state (name, key, value, updated_at) VALUES (?, ?, ?, ?)")

    target.exec("BEGIN")

    for (const row of rows) insert.run(row.name, row.key, row.value, row.updated_at)

    target.exec("COMMIT")

    return { configEntries: entries.length, preferences: rows.length }
  } finally {
    source.close()
    target.close()
  }
}
