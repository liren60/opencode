# Renicode 项目地址迁入 Downloads/PG

<!-- wiki: {"kind":"validation","workflow":"completed","revision":1,"change":"none","relations":["docs/plans/renicode-upstream-align.md","docs/validation/renicode-align-resume.md"]} -->

日期：2026-10-28。用户明确告知将所有项目移动到 `C:/Users/reni.li/Downloads/PG`，要求相应修改 Renicode 地址；本记录不授权后台/数据库升级或部署。

## 实际修改

- Git `worktree repair` 修复移动后的 `opencode-align` 双向 gitdir 登记；两工作树当前均在 PG 下，保留分支、合并及未提交内容，没有 prune、reset 或提交。
- 当前 Renicode `packages/gui-extensions/src/project-center` 与 2.2 隔离版本 `packages/gui-plugins/src/project-center` 的默认 registry、英/中文路径提示、README 与既有翻译审查路径更新为 `Downloads/PG/Reni_ProjectCenter/web/wiki-projects.json`；只改变路径文字，不重新翻译术语。
- 主计划使用新的实施目录；旧验收绝对路径保留为历史，并加新路径补记。兄弟仓库的相对文档入口不需要修改。
- `Reni_ProjectCenter/web/wiki-projects.json` 的 Renicode repository 为 `../opencode`，移动后仍正确，未无意义改为机器绝对地址。
- 两工作树的依赖 Junction 原来指向 `Downloads/opencode*`；各执行 `bun install --frozen-lockfile`，重新链接到 PG。锁文件未新增修改；保留旧 dependency patch 不适用警告。
- 已检索仓库脚本、项目 `.opencode`、Renicode profile/config 和用户 `.config/opencode` 的旧 Downloads 地址，未发现其他需改的活跃文本配置。未扫描/改写聊天历史、日志或实时数据库，不把历史字符串替换当成会话迁移。

## 验证

| 检查 | 结果及边界 |
| --- | --- |
| Git 工作树 | `opencode` 与 `opencode-align` 均显示 PG 新路径；隔离 `.git` 指向 PG 主仓，无 prunable 标记。 |
| 修复前新路径检查 | 两版本测试依赖加载失败，类型检查缺依赖；隔离 lint/check 因旧 Junction 失效无法运行。保留失败历史，不算产品回归或通过。 |
| 原版本 reader/source | 修复后15/15 pass、52 assertions；GUI extensions Bun typecheck通过，1126 files。 |
| 2.2版本 reader/source | 修复后15/15 pass、52 assertions；GUI plugins官方 tsc通过。 |
| 新默认路径真实只读 smoke | 读取 PG下 registry、绑定 renicode，29篇文档、0 warnings；脚本 `%LOCALAPPDATA%/Temp/opencode/renicode-pg-path-smoke.ts`。不修改仓库文件。 |
| 新路径隔离 changed lint | 固定上游 `86ce19d96e`：64个变更文件、0 problem(s)；shell `sh_181480a73001Z89pNm12Q9t1Ya`。 |
| 新路径隔离全仓 check | `bun --bun run check`通过：1463 warnings、0 oxlint errors，11 guide blocks匹配，Turbo 36/36 successful、33 cached、12.692秒；同一shell。缓存重放日志中的旧路径是历史输出，不是活跃地址配置。 |

地址修复的源码与工作树验证记录已完成；不表示已安装桌面已更新，也不表示2.2迁移计划完成。修复前失败证据与下列遗留事项保留。

## 未变更与遗留

- profile、A/B槽位与启动器仍在 AppData，不是被移动的项目目录，未改其位置。未重启应用/后台，未暂存/激活2.2更新，未迁移实时数据。
- 上述源码默认路径尚未打包进入已安装桌面。当前安装若仍用旧默认路径，可通过 **Settings → Project Center** 显式设置 `C:\Users\reni.li\Downloads\PG\Reni_ProjectCenter\web\wiki-projects.json`；本轮未声称已写入该桌面偏好。
- 项目登记的 `ReniMerge` 和 `ReniQuickChange` 对应PG下目录目前不存在；Renicode登记正常，未删除或猜测这两个外部项目的位置。
- 后续补记：用户进一步要求查找并集中整理Wiki，已在 `Downloads/插件/` 找到两个独立仓库并完整移动到 PG；六个登记项目现均可读，真实中心扫描256篇、0 warnings。上行保留初次地址修复时的事实，缺失项现已解决。见[Wiki整理验收](../../../Reni_ProjectCenter/docs/validation/pg-wiki-relocation-20261028.md)与[PG总导航](../../../Wiki导航.md)。正式8090当前未运行，未自动启动。
- 项目中心4项GUI正向回归是移动前的证据；重复/负向敏感性、图片、集中导航与Markdown接口、完整打包及隔离升级门禁仍待后续，不因地址修复而宣布2.2迁移完成。
