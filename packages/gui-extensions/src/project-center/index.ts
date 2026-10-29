import { Schema } from "effect"
import { Extension, Ipc, Store } from "../sdk"
import type { ProjectCenter } from "./contract"
import en from "./i18n/en"

export default Extension.define({
  id: "project-center",
  provides: { center: Ipc.ref<typeof ProjectCenter>("project-center") },
  stores: {
    settings: Store.global(Schema.Struct({ registry: Schema.String }), { registry: "" }),
    selection: Store.session(
      Schema.Struct({
        project: Schema.String,
        sourceProject: Schema.optional(Schema.String),
        sourceHash: Schema.optional(Schema.String),
        path: Schema.String,
        history: Schema.Boolean,
        plans: Schema.Boolean,
      }),
      { project: "", sourceProject: "", path: "", history: false, plans: false },
    ),
  },
  i18n: { en, zh: () => import("./i18n/zh") },
})
