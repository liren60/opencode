import { Schema } from "effect"
import { Plugin, Store } from "@opencode/plugin/gui"
import { builtinCatalog } from "@opencode/plugin/gui/builtin"
import en from "./i18n/en"

export default Plugin.define({
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
  i18n: builtinCatalog({ en, zh: () => import("./i18n/zh") }),
})
