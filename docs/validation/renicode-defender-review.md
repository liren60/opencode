# Renicode 2.2：Defender 复核材料与交付门禁

<!-- wiki: {"kind":"validation","workflow":"completed","revision":1,"change":"none","relations":["docs/plans/renicode-upstream-align.md","docs/validation/renicode-align-upgrade.md"]} -->

日期：2026-10-30。本记录是本地只读核验与复核材料，不是安全放行、厂商误报判定或部署成功。

## 本轮范围与实际结果

- 用户要求继续既有对齐计划，仍沿用 revision 4；没有新的样本恢复、对外发送、排除项或实时数据操作授权。
- 读取两工作树实际 Git 状态，保留此前 warning/退出修复及文档改动；没有覆盖、提交或推送。
- Defender engine 为 `1.1.26100.4`，情报为 `1.463.30.0`；杀毒、实时防护与行为监控均开启。没有修改防护配置或重建已被隔离的同样本。
- `Get-MpThreatDetection` 核对本次两条检测，均为 ThreatID `2147765393`、`Trojan:Win32/Cinjo.O!cl`，处置成功；检测ID分别为 `{8CA26CD1-0799-47B4-8A01-ED2647AE7611}` / `{2FB0AB41-84BA-49A8-A606-434916CCE8DD}`。
- 首轮事件 Message 输出受本机编码影响；随后读取事件 XML 的命名字段，避免根据乱码翻译推断。事件1116 record17425于 `2026-10-30T10:08:16+08:00` 记录读取进程 `CGEData.exe`（企业 DLP）；record17428于 `10:08:45+08:00` 记录部署用 `bun.exe`。事件1117 record17440/17442于 `10:09:18+08:00` 记录隔离、Error Code `0x00000000`。两个读取进程不是被检测的文件；不能据此归因于DLP或认定误报。
- `Get-MpThreat` 还显示旧版CLI的 `Trojan:Win32/Filery.I!cl` / ThreatID `2147764730` 为 `IsActive=true`。其检测明细是此前旧版CLI及临时文件的历史记录，不能直接证明当前文件存在或当前进程恶意。本轮未读取/运行/恢复旧CLI或改变其处置；建议企业IT一并复核该状态。
- 只读SQLite核对真实A/B：active B、previous A、pending与guardian为空；A/B仍为 `2.1.4-renicode.1`，最新handoff为107 / launcher-error。核验脚本位于获准Temp，使用 `bun:sqlite` 的 readonly 模式，不调用会初始化表/设置WAL的生产store。首轮PowerShell传递 `bun -e` 丢失引号而语法失败，未打开数据库；改独立脚本后成功。

## 构建来源与候选标识

已读取 `script/build-renicode.ts`、`packages/desktop/electron-builder.config.ts` 与当前依赖 `app-builder-lib/out/electron/electronWin.js`：portable使用固定Electron发行目录、检查版本/必要资源，并保留ASAR完整性写入。`signAndEditExecutable=false` 不会阻止 `addWinAsarIntegrity` 写入 `INTEGRITY/ELECTRONASAR` 资源，因此最终EXE不能声称等于官方stock EXE。这是源码核验，不是完整供应链审计或最终EXE反汇编审计。

候选哈希再次从此前成功的合成guardian `candidate.json` 完整读取；没有恢复或复制当前被隔离EXE：

| 文件 | SHA256 |
| --- | --- |
| Renicode.exe | `b9aef48e35b0a488b519cd76f86017c7e2a2d74b7d52bc8044d8dd66e68212ad` |
| resources/app.asar | `c9b34542040a011c8d4bfdf469736ec67eaee1c64c63eb2882338dde0937e713` |
| resources/opencode-cli.exe | `2db8aa7025773c35e983df0399c11b790f28b1a9e3699491e3af3f5ed688c6e1` |

此前官方Electron44.9.1 ZIP哈希匹配、73文件来源审计、第三版运行与资源回归的实际证据见升级验证；本轮没有重复宣称或重跑它们。第三版正常退出已通过与此次安全软件拒绝暂存是不同门禁。

## 可供IT审阅的英文摘要（尚未发送）

> Please review a recurring Microsoft Defender Antivirus detection blocking a local development build of Renicode 2.2.0-renicode.1, an OpenCode customization based on a fixed upstream snapshot. Detection: Trojan:Win32/Cinjo.O!cl, Threat ID 2147765393. Intelligence: 1.463.30.0; engine: 1.1.26100.4. Real-time, antivirus and behavior protection remain enabled. The detected file is Renicode.exe (SHA256 b9aef48e35b0a488b519cd76f86017c7e2a2d74b7d52bc8044d8dd66e68212ad). Detection occurred on 2026-10-30 at 10:08:16 and 10:08:45 UTC+08; quarantine succeeded at 10:09:18. The reading processes were the corporate DLP reader and the local Bun deployment tool, not the detected executable. A preceding custom scan reported no threats, but this does not override the later real-time detections. The build uses Electron 44.9.1 from a SHA256-verified distribution. Electron-builder embeds ASAR integrity resources, so the final EXE differs from stock Electron. Isolated startup, history/attachment, authentication, launcher promotion/rollback and native shutdown checks passed before detection; these are functional tests, not proof of safety. Actual A/B staging failed and the installed 2.1.4 slots remain unchanged. No quarantined sample has been restored, uploaded, excluded or redeployed. Please advise an approved vendor-review/sample-handling route. A separate historical old-CLI Filery.I!cl active-summary record also needs review; its present file state is not established by this report.

此摘要不含用户名、绝对本机路径、凭据、聊天正文或profile附件。对外发送仍需用户/企业IT批准；不把材料已准备视为已提交工单。

## 厂商入口与下一步

- 历史提交补核（用户提醒后找到获准Temp记录）：`Temp/opencode/renicode-defender-review-20261026/submissions.md`记录10月26日已经成功提交两份样本，桌面ID `f6dbaa63-c469-4d3e-b90b-ff4b96788345`、旧CLI ID `c3e21cc6-9db4-45c8-a810-e40d3a548816`，当时均为Submitted，未观察到分析结论。桌面为2.1.4-renicode.2、EXE哈希 `dfba63bbb48bdab0a66efddca7ebc6780b10e47540e61997690277da63196e47`；CLI为2.1.4-renicode.1、哈希 `701465411a501af61c992da47b82e324fceec3bda085af698c2d507f20e57386`。当前2.2候选不是同一哈希，不能自动沿用旧样本判定；本轮“未上传”只适用于新候选，不代表从未提交过。后续优先查询既有工单当前结果，再决定补充新候选，不重复从零申诉。本轮未访问登录态工单页，当前状态未知。
- 上传限制补核：公开入口显示50MB，但上述实际登录的软件开发者提交记录显示允许500MB；不能把匿名页面的50MB说成所有账户的固定上限。以用户实际登录渠道为准，未借此上传新文件。
- 已只读核对微软官方入口：<https://www.microsoft.com/en-us/wdsi/filesubmission>。支持Software developer/Enterprise customer、误检申诉和跟踪结果；页面要求选择实际文件，显示单文件上限50MB与英文说明字段。当前只有元数据，不声称已经提交或仅凭hash即可获得判定。最初尝试的Learn submission-guide地址404，未用该地址作为操作依据。
- 推荐先由企业IT确认复核与样本处理渠道。若选择微软提交，账户/验证码由用户处理；上传内容及获取样本方式须单独明确，不默认恢复隔离样本或改路径复制同一文件。
- 厂商未放行前，不重复部署此候选，不关闭ASAR完整性/防护，不用签名伪装或排除解决检测。剩余942条warning可在现有授权内独立继续，但不能替代安全门禁。
- 本轮未修改应用源码、构建新包、暂存/激活、迁移实时profile或关闭真实进程；本轮命令已结束，无待收任务。主计划仍active，不将本记录completed解释为计划完成。

## 用户手动安全处置后的暂存前核验（2026-10-30）

- 用户表示已经在安全中心允许，以后允许/恢复由用户手动处理；随后要求开始此前说明的核验与仅程序暂存。该授权不表示微软误报判定，不授权AI恢复样本、添加排除、改防护、迁移实时profile或启动新版。
- 实际读取源包 `packages/desktop/dist-renicode/win-unpacked/Renicode.exe`仍报不存在，无法取得EXE哈希。app.asar与CLI完整SHA256分别为 `c9b34542040a011c8d4bfdf469736ec67eaee1c64c63eb2882338dde0937e713` / `2db8aa7025773c35e983df0399c11b790f28b1a9e3699491e3af3f5ed688c6e1`，与第三版已验证候选一致；这两项不替代缺失EXE的核验。
- 最新两条Cinjo检测明细仍为ThreatStatusID3、原处置时间；较旧检测的状态已有变化。不能确定用户允许了哪条或是否执行文件恢复，只记录当前目标路径仍缺失，不将汇总IsActive=false当文件恢复证明。
- readonly SQLite再次确认active B/previous A、两槽2.1.4、pending/guardian空、handoff107。源包缺EXE时没有调用必然失败的部署脚本、重建同样本或从其他路径复制替代文件，也没有生成新launcher/修改快捷方式。
- 当前停止点是等待用户手动使正确候选文件恢复到原路径后再核验。当前源码已含923warning批次，而现有包是此前942批次；未把旧包说成包含最新主题修正。新构建需重新记录候选及相应验证，不能用旧哈希/旧运行证据代替。
- 本次命令均结束，未暂存/激活、未操作实时数据或真实进程，未恢复/上传样本、修改防护或提交/推送。

## 用户观察下重建的明确授权

用户随后要求“你再生成一个，我看着”，批准重新构建最新desktop；此前不自行恢复/重建的停止点保留为历史。执行既有官方build/check/portable命令，固定完整Electron发行目录、ASAR完整性及现有打包参数，复用已核验且本轮源码未变的第三版CLI。任务 `sh_18b1e4fd1001q4rAn2pMitD4eW`、日志 `Temp/opencode/renicode-user-watched-rebuild-20261030.log`，本条记录时待结果。安全允许/恢复仍由用户手动处理；不授权AI更改防护、恢复/上传样本、添加排除或自动激活。完成后记录新候选hash/资源与实际检测，不宣称旧微软提交结论或旧运行验证自动覆盖新包。

- 首次构建任务实际300000ms timeout，不能称完整打包成功。日志已证实check923warnings/0errors、11guide blocks/Turbo36/36通过，main/preload/renderer分别构建成功；停在electron-builder依赖树遍历/打包，最终EXE尚不存在。构建CSS另外6条优化警告保留，不混入oxlint923计数。
- timeout后CIM筛查未发现残留build-renicode/electron-vite/electron-builder进程；没有结束用户进程或重复全构建。App公共链接输入diff仍仅原有oc-theme-preload改动，无新materialized路径差异。
- 只重跑现有electron-builder portable打包，保持同一RENICODE_BUILD/channel/version/CLI与完整Electron发行目录及ASAR参数，任务 `sh_18b23681c001ugvF2W7IYsjAg4`、1200000ms上限，日志 `Temp/opencode/renicode-user-watched-packaging-20261030.log`。本条记录时待结果，未运行包或部署；首轮timeout历史不覆盖。

- 首轮直接PowerShell打包实际退出1，未进入打包：未加引号的 `-c.win.signAndEditExecutable=false`被PowerShell拆为配置文件参数，报尝试读取 `.win.signAndEditExecutable=false` 的ENOENT。这不是新Defender阻断；检测记录仍为此前两条、目标EXE未生成。仅修命令参数的引号后以同值重跑，任务 `sh_18b241259001vdk2VkKezq41uH`，日志 `Temp/opencode/renicode-user-watched-packaging-quoted-20261030.log`，20分钟上限。此处待结果，不修改源码/打包策略或防护，不将命令修正称产物通过。

## 最新交付状态

quoted新包最终成功，新EXE hash为 `681f2694f515a9ff15603cafde13c1fb1c7682bf9f9169a51f03baad4426a063`；资源、正常扫描、隔离真实运行通过后generation程序暂存成功。随后用户明确授权真实激活/协助停止旧后台并批准精确Bun下载缓存排除；旧后台经现有注册监控自行exit0，生产冷复制7759文件与全部SQLite/claim/hash门禁通过。实际active A=2.2.0-renicode.1、previous B=旧2.1.4、pending空、handoff117 healthy，认证健康和独立profile/后台归属通过。没有AI恢复样本、添加排除、变更防护、强制关闭真实进程或上传新样本；手动允许不记作微软误报结论。细节与失败历史/补充在线SQLite锁限制见 `renicode-align-upgrade.md` 最新实际激活段。本轮所有构建/检查任务结束，用户授权的应用运行保留。
