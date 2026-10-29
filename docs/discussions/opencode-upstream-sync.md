# OpenCode 上游更新同步评估

<!-- wiki: {"kind":"discussion","workflow":"confirmed","revision":3,"change":"none","relations":["docs/plans/renicode-upstream-align.md","plans/project-center.md","docs/validation/sidebar-conversation-time.md","docs/validation/renicode-launcher-visibility.md"]} -->

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
