import { lazy, onCleanup, Show, Suspense } from "solid-js"
import { Command, LinkHandler, MenuItem, onIdle, Panel, SettingsPage, type PanelTab, type Setup } from "../sdk"
import type definition from "./index"
import { parseSource } from "./source"

const setup: Setup<typeof definition> = (ctx) => {
  const Page = lazy(() => import("./page"))
  const Settings = lazy(() => import("./settings"))
  onCleanup(onIdle(() => void Page.preload()))

  const open = () => {
    const session = ctx.sessions.current()

    if (session) ctx.layout.open(`${ctx.id}:main`, session, { tab: "select" })
  }

  ctx.add(Command, () => ({ id: "open", title: ctx.t("open"), enabled: !!ctx.sessions.current(), run: open }))
  ctx.add(
    MenuItem,
    (): MenuItem => ({ menu: "session.panel", id: "open", title: ctx.t("title"), icon: "folder", run: open }),
  )

  const tab: PanelTab = {
    id: "main",
    get title() {
      return ctx.t("title")
    },
    closable: "compact",
  }

  ctx.add(Panel, {
    id: "main",
    region: "side",
    wide: true,
    mobile: {
      get title() {
        return ctx.t("title")
      },
      order: 46,
      kind: "menu",
      icon: "folder",
    },
    list: (input) => (input.open.includes("main") ? [tab] : []),
    render: (props) => (
      <Show when={`${props.session.key}\n${props.session.directory}`} keyed>
        <Suspense
          fallback={
            <div class="p-4" role="status">
              {ctx.t("loading")}
            </div>
          }
        >
          <Page session={props.session} screen={props.screen} />
        </Suspense>
      </Show>
    ),
  })

  ctx.add(SettingsPage, {
    id: ctx.id,
    icon: "folder",
    get title() {
      return ctx.t("title")
    },
    get entries() {
      return [{ id: "registry", title: ctx.t("registry") }]
    },
    render: () => (
      <Suspense>
        <Settings />
      </Suspense>
    ),
  })

  ctx.add(LinkHandler, {
    priority: 30,
    match: (link) => !!parseSource(link.href),
    exists: (link) => !!parseSource(link.href),
    async open(link) {
      const target = parseSource(link.href)
      const session = link.session ?? ctx.sessions.current()

      if (!target || !session) {
        ctx.layout.settings(ctx.id)

        return
      }

      await ctx.stores.selection(session).update((draft) => {
        draft.project = target.project
        draft.sourceProject = target.project
        draft.path = target.path
        // An empty hash identifies an older reference link; undefined means ordinary source browsing.
        draft.sourceHash = target.sha256 ?? ""
      })

      if (ctx.signal.aborted) return
      ctx.layout.open(`${ctx.id}:main`, session, { tab: "select", background: link.background })
    },
  })
}

export default setup
