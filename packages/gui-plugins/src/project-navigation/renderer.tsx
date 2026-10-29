import { Slot, type Plugin } from "@opencode/plugin/gui"
import Navigation from "./navigation"
import type definition from "./index"

const setup: Plugin.Setup<typeof definition> = (ctx) => {
  ctx.add(Slot, { at: "window.navigation", render: (input) => <Navigation input={input} /> })
}

export default setup
