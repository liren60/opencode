import { expect, test, type Page } from "@playwright/test"
import { draftHref, expectPath, holdRoute, NO_PROVIDER, project, REMOTE_SERVER, seed, sessionHref } from "../utils/app"
import { mockOpenCodeServer } from "../utils/mock-server"
import { fixture, mockStressTimeline } from "../utils/session-fixture"
import { mockRemoteServer, openSession } from "../utils/workspace"
import { APP_READY_TIMEOUT, expectAppVisible } from "../utils/waits"

test.use({ serviceWorkers: "block" })

test("project navigator groups chats, follows tabs, and creates a draft in the chosen project", async ({ page }) => {
  const otherDirectory = "C:/OpenCode/Other project"
  await openSession(page, {
    name: "Current project",
    projects: [
      project({ id: "proj_current_project", directory: "C:/OpenCode/Current project", name: "Current project" }),
      project({ id: "proj_other", directory: otherDirectory, name: "Other project" }),
    ],
    sessions: [
      { id: "ses_current", title: "Current chat" },
      { id: "ses_other", title: "Other chat", directory: otherDirectory, projectID: "proj_other" },
      { id: "ses_archived", title: "Archived chat", time: { created: 1, updated: 1, archived: 2 } },
    ],
    seed: {
      projects: { local: [{ worktree: "C:/OpenCode/Current project" }, { worktree: otherDirectory }] },
      tabs: ["ses_current", "ses_other"],
    },
  })
  const navigator = page.getByRole("navigation", { name: "Project navigator" })
  const current = navigator.getByRole("button", { name: "Current project", exact: true })
  const other = navigator.getByRole("button", { name: "Other project", exact: true })
  await expect(
    navigator.getByRole("button", { name: "Hide project navigator", exact: true }).locator("svg"),
  ).toHaveCount(1)
  await expect(
    navigator.getByRole("button", { name: "New session in Other project", exact: true }).locator("svg"),
  ).toHaveCount(1)
  await expect(current).toHaveAttribute("aria-current", "true")
  await expect(navigator.getByRole("link", { name: "Current chat", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )
  await expect(navigator.getByRole("link", { name: "Archived chat", exact: true })).toHaveCount(0)
  await other.click()
  await expect(other).toHaveAttribute("aria-expanded", "true")
  await expect(navigator.getByRole("link", { name: "Current chat", exact: true })).toBeVisible()
  await navigator.getByRole("link", { name: "Other chat", exact: true }).click()
  await expectPath(page, sessionHref("ses_other"))
  await expect(other).toHaveAttribute("aria-current", "true")
  await expect(current).not.toHaveAttribute("aria-current", "true")
  await page.locator('[data-slot="titlebar-tabs"] a').filter({ hasText: "Current chat" }).click()
  await expect(current).toHaveAttribute("aria-current", "true")
  await navigator.getByRole("button", { name: "New session in Other project", exact: true }).click()
  await expect(page).toHaveURL(/\/new-session\?draftId=/)
  await expect(other).toHaveAttribute("aria-current", "true")
  await expect(navigator.getByText(otherDirectory, { exact: true })).toBeVisible()
  await navigator.getByRole("button", { name: "Hide project navigator", exact: true }).click()
  await expect(current).toBeHidden()
  await page.reload()
  await page.getByRole("button", { name: "Show project navigator", exact: true }).click()
  await expect(other).toHaveAttribute("aria-current", "true")
})

test("closing a project hides its navigator row across retained session and draft tabs until explicitly reopened", async ({
  page,
}) => {
  const name = "Closing project"
  const directory = "C:/OpenCode/Closing project"
  const draftID = "draft_closed_project"
  const workspace = await openSession(page, {
    name,
    directory,
    sessions: [{ id: "ses_closed_project", title: "Retained chat" }],
    seed: { tabs: ["ses_closed_project", { draft: draftID, directory }] },
  })
  const navigator = page.getByRole("navigation", { name: "Project navigator" })
  const project = navigator.getByRole("button", { name, exact: true })
  await expect(project).toHaveAttribute("aria-current", "true")

  await page.getByRole("button", { name: "Settings", exact: true }).click()
  const settings = page.getByTestId("settings-screen")
  await settings.getByRole("tab", { name: "Projects", exact: true }).click()
  const card = settings.getByRole("listitem").filter({ has: page.getByRole("button", { name, exact: true }) })
  await card.getByRole("button", { name: "More options", exact: true }).click()
  await page.getByRole("menuitem", { name: "Close", exact: true }).click()
  await expect(card).toHaveCount(0)

  await settings.getByRole("button", { name: "Back to app", exact: true }).click()
  await expectPath(page, sessionHref("ses_closed_project"))
  await expect(workspace.editor).toBeEditable()
  await expect(project).toHaveCount(0)
  await expect(navigator.getByRole("link", { name: "Retained chat", exact: true })).toHaveCount(0)

  await page.locator(`[data-titlebar-tab-link][href="${draftHref(draftID)}"]`).click()
  await expectPath(page, draftHref(draftID))
  await expect(workspace.editor).toBeEditable()
  await expect(project).toHaveCount(0)
  await page.locator(`[data-titlebar-tab-link][href="${sessionHref("ses_closed_project")}"]`).click()
  await expectPath(page, sessionHref("ses_closed_project"))
  await expect(workspace.editor).toBeEditable()
  await expect(project).toHaveCount(0)

  await page.getByRole("button", { name: "Home", exact: true }).click()
  const closed = page.locator('[data-component="home-recently-closed-row"]').filter({ hasText: name })
  await expect(closed).toBeEnabled()
  await closed.click()
  await expect(project).toBeVisible()
  await expect(closed).toHaveCount(0)
  await expect(navigator.getByRole("link", { name: "Retained chat", exact: true })).toBeVisible()
})

const row = (page: Page, title: string) =>
  page.locator('[data-component="home-session-row"]').filter({ hasText: title })

for (const source of ["session menu", "another client"]) {
  test(`project navigator drops deleted chats from its cached index after deletion by ${source}`, async ({ page }) => {
    const workspace = await openSession(page, {
      name: "Deletion project",
      sessions: [
        { id: "ses_removed", title: "Removed chat", created: 2000 },
        { id: "ses_kept", title: "Kept chat", created: 1000 },
      ],
      sessionID: source === "session menu" ? "ses_removed" : "ses_kept",
      seed: { tabs: source === "session menu" ? ["ses_removed", "ses_kept"] : ["ses_kept"] },
    })
    const navigator = page.getByRole("navigation", { name: "Project navigator" })
    await expect(navigator.getByRole("link", { name: "Removed chat", exact: true })).toBeVisible()
    await expect(navigator.getByRole("link", { name: "Kept chat", exact: true })).toBeVisible()

    if (source === "session menu") {
      await page.locator("[data-session-title]").getByRole("button", { name: "More options", exact: true }).click()
      await page.getByRole("menuitem", { name: "Delete…", exact: true }).click()
      const removed = page.waitForResponse(
        (response) =>
          response.request().method() === "DELETE" && new URL(response.url()).pathname === "/api/session/ses_removed",
      )
      await page.getByRole("dialog").getByRole("button", { name: "Delete session", exact: true }).click()
      await removed
      await expectPath(page, sessionHref("ses_kept"))
      await expect(navigator.getByRole("link", { name: "Removed chat", exact: true })).toHaveCount(0)
    }

    workspace.sessions.splice(
      workspace.sessions.findIndex((session) => session.id === "ses_removed"),
      1,
    )
    workspace.sessions.find((session) => session.id === "ses_kept")!.title = "Kept chat updated"
    await workspace.push([
      {
        id: "evt_removed",
        created: Date.now(),
        durable: { aggregateID: "ses_removed", seq: 1, version: 2 },
        type: "session.deleted",
        data: { sessionID: "ses_removed" },
      },
      {
        id: "evt_kept_updated",
        created: Date.now(),
        durable: { aggregateID: "ses_kept", seq: 1, version: 1 },
        type: "session.execution.succeeded",
        data: { sessionID: "ses_kept" },
      },
    ])
    // The later update proves the deletion event was processed, not just queued.
    await expect(navigator.getByRole("link", { name: "Kept chat updated", exact: true })).toBeVisible()
    await expect(navigator.getByRole("link")).toHaveCount(1)
    await navigator.getByRole("link", { name: "Kept chat updated", exact: true }).click()
    await expectPath(page, sessionHref("ses_kept"))
    await expect(workspace.editor).toBeEditable()
  })
}

test("project navigator keeps the last conversation time when selected and refreshes after a conversation", async ({
  page,
}) => {
  const now = Date.parse("2026-01-07T12:00:00Z")
  const updated = now - 5 * 86_400_000
  await page.clock.install({ time: now })
  const workspace = await openSession(page, {
    name: "Dates project",
    sessions: [
      { id: "ses_other_dates", title: "Other dated chat", time: { created: updated, updated: now } },
      {
        id: "ses_dates",
        title: "Dated chat",
        time: { created: updated - 86_400_000, updated, idle: updated, viewed: updated },
      },
    ],
  })
  const chat = page
    .getByRole("navigation", { name: "Project navigator" })
    .getByRole("link", { name: "Dated chat", exact: true })
  await expect(chat.locator("time")).toHaveText("5d")
  await expect(chat.locator("time")).toHaveAttribute("datetime", "2026-01-02T12:00:00.000Z")
  // A fresh generic update (for example view bookkeeping) is not a new conversation.
  workspace.sessions[1].time.updated = now
  await chat.click()
  await expectPath(page, sessionHref("ses_dates"))
  await expect(workspace.editor).toBeEditable()
  await expect(chat).toHaveAttribute("aria-current", "page")
  await expect(chat.locator("time")).toHaveText("5d")
  await expect(chat.locator("time")).toHaveAttribute("datetime", "2026-01-02T12:00:00.000Z")
  await expect(
    page
      .getByRole("navigation", { name: "Project navigator" })
      .getByRole("link", { name: "Other dated chat", exact: true })
      .locator("time"),
  ).toHaveText("5d")
  Object.assign(workspace.sessions[1].time, { idle: now - 2 * 3_600_000, viewed: now - 2 * 3_600_000 })
  await workspace.push([
    {
      id: "evt_dates_updated",
      created: now,
      durable: { aggregateID: "ses_dates", seq: 1, version: 1 },
      type: "session.execution.succeeded",
      data: { sessionID: "ses_dates" },
    },
  ])
  await expect(chat.locator("time")).toHaveText("2h")
  await expect(chat.locator("time")).toHaveAttribute("datetime", "2026-01-07T10:00:00.000Z")
  await expect(chat.locator("time")).toHaveAttribute("title", /Last conversation .*2026/)
})

async function openHome(page: Page, input: Parameters<typeof mockStressTimeline>[1] = {}) {
  await mockStressTimeline(page, input)
  await seed(page, {
    projects: { local: [{ worktree: fixture.directory, expanded: true }] },
    lastProject: { local: fixture.directory },
  })
  await page.goto("/")
}

test("the session context menu renames, exports, and deletes a Home session", async ({ page }) => {
  await openHome(page)
  const target = row(page, fixture.expected.targetTitle)
  await expect(target).toBeVisible()

  await target.focus()
  await target.press("Shift+F10")
  await expect(page.getByRole("menuitem", { name: "Rename" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("menuitem", { name: "Rename" })).toBeHidden()
  await expect(target).toBeFocused()

  const box = await target.boundingBox()
  await target.click({ button: "right", position: { x: 48, y: 12 } })
  await expect(page).toHaveURL("/")
  await expect(page.getByRole("menuitem")).toHaveText(["Rename", "Export…", "Delete…"])
  const menu = await page.locator('[data-component="menu-v2-content"]').boundingBox()
  expect(Math.abs((menu?.x ?? 0) - (box?.x ?? 0) - 48)).toBeLessThan(4)

  await page.getByRole("menuitem", { name: "Rename" }).click()
  const title = page.locator('[data-component="home-session-rename"]')
  await expect(title).toBeFocused()
  await expect(title).toHaveValue(fixture.expected.targetTitle)
  await title.fill("Renamed from Home")

  const renamed = page.waitForRequest(
    (request) =>
      request.method() === "PATCH" && new URL(request.url()).pathname.endsWith(`/session/${fixture.targetID}`),
  )

  await title.press("Enter")
  expect((await renamed).postDataJSON()).toEqual({ title: "Renamed from Home" })
  const renamedRow = row(page, "Renamed from Home")
  await renamedRow.click()
  await expect(page).toHaveURL(new RegExp(`/session/${fixture.targetID}$`))
  await expect(page.locator('[data-slot="titlebar-tabs"] a').filter({ hasText: "Renamed from Home" })).toBeVisible()
  await page.getByRole("button", { name: "Home" }).click()
  await expect(page).toHaveURL("/")

  await renamedRow.click({ button: "right" })
  const download = page.waitForEvent("download")
  await page.getByRole("menuitem", { name: "Export…" }).click()
  expect((await download).suggestedFilename()).toBe("renamed-from-home.json")

  await renamedRow.click({ button: "right" })
  await page.getByRole("menuitem", { name: "Delete…" }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toContainText('Delete session "Renamed from Home"?')

  const removed = page.waitForRequest(
    (request) => request.method() === "DELETE" && new URL(request.url()).pathname.endsWith(`/${fixture.targetID}`),
  )

  await dialog.getByRole("button", { name: "Delete session" }).click()
  await removed
  await expect(renamedRow).toBeHidden()
})

test("the Home shortcut focuses session search, and the Home button leaves focus alone", async ({ page }) => {
  await mockStressTimeline(page)
  await seed(page, {
    projects: { local: [{ worktree: fixture.directory, expanded: true }] },
    lastProject: { local: fixture.directory },
    tabs: [fixture.sourceID],
  })
  await page.goto(sessionHref(fixture.sourceID))
  const editor = page.locator('[data-component="composer-editor"]')
  await expect(editor).toBeEditable({ timeout: APP_READY_TIMEOUT })
  await editor.click()

  await page.keyboard.press("ControlOrMeta+b")
  const search = page.getByRole("textbox", { name: /Search sessions/ })
  await expect(search).toBeFocused()
  await page.keyboard.type("jump")
  await expect(page.getByRole("option")).toHaveCount(1)
  await expect(page.getByRole("option")).toContainText(fixture.expected.targetTitle)

  await page.keyboard.press("ControlOrMeta+b")
  await expectPath(page, sessionHref(fixture.sourceID))

  await page.getByRole("button", { name: "Home", exact: true }).click()
  await expect(search).toHaveValue("")
  await expect(search).not.toBeFocused()
})

test("Home shows loaded sessions before the location request resolves", async ({ page }) => {
  const location = await holdRoute(page, (url) => url.pathname === "/api/location")
  await openHome(page)
  await expectAppVisible(row(page, fixture.expected.sourceTitle))
  location.release()
})

test("Home and the directory picker load without newer browser APIs", async ({ page }) => {
  await page.addInitScript(() => {
    // Safari 16.6 has none of these APIs. Remove them before the web entry runs.
    // SAFETY: `Partial` only makes the static method optional so `delete` type-checks; the target is the real global.
    delete (Map as Partial<typeof Map>).groupBy
    // SAFETY: as above, for the real global `Promise`.
    delete (Promise as Partial<typeof Promise>).withResolvers
    // SAFETY: as above, for the real global `Promise`.
    delete (Promise as Partial<typeof Promise>).try
  })
  await openHome(page, { fileList: () => [] })
  const target = row(page, fixture.expected.targetTitle)
  await expect(target).toBeVisible()

  await page.getByRole("button", { name: "Add project", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("button", { name: "Select folder", exact: true })).toBeEnabled()
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(target).toBeVisible()
})

test("adding a project to a signed-out server re-pairs it, then continues at the paired address", async ({ page }) => {
  // The saved address rejects the new token, so saving moves the server to the link's address.
  const paired = "http://127.0.0.1:4098"
  await mockRemoteServer(page, { name: "Remote", password: "old-password" })
  await mockOpenCodeServer(page, {
    server: paired,
    directory: "/remote/paired",
    project: project({ id: "proj_paired", directory: "/remote/paired" }),
    provider: NO_PROVIDER,
    sessions: [],
    pageMessages: () => ({ items: [] }),
    fileList: () => [],
    password: "session-token",
    pairing: { code: "one-time-code", token: "session-token" },
  })
  await openHome(page, { fileList: () => [] })
  const remote = page.locator("[data-home-row]").filter({ hasText: "Remote" })
  await expect(page.getByRole("button", { name: "Authenticate", exact: true })).toBeVisible()

  await remote.getByRole("button", { name: "Add project", exact: true }).click()
  const editor = page.getByRole("dialog", { name: "Edit server" })
  await editor.getByLabel("Pairing link", { exact: true }).fill(`${paired}/auth/connect/one-time-code`)
  await editor.getByRole("button", { name: "Save", exact: true }).click()

  // The folder picker reads the paired address; the removed one would reject the request.
  const picker = page.getByRole("dialog").filter({ has: page.getByRole("button", { name: "Select folder" }) })
  await expect(picker.getByRole("button", { name: "Select folder", exact: true })).toBeEnabled()
  await expect(picker.getByText("Unable to read this folder")).toHaveCount(0)
})

test("a server whose saved password changes works with the new password", async ({ page }) => {
  const accepted = { password: "old-password" }
  await mockOpenCodeServer(page, {
    server: REMOTE_SERVER,
    directory: "/remote/project",
    project: project({ id: "proj_remote", directory: "/remote/project" }),
    provider: NO_PROVIDER,
    sessions: [],
    pageMessages: () => ({ items: [] }),
    fileList: () => [],
    password: () => accepted.password,
  })
  // Saved with the password the server accepts until the test changes it.
  await seed(page, {
    storage: {
      "opencode.global.dat:server": {
        list: [{ type: "http", displayName: "Remote", http: { url: REMOTE_SERVER, password: "old-password" } }],
      },
    },
  })
  await openHome(page, { fileList: () => [] })
  const remote = page.locator("[data-home-row]").filter({ hasText: "Remote" })
  const picker = page.getByRole("dialog").filter({ has: page.getByRole("button", { name: "Select folder" }) })

  // Use the server once, so its controller exists with the old password.
  await remote.getByRole("button", { name: "Add project", exact: true }).click()
  await expect(picker.getByRole("button", { name: "Select folder", exact: true })).toBeEnabled()
  await picker.getByRole("button", { name: "Cancel", exact: true }).click()
  await expect(picker).toHaveCount(0)

  await remote.getByRole("button", { name: "More options", exact: true }).click()
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click()
  const editor = page.getByRole("dialog", { name: "Edit server" })
  await editor.getByPlaceholder("password").fill("new-password")
  // The server now rejects the old password, as after `opencode service set password`.
  accepted.password = "new-password"
  await editor.getByRole("button", { name: "Save", exact: true }).click()
  await expect(editor).toHaveCount(0)

  // The picker reads the folder through the server's controller, which must use the saved password now.
  await remote.getByRole("button", { name: "Add project", exact: true }).click()
  await expect(picker.getByRole("button", { name: "Select folder", exact: true })).toBeEnabled()
  await expect(picker.getByText("Unable to read this folder")).toHaveCount(0)
})

const recovery = "C:/OpenCode/Worktrees/project-menu-recovery"

const worktree =
  "C:/OpenCode/Worktrees/project-42/long-folder-name-for-checking-wrapped-worktree-paths/another-long-folder-name"

for (const state of [
  { name: "local", directory: fixture.directory, icon: "monitor" },
  { name: "worktree", directory: worktree, icon: "outline-worktree" },
  { name: "closed worktree", directory: recovery, icon: "outline-worktree", recovery: "closed" },
  { name: "unopened worktree", directory: recovery, icon: "outline-worktree", recovery: "unopened" },
]) {
  test(`the session project menu opens settings and Home for a ${state.name} project`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const workspace = state.directory !== fixture.directory
    const messages = Promise.withResolvers<void>()
    await mockStressTimeline(page, {
      directory: state.directory,
      // An image icon keeps the avatar initial out of the menu item text.
      project: {
        ...fixture.project,
        sandboxes: workspace ? [state.directory] : [],
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"/>')}`,
        },
      },
      sessions: fixture.sessions.map((item) => ({ ...item, directory: state.directory })),
      beforeMessagesResponse: (input) =>
        state.recovery && input.sessionID === fixture.targetID ? messages.promise : Promise.resolve(),
    })

    // An unopened project has no stored project list or tabs.
    if (state.recovery !== "unopened")
      await seed(page, {
        projects: { local: [{ worktree: fixture.directory, expanded: true }] },
        lastProject: { local: fixture.directory },
        tabs: [fixture.sourceID, fixture.targetID],
      })
    const name = fixture.project.name

    if (state.recovery === "closed") {
      await page.goto("/")
      const project = page.locator('[data-component="home-project-row"]').filter({ hasText: name })
      await project.locator("..").getByRole("button", { name: "More options", exact: true }).click()
      await page.getByRole("menuitem", { name: "Close", exact: true }).click()
      await expect(project).toHaveCount(0)
      await page.locator(`[data-titlebar-tab-link][href="${sessionHref(fixture.targetID)}"]`).click()
    }

    if (state.recovery !== "closed") await page.goto(sessionHref(fixture.targetID))

    const header = page.locator("[data-session-title]")
    const trigger = header.getByRole("button", { name, exact: true })
    const menu = page.getByRole("menu", { name, exact: true })
    const projectItem = menu.getByRole("menuitem", { name, exact: true })
    const pathItem = menu.getByRole("menuitem", { name: state.directory, exact: true })
    const settings = page.getByTestId("settings-screen")
    await expect(header.getByRole("heading")).toHaveText(fixture.expected.targetTitle)

    for (const loaded of state.recovery ? [false, true] : [true]) {
      if (state.recovery && loaded) {
        messages.resolve()
        await expect(header.getByRole("button", { name: "More options", exact: true })).toBeVisible()
      }

      await expect(trigger.locator("use")).toHaveAttribute("href", `#opencode-v2-icon-${state.icon}`)
      await trigger.click()
      await expect(menu.getByRole("menuitem")).toHaveText([name, state.directory, "Edit project"])
      await expect(pathItem).toBeDisabled()
      await page.keyboard.press("Escape")
      await expect(menu).toBeHidden()
      await expect(trigger).toBeFocused()
      await trigger.press("ArrowDown")
      await expect(projectItem).toBeFocused()
      await page.keyboard.press("ArrowDown")
      await expect(pathItem).toBeFocused()

      for (const key of ["Enter", "Space"]) {
        await page.keyboard.press(key)
        await expect(menu).toBeVisible()
        await expect(pathItem).toBeFocused()
      }

      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")
      await expect(settings.getByRole("textbox", { name: "Project name", exact: true })).toHaveValue(name)
      await settings.getByRole("button", { name: "Back to projects", exact: true }).click()
      await settings.getByRole("button", { name: "Back to app", exact: true }).click()
      await expect(settings).toBeHidden()
    }

    await trigger.click()
    await projectItem.click()
    await expect(page).toHaveURL(new URL("/", page.url()).href)
    const project = page.locator('[data-component="home-project-row"]').filter({ hasText: name })
    await expect(project).toHaveAttribute("data-selected", "")
    await expect(
      page.locator(`[data-component="home-session-row-container"][data-session-id="${fixture.targetID}"]`),
    ).toBeVisible()
  })
}

test("the project menu path arrow has a glyph when the page has an older icon sprite", async ({ page }) => {
  await mockStressTimeline(page)
  await seed(page, { projects: { local: [{ worktree: fixture.directory, expanded: true }] }, tabs: [fixture.targetID] })
  // A page cached before the arrow icon shipped carries a sprite without it.
  await page.route(
    (url) => url.pathname === sessionHref(fixture.targetID),
    async (route) => {
      const response = await route.fetch()
      await route.fulfill({
        response,
        body: (await response.text()).replace(
          '<div id="root"',
          '<svg id="opencode-v2-icon-sprite" width="0" height="0" aria-hidden="true"><symbol id="opencode-v2-icon-monitor" viewBox="0 0 16 16"><path d="M1 1h14v14H1z"/></symbol></svg><div id="root"',
        ),
      })
    },
  )
  await page.goto(sessionHref(fixture.targetID))
  const header = page.locator("[data-session-title]")
  await expect(header.getByRole("heading")).toHaveText(fixture.expected.targetTitle)
  await header.getByRole("button", { name: fixture.project.name, exact: true }).click()

  const arrow = page
    .getByRole("menu")
    .getByRole("menuitem", { name: fixture.directory, exact: true })
    .locator('[data-slot="session-project-open-icon"]')

  await expect(arrow).toHaveCount(1)
  await expect
    .poll(() => arrow.locator("svg").evaluate((element: SVGSVGElement) => element.getBBox().width))
    .toBeGreaterThan(0)
  await expect(page.locator("#opencode-v2-icon-sprite")).toHaveCount(1)
})
