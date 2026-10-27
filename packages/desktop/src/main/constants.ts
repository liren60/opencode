import { app } from "electron"

type Channel = "local" | "dev" | "beta" | "prod"

const raw = import.meta.env.OPENCODE_CHANNEL

export const RENICODE = import.meta.env.RENICODE === true

export const CHANNEL: Channel = RENICODE
  ? "dev"
  : raw === "local" || raw === "dev" || raw === "beta" || raw === "prod"
    ? raw
    : "dev"

export const VERSION = app.isPackaged ? app.getVersion() : (process.env.OPENCODE_VERSION ?? app.getVersion())

const appNames = {
  local: "OpenCode Dev",
  dev: "OpenCode Dev",
  beta: "OpenCode Beta",
  prod: "OpenCode",
}

const appIDs = {
  local: "ai.opencode.desktop.dev",
  dev: "ai.opencode.desktop.dev",
  beta: "ai.opencode.desktop.beta",
  prod: "ai.opencode.desktop",
}

// Local renderer/server mode keeps the dev application identity.
export const APP_NAME = RENICODE ? "Renicode" : app.isPackaged ? appNames[CHANNEL] : "OpenCode Dev"

export const APP_ID = RENICODE ? "ai.renicode.desktop" : app.isPackaged ? appIDs[CHANNEL] : "ai.opencode.desktop.dev"
