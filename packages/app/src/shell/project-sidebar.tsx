import { Show } from "solid-js"
import { Schema } from "effect"
import { ResizeHandle } from "@opencode/ui/resize-handle"
import { Persist, persisted } from "@/runtime/persistence/storage"
import { Persistence } from "@/runtime/persistence/schema"
import { PluginSlot } from "@/runtime/plugin/render"
import { createNavigation } from "@/runtime/plugin/navigation"

const sidebarSchema = Persistence.struct({
  opened: Schema.Boolean,
  width: Schema.Finite,
})

export function ProjectSidebar(props: { verticalTabs: boolean; embedded?: boolean; mountTabs: (element: HTMLElement) => void }) {
  const navigation = createNavigation()
  // Preserve the existing shell geometry preference; plugins own content, not the dock or tabs portal.
  const [state, setState] = persisted(Persist.window("project-sidebar"), sidebarSchema, { opened: true, width: 260 })
  const wide = () => state.opened || props.verticalTabs

  return (
    <aside
      data-slot={props.verticalTabs && !props.embedded ? "vertical-tabs-sidebar" : undefined}
      class="relative flex h-full min-h-0 shrink-0 flex-col bg-v2-background-bg-deep px-2 pb-[var(--shell-bottom-inset,8px)] pt-[var(--shell-top-inset,8px)]"
      style={props.embedded ? { display: "contents" } : { width: `${wide() ? Math.min(520, Math.max(props.verticalTabs ? 140 : 200, state.width)) : 44}px` }}
    >
      <div class="flex min-h-0 flex-col" classList={{ "flex-1": !props.verticalTabs, "max-h-[55%]": props.verticalTabs }}>
        <PluginSlot at="window.navigation" input={{ navigation, get expanded() { return state.opened }, toggle: () => setState("opened", !state.opened) }} />
      </div>
      <Show when={props.verticalTabs}>
        <div ref={props.mountTabs} class="mt-2 flex min-h-0 flex-1 flex-col border-t border-v2-border-base pt-2" />
      </Show>
      <Show when={wide() && !props.embedded}>
        <ResizeHandle class="-end-2" direction="horizontal" size={state.width} min={props.verticalTabs ? 140 : 200} max={520} onResize={(width) => setState("width", width)} />
      </Show>
    </aside>
  )
}
