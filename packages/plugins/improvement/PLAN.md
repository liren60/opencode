# Continuous improvement development plan

## Goal

Build an opt-in, reviewable feedback → memory → verification → evaluation loop for OpenCode V2. Reuse plugin APIs; do not change model weights, global instructions, public HTTP contracts, or execution authority.

## Current delivery status

- Phase 1 implementation and usage documentation are present; the plugin remains disabled by default and has not been enabled in this checkout.
- 19 model regression tests and 4 real-host integration tests pass, including 10 consecutive repetitions of each suite (230 executions, no failures).
- Plugin and Core focused type checks pass with both Bun and the official package `typecheck:tsc` scripts. Formatting and focused lint pass.
- Root `bun run check` is blocked by the local Node runtime rejecting the repository's TypeScript lint plugin. Running Oxlint with Bun completes with no errors (existing repository warnings); the other lint steps complete.
- Separate root type checking stops at the existing `packages/app/src/custom-elements.d.ts` symlink placeholder, whose contents are a relative path rather than TypeScript. No unrelated app files were changed to bypass this issue.
- Real model baseline/candidate evaluations, visual UI, skill drafting and OS isolation are not part of this completed batch.

## Phase 1 — independently installable MVP

1. **Feedback memory:** propose a bounded note linked to an actual user message; keep it pending until approval. Support activation, rejection, suspension and deletion. Load only approved notes, scoped to the current project, with a bounded context budget.
2. **Task verification:** declare checks before execution. A verification tool delegates to the existing Shell executor (including its permissions), records its structured result, and derives passed / failed / unverified / stale status. Never accept an exit code supplied by the model.
3. **Evaluation:** configure a fixed case suite. Label baseline and candidate tasks; collect user-approved outcome feedback with a frozen verification report. Compare only complete, matching suites without duplicate cases. Report verification rate, acceptance rate and elapsed verification time; do not invent cost or quality scores.
4. **Delivery:** package documentation, regression tests and host integration tests. Keep the plugin disabled unless explicitly configured.

### Acceptance criteria

- A pending or suspended memory is never injected into model context.
- Memory changes and outcome feedback request approval, even if ordinary tools are allowed. Configured denies remain final.
- Project namespaces cannot read each other's records; session tasks cannot use another session's task.
- A check is passed only after a completed Shell result with exit 0, no timeout and no signal.
- Missing, running and unrecognized results remain unverified. Observed edits invalidate earlier evidence.
- Verification exceptions propagate; an interrupted or failed attempt cannot leave an earlier success as the latest evidence.
- Missing, duplicate or changed evaluation cases suppress comparison deltas.
- Data remains in local plugin storage; no automatic telemetry, external services or writes to AGENTS.md.

### Explicit MVP limits

- Memory extraction is agent-proposed, not a background learner; approval is the existing permission workflow, not an independent identity system.
- Checks establish the success of declared commands, not the semantic correctness of a whole task. Weak checks such as `echo ok` are not meaningful acceptance tests.
- Edit invalidation tracks built-in edit/write/patch calls and explicit invalidation. External editors, arbitrary Shell mutations and other tools require explicit invalidation or re-verification. This is not a filesystem transaction or sandbox.
- Verification is foreground-only. Backgrounded commands are unverified; no polling or fabricated completion.
- Unit/host regression tests validate this loop. They are not evidence that a model's coding quality improved; that requires real baseline/candidate case runs.

## Phase 2 — experience reuse and visibility

- Generate skill drafts from repeated successful work, review before enabling.
- UI for memory, evidence, effective rule sources and context budget.
- Task-local checklist integration and required-check enforcement after an explicit product decision.
- Better edit attribution, rollback conflict previews, retention/export controls.

## Phase 3 — broader autonomy, separately approved

- OS-enforced filesystem/network isolation on Windows, Linux and macOS, with allow/block tests.
- Multi-task observability and budgets.
- Repository-map/context selection and model routing, chosen using measured evaluations.

Do not raise autonomy before technical isolation is verified. Permission presets must never be described as an OS sandbox.
