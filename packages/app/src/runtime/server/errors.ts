import { Option, Predicate, Schema } from "effect"

export type ConfigInvalidError = {
  name: "ConfigInvalidError"
  data: {
    path?: string
    message?: string
    issues?: Array<{ message: string; path: string[] }>
  }
}

export type ProviderModelNotFoundError = {
  name: "ProviderModelNotFoundError"
  data: {
    providerID: string
    modelID: string
    suggestions?: string[]
  }
}

const decodeConfigInvalidError = Schema.decodeUnknownOption(
  Schema.Struct({
    name: Schema.Literal("ConfigInvalidError"),
    data: Schema.Struct({
      path: Schema.optional(Schema.String),
      message: Schema.optional(Schema.String),
      issues: Schema.optional(
        Schema.mutable(
          Schema.Array(Schema.Struct({ message: Schema.String, path: Schema.mutable(Schema.Array(Schema.String)) })),
        ),
      ),
    }),
  }),
)

const decodeProviderModelNotFoundError = Schema.decodeUnknownOption(
  Schema.Struct({
    name: Schema.Literal("ProviderModelNotFoundError"),
    data: Schema.Struct({
      providerID: Schema.String,
      modelID: Schema.String,
      suggestions: Schema.optional(Schema.mutable(Schema.Array(Schema.String))),
    }),
  }),
)

type Translator = (key: string, vars?: Record<string, string | number>) => string

function tr(translator: Translator | undefined, key: string, text: string, vars?: Record<string, string | number>) {
  if (!translator) return text
  const out = translator(key, vars)

  if (!out || out === key) return text

  return out
}

export function formatServerError(error: unknown, translate?: Translator, fallback?: string) {
  const unwrapped = unwrapNamedError(error)
  const config = decodeConfigInvalidError(unwrapped)

  if (Option.isSome(config)) return parseReadableConfigInvalidError(config.value, translate)
  const model = decodeProviderModelNotFoundError(unwrapped)

  if (Option.isSome(model)) return parseReadableProviderModelNotFoundError(model.value, translate)

  if (
    typeof unwrapped === "object" &&
    unwrapped !== null &&
    "message" in unwrapped &&
    typeof unwrapped.message === "string" &&
    unwrapped.message
  )
    return unwrapped.message

  if (error instanceof Error && error.message) return error.message

  if (typeof error === "string" && error) return error

  if (fallback) return fallback

  return tr(translate, "error.chain.unknown", "Unknown error")
}

function unwrapNamedError(error: unknown): unknown {
  if (!(error instanceof Error) || !error.cause || typeof error.cause !== "object") return error

  if ("body" in error.cause) return error.cause.body

  return error.cause
}

// Client-synthesized session not-found errors share one constructor and
// predicate so the message contract cannot drift between route session
// resolution (session-resolution.ts) and not-found fallback matching (session.tsx).
const sessionNotFoundMessage = (sessionID: string) => `Session not found: ${sessionID}`

export function sessionNotFoundError(sessionID: string) {
  return new Error(sessionNotFoundMessage(sessionID))
}

export function isLocalSessionNotFoundError(error: unknown, sessionID: string) {
  return error instanceof Error && error.message === sessionNotFoundMessage(sessionID)
}

export function isSessionNotFoundError(error: unknown, sessionID: string) {
  const unwrapped = unwrapNamedError(error)

  if (typeof unwrapped !== "object" || unwrapped === null) return false

  return (
    Predicate.isTagged(unwrapped, "SessionNotFoundError") &&
    "sessionID" in unwrapped &&
    unwrapped.sessionID === sessionID
  )
}

export function parseReadableConfigInvalidError(errorInput: ConfigInvalidError, translator?: Translator) {
  const file = errorInput.data.path && errorInput.data.path !== "config" ? errorInput.data.path : "config"
  const detail = errorInput.data.message?.trim() ?? ""

  const issues = (errorInput.data.issues ?? [])
    .map((issue) => {
      const msg = issue.message.trim()

      if (!issue.path.length) return msg

      return `${issue.path.join(".")}: ${msg}`
    })
    .filter(Boolean)

  const msg = issues.length ? issues.join("\n") : detail

  if (!msg) return tr(translator, "error.chain.configInvalid", `Config file at ${file} is invalid`, { path: file })

  return tr(translator, "error.chain.configInvalidWithMessage", `Config file at ${file} is invalid: ${msg}`, {
    path: file,
    message: msg,
  })
}

function parseReadableProviderModelNotFoundError(errorInput: ProviderModelNotFoundError, translator?: Translator) {
  const p = errorInput.data.providerID.trim()
  const m = errorInput.data.modelID.trim()
  const list = (errorInput.data.suggestions ?? []).map((v) => v.trim()).filter(Boolean)
  const body = tr(translator, "error.chain.modelNotFound", `Model not found: ${p}/${m}`, { provider: p, model: m })
  const tail = tr(translator, "error.chain.checkConfig", "Check your config (opencode.json) provider/model names")

  if (list.length) {
    const suggestions = list.slice(0, 5).join(", ")

    return [body, tr(translator, "error.chain.didYouMean", `Did you mean: ${suggestions}`, { suggestions }), tail].join(
      "\n",
    )
  }

  return [body, tail].join("\n")
}
