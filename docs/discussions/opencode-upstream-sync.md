# OpenCode 上游更新同步评估

<!-- wiki: {"kind":"discussion","workflow":"confirmed","revision":4,"change":"none","relations":["docs/plans/renicode-upstream-align.md","plans/project-center.md","docs/validation/sidebar-conversation-time.md","docs/validation/renicode-launcher-visibility.md"]} -->

## 本次范围与授权

- 2026-10-28 用户要求查看 OpenCode 更新，评估哪些需要同步到 Renicode。
- 本次仅更新上游 Git 跟踪引用、读取源码及历史、记录评估；未授权合并、实施、后台替换、数据库迁移或部署。
- 未找到该主题此前的讨论或生效计划；本记录不是实施计划。

## 对比基线与证据

- 本地分支 `renicode`，HEAD `9e5b9db11`；共同祖先 `08ac673ab849bd7c8155033679a1f27ae983a07a`，根 package.json 版本 2.1.4。
- 执行 `git fetch upstream dev` 后，上游为 `86ce19d96eccbfb95af3ff3189c7071575f94339`，提交时间 2026-10-27T21:16:17-04:00；上游根版本 2.2.0，发布提交 `86976449c`。
- 主线新增 171 个 first-parent 提交，包含 beta 合并；不能把合并带入的历史提交数等同于近期独立更新数。另读 beta 合并带入的桌面改动，并核对最终文件差异。
- 主线累计差异 2731 文件，138844 行新增、50715 行删除；包括大规模 GUI 包、构建和 stories 重组，不能据此估算修复工作量。
- 本地存在大量未提交工作：项目侧栏、对话时间、项目中心、启动器、文档等。没有暂存、提交、清理或覆盖它们。
- 核查当前 patch 工具、桌面 runtime、上游权限/webfetch/compaction 差异、桌面 migration.gen.ts、后台连接实现和部署脚本。
- 本次未运行测试、构建、部署或真实桌面验证；优先级是源码评估，不是兼容性通过结论。

## 结论

短期修复采用选择性回移，当前不整批 merge/rebase 到最新 dev。长期建议定期对齐上游基础架构，将定制集中在插件和少数构建/宿主入口，而不是无限积累回移补丁。GUI 插件体系能否承载现有定制，见下方 API 核实；长期方向尚未形成获准实施的计划。

### 第一优先：应同步的安全与正确性修复

| 更新 | 上游提交/PR | 价值与适配要求 |
| --- | --- | --- |
| webfetch 重定向目标执行 URL deny 规则 | `17837a20d` / #59748 | 防止允许 URL 重定向到被禁止 URL。同步 Permission.assertNotDenied 及手动重定向处理和测试；不是新增私网隔离或每次跳转都弹窗。 |
| patch 移动到自身时不删除文件，并正确处理连续操作 | `dc21f528a` / #59197 | 当前 Renicode 仍将同一路径当作 move，写入后删除源文件。必须保留 Renicode 目的文件预览、审批期间内容检查及现有权限保护，手工适配，不能覆盖整文件。 |
| 下载 ripgrep 后校验 SHA-256 | `4371c29b5` / #59350 | 加强下载后执行的完整性校验；构建 Bun runtime 校验 `0f3a0c206` / #59360 一并评估，不等同于解决杀毒软件误报。 |
| OAuth 刷新跨 Location/进程协调 | `94353780c` / #54023 | 多项目并发时避免重复刷新争用；使用 OAuth 的 provider/MCP 受益，需要并发刷新回归。 |
| 不把 429 限流当成上下文溢出 | `618b89066` / #59649 | 避免限流误触发压缩路径。 |
| 压缩请求优先使用 provider 最近实测计数 | `bc175f675` / #59441 | 长会话、推理较多时减少字符估算过高导致的不必要降级；需验证 overflow、换模型/variant/agent 后的估算回退。 |
| 非对象工具 input/metadata 不使页面渲染失败 | `3a409f42f` / #59736 | 适合 MCP/插件密集场景；小范围回移 schema 解码回退，不需要全量新版 tool-renderer。 |
| DOMPurify 3.4.14 → 3.4.17 | `9f4315790` / #59709 | 内容清洗依赖优先维护；需要核查具体版本说明并做 Markdown/HTML 回归，本次未逐项确认安全公告，不声称存在已确认 CVE。 |

以上 Core/AI 修复通常需要新后台二进制，源码可先回移和测试，但不能用当前桌面-only A/B 方式自动激活。

### 第二优先：应同步的桌面性能与交互修复

| 更新 | 上游提交/PR | 价值与适配要求 |
| --- | --- | --- |
| 桌面启用工具结果图片载荷丢弃 | `1b3d60170` / #58427；后续 `d7cea3d66` / #58560 | 当前底层可选能力已包含于 `e943bb62d` / #59101，但桌面 runtime 尚未启用；对 VC5/浏览器/桌面截图重度使用价值高。先检查后续闭包释放修复是否已等价包含，避免重复回移。图片仍须可查看。 |
| 关闭会话后回收 transcript/timeline 缓存 | `d7a08170e` / #58434 | 避免长时间打开多个聊天造成内存积累；需要保留侧栏列表和打开会话，验证重新进入后的加载。 |
| 清理 aborted signal 持有的 DOM/batch | `dddec8f3c` / #58432，`80ea2130e` / #58439，`b7a2cfc13` / #58447 | 与缓存回收组成内存修复组；按文件和依赖适配，不能只看标题重复挑选。 |
| 切回会话不重复加载旧历史 | `4e0fca161` / #59166 | 减少网络/解析成本；需与缓存回收同时验证，不能使已驱逐的历史无法重新加载。 |
| Settings 的 MCP 开关使用会话所属 Location | `5b41e1f97` / #59132 | 多项目时避免切错 MCP 配置范围。 |
| 后续 steer move 可以修正此前错过的目录移动 | `80dc5235f` / #58984 | 保持移动会话的操作一致性，验证多条排队/steer 的顺序。 |
| Markdown 复制不携带深色主题文字颜色 | `6aedf36ca` / #59151 | 复制到 Office/网页时保留语义结构但不带主题色，贴合文档使用。 |
| dialog 关闭时不创建无主 computation | `f5a174177` / #59501 | 小范围 UI 生命周期修复，优先于动画调整。 |
| @ 搜索时保持菜单；悬停后位置快捷键仍可用 | `e1eefcafc` / #59425，`3f74f03f2` / #59680 | 小范围易感知修复。 |

这组优先选择不变更数据库指纹、不要求新后台/API 的子集，通过现有桌面-only A/B 路径暂存。部分测试路径因 stories 重构不同，需要回移到本地现有测试体系。

### 第三优先：有价值，但需单独适配或按需选择

- **桌面 GUI 插件体系**：`dae4077a9` / #55246、`758cf5adb` / #59469、`5792c3e63` / #59489。长期建议跟进，便于 Renicode 项目中心和其他定制减少对核心界面的侵入；当前包含 gui-extensions → gui-plugins、宿主 API 与存储变更，应单独评估项目中心和 improvement 插件的迁移。
- **CodeMode 单 job queue 调度与卡住 await 诊断**：`e26f85bcd` / #57976、`2ed57439d` / #59749。对 MCP 重度使用有价值，但调度重构涉及 35 文件、3664 行新增/2995 行删除，应作为独立回归组验证 Promise、generator、并行工具、取消及执行预算；诊断提交不能假定可独立套用。
- **模型目录 V2 API、兼容性与缓存 TTL**：`65096cd35` / #59296、`900770054` / #59157、`24bf4d488` / #59500、`8d26861fe` / #59475、`08132f189` / #59508。成组核对 provider/config/schema，不盲目删除旧 entrypoint 或仅复制新快照；Midea 自定义 provider 必须保留。
- **搜索、项目/worktree picker、会话位置菜单、从消息 rewind/fork**：#59604、#59397、#59607、#58865，按 Renicode 当前侧栏和项目中心设计选取，避免整套 UI 替换。
- **持久化缩放**：`5bf3e82f7` / #59277。价值较高但修改窗口 appearance/defaults/early，与 Renicode 本地标题栏和窗口可见性修复重叠；不能只复制前端设置。
- **进程守护和 Windows PTY 修复**：最新 #59700–#59702 针对上游 opencode-pty，非 Renicode A/B launcher；先核对运行时依赖，不把它误当启动器窗口不可见的修复。

### 暂不纳入同步批次

- 语音通话、图像/decision/extraction 等实验接口：增加 API、provider/媒体和权限面，当前核心需求不依赖。
- 大规模动画、图标风格、Knobs、Markdown parser/stories 整体替换：优先级低于安全和内存修复，不为小修复引入整套架构重组。
- 上游自动升级、NSIS 安装、渠道部署、签名/发布 CI：不能覆盖 Renicode 品牌、独立 profile 和 A/B 机制。
- 已被上游撤回的 server username 改动 #59379（#59444 撤回）、配置 provider 识别 #57007（#59439 撤回）：不作为最终有效更新挑选。
- 上游删除测试、删除 API 审计文件和仅清理文档的提交：不照搬删除本地验收证据和保护用例。

## Renicode 必须保留的边界

1. **不覆盖现有未提交工作**：实施前为用户工作确定保护和隔离方式；评估记录不授权提交用户文件。
2. **对话时间**：上游 desktop data 新增 activity 推进 `time.updated` 用于排序；Renicode 侧栏展示仍使用 `time.idle ?? time.created`，不能把 rename、选择模型、查看等重新当成“最后对话时间”。相关逻辑也与本地 data.ts 未提交改动重叠。
3. **patch 安全增强**：目的地预览、审批后内容检查、外部路径权限和已有测试不能在同步时退化。
4. **桌面 profile/品牌/窗口**：保留 ai.renicode.desktop、Midea、Renicode 外观和启动器可见性修复。
5. **部署**：`script/renicode-portable.md` 要求后台逐字节一致及桌面 migration/schema 指纹一致。上游新增 DROP extension_file、extension → plugin 迁移，当前不能自动部署。后台升级及迁移/备份/回退策略需另行确认；不改检查绕过保护，不强制重启桌面或共享服务。
6. **Session 语义**：库新增 LLM.loop 不等于允许把 SessionRunner 改为内存工具循环；任务模式仍未实现、未启用。

## 建议下一步（待用户确认）

- 第一批：不变更后台/API/数据库的桌面内存、工具渲染、复制和 MCP Location 等修复，选择性回移、测试、按现有 A/B 暂存。
- 第二批：权限/patch/下载校验、OAuth、限流与压缩等后台修复，隔离验证；另行确认后台升级和安全回退方式再部署。
- 第三批：GUI 插件体系及项目中心定制的长期对齐，单独讨论和计划，不混入修复批次。
- 用户尚未确认上述分批方案，未批准生成实施计划或开始同步。

## 2026-10-28 GUI API 承载能力核实

### 范围与核实程度

- 用户担心长期分叉，随后明确要求「先核实 API 是否足够承载现有定制」。本轮授权是核实，不是改造、编制实施计划、恢复项目中心部署或升级后台。
- 对比上游 `86ce19d96` 的公开 SDK **以及真实宿主实现**，对照当前含未提交变更的 Renicode 代码；没有只根据功能名称作结论。
- 阅读官方 V2 插件概览和 GUI 全文：<https://opencode.ai/v2/docs/build/plugins>、<https://opencode.ai/v2/docs/build/plugins/gui>。公开 GUI 导出为 `./gui-experimental`，官方明确 API 为 experimental，不保证跨版本稳定。
- 上游源码只读副本位于 `%LOCALAPPDATA%/Temp/opencode/gui-api-audit-86ce19d96/`；未创建工作树、安装新版插件、编译迁移原型或运行新版桌面。下面的「支持」表示类型及实现存在，不表示端到端迁移已验收。

### 总结

**公开 API 足以承载大部分业务功能，但不足以原样承载全部现有定制。** 最明确的两个缺口是左侧主导航栏扩展面，以及安全的自定义 Markdown 图片/来源读取。品牌、profile 和 A/B 启动器本来就应留在插件以外。不能宣称只换 import 就能消除全部核心差异。

### 逐项映射

| 现有定制/契约 | 公开 API 与实际实现 | 判断 |
| --- | --- | --- |
| 项目中心右侧阅读面板、命令和设置页 | `Panel(region: "side")`、`MenuItem(menu: "session.panel")`、`Command`、`SettingsPage`、`Layout.open/settings` | **支持。** 与现有 renderer 的挂载方式直接对应。 |
| 主进程读取外部登记仓库、目录白名单、junction 拒绝、检索/指纹 | GUI `main` 支持 Node；`Ipc.define`、`ctx.provide`、`ctx.main/ctx.use` 支持方法及取消信号 | **支持。** `createReader` 的安全逻辑可留在插件主进程，不需要把它搬到共享后台或增加 HTTP 服务。API 不代替插件自己的文件白名单。 |
| 本地会话/所属 worktree 绑定、远程会话显式选择 | `MountedSession.directory/project`、`ServerRef.local` | **支持。** 能维持当前绑定规则，不能把 `session.local`（仓库根/worktree）误当 `server.local`（本机/远程）。 |
| 引用到草稿、不自动发送、保留快照与稳定链接 | `SessionScreen.composer.attach(ComposerNote)` 支持 `subject/comment/href/origin`；`LinkHandler` 支持来源回跳 | **支持。** 保留非空 comment、指纹与引用快照，不能用新 `quote` 类型直接替掉 note，因为 quote 的公开定义没有 href。 |
| 选择/设置存储和旧引用恢复 | `Store.global/session`、`from`、`Persisted.update/set`；宿主有 extension → plugin 的旧值复制 | **支持，但需迁移适配。** 独立插件不会自动导入原内置扩展的 `extension.project-center.*`；同 storage 下可显式填写旧 key 的 `from`。面板旧 key/命令快捷键重命名另需核实，不能只迁移设置值。 |
| 文档内相对 Markdown 链接、白名单图片加载、PDF 附件 | `ctx.ui.Markdown` 只有 `text/class`，真实实现只传入这两项，未暴露原 `MarkdownProvider.readImage/openLocalFile` | **不完整。** 普通内容渲染支持；原样保留登记仓库自定义图片读取和当前来源上下文不支持。当前阅读器直接导入内部 MarkdownProvider，独立 bundle 不能这样做。 |
| 详情浮层的固定/取消固定、关闭按钮、会话切换时关闭 | `Slot("session.header")`、`Command`、`createVisitState`、`ctx.use(Changes)` | **业务支持，集成需适配。** 公开 Ui 没有 Popover，且独立插件不能替换保留的内置 details id；可在 Renicode 的内置 details 中保留小补丁，或使用新 id 做自己的浮层，需要单独处理重复入口和浮层交互。 |
| 左侧项目/对话树、展开、时间、宽度、竖向 tab 合并 | 公开 Panel 只支持 side；四个 Slot 分别是 window.bottom/session.header/session.location.menu/session.panel.end，均不是左侧主导航 | **不能原样承载。** TitlebarItem 只能加按钮；`Layout.sidebar` 是右侧面板内 sidebar 偏好，不是左侧主栏。CSS/DOM portal 到宿主节点不是受支持的 API。 |
| 侧栏所需会话列表、打开会话、新建草稿 | `ctx.servers` → `ServerRef.client/data`，`Tabs.open/focus/list`，`Layout.draft/project` | **基本支持动作与后台数据。** Sessions.list 仅含已打开 shell tab，不是全会话列表；完整列表可通过 client.session.list 获取。但没有公开 Home summary cache、项目本地列表/名称聚合、draft 的目录或 Home 当前选中项目接口。原侧栏「1 次列表请求并共享 Home 缓存」及当前项目高亮不能直接等价迁移。 |
| improvement 的记忆、检查证据、权限和上下文 hook | 当前已经用 server Plugin、storage、permission、session hook、tool transform/list；上游保留这些 domain | **已经属于插件层。** 不需要为了 GUI 架构重新改 SessionRunner。当前 id `opencode.improvement` 可用于现有 server 部分，但若新增 GUI，会被 opencode 保留命名空间拒绝，届时须单独规划 id 与存储迁移。 |
| 品牌/图标/名称、独立 profile、Midea 配置 | GUI app metadata 只读，插件在宿主及后台准备之后加载，不能提供启动前 profile/build identity | **不属于 GUI 插件承载范围。** Midea 常规 provider 配置保留为配置；品牌/profile 保留集中构建与早期启动入口，不改为插件加载后临时覆盖。 |
| A/B EXE、桌面快捷方式、健康上报和回退 | GUI 生命周期依附桌面；main 的 Windows/Node 接口不构成桌面外独立 guardian | **不属于插件范围。** 启动器继续独立；宿主健康就绪上报保留少量生命周期接口。不能把 guardian 放进被监控的桌面插件。 |
| patch 审批预览/内容检查、Unicode 工具检索、session move requested 结果 | 属 Core/CodeMode 工具机制，不是 GUI 扩展面；其中 tool 允许插件注册/覆盖 | **仍需保留或上游化的小型基础修复。** 不为消除几处补丁而复制整套 patch executor 到插件；GUI API 不能改这些语义。 |

### 独立插件与内置插件不是同一保证

上游 `packages/plugin/src/gui/builtin.ts` 明确是 workspace-only、不发布的内置接口；不能因为内置 review/details 可以导入内部组件，就认为发布插件也能。

- 公开 bundle 只能使用 `modules.ts` 的共享模块，其他 `@opencode/*` 导入会被 Vite preset 拒绝。项目中心当前的 `@opencode/session-ui/markdown`、`context/markdown` 和 `@opencode/ui/button` 等需要改为公开 Ui 或插件自有依赖；不能捆绑宿主内部模块规避边界。
- 发布 GUI 是一个 CJS 文件，dynamic import 会内联；目前项目中心分块预加载策略不能原样保留。读取和扫描仍可延迟到用户打开面板时，但代码包体与启动成本需要实测。
- 发布 GUI 的文案须 inline；现有 lazy `zh` catalog 与 `onIdle` 为内置策略，需要改造，不是 API 业务能力缺失。
- 内置插件同 id 有优先权且总是运行；发布插件不能用 `details` id 覆盖它。`opencode` 命名空间也被保留。项目中心可以先保持为 Renicode 内置模块，只在 composition 列表注册，避免同时处理独立打包、状态搬迁和 Web 加载变化。
- `ctx.main` 等待本插件 main，并不自动提供原 `Live` unavailable 状态；需要用 SDK 的 live dependency 方式保留 IPC suspension/unavailable UI，不能将旧 accessor 机械改成永远等待的调用。

### 建议的最小缺口，而不是另造框架

以下是待讨论的接口建议，尚未授权实现：

1. **通用左侧主导航扩展点**：宿主保留几何、宽度/折叠、竖向 tabs 容器与移动端策略，插件仅渲染业务内容。不要让插件 querySelector 上游 DOM 再强插页面。
2. **只读项目导航/摘要契约**：复用 Home 的摘要缓存和项目本地映射，并公开当前 project/draft 的选择。SDK 已有 client、tabs/draft 操作，不必再增加另一套会话执行 API。
3. **Markdown 文档来源/资产接口**：在公开 Markdown 上支持有作用域的 base/link/asset 回调（准确形状待设计），资产仍经插件 main 的白名单 reader 和取消信号返回；不能扩大到任意本机文件访问。不建议仅靠把正文图片改成 data URL 就宣称等价，因为还涉及相对路径、快照切换和大文档成本。

建议优先让这几个通用扩展点成为可向上游贡献的小接口；若暂时不能合入，则保留集中、文档化的 Renicode 适配层，而不是持续侵入多个 shell/Home 文件。

### 静态证据定位

上游路径均对应固定提交 `86ce19d96`，不是当前旧 SDK：

- `packages/plugin/src/gui/registries.ts:658-686`：公开四个 Slot；Panel region 为 side。
- `packages/plugin/src/gui/host-apis.ts:734-745, 1533-1583`：Sessions 与 Tabs 的覆盖范围。
- `packages/plugin/src/gui/host-apis.ts:1881-1886, 2026-2037`、`packages/app/src/runtime/plugin/ui.tsx:179`：Markdown 无 source/readImage 参数，宿主未暗中提供这些回调。
- `packages/app/src/runtime/plugin/host-apis.tsx:874-900, 950-1002, 1062-1066`：project/draft/tabs 真实动作，以及 ShellTab 不提供 draft directory 的映射。
- `packages/plugin/src/gui/modules.ts`、`vite.ts`、`builtin.ts:1-2`：公开模块与内置专用接口边界。
- `packages/plugin/src/gui/core.ts:445-526`、`packages/app/src/runtime/plugin/stores.ts:24-53`：公开 from 与内置自动旧值复制的区别。
- `packages/plugin/src/gui/host.ts:317`、`packages/desktop/src/main/plugin/host.ts:448, 628-636`：保留 id 检查与 IPC token 命名空间约束。
- 本地 `packages/app/src/shell/project-sidebar.tsx`：Home cache、draft/Home selection、本地 project mapping、竖向 tabs 容器依赖。
- 本地 `packages/gui-extensions/src/project-center/{renderer,page,reader,index,contract}.ts*`：实际主进程读取、引用/回跳、MarkdownProvider 资产、持久状态与懒加载依赖。
- 本地 `packages/gui-extensions/src/details/{renderer,popover}.tsx`、上游对应 `packages/gui-plugins/src/details/popover.tsx`：固定浮层定制及内置详情实现重构。

### 本轮结果与未做项

- 可以推进「薄定制层」方向，但不能立即宣布现有定制可全部迁为独立 GUI 插件。
- 首选过渡：项目中心维持隔离的内置模块，详情保留局部补丁，补齐主导航/Markdown 通用接口后再评估独立插件化。品牌/profile/launcher 留在独立启动和构建层。
- 没有修改应用源码，没有安装新依赖，没有提交/清理用户改动，没有运行新版测试、打包或部署。现有旧版本测试通过不证明新版插件兼容。
- 下一步若获准验证，应针对真正迁移入口验证：独立 CJS bundle 加载、白名单图片/相对链接、引用请求和来源回跳、延迟存储/IPC 中断、侧栏 Home/草稿/worktree 高亮及列表成本。此处列验证关注点，不创建测试或实施计划。

## 实施确认（2026-10-28）

- 用户随后要求「开始干」，并在范围选择中明确选择「先对齐 2.2 再迁移」。此前评估阶段未授权实施的记录保留为历史，不作为禁止本次获准工作。
- 确认方向为上游对齐后保留/迁移定制，允许编制实施计划并开展隔离实施；计划见 `docs/plans/renicode-upstream-align.md`。
- 不授权强制重启、覆盖用户工作或绕过现有 A/B 保护。后台/数据库具体升级和回退方案仍需核实与确认，不能仅凭本次方向确认就迁移实时数据。

## 2026-10-29 warning 清理范围确认

- 用户询问1452条既有warnings能否解决，助手提出两阶段：先处理低风险排版，再逐模块审查类型断言、类型宽化与输入边界；不关闭规则，不机械补SAFETY注释或断言，不以清零为由重构接口。盘点结果见 `docs/validation/renicode-align-upgrade.md`。
- 用户回复“好的，按你的建议推进”，批准上述两阶段清理及相关验证，纳入同一对齐任务，不另建重复active主计划。全部1452条需要逐项审查；已确认误报应解释并最小化处理，不承诺通过削弱规则达到数字清零。
- 当前2.2迁移验证继续。较大接口/架构调整、实时数据迁移、强制关闭/重启、删除数据或自动激活仍未获准；此次确认不新增提交/推送授权。

## 2026-10-30 Windows 自脱离启动接口确认

本机合成进程管道审计与真实guardian原生栈证实后台继承Electron GPU/Mojo端点，导致桌面退出等待。用户在说明新增CLI参数、保留固定端口/认证/代际与错误输出、不杀真实后台、不迁移实时数据、不自动激活后，选择“批准最小修复（推荐）”。允许实现自脱离入口及桌面接入，继续隔离回归、打包与安全检查；满足门禁才仅暂存A/B程序。同一主计划升为revision4，warning剩余942条与NSIS验收不取消，不新增提交/推送授权。

## 2026-10-30 续作与主题输出契约确认

- 本轮安全核验后，用户选择“先继续 warning 清理”；保持Defender拒绝部署，不新增厂商提交、恢复样本或排除/防护变更授权。仅元数据的本地复核材料见 `docs/validation/renicode-defender-review.md`。
- 泛型draft codec不缩窄为composer文档。主题审查发现 `withAlpha` 实际输出rgba，而 `ResolvedTheme` 仅声明hex/var，不能通过安全注释掩盖。
- 用户在明确“仅补齐ResolvedTheme现有rgba输出及withAlpha返回类型；输入ColorValue、JSON schema、颜色算法与CSS保持不变；重跑类型/回归/逐值对比”后，选择“批准最小类型修正（推荐）”。批准该最小公开输出类型修正，纳入主计划revision5，不批准任意主题重构、输入/持久化放宽或部署安全绕过。

## 2026-10-30 真实激活、旧后台停止与缓存范围确认

- 用户回复“现在安排激活”，随后“怎么停止，我不会，你帮我停止吧，你弄”，授权安排真实代际准备/激活并协助停止旧Renicode后台。只操作旧Renicode，不中断OpenCode宿主；使用现有注册监控触发自身shutdown，注册文件原地改名保留，不发送终止信号。停止日志与native退出实际证据见升级验证。
- 真实profile链接检查发现1816个链接，全部在 `profile/cache/.bun/install/cache`，其余路径无链接。用户在明确“仅跳过这一个可重建Bun下载缓存，原缓存保留不动，其余数据完整复制与全部数据库/哈希门禁，后续可能重新下载依赖”后选择“跳过下载缓存（推荐）”。批准该明确排除清单和必要迁移参数，不批准任意链接跟随/缓存省略或原数据删除。同一主计划升revision6。

## 2026-10-30 warning接续与本轮正常关闭许可

- 用户要求“继续处理警告”，接续revision6已有分批清理，不新增类型/输入/架构放宽或提交推送授权。
- 第五批类型-only检查通过并启动官方候选构建后，用户表示“你可以主动关闭，我现在还没使用”。允许为本次兼容更新主动正常关闭Renicode；候选资源/安全/运行门禁通过后，按既有A/B机制暂存并在正常退出后激活。仅限Renicode，不触碰当前OpenCode宿主；不把该许可解释为绕过验收、强制终止、停止共享后台或迁移数据的必要性。

## 2026-10-30 后续清理与打包节奏

用户在了解每小批打包的开销后提出“不能一次清理完再打包吗”。后续采用全部剩余warning完成后统一打包/A-B交付，而非小批次重复部署；逐模块审查、每批针对性验证、最终完整验收与安全/完整性门禁保留。当前已激活版本不因源码清理反复关闭；不将该执行节奏视为关闭规则、改变输入/架构或取消最终部署的授权。

## 2026-10-30 合理解析边界警告保留确认

- 用户要求“继续一次把警告处理完再打包”，接续上述统一交付节奏。
- 核查drafts与storage codec后，说明通用encode/decode/rename必须保留未知字段，unknown输入/输出属于该解析边界的真实职责；不能缩窄为composer形状或换写法隐藏诊断。提出逐处审查后最小局部例外、保留合理警告、先讨论契约重构三种选择。
- 用户明确选择“**不加例外，保留警告**”。批准对经实际审查证实必要的通用解析边界保留合理诊断并列明依据；不添加局部例外、不修改全局规则、不机械补SAFETY注释。其他可修正的断言/类型/解析问题仍实质修复，剩余未审条目不自动归类为合理。
- 同一主计划revision7调整warning验收：全部条目须完成处理或有依据的合理保留清单，不要求牺牲通用契约获得数字0。最终完整检查、相关回归、打包、安全/完整性与A/B门禁不变，不新增提交/推送或真实进程操作授权。

## 2026-11-02 冷加载测试单项期限确认

本轮接续时两项原失败经无并行负载重复仍首次超过5秒：locale一次导入126份真实App/UI字典，plugin首次definition加载16个真实共享模块。用户在明确仅这两项使用30秒单项期限、注明加载工作量、保留全部断言和完整回归、不改整套期限/产品行为/规则、不添加重试后选择“批准单项期限（推荐）”。纳入同一主计划revision8；不是通过预热隐藏冷加载，不取消其他未审warning或最终统一打包、安全与A/B门禁。

## 2026-11-02 formatter最小解析修正确认

外部真实owner探针复现 `{ name: "ConfigInvalidError", data: { message: 12 } }` 与缺少providerID的model错误均抛TypeError。仅检查data是对象不能证明内部字段合法，不将其余诊断自动列为合理。用户在明确仅formatter内完整解析使用字段、畸形config/model输入走已有message/fallback、不改变合法文案、Protocol/HttpApi或持久化契约后选择“批准最小解析修正（推荐）”。主计划revision9批准此具体行为修正及扩充原owner测试，其他未审项、安全与统一打包门禁保持。

## 2026-11-02 加速清理与交付路线（待选择）

用户要求评估如何快速处理剩余警告并尽快打包更新。对最新冻结清单716条重新按路径分组：生产代码候选338条/91文件，测试与E2E310条/82文件，Storybook/fixtures33条/8文件，脚本与工具35条/5文件，共186文件。其中普通断言319条、链式断言29条；数量不等于已证实缺陷或合理保留。路径分组仅用于工作分配，不证明文件一定不参与构建。

- 建议路线：用户允许后启动三个明确分工的子代理并行审查/处理，严格分配生产文件与test/story/tooling文件避免相互编辑；主助手统一协调需先采集的生产benchmark、重大行为/契约审批与最终验证。各组只运行针对性lint/官方类型与必要owner回归，不同时反复跑全仓suite、不由各组单独打包；全部条目修正或有据保留后主助手统一完整验收、构建/冻结候选/安全与ASAR完整性核验、隔离运行及A/B暂存。此路线保持revision9范围，尚未获并行子代理许可、尚未启动。
- 可选优先交付路线：生产风险优先完成审查及必要修复，经过完整产品/安全/完整性/运行门禁后交付一次；未完成的非生产规范清理另列后续，不能将378条自动当合理或声称全仓工作完成。这会调整此前“全数处理再统一打包”的交付门槛，须用户明确批准并记录主计划修订；当前尚未生效。
- 不论路线，不关闭规则、添加机械豁免、跳过测试/安全、直接复用异常dist、关闭或重启当前程序/后台、迁移实时profile或自动提交推送。A/B只暂存非活动槽，等待当前桌面正常退出；较大行为/接口变更仍单独确认。不承诺未经执行证实的耗时或并行倍速。

用户随后明确选择“**三路并行全量（推荐）**”，允许启动三个子代理按互不重叠文件分工并行处理，主助手统一验收和打包。优先交付/延期非生产清理路线未选择、不生效；主计划revision9范围及全数处理门槛保持。所有生产benchmark、行为/契约审批与最终安全/A-B边界保持。

## 2026-11-02 并行发现的三处最小解释边界授权

并行审查指出helpers.errorMessage会让numeric/object message直接作为错误描述，主题mode将任意存储字符串断言为ColorScheme，窗口恢复把未知maximized/fullScreen字段按truthiness使用。主助手明确说明后二者仍是待实际复现的候选，提出只对复现问题补字段检查，不改合法值/其他字段、既有回退和API；用户选择“**批准三处最小修复（推荐）**”。批准范围为errorMessage仅接受string、非法主题mode回system、非boolean窗口标记单独忽略；保留合法legacy局部窗口对象/额外字段，不丢弃整个存储文档，未复现不改，不添加测试接缝或迁移真实profile。主计划revision10记录同一任务的具体授权，三路全量完成后一次性交付仍保持。

## 2026-11-02 最终GUI短查询夹具修正（待确认）

全部warning原项已逐项处理/有据保留，最终App9个keeper187/188；唯一Settings pointer/keyboard综合case用十个z并期待无省略号全文。冻结旧production fixture也在同一assertion失败。外部原keeper副本只插入真实布局测量、原assertions不改：当前status200px，两侧各18px padding，有效164px；实际完整文案宽170.609375px，font为Inter13px/440。故此输入已是须省略的长查询，不能据这条旧期待要求产品溢出、改布局或放宽assertion为regex。

提出最小测试输入修正：仅把综合交互case的无结果query从十个z改成真正短的四个z，同时仍精确断言对应完整文案；全部keyboard/pointer/clear/find/narrow流程保持，原专属长query/缩放/关闭引号/省略号keepers不改。不更改产品、viewport、字体、CSS、规则、测试期限或retry，不延期其他验收项。此为真实测量后对原交互夹具的澄清，尚未获选择/未实施；若用户不同意，保留失败并不提前打包激活。

用户随后选择“**批准最小夹具修正（推荐）**”，明确批准仅上述两处input/精确expected文案同步修正，不修改原长查询/省略号keeper或产品布局，不跳过其余失败。此具体授权纳入同一主计划revision11；待实际补跑验证，不把批准当作通过。

## 2026-11-03 跟进官网最新版本（待确认基线）

- 用户询问“那你能同步最新的版本吗？”。本轮先只读核实发布渠道与两个工作树，不将询问解释为允许覆盖未提交工作、关闭程序或移动既有固定基线。
- 官网V2桌面稳定更新源 `https://opencode.ai/update/api/latest/desktop/opencode/latest.yml` 实际HTTP200，声明版本 **2.2.5**、releaseDate `2026-10-30T23:06:22.000Z`，Windows x64产物指向 `https://opencode.ai/files/bin/2.2.5/opencode-desktop-win-x64.exe`。GitHub通用latest API返回V1的v1.19.5，不作为V2基线。
- `git ls-remote upstream` 核实 `refs/tags/v2.2.5` 为 `9bbb8ce18c80f099e0e448775f59d965ead40a21`，dev为 `1bf08ae46a91f7793c756e4ee521e37b6b554064`。尚未下载标签对象或核实其是否需解引用，不声称已确定最终源码commit或完成差异评估。
- 原工作树HEAD `d4bcca712c238e69c20e05fe7f51e7724313975f` 有未提交流程文档；隔离align-renicode HEAD `2ce0d3d9a53c4c5a93bcde1b0fdc23f9e3c76520` 有大量未提交warning清理及测试/工具改动。现有revision11固定上游为 `86ce19d96eccbfb95af3ff3189c7071575f94339`，最终GUI/benchmark/打包交付尚未全部收齐；必须保留这些工作和失败历史，不重置、覆盖或删除。
- 推荐确认：将既有计划的固定上游改为本次核实的官网V2稳定2.2.5（不追随滚动dev），先保护并承接当前未提交改动，评估/合并增量，保留品牌、Midea、插件、独立profile与A/B保护，完成旧未完及新受影响验收后统一构建/安全核验/隔离运行并暂存非活动槽。后台/数据库变化先验证；实际数据迁移或需停止后台时按已有边界另行安排，不自动关闭或重启运行中程序。
- 当前仅记录待确认变更，不修改主计划生效基线、应用源码或槽位，不启动代理、构建、部署、迁移或提交推送。

### 同步稳定版确认

用户随后明确选择“**同步稳定版 2.2.5（推荐）**”，批准修改既有计划基线、保留全部定制与在途改动，完成同步及原未完/新增受影响验收后统一构建、安全核验、隔离运行与A/B暂存。固定标签已下载并解引用为commit `9bbb8ce18c80f099e0e448775f59d965ead40a21`；不追随dev，不新增提交/推送、强制关闭/重启、未经验证实时迁移或防护变更许可。原两工作树均有未提交工作，实施先做逐文件哈希保护，在新的隔离工作树承接，主计划仍只有一份。

### Client 单项恢复预算确认

- 用户明确选择“**批准单项调整（推荐）**”：仅 `recovers when an unresponsive contender is evicted after a prior failure` 的内部总预算由3000ms改为10000ms、Bun单项期限由5000ms改为15000ms。保留全部恢复/identity断言、requestTimeout100ms、其他case和产品预算，不加重试。此case证明三进程恢复而非3秒deadline；外部诊断已记录Windows原生spawn成本，原完整252pass/4skip/1fail/1error及局部5/5失败历史不删除。
- 已实施在测试fixture及单一调用者；批准后同一owner连续10次 **10pass/0fail、20assertions、28.10s**，证据 `Temp/opencode/renicode-sync-225-client-contender-approved.log`。受影响suite与官方tsc仍须收齐；GUI两项失败及性能/代际/安全/统一构建/A-B门禁不取消，不提前放行。

### Review / Server 两处最小夹具确认（接续）

- 用户明确选择“**批准两处最小修正（推荐）**”。Review只在原图表初次boundingBox前等待既有面板飞行inline paint清空；Server只把PowerShell5.1不接受的POSIX命令换成真实Bun子脚本，向同一marker追加一行x并exit1。全部原精确结果断言、期限、产品布局及调度行为保持，不加retry、不丢失败历史。
- 已实施在正式 `packages/app/e2e/regression/review.spec.ts` 与 `packages/server/test/schedule.test.ts`，没有新增生产接口/信号或修改Session代码。正式owner各10次、完整Review/Server suite及canonical/官方检查正在运行；结果待完成通知。原六keeper162/2、Server107/8/1、慢动作Review0/3与全祖先0/1保留，Temp诊断成功不能替代正式验收。授权不包含提前打包/交付放行、实时迁移、强关重启或新增提交推送。

### Server 六项模型目录夹具确认（接续）

- 获批listener最小解绑修正验收实收：修前资源断言0/1、修后原owner10/0、三callback各10次30/0、完整Server108/8/0且两回归日志同类warning0；Core9/0、Core/Server官方tsc、canonical340/0通过。正式测试只承接原owner资源断言，无新重复case；不将未独立测试的中断清理宣称为已覆盖。旧失败及原20/2警告保留，本项收齐不是性能/迁移/构建/安全/交付整体放行。

- 用户随后明确选择“**批准最小解绑修正（推荐）**”：仅修openai.ts的bind在成功/错误/中断时解绑自身error/listening回调，并把修前已失败的资源断言承接到现有both-ports owner；不提高listener上限，不改端口、重试次数、200ms间隔、文案、helper2秒/case10秒，不加retry或新增重复keeper。已实施这两处最小修改，原owner连续10次正在执行；后续callback/full Server、Core/Server官方tsc/canonical须实收。原负向证据与交付/实时数据/真实进程边界保持。

- 接续正式实收六owner各10次60/0、完整Server108/8/0、Server官方tsc/canonical通过，但真实OAuth绑定重试分别产生20/2条listener warnings。Temp扩展原both-ports资源断言0/1证明失败，trace指向openai.ts:152；拟议仅bind自身error/listening清理，保持全部端口/次数/间隔/文案/期限。此产品修正尚未获额外确认或实施，不能将限定六case的夹具授权扩张为listener产品授权；其余验收与交付边界保持。

- 用户明确选择“**批准限定六 case（推荐）**”：只给artifact1、OAuth固定callback端口3、Session instance1、双Server leader1各自的models选项加既有snapshot:false，减少未被这六case验证的捆绑模型目录工作量。真实内置插件、OAuth监听/重试、Agent权限规则、artifact本地/plugin provider、双Server同DB竞争及全部原断言保持；原helper2秒、默认5秒及both-ports既有10秒不改，不加retry。
- 仅在三个正式owner文件的六case内实施，没有改fetch共享options或startServer共享fixture、其他完整目录测试、产品默认值/guard/调度或任何公共API。Temp18/0只是候选支持证据，不代表消除所有负载失败；正式六case各连续10次及受影响回归/check仍必须实际收齐，失败仍阻塞。原Server leader5/5与完整107/8/1、103/8/5保留，不扩大提交推送、实时数据迁移、防护变更、强关重启或提前交付/A-B权限。
# 2026-11-04 限定追加授权：窄屏终端重命名

用户选择“允许最小修复（推荐）”：仅让显式Enter提交不受初始化blur帧门禁限制，保留blur防护、Escape取消、原keeper断言与期限；同一case连续验证10次及完整终端套件。前置完整keeper20/1失败保留；不授权布局恢复、sleep/重试或其他产品行为变更。
