# Continuous improvement

An experimental, opt-in OpenCode V2 plugin for **reviewed project memory → real verification evidence → fixed-case comparison**. It does not train model weights, rewrite `AGENTS.md`, raise permissions or run background learning.

The staged development plan and acceptance criteria are in [PLAN.md](PLAN.md).

## Enable locally

From this repository's root, add the package to a project `opencode.jsonc`, preserving existing settings:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["./packages/plugins/improvement"],
}
```

Paths are relative to the configuration file. If using `.opencode/opencode.jsonc`, use `../packages/plugins/improvement`. This package exports TypeScript directly and needs no build step. It is not loaded just because it exists in the repository; no installation command for an unpublished Git revision is implied here.

Config changes reload automatically. Remove this plugin entry to unload it; do not restart the service. Unloading removes its tools and context hooks but retains stored records. Approval remains governed by existing permission rules: explicit denies are respected, and memory decisions and task feedback always request review unless denied.

## Memory workflow

Ask the agent to remember an explicit correction. It must cite an actual user message ID and an exact quote from that message:

```ts
const note = await tools.improvement.memory_propose({
  content: "Keep answers concise.",
  messageID: "msg_actual_user_message_id",
  quote: "keep your answers concise",
})
return note
```

The note is initially `pending`. The agent can request activation, but the user must review the content and source in the permission request:

```ts
return await tools.improvement.memory_review({ id: "returned-note-id", decision: "activate" })
```

- `memory_list({})` includes all note states in the current project.
- `memory_review` accepts `activate`, `reject`, `suspend`, or `forget`.
- Only `active` notes enter the next primary model context. Up to 20 notes and 8,000 content characters are included, newest first, with an omitted count.
- An exact quote proves provenance, not that the proposed paraphrase is correct. Review the meaning before approving.
- Suspending or forgetting stops future recall; it cannot remove text already sent to a model or erase the original user message.

## Task verification

Declare meaningful checks, implement the change, and then run every check. Examples below are Code Mode snippets, not commands for an external JavaScript interpreter:

```ts
return await tools.improvement.task_start({
  objective: "Fix the parser regression",
  variant: "candidate",
  checks: [
    { id: "regression", command: "bun test test/parser.test.ts", workdir: "packages/example" },
    { id: "types", command: "bun typecheck", workdir: "packages/example" },
  ],
})
```

Use the returned task ID, and check the report before claiming verification:

```ts
await tools.improvement.verify({ taskID: "returned-task-id", checkID: "regression" })
await tools.improvement.verify({ taskID: "returned-task-id", checkID: "types" })
return await tools.improvement.task_report({ taskID: "returned-task-id" })
```

| Status       | Meaning                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `passed`     | All declared checks have current, completed Shell results with exit 0, no timeout and no signal. |
| `failed`     | A current completed check failed, timed out or was signalled.                                    |
| `unverified` | A check has no recognized completion, or its latest attempt was rejected/interrupted.            |
| `stale`      | An observed edit occurred after an attempt began. Rerun the checks.                              |

`verify` accepts no replacement command or model-supplied exit code. It delegates to the existing Shell executor, including Shell permission checks, and preserves its output. Missing Shell tools and rejected/interrupted retries do not reuse a previous success. Tasks belong to the session that created them.

Built-in `edit`, `write` and `patch` calls invalidate project evidence before and after execution, conservatively including unsuccessful edits. After an external editor, a file-changing Shell command or another mutation tool, explicitly invalidate:

```ts
return await tools.improvement.invalidate({})
```

This is command evidence, not an enforced completion gate or proof of semantic correctness. Choose checks that actually exercise the requirement; `echo ok` cannot validate a code change. Backgrounded commands remain unverified. There is no filesystem watcher, OS sandbox, automatic rollback or cost accounting in this version.

## Fixed-case evaluation

Configure a suite before starting either variant. Each case has a unique ID, a fixed objective and 1–20 checks; a suite supports up to 50 cases:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": [
    {
      "package": "./packages/plugins/improvement",
      "options": {
        "cases": [
          {
            "id": "parser-regression",
            "objective": "Fix the parser regression without changing its public API",
            "checks": [
              {
                "id": "test",
                "command": "bun test test/parser.test.ts",
                "workdir": "packages/example",
              },
            ],
          },
        ],
      },
    },
  ],
}
```

Run the same cases from equivalent starting states, using distinct labels such as `baseline-1` and `candidate-1`. Keep model, environment and check semantics comparable. Case tasks cannot override the configured objective or checks:

```ts
return await tools.improvement.task_start({ caseID: "parser-regression", variant: "baseline-1" })
```

After verification, request user review of the actual outcome. Feedback stores a snapshot of verification status and elapsed completed-attempt time, independently of the outcome:

```ts
return await tools.improvement.feedback({
  taskID: "returned-task-id",
  outcome: "accepted", // or "rework", "rejected"
  note: "Regression reproduced and fixed; API unchanged.",
})
```

Only approved feedback counts. A later approved feedback call replaces the previous feedback for that task. A second task for the same case/variant is a duplicate, not a replacement; use fresh variant labels for a new experiment.

```ts
return await tools.improvement.evaluate({ baseline: "baseline-1", candidate: "candidate-1" })
```

The result lists missing, duplicate and suite-mismatched runs. Only complete matching suites expose candidate-minus-baseline deltas for verified and accepted rates. Verification elapsed time is also reported, but model latency, token cost and quality scores are not fabricated. This is a descriptive small-sample comparison, not evidence of general model improvement; the plugin does not automatically execute the cases or prove equivalent starting states.

## Storage and privacy

Records use OpenCode's local durable plugin storage, further separated by a hash of the canonical project path. Worktrees of the same project share memory and edit invalidation. Renaming the canonical project path creates a different namespace.

The plugin adds no telemetry or remote service. However, approved notes are sent to the configured model provider as context. Notes, source quotes, task commands, evidence metadata and feedback persist locally; there is no automatic retention limit or bulk purge UI yet. Avoid storing secrets. `forget` deletes the plugin note only, not existing session history, model-provider records or related task feedback.

## Development checks

Run from `packages/plugins/improvement`:

```sh
bun typecheck
bun run typecheck:tsc
bun test --only-failures
```

The real-host integration tests live in Core; from `packages/core`:

```sh
bun run script/test.ts test/plugin-improvement.test.ts
```

They exercise real approval, denied activation, user-quote validation, real Shell execution/denial, real write invalidation, fixed cases, durable project isolation and storage pagination. They verify the plugin mechanics, not a real baseline/candidate coding-quality improvement.
