import { app, BrowserWindow } from "electron"
import { RENICODE } from "../constants"
import { RenicodeLauncherStore } from "./renicode-launcher-store"

let store: RenicodeLauncherStore | undefined
let run: string | undefined

export function installLauncherReporting() {
  if (!RENICODE || !process.env.RENICODE_LAUNCHER_DB || !process.env.RENICODE_LAUNCHER_RUN) return
  store = new RenicodeLauncherStore(process.env.RENICODE_LAUNCHER_DB)
  run = process.env.RENICODE_LAUNCHER_RUN
  app.on("render-process-gone", () => {
    if (run) store?.report(run, "fault")
  })
  app.on("browser-window-created", (_event, win) => {
    win.on("session-end", () => {
      if (run) store?.report(run, "clean")
    })
  })
  app.once("will-quit", () => {
    if (run) store?.report(run, "clean")
    store?.close()
    store = undefined
  })
}

/** Called only after IPC installation and a successful authenticated backend health request. */
export function reportLauncherReady() {
  if (!store || !run) return
  const ready = () => {
    if (run) store?.report(run, "ready")
  }
  const win = BrowserWindow.getAllWindows()[0]
  if (!win || win.isDestroyed()) return
  if (!win.webContents.isLoading() && win.webContents.getURL()) return ready()
  win.webContents.once("did-finish-load", ready)
}
