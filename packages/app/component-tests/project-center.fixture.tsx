import type { ComposerNote } from "@opencode/plugin/gui"
import { ComposerEditor } from "../src/composer/editor/editor"
import { createComposerEditor } from "../src/composer/editor/interaction"
import { createMemoryComposerState } from "../src/composer/state"
import { buildPromptRequest } from "../src/composer/request"

/** Uses the production draft state, editor and request builder rather than an attachment-only spy. */
export function createProjectCenterDraft() {
  const drafts = { alpha: createMemoryComposerState(), beta: createMemoryComposerState() }

  const draft = (session: string) => {
    if (session === "alpha") return drafts.alpha

    if (session === "beta") return drafts.beta

    throw new Error("Unknown fixture session")
  }

  return {
    attach: (session: string, part: ComposerNote) => draft(session).context.add(part),
    notes: () =>
      Object.entries(drafts).flatMap(([session, value]) =>
        value.context.items().flatMap((part) => (part.type === "note" ? [{ session, part }] : [])),
      ),
    request: (session: string) =>
      buildPromptRequest({
        prompt: draft(session).current(),
        context: draft(session).context.items(),
        images: [],
        text: "",
        sessionDirectory: `/repo/${session}`,
      }),
    render: (props: { session: string; openSource(href: string): Promise<void> }) => {
      const editor = createComposerEditor({
        store: () => draft(props.session).store,
        commands: () => [],
        context: () => [],
        searchContextFiles: () => [],
        openContext: (key) => {
          const part = draft(props.session).context.items().find((part) => part.key === key)

          if (part?.type === "note" && part.href) void props.openSource(part.href)
        },
        view: {
          submit: { stopping: () => false, working: () => false, onSubmit() {}, onStop() {} },
        },
      })

      return (
        <section aria-label="Conversation draft" class="p-4 shrink-0">
          <ComposerEditor controller={editor} />
        </section>
      )
    },
  }
}
