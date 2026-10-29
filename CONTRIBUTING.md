# 为 OpenCode 做贡献

以下修改最容易被接受：

- 修复缺陷
- 添加 LSP 和格式化工具
- 改进 LLM 性能
- 修复特定环境下的问题
- 补齐缺失的标准行为
- 改进文档

界面和核心产品功能在实现前需要设计评审。如果不确定修改是否合适，请咨询维护者，或选择带有 [`help wanted`](https://github.com/anomalyco/opencode/issues?q=is%3Aissue%20state%3Aopen%20label%3Ahelp-wanted)、[`good first issue`](https://github.com/anomalyco/opencode/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22)、[`bug`](https://github.com/anomalyco/opencode/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug) 或 [`perf`](https://github.com/anomalyco/opencode/issues?q=is%3Aopen%20is%3Aissue%20label%3A%22perf%22) 标签的议题。

想处理某个议题？请留言；如果尚无人处理，维护者可能会将其分配给你。

> [!NOTE]
> 忽略这些约束的 PR 很可能被关闭。

## 添加模型提供商

添加新提供商通常不需要修改 OpenCode。请先将提供商添加到 [models.dev](https://github.com/anomalyco/models.dev)。

## 开发

OpenCode 需要 Bun 1.3 或更高版本。在仓库根目录运行：

```bash
bun install
bun dev [directory]
```

`bun dev` 启动 V2 CLI 和 TUI。传入目录可打开其他项目，传入 `.` 可打开当前仓库。

要让开发版 TUI 连接已安装的 OpenCode V2 后台服务和实时会话进行测试，请运行：

```bash
bun run dev:live [directory]
```

进行 Web 开发时，请在不同终端分别运行后端和应用。其他界面也有根目录脚本：

```bash
bun dev serve --port 4096
bun run dev:web
bun run dev:desktop
bun run dev:www
```

### 包结构

- `packages/schema`：共享的传输和存储契约
- `packages/core`：领域行为和持久化
- `packages/protocol`：公共 API 定义
- `packages/server`：HTTP 服务和运行时组合
- `packages/client`：生成的 TypeScript 客户端
- `packages/cli`：命令行入口和服务生命周期
- `packages/tui`：终端界面
- `packages/app`：共享 Web 界面
- `packages/desktop`：Electron 桌面应用
- `packages/plugin`：插件 API

### 验证

在受影响的包目录中运行类型检查，以及该包定义的测试，不要在仓库根目录运行测试：

```bash
cd packages/core
bun run test
bun typecheck
```

遵循附近 `AGENTS.md` 中的包级说明。修改公共 Protocol 或 Server `HttpApi` 后，请在 `packages/client` 运行 `bun run generate`；绝不要直接编辑生成的客户端文件。

遵循仓库的[风格指南](./AGENTS.md)。

## 合并请求（PR）

### 按要求关联议题

缺陷修复、维护工作和测试必须关联已有议题。文档、重构和功能 PR 不受自动关联议题检查限制。需要关联时，请在 PR 描述中使用 `Fixes #123` 或 `Closes #123`。

实现新功能前，请先提交功能请求，说明问题、为何适合加入 OpenCode，以及你的方案（如有）。获得设计批准后再提交实现 PR。

以 `dev` 为基础创建分支，并填写提供的合并请求模板。

### 保持聚焦

- 保持 PR 小而聚焦。
- 说明问题，以及修改为何能解决它。
- 检查该功能是否已存在。
- 界面修改应附上前后对比截图或视频。
- 逻辑修改应说明测试内容，以及评审者如何验证。

### 保持简洁

冗长的 AI 生成 PR 描述和议题可能被忽略。请用自己的话简短说明。如果无法简要解释修改，PR 可能过于庞大。

### 使用规范标题

使用 `type(scope): summary` 格式。支持 `feat`、`fix`、`docs`、`chore`、`refactor` 和 `test` 类型；scope（范围）可省略。

示例：

- `docs: update contributing guide`
- `fix(tui): restore scroll position`
- `feat(app): add workspace search`

## 议题

缺陷报告和功能请求必须使用对应议题模板，不允许空白议题。支持和使用问题请在 [Discord 社区](https://discord.gg/opencode)提问。

自动检查会标记缺少模板、包含占位文字、AI 生成的长篇文字或缺少有效内容的议题。被标记后有两小时修正，否则会自动关闭。如果被错误标记，请联系维护者。
