import { createEffect, createMemo, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { Schema } from "effect"
import { skipToken, useQuery } from "@tanstack/solid-query"
import { Icon } from "@opencode/ui/icon"
import { IconButton } from "@opencode/ui/icon-button"
import { ResizeHandle } from "@opencode/ui/resize-handle"
import { displayName } from "@opencode/ui/project-avatar"
import { useLanguage } from "@/runtime/i18n/language"
import { Persist, persisted } from "@/runtime/persistence/storage"
import { Persistence } from "@/runtime/persistence/schema"
import { ServerConnection, useServers } from "@/runtime/server/registry"
import { useServerCtx } from "@/runtime/server/runtime"
import { useCurrentRoute, useLayout } from "@/shell/state/layout"
import { tabKey, useTabs } from "@/shell/tabs/tabs"
import { sessionHref } from "@/shell/routes/session"
import { pathKey } from "@/workspaces/path-key"
import { useDirectoryPicker } from "@/workspaces/selection/picker"
import { createHomeController, type HomeController } from "@/home/model"
import { addProjects } from "@/home/projects/add"
import { buildHomeSessionRecords } from "@/home/sessions/records"
import { loadHomeSessionIndex, mergeHomeSessionIndex } from "@/home/sessions/index"
import { homeProjectDirectories } from "@/shell/layout/helpers"
import { sessionTabTitle } from "@/shell/titlebar/tab-title"

const sidebarSchema = Persistence.struct({
  opened: Schema.Boolean,
  width: Schema.Finite,
})

export function ProjectSidebar(props: { verticalTabs: boolean; mountTabs: (element: HTMLElement) => void }) {
  const language = useLanguage()
  const servers = useServers()
  const home = createHomeController()
  const [state, setState] = persisted(Persist.window("project-sidebar"), sidebarSchema, { opened: true, width: 260 })
  const wide = () => state.opened || props.verticalTabs

  return (
    <aside
      data-slot={props.verticalTabs ? "vertical-tabs-sidebar" : undefined}
      class="relative flex h-full min-h-0 shrink-0 flex-col bg-v2-background-bg-deep px-2 pb-[var(--shell-bottom-inset,8px)] pt-[var(--shell-top-inset,8px)]"
      style={{ width: `${wide() ? Math.min(520, Math.max(props.verticalTabs ? 140 : 200, state.width)) : 44}px` }}
    >
      <nav aria-label={language.t("sidebar.navigator")} class="flex min-h-0 flex-col" classList={{ "flex-1": !props.verticalTabs, "max-h-[55%]": props.verticalTabs }}>
        <div class="flex h-9 shrink-0 items-center gap-2 px-1">
          <Show when={state.opened}>
            <span class="min-w-0 flex-1 truncate text-13-medium text-v2-text-text-base">{language.t("home.projects")}</span>
          </Show>
          <IconButton
            icon={<Icon name="layout-left" size="small" />}
            size="small"
            aria-label={language.t(state.opened ? "sidebar.navigator.hide" : "sidebar.navigator.show")}
            title={language.t(state.opened ? "sidebar.navigator.hide" : "sidebar.navigator.show")}
            aria-expanded={state.opened}
            onClick={() => setState("opened", !state.opened)}
          />
        </div>
        <Show when={state.opened}>
          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
            <For each={servers.visible}>{(server) => <ServerProjects server={server} showServer={servers.visible.length > 1} home={home} />}</For>
          </div>
        </Show>
      </nav>
      <Show when={props.verticalTabs}>
        <div ref={props.mountTabs} class="mt-2 flex min-h-0 flex-1 flex-col border-t border-v2-border-base pt-2" />
      </Show>
      <Show when={wide()}>
        <ResizeHandle class="-end-2" direction="horizontal" size={state.width} min={props.verticalTabs ? 140 : 200} max={520} onResize={(width) => setState("width", width)} />
      </Show>
    </aside>
  )
}

function ServerProjects(props: { server: ServerConnection.Any; showServer: boolean; home: HomeController }) {
  const language = useLanguage()
  const ctx = useServerCtx(() => props.server)
  const route = useCurrentRoute()
  const tabs = useTabs()
  const layout = useLayout()
  const pickDirectory = useDirectoryPicker()
  const key = () => ServerConnection.key(props.server)
  const [state, setState] = createStore<{ expanded: Record<string, boolean>; more: Record<string, boolean> }>({ expanded: {}, more: {} })

  // Share Home's summary index and cache. Listing projects must not retain every chat's message history.
  const index = useQuery(() => ({
    queryKey: ["home-sessions", props.server] as const,
    enabled: ctx().sdk.connection.status() === "connected",
    queryFn: ctx() ? ({ signal }) => loadHomeSessionIndex((input, options) => ctx().sdk.api.session.list(input, options), signal) : skipToken,
    retry: false,
    staleTime: 30_000,
    refetchOnReconnect: true,
    select: (sessions) => () => sessions,
  }))

  const records = createMemo(() => buildHomeSessionRecords({
    sessions: () => ctx().data.session.apply(mergeHomeSessionIndex(index.isPending ? [] : (index.data?.() ?? []), ctx().data.session.list())),
    projectDirectories: () => undefined,
    projects: ctx().projects.list,
    resolveProject: ctx().projects.forSession,
  }))

  const current = createMemo(() => {
    const active = route()

    if (active.type === "session" && active.server === key()) {
      const tab = tabs.store.find((item) => item.type === "session" && item.server === key() && (item.sessionId === active.sessionId || item.routeSessionId === active.sessionId))
      const session = ctx().data.session.get(active.sessionId) ?? (tab?.type === "session" ? ctx().data.session.get(tab.sessionId) : undefined) ?? records().find((item) => item.session.id === active.sessionId)?.session

      if (session) return ctx().projects.forSession(session)?.worktree ?? session.location.directory

      return tab ? tabs.info[tabKey(tab)]?.directory : undefined
    }

    if (active.type === "draft") {
      const tab = tabs.store.find((item) => item.type === "draft" && item.draftID === active.draftID && item.server === key())

      if (tab?.type === "draft") return ctx().projects.list().find((project) => pathKey(project.worktree) === pathKey(tab.directory) || project.sandboxes?.some((sandbox) => pathKey(sandbox) === pathKey(tab.directory)))?.worktree ?? tab.directory
    }

    if (active.type === "home" && layout.home.selection().server === key()) return layout.home.selection().directory
  })

  const projects = createMemo(() => {
    const list = ctx().projects.list()
    const directory = current()

    if (!directory || list.some((project) => pathKey(project.worktree) === pathKey(directory))) return list

    return [...list, ctx().projects.resolve({ worktree: directory, expanded: false })]
  })

  const grouped = createMemo(() => Map.groupBy(records(), (record) => pathKey(record.project.worktree)))
  const activeProject = createMemo(() => {
    const directory = current()

    return directory ? pathKey(directory) : undefined
  })
  createEffect(() => {
    const directory = activeProject()

    if (directory) setState("expanded", directory, true)
  })
  const connected = () => ctx().sdk.connection.status() === "connected"

  return (
    <section class="mb-3">
      <Show when={props.showServer}>
        <div class="truncate px-2 py-1 text-12-medium text-v2-text-text-muted">{props.server.displayName ?? new URL(props.server.http.url).host}</div>
      </Show>
      <For each={projects()}>{(project) => {
        const directory = () => pathKey(project.worktree)
        const selected = () => activeProject() === directory()
        const sessions = () => grouped().get(directory()) ?? []
        const visible = () => {
          const active = route()

          return state.more[directory()] ? sessions() : sessions().filter((record, index) => index < 8 || (active.type === "session" && record.session.id === active.sessionId))
        }

        return (
          <div class="mb-1">
            <div class="flex h-9 items-center gap-1 rounded-md px-1" classList={{ "bg-v2-background-bg-layer-01": selected() }}>
              <button
                type="button"
                class="flex h-full min-w-0 flex-1 items-center gap-2 rounded px-1 text-start text-13-medium text-v2-text-text-base hover:bg-v2-background-bg-layer-01 focus-visible:outline focus-visible:outline-v2-border-focus"
                aria-label={displayName(project)}
                aria-expanded={!!state.expanded[directory()]}
                aria-current={selected() ? "true" : undefined}
                title={project.worktree}
                onClick={() => setState("expanded", directory(), !state.expanded[directory()])}
              >
                <Icon name={state.expanded[directory()] ? "chevron-down" : "chevron-right"} size="small" class="shrink-0 text-v2-icon-icon-muted" />
                <Icon name="folder" size="small" class="shrink-0" />
                <span class="truncate">{displayName(project)}</span>
                <Show when={selected()}><span class="ms-auto size-1.5 shrink-0 rounded-full bg-v2-icon-icon-accent" /></Show>
              </button>
              <IconButton icon={<Icon name="plus" size="small" />} size="small" disabled={!connected()} aria-label={language.t("sidebar.project.new", { project: displayName(project) })} title={language.t("sidebar.project.new", { project: displayName(project) })} onClick={() => props.home.project.openProjectNewSession(props.server, project.worktree)} />
            </div>
            <Show when={state.expanded[directory()]}>
              <div class="ms-4 border-s border-v2-border-base ps-2 py-1">
                <For each={visible()}>{(record) => {
                  const active = () => {
                    const value = route()

                    return value.type === "session" && value.server === key() && value.sessionId === record.session.id
                  }

                  return (
                    <a
                      href={sessionHref(key(), record.session.id)}
                      aria-current={active() ? "page" : undefined}
                      title={sessionTabTitle(record.session.title, language.t("session.tab.session"))}
                      class="flex h-8 min-w-0 items-center rounded-md px-2 text-13-regular text-v2-text-text-muted hover:bg-v2-background-bg-layer-01 focus-visible:outline focus-visible:outline-v2-border-focus"
                      classList={{ "bg-v2-background-bg-layer-02 text-v2-text-text-base": active() }}
                      onClick={(event) => {
                        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return
                        event.preventDefault()
                        props.home.project.openProjectSession(props.server, project.worktree, record.session)
                      }}
                    ><span class="truncate">{sessionTabTitle(record.session.title, language.t("session.tab.session"))}</span></a>
                  )
                }}</For>
                <Show when={sessions().length > 8}>
                  <button type="button" class="h-8 px-2 text-12-medium text-v2-text-text-muted hover:text-v2-text-text-base" onClick={() => setState("more", directory(), !state.more[directory()])}>{language.t(state.more[directory()] ? "sidebar.sessions.less" : "sidebar.sessions.more")}</button>
                </Show>
                <Show when={!sessions().length}><p class="px-2 py-1 text-12-regular text-v2-text-text-muted">{language.t(index.isPending ? "common.loading" : "home.sessions.empty")}</p></Show>
              </div>
            </Show>
          </div>
        )
      }}</For>
      <Show when={index.isError}><button type="button" class="h-8 px-2 text-12-medium text-v2-text-text-muted" onClick={() => void index.refetch()}>{language.t("common.retry")}</button></Show>
      <button type="button" disabled={!connected()} class="flex h-9 w-full items-center gap-2 rounded-md px-2 text-start text-13-regular text-v2-text-text-muted hover:bg-v2-background-bg-layer-01 disabled:opacity-50" onClick={() => pickDirectory({ server: props.server, title: language.t("command.project.open"), multiple: true, onSelect: (result) => addProjects(ctx(), homeProjectDirectories(result)) })}>
        <Icon name="plus" size="small" />{language.t("sidebar.project.add")}
      </button>
      <Show when={current()}>{(directory) => <p class="mt-2 truncate px-2 text-12-regular text-v2-text-text-muted" title={directory()}>{directory()}</p>}</Show>
    </section>
  )
}
