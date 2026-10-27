import path from "node:path"

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
