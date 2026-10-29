# 项目中心 × Renicode 原生扩展开发计划

更新日期：2026-10-28

## 目标

把 `Reni_ProjectCenter` 融入 Renicode 的日常工作流，而非嵌入独立网页：

**当前会话 → 关联项目 → 检索文档/计划 → 原生阅读 → 引用到对话草稿 → 回到来源。**

第一版使用内置 GUI 扩展 `project-center`，主进程通过 IPC 读取现有项目登记与仓库文档。不依赖另一个 Python/HTTP 服务，不迁移或改写原 Wiki。

## 已确定的边界

- 原文留在登记仓库，默认只读；设置与会话选择使用 Renicode 扩展存储。
- 本地会话按目录或所属 worktree 根绑定登记仓库；阅读登记仓库原文，不默认读取 sandbox 的未提交副本。
- 未匹配项目不回退到默认项目；远程会话必须显式选择本机登记项目。
- 跨项目检索必须显式选择；VC5 历史/待核验资料保留资格提示，默认不进入检索结果。
- 引用只附加到草稿，用户自行确认发送；保留原文快照、SHA-256 指纹和稳定来源链接。
- 计划展示原文入口与声明状态，不推断完成率，不把计划当作验收证据。
- 保留目录白名单，拒绝越界、隐藏/构建目录、符号链接及 Windows junction 祖先。
- 第一阶段功能文案采用 English fallback；第二阶段本轮提供经过术语对照审校的简体中文，其他语言仍回退英文。
- 不关闭或重启正在使用的桌面/后台服务；A/B 更新只进入非活动槽位。

## 第一阶段：原生工作流 MVP

### 实现

- [x] 扩展 manifest、主进程/窗口组合注册、设置入口。
- [x] 复用现有 `wiki-projects.json`，默认发现本机项目中心登记路径。
- [x] 自动关联本地项目、显式项目选择及跨项目搜索。
- [x] 标题/正文搜索、计划过滤、历史资料开关与有界结果列表。
- [x] 使用生产 Markdown 阅读器，处理仓库内文档和图片/PDF 附件。
- [x] 整篇与选段引用、草稿附件、稳定 `reni-wiki://document/...` 回跳。
- [x] 请求身份校验、会话切换取消旧读取、IPC 暂停保留数据并禁用引用。
- [x] 使用说明与实现限制：`packages/gui-extensions/src/project-center/README.md`。

### 验收

- [x] 真实文件系统 reader/source 单元测试：14 项 × 10 轮，140 pass / 0 fail。
- [x] 本机登记 smoke：识别 3 个登记项目，当前绑定 `renicode`，12 个文档，无 warning。
- [x] `bun run lint:changed HEAD` 零问题；source-checked SDK 文档检查通过。
- [x] 完整 `bun run check` 通过；app/gui-extensions 官方 `typecheck:tsc` 通过。
- [x] 浏览器工作流验收：延迟 session storage、草稿引用、迟到读取、IPC suspension/resume。
  - 已补齐 fixture 的 DialogProvider，并修复 Solid store 代理导致的请求对象身份比较错误。
  - 回归有效性验证：临时恢复旧身份比较时两项测试均失败，随后已恢复正确实现。
  - 固定版本 Chromium 下载受锁/网络阻塞，使用本机已安装 Chromium 的临时配置进行本地验证；不修改仓库的 CI 浏览器配置。
- [x] 两个新增组件用例以 2 workers 重复 10 轮：20 pass / 0 fail，无重试。冷缓存启动无依赖优化重载。
- [x] 现有 `extension-` host/graph 套件：25 pass / 0 fail，新扩展不破坏依赖与生命周期。
- [x] 完整组件套件冷缓存验收。
  - app 首轮：123 pass / 1 fail；`timeline-detail` 的 ltr/light 布局用例出现 Storybook 预览文件加载错误，未进入实际组件断言。无依赖优化重载。
  - 同一失败用例独立以 2 workers 重复 10 轮：10 pass / 0 fail；仍保留首轮失败记录，不将全套记为通过。未修改重试/超时或无关组件源码。
  - session-ui 冷缓存全套：154 pass / 0 fail，无依赖优化重载。
  - 重启后 app 冷缓存全套复验：124 pass / 0 fail，2 workers，零重试（3.9 分钟），无依赖优化重载；旧首轮失败记录保留。
- [x] 修复完成后的最终桌面包构建与产物核对。
  - 最新 Windows x64 portable 包：`packages/desktop/dist-renicode/win-unpacked`；打包成功。
  - `app.asar` 中 2,159 个 JS/HTML/CSS 输出文件与本地构建逐字节一致；包含阅读器分块。
  - 上次仅本地构建的产物 SHA-256：`594ade77566b9f1578b5d5e9f560058d564ebec8f9bd735271f1982f9e5d5955`；重启后重新构建并激活的产物见下方续接记录。
- [x] A/B 暂存及正常退出后的启动健康验收。
- [x] 已激活桌面的人工工作流验收：打开项目中心、阅读、引用到草稿及来源回跳。用户按验收步骤操作后确认“都正常”；此项依据用户实测反馈，不是代理桌面操作或自动化组件验收。

### 部署安排

已运行 `bun script/deploy-renicode.ts --check`，桌面打包成功，但部署被已有待更新拒绝：活动槽位 B，待更新槽位 A。没有覆盖槽位、取消待更新或重启程序。

用户已选择 **稍后部署**：保留当前排队版本，待用户正常退出、原更新激活后，再暂存项目中心候选版。当前构建不等于已暂存/已激活；后续必须复查槽位与构建的新鲜度。

### 2026-10-27 重启后续接

- 用户已正常重启 Renicode；启动器确认活动槽位为 A、上一个槽位为 B、无待更新。A 的 `confirmed` / `healthy` 记录及当前运行路径一致；这是原排队版本的启动验收，不是项目中心候选版的验收。
- 上次最终打包已完成，未与新构建并发写入。重新运行 `bun script/deploy-renicode.ts --check` 成功，完整检查为 35/35 tasks successful，SDK 文档零问题。项目中心候选版已暂存到 B，当前仍为 A；保留正常退出后的 B 启动健康验收为未完成。
- 包内 2,159 个 JS/HTML/CSS 输出文件与本地构建逐字节一致。`app.asar` SHA-256：`940ff29e1a12b7f9d200e17d1e6efe11b3af51fc040c168cd87e14b6fafc3839`。B 候选目录：`%LOCALAPPDATA%/RenicodePortable/slots/B/4192094c-2c26-4fb5-91f6-4313a4d31c88`；部署兼容性检查保持后台 CLI 与存储指纹不变。
- 暂存后的 B `app.asar` 与已核对构建逐字节一致；启动器当前为 `active: A` / `pending: B`，交接记录为 `staged`，尚无 B 候选的 `confirmed` / `healthy`。界面版本标签仍为 `2.1.4-renicode.1`，以槽位路径与产物指纹识别此次更新，不能仅凭标签判断激活。
- 重新执行 reader/source 测试 10 轮：140 pass / 0 fail；本机登记 smoke 识别 3 个项目、绑定 `renicode`、13 个文档、无 warning。
- `bun run lint:changed HEAD`：15 个变更 TypeScript 文件，零问题。本机 Node 22.16 需在该命令环境启用 `--experimental-strip-types` 以加载 oxlint TypeScript 插件；未修改仓库脚本。
- app 完整组件套件重新以冷缓存、2 workers、零重试验收：124 pass / 0 fail；旧缓存移至本机临时目录保留，继续使用已安装 Chromium 的临时配置，未修改仓库 CI 浏览器配置。

### 项目中心版本激活确认

- 用户再次正常退出并启动后，启动器为 `active: B` / `previous: A` / `pending: null`；交接记录依次为 A `user-exit`、B `starting`、B `confirmed`、B `healthy`（记录 32–35）。
- 当前 Renicode 进程全部来自 B 的 `4192094c-2c26-4fb5-91f6-4313a4d31c88` 目录，活动 `app.asar` SHA-256 仍为 `940ff29e1a12b7f9d200e17d1e6efe11b3af51fc040c168cd87e14b6fafc3839`，与本次已验收产物匹配。
- A/B 启动健康验收完成；未主动关闭或重启桌面/后台服务。真实桌面工作流验收尚未完成：桌面工具返回 `USER_CONTROL`，未接管用户正在操作的桌面。
- 本次续接复核：活动槽位仍为 B、无待更新，活动包指纹与上述产物一致。用户明确允许接管并停止操作后，桌面工具仍返回 `USER_CONTROL`；一次空闲后的请求返回 `CONTROL_UNAVAILABLE`（`state: ready`）。等待后再试仍未取得画面，未执行任何 UI 操作，人工工作流验收继续保留未完成；未绕过控制保护或重启服务。
- 随后改由用户在已激活桌面手动验收：打开 Project Center、阅读 `plans/project-center.md`、引用到草稿，以及切换文档后点击草稿引用回到来源；用户反馈“都正常”。人工工作流验收完成，第一阶段 MVP 验收闭环；上述工具阻塞记录保留，不视为代理已取得桌面控制。

### 2026-10-28 代理桌面复核：引用附件阻塞

- 本次取得桌面画面并实际操作；运行进程仍来自 B 的 `4192094c-2c26-4fb5-91f6-4313a4d31c88` 目录。本次验证的是已激活的第一阶段包，不是尚未部署的第二阶段源码。
- 命令面板 `Open Project Center` 打开成功；`Follow current project` 关联到 Renicode / OpenCode，显示 13 个文档；计划入口可打开 `plans/project-center.md`，生产 Markdown 阅读器显示标题、正文、来源路径及 SHA-256。
- 点击 `Cite document in conversation` 后出现附加成功提示，但当前会话草稿中未显示可点击的来源附件；因此本次草稿可见性与来源回跳验收未通过。未发送消息，未改写原文，未重启桌面或服务。
- 当前源码中的引用传入 `comment: ""`（`project-center/page.tsx`）；真实编辑器的 `comments()` 只显示非空 `comment`，与 fixture 自行展示收到的 note 不同。这是具体修复线索，尚未修改生产代码或执行修复回归。
- 保留上述用户反馈“都正常”的历史验收记录；本次代理复核发现另一个实际阻塞，不能以既有组件通过或成功提示替代草稿附件与回跳验证。需修复后通过真实草稿界面重新验收。

### 2026-10-28 引用附件修复

- 用户授权修复本次桌面复核发现的阻塞。引用改为使用用户点击的本地化引用操作作为非空 `comment`；原文快照仍放在 `subject`，来源链接和指纹不变，不修改宿主草稿过滤规则、不发送消息、不改写已保存的引用。
- 组件 fixture 接入 app 的生产内存草稿、编辑器和请求构建器；增强已有用例验证附件可见、可发送、引用正文进入请求，以及实际点击草稿附件回到来源。补充 fixture 位于 `packages/app/component-tests/project-center.fixture.tsx`，GUI 扩展未直接依赖 app。
- 回归有效性：修正定位器后临时恢复 `comment: ""`，同一用例因真实草稿中没有来源附件而失败；随后恢复修复。修复后 4 个项目中心用例通过，并以 2 workers、零重试重复 10 轮：40 pass / 0 fail，无依赖优化重载。
- 完整 `bun run check` 通过：35/35 tasks successful；本机 Node 22 需在命令环境启用 `--experimental-strip-types`，未修改仓库脚本。app/gui-extensions 官方 `typecheck:tsc` 通过；本轮 4 个 TypeScript 文件单独 oxlint 为 0 warnings / 0 errors。
- 全工作区 `lint:changed HEAD` 仍受其他任务的会话索引、项目侧栏及 `home.spec.ts` 并行修改阻塞；已清理本轮文件的问题，未修改其他任务文件。
- A/B 复核发现 `active: B` / `pending: A`，A 候选为 `fd3fb5c0-da75-431c-8f45-803835037052`，交接记录 39 为 `staged`。它不是本次引用修复的产物；保留这份排队更新，不覆盖槽位或取消待更新。本次修复尚未暂存或激活。
- app 冷缓存全套：126 pass / 0 fail，2 workers、零重试；无依赖优化重载，末段记录一次 `index.css` HMR，保留此运行记录。session-ui 首次运行受代理 shell 的 120 秒限时中断，不计为通过；不修改 Playwright 超时，重新以不限时 shell 运行冷缓存全套：154 pass / 0 fail，2 workers、零重试，无依赖优化重载。
- `bun script/deploy-renicode.ts --check` 已完成完整检查（35/35 tasks successful、SDK 文档零问题）及 Windows x64 portable 打包；随后暂存被 `An update is already pending` 拒绝。状态仍为 `active: B` / `pending: A`，候选目录未变；交接记录 40 为本次拒绝的 `launcher-error`，未覆盖待更新或重启桌面/服务。
- 最终本地产物：`packages/desktop/dist-renicode/win-unpacked/resources/app.asar`，SHA-256 `e05552e50fdf36cfd5f910b9b4ae8267f6643a15edae4ee3c600602ea438f4cc`。包中 2,162 个 JS/CJS/HTML/CSS 输出与本地构建逐字节一致；`out/renderer/assets/page-C_Dz0BsY.js` 包含本次非空引用说明修复。核对记录：本机临时目录 `project-center-draft-package-audit.json`。
- 本次引用缺陷修复与相应验证不恢复其他已暂停的第二阶段工作。修复版仍仅在本地构建，未暂存/激活；待既有 A 更新正常激活并获得后续部署确认后，复核源码、变更 lint 与产物新鲜度再暂存。真实桌面的修复版验收需修复产物激活后进行，不能用组件回归替代。旧版空评论引用不自动改写，升级后需重新引用以生成可见附件。

## 后续阶段

以下内容不属于第一版验收。用户已确认本轮推进第二阶段的中文文案与引用快照变化提示；其他提案仍需确认优先级与写入权限，不自动执行。

### 第二阶段：项目绑定与阅读体验深化

- [x] 简体中文文案与术语对照审校；保留其他语言英文回退，审校依据见扩展 `i18n/REVIEW.md`。
- 项目来源导航、分类与更紧凑的宽/窄屏阅读布局。
- [x] 实现“引用快照与最近读取的原文不同”的明确状态；新引用链接保留快照指纹，旧链接明确无法核对，已有引用不改写。
- 更完整的来源回跳定位与选段锚点；仓库迁移后的绑定修复流程。
- 评估全文检索规模后决定是否需要索引，不预先引入新服务。

### 第二阶段本轮验收与部署

- [x] 来源链接单元回归：新增指纹用例在旧实现上失败，修改后 reader/source 合计 15 项 × 10 轮，150 pass / 0 fail。
- [x] gui-extensions 单元全套：194 pass / 1 skip / 0 fail（35 个文件）；未改变既有跳过条件。
- [x] 组件初验：4 pass / 0 fail，2 workers、零重试；覆盖差异提示、来源回跳、恢复、IPC 暂停/恢复、不改写引用及中文计数。
- [x] 回归有效性验证：临时移除生产 LinkHandler 的快照指纹传递后，来源回跳断言失败；随后恢复正确实现。
- [x] 组件重复验收：4 个用例 × 10 轮，40 pass / 0 fail，2 workers、零重试，无依赖优化重载。
- [x] 简体中文 42 个键审计：除 CLDR 不需要的 `results.one` 外无缺失键，占位符一致，无未说明的原样英文。
- [ ] 冷缓存完整组件套件。
- [x] 完整 `bun run check` 通过：35/35 tasks successful，SDK 文档零问题；全仓库既有 warn-level 提示保留。
- [x] app/gui-extensions 官方 `typecheck:tsc` 通过；本轮项目中心文件单独 oxlint 为 0 warnings / 0 errors。
- [ ] 全工作区 `lint:changed HEAD`：同一工作区出现与本任务无关的 `packages/app/e2e/regression/home.spec.ts` 并行修改，其三处可读性格式提示阻塞全量变更 lint；未代为修改该文件。
- [ ] 最终桌面打包、产物核对及 A/B 暂存。
- [ ] 正常退出后的新候选启动健康验收与中文/快照提示人工复核。

### 2026-10-28 中断恢复与并行开发等待

- 恢复后收取 app 冷缓存全套结果：125 pass / 1 fail，2 workers、零重试。失败为 `websearch` 的 `360px / rtl / light` 场景，`#storybook-root` 在 mount 阶段未显示，未进入业务断言；不是项目中心用例失败。
- 日志记录运行期间 `packages/app/src/runtime/i18n/language.tsx` 的 HMR 更新。工作区同时出现项目导航、会话索引和语言处理的并行生产代码修改。本次全套并非稳定源码快照，不记为全套通过；之前的单元、40 轮项目中心组件验收和 check 结果仍保留，但不替代合并后候选版的最终验证。
- 用户选择 **先等并行开发结束**：保留本轮实现和验证记录，暂停后续完整组件验证、打包与 A/B 暂存。不创建隔离工作区、不修改或丢弃并行改动、不关闭或重启桌面/后台服务。
- 待用户确认并行开发完成后，先核对源码与槽位状态，再在稳定源码上完成 app/session-ui 冷缓存全套、最终 lint/check、打包及非活动槽位暂存；只重做受到源码变化影响的检查，不重复已完成的实现和人工 MVP 验收。

### 2026-10-28 并行开发完成后的部署续接

- 用户确认“并行开发完成，继续部署”，恢复本轮候选版验证与部署工作；不授权覆盖排队候选或强行退出桌面/后台服务。
- 复核实际启动器仍为 `active: B` / `pending: A`，A 目录为 `fd3fb5c0-da75-431c-8f45-803835037052`；交接 39 为排队暂存，40 为此前 `An update is already pending` 拒绝。未再次运行长打包，也未覆盖或取消已有候选。需用户正常退出桌面，让已有候选切换并完成健康确认后，才能暂存新的候选。
- 最终 `bun run lint:changed HEAD` 重跑未通过：23 个变更文件中，4 个并行任务文件共 14 个问题。`runtime/server/data.test.ts`、`runtime/server/data.ts` 各一处类型断言说明，`shell/project-sidebar.tsx` 六处可读性间距，`e2e/regression/home.spec.ts` 六处可读性间距；项目中心文件未报问题。未代为修改这些并行文件，待确认是否一并清理后再进行最终验收。

### 第三阶段：AI 可检索的项目知识

- 提供受项目绑定与资料资格约束的检索/读取工具。
- AI 返回可核验来源，不把旧版 VC5 资料提升为当前 API 依据。
- 权限与跨项目访问规则需显式设计；不能因引用能力已存在就默认允许主动扫描所有仓库。

### 第四阶段：知识与计划维护闭环

- 从对话提出知识补充/计划更新建议，用户确认后写回原仓库。
- 区分计划、实现证据与验收记录；不自动制造完成率。
- 通过可审阅 diff 维护文档，保留 Git 历史与原项目中心兼容性。

## 文件定位

- Wiki 登记已补齐：`Reni_ProjectCenter/web/wiki-projects.json` 的 Renicode `documentFiles` 与 `plans` 均包含 `plans/project-center.md`；Wiki 文档列表、计划入口和原文读取验证通过。
- 扩展实现与单元测试：`packages/gui-extensions/src/project-center/`
- 生产页面 fixture：`packages/gui-extensions/src/project-center/page.fixture.tsx`
- 组件验收：`packages/app/component-tests/project-center.spec.ts`
- 注册：`packages/gui-extensions/src/main.ts`、`src/renderer.ts`
- A/B 流程：`script/renicode-portable.md`

本计划只记录范围与进度，不授权后台无人值守任务、不自动启动后续阶段，也不替代实际测试和部署状态。
