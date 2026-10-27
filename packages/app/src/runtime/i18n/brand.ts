import { APP_NAME, RENICODE } from "@opencode/ui/renicode"

/** Rebrand application copy, not provider names, server versions, URLs, or upstream legal notices. */
export function brandDictionary<Value extends Record<string, string>>(dictionary: Value): Value {
  if (!RENICODE) return dictionary

  // SAFETY: entries keep every original key and map string values to strings without changing the dictionary shape.
  return Object.fromEntries(
    Object.entries(dictionary).map(([key, value]) => [
      key,
      key === "app.name" ||
      key.startsWith("desktop.") ||
      key.startsWith("project.settings.") ||
      key.startsWith("settings.general.") ||
      key.startsWith("settings.workspaces.") ||
      key === "settings.about.notices.description" ||
      key === "provider.connect.chatgptWelcome.description" ||
      key === "provider.connect.apiKey.description" ||
      key === "error.chain.mcpFailed"
        ? value.replaceAll("OpenCode", APP_NAME)
        : value,
    ]),
  ) as Value
}
