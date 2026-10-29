import { Markdown } from "@opencode/session-ui/markdown"
import { MarkdownProvider } from "@opencode/session-ui/context/markdown"
import { Button } from "@opencode/ui/button"
import { createMemo, For, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { createLatest, useExtension, type MountedSession, type SessionScreen } from "../sdk"
import { ProjectCenter } from "./contract"
import type definition from "./index"
import { citation, documentLink, sourceLink } from "./source"

export default function ProjectCenterPage(props: { session: MountedSession; screen: SessionScreen }) {
  const ctx = useExtension<typeof definition>()

  return (
    <Show when={ctx.stores.selection(props.session).value} fallback={<p class="p-4">{ctx.t("loading")}</p>}>
      <Reader session={props.session} screen={props.screen} />
    </Show>
  )
}

function Reader(props: { session: MountedSession; screen: SessionScreen }) {
  const ctx = useExtension<typeof definition>()
  const store = () => ctx.stores.selection(props.session)
  const controller = new AbortController()

  onCleanup(() => controller.abort())

  const [state, setState] = createStore({
    search: "",
    query: "",
    revision: 0,
    selected: "",
    selectedHash: "",
    notice: "",
  })

  const live = ctx.uses.center.load(ProjectCenter)

  const main = () => {
    const current = live()

    return current.status === "active" ? current : undefined
  }

  const input = createMemo(() => {
    const selection = store().value

    if (!selection) return

    return {
      registry: ctx.stores.settings.value.registry,
      directory: props.session.server.local ? props.session.directory : "",
      worktree: props.session.server.local ? (props.session.project?.worktree ?? "") : "",
      project: selection.project,
      query: state.query,
      history: selection.history,
      plans: selection.plans,
    }
  })

  const request = createMemo(() => {
    const client = main()
    const value = input()

    if (!client || !value) return

    return { client: client.value, generation: client.generation, revision: state.revision, input: value }
  })

  // createLatest stores replies in a Solid store, which proxies objects; compare request values, not object identity.
  const catalogIdentity = () => JSON.stringify([input(), state.revision])

  const catalog = createLatest(request, async (key, signal) => ({
    identity: JSON.stringify([key.input, key.revision]),
    data: await key.client.catalog(key.input, { signal }),
  }))

  const data = () => {
    const result = catalog.latest

    return result?.identity === catalogIdentity() ? result.data : undefined
  }

  const sourceInput = createMemo(() => {
    const selection = store().value

    const project =
      selection?.sourceProject ||
      (selection?.project && selection.project !== "all" ? selection.project : data()?.binding)

    if (!selection?.path || !project) return

    return { registry: ctx.stores.settings.value.registry, project, path: selection.path }
  })

  const selected = createMemo(() => {
    const client = main()
    const value = sourceInput()

    if (!client || !value) return

    return { client: client.value, generation: client.generation, revision: state.revision, input: value }
  })

  const source = createLatest(selected, async (key, signal) => ({
    identity: JSON.stringify([key.input, key.revision]),
    value: await key.client.read(key.input, { signal }),
  }))

  const document = () => {
    const result = source.latest

    return result?.identity === JSON.stringify([sourceInput(), state.revision]) ? result.value : undefined
  }

  const snapshot = () => {
    const hash = store().value?.sourceHash

    if (hash === undefined || !sourceInput()) return

    if (!hash) return "snapshotUnknown"

    if (!main() || source.loading || source.error || !document()) return "snapshotUnchecked"

    return hash === document()?.document.sha256 ? "snapshotMatch" : "snapshotChanged"
  }

  const choose = (project: string, path: string) => {
    setState({ selected: "", notice: "" })
    void store().update((draft) => {
      draft.sourceProject = project
      draft.path = path
      draft.sourceHash = undefined
    })
  }

  const open = async (href: string) => {
    const current = document()
    const client = main()

    if (!current || !client) {
      setState("notice", "unavailable")

      return
    }

    const target = documentLink(current.document.project, current.document.path, href)

    if (!target) {
      setState("notice", "linkFailed")

      return
    }

    if (target.path.toLowerCase().endsWith(".md")) {
      choose(target.project, target.path)

      return
    }

    const url = await client.value
      .attachment({ registry: ctx.stores.settings.value.registry, ...target }, { signal: controller.signal })
      .catch(() => undefined)

    if (controller.signal.aborted) return

    if (!url) {
      setState("notice", "linkFailed")

      return
    }

    ctx.system.openExternal(url)
  }

  const cite = (selection: boolean) => {
    const current = document()

    if (!current || !main()) {
      setState("notice", "unavailable")

      return
    }

    const text = selection ? state.selected : current.text

    if (!text || text.length > 12_000 || (selection && state.selectedHash !== current.document.sha256)) {
      setState("notice", "citeLimit")

      return
    }

    const href = sourceLink(current.document.project, current.document.path, current.document.sha256)
    props.screen.composer.attach({
      type: "note",
      origin: ctx.id,
      commentID: crypto.randomUUID(),
      label: current.document.title,
      icon: "folder",
      subject: citation({ ...current.document, text, href }),
      // Notes require a nonempty comment to appear in the draft and survive request construction.
      comment: ctx.t(selection ? "citeSelection" : "cite"),
      href,
    })
    void store().update((draft) => {
      draft.sourceHash = current.document.sha256
    })
    setState("notice", "cited")
  }

  return (
    <section aria-label={ctx.t("title")} class="flex flex-col h-full min-h-0 text-v2-text-text-base">
      <div class="flex flex-col gap-3 p-4 border-b shrink-0">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-medium">{ctx.t("title")}</h2>
          <Button variant="ghost" onClick={() => ctx.layout.settings(ctx.id)}>
            {ctx.t("settings")}
          </Button>
        </div>
        <Show when={!props.session.server.local}>
          <p class="text-12-regular">{ctx.t("localOnly")}</p>
        </Show>
        <label class="flex flex-col gap-1">
          <span class="sr-only">{ctx.t("binding", { name: "" })}</span>
          <select
            class="border rounded p-2 bg-v2-background-bg-base"
            value={store().value?.project ?? ""}
            onChange={(event) => {
              const project = event.currentTarget.value
              setState({ selected: "", notice: "" })
              void store().update((draft) => {
                draft.project = project
                draft.path = ""
                draft.sourceHash = undefined
              })
            }}
          >
            <option value="">{ctx.t("automatic")}</option>
            <option value="all">{ctx.t("all")}</option>
            <For each={data()?.projects ?? catalog.latest?.data.projects ?? []}>
              {(project) => <option value={project.id}>{project.name}</option>}
            </For>
          </select>
        </label>
        <Show when={data()?.binding && !store().value?.project}>
          <p class="text-12-regular">
            {ctx.t("binding", { name: data()?.projects.find((project) => project.id === data()?.binding)?.name ?? "" })}
          </p>
        </Show>
        <Show when={data() && !data()?.binding && !store().value?.project}>
          <p class="text-12-regular">{ctx.t("unbound")}</p>
        </Show>
        <form
          class="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setState({ query: state.search, revision: state.revision + 1 })
          }}
        >
          <input
            type="search"
            aria-label={ctx.t("search")}
            placeholder={ctx.t("search")}
            class="min-w-0 flex-1 border rounded p-2 bg-transparent"
            value={state.search}
            onInput={(event) => setState("search", event.currentTarget.value)}
          />
          <Button type="submit" variant="neutral">
            {ctx.t("common.search")}
          </Button>
        </form>
        <div class="flex flex-wrap items-center gap-3 text-12-regular">
          <label class="flex items-center gap-1">
            <input
              type="checkbox"
              checked={store().value?.history ?? false}
              onChange={(event) => {
                const checked = event.currentTarget.checked
                void store().update((draft) => {
                  draft.history = checked
                })
              }}
            />
            {ctx.t("history")}
          </label>
          <label class="flex items-center gap-1">
            <input
              type="checkbox"
              checked={store().value?.plans ?? false}
              onChange={(event) => {
                const checked = event.currentTarget.checked
                void store().update((draft) => {
                  draft.plans = checked
                })
              }}
            />
            {ctx.t("plans")}
          </label>
          <Button variant="ghost" onClick={() => setState("revision", (revision) => revision + 1)}>
            {ctx.t("refresh")}
          </Button>
        </div>
      </div>
      <Show when={!main()}>
        <p class="p-4" role="status">
          {ctx.t(live().status === "pending" ? "loading" : "unavailable")}
        </p>
      </Show>
      <Show when={catalog.error}>
        <div class="p-4" role="alert">
          <p>{ctx.t("failed")}</p>
          <Button onClick={() => setState("revision", (revision) => revision + 1)}>{ctx.t("retry")}</Button>
        </div>
      </Show>
      <Show when={main() || catalog.latest || source.latest}>
        <div class="flex-1 min-h-0 overflow-auto">
          <Show when={catalog.loading}>
            <p class="p-4" role="status">
              {ctx.t("loading")}
            </p>
          </Show>
          <Show when={data()}>
            {(loaded) => (
              <div class="p-4 border-b flex flex-col gap-2 max-h-64 overflow-auto">
                <p class="text-12-regular">{ctx.plural("results", loaded().total)}</p>
                <Show when={loaded().total > loaded().documents.length}>
                  <p class="text-12-regular">{ctx.t("limited", { limit: 80 })}</p>
                </Show>
                <For each={loaded().warnings}>
                  {(warning) => (
                    <p class="text-12-regular" role="alert" dir="auto">
                      {warning}
                    </p>
                  )}
                </For>
                <For
                  each={loaded().projects.filter(
                    (project) => project.id === (store().value?.project || loaded().binding),
                  )}
                >
                  {(project) => (
                    <div class="flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => choose(project.id, project.entry)}>
                        {project.name}
                      </Button>
                      <For each={project.plans}>
                        {(path) => (
                          <Button variant="ghost" onClick={() => choose(project.id, path)}>
                            <bdi dir="ltr">{path.split("/").at(-1)}</bdi>
                          </Button>
                        )}
                      </For>
                    </div>
                  )}
                </For>
                <For each={loaded().documents} fallback={<p>{ctx.t("empty")}</p>}>
                  {(item) => (
                    <button
                      type="button"
                      class="text-start rounded border p-2 hover:bg-v2-background-bg-layer-01"
                      onClick={() => choose(item.project, item.path)}
                    >
                      <bdi dir="auto" class="block font-medium">
                        {item.title}
                      </bdi>
                      <bdi dir="ltr" class="block text-12-regular break-all">
                        {item.projectName} / {item.path}
                      </bdi>
                      <Show when={item.excerpt}>
                        <span class="block text-12-regular text-v2-text-text-muted" dir="auto">
                          {item.excerpt}
                        </span>
                      </Show>
                    </button>
                  )}
                </For>
              </div>
            )}
          </Show>
          <Show when={source.loading}>
            <p class="p-4" role="status">
              {ctx.t("loading")}
            </p>
          </Show>
          <Show when={source.error}>
            <p class="p-4" role="alert">
              {ctx.t("readFailed")}
            </p>
          </Show>
          <Show when={state.notice}>
            <p class="p-4" role="status">
              {ctx.t(state.notice)}
            </p>
          </Show>
          <Show when={snapshot()}>
            {(status) => (
              <div class="p-4 flex flex-col gap-2 border-b" role={status() === "snapshotChanged" ? "alert" : "status"}>
                <p>{ctx.t(status())}</p>
                <Show when={store().value?.sourceHash}>
                  <p class="text-12-regular break-all">
                    {ctx.t("snapshotFingerprint")}
                    <code dir="ltr" class="block">
                      {store().value?.sourceHash}
                    </code>
                  </p>
                </Show>
              </div>
            )}
          </Show>
          <Show when={document()} fallback={<p class="p-4">{ctx.t("pick")}</p>}>
            {(current) => (
              <article class="p-4 flex flex-col gap-3">
                <p class="text-12-regular break-all" dir="auto">
                  {ctx.t("source", { project: current().document.projectName, path: current().document.path })}
                </p>
                <p class="text-12-regular break-all">
                  {ctx.t("sourceFingerprint")}
                  <code dir="ltr" class="block">
                    {current().document.sha256}
                  </code>
                </p>
                <Show when={!current().document.current}>
                  <p>{ctx.t("historical")}</p>
                </Show>
                <Show when={current().document.status}>
                  <p>{ctx.t("declaration", { status: current().document.status })}</p>
                </Show>
                <Show when={current().document.kind === "plan"}>
                  <p>{ctx.t("planNotice")}</p>
                </Show>
                <div class="flex flex-wrap gap-2">
                  <Button variant="neutral" disabled={!main()} onClick={() => cite(false)}>
                    {ctx.t("cite")}
                  </Button>
                  <Button variant="neutral" disabled={!state.selected || !main()} onClick={() => cite(true)}>
                    {ctx.t("citeSelection")}
                  </Button>
                </div>
                <MarkdownProvider
                  openLocalFile={(href) => void open(href)}
                  localFileExists={() => false}
                  readImage={async (href, signal) => {
                    const target = documentLink(current().document.project, current().document.path, href)
                    const client = main()

                    if (!target || !client) return

                    const asset = await client.value.asset(
                      { registry: ctx.stores.settings.value.registry, ...target },
                      { signal },
                    )

                    if (signal.aborted) return

                    return new Blob([Uint8Array.from(atob(asset.data), (character) => character.charCodeAt(0))], {
                      type: asset.mime,
                    })
                  }}
                >
                  <div
                    onPointerUp={(event) => {
                      const selection = window.getSelection()

                      setState(
                        "selected",
                        selection?.anchorNode &&
                          selection.focusNode &&
                          event.currentTarget.contains(selection.anchorNode) &&
                          event.currentTarget.contains(selection.focusNode)
                          ? selection.toString()
                          : "",
                      )
                      setState("selectedHash", current().document.sha256)
                    }}
                    onKeyUp={(event) => {
                      const selection = window.getSelection()

                      setState(
                        "selected",
                        selection?.anchorNode &&
                          selection.focusNode &&
                          event.currentTarget.contains(selection.anchorNode) &&
                          event.currentTarget.contains(selection.focusNode)
                          ? selection.toString()
                          : "",
                      )
                      setState("selectedHash", current().document.sha256)
                    }}
                  >
                    <Markdown text={current().text} cacheKey={current().document.sha256} />
                  </div>
                </MarkdownProvider>
              </article>
            )}
          </Show>
        </div>
      </Show>
    </section>
  )
}
