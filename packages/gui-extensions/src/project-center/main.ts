import type { MainSetup } from "../sdk/main"
import { ProjectCenter } from "./contract"
import type definition from "./index"
import { createReader } from "./reader"

const setup: MainSetup<typeof definition> = (ctx) => {
  ctx.provide(ProjectCenter, createReader())
}

export default setup
