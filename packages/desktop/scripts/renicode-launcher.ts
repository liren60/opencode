import { file, sleep, spawn } from "bun"
import { randomUUID } from "node:crypto"
import { cp, mkdir } from "node:fs/promises"
import path from "node:path"
import { parseArgs } from "node:util"
import { RenicodeLauncherStore } from "../src/main/lifecycle/renicode-launcher-store"
import { baselineReady, hash, spawnDesktop, startSlot, verifySlot } from "./renicode-launcher-runtime"

const args = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    root: { type: "string" },
    source: { type: "string" },
    "storage-hash": { type: "string" },
    session: { type: "string" },
    note: { type: "string" },
  },
})
const root = path.resolve(args.values.root ?? path.join(process.env.LOCALAPPDATA!, "RenicodePortable"))
await mkdir(root, { recursive: true })
const store = new RenicodeLauncherStore(path.join(root, "launcher.sqlite"))
const command = args.positionals[0] ?? "launch"

async function stage(baseline: boolean) {
  if (!args.values.source) throw new Error("--source is required")
  const source = path.resolve(args.values.source)
  const state = store.state()
  if (baseline && state.active) throw new Error("A baseline already exists")
  if (!baseline && !state.active) throw new Error("Initialize a trusted baseline first")
  if (state.pending) throw new Error("An update is already pending")
  const name = state.active === "A" ? "B" : "A"
  const reporting = !baseline
  // The bootstrap is an explicit attestation of the existing installation's storage contract.
  // Subsequent builds must ship their own fingerprint; never infer compatibility from a version label.
  const storageHash = baseline
    ? args.values["storage-hash"]
    : (await file(path.join(source, "resources", "renicode-storage.sha256")).text()).trim()
  if (!storageHash || !/^[a-f0-9]{64}$/.test(storageHash)) throw new Error("Invalid desktop storage fingerprint")
  const cliHash = await hash(path.join(source, "resources", "opencode-cli.exe"))
  const active = state.active ? store.slot(state.active) : undefined
  if (active && (active.cli_hash !== cliHash || active.storage_hash !== storageHash))
    throw new Error("Update changes storage or backend; a migration-aware update is required")
  const directory = path.join(root, "slots", name, randomUUID())
  await cp(source, directory, { recursive: true, errorOnExist: true, force: false })
  const files = Object.fromEntries(
    await Promise.all(
      [
        "Renicode.exe",
        "resources/app.asar",
        "resources/opencode-cli.exe",
        "resources/opencode-cli.version",
        "icudtl.dat",
        "resources.pak",
        "v8_context_snapshot.bin",
      ].map(async (file) => [file, await hash(path.join(directory, file))]),
    ),
  )
  if (files["resources/opencode-cli.exe"] !== cliHash) throw new Error("Backend changed while staging")
  // Verify the copied package, not just a source directory that could still be being built.
  await Promise.all(
    Object.entries(files).map(async ([file, digest]) => {
      if (digest !== (await hash(path.join(source, file)))) throw new Error(`Package changed while staging: ${file}`)
    }),
  )
  store.install(
    {
      name,
      directory,
      version: (await file(path.join(directory, "resources/opencode-cli.version")).text()).trim(),
      cli_hash: cliHash,
      storage_hash: storageHash,
      files: JSON.stringify(files),
      reporting: Number(reporting),
    },
    args.values.session,
    args.values.note,
  )
  return status()
}

function status() {
  return {
    root,
    ...store.state(),
    slots: store.db.prepare("SELECT name, directory, version, reporting FROM slot ORDER BY name").all(),
    handoff: store.db.prepare("SELECT * FROM handoff ORDER BY id DESC LIMIT 10").all(),
  }
}

function alive(pid: number | null) {
  if (!pid) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

async function existingDesktop() {
  const result = spawn(
    [
      "powershell.exe",
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Get-Process -Name Renicode -ErrorAction SilentlyContinue | ForEach-Object { $_.Id }",
    ],
    { stdout: "pipe", stderr: "ignore", windowsHide: true },
  )
  const text = await new Response(result.stdout).text()
  await result.exited
  return text
    .split(/\s+/)
    .map(Number)
    .filter((pid) => pid > 0)
}

async function stopTree(pid: number) {
  if (!alive(pid)) return
  // Only the desktop process started by this guardian is stopped, never the shared background service.
  await spawn(["taskkill.exe", "/PID", String(pid), "/T", "/F"], {
    stdout: "ignore",
    stderr: "ignore",
    windowsHide: true,
  }).exited
}

async function launch() {
  if (process.platform !== "win32") throw new Error("The portable launcher currently supports Windows only")
  const claimed = store.transaction(() => {
    if (alive(store.state().guardian_pid)) return false
    store.db.prepare("UPDATE control SET guardian_pid = ? WHERE id = 1").run(process.pid)
    return true
  })
  if (!claimed) {
    const last = store.db.prepare("SELECT slot FROM run ORDER BY rowid DESC LIMIT 1").get() as
      | { slot: "A" | "B" }
      | undefined
    const slot = last ? store.slot(last.slot) : undefined
    if (slot) {
      await verifySlot(slot)
      const child = spawnDesktop(slot)
      child.unref()
    }
    return status()
  }
  try {
    // Do not interrupt a session hosted by an installation outside this launcher.
    const existing = await existingDesktop()
    if (existing.length) store.record("waiting-for-existing-desktop")
    while (existing.some(alive)) await sleep(2000)

    let failures = 0
    while (failures < 3) {
      const state = store.state()
      const name = state.pending ?? state.active
      const slot = name ? store.slot(name) : undefined
      if (!slot) throw new Error("No deployable version is available")
      try {
        await verifySlot(slot)
      } catch (error) {
        store.record("integrity-failed", slot.name, undefined, String(error))
        if (!state.pending && !state.previous) throw error
        store.rollback()
        failures++
        continue
      }
      const started = startSlot(store, slot, path.join(root, "launcher.sqlite"))
      if (started.status === "failed") {
        failures++
        const current = store.state()
        if (current.pending || current.previous) store.rollback()
        continue
      }
      const id = started.id
      const child = started.child
      const deadline = Date.now() + 90_000
      let healthy = false
      while (child.exitCode === null && Date.now() < deadline) {
        const run = store.run(id)!
        if (run.status === "fault" || run.status === "clean") break
        if (run.ready_at && Date.now() - run.ready_at >= 15_000) {
          healthy = true
          break
        }
        // The bootstrap version predates reporting. It is never promoted as a new candidate.
        if (
          !slot.reporting &&
          Date.now() >= deadline - 60_000 &&
          (await baselineReady(slot, path.join(process.env.APPDATA!, "ai.renicode.desktop")))
        ) {
          healthy = true
          store.report(id, "ready")
          break
        }
        await sleep(500)
      }
      if (healthy && state.pending) store.confirm(slot.name)
      if (healthy) store.record("healthy", slot.name)
      if (!healthy && store.run(id)?.status !== "clean") await stopTree(child.pid)
      while (healthy && child.exitCode === null) {
        if (store.run(id)?.status === "fault") {
          await stopTree(child.pid)
          break
        }
        await sleep(500)
      }
      const exit = await child.exited
      const clean = store.run(id)?.status === "clean" || (!slot.reporting && exit === 0)
      if (clean) {
        store.report(id, "clean")
        store.record("user-exit", slot.name)
        // A normal close is not a crash. Only an explicitly staged update requests a restart.
        if (store.state().pending && healthy) continue
        return status()
      }
      store.report(id, "fault")
      store.record("failed", slot.name, undefined, `exit=${exit}`)
      failures++
      const current = store.state()
      if (current.pending || current.previous) store.rollback()
    }
    store.record("retry-limit")
    return status()
  } finally {
    store.db.prepare("UPDATE control SET guardian_pid = NULL WHERE id = 1 AND guardian_pid = ?").run(process.pid)
  }
}

try {
  const result =
    command === "launch"
      ? await launch()
      : command === "init"
        ? await stage(true)
        : command === "deploy"
          ? await stage(false)
          : command === "status"
            ? status()
            : command === "rollback"
              ? (() => {
                  if (alive(store.state().guardian_pid))
                    throw new Error("Close the managed desktop before manual rollback")
                  store.rollback()
                  return status()
                })()
              : (() => {
                  throw new Error(`Unknown command: ${command}`)
                })()
  console.log(JSON.stringify(result, null, 2))
} catch (error) {
  store.record("launcher-error", undefined, undefined, String(error))
  console.error(String(error))
  process.exitCode = 1
} finally {
  store.close()
}
