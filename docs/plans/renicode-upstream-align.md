# Renicode 对齐 OpenCode 2.2.5 与定制迁移

<!-- wiki: {"kind":"plan","workflow":"active","revision":12,"change":"none","relations":["docs/discussions/opencode-upstream-sync.md","plans/project-center.md","docs/validation/sidebar-conversation-time.md","docs/validation/renicode-launcher-visibility.md","docs/validation/renicode-align-resume.md","docs/discussions/renicode-upgrade-recovery.md","docs/validation/renicode-align-upgrade.md","docs/validation/renicode-warning-cleanup.md","docs/validation/renicode-defender-review.md"]} -->

## 授权与当前生效范围

- **当前停止交付：新增Defender实时威胁告警。** delivery1793783097659新`Renicode.exe`报告`Trojan:Win32/Cinjo.O!cl`/2147765393/Severity5/IsActive=true；运行后97文件hash复核Bun读取EXE EUNKNOWN，PowerShell只读hash虽与冻结相符仍不放行。此前全包custom scan/no-threat与packaged成功保留为历史，不抵销新告警。编译launcher首单文件扫描exit2/0x80508023失败保留，后原生路径仅launcher目录扫描exit0/no-threat且hash不变；**未执行launcher/compiled guardian，未deploy或真实代际prepare/launch。** 不改防护、不放行恢复、不上传样本、不关闭真实程序。详见新版验收与delivery`security-blocker.json`；guardian/pipes/运行后完整性/A-B暂存仍待安全阻塞解除后重验。

- packaged升级首次旧source直入失败；恢复此前共享cache直入仍60001.864ms deadline/exit143，历史保留。旧source仅诊断import loader后合成资产1793784559242全断言退出0；新版**编译CLI直接执行**实际2.2.5-renicode.1、监听219.777ms/重启177.937ms，四后台正常exit0、五迁移54→59/历史附件/inbox/archive/job/KV/读写重启/backup/hash全通过。旧source直接入口失败未解除、不以诊断loader冒称修复。独立packaged desktop smoke执行中，guardian/A-B未执行，真实profile/服务/槽位未动。

- delivery1793783097659新包静态/Defender custom scan退出0（found no threats），97文件/871672471bytes完整hash与ASAR实际/内嵌header扫描前后完全相符，有限凭据扫描0命中；首轮静态路径失败保留。仅Temp合成profile的packaged五迁移→桌面→guardian串行验证执行中，正常退出/回退门禁与期限保持；未部署、未激活或操作真实数据/服务。

- 统一CLI+desktop构建实收退出0，delivery1793783097659（renderer38.34s、Electron44.9.1/x64），无desktop-only/部署。首轮外部静态审计因ASAR3.4.1 Windows separator路径失败，历史保留；另副本使用path.join查相同renderer条目，新包未改。静态/扫描/hash再核验执行中，packaged/guardian/A-B仍待收，真实profile/程序/活动槽位未动。

- PTY第三轮 **3/0、51.8s**，三raw trace/hash/native完整流与12000首次记录顺序、retained连续序列/单socket/断开释放后进程存活均保留。随后终端完整keeper **20/1** 新失败为窄屏Enter被初始化blur帧门禁吞掉；用户追加批准最小产品修复，修后独立production bundle（29.30s）/同owner **10/0、50.0s**/完整terminal **21/0、59.2s**，原断言期限不改。canonical **340warnings/0errors、36/36、11guide blocks**；GUI官方tsc/e2e官方tsc/两本轮文件lint均0。`lint:changed` fixed上游仍退出1（148项），完整identity148/148及42源hash与已冻结340清单一致，未冒称lint-changed全过。统一CLI+desktop `--portable --check`已开始，独立delivery日志待收；未部署，真实profile/程序/槽位不动。

- 持久PTY两轮前置失败共 **6fail** 保留：bare PowerShell找不到runtime；绝对7.6.9 runtime已正常启动，但旧toggle假设新建Terminal2，未选中预置Terminal1，未进入12000行工作量。仅共享mock新增可选native input/resize桥接，产品无测试接口；第三份独立Temp副本改为展开侧面板/选择Terminal1，串行三场景执行中，原期限/工作量不变。原bottom设置承接边界待核验，不擅自恢复布局。统一CLI+desktop构建wrapper已准备但未运行，真实程序/profile/槽位未操作。

- 新版production原七场景 **7/0、44.8s、1worker/0retry**；完整context/metrics/frames/emitted及三投影Chrome raw trace已冻结/核验，七个benchmark/fixture/helper源hash与旧align完全相同，列表请求/可见行/消息/parts/160deltas/rowReplacements工作量保持。另四Home opt-in诊断 **4/0、18.1s**，raw trace哈希/非空核验，与原时间样本分开。资产1793778902255；首轮bare bun测试server启动失败保留。本次320mixed initialReady6478ms对应旧冻结基线7660ms，初始参照其他批次的口头退化判断已更正；历史单样本对照不称优化/趋势或严格A/B。当前全部任务结束；PTY三场景/统一包/安全/packaged/guardian/A-B及源码冷启动历史仍保留，真实服务/profile/槽位未动。

- 新版独立web production性能构建退出0（Vite23.27s），资产1793778902255。原七场景首轮在测试静态server解析bare bun时退出1、未采样，失败保留；只将新外部配置改为Bun绝对路径，新独立结果串行执行中（1worker/0retry/原断言期限）。Home原spec不启动interaction trace，另准备四份opt-in诊断trace，与原时间样本分开；PTY三场景/统一包/安全/packaged/guardian/A-B仍待收，真实程序/profile/槽位未动。

- CLI外部runner修正后原debug-paths连续10次 **10/0、40assertions**，完整CLI **349pass/15既有skip/0fail、1361assertions、192.86s**，XML确认；产品/正式测试/原30秒不变，首轮348/15/1保留。当前本批全部命令结束，准备新版production串行性能；原源码冷启动超时、统一CLI+desktop包、安全/packaged/guardian/A-B门禁尚未收齐，不提前交付或操作真实服务/profile/槽位。

- CLI完整首轮 **348pass/15既有skip/1fail、216.22s**：唯一debug-paths config断言失败由本次Temp runner自加OPENCODE_CONFIG_DIR覆盖case的XDG_CONFIG_HOME造成，非额外tmp/db字段问题。仅新外部runner清除该覆盖、保持私有XDG/HOME与原30秒/全部断言，正式产品/owner不改；原case10次→完整CLI待通知，原失败保留。仍不并行性能或执行构建/安全/A-B。

- 直接入口warm合成升级资产独立hash/journal/四exit0复核通过；Core migration/schedule/tool-schedule/job四文件 **85/0、369assertions、2.52s**，原默认/断言不变。CLI完整suite按其既有30秒默认在隔离HOME/XDG/TEMP启动，日志/xml待通知；不并行性能采样或执行统一构建/安全/A-B。

- 五迁移/profile阶段诊断与随后**未改脚本的直接入口warm复核**均退出0：四测试后台正常exit0、journal54→59仅固定五项，export/inbox/非空历史附件/归档/升级读写/重启/旧backup恢复、job导入/KV清理、SQLite及源数据/代际draft哈希通过。资产分别1793777976576/1793778116744。仅源码合成场景支持，不代替最终packaged/guardian；首两次direct冷启动60秒失败保留，根因未定、不称已修复或放行启动性能。当前无未收测试，继续必要Core/CLI回归与串行生产PTY、统一包/安全/隔离运行/A-B，真实服务/profile/槽位未操作。

- 升级观测轮仍失败：旧源码CLI60000ms startup deadline触发，harness仅终止自身合成子进程，exit143，无后端库/新版migration；共享转译缓存未解决。两失败保留，不能称自然或正常退出。新Temp阶段loader诊断打印preload/entry边界，原全部断言和60秒/15秒/30秒不变，结果待通知；不替代直接CLI启动验收或修改产品/真实服务。

- 五迁移/profile首轮源码harness退出1：旧源码CLI未监听，未启动新版/执行迁移；首轮无退出码/deadline记录，原因未定，失败资产保留。原旧源码packageVersion实为2.2.0（54项migration基线），不冒称2.2.2发行包。另用现有CLI共享转译缓存惯例及退出码/deadline观测的新Temp脚本运行中，保持原60秒/15秒/30秒与全部断言；不改产品或抵销首轮失败，结果待通知。

- listener收齐后启动五迁移/profile独立合成源码验收：旧/新源码CLI私有stdio/port0、生产prepareGeneration冷复制、完整export/inbox/历史附件/升级重启/备份回退与五migration/job/hash断言，日志 `renicode-sync-225-upgrade-e2e-first.log`待通知。明确sourceRuntime，不代替后续统一包/packaged/guardian验证；真实服务/profile/槽位不操作。

- listener本项接续收齐：三callback各10次 **30/0、120assertions、79.28s**，随后完整Server **108pass/8既有skip/0fail、6068assertions、77.06s**；两日志同类listener warning均0，XML确认实际执行次数。结合修前资源断言0/1、修后owner10/0、Core9/0、Core/Server官方tsc和canonical340/0解除本项资源回归阻塞，不宣称中断独立覆盖；原失败与警告历史保留。当前无未收测试，下一步五迁移/profile合成升级重启回退与其余回归，随后串行PTY性能、统一包、安全、隔离运行、A/B暂存；整体不放行，无真实服务/profile/槽位操作或提交推送。

- listener修后canonical实收 **340/0、11guide blocks、36/36（30cached）、19.36s**，退出0；callback各10次及随后完整Server仍待通知，不提前放行。

- listener修后原both-ports owner连续10次 **10/0、40assertions、50.31s**，XML确认实际10次/同类warning0；Core既有OpenAI两文件9/0、Core及Server官方tsc通过。三个callback各10次→完整Server串行回归和canonical待通知；原负向0/1与历史失败不删除，未提前收其他门禁。

- 接续用户批准“批准最小解绑修正（推荐）”，已仅实施openai bind自身error/listening回调的成功/错误/中断清理，并在原both-ports owner承接已证明修前失败的资源断言。全部原端口/次数/200ms/文案/2秒helper/10秒case保持；正式10次待收，随后callback/full Server与Core/Server官方tsc/canonical重新验收，不提前解除其他门禁。

- 最新限定六Server owner各10次 **60/0、580assertions**（Junit排除110 filtered后确认）；完整Server **108pass/8既有skip/0fail、6137assertions、55.83s**，Server官方tsc与canonical **340/0、36/36（33cached）、17.139s**通过。原失败历史保留，不能整体放行：owner/full日志分别20/2条listener warnings，trace明确指向openai.ts:152绑定重试未解绑listening回调。Temp原both-ports owner增加资源断言后 **0/1、4assertions**，原三恢复断言通过、新资源断言失败。拟仅修bind自身listener清理（成功/错误/中断），不改端口/次数/200ms/文案/期限或提高listener上限；产品及正式资源断言未改，待额外确认。性能、五迁移/profile隔离升级回退、统一包、安全、A/B门禁继续保留；没有未收后台测试或真实程序/profile/槽位操作。

- 用户追加确认“批准限定六 case（推荐）”：仅Server六受影响owner的各自models配置加既有snapshot:false（artifact1/OAuth3/Session instance1/leader1），不改共享options/fixture、其他完整目录测试或产品；原helper2秒、默认5秒/both-ports既有10秒及全部断言/0retry不变。正式六case各10次已启动，Junit与独立日志保存，结果待通知；原失败历史及后续完整回归/性能/代际/安全/统一包/A-B门禁保留。

- 用户追加确认“批准两处最小修正（推荐）”：已仅正式Review owner在初始measure前等待既有面板落位、Server leader owner用跨shell Bun检查子脚本代替PowerShell5.1报错的POSIX命令。原全部精确断言、10秒/60秒GUI及5秒Server预算、产品和0retry不变。正式两owner各10次、完整Review/Server suite、canonical/Server官方tsc待收；原失败历史保留，尚不解除正式suite失败或性能/代际/安全/统一包/A-B门禁。
- 正式Review慢动作owner10次已 **10/0、5workers/0retry**，仍待完整Review。Server官方tsc退出0，但正式leader10次 **5pass/5fail**（原5秒timeout及晚到marker/active错误），不是通过；跨shell修正未等于完整调度验收，失败及并行负载背景完整保留，不以复跑/扩大期限解除。完整Server/Review/canonical及App e2e官方类型检查仍待通知，性能/代际/安全/统一包/A-B继续阻塞。
- 接续实收正式完整Review **29/0、实际1worker/0retry**，与慢动作owner10/0共同支持原图表readiness修正；canonical340/0、11guide blocks、36/36（31cached）通过。新完整Server却 **103pass/8skip/5fail**（artifact/OAuth callback/Session instance原期限），与leader10次5/5分别保留、仍阻塞；Temp seed/boot/marker分段诊断3次待收，不改预算。App E2E官方tsc首检2diagnostics为Go旧default.build fixture与Settings未用Match，仅按原同一模型身份修catalog字段/移除未用import，原断言/期限不变；E2E tsc与Go原两case待收。无性能采样、完整升级回退、安全/统一包/实时profile或A-B操作。
- 最新App E2E官方tsc退出0、Go原两case2/0/0retry；残留修正后的canonical待通知。Server分段诊断3/0并未复现正式5/5：cold seed-disposed2806ms、assert4405ms，warm seed516–534ms、assert1938–1951ms；原5秒预算不变，不能拿此成功诊断放行。五新完整Server失败仍需定位，三OAuth及Session instance实际卡test helper原2秒plugin/实例readiness等待。当前无后台未收测试，仅canonical待通知；性能/五迁移隔离升级回退/统一包/安全/A-B均未完成，未操作真实程序/profile或提交推送。
- 本轮最终实收canonical **340/0、11guide blocks、36/36（34cached）、5.274s**、最新diff-check退出0。全部本轮命令已完成，无未收后台测试。Review正式29/0+主动慢动作10/0、App组件220/0、SessionUI组件177/0及E2E官方tsc收齐；Server正式leader5/5与新完整103/8/5仍阻塞，不以3/0分段诊断抵销。后续仍须定位Server、完整五迁移/profile隔离升级回退、串行原性能工作量及统一包/安全/A-B暂存；未提前部署或激活。
- Harness重启后只继续Server诊断；三个任务私有静态server均已结束，未操作真实程序。Temp fetch/artifact计时首批实际四case各3次12/0（第三OAuth过滤名不符，另按正式名3/0），独立冷artifact3/0仍未复现五失败。源码核实官方v2.2.5的integration/agent目录已等待插件激活，旧helper却将真实启动包在2秒retry内，注释过时；不自动删除期限或改产品。Temp仅用既有models.snapshot=false隔离多MB未被这些case断言的捆绑目录，六case各3次诊断待收，正式配置未改。所有原失败及性能/五迁移/profile/统一包/安全/A-B门禁保留。
- 最小目录Temp诊断实收六case各3次 **18/0、174assertions**，原2/5秒及both-ports既有10秒预算、所有实际插件/结果断言不变；leader seed106–149ms、assert999–1051ms。此前完整目录seed516–2806/assert1938–4405ms来自不同批次，不当作严密同负载A/B或确定性能改善。正式拟议仅限六case各自models选项，不改共享options/fixture或其他完整目录测试；正式配置尚未改，Server历史5/5及103/8/5继续阻塞。无待收测试，无真实profile/进程/防护/槽位操作或提交推送。

- 2026-11-03 单项追加批准：用户选择“批准单项调整（推荐）”，仅Client三进程恢复case内部3000→10000ms、Bun单项5000→15000ms；原断言/requestTimeout100ms/其他测试与产品预算不变，不加retry。已实施并连续10次10/0、20assertions；受影响Client suite/官方tsc待收。原完整失败及局部5/5保留，GUI两失败、性能/代际/安全/统一构建/A-B仍阻塞，不扩大交付或真实进程操作许可。
- 接续实收：Client完整253pass/4既有skip/0fail、1125assertions及官方tsc通过；canonical340/0、11guide blocks、36/36（0cached）通过。GUI诊断抓到窄屏Rename先focus成功，再被More抽屉迟到回焦抢走；仅共享MobileDrawer取消已移到外部元素的迟到回焦，保留原其他恢复与回调，App官方tsc成功、隔离4320 build/修后keeper待收。Review诊断3次及10次未复现，原1/64px失败保留，原owner压力复现10次待收、不放宽精确断言。App完整component冷启动2workers/0retry已启动；性能/代际/安全/统一构建/A-B仍未完成，实际状态与日志见新版验收记录。
- 最新：MobileDrawer修后build34.86s/2820entries、App官方tsc及canonical340/0、11guide blocks、36/36（34cached）通过。首个4320临时静态server路径分隔符错误导致全部JS404，owner10次均页面启动失败，负向日志保留；仅Temp server保留native path.resolve后另起4321（未重启任何服务），复用同一production dist、入口JS核验200。4321原窄屏rename owner10次 **10/0、5workers/0retry**，全部断言不变。原Review压力复现10/0但未找到初轮1/64px根因，仍阻塞；App完整components及4321四受影响生产keeper待收。无统一包、安全扫描、实时迁移、活动槽覆盖或A/B暂存。
- 4321四受影响生产keeper实收 **47/0、2workers/0retry、2.1m**，含全部terminal、移动模型/variant回焦、插件抽屉返回和会话选项；与owner10次分开，不重复计合同数。App完整components/错误4320批次仍待通知；Review初轮1/64px失败根因未证实，后台代际/性能/安全/统一构建/A-B仍未完成。
- 接续实收：App完整component冷启动 **220/0、2workers/0retry、7.5m**，完成日志无optimizer reload记录；缓存移存保留后SessionUI冷启动3295完整suite仍待通知。Server完整 **107pass/8skip/1fail**，双Server leader原命令实际在PowerShell5.1拒绝`&&`、无marker，Temp portable Bun脚本同原断言1/0仅支持夹具方向，正式case未改/完整失败未解除。Review既有slow旋钮主动复现 **0/3**，全祖先补诊断0/1确认侧栏容器703.65625与固定内容704导致初始共同x偏移；Temp等待既有flight inline paint清空再采reference验证中，原精确rect/期限和产品未改。错误4320批次收到执行器10分钟超时未完成，无完整计数、不续跑掩盖。详见新版验收记录；性能/后台5迁移代际/安全/统一包/A-B均仍待完成。
- 最新实收SessionUI冷启动完整 **177/0、2workers/0retry、5.3m**，完成日志无optimizer reload；Review仅Temp补落位等待后慢动作 **3/0**（修前0/3及全祖先0/1保留），支持reference采在面板飞行而非Fit尺寸错误。拟两个最小正式夹具修正：Review只在初始measure前等既有inline paint清空、Server只换跨shell Bun子脚本；均不改原断言/期限/产品，不加retry。正式源码尚未改、两个正式suite失败尚未解除；确认后需各owner10次及受影响suite/check。无后台待收测试（错误4320执行器超时未完成不当suite通过），仍未打统一包/安全验收/迁移实时profile/A-B暂存。

- revision12（2026-11-03）：用户明确选择“同步稳定版 2.2.5（推荐）”，将有效上游基线从 `86ce19d96eccbfb95af3ff3189c7071575f94339` 改为官网V2稳定标签v2.2.5的commit **`9bbb8ce18c80f099e0e448775f59d965ead40a21`**。保留全部定制、未提交warning清理和历史证据，完成原未完及新增受影响验收后统一构建/安全检查/隔离运行并A/B暂存；不追随滚动dev，不取消原验收或新增强制关闭/重启、提交推送、防护变更、无人值守执行许可。实施保护原两工作树，在新隔离工作树承接；主计划保持本路径。后台/数据库增量必须重新核实，真实迁移/激活仍按原代际、正常退出及安全门禁执行。

- revision11（2026-11-02）：最终GUI真实测量确认十个z文案170.609375px超过164px可用空间，用户选择“批准最小夹具修正（推荐）”。只修原Settings pointer/keyboard综合case的短查询input及对应exact文字期待为四个z；所有原断言种类、交互流程、长查询/省略号keepers、产品布局与期限保持。其他真实失败继续阻塞验收，不授权通过重试或提前交付规避。

- 2026-10-28 用户要求开始实施，并明确选择「先对齐 2.2 再迁移」。授权本计划编制及范围内实施；不是仅作评估。
- 2026-10-29 用户明确要求“全部提交推送”，授权将原 `renicode` 工作树现存定制/文档与隔离 `align-renicode` 的上游合并/迁移结果分别记录并推送到自有 `origin` 对应分支。此授权覆盖此前“不自动提交”的限制，不授权强推、向官方提 PR、部署或迁移实时数据。
- 原始基线：Renicode HEAD `9e5b9db11`，上游2.2.0 dev快照 `86ce19d96eccbfb95af3ff3189c7071575f94339`。历史证据仍绑定此快照；当前有效基线按revision12明确批准改为v2.2.5，不能用旧证据宣称新版通过。
- 对齐上游，保留现有定制及未提交工作；迁移到新版 GUI 内置插件架构，补齐必要通用宿主接口，减少散布在 shell/Home 的定制依赖。
- 保留 Midea 配置、品牌、独立 profile、patch 安全保护、Unicode 工具检索、move requested 语义、项目中心引用/快照、侧栏对话时间，以及独立 A/B 启动器。
- 包含后台与数据库升级方案、隔离验证与构建；符合安全条件后按 A/B 暂存，不强行激活、不关闭或重启运行中的桌面/后台。
- revision 3（2026-10-29）：用户“好的，按你的建议推进”批准1452条warning的两阶段清理：先低风险排版，再逐模块审查类型断言/宽化/输入契约及其他规范问题。保持行为、测试断言与规则不变；不机械添加安全注释，不用未经批准的较大接口/架构变更清零。方案确认记录见原对齐讨论。
- revision 5（2026-10-30）：用户选择先继续warning清理，随后明确批准最小主题输出类型修正：`ResolvedTheme`补齐已有rgba输出、`withAlpha`标明返回类型；主题输入`ColorValue`、JSON schema、颜色算法与CSS输出保持不变。保留revision4所有范围/验收与安全/正常退出/实时数据门禁，不恢复或上传样本、不将本确认当安全放行。
- revision 6（2026-10-30）：用户批准安排真实激活并协助停止旧后台；现有注册监控触发自身shutdown，不发送终止信号。随后确认只排除 `profile/cache/.bun/install/cache` 的真实复制清单，保留原缓存、其他数据与全部链接/SQLite/哈希门禁，接受依赖可能重新下载。保持revision5所有其他scope/验收，不强制结束真实进程、不任意跟随链接或删除数据，安全允许/恢复仍由用户手动处理。
- revision 7（2026-10-30）：用户选择“不加例外，保留警告”，允许经逐项审查证实必要的通用解析边界保留合理诊断及依据，不修改规则或添加局部例外。其他条目仍实际修正或审查，不能把全部剩余条目自动归入合理保留。所有条目处理/审查完后统一打包交付，不以数字清零缩窄通用持久化契约；revision6其他范围与安全/完整性/A-B门禁保持。
- revision 8（2026-11-02）：本轮用户选择“批准单项期限（推荐）”，仅允许locale全字典加载和plugin首次definition这两项真实冷加载测试使用30秒单项期限并注明加载工作量。所有断言、其他测试默认期限、无重试与最终完整回归保持；不授权生产加载架构修改或将热加载结果替代冷加载证据。
- revision 9（2026-11-02）：复现formatter把畸形config/model的data当合法对象导致TypeError后，用户选择“批准最小解析修正（推荐）”。仅在formatter owner完整解析其使用字段，畸形输入走已有message/fallback，合法错误文案、Protocol/HttpApi和持久化契约保持不变；扩充原owner回归，不扩展为新的全局错误/加载架构。
- revision 10（2026-11-02）：并行审查发现另外三个具体解释边界，用户选择“批准三处最小修复（推荐）”：实际复现后，errorMessage仅接受字符串；非法已存主题模式回到system；窗口恢复忽略非布尔maximized/fullScreen标记。合法值、其他窗口字段/额外数据、通用存储/API保持；未复现候选不改，扩充原owner回归，不变成存储迁移或新架构。全部条目处理/有据保留再统一打包的门槛不变。

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
- revision 4（2026-10-30）已确认：用户选择“批准最小修复（推荐）”，允许新增Windows CLI自脱离后台启动参数与桌面接入，以避免Electron GPU/Mojo端点继承；保留原固定端口/认证/profile/错误输出，不修改shutdown或取消其他验收。允许隔离回归、打包/安全检查与满足门禁后的仅程序A/B暂存，不授权真实后台关闭、实时迁移或自动激活。实际资源证据见升级验证最新段。

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

- revision12：用户确认同步官网最新V2稳定2.2.5，固定commit见上；原固定快照及全部验收/部署历史保留，旧未完项仍须收口。原工作树文档和align-renicode未提交源码先哈希保护，新隔离工作树承接，不覆盖现有工作或创建重复active计划。官网latest metadata为2.2.5；GitHub通用latest API的V1结果不采用。

- revision 10：用户条件性批准上述三个明确坏输入边界的最小修复，须先实际复现并保留旧/新owner证据；不授权任意坏输入清洗、实时profile迁移、非生产清理延期或取消安全/完整性/A-B门禁。三个代理执行方式已另行明确批准，仍由主助手统一收口。

- revision 9：用户明确批准已复现的畸形formatter输入处理变化；此前仅去除索引断言的版本及其904/904单测证据保留，不用该旧证据覆盖新增解析版。其他范围和最终统一交付门禁不变。

- revision 8：在两文件无并行负载复核仍各首次超过5秒后，用户明确批准仅两项真实模块加载测试的30秒期限；保留此前902/2和48/2失败历史，不修改全套timeout、添加retry/skip或删除断言。其他生效范围与统一打包门禁不变。

- revision 7：合理通用解析边界诊断可在完成审查与依据清单后保留；用户明确拒绝局部规则例外。warning验收从要求全数消除改为全数处理或有依据保留，不取消最终统一打包、回归与交付门禁。批准原意见关联讨论最新段。

- revision 6：真实激活/停止协助与单一Bun下载缓存排除经用户明确批准；默认完整复制与链接拒绝不变，仅显式 `prepare-generation --skip-bun-cache`生效，不增加任意排除参数。批准原意与1816链接实际盘点见讨论/升级验证最新段；不取消安全、数据库或原数据保留门禁。

- revision 5：用户选择“批准最小类型修正（推荐）”，允许仅修正主题现有rgba输出契约，仍不放宽输入或持久化。用户此前选择“先继续warning清理”调整本轮执行次序，不缩减对齐交付验收；此前942/退出验证/安全阻塞历史保留。批准依据见关联讨论最新段。

- revision 4：保留revision3所有有效范围和验收，新增已明确批准的CLI自脱离启动接口及桌面接入；确认依据为2026-10-30用户在问题工具中选择“批准最小修复（推荐）”。此前待确认记录与失败历史保留，不把批准接口等同于已修复或已部署。

- revision 3：在revision 2的对齐/定制迁移与代际升级范围上，新增全仓已盘点warning的两阶段清理及相关检查；不减少此前验收，不解除正常退出/实时数据/部署门禁。2026-10-29用户明确同意建议，允许范围内实施，重大类型契约/架构调整另行确认。

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
- 提交/推送实际完成：旧工作树 `66b40ea23`、新版双父合并 `2ce0d3d9a`，已原子推送到 `https://github.com/liren60/opencode.git` 的 `renicode` / `align-renicode`；远程完整SHA与本地一致，两工作树当时均clean。未强推、未提PR、未部署或迁移实时profile。
- 推送失败历史保留：首轮Node不能加载TS lint插件；随后三轮hook在Turbo的Git状态查询处timeout（300/600/180秒）。仅清理本次检查的已识别工具进程；未停止用户桌面/后台。临时PATH使用Bun提供的同哈希node shim，命令专用Husky init移除继承的Git仓库定位变量后，原pre-push完整执行通过（1452warnings/0errors、11guide blocks、Turbo36/36、0cached、2m25.236s），推送退出0。未修改或跳过仓库钩子；临时环境不写入全局配置。

### 2026-10-29 本轮继续：最终包与真实 guardian 链路

- 用户要求继续既有已批准范围；源码工作树接续时均clean。继续在 `PG/opencode-align` 实施，主计划仍只维护原 `renicode` 本文件，不更新固定上游基线。
- 上轮 packaged smoke 留下明确合成 profile 的测试进程，没有最终报告。仅清理该测试树后，旧脚本才输出历史/附件、认证与独立CLI staging通过；因测试桌面被外部结束，不能称正常退出或含updater guard的最终包验收通过。失败/清理证据见升级验证。
- updater guard 最终包正在重建；首轮因命令PATH缺bunx失败，补本次PATH后重跑。拟收齐最终资源审计、packaged正常退出及真实CLI prepare/guardian健康晋升/回退负向门禁证据后，仅按已批准代际流程暂存程序；不复制/迁移实时profile、不启动实际guardian、不自动激活。
- 真实代际隔离验证前发现已有禁用协议注册开关在packaged下被OR短路。已在隔离工作树仅修正已有判断，正常启动默认行为不变，外部guardian测试增加Windows协议项不变断言；不通过实际注册到测试slot做负向。最终包须包含此最小隔离修正，主计划生效范围和revision不变。

### revision 3 warning 清理实施顺序

当前交付阻塞：最终packaged smoke清理失败，真实guardian未通过；Defender已隔离最终包Renicode.exe并判定 `Trojan:Win32/Cinjo.O!cl`，不能推断误报或部署。详细实际证据见升级验证。禁止绕过防护/恢复被隔离文件作为“修复”；warning清理独立继续，不解除安全与运行门禁。

1. 以完整check日志1452/1452盘点为基线，保存每条rule/file/line；原工作区应用源码不批量修改，继续在隔离工作树实施。
2. 第一批仅使用现有spacing规则产生空白修复，在外部副本预览，再通过patch应用；核对diff仅空白、非空白源码一致。spacing基线460条，不改业务/断言/规则。
3. 第二批按文件和模块审查断言/类型/边界与其他规则，先消除可证明的冗余类型/断言，再明确真正I/O解析归属。每个触及GUI插件文件的剩余warnings也须收敛，不用机械SAFETY注释掩盖未检查条件。
4. 保留完整check、固定上游changed lint、官方tsc及相关unit/e2e/component验证；涉及Session/timeline运行逻辑时先记录生产benchmark。格式批次不冒称行为优化或性能提升。
5. 批次进度按实际剩余条数/验证记录报告，不将spacing清理完成视为全仓清零或对齐计划完成；最终打包/安全仅程序暂存仍按既有门禁。

实际接续：spacing规则的48文件外部预览通过，通过patch应用后非空白/AST/注释正文一致，完整check36/36/992warnings/0errors、spacing0条；相关App/UI/SessionUI unit通过，Desktop installer四项被NSIS下载timeout阻塞。Usage第二批修复两处条件spread并保持可选字段缺席语义；常量断言本就豁免，已撤回不必要的类型试验，未机械去掉有效const推导。当前完整check36/36/990warnings/0errors，两文件targeted lint0、App官方tsc/e2e类型检查和50/50重复通过，component20/20和独立生产fixture build通过；settings首轮外部config遗漏baseURL而全失败，修正重跑待收。fixed-upstream changed lint仍有触及17文件48条既有问题，下一批优先收敛。详细失败与边界见 `docs/validation/renicode-warning-cleanup.md`，不宣称全仓清零或安全可部署。

settings后续：第二轮13pass/37fail，已定位外部命令缺built标志与fixture origin变量，helpers沿用4096而生产App请求4346。先以正确builtenv串行验证两项原失败探针2/2通过，再启动完整50项/5workers/0retries，结果待收。产品源码与测试断言未改，失败历史保留。

后续收齐：正确fixture上settings完整50/50pass（45.1秒、0retries）。第二批局部类型/命名收敛后完整check36/36/950warnings/0errors、官方App/e2e类型检查、请求队列12/12与radar重复20/20通过；类型擦除/局部改名运行AST一致，radar CSS/25dot等价。两处生成图标名断言经174映射/3组light配对实际审计后记录具体安全依据，没有机械批量注释。changed lint现只剩4文件8条Session/timeline相关问题，下一步先生产benchmark基线再保行为修复；新fixture build待结果。精确失败与阶段边界见warning验证，仍无安全部署路径，不恢复隔离文件或操作实时profile。

950新fixture整体build退出0；Home/session-summary/tabs/settings/session-queue五文件0retries回归在4347启动，结果待收。只在GUI回归结束后串行采集下一批生产benchmark，不混合并行测试负载；尚未修改剩余Session/timeline运行逻辑或声称全仓warning清零。

第三批实际进度：五keeper157/157通过后串行生产text projection before3/3通过，保留3单样本/完整数据与源码hash，不能宣称趋势或覆盖非空Todo/离场队列。剩余8条已按owned数组/所属Todo解释边界/optional reset字段原语义修复；新Todo contract对冻结旧实现5/5与新实现重复50/50、既有queue/Todo合计15/15、SessionUI62/62通过，官方App/e2e类型检查通过，fixed-upstream changed lint133文件/0问题。完整check/第三批build待结果，后续新产物GUI与串行after benchmark；未全仓清零、未恢复隔离文件或部署。失败与边界见warning验证。

第三批check/build已收齐：完整check36/36/942warnings/0errors、11guide blocks、133改动文件changed lint0；独立新fixture整体build退出0。942新产物五keeper在4348启动，待结果；之后再串行after benchmark。累计减少510条，不视剩余942条为已审完，安全部署阻塞不变。

第三批最终收齐：942新产物五keeper157/157pass（1.4分钟、0retries）后串行after benchmark3/3pass，与before的场景计数/字节/160deltas一致，rowReplacements仍0；均单样本，不宣布性能趋势或非空Todo/离场队列专项成本达标。本轮全部命令已结束无待收结果；计划revision3仍active、剩余942条继续待审查，下一批优先确认真正持久化/类型owner边界，不静默缩窄generic drafts契约。未提交/推送/A-B暂存/激活或实时数据迁移；安全阻塞与失败历史保留。

Defender后续：用户要求一次解决并继续执行，安全情报更新到1.463.21.0，官方哈希匹配的Electron发行目录73/73文件一致，CLI/完整新包诊断及正常扫描均未检出威胁，重建新包不再被本机Defender阻断，旧隔离样本不恢复、不声称微软已判定误报。打包器写ASAR完整性资源会改变EXE字节，已撤回“跳过资源编辑即stock字节相同”的推断。真实guardian已通过隔离正向prepare/自启动后台/健康晋升/协议项不变，但实际Electron写clean后仍不退出；仅停止合成后台才自然退出。stderr释放试验未修复真实阻塞，全部撤回。新增发现原Client兼容owner服务回归单独10/10超时，未放宽期限。最终从恢复原状源码完整重建，包hash与干净扫描记录见升级验证；未A/B暂存/激活或操作实时profile/真实进程，正常退出/服务回归/原NSIS网络门禁保持。下一步定位后台关联退出生命周期，不用杀共享后台或强制桌面退出作修复；本轮所有命令结束无待收任务。

### 2026-10-29 本轮接续：服务回归门禁通过，原生退出仍阻塞

- 用户要求继续既有计划，仍在隔离工作树实施。Client原timeout再次复现后，确认固定500ms不能保证测试所需旧owner先发布；仅改既有用例使用已有controlled夹具安排发布/替换顺序，保留原断言和5000ms期限。定向10/10、真正全Client234pass/4skip/0fail（22文件）、官方Client tsc通过；不修改服务生产实现，不重新采用已撤回stderr试验。
- 外部合成profile观察器证明非packaged自启动后台对照正常退出；packaged分支诊断在`will-quit`、Node`exit(0)`和Electron`quit`后，Windows仍`HasExited=false`且49线程存活，直到仅停止合成后台才自然退出。阶段已缩到原生退出等待，具体native stack/资源尚未取得；不把临时packaged getter试验称真正包验收，也不增加app.exit、后台关闭或shutdown超时绕过。
- 最新完整check942warnings/0errors、11guide blocks/Turbo36/36（0cached、2m16.679s），fixed-upstream changed lint133文件/0问题、diff whitespace检查通过。详细命令、外部资产、初次timeout及未命中分支试验见`docs/validation/renicode-align-upgrade.md`最新段。
- 当前Client服务回归门禁已通过；正常packaged进程退出、剩余942条warning、NSIS网络门禁未解除。没有本轮待收任务、新提交/推送、A/B暂存/激活或实时profile迁移。下一步优先获取原生退出等待证据，然后完成对应最小修复及真实guardian重验；主计划revision3保持active，未缩减验收范围。

### 2026-10-29 交付接续授权

- 用户明确要求“干到暂存或激活AB更新为止”，继续授权范围内实施、安全验证与实际程序暂存；本轮优先达到安全的generation暂存停止点，不用单次检查结果结束交付。此执行次序不取消剩余warning审查或既有验收。
- 仍不把“暂存或激活”解释为允许强制关闭真实桌面/后台、无人值守复制实时profile或覆盖原代际。满足门禁后执行仅程序暂存，不写自动pending、不启动真实guardian；实际迁移/激活另等用户正常退出与明确窗口确认。

### 2026-10-30 接续：退出根因资源证据

- 已核对上轮未记入文档的真实guardian原生栈，主线程卡在GPU/Mojo Flush与通道销毁；旧shared-handles交集因内核object地址全0无效，不能冒称共享已证明。本轮基线与overlapped仍失败，ignore stderr诊断能退出但不能作为保功能修复。
- 新逐进程命名管道审计证明合成后台持有桌面的两个inherit属性Mojo端点，结合原生栈定位具体资源泄漏；现有CLI service start中转的上轮诊断正常退出，仍不是产品修复/真正包验收。
- 下一步先确认Windows CLI自脱离启动接口，再保持原端口/认证/代际与错误输出完成最小修复、真实guardian及失败门禁重验，最终打包/安全扫描后仅程序暂存。当前revision3生效范围不变，未缩减剩余942条warning及NSIS验收。本轮没有待收命令、生产源码改动、新提交/推送、A/B暂存/激活或实时profile迁移。

- 后续用户已确认接口并升revision4。第一版Node-compatible中转CLI回归通过但真正包仍失败于退出，不能交付；第二版改最终派生为Bun原生spawn，沿用Service.ensure监督和显式stderr，source重复20/20及full服务文件28pass/3skip/0fail、CLI官方tsc通过，完整重建待收。NSIS下载已恢复，实际3/4通过，唯一失败为缺pwsh；官方portable下载待收且哈希核对前不运行。详细夹具/timeout/失败与真实guardian资产见升级验证。本轮继续保持原退出、安全与实时数据门禁，未暂存/激活。

- 后续installer门禁已收齐：官方完整PowerShell7.6.9 ZIP与GitHub官方SHA256匹配，独立Temp runtime版本核对后4/4及重复40/40通过，未用旧不完整包或修改全局环境。第二版当前独立全仓check942/0、11guide blocks/Turbo36/36、changed lint133文件0问题通过。第二版新包仍由任务 `sh_18a75fc7a001QZhFQVvfE8BpOI` 构建，完成通知后接真实guardian/管道审计/packaged历史附件正常退出及新包安全扫描；通过后仅程序A/B暂存。当前未执行这两项新包运行或A/B暂存/激活，不将第一版失败覆盖为成功。

- 第二版最终包资源通过但guardian退出再次失败，最终后台实际仍继承两个Mojo端点；撤回Bun native自动隔离句柄推断。第三版仅在短命worker内清除自己原有inherit flags，保留句柄与显式stderr、不关闭进程；CLI单次/官方tsc通过，重复29/30（唯一60000ms启动失败用例timeout），不冒称稳定性通过。第三版全构建任务 `sh_18a8346e5001CYyyQM6UjfVzMQ` 待完成；后续再以最终后台管道及guardian真正退出检验。各次失败、NSIS通过、剩余942条与仅程序暂存门禁均保留。当前未提交/推送/A-B暂存/激活或实时迁移。

### 2026-10-30 最终停止点：退出修复验证通过，暂存被新的安全处置拒绝

- 第三版build/check/portable完成，942/0、11guide blocks/Turbo36/36；CLI full29pass/3skip、三项重复30/30、官方tsc与NSIS40/40通过，前次失败不抹除。服务器重启通知后接已有完成结果，未重复构建。
- 真正guardian端到端、正常原生desktop/guardian退出、活后台rollback拒绝/合成后台停后回退/两profile保留通过，最终后台无桌面Mojo端点；packaged非空合成历史/附件/认证/隔离CLI/原生退出通过。退出门禁本轮取得实际证据，不靠杀后台或app.exit修复。
- 完整包正常Defender扫描曾未检出威胁，但真正 `deploy-renicode.ts --check --generation --skip-build` 在stage-generation读取EXE时失败，新检测证实源EXE再次被 `Trojan:Win32/Cinjo.O!cl` 隔离。当前情报1.463.30.0、防护全启用；不是已证实误报，不恢复、排除、换路径复制同样本或规避完整性。详见升级验证最新段及完整候选哈希。
- **A/B暂存未成功/未激活**。active B与previous A仍是2.1.4，pending/guardian空，无真实generation候选；快捷方式仍用旧launcher。新launcher已编译但未接入，保留失败资源和handoff107。实时profile未复制或迁移，未关闭真实桌面/后台，未新提交/推送。
- 本轮所有命令结束，无待收任务。下一步先处理本次新的安全软件隔离门禁（厂商复核/安全构建路径须保持既有权限，不上传/恢复样本），再安全暂存；其余942条warning继续待审查，不将本轮运行通过或失败的部署尝试视为整个计划完成。主计划revision4保持active。

### 2026-10-30 本轮接续：安全复核材料

- 用户继续本计划，核对两工作树与实际检测后，未恢复/复制/重建被隔离同样本或重复部署。事件XML显示实时检测发生于企业DLP和部署Bun读取EXE时，不据此认定DLP导致误报；情报仍1.463.30.0、防护均开启。旧CLI另有历史Filery active汇总记录，当前文件状态未验证，建议IT一并审阅，不扩大为实时profile修复。
- 再读候选完整hash与ASAR资源写入源码，整理不含凭据/聊天/用户名路径的本地英文复核材料；官方微软入口要求实际样本，尚未获得样本恢复/对外发送授权，未提交。详细核验、事件record与边界见 `docs/validation/renicode-defender-review.md`。
- 真正A/B以readonly SQLite再次确认active B/previous A、两槽2.1.4、pending/guardian空、handoff107；未暂存成功/激活、未操作实时profile/真实进程或新提交/推送。下一步须明确IT/微软复核渠道与样本处理权限；942条warning仍独立待审查，既有scope/revision4不变。本轮命令均结束，无待收任务。

### 2026-10-30 revision 5：按选择继续warning，主题批次收齐

- 用户选择先继续warning清理，保持Defender部署门禁。泛型draft codec审查后未缩窄；主题先清理冗余断言，再经用户明确批准补齐既有rgba输出契约，主题输入ColorValue/JSON schema/算法/CSS保持不变。生效revision5及确认依据见授权/变更记录与讨论最新段。
- 本批四个主题文件最终完整check923warnings/0errors、11guide blocks匹配/Turbo36/36；fixed-upstream changed lint137文件0问题；UI官方tsc、全UI315/315与主题重复90/90、App官方tsc通过。36主题/明暗/五种覆盖共360组tokens与CSS前后逐字节相同；初次PATH缺bunx及中间7/2条changed lint失败记录保留。详见 `docs/validation/renicode-warning-cleanup.md`第四批。
- 实际相对942减少19条，累计相对1452减少529条；其余923条继续逐模块审查，不机械注释/放宽持久化或输入契约。下一批继续真正owner边界，涉及重大契约/架构仍先确认。
- 无待收执行任务，未重新打包或重试被隔离候选，未提交/推送/暂存/激活、恢复/上传样本、修改防护、迁移实时profile或关闭真实进程。A/B仍旧2.1.4与handoff107，安全复核门禁不因warning检查通过而解除；计划仍active，非整个迁移完成。

### 2026-10-30 用户手动允许后开始暂存核验

- 用户表示安全中心已允许、以后允许/恢复都由其手动处理，并要求开始核验与仅程序暂存。AI不恢复/排除/改防护，不将手动允许记为微软误报结论；正常退出与实时profile门禁不变。
- 源包Renicode.exe实际仍缺失，无法核对候选EXE；app.asar/CLI哈希与第三版候选相同。A/B readonly状态仍旧2.1.4、active B/previous A、pending/guardian空、handoff107。因此没有调用部署或重建/其他路径复制同样本，也未修改快捷方式/启动guardian。
- 等待用户手动处理正确记录并恢复原路径文件后再核验。旧候选不含本轮主题923批次，不冒称最新源码已经打包。细节见 `docs/validation/renicode-defender-review.md` 最新段。本次任务均结束，无待收命令；未暂存或激活。

### 2026-10-30 用户明确要求观察新构建

- 用户随后要求“你再生成一个，我看着”，明确批准在其观察/手动安全处置下重新构建最新版。这是对此前不自动重建被隔离候选停止条件的本次具体授权，不表示厂商已判定安全；不授权AI恢复样本、排除、改防护或规避检测，也不授权实时迁移/激活。
- 使用既有官方哈希核验过的完整Electron44.9.1发行目录，执行现有 `build-renicode.ts --desktop-only --portable --check --electron-dist=…/dist-complete`，保留ASAR完整性资源和现有打包参数，不改路径/字节以逃避检测。CLI源码本轮未变，复用已核验哈希的第三版CLI；desktop重新构建，包含最新主题修正。
- 构建任务 `sh_18b1e4fd1001q4rAn2pMitD4eW` 已启动，日志 `Temp/opencode/renicode-user-watched-rebuild-20261030.log`。尚未收到结果，不读/运行仍在生成的EXE；完成后先记录新候选hash与资源审计、实际安全处置状态，再决定后续验证/仅程序暂存，不沿用旧EXE哈希或冒称新包已通过运行验收。

- 首轮300秒timeout：check923/0/11guide blocks/Turbo36/36和main/preload/renderer构建实际通过，打包尚未完成、EXE未生成。确认无残留构建进程后，只对现有build输出重跑同参数electron-builder，任务 `sh_18b23681c001ugvF2W7IYsjAg4`、20分钟上限；日志 `Temp/opencode/renicode-user-watched-packaging-20261030.log`。未重复全构建、运行包或暂存/激活；完成后资源与哈希审计仍需收齐。

- 直接打包首轮因PowerShell未引用 `-c.*`参数而误读配置文件，退出1，未生成EXE；不是新的Defender检测。仅为同值参数加引号重跑，任务 `sh_18b241259001vdk2VkKezq41uH`、20分钟上限、quoted独立日志，结果待收。资源/哈希/新包运行证据与仅程序暂存门禁保持，失败历史保留。

### 2026-10-30 程序暂存成功与安排激活

- quoted打包最终成功；新包资源审计、正常扫描、真正guardian/升级回退/正常退出及packaged历史附件隔离验证均通过。完整check仍923/0/11guide blocks/Turbo36/36；新EXE/asar哈希与详细资产见升级验证最新段，不用旧候选运行证据代替。
- 实际generation程序暂存成功：`318a38a2-f425-40cc-a69d-537c36e554c6`，handoff108；7文件hash复核通过、A-B快捷方式接入新独立launcher。仍active B/previous A/注册槽两版2.1.4、pending/guardian空、目标profile未创建，不覆盖原安装/活动包，不恢复样本或更改防护。
- 用户明确回复“现在安排激活”，批准此前代际设计中的真实profile准备与启动健康验证；旧桌面/guardian与后台正常退出条件不取消，不授权强制结束或重启旧进程。CIM显示桌面/guardian已不在，旧后台PID25384仍活；认证只读active检查为0，不能当停机证明。
- 当前实际停止点：新版已暂存但未激活，旧后台停止窗口未满足；未执行真实prepare/launch/stop/kill。Service.stop Windows为信号终止，不当优雅停机验收。等待用户处理旧后台停止后再执行完整生产冷复制/SQLite/claim/启动门禁。所有构建/扫描/隔离测试/暂存任务结束，无待收任务；未提交/推送，warning923仍待审。

### revision6 实际激活续作

- 用户授权停止协助后，经现有注册监控触发旧后台自身shutdown，未发送终止信号。旧PID25384日志/实际退出通过，首观察器ExitCode=null失败保留。真实复制遇1816个仅Bun下载缓存链接，用户批准精确排除后实现flag与清单；80/80重复、3文件33/33、官方tsc/完整check923/0/changed lint0均已收齐，不减少其他门禁。
- 旧后台又被外部客户端拉起为PID7960，正确flag的prepare仍被生产活后台检查拒绝。再确认目标归属后，注册撤回与立即cold-copy组合任务 `sh_18b69448d001SmfEaCefEdV4hK`转后台；此处未收到结束通知，不重开任务/轮询或声称激活完成。
- 用户询问后台是否混用后，CIM及当前工具父进程证实当前宿主为OpenCode2.2.2 PID26524（ai.opencode.desktop），旧Renicode2.1.4 PID25384/7960在独立ai.renicode.desktop路径。未停止/迁移当前OpenCode，旧Renicode再次启动来源未证实。完整依据见升级验证最新段；继续保留旧程序/数据与独立代际边界。

### 2026-10-30 真实激活已通过

- 组合任务完成：旧Renicode7960自行shutdown/native exit0、无终止信号；生产cold-copy复制7759文件且全部SQLite/claim/哈希/停止门禁通过，仅排除已批准Bun下载缓存，原数据和缓存保留。第一轮ExitCode=null、链接拒绝与旧服务再次拉起失败历史保留。
- 明确启动独立launcher后实际健康晋升成功：**active A为2.2.0-renicode.1、previous B旧2.1.4、pending空，handoff117 healthy**。新desktop5588/guardian20592，新后台34168/127.0.0.1:37253；认证info200/PID版本一致、无认证session401、独立profile绑定和原drafts.sqlite哈希核验通过。
- 当前OpenCode聊天宿主仍2.2.2/PID26524，独立ai.opencode.desktop；Renicode在新generation，未共享后台或触及OpenCode数据。用户后来允许强关，但本次不需要且未使用。详见升级验证实际激活段。
- 额外在线SQLitereadonly检查受运行中锁阻塞，不算补充检查通过；冷复制生产数据库校验已通过，不绕过锁/停新应用。旧安装/slot/profile及安全失败历史保留；手动允许不记微软判定。无待收构建/测试/迁移任务，用户授权的新应用正常运行，未提交/推送；warning923与剩余完整计划验收继续待审，计划revision6仍active。

### 2026-10-30 接续warning第五批：locale键名推导

- 用户“继续处理警告”接续现有范围，未新增接口/架构、提交/推送或真实进程终止授权。37个UI locale字典去掉冗余open Record声明，翻译与fallback保持不变；37/37编译JavaScript和9349个entries完全一致。首次CRLF比较器失败与修正保留于warning验证。
- 完整check886warnings/0errors、11guide blocks/Turbo36/36（27cached、42.718秒）；fixed-upstream changed lint174文件0问题，UI/App官方tsc、全UI315/315、UI i18n重复240/240、App locale owner重复30/30通过。本批减少37、累计减少566，剩余886条仍待审，整体计划仍active。
- 同参数官方desktop-only/check/portable重建 `sh_18b7742ff001si2hMIDuJ86vKP`运行中，后续新包资源/安全/运行门禁后仅暂存兼容A/B更新；不在构建期间修改源码，不主动关闭/重启运行中Renicode/OpenCode，不操作profile或防护。此处未收齐构建、未新暂存/激活，不用此前923包证据冒称新包通过。详见 `docs/validation/renicode-warning-cleanup.md` 第五批。
- 用户随后“你可以主动关闭，我现在还没使用”允许本次更新主动正常关闭Renicode。候选门禁通过后可以安排兼容A/B激活；只操作已确认的Renicode桌面，不触碰OpenCode宿主，不以强制终止代替正常退出验证，不因本次更新重启后台或迁移profile。此操作许可不改变warning/type/安全验收范围，原revision6保持生效；确认记录见关联讨论。

### 第五批交付收齐与当前实际停止点

- 官方完整portable/check退出0，仍886warnings/0errors；metadata/ASAR/15项资源/正常扫描及guardian、packaged隔离运行通过，modelCalls0。第一次guardian因真实桌面未退出被门禁拒绝的历史保留；用户许可后正常关闭，后台未动。
- 首次B晋升后最终发现源EXE相对冻结候选仅57个ASAR内嵌hash字节变化，导致内嵌值与真实header不匹配；写入来源未证实，未关闭完整性或把源包一致性等同扫描前候选一致性。保留异常dist/首个B目录，不覆盖用户/未知工作。采用本轮已验证的冻结原构建、重验hash/header与正常扫描，通过正常兼容deploy先写新A，再写新B以清除登记fallback的异常引用；未删除任何历史目录或改生产逻辑。
- 最终active B=`slots/B/7e05e2ae-5169-4f59-b206-72f884ae4ffb`、previous A=`slots/A/ed38258a-a785-440f-99c2-71278e130ab9`、pending空、guardian30120、desktop24288 ready、handoff132 healthy。两个登记槽EXE均214dc…/asar22000…，内嵌与真实ASAR header匹配；最终7项hash等于原冻结构建，两实际槽正常全包扫描未检出。精确hash、首次失败及每次替换见warning验证第五批。
- 同一profile/后台PID34168/认证200及无认证401保持不变；正确A桌面正常exit0后由guardian切换B，没有强制終止、真实后台重启、profile迁移、防护变更、样本恢复/上传、提交/推送。本批所有构建/测试/扫描/部署任务结束，当前运行的Renicode保留。
- 计划revision6仍active；下一步继续886条真正owner边界审查，并保留EXE内嵌hash写入来源的未解决调查项，不复用异常dist或称根因已修复。不把第五批实际激活当整个warning/对齐验收完成。

### 后续执行节奏：清理完再统一打包

- 用户提出“不能一次清理完再打包吗”，后续按全部剩余warning清理完成后统一打包/A-B交付执行，不再每个小批次重复打包或关闭桌面。当前已激活版本保留不动；实施仍逐模块审查，每批保留针对性lint/官方类型检查/必要回归与实际记录，不机械去断言、放宽输入或关闭规则。
- 全部清理结束后一次性收齐完整check、changed lint、相关回归，再统一构建、内嵌ASAR/header及冻结候选hash核验、安全扫描、隔离运行和A/B交付；不能用新节奏取消这些门禁。遇到必须改变较大接口/架构或既有行为的问题仍先确认，不为“全部完成”静默扩展。
- 这是既有范围内的打包执行节奏调整，不缩减warning与交付验收，revision6保持生效。EXE资源写入来源仍待查，最终构建不得直接复用异常dist。

### revision7接续：合理边界保留与第六批实际结果

- 用户明确拒绝局部规则例外并选择保留合理通用解析边界诊断；确认原意见关联讨论。本计划升revision7，只调整warning验收为全数处理或有依据保留，不取消其他范围/门禁，不把剩余条目自动当合理。
- 第六批V2主题/scroll及route测试owner/fileManager/voice/tooltip整理后，完整check**857warnings/0errors、11guide blocks/Turbo36/36**，独立JSON诊断857/857。相对886减少29；360组V2 token/CSS等价、UI315/315及V2重复90/90、App定向重复120/120和voice140/140、UI/App官方tsc通过。类型-only两生产文件编译JavaScript一致；首次spacing/4条open Record未收敛诊断保留于warning验证。
- fixed-upstream changed lint188文件/1诊断，唯一VoiceCall catch边界经审查有依据保留，不称0问题；drafts48条合理保留、2条IndexedDB读取断言待证据。正式清单见 `docs/validation/renicode-warning-retained.md`。当前49条有依据保留、其余808条未完成处理/审查。
- 原App完整unit904项902pass/2fail；单独两文件10次复核仍48pass/2fail，locale与plugin首次冷加载超时继续阻塞完整unit验收，未扩大期限/放宽断言/删除用例。具体日志/限制见warning验证第六批。
- 本轮全部命令结束，没有打包/暂存/激活或真实进程/profile/防护操作，没有提交/推送。当前运行版本保留；下一步继续真正owner审查与实际冷加载失败定位，不以此局部结果提前执行统一打包，异常dist不复用。

### 2026-11-02 revision8/9接续：冷加载与formatter边界

- 用户批准仅两项真实模块冷加载测试的30秒单项期限；原5秒失败902/2和48/2保留。重复两文件50/50、原全部断言保持，不声称优化了冷加载。健康fetch夹具按实际preconnect能力构造，scope/cache/请求观测采用真正owner契约，生产生命周期算法不改。
- formatter先去索引断言后完整App904/904通过，但仍复现畸形data导致TypeError；用户另行批准最小完整字段解析后实施。五项新增断言在冻结旧HEAD13pass/5fail，新owner180/180重复通过；合法文案及Protocol/HttpApi/持久化契约不变，不需Client生成。详细失败、边界和授权见讨论/第七批warning验证。
- 最终完整App**909/909**、browser**235/235**、UI**315/315**、App/UI官方tsc与App e2e官方typecheck通过。TextReveal81组合法输入条件及除已审条件外编译JS一致，不宣称所有真实动画渲染已验收。
- 最新完整check**806warnings/0errors、11guide blocks、Turbo36/36**，原生JSON806/806；相对857减少51，累计减少646。fixed-upstream changed lint实际退出1、197文件中3文件19条，恰为已审formatter10/TextReveal8/voice1，不称0。
- 合理清单更新为**90条已审保留、716条未完成处理/审查**，包含精确快照hash与全部未审项，不能自动归类后续warning。全部命令结束，无待收结果；未打包/A-B暂存/激活、提交/推送或真实进程/profile/防护操作。计划revision9保持active，继续716项，全部收敛后再统一构建交付；异常dist及EXE写入来源调查保留。

### 2026-11-02 全量并行清理授权

- 用户要求尽快处理并打包，经路径分组716项/186文件后明确选择“三路并行全量（推荐）”，允许三个子代理在互不重叠文件范围处理；主助手负责已有改动保护、生产benchmark门禁、必要审批、最终统一检查/打包/扫描/隔离运行及A/B暂存。
- 分工：App生产文件（排除tests/stories/fixtures）；其余包生产文件（同样排除tests/stories/fixtures）；全部测试/E2E/Storybook/fixtures与脚本工具文件。每份诊断的修正或保留依据必须回交，不自动将未审项算合理；子代理不编辑主流程文档、不修改规则/豁免或操作真实进程/profile/防护。
- 此次仅改变已批准范围内执行方式，revision9生效范围与全数处理后统一交付保持。不选择先发生产修复/延期378项，不新增提交推送或主动关闭许可。

- 接续实际结果：App原104项全部已分类（37修正/67保留/0阻塞），另有2处真实helper parser检查保留，scoped lint69/0。ModelsProvider泛型仅追加一处type-only依赖修正，合法directory调用保留、完整编译JS4483bytes/hash一致，App官方tsc通过。主助手对104identity/39sourcehash独立复核成功，原23变化中17运行AST一致、6处已审运行差异；组件和测试组仍在进行，最终全集清单/check/GUI/after基线与一次打包/A-B交付尚未收齐，不能据此称全部完成。精确证据见warning验证第八批最新段。
- 组件组随后交付原234项（95修正/139保留/0阻塞）及9新增真实边界，scoped lint148/0，四包官方tsc通过、owner90/90。主助手独立核对234identity/52hash及32个代码变化（20运行AST相同/12真实运行变化），主题/窗口合法兼容与updater求值顺序探针证据保留。两生产组338原项已审，测试工具378仍在执行；当前不声称全仓最终警告数、最终打包/A-B已经完成，门禁和一次性交付范围保持。
- 报告工具40028字符命令卡住后，经用户要求检查，主助手只中断/恢复task-owned子会话，测试组最终交回378项（244修正/134保留/2新增边界）。全806原项与current443native诊断精确对账，186sourcehash相符、未审/未匹配0；正式保留清单revision3，全仓canonical443/0与36/36、官方tsc35/35及App909/browser235/UI315/SessionUI317/GUI255+1既有WSLskip均实际通过。测试组报告已完成，非仍待无期限通知。
- 验收实际阻塞另记而不掩盖：Desktop初始环境/cleanup失败，后复用既有Core tmpdir disposal只修原BetaNotes测试fixture，owner10次460/460通过；组件GUI因服务器重启打断，仅补末尾115/115通过，首轮Composer失败历史保留。App9个keepers187/188，Settings短query完整文字断言旧/新同失败，仍须定位/最小收口，不归为合理warning；afterfixture已完成，after7场景开始串行采集，新desktop包/安全/隔离/A-B仍未执行。未重复已完成检查/单位suite、不放宽断言/期限或关闭用户程序。

### 2026-11-03 revision12：2.2.5隔离整合（进行中）

- 官网稳定标签固定为 `9bbb8ce18c80f099e0e448775f59d965ead40a21`。原两工作树260个changed/untracked文件已保存逐字节SHA256副本、status、binary patch及manifest到 `Temp/opencode/renicode-sync-225-input-20261103`。新隔离 `PG/renicode-sync` / `sync-renicode` 从原align HEAD承接，保护输入tree `0ed62130dc39c572f7d8cb5a13fbf8882fafa6ce`；原源码工作树未修改，主流程文档仍只在本路径维护。
- 完整上游delta1595文件已三方应用。首轮因3个本地有差异的上游删除文件失败，未写入；第二轮显式排除这些删除后写入43个冲突。仅对冲突三方CRLF归一LF，剩31文件手工整合。无unmerged/冲突标记，首次cached whitespace check通过。保留品牌、项目中心/导航、固定详情按钮、旧坏输入回归及清理，版本默认为 `2.2.5-renicode.1`。这不是Git merge commit：HEAD仍为原align HEAD，未新增提交/推送。
- `bun install --frozen-lockfile`实际完成1777包/76.65s；仅命令环境跳过Electron下载，复用已完整核验的44.9.1发行。Protocol/HttpApi已变，从新工作树 `packages/client` 的 `bun run generate`已实际成功，不手改生成客户端。
- 初始canonical check因本机Node22.16不自动strip `.ts`插件而未启动lint；仅命令环境加 `NODE_OPTIONS=--experimental-strip-types`后实际350warnings/1error，错误为合并残留的重复statusLabel，已作最小修正。App初始Bun typecheck7错/4文件，删除未用Project import、重复旧函数、移除已废弃pty fixture字段；随后官方tsc定位2处fixture缺media，已补unexpected边界。首轮失败保留，不称最终已通过。
- 窗口恢复owner10pass/0fail（26assertions），新终端connection/model/writer owner23pass/0fail（59assertions）。App完整unit/browser、修后canonical check仍在后台，结果待实际完成通知，不将旧909/235等作为新版验收。
- 新增5项后台迁移（schedule、session_part、session_time_busy、schedule_checks、job），job从KV导入后删除 `job.background/%`。交付需要独立profile代际，不能桌面-only或直接操作实时数据。3个排除删除文件（旧SerializeAddon test及terminal benchmark/probe）暂保留但已无生产serialize owner；须核对新版persistent PTY快照/重放契约与性能门禁再收口，不靠删测试放行。
- 尚未新包构建、安全扫描、隔离运行、A/B暂存/激活、迁移真实数据或关闭/重启真实程序。原未完Settings/组件GUI/生产benchmark门禁仍保留；新增350条诊断须实际复核，不自动算合理。
- 后续实际结果见 `docs/validation/renicode-sync-225.md`：承接已审旧终端孤立文件删除后，canonical **349/0、11guide blocks、36/36（25cached）**通过；App官方tsc通过、unit958/0、browser303/0、UI318/0、SessionUI325/0、GUI271/1既有skip/0。database migration22/0；外部派生job丢失导入2fail、终端丢弃checkpoint1fail证明回归会失败，未mutation生产源码。原350并非全部新增/合理，仅初始快照；最新349 native诊断/105hash冻结后仍须逐项复核。App host timeout历史保留，只补browser不改单项期限。Core owner30/1因上游sleep fixture缺PATH，Desktop及全仓官方tsc仍待收。旧可见/隐藏/大scrollback性能门槛仍未完成，不因删除旧架构源码取消；未新包/暂存/激活。
- 已收全仓官方tsc **35/35、0cached**、Desktop **274/0**；Core仅失败case补既有Git sleep命令PATH **1/0**。349逐项与旧清单完整identity+源hash核对 **314精确匹配/35需审**。六文件生产keeper首轮尚未进入用例：配置webServer覆盖build+serve的120秒耗尽，退出1，保留启动失败日志；改用既有独立production build+隔离静态服务器模式，不改测试断言/期限/重试。独立build待通知，正式GUI/性能、安全交付门禁仍未完成。
- 35项复核收口为9 spacing修正/26边界逐项重审，当前native **340/0、101hash**，accounting314完整精确承接/26重审。复核发现window文件入口严格Struct漏保留旧单flag恢复；同一owner补真实读文件链，修前7/3（首轮tmpdir冲突6/4另保留），只将StateFile改JSON对象record，修后10次100/0、Desktop官方tsc成功。修后完整Desktop/canonical待收，旧274/0不作为修后suite证据。四个其余spacing文件非空白/生成JS完全相等。production fixture build49.27s/2820PWA entries成功，六keeper在隔离4310静态服务器已进入运行、2workers/0retries结果待收。Protocol完整10/0、Client完整待收；原性能/代际/安全/打包暂存仍未完成。
- 修后canonical **340/0、11guide blocks、36/36（32cached）**、完整Desktop **274/0、1050assertions**收齐，diff whitespace成功。Client完整实际 **252pass/4skip/1fail/1error**：隔离promise-service contender恢复case触发既有3秒内部promiseTimeout，pending另有未处理rejection；真实失败阻塞交付，局部10次复现待收，不延长/跳过/改产品来掩盖。六文件production keeper仍待通知；原性能、完整后台/代际隔离、component/剩余keeper、统一构建/安全/A-B暂存未完成。未碰真实服务/profile、防护、活动槽位或提交推送。
- 六production keeper收齐 **162/2**：Settings原门槛本次通过；Review fit末尾x差1/64px、窄屏Terminal rename输入存在但失焦，两项artifact保留、尚未修复。Client局部10次 **5/5**；外部细分诊断证实环境读取0–1ms、失败轮3次原生spawn各约0.83–0.90秒、第三次结束3208/3289ms超内部3000ms，终止挂起fixture仅2–4ms。拟仅恢复case内部10秒/Bun15秒、全部断言与其他case/产品预算不变，待用户确认，未实施期限变更。全部测试/诊断已结束，无待收命令；只有任务隔离静态服务器仍运行。尚未统一打包/安全/A-B，不关闭真实程序。
