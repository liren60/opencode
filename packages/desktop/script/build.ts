#!/usr/bin/env bun
import { $ } from "bun"
import { exists } from "node:fs/promises"
import path from "node:path"
import { copyBuiltCliToResources, downloadCliToResources, getCurrentCli, resolveChannel } from "./utils"

// Prepares resources/ (icons, metainfo, the bundled CLI) for OPENCODE_CHANNEL and builds the app into out/.
// The CLI comes from ../cli/dist when it holds the target; otherwise dev downloads the published dev CLI,
// beta the beta CLI, and prod fails.
const dir = path.resolve(import.meta.dir, "..")

const cli = path.resolve(dir, process.env.OPENCODE_CLI_DIST ?? "../cli/dist")

const channel = resolveChannel()

process.chdir(dir)

if (Bun.env.RENICODE_BUILD === "1")
  await $`powershell -NoProfile -ExecutionPolicy Bypass -File ./script/renicode-icons.ps1`

if (Bun.env.RENICODE_BUILD !== "1") await $`bun ./script/copy-icons.ts ${channel}`

await $`bun ./script/copy-metainfo.ts ${channel}`

const built = await exists(path.join(cli, getCurrentCli().package.replace("@opencode/", "")))

if (Bun.env.RENICODE_BUILD === "1") {
  // Portable deployment compares this fingerprint before admitting a candidate; building does not authorize migration.
  const storage = new Bun.CryptoHasher("sha256")

  for (const file of ["migration.gen.ts", "migration.ts", "schema.ts"])
    storage.update(await Bun.file(path.join("src/main/storage", file)).bytes())

  await Bun.write("resources/renicode-storage.sha256", storage.digest("hex"))

  if (!Bun.env.OPENCODE_CLI_DIST || !built)
    throw new Error("Renicode requires a locally built CLI containing its fixes")

  const source = Bun.file(path.join(cli, getCurrentCli().package.replace("@opencode/", ""), "bin", "opencode.exe"))
  const target = Bun.file("resources/opencode-cli.exe")

  // Windows locks a running migration service's binary. An identical local resource needs no replacement.
  const identical =
    (await target.exists()) &&
    new Bun.CryptoHasher("sha256").update(await source.bytes()).digest("hex") ===
      new Bun.CryptoHasher("sha256").update(await target.bytes()).digest("hex")

  if (!identical) await copyBuiltCliToResources(cli)
}

if (channel === "prod" && !built)
  throw new Error(`Production desktop builds bundle the CLI from ${cli}; build it first`)

if (built && Bun.env.RENICODE_BUILD !== "1") await copyBuiltCliToResources(cli)

if (!built) await downloadCliToResources(channel === "beta" ? "beta" : undefined)

await $`bunx electron-vite build`
