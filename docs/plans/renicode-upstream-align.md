# Renicode 对齐 OpenCode 2.2 与定制迁移

<!-- wiki: {"kind":"plan","workflow":"active","revision":2,"change":"none","relations":["docs/discussions/opencode-upstream-sync.md","plans/project-center.md","docs/validation/sidebar-conversation-time.md","docs/validation/renicode-launcher-visibility.md","docs/validation/renicode-align-resume.md","docs/discussions/renicode-upgrade-recovery.md","docs/validation/renicode-align-upgrade.md"]} -->

## 授权与当前生效范围

- 2026-10-28 用户要求开始实施，并明确选择「先对齐 2.2 再迁移」。授权本计划编制及范围内实施；不是仅作评估。
- 2026-10-29 用户明确要求“全部提交推送”，授权将原 `renicode` 工作树现存定制/文档与隔离 `align-renicode` 的上游合并/迁移结果分别记录并推送到自有 `origin` 对应分支。此授权覆盖此前“不自动提交”的限制，不授权强推、向官方提 PR、部署或迁移实时数据。
- 基线：Renicode HEAD `9e5b9db11`，上游已核实的 2.2.0 dev 快照 `86ce19d96eccbfb95af3ff3189c7071575f94339`。该快照含发布后的安全/稳定性修复，后续不随意移动基线。
- 对齐上游，保留现有定制及未提交工作；迁移到新版 GUI 内置插件架构，补齐必要通用宿主接口，减少散布在 shell/Home 的定制依赖。
- 保留 Midea 配置、品牌、独立 profile、patch 安全保护、Unicode 工具检索、move requested 语义、项目中心引用/快照、侧栏对话时间，以及独立 A/B 启动器。
- 包含后台与数据库升级方案、隔离验证与构建；符合安全条件后按 A/B 暂存，不强行激活、不关闭或重启运行中的桌面/后台。

## 不在范围内

- 不恢复 task-mode、无人值守运行或任意暂停任务。
- 不删除/覆盖原工作区用户改动，不自动提交用户工作，不清理历史槽位，不覆盖原安装。
- 不绕过后台/数据库指纹检查，不因对齐上游就使用自动重启或迁移实时 profile。
- 不新增语音/图像生成等产品定制，不为插件化复制整套 SessionRunner 或工具执行器。
- 不修改用户 Midea 凭据，不将实际 profile/聊天内容写入 Git。

## 待确认变更与门禁

- 当前选择覆盖对齐与迁移方向，但具体后台/数据库升级机制尚无已批准设计。先核实升级要求与隔离证据；改变实时数据、允许不兼容回退等重大取舍在执行前确认。
- 通用左导航/摘要及 Markdown 来源接口需根据 2.2 宿主确定形状；若必须扩大为新的路由、执行或存储架构，另行确认，不静默扩展。
- 若必须减少现有功能、改变引用/会话时间语义或替换 Midea 集成，不默认获准。

### revision 2 已确认的具体升级机制

- 2026-10-29 用户选择“版本化 profile（推荐）”，批准 `docs/discussions/renicode-upgrade-recovery.md` 的独立代际、迁移-aware A/B 与隔离验证。
- 不兼容候选只暂存程序，不能成为现有 guardian 的自动 pending；复制/激活仅在用户正常退出桌面且旧后台正常停止的窗口内显式执行，禁止无人值守迁移、关闭或强制重启当前程序。
- 原安装、原槽位和原 profile 保留。回退切回旧程序/旧数据；升级后新增聊天/设置保留在新代际，但不自动合并到旧 UI。用户已接受此边界，不授权删除任一代际或提交/推送。
- 固定上游、保留定制与此前验收范围不变。只对已确认的具体升级设计生效；未满足条件前不迁移实时数据。

## 实施顺序与验收

1. **保护与隔离**：记录 Git 状态；将当前 tracked diff 和 untracked 文件保存为只读迁移输入；建立隔离工作树。原运行版本和源码保持不动。
2. **上游对齐**：合并固定上游快照，按冲突分类保留基础机制和 Renicode 定制。旧 scripts/gui-extensions/stories 路径适配到新版；不恢复上游删除的旧包。
3. **保留行为**：移植品牌/profile/build、patch 与工具语义、项目中心内置插件及详情定制。逐包类型检查和既有 contract 回归，不用通过注释/断言隐藏兼容错误。
4. **减少核心差异**：先记录生产页面基线，再将侧栏业务移入插件，通过集中导航与摘要接口接入；提供有作用域的 Markdown 来源/资产接口，维持白名单读取和取消信号。
5. **验证**：全仓 `bun run check`（需要时通过 `bun --bun` 运行 lint）；相关官方 `typecheck:tsc`；项目中心 reader/source 与真实草稿、回跳、图片、late IPC/store 回归；Home/draft/worktree 高亮、列表成本和对话时间；profile 隔离、打包及启动器验证。
6. **升级与交付**：数据库/后台在隔离 profile 验证，形成可审阅升级与回退边界；再决定是否满足安全暂存条件。无安全路径时明确阻塞，不跳过检查。实际激活只发生在用户正常退出后。

## 当前进度与实际证据

- 已核实 API 能力：公开插件不足以原样承载左侧导航与 Markdown 自定义资产；详见讨论。
- 原工作区 `renicode` 有未提交项目中心/侧栏/启动器/文档工作，尚未覆盖、清理或提交。
- `origin/dev` 不存在于当前远端引用；已有上游 `upstream/dev` 及固定快照。对齐使用用户选择的 2.2 上游，不假设 origin/dev 存在。
- 当前 shell PATH 不含 Bun；已找到获准临时目录中的 Bun 1.4.4，后续命令显式配置 PATH，不修改全局环境。
- 尚未完成合并、构建、测试或部署；估计 4–7 个工作日是粗略工作量，不是交付承诺，也不表示已安排后台持续执行。

### 2026-10-28 隔离合并进度

- 冻结输入：`%LOCALAPPDATA%/Temp/opencode/renicode-align-input-20261028-103959/`，包含 tracked working/fork patch、manifest 和 25 个 untracked 文件；冻结时逐文件 SHA-256 相符。
- 实施工作树：`C:/Users/reni.li/Downloads/PG/opencode-align`，分支 `align-renicode`，从 Renicode HEAD 合并固定上游；未提交、未推送。正文主维护位置仍为原工作区本文件，不复制第二份 active 计划。2026-10-28 用户将项目整体移入 `Downloads/PG`，原位置为 `Downloads/opencode-align`，历史验收中的旧路径保留。
- 初始 22 个 unmerged 路径，已解决并暂存其中 12 个：桌面 configure/appearance/early、electron-vite、patch、设置 controller、English 字典，以及 icons/launcher 三文件的位置冲突与旧 prebuild 删除。
- 桌面构建准备接入上游 `script/build.ts`，保留 Renicode 本地 CLI 要求、storage 指纹和相同字节不替换的保护；旧 `scripts/prebuild.ts` 的定制已移入新入口。根构建/部署/迁移脚本适配新版路径和打包命令，版本为 `2.2.0-renicode.1`。尚未实际构建或执行部署/迁移脚本。
- patch 合并同时保留目的地审批预览、审批期间内容变更拒绝，以及上游「移动到同一路径按普通更新处理」修复。此部分仅完成语法解析，实际 Core 回归待新版依赖。
- 原工作区最新 launcher/runtime/test 与冻结原生 GUI fixture 已移到 `packages/desktop/script/`；规范化 CRLF→LF 后正文完全相同，未声称原始字节相同。
- 详细初步证据见 `docs/validation/renicode-align-merge.md`。真实窗口可见性重复回归 30/30、launcher-store 重复回归 100/100；完整双文件回归仍有 7 个依赖加载失败，不能视为整体兼容通过。
- 剩余 10 个 unmerged 路径：Home/session-summary keeper、wordmark、shell/titlebar、settings/migrate 三个脚本位置冲突、旧 details 两文件。项目中心和侧栏最新工作尚未完整移植；未安装依赖、全仓检查、打包或触碰实时 profile。

### 2026-10-28 用户要求继续后的进度

- 用户本轮要求继续本计划；仍在既有隔离工作树 `opencode-align` 实施，固定基线、原工作区未提交应用改动和实时数据门禁不变。
- 本轮解决并暂存另外 9 个冲突路径，目前仅 `packages/app/src/shell/shell.tsx` 为 unmerged。累计解决 21/22 初始路径是 Git 冲突计数，不表示功能迁移完成率。
- `NewSessionWordmark` 保留上游新版参数和交互实现；Renicode 分支保留静态品牌并传递元素 ref。旧频道徽标已被上游删除，品牌标记接入现有 Home 按钮，不恢复旧 Extension 依赖；外观和交互仍待 GUI 验证。
- 固定详情浮层移到 `packages/gui-plugins/src/details/popover.tsx`，保留原 Summary/Pin/Unpin 文案，同时保留上游缓存页面快捷键选择、指针/键盘焦点和服务 flyout。旧 details 两个遗留路径按迁移结果删除，原工作区和冻结输入仍保留。
- Home/session-summary keeper 合并双方 imports，保留定制用例和上游新用例；固定浮层用例改用新版 MCP group。冻结输入中的最新日期 keeper、侧栏时间与项目中心尚未完整迁移，不能声称这些回归已通过。
- 新版依赖 `bun install --frozen-lockfile` 已在隔离工作树启动，shell ID `sh_18074f19100185oIQnJ3KgvtrQ`；此处记录时尚未收到完成结果。没有运行迁移/启动服务脚本、没有重启桌面或后台。
- 9 个本轮源码/keeper/脚本通过 Bun.Transpiler 语法解析；本轮已解决路径的 `git diff --cached --check` 通过。整个 staged 合并的 whitespace 检查失败，涉及上游新增 dependency patch 与 TUI 文件，尚未处理；不能将局部检查表述为全仓通过。详见 `docs/validation/renicode-align-resume.md`。

### 2026-10-28 依赖安装后与生产构建进度

- 新版依赖 `bun install --frozen-lockfile` 成功，安装 1816 个包；锁文件相对固定上游仅增加已有 improvement workspace。5 个旧 dependency patch 不适用的警告仍保留，未擅自删除补丁。
- 初始 22 个冲突全部解决并暂存；最新 `git diff --name-only --diff-filter=U` 无路径输出。合并仍未提交、未推送；最新部分构建脚本和 README 编辑尚未暂存。
- Shell 为过渡接入：上游折叠、peek、宽度/缩放容器保留，嵌入现有 `ProjectSidebar`；垂直 tabs 动画容器与 Titlebar portal 分离。业务插件化、旧宽度偏好恢复和 GUI 行为仍待验收，不能视为集中导航接口已完成。
- 项目中心冻结源码已迁入 `packages/gui-plugins/src/project-center/`，保留 shipped id `project-center`，接入 `Plugin.define`、`builtinCatalog` 和 `ctx.use(ProjectCenter)`；保留 Live generation/inactive/pending 分支。未复制旧 page fixture，通用 Markdown 来源/资产接口尚未完成。
- 实际回归：Desktop 启动器/偏好迁移 25 pass、0 fail；Core patch 88 pass、0 fail；项目中心 reader/source 15 pass、0 fail。GUI 插件 `bun typecheck` 和官方 `typecheck:tsc`、App `bun typecheck` 均通过。Desktop 最新 `bun typecheck` 通过，2936 文件、2 projects。
- `pin` 图标清单通过 `packages/plugin` 的 `bun run generate` 更新。GUI composition guide 两处源码列表已同步，正在复跑全仓 `bun --bun run check`；前次检查在 guide blocks 不一致处失败，未完成全仓类型检查。
- App 生产 fixture 构建成功（`VITE_OPENCODE_TEST_FIXTURES=1 bun run build`，53.21 秒）；仍有无效动态导入和大 chunk 警告，不等于性能验收通过。
- 固定上游基线的 lint 首次因本机 Node 无法加载 `.ts` lint 插件失败，正在以 `bun --bun run lint:changed -- <固定上游>` 重试。默认 merge-base 检查的 1014 条问题不能直接算作本轮新增问题。
- 独立静态 fixture 服务位于 `127.0.0.1:4318`，Home/session-summary keeper 正在运行；不连接真实后台。详情固定行为、侧栏导航、最新时间语义与项目中心 GUI/回跳/图片均未宣布通过。实时桌面、后台、profile/数据库未改，没有 A/B 暂存或激活。

### 2026-10-28 检查完成与重复回归发现

- 全仓 `bun --bun run check` 通过：1681 warnings、0 oxlint errors；11 guide blocks 与源码一致；Turbo 36/36 tasks successful，耗时 1m27.724s。这是本轮完整检查通过，不解除 GUI、性能、打包及部署门禁。
- 生产 Home/session-summary keeper：30/30 通过，2 workers、无重试，54.4 秒。随后两个定制用例各重复 10 次、5 workers、fullyParallel、无重试：固定浮层 10/10 通过，项目导航 9/10 通过。失败发生在草稿刷新后的项目高亮恢复，不能将首次全文件通过表述为重复稳定性通过；尚未判定产品恢复缺陷或夹具时序。
- 固定上游 `lint:changed` 正常完成但未通过：218 problems，10/60 files。103 条 wordmark 诊断位于固定上游未改变的行；其余主要是 Renicode 启动器/侧栏/构建定制，不将其全部称为上游既有问题。已仅补齐侧栏/构建两文件的空行，两文件 targeted oxlint 为 0 warnings、0 errors；全量 changed lint 仍未通过。
- 串行 5000 会话生产基线已启动，run ID `renicode-align-sidebar-before`，shell `sh_1808a84d6001LMqoKlfJwRF7j0`。使用新版工作树、Chromium、独立 fixture 4318，不复用指向原工作区的旧 msedge 配置；结果未收到，不与旧单次 msedge 数字直接比较。
- 基线首次被 benchmark 目录内 Bun unit test 的收集阻塞；改为明确选择既有 `home-session-index-benchmark.spec.ts` 后通过，未修改生产或测试断言。5000 会话单样本：1 次列表请求、2574810 字节、rowsMs=326.7、heapUsedMB=31.61、nodes=2328。仅为后续同配置成本比较，不是性能趋势或达标结论。

### 2026-10-28 草稿恢复定位与最新日期实现

- 用户继续要求沿用既有批准范围；仍在隔离工作树实施，没有更新上游基线、提交/推送、覆盖原工作区应用改动或操作实时后台/数据库。
- 项目导航 keeper 旧生产 fixture 重复 20 次、5 workers、无重试：13 pass、7 fail；trace 确认刷新后从同一草稿 URL 退到 Home、草稿 tab 缺失，不只是高亮样式。将 `newDraft` 的 tab 写入移出异步 route transition，避免持久化定时器读取未 commit 的旧 tab store；未重构通用持久化。原 keeper 保留高亮断言，新增同一草稿 URL/项目控件断言，修复后的重复回归正在运行。
- 最新对话时间及日期 keeper 已移入新版 sidebar/i18n/Home suite；使用 `idle ?? created`、共享 Intl formatter 和单个分钟时钟，普通更新时间不表示新对话。日期 keeper 对旧生产 fixture 的负向运行确实失败；修复后的正向结果待收到。新版 data 已保留 confirmed deletion tombstone，不机械覆盖其新版活动事件逻辑。
- 新生产 fixture 构建成功（约 74 秒），PWA 2822 entries、35960.98 KiB；仍有大 chunk/无效动态导入警告。最新全仓 `bun --bun run check` 通过：1675 warnings、0 oxlint errors，11 guide blocks 匹配、36/36 Turbo tasks successful（34 cached）；这是完整检查通过，不代表 GUI/性能/打包或部署验收。
- 固定上游 changed lint 仍失败：212 problems、8/61 changed files，剩余在 wordmark/desktop 启动器定制；本轮 sidebar/i18n/tabs/Home keeper 未列入问题路径。不把其余问题全部归为上游，后续继续处理。
- 详细 before 资产、命令 ID 与边界仍记录在 `docs/validation/renicode-align-resume.md`。4318 隔离静态 fixture 服务继续运行，不连接真实后台；未 A/B 暂存或激活。

## 变更记录

### 2026-10-28 正确夹具回归完成

- 重建后旧 4318 静态服务缓存旧 index；该端口的重复回归 40/40 失败于首次 heading readiness，未进入行为断言，不作为产品验收。失败历史保留，未重启旧服务；正确服务改用独立 4319。
- 4319 的草稿/日期 keeper 各重复 20 次：40/40 pass（40.0 秒）；随后 Home/session-summary 全文件 31/31 pass（28.7 秒）。均 Chromium、fullyParallel、5 workers、0 retries；本轮重复草稿恢复与日期行为已通过，不扩展到完整 GUI 验收。
- 最新 App 官方 tsc 与定向 oxlint 通过；e2e 类型检查仍有其他文件 11 条错误。5000 会话 after 单样本通过：1 次列表请求、2574810 字节，详见验证记录；与 before 请求/字节相同，但负载不同且均单样本，不推断性能趋势。
- 完整打包及隔离升级门禁不变，未暂存/激活 A/B，未提交/推送。主计划仍仅维护本文件。
- 缓存删除 keeper 两种来源已迁入新版 Home suite，首次 2/2 与各重复 20 次合计 40/40 通过；不修改新版 tombstone。负向 owner mutation 尚待执行，完整验收边界见验证记录；最新 e2e 类型检查仍有其他文件 11 条错误。
- 缓存删除迁移后 Home/session-summary 全文件 33/33 pass（23.8 秒），5 workers、fullyParallel、0 retries；Home 最终定向 oxlint 0 warnings、0 errors。未修改生产代码或解除部署门禁。

- revision 1：用户确认先对齐 2.2 再迁移，开始隔离实施；原讨论中「未授权实施」是之前评估阶段的历史记录，不覆盖本次授权。

## 下一步

### 2026-10-28 最新接续与项目目录迁移

- 本轮桌面定制与 wordmark lint已清理，固定上游 changed lint为64个变更文件、0问题；Desktop 25/25回归及runtime/store重复240/240通过，Desktop官方tsc通过。项目中心GUI四项旧keeper已迁入新宿主，正向4/4通过，真实Composer引用/请求/回跳边界保留；首次locator歧义失败及修正证据保留于续作验证。负向运行遇进程中断，不算敏感性通过。
- 用户将项目整体移入 `C:/Users/reni.li/Downloads/PG` 并明确要求更新Renicode地址：已修复Git工作树与两工作树依赖Junction，原/隔离源码默认registry及路径提示同步。未修改实时数据库、配置凭据、A/B槽位或安装版本；具体证据与未生效项见 `docs/validation/renicode-pg-relocation.md`。
- 新位置reader/source两版本各15/15、隔离GUI官方tsc、原GUI Bun检查通过；真实只读默认registry读取绑定renicode、29篇文档、0 warnings。新位置固定上游changed lint：64个变更文件、0问题；完整`bun --bun run check`通过：1463 warnings、0 errors，11 guide blocks匹配，Turbo 36/36 successful、33 cached、12.692秒。缓存重放中的旧路径不属于活跃配置；本次独立移后证据不替代剩余产品与升级验收。

### 2026-10-28 本轮继续：Markdown 来源接口

- 用户继续既有批准范围，仍在 PG 隔离工作树实施。项目中心引用keeper的负向owner mutation已实际失败于真实草稿引用卡片缺失；原comment行已恢复。首次40/40重复遇同时源码编辑带来的Vite reload/HMR，不作为最终无干扰稳定性证据。
- 新增公开 `UiMarkdownSource`/`UiMarkdownProps.source` 与App宿主实现，提供有来源key的图片/本地链接读取作用域；插件保留路径白名单与IPC权限。项目中心迁移为 `ctx.ui.Markdown`，移除直接session-ui Markdown/Provider依赖，未新增路由/存储架构或修改Protocol/HttpApi；SDK TSDoc及GUI guide同步。
- 在既有项目中心suite增加图片/相对链接整合keeper，修正两个locator后单次通过；去掉宿主readImage forwarding的负向运行确实失败于图片naturalWidth=0，已恢复。新版GUI/Plugin/App官方tsc均通过；首次完整check发现的Show类型错误已修正，最终冷扫描50项重复及全仓check尚待收到。失败历史/精确边界见 `docs/validation/renicode-align-resume.md`。
- 最终冷扫描五项各重复10次：50/50 pass（1.5分钟、2 workers、0 retries、无运行中reload/HMR）；最终全仓check通过（1463 warnings/0 errors、11 guide blocks匹配、Turbo36/36 successful），固定上游changed lint为66个变更文件/0问题。引用与图片forwarding负向验证均实际失败并已恢复。额外独立输出目录的生产fixture构建虽完成Vite打包，但整个命令180秒timeout、未获PWA/退出成功证据，不能算完整构建通过。

草稿修复/日期重复回归、缓存删除正向重复回归与迁移后 Home/session-summary 全文件已在正确 4319 夹具通过；5000会话单样本不能宣称性能趋势。项目中心本轮冷扫描重复/引用与图片负向/全仓check证据已收齐。下一步完成缓存删除keeper负向敏感性、集中导航/摘要接口、生产构建timeout定位与完整宿主/桌面打包验证。隔离后台/数据库升级验证和可审阅回退边界仍待完成；`deploy-renicode.ts --check`不是dry-run，具体实时升级门禁未解除，暂不执行A/B暂存或激活。

### 2026-10-28 本轮继续：PWA 构建产物修复

- 前次生产build timeout未复现，但证实独立outDir的PWA仍扫描旧dist：修复前产物2823个entry中56项缺失/哈希不符。PWA改为跟随resolved outDir；负向tiny keeper实际失败，修复后4/4通过。修复后App生产fixture整体退出0（22.634秒），2822个entry全部文件存在且integrity相符；不把单次构建时间当作性能结论。
- 完整check为Turbo36/36通过，固定上游changed lint69个变更文件/0问题。真实生产SW keeper、非生产重复回归、缓存删除owner负向与完整CLI/桌面build已启动，结果待补记；细节见续作验证记录。
- 仍未实现集中导航/摘要接口或解除隔离升级/回退门禁；不修改实时profile、不启动/重启桌面后台、不A/B暂存或激活。未提交、推送；主计划仍只维护本文件。

- 后续结果：非生产SW全套重复30/30、真实生产SW2/2通过；缓存删除owner负向实际失败于缓存保留2条而非1条，磁盘生产源码未变。完整CLI（x64/baseline）与desktop main/preload/renderer build通过，portable packaging已修正首次PowerShell参数错误后重跑，尚待结果。两工作树存储源码联合指纹不同，不能推断可安全暂存；隔离升级与可审阅回退边界仍必须完成。

- 新产物Home/session-summary在修正根路由404的临时静态夹具后33/33通过（5 workers、0 retries）；最终完整check通过（1461 warnings/0 errors、36/36），changed lint69文件/0问题。原夹具25pass/8fail历史保留。
- 真正两版本migration的合成内存数据库验证：新版drop-extension-files删除archive表，rename-extension-to-plugin留下只读旧view；旧版可读但旧启用设置UPDATE实际报view不可修改。升级幂等不表示回退兼容，不能将当前package直接作为安全A/B候选。具体后台/数据库与备份恢复设计仍待核实/确认，不修改实时数据或静默接受功能缩减。

- Portable首次命令成功退出后asar审计发现新版 `<title data-sm>`未被旧品牌替换匹配，标题仍OpenCode；metadata/main/preload及CLI/version/storage资源校验通过，但品牌未通过。已仅修正标题匹配并保留data-sm，通过官方脚本重新build/pack/audit，结果待补记。Desktop官方tsc及定向lint通过，最终完整check36/36/1461warnings/0errors、changed lint69文件/0问题；e2e类型检查同11条其他文件遗留错误仍未解决。

- 最终portable官方重建/打包及asar审计退出0，metadata/版本/保留data-sm的Renicode标题/main/preload/CLI/version/storage资源全部通过。产物 `C:/Users/reni.li/Downloads/PG/opencode-align/packages/desktop/dist-renicode/win-unpacked/`，版本2.2.0-renicode.1，未运行。所有本轮构建/回归已结束，没有待收结果；此产物不是已部署或运行验收通过的候选。
- 最新下一步：集中导航/只读摘要接口、侧栏业务迁入插件、后台与隔离profile升级端到端验证、备份/恢复及回退方案确认。旧版对新数据库的插件设置写入不兼容已由合成内存DB证实，实时升级门禁仍未解除。保留原工作区用户应用改动，未提交/推送/A-B暂存/激活。

### 2026-10-28 本轮继续：集中导航与只读摘要

- 用户继续既有批准范围，在 `PG/opencode-align` 实施。公开 `window.navigation` slot 与 `Navigation`/`NavigationView`/项目及会话摘要类型已接入；宿主集中保留 Home 同一查询缓存、confirmed deletion、Home/draft/session 与 sandbox 项目映射和路由动作，不向插件提供消息历史或 App controller。
- 导航呈现迁入 `packages/gui-plugins/src/project-navigation/`，两进程 built-in 清单保留 id；shell 留下原宽度/内层 opened 持久化、dock/peek/resize 和 tabs portal。专属英文文案原样移动，共享 Projects/empty 文案继续使用原词条及翻译。SDK TSDoc、GUI guide 与 source blocks同步；未修改 Protocol/HttpApi。
- 原有生产 Home/session-summary 33/33通过（5 workers、fullyParallel、0 retries）；新增到原导航keeper的选中项目手动折叠/离开后重新选择自动展开断言正在重复验证，不另建重复测试。Plugin/App/GUI官方tsc通过。
- 迁移前后生产 benchmark各4/4通过，同Chromium/4334/1worker、每场景单样本；5000会话均1请求/2574810字节，10000会话均2请求/5149705字节，背景事件均23次sessionReads。不以单样本耗时/heap变化宣称性能趋势或达标。
- 独立App生产fixture整体构建退出0，2822 PWA entries；原dist/既有测试服务未覆盖。首轮check因guide block不一致失败，已同步；次轮lint/SDK检查通过、类型检查在Astro阶段120秒timeout，不能算完整check通过。最新300秒完整check、40项导航重复、负向选择owner及冷扫描plugin graph结果尚待收到，命令与失败历史见 `docs/validation/renicode-align-resume.md`。
- 实时后台/profile/数据库未改，未提交/推送或A/B暂存/激活。旧版插件设置写入新数据库不兼容的门禁不变；下一阶段仍需隔离profile端到端升级和可审阅备份/恢复及回退设计，不把本轮插件化当作允许实时升级。

- 后续收齐：完整check1461warnings/0errors/Turbo36/36、changed lint75文件/0问题、PWA2822项integrity审计通过；冷扫描built-in矩阵1/1通过，选择owner负向实际捕获高亮缺失。40项导航重复120秒timeout，至少9次失败于重新选择后未自动展开，不能验收侧栏迁移。已定位项目投影随directory重建导致行visit重置，在宿主分离inventory memo保持已知项目对象稳定；App官方tsc通过，独立修复后build及重复/全文件/tabs验证待收。失败历史和资产保留，部署门禁不变。

- 分离memo后重复为30pass/10fail，导航仍全部失败，初始定位不完整；已进一步按key复用显示字段未变的项目摘要对象，官方App tsc通过，keyed独立build/正向回归待收。同时修复embedded侧栏重复vertical-tabs-sidebar标记；修复前五项strict-mode失败，修复后五项尺寸/滚动/快捷键及四页面重开全部通过。过滤的53项为52pass/1fail，唯一失败仍为导航，不冒称完整suite通过。shell修复后check36/36/1461warnings/0errors、changed lint75文件/0问题、PWA2822项审计通过；详见续作验证。

### 2026-10-28 集中导航最终修复验证收齐

- 最终keyed生产fixture构建退出0（Vite14.84秒），2822项PWA存在性/integrity审计0 failures。最终完整`bun --bun run check`通过：1461 warnings、0 errors、11 guide blocks匹配、Turbo36/36（34 cached）；固定上游changed lint75文件/0问题。
- 导航四项各重复10次40/40 pass（1.8分钟）；随后Home/session-summary/tabs三个完整文件70/70 pass（40.4秒），均4341/Chromium/5workers/fullyParallel/0retries。重新选择自动展开、草稿刷新、删除两来源、日期及竖向tabs行为均在最终产物通过；此前timeout、30/10及strict-mode失败证据保留，不改写历史。
- 最终产物串行无并行测试负载benchmark四场景4/4通过（4334/1worker/0retries/无显式GC）：500/5000/10000会话分别1/1/2请求、257100/2574810/5149705字节，20次后台更新23次sessionReads，与迁移前计数相同。每场景仍仅单样本，不宣称性能趋势或达标；另一次显式GC诊断4/4单独保存，不与旧无GC样本混比。详细数值及资产见续作验证。
- 本阶段集中导航与侧栏插件化的上述回归证据已收齐，不表示完整对齐计划完成。最新portable仍为本阶段修改前产物；e2e类型检查同11条其他文件错误未解决。下一步是后台/隔离profile端到端升级验证及可审阅备份/恢复、回退设计，必要时更新完整打包。旧版向新数据库插件设置写入不兼容的实时升级门禁仍未解除；没有待收测试命令、未操作实时数据、未提交/推送、未A/B暂存/激活。

### 2026-10-29 继续实施：真实 CLI 隔离升级与方案待确认

- 用户要求继续直到做完；既有范围内的隔离实施继续，不推断已接受旧数据库写入不兼容或数据回退损失，不授权关闭当前桌面/后台。
- 真正旧/新 CLI 的四阶段合成 profile 验证退出 0：旧版创建/归档/未消费输入 → 停止后备份 → 新版读取/写入/重启 → 新目录恢复备份后旧版读取/写入。两版 backend journal 均54项一致，SQLite integrity/foreign_key检查通过；消息历史数组为空，未调用模型、不使用真实凭据，不将此结果泛化到非空历史/媒体或真实 profile。
- 桌面测试入口与 Renicode 环境重写/固定29123端口交叉，尚未冒险运行新版EXE；当前没有修改生产隔离机制。App e2e 类型检查重跑仍为同11条其他文件错误。
- 推荐“版本化 profile 代际 + 保留原数据 + 回退不自动合并升级后新增数据”，具体方案、代价与正常退出门禁见 `docs/discussions/renicode-upgrade-recovery.md`；这是待确认升级机制，当前生效范围与 revision 保持1，未实施 launcher/profile 架构变更。
- 最新证据见 `docs/validation/renicode-align-upgrade.md`。本轮CLI子进程均正常退出0，无待收命令；未提交/推送、复制/迁移实时profile、关闭或重启用户桌面/后台或A/B暂存/激活。后续先确认升级/回退机制，再完成相应实现、隔离桌面与非空历史验证、最终打包和安全交付。

### 2026-10-29 revision 2 实施接续

- 用户确认代际方案后已实现完整冷复制门禁/哈希与SQLite校验、迁移-aware程序暂存与显式准备、slot/profile绑定和新版启动保护；非空历史附件两版CLI链路通过。Desktop31/31与重复310/310、官方tsc、全仓check36/36及changed lint77文件/0问题通过。详细失败历史与证据见升级验证，不覆盖上段方案确认前历史。
- 新版打包退出0、asar审计通过后，真实隔离启动发现临时Electron发行目录缺ICU/pak/snapshot等文件，不能交付该产物。完整zip哈希与本地官方SHASUMS匹配，重新解压到独立dist-complete，增加构建发行资源/version门禁，正在重打包及隔离桌面验证。
- e2e11条类型错误已修复，官方typecheck:e2e退出0；五个受影响keeper完整回归正在运行。portable指南已补代际命令与仅程序暂存/正常退出/数据回退边界。
- 下一步收齐桌面smoke、重打包和keeper证据，完成launcher代际暂存/准备/健康/回退端到端与负向验证、最终check和资源审计；安全条件满足才仅暂存程序。实时迁移/激活仍等待用户正常退出桌面和后台，本轮不代为关闭或重启。未提交/推送/A-B暂存/激活。

- 隔离非packaged真实Electron最终smoke退出0：准备代际绑定、实际历史/附件可见、草稿和plugin禁用状态、认证/PID与SQLite检查通过，合成stdio后台正常exit0且源draft字节不变。前两次默认布局locator错误的失败保留；该结果不代替packaged后台自启动/CLI staging/guardian晋升。五文件121项初次因旧4341离线全失败，已在HTTP200的新4342静态服务重跑。e2e迁移引入的Reflect调用触发lint，已改typed调用并重跑typecheck通过，最新完整check/lint与完整资源重打包/审计尚待收齐。

- 完整资源打包退出0、asar与15项Electron资源逐字节审计通过；五文件121/121、完整check1452warnings/0errors/Turbo36/36、changed lint84文件/0问题通过。Composer benchmark旧观察器与新版text blob编码不匹配的1pass/3fail已保留，仅修观察器后4/4通过，不比较新旧耗时。
- 真实程序包的隔离CLI stage-generation通过且不写pending/不启动guardian；实际prepare被当前正常退出门禁拒绝，未复制实际profile。生产冷复制/store晋升/回退边界另外通过，两profile保留且旧draft hash不变；不将这些分段证据称为完整CLI正向准备/guardian端到端通过。packaged自启动后台/CLI staging真实smoke正在运行，安全仅程序暂存仍未执行。

### 2026-10-29 提交与推送授权

- 按用户本轮明确授权保存两个工作树的现存工作，保留旧版定制与新版合并的独立分支，不互相覆盖。提交/推送不是整个计划验收完成，也不改变正常退出与实时数据门禁。
- packaged smoke 的最终结果本轮尚未核实。新增 updater guard 恢复 dev 渠道禁用 electron-updater（`build.packaged && build.channel !== "dev"`），避免绕过独立 A/B；最终包仍需重新构建、打包和运行验证，不能把此前产物审计当作含此修复的证据。
- 本轮新版完整 check 实际通过（1452 warnings/0 errors、11 guide blocks、Turbo36/36），固定上游 changed lint85文件/0问题、GUI官方 `typecheck:tsc`通过。旧版完整 check 首轮因 registry keeper 的 scope 类型错误失败；仅将普通 `"local"`改用既有 `ServerScope.local`后，完整 check通过（1281 warnings/0 errors、15 guide blocks、Turbo35/35），App官方tsc通过。
- 原工作树另有正在实施的项目关闭计划；其 registry 文件重复10次为40pass/20fail，失败均为新增 Windows等价路径关闭用例，保留为未完成工作，不为归档而删除测试、放宽断言或继续修改其生产实现。全部提交仅保存该现存状态，不称旧版所有回归通过。
