import { createHash } from "node:crypto"
import { lstat, readFile, readdir, realpath } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { Schema } from "effect"
import type { ProjectCenter } from "./contract"
import type { IpcImpl } from "@opencode/plugin/gui"

const RegisteredProject = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  repository: Schema.String,
  legacy: Schema.Boolean,
  profile: Schema.optional(Schema.Literal("vc5")),
  description: Schema.optional(Schema.String),
  documentRoots: Schema.Array(Schema.String),
  documentFiles: Schema.Array(Schema.String),
  entry: Schema.String,
  plans: Schema.Array(Schema.String),
})

const Registry = Schema.Struct({
  version: Schema.Literal(1),
  defaultProject: Schema.String,
  projects: Schema.Array(RegisteredProject),
})

const Metadata = Schema.Struct({
  kind: Schema.optional(Schema.String),
  status: Schema.optional(Schema.String),
  nav: Schema.optional(Schema.Boolean),
})

const excluded = ["node_modules", "bin", "obj", "dist", "build", "__pycache__"]

const mimes = [
  { extension: ".png", mime: "image/png" },
  { extension: ".jpg", mime: "image/jpeg" },
  { extension: ".jpeg", mime: "image/jpeg" },
  { extension: ".gif", mime: "image/gif" },
  { extension: ".svg", mime: "image/svg+xml" },
  { extension: ".webp", mime: "image/webp" },
  { extension: ".pdf", mime: "application/pdf" },
]

type Registered = typeof RegisteredProject.Type & { root: string }

/** A native, read-only implementation of the desktop IPC contract. No Python or Wiki server is required. */
export function createReader(): IpcImpl<typeof ProjectCenter.spec> {
  return {
    async catalog(input, caller) {
      const registry = await loadRegistry(input.registry, caller.signal)

      const binding =
        registry.projects
          .filter((project) => within(project.root, input.directory) || within(project.root, input.worktree))
          .sort((a, b) => b.root.length - a.root.length)[0]?.id ?? ""

      const scope = input.project || binding

      if (scope && scope !== "all" && !registry.projects.some((project) => project.id === scope))
        throw new Error("Unknown project")
      const warnings: string[] = []
      const words = input.query.trim().toLowerCase().split(/\s+/).filter(Boolean)

      const documents = (
        await Promise.all(
          registry.projects
            .filter((project) => scope === "all" || project.id === scope)
            .map(async (project) => {
              if (!(await exists(project.root))) {
                warnings.push(`${project.name}: ${project.root}`)

                return []
              }

              const paths = await files(project, caller.signal)

              return Promise.all(
                paths.map(async (name) => {
                  caller.signal.throwIfAborted()
                  const file = await safeFile(project, name)

                  if (!file) return []
                  const body = await readText(file, caller.signal)
                  const document = describe(project, name, body)

                  if ((!document.current && !input.history) || (input.plans && document.kind !== "plan")) return []
                  const searchable = `${document.title}\n${name}\n${body}`.toLowerCase()

                  if (!words.every((word) => searchable.includes(word))) return []
                  const position = words.length ? body.toLowerCase().indexOf(words[0] ?? "") : -1

                  return [
                    {
                      ...document,
                      excerpt: position < 0 ? "" : body.slice(Math.max(0, position - 80), position + 240),
                    },
                  ]
                }),
              )
            }),
        )
      )
        .flat(2)
        .sort((a, b) => {
          const score = (title: string) => words.filter((word) => title.toLowerCase().includes(word)).length

          return score(b.title) - score(a.title) || a.title.localeCompare(b.title)
        })

      caller.signal.throwIfAborted()

      return {
        registry: registry.file,
        projects: registry.projects.map((project) => ({
          id: project.id,
          name: project.name,
          root: project.root,
          entry: project.entry,
          plans: project.plans,
          description: project.description ?? "",
        })),
        binding,
        documents: documents.slice(0, 80),
        total: documents.length,
        warnings,
      }
    },
    async read(input, caller) {
      const project = await registered(input.registry, input.project, caller.signal)

      if (path.extname(input.path).toLowerCase() !== ".md") throw new Error("Not a Markdown document")
      const file = await safeFile(project, input.path)

      if (!file) throw new Error("Document outside registered boundaries or missing")
      const text = strip(project, await readText(file, caller.signal))

      return { document: describe(project, input.path, text), text }
    },
    async asset(input, caller) {
      const project = await registered(input.registry, input.project, caller.signal)
      const mime = mimes.find((item) => item.extension === path.extname(input.path).toLowerCase())?.mime
      const file = await safeFile(project, input.path)

      if (!mime || !file) throw new Error("Attachment outside registered boundaries or missing")

      if ((await lstat(file)).size > 20 * 1024 * 1024) throw new Error("Attachment exceeds 20 MB")
      const bytes = await readFile(file)

      caller.signal.throwIfAborted()

      return { data: bytes.toString("base64"), mime }
    },
    async attachment(input, caller) {
      const project = await registered(input.registry, input.project, caller.signal)
      const file = await safeFile(project, input.path)

      if (!file || !mimes.some((item) => item.extension === path.extname(input.path).toLowerCase()))
        throw new Error("Unsupported attachment")

      return pathToFileURL(file).href
    },
  }
}

async function loadRegistry(input: string, signal: AbortSignal) {
  const file = input || path.join(homedir(), "Downloads", "PG", "Reni_ProjectCenter", "web", "wiki-projects.json")

  if (!path.isAbsolute(file)) throw new Error("Registry path must be absolute")

  if (!(await noLinks(file))) throw new Error("Linked registry paths are not allowed")

  const data = Schema.decodeUnknownSync(Schema.fromJsonString(Registry))(
    (await readText(file, signal)).replace(/^\uFEFF/, ""),
  )

  const ids = new Set<string>()

  const projects = data.projects.map((project) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || ids.has(project.id) || !project.name || project.legacy)
      throw new Error("Invalid standalone project registry")
    ids.add(project.id)
    ;[...project.documentRoots, ...project.documentFiles, project.entry, ...project.plans].forEach(relative)

    if (![project.entry, ...project.plans].every((value) => allowed(project, value)))
      throw new Error("Entry or plan outside document allowlist")

    return { ...project, root: path.resolve(path.dirname(file), "..", project.repository) }
  })

  if (!ids.has(data.defaultProject)) throw new Error("Unknown default project")

  return { file, projects }
}

async function registered(registry: string, id: string, signal: AbortSignal) {
  const project = (await loadRegistry(registry, signal)).projects.find((item) => item.id === id)

  if (!project) throw new Error("Unknown project")

  return project
}

async function readText(file: string, signal: AbortSignal) {
  signal.throwIfAborted()
  const text = await readFile(file, "utf8")

  signal.throwIfAborted()

  return text
}

function relative(value: string) {
  if (
    !value ||
    /[\\:\u0000]/.test(value) ||
    value.split("/").some((part) => !part || part.startsWith(".") || excluded.includes(part.toLowerCase()))
  )
    throw new Error("Invalid repository-relative document path")
}

function allowed(project: typeof RegisteredProject.Type, value: string) {
  return project.documentFiles.includes(value) || project.documentRoots.some((root) => value.startsWith(`${root}/`))
}

function within(root: string, target: string) {
  if (!target) return false
  const value = path.relative(root, target)

  return value === "" || (!value.startsWith(`..${path.sep}`) && value !== ".." && !path.isAbsolute(value))
}

async function exists(file: string) {
  return lstat(file).then(
    () => true,
    () => false,
  )
}

async function noLinks(file: string): Promise<boolean> {
  const stat = await lstat(file).catch(() => undefined)

  // Node reports Windows junctions as symbolic links as well.
  if (!stat || stat.isSymbolicLink()) return false
  const parent = path.dirname(file)

  return parent === file || noLinks(parent)
}

async function safeFile(project: Registered, value: string) {
  relative(value)

  if (!allowed(project, value)) return
  const target = path.join(project.root, value)

  if (!(await noLinks(target)) || !within(await realpath(project.root), await realpath(target))) return
  const stat = await lstat(target)

  if (!stat.isFile() || (stat.size > 4 * 1024 * 1024 && path.extname(value).toLowerCase() === ".md")) return

  return target
}

async function files(project: Registered, signal: AbortSignal) {
  async function walk(folder: string): Promise<string[]> {
    signal.throwIfAborted()

    if (!(await noLinks(folder))) return []
    const entries = await readdir(folder, { withFileTypes: true })

    return (
      await Promise.all(
        entries
          .filter((entry) => !entry.name.startsWith(".") && !excluded.includes(entry.name.toLowerCase()))
          .map(async (entry) => {
            const file = path.join(folder, entry.name)

            if (entry.isDirectory()) return walk(file)

            return entry.isFile() && path.extname(file).toLowerCase() === ".md"
              ? [path.relative(project.root, file).split(path.sep).join("/")]
              : []
          }),
      )
    ).flat()
  }

  return [
    ...new Set([
      ...project.documentFiles.filter((file) => path.extname(file).toLowerCase() === ".md"),
      ...(await Promise.all(project.documentRoots.map((root) => walk(path.join(project.root, root))))).flat(),
    ]),
  ]
}

function strip(project: Registered, text: string) {
  const body = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n")

  return project.profile === "vc5" ? body.replace(/<!-- WIKI:AUTO:BEGIN -->[\s\S]*?<!-- WIKI:AUTO:END -->/g, "") : body
}

function describe(project: Registered, file: string, text: string) {
  const body = strip(project, text)
  const group = file.startsWith("docs/") && file.split("/").length > 2 ? file.split("/")[1] : "navigation"
  const declaration = /<!--\s*wiki:\s*({[\s\S]*?})\s*-->/.exec(body.replace(/```[\s\S]*?```/g, ""))?.[1]

  const metadata =
    declaration && project.profile === "vc5"
      ? Schema.decodeUnknownOption(Schema.fromJsonString(Metadata))(declaration)
      : undefined

  const info = metadata?._tag === "Some" ? metadata.value : undefined

  return {
    project: project.id,
    projectName: project.name,
    path: file,
    title: /^#\s+(.+?)\s*#*\s*$/m.exec(body)?.[1] ?? path.basename(file, path.extname(file)),
    kind:
      info?.kind ??
      (project.plans.includes(file) || (project.profile === "vc5" && /\/plans\/|_Plan\.md$/i.test(file))
        ? "plan"
        : "guide"),
    status: info?.status ?? "",
    current: project.profile !== "vc5" || ["navigation", "shared", "vc5.1"].includes(group ?? ""),
    sha256: createHash("sha256").update(body).digest("hex"),
    excerpt: "",
  }
}
