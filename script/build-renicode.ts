import { $ } from "bun"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const env = {
  ...process.env,
  RENICODE_BUILD: "1",
  OPENCODE_CHANNEL: "dev",
  OPENCODE_VERSION: "2.2.0-renicode.1",
  OPENCODE_CLI_DIST: path.join(root, "packages", "cli", "dist-renicode"),
}

const electron = process.argv.find((arg) => arg.startsWith("--electron-dist="))?.slice("--electron-dist=".length)

if (electron) {
  for (const name of [
    "electron.exe",
    "icudtl.dat",
    "resources.pak",
    "chrome_100_percent.pak",
    "chrome_200_percent.pak",
    "v8_context_snapshot.bin",
    "snapshot_blob.bin",
    "locales/en-US.pak",
    "version",
  ])
    if (!(await Bun.file(path.join(electron, name)).exists()))
      throw new Error(`Incomplete Electron distribution: ${name}`)
  const expected = await Bun.file(path.join(root, "packages/desktop/node_modules/electron/package.json")).json()

  if ((await Bun.file(path.join(electron, "version")).text()).trim() !== expected.version)
    throw new Error("Electron distribution version differs from the pinned dependency")
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
    const portable = process.argv.includes("--portable")
      ? ["--dir", ...(electron ? [`-c.electronDist=${electron}`, "-c.win.signAndEditExecutable=false"] : [])]
      : []
    await $`bunx electron-builder --config electron-builder.config.ts --win --x64 --publish never ${portable}`
      .cwd(path.join(root, "packages", "desktop"))
      .env(env)
  }
} finally {
  for (const [file, bytes] of restored) await Bun.write(path.join(root, file), bytes)
}
console.log(
  process.argv.includes("--build-only")
    ? "Renicode desktop build complete"
    : `Renicode ${process.argv.includes("--portable") ? "portable package" : "installer"}: ${path.join(root, "packages", "desktop", "dist-renicode")}`,
)
