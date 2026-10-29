# 官方插件

每个目录都是可独立安装的 OpenCode 插件。目前插件通过 Git URL 安装，而非 npm。URL 可省略分支名，此时使用仓库默认分支。

这些包不会随 OpenCode 捆绑，也不会自动加载。不要将它们加入 Core 的依赖、内置插件注册表或仓库的 `.opencode/plugins/` 目录。

| 插件                                            | 目录                           |
| ----------------------------------------------- | ------------------------------ |
| [Figma](figma/README.md)                        | `packages/plugins/figma`       |
| [持续改进](improvement/README.md)                | `packages/plugins/improvement` |
