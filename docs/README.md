# Renicode 文档入口

## AI 开始任务前必读

先读取适用的 `AGENTS.md`，再读取本页与[统一文档工作流](../../Reni_KnowledgeBase/docs/guides/document-workflow.md)。本地公共知识库不可读取时明确说明，遵守本页最低规则，不猜测批准；Wiki 服务离线不影响本地读取。

- 正式新文档使用 `docs/discussions/`、`plans/`、`design/`、`guides/`、`knowledge/`、`references/`、`validation/`、`archive/`；目录按需创建，代码结构不变。
- 讨论先记录，确认后另建计划并互链。允许编制计划不等于允许实施。
- 计划分开当前生效范围、不在范围内、待确认变更、变更记录、进度/证据与下一步；扩大/缩小/重大修改确认后才生效。
- 暂停/终止保留历史、原因、停止点、成果与遗留事项；状态文件不停止程序，不授权回滚/删除/部署。
- 只读取当前任务相关计划和最新验收，核对工作树及实际代码；没有批准不推断授权。
- 新计划标题后按公共模板声明 workflow/revision/change/relations；已完成验收报告不自动意味着计划完成。

Wiki 入口：[文档工作流规范](/projects/knowledge/docs/guides/document-workflow.md)、[本项目流程看板](/WORKFLOW.md?project=renicode)。以上绝对路由用于 Wiki；前面的相对链接用于本地读取。

## 现有文档兼容入口

既有文件暂保留原位置，不在并行开发中移动主计划，正文仅维护一份。

| 标准分类 | 当前入口 |
| --- | --- |
| 计划 | [任务模式](../plans/task-mode.md)、[原生项目中心](../plans/project-center.md)、[插件改善](../packages/plugins/improvement/PLAN.md)、[Effect 插件](../packages/plugin/src/effect/PLAN.md) |
| 设计 | [V2 契约](../specs/v2/README.md)（现有仓库规定保留 specs） |
| 指南 | [A/B 部署](../script/renicode-portable.md)、[GUI 扩展](../packages/gui-extensions/README.md)、[项目中心使用](../packages/gui-extensions/src/project-center/README.md) |
| 验收 | [API 审计](../V2_HTTP_API_AUDIT.md)、[安全审查](../script/renicode-security-review.md)、[测试性能](../perf/test-suite.md) |

后续迁移须核对内部链接、源码/构建引用、历史来源链接与用户正在执行的计划，不复制正式正文。根 README/AGENTS 和包旁简短 README 保留必要位置。本轮不改变任务模式未实现、未启用的事实，不恢复已暂停的项目中心部署任务。
