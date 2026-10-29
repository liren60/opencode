import { expect, sourceURL, story } from "../../stories/playwright/story"
import type { ComposerNote } from "@opencode/plugin/gui"

// Migrated from Renicode's pre-alignment project-center component keeper, retaining its production draft boundary.
const modules = {
  fixture: sourceURL(new URL("../../gui-plugins/src/project-center/page.fixture.tsx", import.meta.url)),
  language: sourceURL(new URL("../src/runtime/i18n/language.tsx", import.meta.url)),
  draft: sourceURL(new URL("./project-center.fixture.tsx", import.meta.url)),
  ui: sourceURL(new URL("../src/runtime/plugin/ui.tsx", import.meta.url)),
}

declare global {
  interface Window {
    projectCenterFixture: {
      load(): void
      hold(): void
      release(): void
      switchSession(): void
      suspend(): void
      resume(): void
      editSource(): void
      images(): void
      holdAssets(): void
      releaseAssets(): void
      assets(): { project: string; path: string; aborted: boolean }[]
      restore(): void
      openSource(href: string): Promise<void>
      chinese(): Promise<void>
      notes(): { session: string; part: ComposerNote }[]
      request(): { text: string; comments: { comment: string }[] }
      calls(): { reads: number; catalogs: number }
      unmount(): void
    }
  }
}

story.beforeEach(async ({ mount, page }) => {
  await mount("ui-line-comment--editor")
  await page.evaluate(async (modules) => {
    const [{ mountProjectCenter }, { LanguageProvider, UiI18nBridge }, { createProjectCenterDraft }, { ui }] = await Promise.all([
      import(modules.fixture),
      import(modules.language),
      import(modules.draft),
      import(modules.ui),
    ])

    window.projectCenterFixture = mountProjectCenter({ ui, LanguageProvider, UiI18nBridge, draft: createProjectCenterDraft() })
  }, modules)
})

story("project center waits for desktop storage and attaches a fingerprinted reference to the current draft", async ({ page }) => {
  const root = page.getByTestId("project-center-fixture")
  expect(await page.evaluate(() => window.projectCenterFixture.calls())).toEqual({ reads: 0, catalogs: 0 })
  await page.evaluate(() => window.projectCenterFixture.load())
  await root.getByRole("button", { name: "alpha guide" }).click()
  await expect(root.getByRole("heading", { name: "alpha guide" })).toBeVisible()
  await root.getByRole("button", { name: "Cite document in conversation", exact: true }).click()
  const draft = root.getByRole("region", { name: "Conversation draft" })
  const reference = draft.getByText("alpha guide", { exact: true })
  await expect(reference).toBeVisible()
  await expect(draft.getByRole("button", { name: "Send", exact: true })).toBeEnabled()
  const notes = await page.evaluate(() => window.projectCenterFixture.notes())
  expect(notes).toHaveLength(1)
  expect(notes[0]?.session).toBe("alpha")
  expect(notes[0]?.part.href).toBe(`reni-wiki://document/alpha/docs/README.md?sha256=${"a".repeat(64)}`)
  expect(JSON.parse(notes[0]?.part.subject ?? "")).toMatchObject({
    source: { sha256: "a".repeat(64) },
    quote: expect.stringContaining("alpha source content"),
  })
  await expect(root.getByText("Source attached to the current draft. Review it and send when ready.")).toBeVisible()
  const request = await page.evaluate(() => window.projectCenterFixture.request())
  expect(request.comments).toHaveLength(1)
  expect(request.text).toContain("alpha source content")
  await root.getByRole("region", { name: "Project Center", exact: true }).getByRole("button", { name: "alpha guide" }).click()

  const match = root.getByText(
    "The reference snapshot matches the last-read source. Refresh sources to check for changes on disk.",
    { exact: true },
  )

  await expect(match).toHaveCount(0)
  await reference.click()
  await expect(match).toBeVisible()
})

story("reference freshness follows the opened snapshot, survives restore, and never rewrites existing quotes", async ({ page }) => {
  const root = page.getByTestId("project-center-fixture")

  const match = root.getByText(
    "The reference snapshot matches the last-read source. Refresh sources to check for changes on disk.",
    { exact: true },
  )

  const changed = root.getByRole("alert").filter({ hasText: "The reference snapshot differs from the last-read source." })
  await page.evaluate(() => window.projectCenterFixture.load())
  await root.getByRole("button", { name: "alpha guide" }).click()
  await expect(root.getByRole("heading", { name: "alpha guide" })).toBeVisible()
  await root.getByRole("button", { name: "Cite document in conversation", exact: true }).click()
  await expect(match).toBeVisible()
  const original = await page.evaluate(() => window.projectCenterFixture.notes())
  await page.evaluate(() => window.projectCenterFixture.editSource())
  await root.getByRole("button", { name: "Refresh sources", exact: true }).click()
  await expect(changed).toBeVisible()
  await expect(root.getByText("alpha source content updated", { exact: true })).toBeVisible()
  await page.evaluate(() => window.projectCenterFixture.restore())
  await expect(changed).toBeVisible()
  await page.evaluate(() => window.projectCenterFixture.suspend())
  await expect(changed).toHaveCount(0)
  await expect(root.getByText("The source is loading or unavailable. The reference snapshot cannot be checked yet.", { exact: true })).toBeVisible()
  await page.evaluate(() => window.projectCenterFixture.resume())
  await expect(changed).toBeVisible()
  expect(await page.evaluate(() => window.projectCenterFixture.notes())).toEqual(original)
  await root.getByRole("button", { name: "Cite document in conversation", exact: true }).click()
  await expect(match).toBeVisible()
  await root.getByRole("region", { name: "Project Center", exact: true }).getByRole("button", { name: "alpha guide" }).click()
  await expect(match).toHaveCount(0)
  await page.evaluate(() => {
    const note = window.projectCenterFixture.notes()[0]?.part

    if (!note?.href) throw new Error("Missing reference link")

    return window.projectCenterFixture.openSource(note.href)
  })
  await expect(changed).toBeVisible()
  await expect(changed.getByText("a".repeat(64), { exact: true })).toBeVisible()
  expect(await page.evaluate(() => window.projectCenterFixture.notes()[0])).toEqual(original[0])
  await page.evaluate(() => window.projectCenterFixture.openSource("reni-wiki://document/alpha/docs/README.md"))
  await expect(root.getByText(
    "This older reference link has no snapshot fingerprint. Its source can be read, but a match cannot be verified.",
    { exact: true },
  )).toBeVisible()
  await expect(changed).toHaveCount(0)
  await expect(match).toHaveCount(0)
})

story("simplified Chinese copy retains source identity and plural document counts", async ({ page }) => {
  const root = page.getByTestId("project-center-fixture")
  await page.evaluate(async () => {
    await window.projectCenterFixture.chinese()
    window.projectCenterFixture.load()
  })
  await expect(root.getByRole("region", { name: "项目中心" })).toBeVisible()
  await expect(root.getByText("1 篇文档", { exact: true })).toBeVisible()
  await root.getByRole("combobox").selectOption("all")
  await expect(root.getByText("2 篇文档", { exact: true })).toBeVisible()
  await root.getByRole("button", { name: "alpha guide" }).click()
  await expect(root.getByText("来源：alpha / docs/README.md", { exact: true })).toBeVisible()
  await root.getByRole("button", { name: "在对话中引用文档", exact: true }).click()
  await expect(root.getByText("来源已附加到当前草稿。请检查引用，确认后再发送。", { exact: true })).toBeVisible()
  await page.evaluate(() => window.projectCenterFixture.editSource())
  await root.getByRole("button", { name: "刷新来源", exact: true }).click()
  await expect(root.getByRole("alert").filter({ hasText: "引用快照与最近读取的原文不一致。" })).toBeVisible()
  expect(await page.evaluate(() => window.projectCenterFixture.notes())).toHaveLength(1)
})

story("a late source read cannot cross session bindings, and reader suspension preserves the document without allowing citation", async ({ page }) => {
  const root = page.getByTestId("project-center-fixture")
  await page.evaluate(() => {
    window.projectCenterFixture.load()
    window.projectCenterFixture.hold()
  })
  await root.getByRole("button", { name: "alpha guide" }).click()
  await expect.poll(() => page.evaluate(() => window.projectCenterFixture.calls().reads)).toBe(1)
  await page.evaluate(() => window.projectCenterFixture.switchSession())
  await root.getByRole("button", { name: "beta guide" }).click()
  await expect.poll(() => page.evaluate(() => window.projectCenterFixture.calls().reads)).toBe(2)
  await page.evaluate(() => window.projectCenterFixture.release())
  await expect(root.getByRole("heading", { name: "beta guide" })).toBeVisible()
  await expect(root.getByRole("heading", { name: "alpha guide" })).toHaveCount(0)
  await page.evaluate(() => window.projectCenterFixture.suspend())
  await expect(root.getByRole("heading", { name: "beta guide" })).toBeVisible()
  await expect(root.getByRole("button", { name: "Cite document in conversation", exact: true })).toBeDisabled()
  await page.evaluate(() => window.projectCenterFixture.resume())
  await expect(root.getByRole("button", { name: "Cite document in conversation", exact: true })).toBeEnabled()
  await root.getByRole("button", { name: "Cite document in conversation", exact: true }).click()
  expect(await page.evaluate(() => window.projectCenterFixture.notes().map((note) => note.session))).toEqual(["beta"])
})

// Owns plugin Markdown source integration; session-ui's image tests do not exercise the SDK host or reader scope.
story("Markdown assets stay scoped to their document and late image replies cannot cross sources", async ({ page }) => {
  const root = page.getByTestId("project-center-fixture")
  await page.evaluate(() => {
    window.projectCenterFixture.images()
    window.projectCenterFixture.load()
  })
  await root.getByRole("button", { name: "alpha guide alpha / docs/README.md", exact: true }).click()
  const image = root.getByRole("button", { name: "Shared chart", exact: true })
  await expect(image).toHaveJSProperty("naturalWidth", 1)
  await page.evaluate(() => {
    window.projectCenterFixture.holdAssets()
    window.projectCenterFixture.editSource()
  })
  await root.getByRole("button", { name: "Refresh sources", exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.projectCenterFixture.assets().length)).toBe(2)
  await root.getByRole("combobox").selectOption("all")
  await root.getByRole("button", { name: "beta guide beta / docs/README.md", exact: true }).click()
  await expect(root.getByRole("heading", { name: "beta guide", exact: true })).toBeVisible()
  await expect(image).toHaveJSProperty("naturalWidth", 2)
  expect(await page.evaluate(() => window.projectCenterFixture.assets())).toEqual([
    { project: "alpha", path: "docs/chart.svg", aborted: true },
    { project: "alpha", path: "docs/chart.svg", aborted: true },
    { project: "beta", path: "docs/chart.svg", aborted: false },
  ])
  const source = await image.getAttribute("src")
  await page.evaluate(() => window.projectCenterFixture.releaseAssets())
  await expect(image).toHaveAttribute("src", source ?? "")
  await expect(image).toHaveJSProperty("naturalWidth", 2)
  await root.getByRole("link", { name: "Related guide", exact: true }).click()
  await expect(root.getByRole("heading", { name: "beta related guide", exact: true })).toBeVisible()
  await expect(image).toHaveJSProperty("naturalWidth", 2)
})
