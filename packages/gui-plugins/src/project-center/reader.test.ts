import { expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { createReader } from "./reader"

async function fixture() {
  const folder = await mkdtemp(
    path.join(
      process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Temp", "opencode") : tmpdir(),
      "project-center-",
    ),
  )

  const registry = path.join(folder, "center", "web", "wiki-projects.json")
  await Promise.all([
    mkdir(path.dirname(registry), { recursive: true }),
    mkdir(path.join(folder, "repo", "docs", "vc5.1", "plans"), { recursive: true }),
    mkdir(path.join(folder, "repo", "docs", "archive"), { recursive: true }),
    mkdir(path.join(folder, "other", "docs"), { recursive: true }),
  ])

  const projects = [
    {
      id: "vc5",
      name: "VC5",
      repository: "../repo",
      legacy: false,
      profile: "vc5",
      documentRoots: ["docs"],
      documentFiles: ["README.md"],
      entry: "README.md",
      plans: ["docs/vc5.1/plans/Plan.md"],
    },
    {
      id: "other",
      name: "Other",
      repository: "../other",
      legacy: false,
      documentRoots: ["docs"],
      documentFiles: [],
      entry: "docs/README.md",
      plans: [],
    },
  ]

  await Promise.all([
    writeFile(registry, JSON.stringify({ version: 1, defaultProject: "vc5", projects })),
    writeFile(path.join(folder, "repo", "README.md"), "# VC5 home\n"),
    writeFile(
      path.join(folder, "repo", "docs", "vc5.1", "Guide.md"),
      "# Guide\nCurrent assembly advice\n<!-- WIKI:AUTO:BEGIN -->\ngenerated\n<!-- WIKI:AUTO:END -->\n",
    ),
    writeFile(
      path.join(folder, "repo", "docs", "vc5.1", "plans", "Plan.md"),
      '# Plan\n<!-- wiki: {"kind":"plan","status":"Pending acceptance"} -->\nassembly plan\n',
    ),
    writeFile(path.join(folder, "repo", "docs", "archive", "Old.md"), "# Old\nDeprecated assembly advice\n"),
    writeFile(path.join(folder, "other", "docs", "README.md"), "# Other home\nassembly reference\n"),
    writeFile(path.join(folder, "repo", "secret.md"), "secret"),
  ])

  return {
    folder,
    registry,
    projects,
    reader: createReader(),
    caller: { window: 1, signal: new AbortController().signal },
    input: {
      registry,
      directory: path.join(folder, "repo", "docs"),
      worktree: "",
      project: "",
      query: "",
      history: false,
      plans: false,
    },
    [Symbol.asyncDispose]: () => rm(folder, { recursive: true, force: true }),
  }
}

test("catalog binds the current repository, isolates search, and only includes historical VC5 text explicitly", async () => {
  await using f = await fixture()
  const current = await f.reader.catalog({ ...f.input, query: "assembly" }, f.caller)
  expect(current.binding).toBe("vc5")
  expect(current.documents.map((doc) => doc.path).sort()).toEqual(["docs/vc5.1/Guide.md", "docs/vc5.1/plans/Plan.md"])
  const all = await f.reader.catalog({ ...f.input, project: "all", query: "assembly", history: true }, f.caller)
  expect(all.total).toBe(4)
  expect(all.documents.find((doc) => doc.path === "docs/archive/Old.md")?.current).toBe(false)
  const plans = await f.reader.catalog({ ...f.input, plans: true }, f.caller)
  expect(plans.documents.map((doc) => [doc.kind, doc.status])).toEqual([["plan", "Pending acceptance"]])
})

test("unmatched and remote directories do not silently use the registry's default project; worktrees can bind through their listed root", async () => {
  await using f = await fixture()
  const unbound = await f.reader.catalog({ ...f.input, directory: "", worktree: "" }, f.caller)
  expect(unbound.binding).toBe("")
  expect(unbound.documents).toEqual([])

  const worktree = await f.reader.catalog(
    { ...f.input, directory: path.join(f.folder, "sandbox"), worktree: path.join(f.folder, "repo") },
    f.caller,
  )

  expect(worktree.binding).toBe("vc5")
  expect(worktree.projects[0]?.root).toBe(path.join(f.folder, "repo"))
})

test("source reads preserve repository files, strip generated VC5 navigation, and refresh fingerprints after edits", async () => {
  await using f = await fixture()
  const input = { registry: f.registry, project: "vc5", path: "docs/vc5.1/Guide.md" }
  const before = await f.reader.read(input, f.caller)
  expect(before.text).not.toContain("generated")
  expect(await readFile(path.join(f.folder, "repo", input.path), "utf8")).toContain("generated")
  await writeFile(path.join(f.folder, "repo", input.path), "# Updated\nnew fact\n")
  const after = await f.reader.read(input, f.caller)
  expect(after.document.title).toBe("Updated")
  expect(after.document.sha256).not.toBe(before.document.sha256)
})

test("document reads reject traversal, hidden and build paths, unknown projects, and files outside the allowlist", async () => {
  await using f = await fixture()
  await Promise.all(
    [
      "../secret.md",
      "docs/../secret.md",
      "docs\\vc5.1\\Guide.md",
      "docs/.git/config.md",
      "docs/node_modules/file.md",
      "secret.md",
      "C:/secret.md",
    ].map(async (value) => {
      await expect(
        Promise.resolve(f.reader.read({ registry: f.registry, project: "vc5", path: value }, f.caller)),
      ).rejects.toThrow()
    }),
  )
  await expect(
    Promise.resolve(f.reader.read({ registry: f.registry, project: "missing", path: "README.md" }, f.caller)),
  ).rejects.toThrow("Unknown project")
})

test("Windows junctions and linked ancestors cannot expose external files or be searched", async () => {
  await using f = await fixture()
  await symlink(
    path.join(f.folder, "other", "docs"),
    path.join(f.folder, "repo", "docs", "linked"),
    process.platform === "win32" ? "junction" : "dir",
  )
  await expect(
    Promise.resolve(f.reader.read({ registry: f.registry, project: "vc5", path: "docs/linked/README.md" }, f.caller)),
  ).rejects.toThrow()
  const catalog = await f.reader.catalog(f.input, f.caller)
  expect(catalog.documents.some((doc) => doc.path.includes("linked"))).toBe(false)
})

test("attachments allow only registered image/PDF files, never executables or arbitrary workspace files", async () => {
  await using f = await fixture()
  await Promise.all([
    writeFile(path.join(f.folder, "repo", "docs", "test.png"), new Uint8Array([1, 2, 3])),
    writeFile(path.join(f.folder, "repo", "docs", "unsafe.exe"), "not executable"),
  ])
  const source = { registry: f.registry, project: "vc5", path: "docs/test.png" }
  expect(await f.reader.asset(source, f.caller)).toEqual({ mime: "image/png", data: "AQID" })
  expect(await f.reader.attachment(source, f.caller)).toContain("/docs/test.png")
  await expect(Promise.resolve(f.reader.attachment({ ...source, path: "docs/unsafe.exe" }, f.caller))).rejects.toThrow()
})

test("registry validation rejects duplicate ids and entries outside the document allowlist", async () => {
  await using f = await fixture()
  await writeFile(
    f.registry,
    JSON.stringify({ version: 1, defaultProject: "vc5", projects: [f.projects[0], f.projects[0]] }),
  )
  await expect(Promise.resolve(f.reader.catalog(f.input, f.caller))).rejects.toThrow()
  await writeFile(
    f.registry,
    JSON.stringify({ version: 1, defaultProject: "vc5", projects: [{ ...f.projects[0], entry: "secret.md" }] }),
  )
  await expect(Promise.resolve(f.reader.catalog(f.input, f.caller))).rejects.toThrow()
})
