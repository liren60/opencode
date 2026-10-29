import { afterAll, beforeAll, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { baselineReady, hash, spawnDesktop, startSlot, verifySlot } from "./renicode-launcher-runtime"
import { RenicodeLauncherStore, type Slot } from "../src/main/lifecycle/renicode-launcher-store"
import { renicodeEnvironment } from "../src/main/lifecycle/renicode-profile"

const baseline: Slot = {
  name: "A",
  directory: "stable",
  version: "1",
  cli_hash: "backend",
  storage_hash: "storage",
  files: "{}",
  reporting: 0,
}

const windowRoot = process.platform === "win32" ? await mkdtemp(path.join(tmpdir(), "renicode-window-")) : undefined

beforeAll(async () => {
  if (!windowRoot) return
  const compiler = Bun.spawn(
    [
      "powershell.exe",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Add-Type -TypeDefinition (Get-Content -Raw -LiteralPath $env:RENICODE_WINDOW_SOURCE) -OutputAssembly $env:RENICODE_WINDOW_EXE -OutputType WindowsApplication",
    ],
    {
      env: {
        ...process.env,
        RENICODE_WINDOW_SOURCE: path.join(import.meta.dirname, "fixtures/launcher-window.cs"),
        RENICODE_WINDOW_EXE: path.join(windowRoot, "Renicode.exe"),
      },
      stdout: "pipe",
      stderr: "pipe",
      windowsHide: true,
    },
  )
  const [stdout, stderr, code] = await Promise.all([
    new Response(compiler.stdout).text(),
    new Response(compiler.stderr).text(),
    compiler.exited,
  ])
  expect(code, `${stdout}\n${stderr}`).toBe(0)
})

afterAll(async () => {
  if (windowRoot) await rm(windowRoot, { recursive: true, force: true })
})

// ShowWindow's STARTUPINFO override is a Windows-only contract. A real native GUI
// catches windowsHide suppressing Electron's first window; package checks cannot.
test.skipIf(process.platform !== "win32").each([
  { name: "baseline", reporting: 0, managed: true },
  { name: "candidate", reporting: 1, managed: true },
  { name: "second instance", reporting: 1, managed: false },
])("$name desktop launch permits the first native window to be visible", async (row) => {
  const store = new RenicodeLauncherStore(":memory:")
  try {
    const slot = { ...baseline, directory: windowRoot!, reporting: row.reporting }
    const result = row.managed ? startSlot(store, slot, path.join(windowRoot!, "launcher.sqlite")) : undefined
    if (result) expect(result.status).toBe("started")
    const child = result?.status === "started" ? result.child : spawnDesktop(slot)
    expect(await child.exited).toBe(0)
    expect(await Bun.file(path.join(windowRoot!, "visible.txt")).text()).toBe("visible")
  } finally {
    store.close()
  }
})

test.each(["intact", "missing", "changed"] as const)("%s package is checked before launch", async (state) => {
  const root = await mkdtemp(path.join(tmpdir(), "renicode-integrity-"))
  try {
    const filename = path.join(root, "Renicode.exe")
    await Bun.write(filename, "reviewed package bytes")
    const slot = { ...baseline, directory: root, files: JSON.stringify({ "Renicode.exe": await hash(filename) }) }
    if (state === "missing") await rm(filename)
    if (state === "changed") await Bun.write(filename, "different package bytes")
    if (state === "intact") {
      await expect(verifySlot(slot)).resolves.toBeUndefined()
      return
    }
    await expect(verifySlot(slot)).rejects.toThrow(state === "missing" ? "Package file is missing" : "integrity check")
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("spawn failure records a terminal fault instead of leaving the run booting", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "renicode-spawn-"))
  const store = new RenicodeLauncherStore(":memory:")
  try {
    store.install(baseline)
    const result = startSlot(store, { ...baseline, directory: root }, path.join(root, "launcher.sqlite"))
    expect(result.status).toBe("failed")
    expect(store.run(result.id)).toMatchObject({ status: "fault", pid: null, ready_at: null })
    expect(store.db.prepare("SELECT phase, slot FROM handoff ORDER BY id DESC LIMIT 1").get()).toEqual({
      phase: "failed",
      slot: "A",
    })
  } finally {
    store.close()
    await rm(root, { recursive: true, force: true })
  }
})

test.each([
  { name: "ready authenticated backend", status: 200, version: "1", pid: process.pid, ready: true },
  { name: "starting backend", status: 503, version: "1", pid: process.pid, ready: false },
  { name: "failed backend", status: 500, version: "1", pid: process.pid, ready: false },
  { name: "wrong backend version", status: 200, version: "other", pid: process.pid, ready: false },
  { name: "stale process registration", status: 200, version: "1", pid: process.pid + 1, ready: false },
  { name: "unauthenticated backend", status: 200, version: "1", pid: process.pid, authenticated: false, ready: false },
])("bootstrap readiness requires $name", async (row) => {
  const root = await mkdtemp(path.join(tmpdir(), "renicode-readiness-"))
  const requests: Array<{ path: string; authorization: string | null }> = []
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      requests.push({ path: new URL(request.url).pathname, authorization: request.headers.get("authorization") })
      return Response.json({ version: row.version, pid: row.pid }, { status: row.status })
    },
  })
  try {
    const registration = path.join(renicodeEnvironment(root).XDG_STATE_HOME, "opencode", "service.json")
    await mkdir(path.dirname(registration), { recursive: true })
    await Bun.write(
      registration,
      JSON.stringify({
        version: "1",
        pid: process.pid,
        url: server.url.href,
        password: row.authenticated === false ? undefined : "test",
      }),
    )
    expect(await baselineReady(baseline, root)).toBe(row.ready)
    expect(requests).toEqual([
      {
        path: "/api/info",
        authorization: row.authenticated === false ? null : `Basic ${Buffer.from("opencode:test").toString("base64")}`,
      },
    ])
  } finally {
    await server.stop(true)
    await rm(root, { recursive: true, force: true })
  }
})

test("a bootstrap without its isolated service registration is not healthy", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "renicode-no-service-"))
  try {
    expect(await baselineReady(baseline, root)).toBe(false)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
