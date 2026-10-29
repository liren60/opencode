import { createMemo } from "solid-js"
import { skipToken, useQuery } from "@tanstack/solid-query"
import type { Navigation, NavigationProject, NavigationView } from "@opencode/plugin/gui"
import { displayName } from "@opencode/ui/project-avatar"
import { useLanguage } from "@/runtime/i18n/language"
import { ServerConnection, useServers } from "@/runtime/server/registry"
import { useServerCtx } from "@/runtime/server/runtime"
import { useCurrentRoute, useLayout } from "@/shell/state/layout"
import { tabKey, useTabs } from "@/shell/tabs/tabs"
import { sessionHref } from "@/shell/routes/session"
import { pathKey } from "@/workspaces/path-key"
import { useDirectoryPicker } from "@/workspaces/selection/picker"
import { createHomeController } from "@/home/model"
import { addProjects } from "@/home/projects/add"
import { buildHomeSessionRecords } from "@/home/sessions/records"
import { loadHomeSessionIndex, mergeHomeSessionIndex } from "@/home/sessions/index"
import { homeProjectDirectories } from "@/shell/layout/helpers"
import { sessionTabTitle } from "@/shell/titlebar/tab-title"

export function createNavigation(): Navigation {
  const language = useLanguage()
  const servers = useServers()
  const home = createHomeController()
  const route = useCurrentRoute()
  const tabs = useTabs()
  const layout = useLayout()
  const pickDirectory = useDirectoryPicker()

  return {
    list: () => servers.visible.map(ServerConnection.key),
    time: language.sessionTime,
    watch(key): NavigationView {
      // The slot unmounts each server component when it leaves the visible inventory.
      const server = () => servers.visible.find((server) => ServerConnection.key(server) === key())!
      const ctx = useServerCtx(server)

      // Share Home's summary index and cache; never retain every chat's message history.
      const index = useQuery(() => ({
        queryKey: ["home-sessions", server()] as const,
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

      const directory = createMemo(() => {
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

      // Inventory refreshes must also retain unchanged rows: opening a draft can refresh its project.
      const inventory = createMemo<NavigationProject[]>((previous) => {
        const known = new Map(previous.map((project) => [project.key, project]))

        return ctx().projects.list().map((project) => {
          const item = { key: pathKey(project.worktree), directory: project.worktree, name: displayName(project) }
          const existing = known.get(item.key)

          return existing?.directory === item.directory && existing.name === item.name ? existing : item
        })
      }, [])

      const projects = createMemo(() => {
        const list = inventory()
        const current = directory()

        if (!current || list.some((project) => project.key === pathKey(current))) return list

        const project = records().find((record) => pathKey(record.project.worktree) === pathKey(current))?.project ?? { worktree: current }

        return [...list, { key: pathKey(project.worktree), directory: project.worktree, name: displayName(project) }]
      })

      const sessions = createMemo(() => records().map((record) => ({
        id: record.session.id,
        project: pathKey(record.project.worktree),
        title: sessionTabTitle(record.session.title, language.t("session.tab.session")),
        href: sessionHref(ServerConnection.Key.make(key()), record.session.id),
        activity: record.session.time.idle ?? record.session.time.created,
      })))

      const connected = () => ctx().sdk.connection.status() === "connected"

      return {
        name: () => server().displayName ?? new URL(server().http.url).host,
        connected,
        projects,
        sessions,
        directory,
        project: () => directory() ? pathKey(directory()!) : undefined,
        session: () => {
          const active = route()

          return active.type === "session" && active.server === key() ? active.sessionId : undefined
        },
        loading: () => index.isPending,
        failed: () => index.isError,
        retry: () => void index.refetch(),
        newSession(directory) {
          if (connected()) home.project.openProjectNewSession(server(), directory)
        },
        openSession(id) {
          const record = records().find((record) => record.session.id === id)

          if (record) home.project.openProjectSession(server(), record.project.worktree, record.session)
        },
        addProject() {
          if (!connected()) return

          pickDirectory({ server: server(), title: language.t("command.project.open"), multiple: true, onSelect: (result) => addProjects(ctx(), homeProjectDirectories(result)) })
        },
      }
    },
  }
}
