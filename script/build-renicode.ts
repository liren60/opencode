import { $ } from "bun"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const env = {
  ...process.env,
  RENICODE_BUILD: "1",
  OPENCODE_CHANNEL: "dev",
  OPENCODE_VERSION: "2.1.4-renicode.2",
  OPENCODE_CLI_DIST: path.join(root, "packages", "cli", "dist-renicode"),
}

if (!process.argv.includes("--desktop-only"))
  await $`bun packages/cli/script/build.ts --single --baseline --skip-install --skip-web-ui --outdir=dist-renicode`
    .cwd(root)
    .env(env)

// Git checks links out as path text on Windows without Developer Mode. Materialize build inputs only for the build.
const restored = new Map<string, Uint8Array>()
try {
  if (process.platform === "win32") {
    const links = (
      await $`git ls-files --stage packages/app/public packages/app/src/custom-elements.d.ts`.cwd(root).text()
    )
      .split("\n")
      .filter((line) => line.startsWith("120000 "))
    for (const link of links) {
      const file = link.split("\t")[1]!
      const target = await $`git show ${`HEAD:${file}`}`.cwd(root).text()
      const current = await Bun.file(path.join(root, file)).bytes()
      if (Buffer.from(current).toString("utf8").trim() !== target.trim()) continue
      restored.set(file, current)
      await Bun.write(path.join(root, file), Bun.file(path.resolve(root, path.dirname(file), target.trim())))
    }
  }
  if (process.argv.includes("--check")) await $`bun --bun run check`.cwd(root).env(env)

  await $`bun run build`.cwd(path.join(root, "packages", "desktop")).env(env)
  if (!process.argv.includes("--build-only")) {
    const electron = process.argv.find((arg) => arg.startsWith("--electron-dist="))?.slice("--electron-dist=".length)
    const portable = process.argv.includes("--portable")
      ? ["--dir", ...(electron ? [`-c.electronDist=${electron}`, "-c.win.signAndEditExecutable=false"] : [])]
      : []
    await $`bun run package:win --x64 --publish never ${portable}`.cwd(path.join(root, "packages", "desktop")).env(env)
  }
} finally {
  for (const [file, bytes] of restored) await Bun.write(path.join(root, file), bytes)
}
console.log(
  process.argv.includes("--build-only")
    ? "Renicode desktop build complete"
    : `Renicode ${process.argv.includes("--portable") ? "portable package" : "installer"}: ${path.join(root, "packages", "desktop", "dist-renicode")}`,
)
