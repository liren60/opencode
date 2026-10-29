# 持续改进

这是一个实验性的 OpenCode V2 插件，需要主动配置才能启用，用于实现 **经审核的项目记忆 → 真实验证证据 → 固定用例对比**。它不会训练模型权重、重写 `AGENTS.md`、提升权限或在后台学习。

分阶段开发计划和验收标准见 [PLAN.md](PLAN.md)。

## 在本地启用

在本仓库根目录的项目配置 `opencode.jsonc` 中添加此包，并保留已有设置：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["./packages/plugins/improvement"],
}
```

路径相对于配置文件。如果使用 `.opencode/opencode.jsonc`，请填写 `../packages/plugins/improvement`。此包直接导出 TypeScript，不需要构建。仅仅将它放在仓库里不会自动加载；这里也没有提供安装未发布 Git 修订版本的命令。

配置变更会自动重新加载。删除此插件条目即可卸载，无需重启服务。卸载会移除插件的工具和上下文钩子，但保留已存储的记录。审批仍遵循现有权限规则：明确的拒绝规则始终有效；记忆决策和任务反馈若未被拒绝，都必须请求审核。

## 记忆工作流程

让智能体记住一条明确的纠正意见。它必须引用真实的用户消息 ID，并逐字引用该消息中的原文：

```ts
const note = await tools.improvement.memory_propose({
  content: "Keep answers concise.",
  messageID: "msg_actual_user_message_id",
  quote: "keep your answers concise",
})
return note
```

记忆条目最初处于 `pending`（待审核）状态。智能体可以申请激活，但用户必须在权限请求中审核其内容和来源：

```ts
return await tools.improvement.memory_review({ id: "returned-note-id", decision: "activate" })
```

- `memory_list({})` 列出当前项目中所有状态的记忆条目。
- `memory_review` 支持 `activate`（激活）、`reject`（拒绝）、`suspend`（暂停）和 `forget`（遗忘）。
- 只有 `active`（已激活）条目会进入下一次主模型上下文。最多包含 20 条、共 8,000 个正文字符，按最新优先排列，并注明省略数量。
- 逐字引用只能证明来源，不能证明提议的转述准确。批准前请核对含义。
- 暂停或遗忘会停止后续调用，但无法撤回已发送给模型的文本，也不会删除原始用户消息。

## 任务验证

先声明有实际意义的检查，再实现修改，最后运行每一项检查。以下示例是 Code Mode 代码片段，不是外部 JavaScript 解释器命令：

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

使用返回的任务 ID，并在声称已验证之前检查报告：

```ts
await tools.improvement.verify({ taskID: "returned-task-id", checkID: "regression" })
await tools.improvement.verify({ taskID: "returned-task-id", checkID: "types" })
return await tools.improvement.task_report({ taskID: "returned-task-id" })
```

| 状态         | 含义                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `passed`     | 所有声明的检查都有有效且已完成的 Shell 结果：退出码为 0、未超时、未被信号终止。 |
| `failed`     | 某项当前已完成的检查失败、超时或被信号终止。 |
| `unverified` | 某项检查没有可识别的完成结果，或其最新尝试被拒绝／中断。 |
| `stale`      | 检查尝试开始后检测到了编辑操作，需要重新运行检查。 |

`verify` 不接受替代命令或模型提供的退出码。它委托现有 Shell 执行器运行检查，沿用 Shell 权限检查，并保留其输出。Shell 工具缺失、重试被拒绝或中断时，不会沿用之前的成功结果。任务归属于创建它的会话。

内置 `edit`、`write` 和 `patch` 调用会在执行前后使项目证据失效；出于保守原则，失败的编辑也算在内。使用外部编辑器、修改文件的 Shell 命令或其他修改工具后，请显式使证据失效：

```ts
return await tools.improvement.invalidate({})
```

这里记录的是命令执行证据，不是强制完成门槛，也不能证明语义正确。应选择真正覆盖需求的检查；`echo ok` 无法验证代码修改。后台命令始终处于未验证状态。此版本没有文件系统监视器、操作系统沙箱、自动回滚或成本核算。

## 固定用例评估

在开始运行任一实验版本前，先配置用例集。每个用例有唯一 ID、固定目标和 1–20 项检查；每个用例集最多支持 50 个用例：

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

从等价的初始状态运行相同用例，并使用不同标签，例如 `baseline-1`（基线）和 `candidate-1`（候选）。模型、环境和检查语义应保持可比。用例任务不能覆盖配置中的目标或检查：

```ts
return await tools.improvement.task_start({ caseID: "parser-regression", variant: "baseline-1" })
```

验证后，请用户审核实际结果。反馈会保存验证状态和已完成尝试耗时的快照，二者与用户对结果的评价独立记录：

```ts
return await tools.improvement.feedback({
  taskID: "returned-task-id",
  outcome: "accepted", // or "rework", "rejected"
  note: "Regression reproduced and fixed; API unchanged.",
})
```

只有获批的反馈才计入评估。同一任务后续获批的反馈会替换之前的反馈。同一用例／实验标签的第二个任务属于重复项，而不是替代项；新实验请使用新的标签。

```ts
return await tools.improvement.evaluate({ baseline: "baseline-1", candidate: "candidate-1" })
```

结果会列出缺失、重复和用例集不匹配的运行记录。只有完整且匹配的用例集才会展示验证率和接受率的“候选减基线”差值。报告还包含验证耗时，但不会捏造模型延迟、token 成本或质量评分。这只是小样本的描述性对比，不是模型整体能力提升的证据；插件不会自动执行用例，也不会证明初始状态等价。

## 存储与隐私

记录使用 OpenCode 的本地持久化插件存储，并通过项目规范路径的哈希进一步隔离。同一项目的工作树共享记忆和编辑失效状态。重命名项目规范路径会产生新的命名空间。

插件不增加遥测或远程服务，但获批的记忆会作为上下文发送给配置的模型提供商。记忆、来源引用、任务命令、证据元数据和反馈会保存在本地；目前没有自动保留期限或批量清理界面。请勿存储秘密信息。`forget` 只删除插件记忆，不会删除已有会话历史、模型提供商记录或相关任务反馈。

## 开发检查

在 `packages/plugins/improvement` 目录运行：

```sh
bun typecheck
bun run typecheck:tsc
bun test --only-failures
```

真实宿主集成测试位于 Core；在 `packages/core` 目录运行：

```sh
bun run script/test.ts test/plugin-improvement.test.ts
```

这些测试覆盖真实审批、激活被拒绝、用户原文校验、真实 Shell 执行／拒绝、真实写入导致证据失效、固定用例、持久化项目隔离和存储分页。它们验证的是插件机制，而非真实基线／候选实验中的编码质量提升。
