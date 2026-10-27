#!/usr/bin/env bun
import { $ } from "bun"
import path from "node:path"

import { copyBuiltCliToResources, downloadCliToResources, getCurrentCli, resolveChannel } from "./utils"

const channel = resolveChannel()

if (channel === "prod" && !Bun.env.OPENCODE_CLI_DIST) {
  throw new Error("OPENCODE_CLI_DIST is required for production desktop builds")
}

if (Bun.env.RENICODE_BUILD === "1")
  await $`powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/renicode-icons.ps1`

if (Bun.env.RENICODE_BUILD !== "1") await $`bun ./scripts/copy-icons.ts ${channel}`

await $`bun ./scripts/copy-metainfo.ts ${channel}`

if (Bun.env.RENICODE_BUILD === "1") {
  // A portable update is allowed only when both backend and desktop storage remain rollback-compatible.
  const storage = new Bun.CryptoHasher("sha256")
  for (const file of ["migration.gen.ts", "migration.ts", "schema.ts"])
    storage.update(await Bun.file(path.join("src/main/storage", file)).bytes())
  await Bun.write("resources/renicode-storage.sha256", storage.digest("hex"))
  if (!Bun.env.OPENCODE_CLI_DIST) throw new Error("Renicode requires a locally built CLI containing its fixes")

  const cli = getCurrentCli()

  const source = Bun.file(
    path.join(Bun.env.OPENCODE_CLI_DIST, cli.package.replace("@opencode/", ""), "bin", "opencode.exe"),
  )

  const target = Bun.file("resources/opencode-cli.exe")

  // Windows locks a running migration service's binary. An identical local resource needs no replacement.
  const identical =
    (await target.exists()) &&
    new Bun.CryptoHasher("sha256").update(await source.bytes()).digest("hex") ===
      new Bun.CryptoHasher("sha256").update(await target.bytes()).digest("hex")

  if (!identical) await copyBuiltCliToResources(Bun.env.OPENCODE_CLI_DIST)
}

if (channel === "dev" && Bun.env.RENICODE_BUILD !== "1") await downloadCliToResources()

if ((channel === "beta" || channel === "prod") && Bun.env.OPENCODE_CLI_DIST && Bun.env.RENICODE_BUILD !== "1") {
  await copyBuiltCliToResources(Bun.env.OPENCODE_CLI_DIST)
}

if (channel === "beta" && !Bun.env.OPENCODE_CLI_DIST && Bun.env.RENICODE_BUILD !== "1")
  await downloadCliToResources("beta")
