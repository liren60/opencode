# Renicode 对齐 2.2：续作验证记录

<!-- wiki: {"kind":"validation","workflow":"completed","revision":1,"change":"none","relations":["docs/plans/renicode-upstream-align.md","docs/validation/renicode-align-merge.md"]} -->

日期：2026-10-28。本报告记录分阶段检查、回归与交接，不是完整对齐验收。下方早期静态结果保留为历史，最新状态见续作补记。

## 本轮变更

- 实施工作树：`C:/Users/reni.li/Downloads/opencode-align`，分支 `align-renicode`；固定上游 `86ce19d96eccbfb95af3ff3189c7071575f94339`，仍处于合并中，未提交或推送。
- 解决 wordmark、titlebar、两份 e2e keeper、三份 desktop/script 位置冲突及旧 details 两路径，共 9 个；`git diff --name-only --diff-filter=U` 只剩 `packages/app/src/shell/shell.tsx`。
- 详情固定定制移入新版 `gui-plugins/details`；Home 品牌和新版 wordmark 参数均保留。不恢复已删除旧 SDK。
- 三份 settings/migrate 脚本仅确认新版位置并暂存原内容，没有执行迁移或启动真实后台。

## 实际证据

| 检查 | 结果与边界 |
| --- | --- |
| Bun.Transpiler：wordmark、titlebar、Home/session-summary keeper、details/popover、details/en、desktop/script 的 migrate/settings/settings.test | 9 个文件全部语法解析通过；不解析 import 依赖、不证明类型或运行行为。脚本位于 `%LOCALAPPDATA%/Temp/opencode/renicode-align-resume-parse.ts`。 |
| `git diff --cached --check -- <本轮已解决/修改路径>` | 通过。 |
| 整个 `git diff --cached --check` | 失败：上游新增 trees/app-builder-lib dependency patch 的 diff 正文空白，以及 `packages/tui/test/app-lifecycle.test.tsx` 文件末尾空行。没有随意重写依赖 patch；仍待核对固定上游原文。 |
| `git diff --name-only --diff-filter=U` | 仅剩 shell.tsx；冲突计数不是功能完成率。 |

session-summary 固定用例在上述解析后另作一处 locator 适配：新版 MCP flyout 是 summary 内的 `group`，不再是独立 `dialog`；完整 keeper 运行仍待依赖及 shell 可构建状态。

## 依赖进程与未验证项

- 本进程 PATH 显式加入临时目录 Bun 1.4.4 后，在隔离工作树执行 `bun install --frozen-lockfile`。shell ID：`sh_18074f19100185oIQnJ3KgvtrQ`；本记录时仍等待完成通知，不声称成功，也没有修改全局 PATH。
- 尚未执行本轮真实单元/e2e/组件回归、lint/typecheck、生产成本比较、打包或部署；前次 native/store 的通过结果不能代替本轮完整验证。
- 最新冻结侧栏对话时间、日期 keeper、项目中心模块和 GUI fixtures 尚待移植；Shell 不机械选边，以免丢失定制导航或上游折叠/peek 行为。
- 原工作区应用源码、当前桌面/后台、真实 profile/数据库未改；没有 A/B 暂存或激活，没有解除后台字节和存储指纹门禁。

## 依赖安装后续作补记

- 依赖安装成功：1816 个包，frozen lockfile；5 个旧 dependency patch 不适用警告未清理。
- 初始 22 个冲突已全部解决并暂存，最新 unmerged 路径检查为空；仍处于未提交合并。
- 项目中心源码与 reader/source tests 已迁到新版内置 GUI 插件目录，旧 page fixture 未复制。Shell 嵌入旧 ProjectSidebar 是过渡实现，不代表导航业务插件化完成。

| 实际检查 | 结果与边界 |
| --- | --- |
| Desktop 启动器/偏好迁移回归 | 25 pass、0 fail，3 文件，1.495 秒；不验证完整新版桌面打包。 |
| Core patch 回归 | 88 pass、0 fail，2 文件，2.90 秒。 |
| 项目中心 reader/source 回归 | 15 pass、0 fail，650 毫秒；不证明 GUI 引用/图片/回跳。 |
| GUI plugins `bun typecheck` / `bun run typecheck:tsc` | 均通过；Bun 检查覆盖 1188 文件。 |
| App `bun typecheck` | 通过，1876 文件。 |
| Desktop `bun typecheck` | 通过，2936 文件、2 projects，1.60 秒；shell `sh_18086c139001yXEcjxxTc8O6GZ`。 |
| 生产 fixture 构建 | 成功，53.21 秒；shell `sh_18084852a001YtrsGlgjWtE3Ra`。PWA precache 2822 entries，35959.73 KiB；大 chunk/无效动态导入警告仍存在，不判断为性能通过。 |
| 前次全仓 `bun --bun run check` | oxlint 1681 warnings、0 errors，最终因 GUI guide 两处 source blocks 不一致失败；已同步 README，正在复跑 `sh_18086c0e8001MYmXqqJYh2PquF`。 |
| 默认 `lint:changed` | 1014 problems，142/1246 files；使用旧共同祖先，包含大量上游变化，不作为迁移新增诊断计数。 |
| 直接运行固定上游 lint 脚本 | 被 Node 加载 `.ts` lint 插件失败阻塞，随后脚本 JSON 解析失败；shell `sh_18086c0fe0014P01c846045Beg`。正在通过 `bun --bun run lint:changed -- 86ce19d96eccbfb95af3ff3189c7071575f94339` 重试，shell `sh_180876a46001K6iX8tbYF0BBWB`。 |

生产静态 fixture 服务已在独立端口 4318 启动（shell `sh_18086e875001DnxFZSJ7RjEpd0`）；Home/session-summary keeper 在无真实后台的隔离 API fixture 上运行（shell `sh_180872255001MeuA03pxYn0EQ8`），此处记录时尚未收到测试结果。服务仍在运行，不将报告状态当作进程已停止。

最新时间实现/日期 keeper、项目中心 GUI fixture、真实草稿引用/快照/图片/回跳与 late IPC/store、生产成本比较、完整打包及隔离数据库/后台升级仍未完成。主计划只维护在原工作区；未提交、推送、暂存 A/B 或激活版本。

## 最新完成结果与失败证据

| 检查 | 结果 |
| --- | --- |
| 全仓 `bun --bun run check` | 通过；1681 warnings、0 oxlint errors，11 guide blocks 一致，36/36 Turbo tasks successful，1m27.724s。shell `sh_18086c0e8001MYmXqqJYh2PquF`。 |
| 固定上游 `lint:changed` | 失败；218 problems，10/60 files。shell `sh_180876a46001K6iX8tbYF0BBWB`。103 条 wordmark 诊断位于相对固定上游未改的行；其余多在 Renicode 定制中，不能据此免责。 |
| 侧栏/desktop build 空行修正后 targeted oxlint | 2 文件、0 warnings、0 errors；仅空行调整，未修改行为或关闭规则。全仓通过结果采集于这次空行调整前；未重跑完整 changed lint。 |
| Home/session-summary 全文件生产 keeper | 30/30 pass，2 workers、0 retries，54.4 秒；shell `sh_180872255001MeuA03pxYn0EQ8`。 |
| 两个定制 keeper 重复运行 | 总计 19 pass、1 fail，5 workers、fullyParallel、各重复 10 次、0 retries，26.1 秒；shell `sh_180895634001JFtD7Sr5BxYCSN`。固定浮层 10/10 pass；项目导航 9/10 pass。 |

重复失败发生在 `home.spec.ts:54`：新建 Other project 草稿、折叠导航并刷新后，项目按钮未恢复 `aria-current="true"`。首次全文件通过不能掩盖此失败；尚未判定是产品草稿恢复缺陷或测试时序。未加 sleep、重试或放宽断言。失败资产位于隔离工作树 `packages/app/e2e/test-results/regression-home-project-na-8f98d-draft-in-the-chosen-project-chromium-repeat8/`（`error-context.md`、`test-failed-1.png`、`video.webm`）。

串行 5000 会话生产基线已启动（shell `sh_1808a84d6001LMqoKlfJwRF7j0`，run ID `renicode-align-sidebar-before`），此处尚未收到完成结果。配置为获准临时目录 `renicode-align-performance.config.ts`，指向新版工作树和 Chromium；不与旧工作区/msedge 单次基线直接比较。静态 fixture 4318 仍在运行，无真实后台连接。

基线补记：首次 benchmark 目录收集碰到 `timeline-stability/fixture.test.ts` 的 Bun unit test，尚未进入场景便失败。明确选择既有 `home-session-index-benchmark.spec.ts` 后串行生产场景通过（1 pass，2.1 秒）。run ID 仍为 `renicode-align-sidebar-before`，单样本指标：listRequests=1，listBytes=2574810，rowsMs=326.7，processMs=54.5，heapUsedMB=31.61，nodes=2328；scope 为 renderer main isolate，不是整个桌面 RAM。原始资产位于 `%LOCALAPPDATA%/Temp/opencode/renicode-align-performance-before/`。仅记录比较基线，不宣称性能趋势或达标。

## 草稿恢复定位与对话时间迁移（继续实施）

- 仍在隔离 `opencode-align` 实施；未移动或复制主计划、未提交/推送、未触碰实时 profile/数据库、未重启桌面或后台、未暂存 A/B。
- 原项目导航 keeper 在旧生产 fixture 上重复 20 次、5 workers、fullyParallel、0 retries、trace on：13 pass、7 fail，约 1.2 分钟（shell `sh_180e4afb200104N01qAun0e6oO`）。失败仍在刷新后的项目高亮，不能用通过比例视为验收。
- trace 证据：失败样本刷新前 URL 是 `/new-session?draftId=358e62cf-0a57-4286-9f3e-01f210cc8e58`，reload 完成后 URL 为 `/`，且不再有草稿 tab。不是仅侧栏 aria 样式丢失。所有本轮 before 资产保存于 `%LOCALAPPDATA%/Temp/opencode/renicode-align-draft-before/`。
- 对应代码：`newDraft` 在 `startTransition` 内调用持久化 setter；`persistStore` 的定时保存在 transition 期间可序列化旧 store、清除 dirty，页面 commit 不会再次标脏。本轮将新增草稿 tab 写入移到 route transition 外，保留导航 transition；未修改通用持久化、未新增每次 setter 的全量序列化。现有 keeper 增加刷新后同一 draft URL 和项目控件断言，不加 sleep/重试，不放宽高亮断言。修复后的重复结果尚待收到。
- 最新对话时间已从原工作区实现迁入新版 sidebar/i18n，保留单个分钟时钟、共享 Intl formatter、`idle ?? created`、标题与时间独立的 accessible name、混排 `bdi` 和逻辑间距。新版 data mutation 已有 confirmed deletion tombstone，因此不机械覆盖其新版活动事件逻辑。
- 日期 keeper 移入现有 Home suite。负向验证在未重建的旧生产 fixture 上实际失败：1 fail、0 pass，缺少 `<time>`（shell `sh_180e60443001FicdM1ic0WzYGw`）；资产位于 `%LOCALAPPDATA%/Temp/opencode/renicode-align-date-before/`。待 rebuilt fixture 验证选中不改对话时间、无 idle 时使用 created、执行完成后更新至 2h。
- 本轮日期源码的 App `bun typecheck`（1876 files）和官方 `typecheck:tsc` 均通过（shell `sh_180e60495001w5EMJKv9klo3v2`）；采集于草稿修正前，不能代替最终全仓检查。五个修改路径 `git diff --check` 通过。
- targeted oxlint 首次带 `--type-aware` 因未安装 `oxlint-tsgolint` 无法执行；不新增依赖，改用仓库普通 oxlint。普通检查首次 4 spacing warnings、0 errors，已补齐对应空行，后续完整检查结果待收到。
- 重建生产 fixture（`sh_180e7617b001gbIZIvVA6PlG4h`）、全仓 check（`sh_180e94de50013kVt6w2mQzlIAA`）、固定上游 changed lint（`sh_180e98dc20014uQFFuyvyx8bWZ`）已启动；此段尚无完成证据，不宣称通过。fixture 静态服务 4318 继续运行，不连接真实后台。

### 本轮构建/检查完成补记

- 生产 fixture 重建成功，约 74 秒，2822 precache entries、35960.98 KiB；大 chunk/无效动态导入警告未消除。
- 全仓 `bun --bun run check` 通过：1675 warnings、0 oxlint errors，11 guide blocks 匹配，36/36 Turbo tasks successful、34 cached，Turbo 15.736 秒；lint 28.6 秒。已包含本轮草稿修正与日期实现；测试随后新增的 draft URL/控件断言不在 app 源码 typecheck 范围，另跑 `typecheck:e2e`。
- 固定上游 changed lint 失败：212 problems、8/61 changed files，剩余路径为 wordmark 和桌面启动器相关文件。本轮 sidebar/language/tabs/Home keeper 不在失败路径；不清除或关闭规则。
- rebuilt fixture 上草稿/日期 keeper 各重复 20 次、5 workers、fullyParallel、0 retries 已启动（`sh_180ea36f9001HKJkWfKRWYOBBY`），输出位于 `%LOCALAPPDATA%/Temp/opencode/renicode-align-draft-date-after/`；此段尚待结果。官方 App tsc/e2e 类型检查与 targeted oxlint 也已启动（`sh_180ea60a3001cCaEAcz2ERpo7p`）。

### 夹具失效与正确服务上的最终补记

- 上述 4318 重复运行最终为 40 fail、0 pass，全部停在首次 heading readiness（`Current chat` / `Other dated chat`），未进入草稿/日期验收断言。`e2e/utils/serve.ts:13` 在启动时缓存 index；重建替换了 hashed assets，旧服务仍返回旧 index，造成空白页面。这是夹具失效，不是修复验收，也不能删除失败历史。4318 的全文件运行 `sh_180ebd057001hg8IBNFNKY3kzo` 同样使用过期 index，最终为 29 fail、2 pass（4.3 分钟）；资产 `%LOCALAPPDATA%/Temp/opencode/renicode-align-home-summary-after/`，不作为产品验收。
- 未重启旧服务；重建后在独立 4319 启动正确静态服务（`sh_180ed258e0016pkkp0M5KNwUlG`），不连接真实后台。两项正确回归均由 `sh_180ed6fa6001EkdqWp6hp1IHfY` 执行，`PLAYWRIGHT_BUILD=1`、`PLAYWRIGHT_BASE_URL=http://127.0.0.1:4319`、`PLAYWRIGHT_FULLY_PARALLEL=1`、Chromium、5 workers、0 retries。
- 草稿/日期 keeper 各 `--repeat-each=20`：40/40 pass，40.0 秒；覆盖同一草稿 URL/项目控件及高亮恢复，以及选中不修改对话时间、created 回退、执行完成后时间更新。资产目录 `%LOCALAPPDATA%/Temp/opencode/renicode-align-draft-date-4319/`。未增加 sleep、重试或放宽断言。
- Home/session-summary 全文件：31/31 pass，28.7 秒；资产目录 `%LOCALAPPDATA%/Temp/opencode/renicode-align-home-summary-4319/`。该结果仅覆盖这两个文件，不表示项目中心 GUI 或完整桌面通过。
- 最新 App 官方 `typecheck:tsc` 通过；sidebar/language/tabs/Home keeper 定向 oxlint 为 0 warnings、0 errors。`typecheck:e2e` 仍有其他文件的 11 条错误：terminals probe、composer-write-batch benchmark、composer/review/session-panel-scrollbar/timeline-geometry/timeline-stream；Home 的旧 `seed.projects` 类型错误已修复，项目仍由 mock API 提供。未证明其余错误全部是固定上游既有错误。
- 5000 会话新版单样本 benchmark 通过，run ID `renicode-align-sidebar-after`：listRequests=1，listBytes=2574810，rowsMs=890.3，processMs=114.4，heapUsedMB=31.25，nodes=2365；资产 `%LOCALAPPDATA%/Temp/opencode/renicode-align-performance-after/`，配置 `renicode-align-performance-after.config.ts`。请求/字节与 before 相同；after 运行同时有 e2e 负载且使用新端口，before/after 均仅单样本，不据此宣称性能趋势、退化或达标。
- 隔离工作树 A/B 指南仅修正新版 launcher 路径为 `packages/desktop/script/renicode-launcher.ts`；未执行部署。固定上游 changed lint、项目中心 GUI、通用宿主接口、完整打包、隔离后台/数据库升级与回退边界仍未完成；未提交/推送、未 A/B 暂存或激活。

### 缓存删除 keeper 迁移

- 从原工作区 Home keeper 移入两种删除来源的既有表格用例（session menu / another client），仅修改隔离工作树 `packages/app/e2e/regression/home.spec.ts`。观察契约是删除后侧栏缓存不再显示已删除会话，剩余会话仍可打开；Home 现有删除用例只验证 Home 行，不覆盖侧栏缓存。可信回归是成功删除后撤销 remove 标记或遗漏 confirmed deletion tombstone；新版生产实现未改。
- 已核查新版 mock 的 `sessionRemove` 仅返回 noContent、不修改 sessions；用例中显式 splice 模拟后续服务端数据删除，不会重复删除剩余会话。后续成功事件更新剩余会话标题，作为事件处理完成的可见证据，不以网络响应代替 UI 结果。
- 正确 4319 生产 fixture：首次 2/2 pass（3.5 秒）；随后两种来源各重复 20 次，fullyParallel、5 workers、0 retries：40/40 pass（30.0 秒），资产 `%LOCALAPPDATA%/Temp/opencode/renicode-align-deletion-repeat-4319/`。迁移后的负向 owner mutation 尚未执行，不能将正向重复通过称为 keeper 敏感性已验证。
- 最新 `typecheck:e2e` 仍报告相同其他文件 11 条错误，Home 无诊断。直接 `bunx oxlint` 被 Node 加载 TS 插件失败阻塞，改用 `bun --bun x oxlint` 得到 1 spacing warning、0 errors；已补齐空行，最终定向检查待补记。文档定向 `git diff --check` 通过。
- 最终补记：补齐空行后 Home 定向 oxlint 为 0 warnings、0 errors（7.5 秒）；缓存删除迁移后的 Home/session-summary 全文件 33/33 pass（23.8 秒），4319、Chromium、fullyParallel、5 workers、0 retries。资产 `%LOCALAPPDATA%/Temp/opencode/renicode-align-home-summary-deletion-4319/`。负向敏感性验证与剩余产品/部署门禁不变。

### 桌面 lint 与项目中心 GUI 夹具迁移

- 重启前仍在旧位置的隔离工作树实施。Desktop 7 个定制文件补齐空行和基于本地写入边界的类型说明；独立启动器的长条件表达式改为等价 command dispatch，不增加 Effect 启动依赖，不修改停止/回退政策。wordmark 仅补空行和本地动画状态的类型说明，未改变动画逻辑。
- Desktop 启动器/偏好迁移 25/25 pass（2.33 秒），Bun typecheck 与官方 tsc 通过。随后 runtime/store 两文件重复 10 次：240/240 pass（8.56 秒）。
- 项目中心原 4 项 component keeper 迁到 `packages/stories`、`@opencode/plugin/gui` 与 `PluginContext`；仍由真实 Composer state/editor/request builder 观察草稿引用，不以附件 spy 代替。首次 2 pass、2 fail：新版引用卡片具备 button 角色，旧文档 locator 同时匹配列表按钮与附件；已将引用后的列表点击限定在 Project Center region，未放宽结果断言。
- 修正后 4/4 pass（19.9 秒），4321、Chromium、2 workers、0 retries；资产 `%LOCALAPPDATA%/Temp/opencode/renicode-align-project-center-after/`。涵盖延迟 session storage、带指纹引用/草稿请求/回跳、快照变化与恢复、中文既有词条、late read 跨绑定和 reader suspension。尚未验证图片和完整宿主路由。
- 固定上游 changed lint 首次全部通过：64 个 changed files、0 problem(s)，shell `sh_18134d7060016r8PRy287ZCeDt`。该次全仓 check 的 lint 为1463 warnings、0 errors、11 guide blocks 匹配，但 GUI fixture Layout 少声明5个未使用成员，Turbo 35/36，故全仓失败。补齐后 GUI plugins 的 Bun typecheck 和官方 tsc 均通过，不用先前 App 单包检查替代 GUI 检查。
- 负向 mutation 临时将 page.tsx citation comment 置空，4322 单 keeper 运行因 worker/server进程中断（code=1073807364 / exit 4）未完成行为断言。用户随后告知服务重启与项目移动；不算负向敏感性通过。已在新位置精确恢复该行，page.tsx SHA-256恢复为 `6dcfea1b459979b3ce8b91c781337e569313a62071dd04f954a520edc7c11a0a`，与变异前一致。
- 当前工作树已随用户移到 `C:/Users/reni.li/Downloads/PG/opencode-align`；本报告早期绝对路径是当时证据，不改写为伪历史。目录迁移验证见 `docs/validation/renicode-pg-relocation.md`。没有重复运行已完成的重启前检查来伪装为新路径验收；新路径检查单独记录。

### PG 新位置续作：项目中心敏感性与 Markdown 来源接口

- 用户明确继续本对齐计划，仍在 `PG/opencode-align` 的未提交合并工作树实施，固定上游不变。原工作区应用源码、实时后台/profile/数据库未改；未提交/推送、未 A/B 暂存或激活。
- 原四项项目中心 keeper 各重复 10 次、2 workers、0 retries：Playwright 报告 40/40 pass（1.7 分钟），资产 `%LOCALAPPDATA%/Temp/opencode/renicode-align-project-center-repeat-pg/`，shell `sh_181887d38001hjhQHw2KtdbvHY`。本轮同时编辑 SDK/host 导致 Vite page reload/HMR，且 PowerShell Tee 管道因原生命令 stderr 返回 code 1；不将这次运行作为最终无干扰稳定性证据，后续固定源码重跑。
- 引用 keeper 的负向 owner mutation：仅将 `page.tsx` citation comment 临时改为 `""`，独立 4324、1 worker、0 retries，实际 1 fail/0 pass，失败于 Conversation draft 中引用卡片缺失（来源 heading readiness 已通过）；资产 `%LOCALAPPDATA%/Temp/opencode/renicode-align-project-center-citation-negative-pg/`。已精确恢复原 comment 行，未放宽断言。这次证明移植后的引用 keeper 能捕获真实草稿丢失，不再把上次进程中断算作敏感性通过。
- 公开 GUI SDK 新增 `UiMarkdownSource` 与可选 `UiMarkdownProps.source`；仅由插件提供 decoded path 的图片/本地链接/inline-code 存在性回调，未提供宿主文件系统权限。source key 切换重建 Markdown 子树，取消旧图片读取与释放 URL；省略 source 保持原上下文行为，提供 source 时不继承会话本地文件读取器。SDK TSDoc 和 GUI guide 已同步，没有修改 Protocol/HttpApi。
- 项目中心读取页面改用 `ctx.ui.Markdown`，不再直接导入 session-ui Markdown/Provider。源标识包含 registry/project/path/文档指纹/provider generation；原路径解析、IPC 白名单和取消信号仍由项目中心保留。
- 在既有项目中心 suite 内增加一项图片/相对链接整合 keeper，夹具注入真实 App `ui`，保持真实 reader/Composer/request builder。通过受控延迟图片回复验证同名相对图片跨文档时不会复用旧来源，且可打开相对 Markdown 链接。此处记录时正向/负向图片结果及最终全仓检查尚待收到，不提前宣布通过。
- GUI plugins 与 Plugin 的官方 `typecheck:tsc` 均通过（shell `sh_1818d315b001g4iRwu8q1a4CJ9` / `sh_1818d317e001mvNuh2ffNzGuba`）。最终 changed lint、全仓 check 与无干扰重复 GUI 验证尚待完成；集中导航、缓存删除负向敏感性、完整打包和隔离升级门禁不变。

#### Markdown 验证补记与保留的失败

- 首次五项 suite 为4 pass/1 fail，图片 keeper 停在错误的 document button exact name：实际按钮包含来源路径。修正为完整 accessible name 后，第二次停在 image role；新版图片预览将图片赋予 `button` 角色，不是 `img`。已按真实角色修正 locator，未改行为断言/超时/重试。资产分别为 `renicode-align-markdown-source-after/`、`renicode-align-markdown-source-corrected/`。
- 修正 locator 后图片/相对链接 keeper 单次1/1 pass（4327，46.4秒，含约24.8秒Vite启动）；资产 `renicode-align-markdown-source-corrected-2/`。
- 首次全仓 check 的lint为1463 warnings/0 errors，SDK文档0问题、11 blocks匹配；App Bun typecheck 在 keyed Show 无参数 child function 处报告 TS2769，Turbo28 successful/34 total，整个check失败。改为读取key并传给Markdown cacheKey，保留source-key重建语义。最新App官方tsc已通过，不能用前次失败结果宣称完整check通过。
- 图片 keeper 的负向 host mutation：仅将 `Ui.Markdown` 的 `readImage` 传递临时改为undefined。4328、1 worker、0 retries，实际1 fail/0 pass，已找到图片，但naturalWidth=0而不是1；资产 `renicode-align-markdown-source-negative/`。已精确恢复forwarding。这证明keeper能够捕获新版SDK宿主漏传图片接口，不只是直接Provider的自验证。
- 冷扫描重复使用独立4329、Vite `--force`（不删除共享cache或重启既有服务）。第一次临时config以 `.ts` 被Playwright当成CJS，因加载ESM的config报`exports is not defined`，未进入测试；改为 `.mts` 后重跑。最终重复和全仓检查正在等待完成，期间不再编辑产品/夹具源码。

#### 本轮最终结果

- 固定源码的冷扫描项目中心suite：5项各重复10次，50/50 pass，1.5分钟；Chromium、2 workers、fullyParallel、0 retries，独立4329。Vite启动时强制预优化，测试期间没有`new dependencies optimized`、`optimized dependencies changed`、page reload/HMR。shell `sh_181929a06001PAGQAAxNmWe4gI`，临时config `renicode-align-markdown-cold.config.mts`，资产 `%LOCALAPPDATA%/Temp/opencode/renicode-align-markdown-cold-repeat/`。这是本轮最终无干扰证据，不将先前夹具失败抹掉，也不声称全组件suite已跑完。
- 最终完整 `bun --bun run check` 通过：1463 warnings、0 oxlint errors，SDK TSDoc251 declarations/924 members/282 parameters，11 guide blocks匹配，Turbo36/36 successful、27 cached、2m21.931s。随后固定上游changed lint：66个变更文件、0 problem(s)。shell `sh_181921c8b001WySUnIyCC9vZP5`。Plugin/GUI/App官方tsc通过，App包含component-tests，故新的keeper也在类型检查范围内。
- 额外App生产fixture构建输出到独立临时目录 `renicode-align-markdown-production-20261028/`，避免覆盖既有dist和静态服务的hashed assets。Vite报告 `built in 21.08s`，但整个命令随后超过180秒timeout，没有收到完整PWA/脚本退出成功，因此**整体构建未通过验收**。大chunk/无效动态导入警告保留。shell `sh_1819449ae001bCzco3bJa2TaCY`；timeout后进程查询未发现该构建或vite build仍运行（查询本身除外）。本轮没有重启用户应用/后台或既有fixture服务。
- 已检查部署脚本：`--check`只给build传入检查选项，并非只读dry-run，后续仍会编译launcher、写槽位/快捷方式并启动guardian。隔离升级门禁尚未解除，故没有运行 `deploy-renicode.ts --check`，不能把它当成无副作用状态检查。
- 本轮源码及文档定向`git diff --check`通过；Git unmerged路径为空，合并仍未提交/推送。保留原工作区应用改动和实时profile/数据库，未A/B暂存/激活。
- 下一接续点：集中导航/摘要接口、缓存删除keeper负向敏感性；生产构建timeout定位、完整桌面打包、隔离后台/数据库升级及回退边界仍待完成。当前Markdown接口仅承接已有本地图片/链接行为，不宣称项目中心已经可作为独立外部bundle发布。

### 本轮继续：独立输出目录与生产 PWA 验证

- 继续既有批准范围，实施工作树仍为 `C:/Users/reni.li/Downloads/PG/opencode-align`；固定上游未移动，原工作区应用代码及实时后台/profile/数据库未改。没有提交、推送或执行部署。
- 前次180秒timeout本轮未复现：未修复的独立输出构建已正常退出并生成SW（shell `sh_181a8b691001rNRjTNlIzQ30GW`）。Vite部分10.40秒，PWA closeBundle39.2秒；这不是前次超时根因已证明或性能趋势证据。
- 发现确定的产物缺陷：App配置向PWA传入固定 `packages/app/dist`，`--outDir`只改变Vite输出与SW目标，预缓存扫描/完整性哈希仍来自旧dist。修复前临时产物共有2823个带integrity的entry，56个文件缺失或哈希不匹配，包括index.html及错误纳入的旧sw.js。审计脚本 `%LOCALAPPDATA%/Temp/opencode/renicode-align-pwa-audit.ts`；首次内联脚本因PowerShell引号失败未执行审计，改为文件后才得到有效结果。
- 修复 `vite.pwa.ts`：使用VitePWA已提供的 `integration.configureOptions`读取resolved root/outDir，保留其默认globDirectory，完整性读取使用同一输出目录。不关闭完整性、缓存切换或Office按需排除；删除调用处的固定dist参数。`vite.config.ts`同时去掉原any断言与空对象条件spread，最终changed lint无问题。
- 扩展既有service-worker keeper的tiny build到非默认 `output`目录。负向保留旧dist扫描：首次运行缺少指定临时浏览器，未进入行为；改用已安装Chromium后实际1 fail/0 pass，Workbox报预缓存无匹配文件（shell `sh_181aac9a9001RXxL93tw3cgfx7`）。修复后的4项keeper为4/4 pass（19.5秒，1 worker、0 retries，shell `sh_181ab779e001PUqhnhBiZxK9Hc`）。不新增重复unit/source-grep测试。
- 修复后独立App生产fixture构建退出码0、22.634秒（shell `sh_181ab7899001pvcY4hyuFL0c5N`）；输出 `%LOCALAPPDATA%/Temp/opencode/renicode-align-production-after-20261028/`。审计2822个带integrity的entry，0缺失/0哈希不匹配。大chunk/无效动态导入警告仍保留，不声称性能达标。
- App官方tsc通过；首次定向lint报告vite.config原有2项warning，已按代码修正。最终完整check通过：Turbo36/36、34 cached、7.982秒；固定上游changed lint为69个变更文件/0问题（shell `sh_181aca9b9001IBtNAtZcH90KUM`）。后续仅为生产keeper增加可选 `PLAYWRIGHT_BUILD_URL`，允许指向独立build的file URL，默认仍为App dist；最终测试文件检查待补记。
- 此处记录时，非生产service-worker keeper各重复3次、两个真实生产SW keeper、缓存删除owner负向验证、完整CLI/桌面build仍在等待结果。缓存删除负向通过临时Vite transform精确使 `deleted` owner成为no-op，不改磁盘源码、不污染正在构建的桌面；首次临时Playwright config缺少webServer.cwd未启动，已补齐后重跑。不能把夹具启动失败算作keeper敏感性证明。
- 桌面使用 `bun script/build-renicode.ts --build-only`（shell `sh_181aca9b8001Wl63MH2Nw5WqaO`），只构建隔离工作树CLI/resources/out，不启动应用、服务或guardian，不写A/B槽位；此处记录时看到x64与baseline编译进行中，尚未得到整体成功证据。集中导航/摘要接口、完整portable打包和隔离升级/回退门禁仍未完成。

#### 本轮已收到的完整结果

- 非生产service-worker全套10项各重复3次：30/30 pass（1.3分钟，1 worker、0 retries，shell `sh_181adff7f001y6k2M7QqKtcEPR`），覆盖离线未访问路由/嵌套lazy、资源类型/大小、草稿与旧chunk保留、failed/html/corrupt/mixed-html错误部署、blocked下载、旧SW升级及API/缺失asset边界。两个真实生产SW keeper为2/2 pass（23.7秒，shell `sh_181ae92a6001OO4gRFraKx0XgZ`），覆盖全部可部署资源的真实browser缓存、离线HTML及认证代理安装，不执行真实应用/后台。通过 `PLAYWRIGHT_BUILD_URL`指向已审计的独立after输出。
- 缓存删除owner负向最终为1 fail/0 pass（shell `sh_181adff2f001NukkYoUhdDRhQj`）：已完成真实页面就绪、侧栏Removed/Kept可见、删除事件及后续Kept标题更新，最终在Home keeper第119行收到2个link而非1。精确证明confirmed deletion tombstone缺失会留下缓存行；不把第一次config启动失败算敏感性。Vite启动的dependency scan JSX警告保留，但测试已进入并失败于该契约，不是空白页/进程错误。磁盘data.ts始终未改，临时transform仅属于独立4333服务，测试结束由Playwright清理自身服务。
- 完整CLI/桌面build正常退出并打印 `Renicode desktop build complete`。x64和baseline CLI均编译完成；desktop main/preload/renderer产物存在，资源CLI为244607488字节，renderer构建23.47秒。这是build成功，不是portable package或运行健康验收。此后以已构建out调用electron-builder，未运行任何EXE。
- 首次portable命令因PowerShell未引用 `-c.*`参数而误将 `.win.signAndEditExecutable=false`当配置路径，尚未进入packaging；补齐引号后重跑（shell `sh_181b0dd61001vHInKTNT0NtHrZ`），使用已有Electron44.9.1，与package要求一致，结果待收到。未下载替换Electron、未写安装/A-B路径。
- 最新App官方tsc及三个修改文件定向oxlint通过：0 warnings/0 errors（shell `sh_181af84d0001GZRh3p4N7UOk6S`）。真实新版生产fixture上的Home/session-summary全文件在独立4334测试服务运行，结果待补记；服务指向after输出，不替换既有dist或静态服务。
- 仅比较两工作树desktop存储源码，不打开真实数据库：旧联合指纹 `c7d526b05730432af0d443936b4be94c82c271553161ee1cc382d39a40a2e32a`，新版 `7c3b180f2f9a83388fd2535b2f110da38220665fe6c0c81231dc7553dbede45d`；migration.gen/schema均不同，migration.ts相同。脚本 `%LOCALAPPDATA%/Temp/opencode/renicode-align-storage-compare.ts`。这不是已安装版本/迁移journal验证，更不是兼容性证明，不能绕过现有部署门禁。
- 最新源码/keeper最终完整check通过：1461 warnings、0 errors，11 guide blocks匹配，Turbo36/36、34 cached、8.087秒；固定上游changed lint69个变更文件/0问题（shell `sh_181b17e2e0013zGgvaP7J07dn4`）。未声称全仓warning已清零。
- 新after产物Home/session-summary首次25 pass/8 fail（shell `sh_181b0b222001ybv2cJBkOH6iDU`）：临时静态服务的路径边界把根路径 `/`直接返回404，8个失败均从Home根路由开始，定制导航/日期/删除和session-summary已通过。仅修正临时服务的根HTML分支，源码/keeper/断言未改，原失败资产保留于 `renicode-align-home-production-pwa/`；更正后的全文件运行 `sh_181b27222001pIrKpL79yF46Tj`，资产另存 `renicode-align-home-production-pwa-corrected/`，此处结果待收到。临时服务修复不作为产品bug修复。
- 更正静态夹具后的新after生产Home/session-summary为33/33 pass（33.6秒，5 workers、fullyParallel、0 retries，shell `sh_181b27222001pIrKpL79yF46Tj`）。已包含两种缓存删除正向、草稿/日期/工作树与详情行为；未增加sleep、重试或放宽断言。4334只属于测试，结束由Playwright清理；未重启4318/4319或用户应用。

#### 合成内存数据库的升级/回退边界

- 用真正两版本 `migrateDatabase`和 `node:sqlite`在 `:memory:`验证，不读/复制真实profile或数据库；脚本 `%LOCALAPPDATA%/Temp/opencode/renicode-align-desktop-migration-smoke.ts`。先运行原版本4项migration，插入合成extension启用状态及合成archive blob，再运行新版migration。
- 新版实际新增2项：`20261013231314_drop-extension-files`删除archive表，`20261014210000_rename-extension-to-plugin`将extension改名plugin、创建旧名只读view。合成启用状态、manifest/revision可经旧view读回，新版再次migrate返回空，旧版再次migrate也返回空。
- **不能据此承诺原版回退可正常工作**：旧版实际 `UPDATE extension SET enabled`失败，错误 `cannot modify extension because it is a view`；extension_file表已不存在。该结果是合成数据库隔离证据，不是实时数据已被删除。原版rollback即使打开数据库也不等于旧插件设置/档案操作兼容，现有联合指纹拒绝部署的门禁必须保留。
- 尚需后台存储/执行升级验证、隔离profile全链路以及可审阅的备份/恢复与回退方案；任何改变实时数据或接受不兼容回退的重大取舍，在实施前确认。本轮未改迁移实现、未绕过门禁、未运行部署脚本。

#### Portable 产物审计与品牌修正

- 修正PowerShell参数后的electron-builder命令成功退出，已形成 `packages/desktop/dist-renicode/win-unpacked/Renicode.exe`及app.asar；未启动它。afterPack未报错，CLI架构/非空版本/node-pty打包校验通过。description缺失、非当前平台optional native依赖缺失，以及按既有portable方式跳过EXE资源编辑/签名的警告保留；不是已签名安装包。
- 首次静态asar审计脚本用Unix分隔符在Windows未找到renderer路径，修正为本机path.join后才获得有效检查。实际发现品牌遗漏：旧 `transformIndexHtml`匹配 `<title>OpenCode</title>`，新版生产HTML为 `<title data-sm>OpenCode</title>`，故打包前标题仍为OpenCode。metadata为renicode-desktop/2.2.0-renicode.1、main/preload存在、CLI/version/storage指纹逐字节相符，但此产物不能算品牌验收通过。
- 仅修正electron.vite.config标题替换以保留 `data-sm`并使用Renicode，不改上游MetaProvider交互。实际修复前asar审计已失败于title，未放宽成检查别处的Renicode字样；修复后使用官方 `bun script/build-renicode.ts --desktop-only --portable --electron-dist=...`重新build/pack并自动审计（shell `sh_181b6610c001R5ceu4kC3vxAdb`），此处结果待收到。
- 品牌修正后Desktop官方tsc、定向oxlint0 warnings/0 errors通过。最终完整check通过：1461 warnings/0 errors、11 guide blocks匹配、Turbo36/36、35 cached、6.625秒；固定上游changed lint69文件/0问题（shell `sh_181b6b466001FiTTi5X3SrP70T`）。App e2e官方类型检查仍失败于原续作记录中的同11条其他文件错误，Home与service-worker本轮修改无诊断（shell `sh_181b73cf9001vFywjgtr07GGmk`）；不称整个e2e类型检查通过。
- 集中导航/摘要接口已核查：现有SlotMap尚无window主导航位置；ServerRef公开client/data，但没有Home缓存summary与本地project/draft选择映射。侧栏仍调用Home controller及共用home-sessions查询，tabsPortal/resize/peek容器属于宿主。后续需在集中宿主适配层公开只读摘要/选择，业务通过通用slot迁入插件；不得让插件导入App或复制消息历史/执行器。本轮未实施该接口，不将现有嵌入侧栏算作插件化完成。

#### 本轮交接结论

- 官方Renicode portable重建/打包命令及自动asar审计最终退出0（shell `sh_181b6610c001R5ceu4kC3vxAdb`）：packageName/version、保留data-sm的Renicode标题、main/preload与CLI/version/storage资源全部通过。产物位于隔离工作树 `packages/desktop/dist-renicode/win-unpacked/`，版本 `2.2.0-renicode.1`；没有运行此EXE。品牌修正前失败历史保留，不以最终成功覆写此前证据。
- 本轮独立生产App fixture整体构建、2822项integrity审计、SW重复30/30与真实生产2/2、Home/session-summary33/33、缓存删除owner负向敏感性、完整CLI/desktop build与portable静态审计已完成。完整check/定向官方tsc通过；e2e整体类型检查同11条其他文件错误仍失败。尚未完成整个宿主GUI或新版实际进程健康验收。
- 本轮启动的负向4333及正向4334服务均由Playwright生命周期管理、测试已结束；未停止或重启先前服务/用户桌面/后台。构建与打包命令已结束，无待收结果；未提交、推送、A/B暂存或激活，实时profile/数据库保持未动。
- 下一步保持原生效范围：集中导航/只读摘要接口与侧栏业务插件化；后台升级及隔离profile端到端验证；形成备份/恢复和可接受回退边界，重大取舍确认后才操作实时数据。现有指纹门禁不改，不运行有写入副作用的deploy --check来代替只读检查。

### 本轮继续：集中导航/只读摘要接口

- 在既有 PG隔离工作树添加公开 `SlotMap["window.navigation"]`、`Navigation`、`NavigationView`、`NavigationProject`和`NavigationSession`。投影只含项目key/目录/名称和会话id/项目key/title/href/activity；宿主 `runtime/plugin/navigation.ts`继续共享 `home-sessions`查询、缓存合并及confirmed deletion，不加载消息历史，Home/draft/session/sandbox选择与tab路由动作集中在宿主。watch限定在slot组件Solid owner，查询随组件结束。
- 原shell侧栏的业务呈现迁入 `gui-plugins/src/project-navigation/`，保留单分钟时钟和宿主共享Intl formatter。shell仍拥有旧opened/width持久化、布局/resize/dock/peek与vertical tabs portal；main清单也登记window-only插件，保持id保留。专属英文文案逐字保留，共享Projects/empty保留原词条及各语言翻译，不新译词条。没有新增路由、存储架构或修改Protocol/HttpApi。
- 首次GUI官方tsc失败于ES库不声明Map.groupBy，App官方tsc失败于sessionHref要求branded ServerConnection.Key；改用typed Map reducer和Key.make后GUI/App官方tsc均通过，Plugin官方tsc通过。未扩大tsconfig或用断言掩盖错误。
- 首轮changed lint为9个spacing问题，已补齐。首轮完整check（`sh_181c04c59001AaRIdLkUmdbFYa`）lint1470warnings/0errors，但新增builtins未同步guide block而失败；同步window/main blocks后次轮changed lint75文件/0问题，lint1461warnings/0errors、11 blocks与255 declarations/954 members/287 parameters均通过，但整个check在Astro阶段120秒timeout（`sh_181c1ad92001PCK2J6LfOo1jER`），不算完整check通过。
- 独立App生产fixture整体build退出0（`sh_181c1adb1001sZa7zn83USOy3d`）：Vite27.02秒、PWA2822 entries/35962.42KiB，输出 `%LOCALAPPDATA%/Temp/opencode/renicode-align-navigation-production-20261028/`。大chunk/无效动态import警告保留；不覆盖原dist或重启旧fixture。
- 该新产物在独立4335测试服务运行原Home/session-summary全文件：33/33pass、31.3秒、5workers/fullyParallel/0retries；资产 `renicode-align-navigation-e2e/`。之后在原project navigator keeper增加选中项目允许手动折叠、离开再选择自动展开的断言，可信退化是插件迁移漏保留自动展开或禁止手动收起；原keeper此前没有同时断言这两个状态。

#### 同配置生产成本记录（不是性能结论）

迁移前/后各4场景、均Chromium/4334/串行1worker/0retries、每场景仅单样本；原始资产分别位于 `%LOCALAPPDATA%/Temp/opencode/renicode-align-navigation-before/`与`renicode-align-navigation-after/`，临时config同名前后 `.config.mts`。before4/4（34.9秒），after4/4（10.6秒），不以suite耗时差推断产品趋势。

| 场景 | before → after |
| --- | --- |
| 500会话 | 请求1→1，字节257100→257100；rowsMs305→304.2，heapMB25.39→27.50 |
| 5000会话 | 请求1→1，字节2574810→2574810；rowsMs372.8→415.8，heapMB31.11→21.52 |
| 10000会话 | 请求2→2，字节5149705→5149705；rowsMs446.3→532.3，heapMB26.26→31.37 |
| 10000会话20次后台更新 | sessionReads23→23；medianMs31.65→35.35，p95Ms33.6→38.8 |

未强制GC，heap是renderer main isolate而非整个桌面。请求/字节/读取计数未增加；时间与heap只是观测，未证明退化、改善或达标。

#### 正在执行的验证与门禁

- 导航4项各重复10次：`sh_181c4d4250014IBp029gKprF11`，4335生产fixture/5workers/fullyParallel/0retries；含扩展的手动折叠及重新选择断言。此处尚未收到结果。
- 选择owner负向：`sh_181c4d425002R6Ds3hYrdTTn6Z`，4337独立Vite transform仅将宿主view.project临时改为undefined，不改磁盘代码，1worker/0retries。此处尚未证明实际进入行为断言。
- 冷扫描built-in依赖矩阵：`sh_181c4d47f001lkNfjSFBaN0Rqb`，4336独立stories/Vite --force，测试期间不改源码；等待结果，不能用e2e通过代替真实host矩阵。
- 最终300秒全仓check与fixed-upstream changed lint：`sh_181c4d4dd001atTZjtFg41ENTw`，尚待结果。以上测试服务由Playwright生命周期管理，文档completed不表示进程已结束。
- 本轮未更新portable产物、未启动新版EXE或后台、未复制/迁移实时profile。旧数据库回退不兼容门禁未改；未运行deploy --check、提交/推送或A/B暂存/激活。

#### 收齐结果与导航缺陷重开

- 上述最终完整check已通过（`sh_181c4d4dd001atTZjtFg41ENTw`）：1461 warnings、0 errors，11 guide blocks一致、Turbo36/36；固定上游changed lint75文件/0问题。独立生产产物2822项PWA存在性/integrity审计全部通过。
- 冷扫描真实built-in依赖矩阵 `plugin-graph.spec.ts` 为1/1 pass（29.9秒，`sh_181c4d47f001lkNfjSFBaN0Rqb`），没有运行中dependency reload。宿主选择owner负向实际失败于Current project缺少 `aria-current="true"`（`sh_181c4d425002R6Ds3hYrdTTn6Z`），磁盘代码未改；证明keeper能捕获宿主漏传选择。
- 40项导航重复命令 `sh_181c4d4250014IBp029gKprF11` 最终120秒timeout，没有完整计数；已显示至少9次相同失败，均在Home keeper第57行重新选择Other project后 `aria-expanded="false"`。已有部分删除/日期通过不能补算为完整通过。资产 `renicode-align-navigation-e2e/`保留。
- 本次是产品缺陷而非HMR：项目已有 `aria-current="true"`，但重新选择仍未展开。宿主projects memo依赖directory并重新map所有对象，使Solid For重挂载行、visit重置，与ServerProjects保存的手动折叠visit相撞。
- 已在宿主分离inventory投影memo，选择变化直接复用已知项目数组/对象，仅未列出的当前项目追加fallback；没有放宽keeper或更改折叠语义。App官方tsc通过；修复后独立生产build `sh_181c8e2e5001cW9fvP6ztmht2h`进行中，新输出为 `renicode-align-navigation-stable-production-20261028/`。修复后重复/完整suite与tabs回归尚未验收，旧性能观测属于修复前产物。

- inventory修复后build已退出0（Vite14.92秒、PWA2822 entries），2822项存在性/integrity审计0 failures。最终完整check `sh_181c9901e001LN5T2WikAyG1vx`通过：1461warnings/0errors、11 blocks匹配、Turbo36/36（34 cached）；changed lint75文件/0问题。e2e类型检查仍为同11条其他文件错误，Home/tabs无诊断。
- 4339修复后4项导航各重复10次正在运行（`sh_181c98f9d001CIfFZXuL1xOSAN`，5workers/fullyParallel/0retries），独立资产 `renicode-align-navigation-stable-repeat/`，不覆盖修复前失败。
- 首次竖向tabs五项为0 pass/5 fail（`sh_181c9e037001mT67Zt3vHmMS57`）：均停在 `vertical-tabs-sidebar` strict mode，outer shell aside与embedded ProjectSidebar aside重复同一data-slot；尺寸/重开结果尚未进入，不算行为通过或keeper问题。资产 `renicode-align-navigation-tabs/`保留。只修正embedded内层不再拥有外层slot，原测试未改；新独立shell产物build `sh_181caf32f0012jY52AlT58H9Uc`进行中，之后重跑全部相关用例。

- 分离memo并未完成修复：4339重复最终30 pass/10 fail（2.5分钟），10次导航均在第57行失败，删除两来源/日期各10次通过。初始“只由directory重新map”的定位不完整，不将源码修改或类型检查当成行为修复成功。
- shell修复后独立build退出0（Vite16.89秒/PWA2822项），integrity审计通过；官方App tsc、完整check1461warnings/0errors/Turbo36/36、changed lint75文件/0问题均通过（`sh_181cba0710015v3hjAwc8ZXRBU`）。三个文件按title过滤的53项为52 pass/1 fail（38.5秒，`sh_181cb9fb2001OwB3sWCcsSfM2P`），唯一失败仍是导航第57行；五项竖向tabs全部通过，含136–640px resize/滚动/快捷键/导航与四个页面折叠重开。不将过滤运行冒称三文件全套通过。
- 进一步修正inventory刷新也可能重建对象：按project key复用directory/name均未变的摘要对象，避免新草稿相关项目刷新重置行visit。App官方tsc通过；新独立keyed build `sh_181cd11d90016CvSoYrKJ636UV`进行中，正向行为仍待验证。没有修改测试、增加重试/sleep或操作实时数据。

- keyed产物build退出0（Vite14.84秒、PWA2822项）；原导航keeper单次1/1 pass（6.1秒，4341/1worker/0retries），覆盖原第57行重新选择展开及后续草稿刷新；这是首次修复后行为通过，不等于重复稳定通过。已启动同源码4项各重复10次，成功后顺序运行Home/session-summary/tabs三个完整文件（`sh_181ce7054001vKcFczrnxottNE`，5workers/fullyParallel/0retries），分别独立保存keyed-repeat/keyed-full资产。最终keyed产物integrity/check/changed lint也在运行（`sh_181ce71e3001N40005FOhfNTr5`），本段尚待结果；修复后生产成本需单独无并行负载采集。

#### 最终 keyed 产物验证收齐

| 检查 | 实际结果与边界 |
| --- | --- |
| keyed build | `sh_181cd11d90016CvSoYrKJ636UV`退出0，Vite14.84秒、PWA2822 entries；产物`%LOCALAPPDATA%/Temp/opencode/renicode-align-navigation-keyed-production-20261028/`，没有覆盖原dist或旧产物。 |
| keyed integrity / 全仓check / changed lint | `sh_181ce71e3001N40005FOhfNTr5`全部通过：2822项文件存在且integrity相符、0 failures；1461warnings/0errors、11 guide blocks匹配、Turbo36/36（34 cached）；固定上游changed lint75文件/0问题。 |
| 导航四项各重复10次 | `sh_181ce7054001vKcFczrnxottNE`第一条命令40/40 pass（1.8分钟）；4341/Chromium/5workers/fullyParallel/0retries。导航折叠/重新选择/草稿刷新、两来源删除及日期各10次通过；资产`renicode-align-navigation-keyed-repeat/`。 |
| Home/session-summary/tabs三个完整文件 | 同shell顺序第二条命令70/70 pass（40.4秒）；同产物/端口/并行参数、0 retries，无title过滤；资产`renicode-align-navigation-keyed-full/`。包含五项竖向tabs keeper，不再以此前52/53过滤结果代替全文件。 |

以上行为通过覆盖最终按key复用摘要对象和embedded slot修复；前次失败资产及错误定位历史全部保留。尚未解决e2e类型检查同11条其他文件错误；最终portable未按本阶段修改重建，不能把旧portable称为当前导航产物。

#### 最终产物串行生产成本

- 在上述回归和完整check结束后运行，同Chromium/4334/1worker/0retries、四场景各单样本；使用既有`home-session-index-benchmark.spec.ts`，未修改测试或生产源码。
- 首次命令启用`OPENCODE_PERFORMANCE_MEMORY=1`，runID为`renicode-align-navigation-keyed-final`，`sh_181d130b6001GuXlaSCHLg8p53`为4/4 pass（10.2秒）。显式GC后的500/5000/10000会话retainedHeapMB分别17.94/18.89/18.94；资产`renicode-align-navigation-stable-performance/`。这组为独立内存诊断，不与此前无显式GC样本作时间/heap对照。
- 随后显式设为`OPENCODE_PERFORMANCE_MEMORY=0`，runID为`renicode-align-navigation-keyed-matched`，完整四项4/4 pass（10.2秒）。资产另存`%LOCALAPPDATA%/Temp/opencode/renicode-align-navigation-keyed-matched-performance/`，不覆盖显式GC或迁移前后资产。

| 无显式GC场景 | 请求/字节或读取 | rowsMs / heapUsedMB，或更新延迟 |
| --- | --- | --- |
| 500会话 | 1请求 / 257100字节 | 282.7ms / 26.79MB |
| 5000会话 | 1请求 / 2574810字节 | 361.9ms / 21.41MB |
| 10000会话 | 2请求 / 5149705字节 | 534.4ms / 31.54MB |
| 10000会话、20次后台更新 | 23次sessionReads | median34.55ms / p95 46.5ms |

请求、字节及后台读取计数与迁移前保持相同；单样本时间和heap仅为观测，不证明性能改善、退化或达标。heap范围是renderer main isolate，不是桌面总RAM。

本段记录时测试命令已全部结束；此前独立服务历史不由文档状态推断停止。未提交/推送，未操作实时profile/数据库、重启桌面/后台或A/B暂存/激活。集中导航阶段证据收齐不解除旧版插件设置无法写入新数据库的回退门禁；下一步仍需隔离端到端升级与可审阅备份/恢复设计。
