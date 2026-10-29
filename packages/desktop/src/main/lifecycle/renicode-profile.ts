import path from "node:path"
import { createHash } from "node:crypto"

/** Keep the fork's config, credentials, sessions, and service election off OpenCode's profile. */
export function renicodeEnvironment(userData: string) {
  const root = path.join(userData, "profile")

  return {
    XDG_DATA_HOME: path.join(root, "data"),
    XDG_CONFIG_HOME: path.join(root, "config"),
    XDG_CACHE_HOME: path.join(root, "cache"),
    XDG_STATE_HOME: path.join(root, "state"),
    OPENCODE_CONFIG_DIR: path.join(root, "config", "opencode"),
  }
}

/** A generation keeps one stable bind port, including across competing desktop starts. */
export function renicodeServicePort(directory: string) {
  return 30_000 + (Number.parseInt(createHash("sha256").update(path.resolve(directory).toLowerCase()).digest("hex").slice(0, 8), 16) % 9_000)
}
