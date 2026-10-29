import { createMemo, For, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { usePlugin, type Navigation, type NavigationSession, type SlotMap } from "@opencode/plugin/gui"
import { Icon } from "@opencode/ui/icon"
import { IconButton } from "@opencode/ui/icon-button"

export default function ProjectNavigation(props: { input: SlotMap["window.navigation"] }) {
  const ctx = usePlugin()
  const [clock, setClock] = createStore({ now: Date.now() })
  const timer = setInterval(() => setClock("now", Date.now()), 60_000)
  onCleanup(() => clearInterval(timer))

  return (
    <nav aria-label={ctx.t("navigator")} class="flex min-h-0 flex-1 flex-col">
      <div class="flex h-9 shrink-0 items-center gap-2 px-1">
        <Show when={props.input.expanded}>
          <span class="min-w-0 flex-1 truncate text-13-medium text-v2-text-text-base">{ctx.t("home.projects")}</span>
        </Show>
        <IconButton
          icon={<Icon name="layout-left" size="small" />}
          size="small"
          aria-label={ctx.t(props.input.expanded ? "hide" : "show")}
          title={ctx.t(props.input.expanded ? "hide" : "show")}
          aria-expanded={props.input.expanded}
          onClick={props.input.toggle}
        />
      </div>
      <Show when={props.input.expanded}>
        <div data-scrollable class="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          <For each={props.input.navigation.list()}>{(server) => (
            <ServerProjects server={server} navigation={props.input.navigation} showServer={props.input.navigation.list().length > 1} now={() => clock.now} />
          )}</For>
        </div>
      </Show>
    </nav>
  )
}

function ServerProjects(props: { server: string; navigation: Navigation; showServer: boolean; now: () => number }) {
  const ctx = usePlugin()
  const view = props.navigation.watch(() => props.server)
  const [state, setState] = createStore<{ expanded: Record<string, { visit: number; open: boolean }>; more: Record<string, boolean> }>({ expanded: {}, more: {} })

  const grouped = createMemo(() => view.sessions().reduce((groups, session) => {
    const list = groups.get(session.project)

    if (list) list.push(session)

    if (!list) groups.set(session.project, [session])

    return groups
  }, new Map<string, NavigationSession[]>()))

  return (
    <section class="mb-3">
      <Show when={props.showServer}>
        <div class="truncate px-2 py-1 text-12-medium text-v2-text-text-muted">{view.name()}</div>
      </Show>
      <For each={view.projects()}>{(project) => {
        const selected = () => view.project() === project.key
        // A new selection opens its disclosure again; a user may still collapse it during that visit.
        const visit = createMemo((previous: number) => selected() ? previous + 1 : previous, 0)
        const expanded = createMemo((previous: boolean) => selected() && state.expanded[project.key]?.visit !== visit() ? true : state.expanded[project.key]?.open ?? previous, false)
        const sessions = () => grouped().get(project.key) ?? []
        const visible = () => state.more[project.key] ? sessions() : sessions().filter((session, index) => index < 8 || session.id === view.session())

        return (
          <div class="mb-1">
            <div class="flex h-9 items-center gap-1 rounded-md px-1" classList={{ "bg-v2-background-bg-layer-01": selected() }}>
              <button
                type="button"
                class="flex h-full min-w-0 flex-1 items-center gap-2 rounded px-1 text-start text-13-medium text-v2-text-text-base hover:bg-v2-background-bg-layer-01 focus-visible:outline focus-visible:outline-v2-border-focus"
                aria-label={project.name}
                aria-expanded={expanded()}
                aria-current={selected() ? "true" : undefined}
                title={project.directory}
                onClick={() => setState("expanded", project.key, { visit: visit(), open: !expanded() })}
              >
                <Icon name={expanded() ? "chevron-down" : "chevron-right"} size="small" class="shrink-0 text-v2-icon-icon-muted" />
                <Icon name="folder" size="small" class="shrink-0" />
                <span class="truncate">{project.name}</span>
                <Show when={selected()}><span class="ms-auto size-1.5 shrink-0 rounded-full bg-v2-icon-icon-accent" /></Show>
              </button>
              <IconButton icon={<Icon name="plus" size="small" />} size="small" disabled={!view.connected()} aria-label={ctx.t("new", { project: project.name })} title={ctx.t("new", { project: project.name })} onClick={() => view.newSession(project.directory)} />
            </div>
            <Show when={expanded()}>
              <div class="ms-4 border-s border-v2-border-base ps-2 py-1">
                <For each={visible()}>{(session) => {
                  const time = createMemo(() => props.navigation.time(session.activity, props.now()))
                  const active = () => view.session() === session.id

                  return (
                    <a
                      href={session.href}
                      aria-current={active() ? "page" : undefined}
                      aria-label={session.title}
                      aria-description={time().full}
                      title={session.title}
                      class="flex h-8 min-w-0 items-center rounded-md px-2 text-13-regular text-v2-text-text-muted hover:bg-v2-background-bg-layer-01 focus-visible:outline focus-visible:outline-v2-border-focus"
                      classList={{ "bg-v2-background-bg-layer-02 text-v2-text-text-base": active() }}
                      onClick={(event) => {
                        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return

                        event.preventDefault()
                        view.openSession(session.id)
                      }}
                    >
                      <bdi dir="auto" class="min-w-0 flex-1 truncate">{session.title}</bdi>
                      <time dateTime={new Date(session.activity).toISOString()} title={time().full} class="ms-2 shrink-0 text-12-regular text-v2-text-text-faint tabular-nums">{time().compact}</time>
                    </a>
                  )
                }}</For>
                <Show when={sessions().length > 8}>
                  <button type="button" class="h-8 px-2 text-12-medium text-v2-text-text-muted hover:text-v2-text-text-base" onClick={() => setState("more", project.key, !state.more[project.key])}>{ctx.t(state.more[project.key] ? "less" : "more")}</button>
                </Show>
                <Show when={!sessions().length}><p class="px-2 py-1 text-12-regular text-v2-text-text-muted">{ctx.t(view.loading() ? "common.loading" : "home.sessions.empty")}</p></Show>
              </div>
            </Show>
          </div>
        )
      }}</For>
      <Show when={view.failed()}><button type="button" class="h-8 px-2 text-12-medium text-v2-text-text-muted" onClick={view.retry}>{ctx.t("common.retry")}</button></Show>
      <button type="button" disabled={!view.connected()} class="flex h-9 w-full items-center gap-2 rounded-md px-2 text-start text-13-regular text-v2-text-text-muted hover:bg-v2-background-bg-layer-01 disabled:opacity-50" onClick={view.addProject}>
        <Icon name="plus" size="small" />{ctx.t("add")}
      </button>
      <Show when={view.directory()}>{(directory) => <p class="mt-2 truncate px-2 text-12-regular text-v2-text-text-muted" title={directory()}>{directory()}</p>}</Show>
    </section>
  )
}
