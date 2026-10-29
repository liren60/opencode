import { $, CryptoHasher, file, sleep } from "bun"
import { cp, mkdir, readdir } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { DatabaseSync } from "node:sqlite"
import { migrations } from "../packages/desktop/src/main/storage/migration.gen"

// Local, installer-free deployment. The existing installation and its desktop shortcut are untouched.
const repo = path.resolve(import.meta.dirname, "..")
const root = path.join(process.env.LOCALAPPDATA!, "RenicodePortable")
const baseline = path.join(process.env.LOCALAPPDATA!, "Programs", "renicode-desktop")
const launcherScript = path.join(repo, "packages/desktop/script/renicode-launcher.ts")
const launcherOnly = process.argv.includes("--launcher-only")
const generation = process.argv.includes("--generation")
if (generation && launcherOnly) throw new Error("Generation staging is not launcher-only repair")
const storage = new CryptoHasher("sha256")
for (const name of ["migration.gen.ts", "migration.ts", "schema.ts"])
  storage.update(await file(path.join(repo, "packages/desktop/src/main/storage", name)).bytes())
const storageHash = storage.digest("hex")

if (!(await file(path.join(root, "launcher.sqlite")).exists())) {
  if (launcherOnly) throw new Error("No existing A/B deployment to repair")
  // This initial attestation is only for the already-running local fork. Do not stamp downloaded builds.
  const database = new DatabaseSync(path.join(process.env.APPDATA!, "ai.renicode.desktop", "drafts.sqlite"), {
    readOnly: true,
  })
  try {
    const applied = database
      .prepare("SELECT id FROM migration ORDER BY id")
      .all()
      .map((row) => row.id)
    if (JSON.stringify(applied) !== JSON.stringify(migrations.map((migration) => migration.id).sort()))
      throw new Error("Installed desktop migration journal differs from this source tree")
  } finally {
    database.close()
  }
  await $`bun ${launcherScript} init --root ${root} --source ${baseline} --storage-hash ${storageHash}`.cwd(repo)
}

if (!launcherOnly && !process.argv.includes("--skip-build")) {
  const checks = process.argv.includes("--check") ? ["--check"] : []
  const expected = await file(path.join(repo, "packages/desktop/node_modules/electron/package.json")).json()
  const installed = (await file(path.join(baseline, "version")).text()).trim()
  const engine = path.join(root, "engines", randomUUID())
  const offline = installed === expected.version
  if (offline) {
    await mkdir(engine, { recursive: true })
    await Promise.all(
      (await readdir(baseline, { withFileTypes: true }))
        .filter((entry) => entry.name === "locales" || (entry.isFile() && !entry.name.startsWith("Uninstall")))
        .map((entry) =>
          cp(
            path.join(baseline, entry.name),
            path.join(engine, entry.name === "Renicode.exe" ? "electron.exe" : entry.name),
            { recursive: true },
          ),
        ),
    )
  }
  const distribution = offline ? [`--electron-dist=${engine}`] : []
  await $`bun script/build-renicode.ts --desktop-only --portable ${checks} ${distribution}`.cwd(repo)
}

const launcher = path.join(root, "launcher", randomUUID(), "RenicodeLauncher.exe")
await mkdir(path.dirname(launcher), { recursive: true })
await $`bun build --compile --no-compile-autoload-dotenv --no-compile-autoload-bunfig --windows-hide-console --windows-icon=${path.join(repo, "packages/desktop/resources/renicode/icon.ico")} --windows-title=RenicodeLauncher --outfile=${launcher} ${launcherScript}`.cwd(
  repo,
)
if (!(await file(launcher).exists())) throw new Error("Launcher executable is missing; check antivirus protection history")

if (!launcherOnly)
  await $`bun ${launcherScript} ${generation ? "stage-generation" : "deploy"} --root ${root} --source ${path.join(repo, "packages/desktop/dist-renicode/win-unpacked")} --note ${generation ? "Incompatible update: package only; explicit stopped-profile preparation required" : "Local portable update; restore existing sessions and verify startup"}`.cwd(
    repo,
  )

// Bun embeds only the largest ICO frame in the launcher EXE. Keep all native DPI sizes for Explorer.
const icon = path.join(
  root,
  "icons",
  `${new CryptoHasher("sha256").update(await file(path.join(repo, "packages/desktop/resources/renicode/icon.ico")).bytes()).digest("hex")}.ico`,
)
await mkdir(path.dirname(icon), { recursive: true })
await cp(path.join(repo, "packages/desktop/resources/renicode/icon.ico"), icon)

await $`powershell.exe -NoLogo -NoProfile -NonInteractive -Command ${`
  $desktop = [Environment]::GetFolderPath('Desktop')
  $link = Join-Path $desktop 'Renicode A-B.lnk'
  $shell = New-Object -ComObject WScript.Shell
  if (Test-Path -LiteralPath $link) {
    $old = $shell.CreateShortcut($link)
    if (-not $old.TargetPath.StartsWith($env:RENICODE_PORTABLE_ROOT + '\\', [StringComparison]::OrdinalIgnoreCase)) {
      throw 'Desktop shortcut already belongs to another program'
    }
  }
  $shortcut = $shell.CreateShortcut($link)
  $shortcut.TargetPath = $env:RENICODE_PORTABLE_LAUNCHER
  $shortcut.Arguments = 'launch --root "' + $env:RENICODE_PORTABLE_ROOT + '"'
  $shortcut.WorkingDirectory = $env:RENICODE_PORTABLE_ROOT
  $shortcut.IconLocation = $env:RENICODE_PORTABLE_ICON + ',0'
  $shortcut.Save()
  Write-Output $link
`}`
  .env({
    ...process.env,
    RENICODE_PORTABLE_ROOT: root,
    RENICODE_PORTABLE_LAUNCHER: launcher,
    RENICODE_PORTABLE_ICON: icon,
  })
  .cwd(repo)

// Start the independent guardian now. It waits for the installed desktop to close normally.
// Start-Process detaches from the deployment runtime on Windows; unref() alone can exit before Bun starts a child.
if (!launcherOnly && !generation) {
  await $`powershell.exe -NoLogo -NoProfile -NonInteractive -Command ${"Start-Process -FilePath $env:RENICODE_PORTABLE_LAUNCHER -ArgumentList ('launch --root \"' + $env:RENICODE_PORTABLE_ROOT + '\"')"}`
    .env({ ...process.env, RENICODE_PORTABLE_ROOT: root, RENICODE_PORTABLE_LAUNCHER: launcher })
    .cwd(repo)
  const deployed = new DatabaseSync(path.join(root, "launcher.sqlite"))
  try {
    const deadline = Date.now() + 10_000
    while (true) {
      const row = deployed.prepare("SELECT guardian_pid FROM control WHERE id = 1").get()
      if (row?.guardian_pid) {
        process.kill(Number(row.guardian_pid), 0)
        break
      }
      if (Date.now() >= deadline) throw new Error("Independent guardian did not start; use the desktop shortcut")
      await sleep(200)
    }
  } finally {
    deployed.close()
  }
}
console.log(
  launcherOnly
    ? `A/B launcher entry repaired: ${launcher}. Slots and sessions were not changed; no desktop was started.`
    : generation
      ? `Generation package staged at ${root}. No profile was copied and no guardian was started. Prepare explicitly after normal desktop and backend shutdown.`
      : `Portable deployment staged at ${root}. Existing desktop was not stopped.`,
)
