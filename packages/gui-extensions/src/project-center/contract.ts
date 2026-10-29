import { Schema } from "effect"
import { Ipc } from "../sdk"

export const Project = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  root: Schema.String,
  entry: Schema.String,
  plans: Schema.Array(Schema.String),
  description: Schema.String,
})

export const Document = Schema.Struct({
  project: Schema.String,
  projectName: Schema.String,
  path: Schema.String,
  title: Schema.String,
  kind: Schema.String,
  status: Schema.String,
  current: Schema.Boolean,
  sha256: Schema.String,
  excerpt: Schema.String,
})

export const Source = Schema.Struct({ registry: Schema.String, project: Schema.String, path: Schema.String })

/** Read-only local documents; no shell commands, repository writes, or model execution. */
export const ProjectCenter = Ipc.define({
  id: "project-center",
  methods: {
    catalog: {
      input: Schema.Struct({
        registry: Schema.String,
        directory: Schema.String,
        worktree: Schema.String,
        project: Schema.String,
        query: Schema.String,
        history: Schema.Boolean,
        plans: Schema.Boolean,
      }),
      output: Schema.Struct({
        registry: Schema.String,
        projects: Schema.Array(Project),
        binding: Schema.String,
        documents: Schema.Array(Document),
        total: Schema.Number,
        warnings: Schema.Array(Schema.String),
      }),
    },
    read: {
      input: Source,
      output: Schema.Struct({ document: Document, text: Schema.String }),
    },
    asset: {
      input: Source,
      output: Schema.Struct({ data: Schema.String, mime: Schema.String }),
    },
    attachment: { input: Source, output: Schema.String },
  },
})
