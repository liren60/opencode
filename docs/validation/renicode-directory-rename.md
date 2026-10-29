# Renicode 主仓库文件夹改名

<!-- wiki: {"kind":"validation","workflow":"completed","revision":2,"change":"none","relations":["docs/validation/renicode-pg-relocation.md"]} -->

日期：2026-10-28。

## 用户授权与范围

- 用户明确选择仅将项目文件夹 `C:/Users/reni.li/Downloads/PG/opencode` 改为 `C:/Users/reni.li/Downloads/PG/renicode`。
- 用户进一步授权自行释放占用，并确认允许正常退出当前 Renicode 桌面、停止对应后台，由一次性脚本在退出后执行改名、Git 工作树及 Wiki 路径修复。
- 不改软件品牌、命令、包名、Git 分支或远端；`opencode-align` 工作树名称保留。不修改聊天历史或数据库路径，不提交、推送、部署或自动重启应用。

## 已观察与已准备

- 最初重命名被 Windows 文件占用阻止；Handle 诊断定位到 Renicode 后台 `opencode-cli.exe` 的目录监听和其桌面 MCP 子进程，而非原版 OpenCode。
- 移动本次会话到父目录并调用 `debug.location.evict` 后，旧目录资源仍被重新创建；再次改名失败。这些尝试不算完成。
- 一次性作业：`%LOCALAPPDATA%/Temp/opencode/rename-renicode-once.ps1`。仅正常关闭指定 Renicode 桌面，使用官方 `service stop` 停止已核对的对应后台；不使用 taskkill、任意句柄强关或循环强杀。
- 准备阶段为两个工作树的未提交/未跟踪文件保存 SHA256 和 Git 状态，枚举了 7395 个指向旧主仓路径的依赖 Junction。执行时逐个验证后仅删除链接本身并重建目标，不递归删除内容。
- Git 使用 `worktree repair` 修复关联，不重置或丢弃用户工作。Wiki 登记和 PG 总导航仅修改当前主仓路径；历史验收中的旧路径保留。

## 执行与验收边界

本文件编写时作业尚未完成，不能据此声称文件夹已改名。作业延迟执行，使当前最终回复先落盘；若正常关闭、路径状态、指纹或 Git 核对失败，记录错误并停止，不自动回滚。

- 准备清单：`%LOCALAPPDATA%/Temp/opencode/rename-renicode-prepared.json`。
- 实际结果：`%LOCALAPPDATA%/Temp/opencode/rename-renicode-result.json`。
- 执行日志：`%LOCALAPPDATA%/Temp/opencode/rename-renicode-execution.log`。
- 只有结果 `status=completed` 且 Git、指纹、Wiki 校验字段均为 true，才表示本次文件夹改名及路径修复通过；后续对话应读取该结果补充本报告，而非根据准备记录推断成功。
- 本次不修改产品代码，不将目录修复当作完整构建、测试或 2.2 对齐计划完成。

## 实际完成补记

2026-10-28 后续对话读取了作业结果和执行日志：执行开始于 15:32:13，结束于 15:33:54；`status=completed`、`renamed=true`、`linksRepaired=7395`，Git 工作树、文件指纹与 Wiki 校验字段均为 true。主目录实际为 `Downloads/PG/renicode`，本次会话已移到新目录。

应用左侧项目列表不是文件夹目录清单。后续读取 Renicode 的 `project.list`，原 Git 项目 ID `b2bcac7ee2b0158d605146c6964f41570024a331` 已指向 `Downloads/PG/renicode`，但还存在单独的无 Git 旧路径记录 `e0e3dc999b8f460cc666fab0c78da8559757d22f`，其 canonical 为 `Downloads/PG/opencode`。文件夹改名成功不自动删除这种项目记录，也不自动迁移所有旧会话路径；没有直接修改实时数据库或删除会话。
