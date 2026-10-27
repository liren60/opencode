interface ImportMetaEnv {
  readonly OPENCODE_CHANNEL: string
  readonly RENICODE: boolean
  readonly OPENCODE_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
