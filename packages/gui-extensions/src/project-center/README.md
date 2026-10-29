# Project Center

Built-in Renicode GUI extension for a read-only documentation workflow. It reads the existing Project Center registry directly from the desktop main process; no Python runtime, Wiki HTTP server, model call, or repository write is involved.

## Use

1. Open a session, then choose **Project Center** from the side panel's **+** menu or run **Open Project Center** in the command palette.
2. **Follow current project** associates the local session directory (or its listed worktree root) with the closest registered repository. The reader always shows the registered repository's documents, not a sandbox's uncommitted copy. Unmatched sessions stay unbound; they never silently fall back to VC5.
3. Select another project or **All registered projects** explicitly for cross-project browsing. Remote sessions require an explicit local project selection.
4. Submit a search for title/content matching; use **Plans only** or explicitly include historical/unverified VC5 documents. Results are bounded to 80 documents and excerpts; document content is loaded separately for reading.
5. **Cite document in conversation** attaches a quoted source to the current draft; it does not send it. Large documents require **Cite selected text** (up to 12,000 characters). Every reference includes its source path, fingerprint, historical qualification, and a stable `reni-wiki://document/...` link. Click its draft/message chip to return to the source.
6. **Refresh sources** rereads disk. A document edited since citation has a different fingerprint; the quoted draft/message remains the original snapshot.

Citation notes include the selected citation action as their comment, so the composer displays them and includes their quoted subject in the request. Older versions attached notes with an empty comment; those notes remain unchanged and invisible. After updating, cite the source again to create a visible reference.

## Reference freshness

New citation links include the quoted document's SHA-256 fingerprint (`?sha256=...`). The reader compares the reference being viewed with the last-read source and shows a match, a difference, or an unchecked state while reading is pending/unavailable. It shows both fingerprints; existing quoted text is never rewritten. Refresh explicitly to check disk changes: there is no file watcher or automatic scan.

The latest citation made in the reader becomes its comparison target. Clicking a different draft/message reference restores that reference's fingerprint, including after a panel restore. Choosing a document from the source list clears the comparison target. Older links without a fingerprint still open, but explicitly say their snapshot cannot be verified; they are not silently marked as matching.

## Registration

**Settings → Project Center** accepts an absolute path to `wiki-projects.json`. Empty discovers `~/Downloads/PG/Reni_ProjectCenter/web/wiki-projects.json`. Repository paths keep the original rule: relative to the folder above the registry's `web` directory. The registry stays outside the A/B installation slots.

Version 1 standalone registries (`legacy: false`) are supported. Entries and plans must be within `documentRoots`/`documentFiles`. Hidden, dependency/build directories, traversal, linked files, and Windows junctions (including linked ancestors) are rejected. Only Markdown and registered image/PDF attachments are exposed. Markdown is bounded to 4 MB, embedded attachments to 20 MB.

VC5 current-source eligibility remains `navigation`, `shared`, and `vc5.1`; historical/unverified sources need an explicit search opt-in and retain a warning when opened or cited. Generated VC5 navigation is excluded from the reading text/fingerprint. Declared plan status is not independently verified. This version provides original plan entry points, not a second progress/acceptance database, taxonomy editor, automatic knowledge extraction, or an AI retrieval tool.

The desktop IPC provider is optional. On web or while it is unavailable, the panel explains the limitation. Existing sources survive provider suspension; citation is disabled until the reader returns. Session storage is loaded before requests, and source requests are cancelled/ignored on identity changes.

Simplified Chinese copy is provided through the extension's lazy-loaded `zh` catalog. Other languages, including Traditional Chinese, retain the SDK's English fallback. Review sources and terminology decisions are recorded in `i18n/REVIEW.md`; repository names, paths, document content, and declared statuses are not translated.

## Verification

- `reader.test.ts`: real filesystem IPC implementation, allowlists, junctions, project/worktree association, historical filtering, fingerprints, and attachment types.
- `source.test.ts`: stable and Markdown source links, optional snapshot fingerprints, older-link compatibility, invalid encodings, and quoted citation metadata.
- `packages/app/component-tests/project-center.spec.ts`: production reader and renderer link handler with held IPC/session storage, plus the production draft state, composer editor and request builder; visible/clickable citations, quoted request content, snapshot differences/restoration, unchanged quotes, Chinese copy/counts, late reads across session switches, and provider suspension.
- Existing `extension-*.spec.ts` suites own host lifecycle and built-in composition contracts.
