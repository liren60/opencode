import { createMemo, Show, type Accessor, type Component, type JSX, type ParentComponent } from "solid-js"
import { createStore } from "solid-js/store"
import { render } from "solid-js/web"
import { DialogProvider } from "@opencode/ui/context/dialog"
import { pluralCategory, resolveTemplate } from "@opencode/ui/context/i18n"
import {
  LinkHandler,
  type ComposerNote,
  type Context,
  type IpcClient,
  type Live,
  type MountedSession,
  type SessionScreen,
  type SetupContext,
  type Token,
  type TokenValue,
  type Ui,
} from "@opencode/plugin/gui"
import { liveAccessor, PluginContext } from "@opencode/plugin/gui/host"
import { ProjectCenter } from "./contract"
import type definition from "./index"
import en from "./i18n/en"
import Page from "./page"
import setup from "./renderer"

type Client = IpcClient<typeof ProjectCenter.spec>

/** Migrated reader fixture: IPC and session storage are held at their asynchronous boundaries. */
export function mountProjectCenter(input: {
  ui: Ui
  LanguageProvider: Component<{ locale: string; children: JSX.Element }>
  UiI18nBridge: ParentComponent
  draft: {
    attach(session: string, part: ComposerNote): void
    notes(): { session: string; part: ComposerNote }[]
    request(session: string): { text: string; comments: { comment: string }[] }
    render: Component<{ session: string; openSource(href: string): Promise<void> }>
  }
}) {
  const host = document.createElement("main")
  host.dataset.testid = "project-center-fixture"
  host.style.cssText =
    "position:fixed;inset:0;z-index:1000;background:var(--v2-background-bg-base);padding:16px;display:flex;flex-direction:column"
  document.body.appendChild(host)

  const [state, setState] = createStore({
    loaded: false,
    active: true,
    session: "alpha",
    hold: false,
    reads: 0,
    catalogs: 0,
    generation: 1,
    visit: 0,
    edited: false,
    images: false,
    holdAssets: false,
    locale: "en",
  })

  const [selections, setSelections] = createStore<
    Record<string, { project: string; sourceProject: string; sourceHash?: string; path: string; history: boolean; plans: boolean }>
  >({
    alpha: { project: "", sourceProject: "", path: "", history: false, plans: false },
    beta: { project: "", sourceProject: "", path: "", history: false, plans: false },
  })

  const pending: {
    resolve(value: Awaited<ReturnType<Client["read"]>>): void
    value: Awaited<ReturnType<Client["read"]>>
  }[] = []

  const assets: { project: string; path: string; signal?: AbortSignal }[] = []
  const pendingAssets: { resolve(value: { data: string; mime: string }): void; value: { data: string; mime: string } }[] = []

  const documents = ["alpha", "beta"].map((project) => ({
    project,
    projectName: project,
    path: "docs/README.md",
    title: `${project} guide`,
    kind: "guide",
    status: "",
    current: true,
    sha256: (project === "alpha" ? "a" : "b").repeat(64),
    excerpt: "",
  }))

  const [messages, setMessages] = createStore<Record<string, string>>({ ...en })
  const handlers: LinkHandler[] = []

  const text = (key: string, params?: Record<string, string | number>) =>
    resolveTemplate(messages[key] ?? (key === "common.search" ? "Search" : key), params)

  const client: Client = {
    catalog: async (request) => {
      setState("catalogs", (count) => count + 1)
      const binding = request.directory.includes("beta") ? "beta" : "alpha"

      return {
        registry: "/center/web/wiki-projects.json",
        binding,
        projects: documents.map((doc) => ({
          id: doc.project,
          name: doc.project,
          root: `/repo/${doc.project}`,
          entry: doc.path,
          plans: [],
          description: "",
        })),
        documents: documents.filter((doc) => request.project === "all" || doc.project === (request.project || binding)),
        total: request.project === "all" ? 2 : 1,
        warnings: [],
      }
    },
    read: async (request) => {
      setState("reads", (count) => count + 1)
      const document = documents.find((doc) => doc.project === request.project)

      if (!document) throw new Error("Unknown fixture document")

      const value = {
        document: {
          ...document,
          path: request.path,
          title: request.path.endsWith("related.md") ? `${document.project} related guide` : document.title,
          sha256: state.edited ? "c".repeat(64) : document.sha256,
        },
        text: `# ${request.path.endsWith("related.md") ? `${document.project} related guide` : document.title}\n\n${document.project} source content${state.edited ? " updated" : ""}\n\n[Related guide](related.md)${state.images ? "\n\n![Shared chart](chart.svg)" : ""}`,
      }

      if (!state.hold) return value

      return new Promise((resolve) => pending.push({ resolve, value }))
    },
    asset: async (request, options) => {
      assets.push({ project: request.project, path: request.path, signal: options?.signal })

      const value = {
        data: btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="${request.project === "alpha" ? 1 : 2}" height="1"><rect width="100%" height="100%" fill="red"/></svg>`),
        mime: "image/svg+xml",
      }

      if (!state.holdAssets || request.project !== "alpha") return value

      // Deliberately resolve even after abort, as a late transport reply can do.
      return new Promise((resolve) => pendingAssets.push({ resolve, value }))
    },
    attachment: async () => "file:///fixture.pdf",
    state: () => undefined,
    on: () => () => undefined,
  }

  const live = liveAccessor<Client>(() =>
    state.active
      ? { status: "active", generation: state.generation, value: client }
      : { status: "inactive", reason: "disabled" },
  )

  const session = createMemo(() => {
    // SAFETY: this fixture supplies every MountedSession field accessed by the reader and link handler.
    return {
      key: state.session,
      id: state.session,
      directory: `/repo/${state.session}`,
      server: { local: true },
      project: { worktree: `/repo/${state.session}` },
    } as MountedSession
  })

  // SAFETY: the reader only uses composer.attach, backed by the app's production draft implementation.
  const screen = {
    composer: { attach: (part: ComposerNote) => input.draft.attach(state.session, part) },
  } as SessionScreen

  const unused = (): never => {
    throw new Error("The reader accessed an unrelated host API")
  }

  const context: Context & SetupContext<typeof definition> = {
    id: "project-center",
    options: {},
    signal: new AbortController().signal,
    t: text,
    plural: (key, count) => text(`${key}.${pluralCategory(state.locale, count)}`, { count }),
    add: (registry, item) => {
      if (registry.id !== LinkHandler.id) return () => undefined

      // SAFETY: the checked registry ID identifies the renderer's static LinkHandler contribution.
      handlers.push(item as LinkHandler)

      return () => undefined
    },
    list: unused,
    provide: unused,
    main: unused,
    use<T extends Token>(token: T) {
      if (token.id !== ProjectCenter.id) throw new Error("Unknown fixture contract")

      // SAFETY: the checked token is the ProjectCenter IPC, whose client is implemented above.
      return live as Accessor<Live<TokenValue<T>>>
    },
    stores: {
      settings: { value: { registry: "" }, ready: () => true, set: unused, update: unused },
      selection: (view) => ({
        get value() {
          return state.loaded ? selections[view.key] : undefined
        },
        ready: () => state.loaded,
        set: unused,
        update: async (mutate) => {
          const previous = selections[view.key]

          if (!previous) throw new Error("Unknown fixture session")

          const draft = { ...previous }
          mutate(draft)
          setSelections(view.key, draft)
        },
      }),
    },
    layout: {
      settings() {},
      ready: unused,
      narrow: unused,
      open() {},
      close: unused,
      toggle: unused,
      hide: unused,
      state: unused,
      stored: unused,
      project: unused,
      draft: unused,
      get side() { return unused() },
      get scroll() { return unused() },
      get sidebar() { return unused() },
    },
    system: { openExternal() {}, copy: unused, save: unused },
    get client() { return unused() },
    get sessions() { return unused() },
    get screen() { return unused() },
    get storage() { return unused() },
    get desktop() { return unused() },
    get dialogs() { return unused() },
    get toast() { return unused() },
    get tabs() { return unused() },
    get attention() { return unused() },
    get commands() { return unused() },
    get links() { return unused() },
    get embeds() { return unused() },
    ui: input.ui,
    get app() { return unused() },
    get locale() { return unused() },
    get appearance() { return unused() },
    get router() { return unused() },
    get keybinds() { return unused() },
    get servers() { return unused() },
    get workspaces() { return unused() },
  }

  const dispose = render(
    () => (
      <input.LanguageProvider locale={state.locale}>
        <input.UiI18nBridge>
          <DialogProvider>
            <PluginContext.Provider value={context}>
              {(() => {
                setup(context)

                return null
              })()}
              <div class="flex-1 min-h-0">
                {/* Restore the production reader while retaining its session store. */}
                <Show when={`${state.session}:${state.visit}`} keyed>
                  <Page session={session()} screen={screen} />
                </Show>
              </div>
              <input.draft.render session={state.session} openSource={openSource} />
            </PluginContext.Provider>
          </DialogProvider>
        </input.UiI18nBridge>
      </input.LanguageProvider>
    ),
    host,
  )

  return {
    load: () => setState("loaded", true),
    hold: () => setState("hold", true),
    release: () => {
      setState("hold", false)
      pending.splice(0).forEach((item) => item.resolve(item.value))
    },
    switchSession: () => setState("session", "beta"),
    suspend: () => setState("active", false),
    resume: () => setState({ active: true, generation: state.generation + 1 }),
    editSource: () => setState("edited", true),
    images: () => setState("images", true),
    holdAssets: () => setState("holdAssets", true),
    releaseAssets: () => {
      setState("holdAssets", false)
      pendingAssets.splice(0).forEach((item) => item.resolve(item.value))
    },
    assets: () => assets.map((item) => ({ project: item.project, path: item.path, aborted: item.signal?.aborted ?? false })),
    restore: () => setState("visit", (visit) => visit + 1),
    openSource,
    chinese: async () => {
      const { default: zh } = await import("./i18n/zh")
      setMessages({ ...en, ...zh })
      setState("locale", "zh")
    },
    notes: input.draft.notes,
    request: () => input.draft.request(state.session),
    calls: () => ({ reads: state.reads, catalogs: state.catalogs }),
    unmount: () => {
      dispose()
      host.remove()
    },
  }

  async function openSource(href: string) {
    const handler = handlers.find((handler) => handler.match({ href }))

    if (!handler) throw new Error("No source link handler")

    await handler.open({ href, session: session() })
  }
}
