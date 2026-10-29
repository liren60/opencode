import type { Plugin } from "@opencode/plugin/gui/main"
import { ProjectCenter } from "./contract"
import { createReader } from "./reader"

const setup: Plugin.MainSetup = (ctx) => {
  ctx.provide(ProjectCenter, createReader())
}

export default setup
