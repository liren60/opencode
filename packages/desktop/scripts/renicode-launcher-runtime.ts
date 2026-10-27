import { CryptoHasher, file, spawn } from "bun"
import { randomUUID } from "node:crypto"
import path from "node:path"
import { RenicodeLauncherStore, type Slot } from "../src/main/lifecycle/renicode-launcher-store"
import { renicodeEnvironment } from "../src/main/lifecycle/renicode-profile"

export async function hash(filename: string) {
  return new CryptoHasher("sha256").update(await file(filename).bytes()).digest("hex")
}

export async function verifySlot(slot: Slot) {
  const files = JSON.parse(slot.files) as Record<string, string>
  await Promise.all(
    Object.entries(files).map(async ([relative, digest]) => {
      const filename = path.join(slot.directory, relative)
      if (!(await file(filename).exists()))
        throw new Error(`Package file is missing: ${relative}. Check antivirus protection history before rebuilding.`)
      if ((await hash(filename)) !== digest) throw new Error(`Package integrity check failed: ${relative}`)
    }),
  )
}

export function startSlot(store: RenicodeLauncherStore, slot: Slot, database: string) {
  const id = randomUUID()
  store.begin(id, slot.name)
  store.record("starting", slot.name)
  try {
    const child = spawn([path.join(slot.directory, "Renicode.exe")], {
      cwd: slot.directory,
      env: {
        ...process.env,
        RENICODE_LAUNCHER_DB: database,
        RENICODE_LAUNCHER_RUN: slot.reporting ? id : undefined,
      },
      stdout: "ignore",
      stderr: "ignore",
      windowsHide: true,
    })
    store.db.prepare("UPDATE run SET pid = ? WHERE id = ?").run(child.pid, id)
    return { status: "started" as const, id, child }
  } catch (error) {
    store.report(id, "fault")
    store.record("failed", slot.name, undefined, String(error))
    return { status: "failed" as const, id }
  }
}

/** The bootstrap desktop predates launcher reporting; process survival alone does not prove backend health. */
export async function baselineReady(slot: Slot, userData: string) {
  const { Service } = await import("@opencode/client/service")
  const env = renicodeEnvironment(userData)
  const endpoint = await Service.discover({
    file: path.join(env.XDG_STATE_HOME, "opencode", "service.json"),
    version: slot.version,
  })
  return endpoint?.auth?.type === "basic"
}
