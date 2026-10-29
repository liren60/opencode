import { createMemo, Show, type Component, type JSX, type ParentComponent } from "solid-js"
import { createStore } from "solid-js/store"
import { render } from "solid-js/web"
import { DialogProvider } from "@opencode/ui/context/dialog"
import { pluralCategory, resolveTemplate } from "@opencode/ui/context/i18n"
import {
  ExtensionContext,
  Live,
  LinkHandler,
  type ComposerNote,
  type Context,
  type IpcClient,
  type MountedSession,
  type SessionScreen,
  type SetupContext,
} from "../sdk"
import definition from "./index"
import type { ProjectCenter } from "./contract"
import en from "./i18n/en"
import Page from "./page"
import setup from "./renderer"

type Client = IpcClient<typeof ProjectCenter.spec>

/** The production reader with IPC and session storage held at their real asynchronous boundaries. */
export function mountProjectCenter(input: {
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
    locale: "en",
  })

  const [selections, setSelections] = createStore<
    Record<
      string,
      { project: string; sourceProject: string; sourceHash?: string; path: string; history: boolean; plans: boolean }
    >
  >({
    alpha: { project: "", sourceProject: "", path: "", history: false, plans: false },
    beta: { project: "", sourceProject: "", path: "", history: false, plans: false },
  })

  const pending: {
    resolve(value: Awaited<ReturnType<Client["read"]>>): void
    value: Awaited<ReturnType<Client["read"]>>
  }[] = []

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
        document: { ...document, sha256: state.edited ? "c".repeat(64) : document.sha256 },
        text: `# ${document.title}\n\n${document.project} source content${state.edited ? " updated" : ""}\n\n[Related guide](README.md)`,
      }

      if (!state.hold) return value

      return new Promise((resolve) => pending.push({ resolve, value }))
    },
    asset: async () => ({ data: "", mime: "image/png" }),
    attachment: async () => "file:///fixture.pdf",
    state: () => undefined,
    on: () => () => undefined,
  }

  const live = Live.accessor<Client>(() =>
    state.active
      ? { status: "active", generation: state.generation, value: client }
      : { status: "inactive", reason: "disabled" },
  )

  const session = createMemo(() => {
    // SAFETY: the fixture supplies all session fields the production reader uses; unused server/client fields stay absent.
    return {
      key: state.session,
      id: state.session,
      directory: `/repo/${state.session}`,
      server: { local: true },
      project: { worktree: `/repo/${state.session}` },
    } as MountedSession
  })

  // SAFETY: the reader uses only composer.attach; the app fixture supplies its production draft implementation.
  const screen = {
    composer: {
      attach: (part: ComposerNote) => input.draft.attach(state.session, part),
    },
  } as SessionScreen

  const unused = (): never => {
    throw new Error("The reader accessed an unrelated host API")
  }

  const context: Context & SetupContext<typeof definition> = {
    id: "project-center",
    signal: new AbortController().signal,
    t: text,
    plural: (key: string, count: number) => text(`${key}.${pluralCategory(state.locale, count)}`, { count }),
    add: (registry, item) => {
      if (registry.id !== LinkHandler.id) return () => undefined

      // SAFETY: the checked registry id fixes the item type; the real renderer contributes a static LinkHandler object.
      handlers.push(item as LinkHandler)

      return () => undefined
    },
    list: unused,
    provide: unused,
    requires: {},
    uses: { center: Object.assign(live, { load: () => live }) },
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
      state: unused,
      stored: unused,
      project: unused,
      get side() {
        return unused()
      },
      get sidebar() {
        return unused()
      },
      get dock() {
        return unused()
      },
      get scroll() {
        return unused()
      },
    },
    system: { openExternal() {}, copy: unused, save: unused },
    get sessions() {
      return unused()
    },
    get screen() {
      return unused()
    },
    get storage() {
      return unused()
    },
    get desktop() {
      return unused()
    },
    get dialogs() {
      return unused()
    },
    get links() {
      return unused()
    },
    get embeds() {
      return unused()
    },
    get build() {
      return unused()
    },
    get locale() {
      return unused()
    },
    get appearance() {
      return unused()
    },
    get router() {
      return unused()
    },
    get keybinds() {
      return unused()
    },
    get servers() {
      return unused()
    },
    get workspaces() {
      return unused()
    },
  }

  const dispose = render(
    () => (
      <input.LanguageProvider locale={state.locale}>
        <input.UiI18nBridge>
          <DialogProvider>
            <ExtensionContext.Provider value={context}>
              {(() => {
                setup(context)

                return null
              })()}
               <div class="flex-1 min-h-0">
                 {/* Remount the production reader while keeping its session store, as after restoring a panel. */}
                 <Show when={`${state.session}:${state.visit}`} keyed>
                   <Page session={session()} screen={screen} />
                 </Show>
               </div>
               <input.draft.render session={state.session} openSource={openSource} />
            </ExtensionContext.Provider>
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
    restore: () => setState("visit", (visit) => visit + 1),
    openSource,
    chinese: async () => {
      const { default: zh } = await definition.i18n.zh()
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
