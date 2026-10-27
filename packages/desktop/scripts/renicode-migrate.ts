import { access, mkdir, readFile } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"
import { OpenCode, type CredentialCreateInput } from "@opencode/client"
import { Service } from "@opencode/client/service"
import { CredentialLegacy } from "@opencode/schema/credential-legacy"
import { Schema } from "effect"
import { renicodeEnvironment } from "../src/main/lifecycle/renicode-profile"
import { copyRenicodeSettings } from "./renicode-settings"

const home = homedir()

const roaming = process.env.APPDATA ?? path.join(home, "AppData", "Roaming")

const destination = path.join(roaming, "ai.renicode.desktop")

const env = renicodeEnvironment(destination)

const sourceConfig =
  process.env.OPENCODE_CONFIG_DIR ?? path.join(process.env.XDG_CONFIG_HOME ?? path.join(home, ".config"), "opencode")

const sourceDesktop = path.join(roaming, "ai.opencode.desktop")

const snapshot = path.join(home, "AppData", "Local", "Temp", "opencode", "renicode-migration", "desktop-backup.sqlite")

const cli = path.resolve(import.meta.dirname, "../resources/opencode-cli.exe")

const source = await Service.discover()

if (!source) throw new Error("Original OpenCode service is unavailable; migration will not start or replace it")

await access(cli)

await access(snapshot)

if (
  await access(destination).then(
    () => true,
    () => false,
  )
)
  throw new Error("Renicode profile already exists; refusing to overwrite it")

const credentials = Schema.decodeUnknownSync(Schema.Array(CredentialLegacy.Entry))(
  await OpenCode.make({ baseUrl: source.url, headers: Service.headers(source) }).credential.list(),
)

await mkdir(destination, { recursive: true })

const settings = await copyRenicodeSettings({ config: sourceConfig, desktop: sourceDesktop, snapshot, destination })

for (const directory of Object.values(env)) await mkdir(directory, { recursive: true })

const version = (await readFile(path.join(path.dirname(cli), "opencode-cli.version"), "utf8")).trim()

// Service.ensure merges the current process environment; remove overrides that could select the original profile.
delete process.env.OPENCODE_DB

delete process.env.OPENCODE_CONFIG

delete process.env.OPENCODE_CONFIG_CONTENT

const target = await Service.ensure({
  file: path.join(env.XDG_STATE_HOME, "opencode", "service.json"),
  version,
  command: [cli, "serve", "--service", "--hostname", "127.0.0.1", "--port", "29123"],
  env,
})

if (target.url === source.url) throw new Error("Migration refused: destination is the original service")

const client = OpenCode.make({ baseUrl: target.url, headers: Service.headers(target) })

for (const credential of credentials) {
  await client.credential.create({
    id: credential.id,
    integrationID: credential.integrationID,
    label: credential.label,
    // SAFETY: The authenticated source API supplies JSON metadata; the legacy decoder only renames configuration.
    value: credential.value as CredentialCreateInput["value"],
    activate: credential.active,
  })
}

const copied = await client.credential.list()

if (copied.length !== credentials.length) throw new Error("Credential migration verification failed")

const sessions = await client.session.list({ limit: 1 })

const archived = await client.session.list({ limit: 1, archived: true })

if (sessions.data.length || archived.data.length) throw new Error("Renicode profile unexpectedly contains sessions")

console.log(JSON.stringify({ destination, ...settings, credentials: copied.length, chats: sessions.data.length }))
