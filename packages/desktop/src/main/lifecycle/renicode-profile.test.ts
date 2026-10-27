import { expect, test } from "bun:test"
import path from "node:path"
import { renicodeEnvironment } from "./renicode-profile"

test("Renicode isolates every global profile root and the config override", () => {
  const userData = path.resolve("renicode-profile")
  const env = renicodeEnvironment(userData)
  expect(env).toEqual({
    XDG_DATA_HOME: path.join(userData, "profile", "data"),
    XDG_CONFIG_HOME: path.join(userData, "profile", "config"),
    XDG_CACHE_HOME: path.join(userData, "profile", "cache"),
    XDG_STATE_HOME: path.join(userData, "profile", "state"),
    OPENCODE_CONFIG_DIR: path.join(userData, "profile", "config", "opencode"),
  })
})
