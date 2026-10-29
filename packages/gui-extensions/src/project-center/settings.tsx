import { Button } from "@opencode/ui/button"
import { createStore } from "solid-js/store"
import { useExtension } from "../sdk"
import type definition from "./index"

export default function ProjectCenterSettings() {
  const ctx = useExtension<typeof definition>()
  const [state, setState] = createStore({ registry: ctx.stores.settings.value.registry, saved: false })

  return (
    <div class="settings-tab-body p-6 flex flex-col gap-4">
      <h2 class="settings-tab-title">{ctx.t("title")}</h2>
      <p>{ctx.t("description")}</p>
      <form
        class="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          ctx.stores.settings.update((draft) => {
            draft.registry = state.registry.trim()
          })
          setState("saved", true)
        }}
      >
        <label class="flex flex-col gap-2">
          {ctx.t("registry")}
          <input
            dir="ltr"
            class="border rounded p-2 bg-transparent"
            value={state.registry}
            onInput={(event) => setState({ registry: event.currentTarget.value, saved: false })}
          />
        </label>
        <p class="text-12-regular text-v2-text-text-muted">{ctx.t("registryHint")}</p>
        <Button type="submit" variant="neutral">
          {ctx.t(state.saved ? "saved" : "save")}
        </Button>
      </form>
    </div>
  )
}
