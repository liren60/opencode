# Renicode 2.2：隔离后台升级验证

<!-- wiki: {"kind":"validation","workflow":"completed","revision":1,"change":"none","relations":["docs/plans/renicode-upstream-align.md","docs/discussions/renicode-upgrade-recovery.md","docs/validation/renicode-align-resume.md"]} -->

日期：2026-10-29。此报告已完成记录，不是整个对齐计划验收通过。

后续提交授权：2026-10-29 用户明确要求全部提交、推送到自有仓库；此前正文中的“未提交/推送”保留为当次验证的历史停止点。源码归档不代表实际 A/B 部署、profile 迁移或最终验收完成。新增 dev 渠道 updater guard 尚需最终包重建与运行验证，packaged smoke 最终结果本轮尚未核实。

提交前检查：新版完整check1452warnings/0errors、11guide blocks、Turbo36/36；fixed-upstream changed lint85文件/0问题、GUI官方tsc通过。旧版首轮check因registry keeper scope类型失败，仅改用已有 `ServerScope.local`后check1281warnings/0errors、15guide blocks、Turbo35/35及App官方tsc通过。旧版registry重复10次40pass/20fail，新增Windows等价路径关闭契约仍未实现；按全部提交授权归档现状，不称该回归通过。两个暂存差异的高置信度凭据模式扫描均0命中，此有限扫描不是完整安全审计。

提交与远程核对：旧版 `66b40ea2349df9eea23a8ff4c103f07cdb6f9a2a`、新版双父合并 `2ce0d3d9a53c4c5a93bcde1b0fdc23f9e3c76520` 已原子推送到自有origin对应 `renicode` / `align-renicode`，ls-remote一致、当时两工作树clean。首次hook因Node的TS插件加载失败，三轮后续在Turbo Git status查询timeout（300/600/180秒）；仅清理已识别检查进程。Bun node shim及命令专用Husky init移除继承Git定位变量后，未修改/跳过原钩子，最终 `sh_185a8e1a1001aaphU6EuBdiSvh` 完整check1452warnings/0errors、11guide blocks、36/36、0cached、2m25.236s，push退出0。不是部署、激活或实时profile升级证据。

## 环境与范围

- 实施工作树仍为 `C:/Users/reni.li/Downloads/PG/opencode-align`，固定上游 `86ce19d96eccbfb95af3ff3189c7071575f94339`，未提交合并；原工作区用户工作未覆盖。
- 使用原安装 resources 中真正旧 CLI `2.1.4-renicode.1` 和隔离工作树构建的新 CLI `2.2.0-renicode.1`。没有运行原安装桌面或旧 A/B guardian，没有调用服务自动发现。
- 外部验证脚本：`%LOCALAPPDATA%/Temp/opencode/renicode-align-upgrade-e2e.ts`。每个子进程以 `serve --stdio --hostname 127.0.0.1 --port 0`启动；XDG 四目录、配置、测试 HOME、数据库和 cwd 均明确指向合成 profile，移除继承的 OpenCode/Renicode overrides，禁用项目/Claude 配置及模型目录抓取。
- 只使用合成会话和 `resume:false`、`delivery:queue` 的待消费输入，不调用模型，不使用真实 Midea 凭据，不读/复制真实 profile。每个子进程关闭 stdin 后正常退出 0。

## 实际结果

命令：Bun 1.4.4 从隔离 `packages/cli`运行上述脚本，退出 0。资产目录 `%LOCALAPPDATA%/Temp/opencode/renicode-align-upgrade-1793239534285/`，含 `report.json`、各阶段日志和合成 profile/backup/restored。

| 阶段 | 结果与边界 |
| --- | --- |
| 旧版 seed | 创建普通与归档会话、1 个未消费输入；active 为空。PID 34980，独立随机端口，正常退出 0。 |
| 停止后备份 | 旧子进程退出后复制完整合成 profile 到未存在的 backup，不覆盖原数据。 |
| 新版 upgrade | 会话 export 与 inbox 全对象逐值一致、归档 ID 保留、active 为空；可改标题和新建会话。PID 22316，正常退出 0。export 的消息数组为空，本次不证明非空历史/媒体升级。 |
| 新版 restart | 已更新标题与未消费输入保持。PID 32224，正常退出 0。 |
| SQLite | 升级前/后 backend journal 均 54 项且一致；integrity_check=ok、foreign_key_check 无结果。本合成库没有新增 backend schema migration，不把它当真实数据库普遍兼容保证。 |
| 旧版 restored | 从 backup 复制到新的 restored 目录；旧版 export/inbox 与停止点一致，标题 UPDATE 后再 GET 成功。PID 32848，正常退出 0。原升级后的合成 profile 保留。 |

## 新发现与剩余门禁

- 桌面隔离启动现有 `OPENCODE_DESKTOP_TEST_ROOT` 入口与 Renicode 偏好环境存在重写交叉，且 Renicode 后台启动固定 29123；不能直接运行新版 packaged EXE 冒险碰撞实时后台。尚未修改此实现，也未声称完整桌面进程验收通过。
- App `bun run typecheck:e2e` 本轮实际重跑仍退出 1，同 11 条此前记录的其他文件诊断。没有关闭类型规则或用断言压过错误。
- 桌面数据库不兼容旧写入的历史失败仍有效，未绕过 launcher 同字节/指纹检查。
- 具体升级/备份/回退方案见关联讨论，仍待确认。未运行有写入副作用的 `deploy-renicode.ts --check`，未 A/B 暂存/激活，未关闭或重启用户桌面/后台。

## 2026-10-29 已确认代际实现与后续验证

上述“待确认”“尚未修改”是初次验证停止点；用户随后选择版本化 profile，主计划 revision 2 已生效。生产实现新增冷复制 `prepareGeneration`、launcher `stage-generation` / `prepare-generation`、独立 `slot_profile` 与 `RENICODE_PROFILE_DIR` 绑定、prepared-generation 启动保护及 `deploy --generation` 仅程序暂存。未迁移实际 profile。

- 第二次真正旧/新 CLI 验证退出 0，资产 `renicode-align-upgrade-1793240629460/`：除首轮对象/inbox/归档/重启/恢复写入外，新增 1 条非空用户历史及 `synthetic.txt` inline 附件，全 export 逐值比较通过。两版后台 journal 54 项一致、完整性/外键通过、所有子进程正常退出 0、模型调用 0。不证明真实 Midea 凭据或任意媒体迁移。
- 冷复制拒绝活 lease、恢复 claim、已有目标、损坏库和链接；哈希验证源与副本，移除目标 lease、过滤目标旧路径 overrides，源不改。首轮正向因已创建 temp 与 cp 的 EEXIST 失败，改为逐个根 entry 复制后通过。Desktop 四文件 31/31，重复 10 次 310/310，官方 `typecheck:tsc` 通过。
- 该实现后的全仓 check：1461 warnings、0 errors、11 guide blocks、Turbo36/36；固定上游 changed lint77文件/0问题。Desktop main/preload/renderer 构建通过。
- 首次整体 portable 命令300秒timeout；独立 electron-builder 重打包 `sh_18577878a001TTEIShJqZubVOY` 退出0，asar metadata/版本/标题/main/preload与三资源一致性审计通过，**不能视为运行验收通过**。
- 外部桌面 smoke 首次在 Playwright import 处失败（无子进程）；改从 App 解析依赖后 `sh_1857c7f22001aq2FZ2g3O39q9c` 失败：Electron exit3，ICU资源缺失。合成后端正常退出0、源 drafts字节未变，报告 `renicode-generation-desktop-1793240894749/report.json`。发现原临时 Electron dist 缺 `icudtl.dat` / pak / snapshot / version，原下载 zip 不完整；完整 mirror zip SHA256 为官方本地 SHASUMS 的 `41bd7900bd42d0f49110a81617876137041fbbf473466920248ddb076349ef91`，已重新解压到新的 `dist-complete`，不覆盖原失败资产。构建入口增加发行目录必需资源与 pinned version 门禁。
- App e2e 11条类型错误已修复：模型默认形状与消息schema更新、去除未用变量、Event类型收窄、保留原调用参数的Reflect forwarding。`sh_1857d18d2001tKj7y25AGHhkV0` 官方 `typecheck:e2e`退出0；未放宽断言或关闭规则。受影响五个keeper完整运行尚待结果。
- 正在运行：完整发行目录的桌面smoke `sh_18582b3e8001h6coIF7IdLtAJz`、重打包 `sh_18582b434001vgLiYlWtcBXuKz`、五文件e2e `sh_18582b68a001LqTFxWv7d3EWh0`。没有提前宣称通过。

实时桌面/后台未关闭或重启，原 profile 未读取正文、复制或迁移，未暂存/激活 A/B、未提交/推送。实际升级仍等待正常退出窗口；完整桌面/launcher运行证据及最终安全交付尚未完成。

### 隔离桌面实际通过与检查重跑

- 完整发行目录首次 smoke `sh_18582b3e8001h6coIF7IdLtAJz`、下一次 `sh_18584e15a0014oafMxi3r4alfB` 均因夹具错误地要求默认横向布局出现 vertical-tabs 标记而失败；截图与 body 已证明 Home 和合成会话实际呈现，但不能把这两次声明通过。改为观察真实历史标题、打开会话并验证用户文本和附件，没有修改生产布局/断言目标行为。
- 最终 `sh_185866c76001ZTeEYF8RN1NHqY` 退出0，`renicode-generation-desktop-1793241542594/report.json`、`desktop.png`：生产 `prepareGeneration`复制真正旧CLI合成库与旧桌面migration库；真实Electron main/preload/renderer在独立generation运行，userData绑定一致，Home可打开非空历史、用户文字和synthetic.txt可见；draft document与plugin disabled状态保留，extension为只读view，integrity/foreign_key通过。认证info验证版本/PID，未认证session请求401；显式预启动合成stdio后端被桌面采用，PID35820/端口35873，关闭测试桌面后后端stdin正常关闭/exit0，源drafts字节未变。**这是非packaged桌面+预启动后台验证，不证明packaged CLI staging、后台自启动或guardian健康晋升**；其余链路待补。
- 五文件e2e首轮 `sh_18582b68a001LqTFxWv7d3EWh0`为121fail，均旧4341静态服务已离线导致ERR_CONNECTION_REFUSED，未进入行为验证。新4342服务使用已通过PWA审计的最终keyed生产fixture，首请求HTTP200后重新启动五文件121项 `sh_185875409001GXo1DV1Gh4MmOT`，0retries/5workers/fullyParallel，尚待结果。
- 新增benchmark文件进入changed lint后，发现13项（其中Reflect forwarding两项为本轮新增，其余为既有整文件问题），首次完整check1463warnings/2errors未通过。改成typed canvas各重载调用、JSON.parse reviver直接调用，submitted使用Schema.JsonObject，补已有assertion的明确来源注释及Match/空行；官方typecheck:e2e再次退出0。最新changed lint与全仓check待收，不拿之前通过覆盖最新失败。
- 不完整Electron发行目录的构建门禁负向实际退出1，明确报`Incomplete Electron distribution: icudtl.dat`，在build/pack前拒绝。完整dist重打包仍待结果；外部包审计已扩展为15项Electron资源与完整发行目录逐字节比较，不能只检查asar。

### 完整资源打包、e2e与launcher边界收齐

- `sh_18582b434001vgLiYlWtcBXuKz` 完整dist打包退出0；随后扩展包审计退出0：metadata/版本/标题/main/preload、三份CLI/storage资源一致，以及15项Electron ICU/pak/snapshot/DLL/version资源全部与完整发行目录逐字节相同。产物尚未暂存到实际A/B；packaged真实启动 `sh_1858b6ce6001NN1zl7EIDGW1gS`正在运行，不能提前宣布运行通过。
- 五文件keeper `sh_185875409001GXo1DV1Gh4MmOT`121/121 pass（1.4分钟、4342、Chromium、5workers、fullyParallel、0retries）。最新完整check `sh_185881247001ndNTBwUPhuTK0H`1452warnings/0errors、11guide blocks、Turbo36/36通过；changed lint84文件/0问题。warnings数量变化来自本轮benchmark旧问题清理，不声称全仓无警告。
- Composer benchmark首次`sh_185884069001Qhz3aLNM0SiWMz`为1pass/3fail：旧观察器把新版外置text blob引用当字符串，输出`[object Object]`；真实editor断言已通过。修正仅观察器，读取同事务committed document/blob，缺失blob直接失败，不放宽原完整文字/光标/提交/清理断言。修正后`sh_1858b6d0a0010DIQp778K781Li`4/4通过（11.7秒），官方typecheck:e2e退出0，changed lint84文件/0问题。新观察成本和当时并行负载不同，不与旧性能耗时直接比较，不宣称性能趋势。
- 真实旧/新程序包的隔离launcher验证`sh_1858c3360001CgHQ2DiJhR1Rne`退出0，资产`renicode-generation-launcher-1793241920944/report.json`：CLI init/stage-generation暂存到外部合成root，active仍A/pending为空/无guardian，候选sourceProfile显式绑定合成旧profile；verifySlot通过。实际CLI prepare被仍运行桌面的正常退出门禁拒绝，pending和目标profile仍未创建，没有为通过测试关闭用户桌面。随后独立调用生产冷复制与store install/confirm/rollback，旧/新程序分别绑定旧/新profile、回退后新代际仍保留且旧draft hash不变。**CLI正向prepare和完整guardian loop不能在此门禁下声称端到端通过**；已有边界回归加此真实包验证不替代正常退出窗口的实际链路。

### 2026-10-29 本轮接续与旧 packaged smoke 清理

- 接续时两个源码工作树均 clean，新版仍为已推送的 `2ce0d3d9a`，不重复此前对齐/迁移回归。实际 A/B 只读 status 为旧版 `2.1.4-renicode.1`、active B、previous A、pending/guardian 均空；不将桌面已退出视为实时 profile 迁移授权。
- 上轮 packaged smoke 外部脚本 PID34028、测试桌面 PID32104 仍残留，桌面命令行及 crashpad userData 明确绑定合成 `renicode-packaged-smoke-1793241870290/desktop`。没有最终报告时不覆盖运行中的包。仅清理此明确测试所有的进程树；脚本随测试桌面退出后自行结束，额外 Stop-Process 因 PID 已退出报错。没有关闭用户桌面或后台。
- 清理后旧脚本才写出 `report.json`，记录 packaged/self-started backend/独立 CLI stage/认证/历史附件通过；但该报告的 `status:passed` 未区分被外部强制结束的清理，**不是正常桌面退出或完整命令成功证据**。测试后台 cleanup 也不是正常后台停止证据。该产物尚不包含后来 updater guard 的最终重建。
- 最终包首轮重建 `sh_18632223f001zALvQJZDqNf0os` 退出1：命令 PATH 仅含 Bun/node shim，缺 `bunx`，在 electron-vite 前失败；不是产品构建通过。补本次命令 PATH 中既有 Bun bin 后独立重跑 `sh_186333eb0001eqAvTQjS3iGO3i`，结果待收。全局环境未改。
- 外部 packaged smoke 补清理前报告与30秒测试进程退出上限，避免再用最终写报告掩盖无限清理等待；新外部 guardian smoke 计划直接使用真实 CLI prepare/launch/rollback、真实健康上报和合成 profile，不绕过 global desktop/guardian 门禁。测试脚本留在获准 Temp，不写真实凭据/聊天或提交。
- 补测准备时发现已有 `OPENCODE_DESKTOP_DISABLE_PROTOCOL_REGISTRATION=1` 在 packaged 且无testRoot的真实代际被旧OR条件忽略，测试可能注册Windows协议到合成槽位。隔离工作树仅修正此已有开关判断；默认未设置时保持注册行为，不新增参数/路由/存储或修改Protocol/HttpApi。guardian外部验证补HKCU协议项前后逐值相等断言，旧实现的可信回归是将协议command改为测试slot EXE；没有为负向验证实际改写用户协议项。最终包须在此修正后重建，先前正在构建的main snapshot不作为含此修正的产物。
- 修正后Desktop官方 `typecheck:tsc` (`sh_18637a72f0011vTJyg6AYfNX18`)退出0；固定上游changed lint退出0，85 changed files/0 problems。PATH修正后前轮build (`sh_186333eb0001eqAvTQjS3iGO3i`)退出0，但main生成早于协议开关修正，未将此包作为最终验证对象。含完整修正的build `sh_186398342001MfV1Z6Xvkf4lyA` 与全仓check `sh_1863983b0001XgGpNDstsOF2o2` 已启动，尚待结果。
- 含修正最终build `sh_186398342001MfV1Z6Xvkf4lyA` 退出0；随后真实app.asar审计退出0：renicode-desktop/2.2.0-renicode.1、保留data-sm的Renicode标题/main/preload、CLI/version/storage资源一致及15项完整Electron发行资源逐字节一致。此时尚未运行包，不能仅凭静态资源审计验收。新packaged smoke `sh_1863a95640012or5voB9Scputa` 已启动，使用新合成testRoot，尚待正常退出/自启动后台/历史附件结果。
- 最终完整check `sh_1863983b0001XgGpNDstsOF2o2` 退出0：1452 warnings/0 errors、11 guide blocks与源码一致、Turbo36/36 successful、0cached、2m9.851s。此前fixed-upstream changed lint85文件/0问题与Desktop官方tsc通过；不称全仓无警告，不用该结果代替运行与部署门禁。
- 用户询问1452条warnings能否解决后，先只读统计完整已结束check日志：解析1452/1452，全部来自自定义anti-slop/anti-slop-effect规则；spacing460、断言缺安全说明399、runtime typeof168、known-value widening90、unknown参数75、unsafe dictionary61，其他规则199。App949/UI225/SessionUI108/Desktop96/GUI plugins74，395条位于测试路径。资产 `Temp/opencode/renicode-warning-inventory.json`。这是分类盘点，不代表全部误报或无风险，未关闭规则、批量加SAFETY注释或扩大当前迁移范围为全仓重构。
- 用户随后“好的，按你的建议推进”批准两阶段warning清理，主计划revision3已记录；本报告原盘点时未扩范围的事实保留。
- 新packaged smoke `sh_1863a95640012or5voB9Scputa` 的合成报告在清理前记录自启动后台/认证/独立CLI stage/历史附件通过，但停在cleanup started。退出期限用app.process()杀到Windows shell wrapper而非实际Electron，未完成清理；仅清理明确合成testRoot的实际PID30076进程树后，脚本因关闭后再次调用app.process()触发Playwright dispatcher TypeError，最终退出1。不能称packaged正常退出通过；前置功能证据与清理失败分别保留，尚未确定生产关闭问题还是测试/调试器链路问题。
- 无调试器的真实guardian验证 `sh_1864653d8001qy6N6HQ7Gfi0Wo` 退出1，资产 `renicode-generation-guardian-1793254119168/report.json`：stage-generation在拷贝后哈希Renicode.exe时报ENOENT，active A/pending空/guardian空，无run；没有执行实际prepare/launch/回退。源包与合成slot的Renicode.exe均缺失。
- 只读 `Get-MpThreatDetection` / `Get-MpThreat` 证实Defender已处置源包 `PG/opencode-align/packages/desktop/dist-renicode/win-unpacked/Renicode.exe`：ThreatID2147765393、`Trojan:Win32/Cinjo.O!cl`、SeverityID5、ActionSuccess=true、IsActive=false。首次检测/处置时间对应1793254084649/1793254138856。**不是已证实误报**。不恢复/重新复制被隔离文件、不加排除、不关闭防护、不部署该包。运行及安全交付门禁新增此阻塞；后续安全审查/厂商判定与可验证安全产物需要单独跟进，warning清理可独立继续。
- 2026-10-29用户询问Defender解决路径后继续只读核验：当前防护均启用，engine1.1.26100.4/intelligence1.463.16.0；新检测ID `{690EDD9E-5972-4BEF-A500-22B63F8D845D}` 的隔离成功不证明文件安全。通过HTTPS重新读取Electron官方GitHub v44.9.1 SHASUMS256.txt，win32-x64 ZIP官方SHA256为 `41bd7900bd42d0f49110a81617876137041fbbf473466920248ddb076349ef91`，本地electron-mirror.zip完全匹配；不落盘提取EXE，直接对ZIP内electron.exe流计算SHA256为 `1432AFEE01D6A788F11CB6649EFD271923E1E490BEEF688C24D31F47965013AA`，与dist-complete/electron.exe一致。首次遍历两个ZIP时另一个不完整ZIP无法打开；后续明确指定完整mirror ZIP独立复核成功，不将损坏ZIP视为已验证。
- 构建日志3617/3624说明使用该dist-complete且跳过资源编辑/签名，支持stock Electron来源，但被隔离的Renicode.exe本身hash尚未取得，不能推断字节相等或判定误报。当前stock EXE Authenticode为NotSigned，未签名不是恶意证据，签名也不是清除检测的替代。建议经确认后更新Defender情报、受控诊断扫描与clean-build比较；若仍报则经用户/企业IT批准走Microsoft样本复核。此前2026-10-27的旧样本恢复授权不沿用到本次检测。此次未更新情报/扫描/恢复/排除/上传/部署或关闭实时进程。
- 用户随后要求“你一次解决呀？”，允许继续本机安全排障与已有安全交付范围内的执行，不仅提供方案。已执行Update-MpSignature，安全情报更新至1.463.21.0、engine1.1.26100.4，实时防护保持开启；MpCmdRun自定义诊断扫描（DisableRemediation，不修改防护设置）分别扫描完整dist-complete与新CLI基线，均退出0、found no threats。CLI SHA256 `5AE0E52B6589FF0BF630CA826F2ECF8B5B7DF925F2E9ADF37C74DDA4357AA03E`。这些是构建输入扫描，不证明完整新包安全。
- 在隔离工作树启动 `bun script/build-renicode.ts --desktop-only --portable --check --electron-dist=…/dist-complete`，资产 `Temp/opencode/renicode-defender-rebuild-20261029.log`，任务 `sh_186b7987a001GEYe1aO42dqdZX` 待结果。只读真实A/B状态active B/previous A/pending空/guardian空，旧槽位均2.1.4；没有强制关闭、真实profile复制或代际激活。后续须完整包扫描/哈希/隔离运行通过才暂存程序，不恢复旧隔离样本、不添加排除、不上传样本或自签名规避检测。
- 已补正常处置模式的完整Electron发行目录扫描，退出0、found no threats；同时直接对官方哈希匹配ZIP内全部73个文件与dist-complete逐文件SHA256比较，73/73一致（资产 `renicode-defender-electron-comparison-20261029.json`）。不落盘解压被隔离样本、不运行ZIP内容。源码差异复核的protocol guard/Todo/request-queue没有新增下载执行或防护配置操作；这是有限差异核对，不替代新包安全扫描或依赖审计。

### Defender本机处置结果与真实退出阻塞（2026-10-29）

- `sh_186b7987a001GEYe1aO42dqdZX`完整check/build/portable结束退出0：942warnings/0errors、36/36。第一次新包EXE SHA256 `755A93EDAB11FC9A30E48E59BD33797565C7ABE72DD729649B1E31F76045DD45`，完整包诊断与正常扫描均退出0、found no threats；metadata/main/preload/三份CLI-storage资源与15项Electron资源审计全部通过。
- **更正来源推断**：日志明确出现“updating asar integrity executable resource”，`app-builder-lib/out/electron/electronWin.js`的addWinAsarIntegrity先用resedit写入INTEGRITY/ELECTRONASAR资源，随后才跳过品牌资源编辑与签名。因此signAndEditExecutable=false不代表最终EXE字节等于stock Electron；此前支持“未编辑stock EXE”的推断撤回。没有关闭ASAR完整性或签名门禁来规避Defender。
- 首次真实guardian `renicode-generation-guardian-1793262189177/report.json`：隔离CLI正向prepare、后台自启动、认证健康晋升、协议注册不变通过，但桌面写clean后45秒未退出，guardian仍活，最终测试失败。增加失败前CIM进程证据的下一轮 `1793262400903/report.json`确认实际Electron主进程仍存活，并非仅Bun等待promise；不称正常退出通过。
- 精确诊断 `1793262619332/report.json`保留相同退出失败，随后**仅停止合成注册的后台**，桌面/guardian自然退出。此操作不是正常桌面关闭证据，更不授权停止真实后台；它只证明该复现与自启动后台寿命相关。
- 曾试验Client contender release把stderr.resume改为destroy：新增管道owner探针旧实现失败、试验实现70/70通过，Client官方tsc通过；重打包后真实guardian `1793263594396/report.json`仍完全复现退出阻塞，停止合成后台后才退出。因此撤回全部该生产/测试试验，`git diff -- packages/client/src/service-contender.ts packages/client/test/service-contender-pool.test.ts`为空，未用该无效修复交付。不能把stderr管道认定为已确定根因。
- 试验期间其他Client服务回归53pass/4skip/1fail，`replaces an incompatible owner that appears during startup`5000ms超时；撤回后原实现单独重复10次0pass/10fail，未调整deadline或断言，仍有服务回归门禁。它不能据此被判定为Defender原因。
- 独立stock Electron最小应用 `renicode-exit-minimal-1793263820720/report.json`：无子进程、detached ignore、detached pipe三个场景均正常exit0；仅否定“所有Electron detached子进程都会阻止退出”，不替代真实Renicode后台复现。合成watcher已通过控制文件正常停止，无真实进程关闭。接下来须定位真实后台/桌面退出生命周期，而非强制退出或关闭共享后台作修复。
- 撤回试验后重新完整check/build/portable：日志 `Temp/opencode/renicode-defender-final-build-20261029.log`、退出0。最终新包 `PG/opencode-align/packages/desktop/dist-renicode/win-unpacked` 的EXE SHA256 `C6067B16B68F91E0FA943E162F3FF03676F58CF9787F4DB35FBBCCBC5C917475`，app.asar `4A4EC96E74DC3480AA0947986A311498447441DC9D5C13C59C48E09CFCEC093F`，CLI `5AE0E52B6589FF0BF630CA826F2ECF8B5B7DF925F2E9ADF37C74DDA4357AA03E`。最终包两种完整扫描均退出0、found no threats，资源审计全通过。没有声称该最终哈希的正常退出已通过；上一轮同源码真实退出阻塞仍有效。
- 最后读取Defender记录只有原检测ID `{690EDD9E-5972-4BEF-A500-22B63F8D845D}`，没有本轮新检测；安全情报1.463.21.0，real-time/antivirus/behavior监控全启用。**更新情报后重建产物已不再被本机Defender检测阻断**，但旧隔离样本仍未恢复/获得微软误报判定，不能声称永久免检或绝对安全。
- 当前新包未A/B暂存/激活：正常退出及Client服务回归阻塞不绕过。没有上传样本、创建排除/允许项、关闭防护/ASAR完整性、签名规避、修改真实profile或关闭真实桌面/后台。原NSIS下载网络失败门禁仍未重验。本轮源码试验已撤回，既有warning/protocol改动保留，未新提交/推送；本轮所有执行命令已结束。

### 本轮接续：Client 时序修正与原生退出定位（2026-10-29）

- 用户要求继续本计划；仍在 `PG/opencode-align` 实施，原工作区仅维护主计划/验收，固定上游和实时数据门禁不变。接续时Client contender两文件显示modified但实际`git diff`为空，仅有换行提示；没有重新应用已撤回的stderr试验。
- 原Client用例`replaces an incompatible owner that appears during startup`再次实际5000ms timeout（2个expect已执行）。首轮外部命令20秒工具timeout没有完整结果；独立120秒命令得到明确测试失败，日志`Temp/opencode/renicode-resume-client-owner.log`（PowerShell UTF-16输出）。原因是固定500ms并不能保证旧owner在候选发布前注册：ensure可能已经返回正确新版endpoint，随后发布的旧进程不会被本次ensure替换，最后`old.exited`无限等候。
- 只修改该既有测试，改用已有`controlled` fixture：先等待候选开始但未发布，再发布旧owner，等待真实替换停止旧owner，最后释放候选为ready。保留原endpoint/version断言及5000ms期限，没有生产服务修改、mock、retry或扩大超时。定向重复10次10/10通过（9.51秒、20assertions）；两文件定向29pass/2skip，最初命令误写`service-promise.test.ts`而实际未收集Promise文件，**不将它称为Promise回归通过**。随后真正全Client suite234pass/4skip/0fail、933assertions、22文件、51.56秒，覆盖`promise-service.test.ts`；Client官方`typecheck:tsc`退出0。
- 外部诊断文件`Temp/opencode/renicode-exit-observer.{cjs,ts}`加载现有未修改main产物，使用生产冷复制生成明确合成generation、独立服务注册/端口、禁用协议注册及模型/项目配置。观察app事件、Node active resources和Windows进程线程状态；未接入真实profile或真实进程。无Playwright调试器，也未修改产品shutdown逻辑。
- 非packaged自启动后台对照`renicode-exit-observer-1793265189675/report.json`正常exit0，事件顺序包括before-quit/will-quit/process-exit/quit。外部将`app.isPackaged`及resourcesPath切到packaged分支的诊断复现`1793265278904`出现退出阻塞；**这是分支定位试验，不是真正packaged运行验收或修复**。再次使用已暂存CLI的同一合成profile仍复现（`1793265394827`）；强制使用相同SHA256的资源CLI路径仍复现（`1793265496271`），不能把CLI文件复制或位置认定为根因。
- 最新`renicode-exit-observer-1793265914236/report.json`在退出请求后先记录`will-quit`、Node`process-exit(0)`、Electron`quit`，45秒后Windows仍为`HasExited=false`、ExitCode/ExitTime为空、49个线程。Node当时仅列出stdout/stderr PipeWrap，没有Service ChildProcess ref；这表明不能仅凭JS exit事件声明进程已退出，也不支持修改shutdown的10秒期限来修复。仅停止该合成注册后台后Electron自然退出0，原正常退出失败保留。
- 外部对minified bundle做分支定位时，最初三个以源码函数名匹配的false-stack试验实际没有命中，**不视为排除对应分支的证据**。随后用真实bundle位置匹配console transport（`1793265749613`）、CLI stage cleanup（`1793265804869`）、early sidecar probe（`1793265914236`）仍复现；这些临时getter/命令替换只存在Temp诊断文件，未写生产源码/产物，不作为交付修复。原生等待具体栈/资源仍未定位。
- 最新完整check退出0：942warnings/0errors、11guide blocks、Turbo36/36、0cached、2m16.679s；完整日志`C:/Users/reni.li/.local/share/opencode/shell/b2bcac7ee2b0158d605146c6964f41570024a331/sh_186fc4885001Sn3r0DBpGfVTy8.out`。fixed-upstream changed lint133文件/0problems、`git diff --check`退出0。未新增构建、扫描或真正guardian正向结果，上一轮包hash/安全扫描及正常退出失败边界保留。
- 本轮全部执行命令已结束；仅停止外部合成后台进行诊断/清理，没有关闭真实桌面/后台。未提交/推送、A/B暂存/激活或实时profile迁移。Client服务回归门禁本轮已通过；packaged原生退出、剩余942条warning和NSIS网络门禁继续待完成。下一步应取退出阻塞的原生等待栈/资源证据，不以杀后台、`app.exit`或取消完整性检查作为产品修复。

### 2026-10-30 接续：GPU/Mojo 原生等待与后台句柄继承

- 核对上轮尚未记录的外部资产：真正guardian `renicode-generation-guardian-1793270943460/native-stacks-symbolicated.json` 的主线程等待链为 `WaitForSingleObjectEx → base::WaitableEvent::Wait → ThreadSafeInterfaceEndpointClientProxy::SendMessageWithResponder → GpuChannelProxy::Flush → CommandBufferProxyImpl::DisconnectChannel → ImageTransportFactory::Terminate → BrowserMainLoop::ShutdownThreadsAndCleanUp`。符号脚本使用Electron44.9.1符号zip，脚本核对SHA256 `cc89c46c726342e593311777a381c7b9019be9194d9c1702e896b4470f226685`。这是原生GPU/Mojo销毁等待，不是JS shutdown超时的证据。
- 上轮 `1793271626163/shared-handles.json` 的内核object地址全部被系统返回为0，不能以其交集声明句柄共享已证明；保留该无效比较历史。上轮外部observer `1793271846631` 将启动命令换为现有 `service start` 且使用明确合成service config时正常exit0，但它只是诊断分支，不是真正包修复或验收。
- 本轮外部observer沿用未修改的生产main与新合成generation。基线 `1793322387221`、overlapped stderr试验 `1793322453323`、管道审计基线 `1793322547689` 均在45秒期限后仍未退出，停止明确合成后台后才自然exit0。将stdio全ignore的诊断 `1793322322553` 正常退出；这会失去启动stderr，不作为生产修复。诊断脚本均在Temp，未编辑生产源码或包。
- 改用逐进程DuplicateHandle/NtQueryObject读取管道名，不依赖被屏蔽的内核object地址。`1793322547689/pipes-15916.json` 显示合成后台PID15916持有两个inherit属性的 `LOCAL/mojo.7884.4652.*` 管道；`pipes-7884.json` 显示桌面PID7884持有同名管道。配合原生栈，确认后台继承了桌面Mojo端点，是本次退出阻塞的具体资源证据。审计只操作该脚本创建的进程，未读取真实后台内容。
- 同时核对Node24.22.0公开libuv Windows spawn源码：未使用 `PROC_THREAD_ATTRIBUTE_HANDLE_LIST`，CreateProcessW启用句柄继承。此源码核对是机制解释，不替代上述本机实际句柄证据。
- 拟最小修复为Windows CLI自脱离中转入口，由CLI启动最终后台并退出，让最终后台不保留Electron的Mojo端点；必须保留当前命令参数、固定端口、认证、代际隔离与启动失败stderr，不采用ignore stderr/关闭GPU/杀共享后台/app.exit。新增CLI启动参数属于明确接口变更，待用户确认后实施。剩余942条warning及NSIS网络门禁不取消。
- 本轮所有observer已结束、合成后台已清理；未修改产品源码、重新构建或扫描包，未新提交/推送、A/B暂存/激活或实时profile迁移。当前包仍不是正常退出验收通过的交付候选。

### revision 4 接口实现与真实包第一次重验

- 用户选择“批准最小修复（推荐）”后，主计划升revision4。新增CLI `serve --service --detach` 与Windows桌面接入，未修改Protocol/HttpApi，不需要生成Client。第一版复用Service.ensure的Node-compatible spawn；CLI正向/参数拒绝/固定端口/认证/CORS及启动失败stderr检查已运行，但不能替代Mojo资源隔离。
- CLI新增测试沿用同一service.test owner。最初错误地把service config写到xdg-config而fixture的OPENCODE_CONFIG_DIR指向config，密码断言实际失败；修正路径后重复中Windows mmap句柄使fs.rm EBUSY，原生maxRetries未解决，改用仓库现有tmpdir（含GC及关闭后清理）。初次含负端口试验并行于类型检查时遇工具120秒timeout，不声称通过，后删除该昂贵验证项，保留两个无效组合拒绝；真正后台数据库boot失败另加一个明确owner用例。
- 第一组并发full/repeat出现60000ms timeout与EBUSY，未提高deadline或关闭断言；将cwd移到Temp曾使Bun丢失CLI preload，实际报缺react/jsx-dev-runtime。最终显式采用CLI package cwd、禁用项目/Claude配置，保留隔离HOME/XDG/DB与共享transpiler cache。两项正确夹具最终重复20/20pass、210assertions；第一版full文件28pass/3skip/0fail、145assertions。后续最终产物对应验证另记，不用此前失败覆盖为通过。
- 第一版完整CLI/desktop/check/portable构建任务 `sh_18a66a1cb001vqXLGTj2P3E7Rh` 退出成功，日志 `Temp/opencode/renicode-detach-build-20261030.log`；asar品牌/版本/main/preload/CLI-storage资源及15项Electron资源审计通过。真实guardian `renicode-generation-guardian-1793323908053/report.json` 仍失败：prepare/健康晋升/后台自启动/协议项不变通过，clean之后45秒原生桌面不退出，停止合成后台后才退出。日志明确最终服务确实经历--detach与无detach两次启动，不是旧包或未命中分支。**第一版修复没有解决实际退出，不部署该包。**
- 第二版仅在已批准CLI中转入口内改最终派生为Bun原生spawn，保留现有Service.ensure监督就绪、版本和失败；内部短命worker通过单次环境标记运行，标记在最终后台删除，stderr仍显式继承到启动监督者，不使用ignore stderr。第二版两项重复20/20pass、210assertions（121.39秒），随后full文件28pass/3skip/0fail、145assertions；CLI官方tsc通过。
- 第二版完整CLI/check/desktop/portable重建 `sh_18a75fc7a001QZhFQVvfE8BpOI` 正在执行，日志 `Temp/opencode/renicode-detach-native-build-20261030.log`。后续须审计新包并以真实guardian/最终后台管道名/packaged历史附件与正常退出重验，不能凭source CLI通过提前暂存。
- NSIS四项本轮不再被下载timeout阻断，实际3pass/1fail、38assertions：唯一失败为本机PATH缺pwsh。未用powershell.exe伪装pwsh或放宽installer断言；官方PowerShell7.6.9 portable下载在独立Temp资产进行，任务 `sh_18a785c83001Viw9EqASBOxW6q`，下载成功后仍须官方哈希核对才运行。
- 实时profile/用户桌面与后台未操作，未提交/推送、A/B暂存/激活。剩余942条warning审查不取消。

- PowerShell官方GitHub release API给出的完整ZIP SHA256为 `ce7484804c0f0ad4dda10c958e71acdaf7eebfb22505c1b480f89e0e9f1da94d`、大小109620855，实际下载完成并匹配后解压到独立 `Temp/opencode/powershell-7.6.9-complete-20261030`，版本输出7.6.9。未使用原不完整ZIP，不修改全局PATH/系统安装。正确runtime下installer4/4pass、52assertions；随后重复10次40/40pass、520assertions，原网络/pwsh失败历史保留，NSIS这四项回归门禁本轮通过。
- 第二版当前完整check再独立退出0：942warnings/0errors、11guide blocks、Turbo36/36，日志 `Temp/opencode/renicode-detach-final-check-20261030.log`；fixed-upstream changed lint133文件/0问题、diff whitespace检查通过。没有因为该完整check通过就声称第二版包正常退出通过。
- 第二版新包仍在既有构建任务中，未另起重复打包、未运行尚在写入的EXE。外部guardian已补最终后台/桌面管道审计；packaged历史附件smoke已修正关闭后再次调用Playwright dispatcher的问题，并将期限清理绑定明确测试桌面PID，超时仍失败，不把cleanup算作正常退出。两项后续运行尚未执行，A/B程序暂存/激活仍未执行。

- 第二版重建 `sh_18a75fc7a001QZhFQVvfE8BpOI` 随后退出成功，新包资源审计全部通过；真正guardian `renicode-generation-guardian-1793324950886/report.json` 仍失败于clean后45秒原生退出。准备/晋升/认证/协议不变通过，最终后台PID21556的 `pipes-21556.json` 仍有两个继承属性的 `LOCAL/mojo.18220.2304.*` 管道。**撤回“Bun原生spawn只继承显式stdio”的推断**，第二版仍不能交付。只停止明确合成后台后桌面退出，未触及真实进程。
- 第三版在同一CLI短命worker内增加Win32继承标志边界：NtQuerySystemInformation只筛当前worker PID，SetHandleInformation清除其原有HANDLE_FLAG_INHERIT，不关闭句柄或其他进程；随后spawn建立显式stderr。该实现在独立模块内，延迟加载，仅Windows worker调用，不新增公开API/存储/profile机制。CLI正向与失败两项单次2/2、官方tsc通过。新增独立子进程handle contract证明原继承event从flag1变0且句柄仍有效/未触发事件，非Windows因缺Win32能力不运行，测试不修改宿主继承标志。
- 第三版三项在完整build同时运行的重复结果为29pass/1fail、238assertions；唯一失败为首个启动失败用例60000ms timeout，未调大deadline或放宽断言，未称30/30通过。第三版完整CLI/check/desktop/portable任务 `sh_18a8346e5001CYyyQM6UjfVzMQ` 正在执行，日志 `Temp/opencode/renicode-detach-handles-build-20261030.log`。后续必须再次重验无Mojo继承及真正原生退出，不把两轮失败掩盖为已修复。

### 第三版运行门禁通过，实际暂存被新 Defender 处置阻断（2026-10-30）

- 第三版full服务文件29pass/3skip/0fail、148assertions；随后三项重复30/30pass、240assertions（138.32秒），前次29/1 timeout历史保留。完整build/check/portable任务 `sh_18a8346e5001CYyyQM6UjfVzMQ` 最终退出成功，942warnings/0errors、11guide blocks、Turbo36/36。本轮后台服务重启通知后沿用已完成结果，未重跑构建。
- 真正第三版guardian `renicode-generation-guardian-1793325901695/report.json` 退出0：真实CLI stage/prepare、自启动后台、认证健康晋升、禁用协议项不变、测试桌面CloseMainWindow之后实际desktop与guardian正常退出、活后台时CLI rollback拒绝、仅停止合成后台之后rollback成功；两代程序/profile均保留，旧source draft hash不变，模型调用0。没有停止真实后台或靠强制桌面退出通过测试。
- 上述管道审计：桌面PID34280的 `pipes-34280.json` 包含GPU/Mojo端点，最终后台PID34384的 `pipes-34384.json` **没有Mojo端点**，两文件读取成功且stderr为空。原生退出与实际资源隔离在同一最终包通过，不再以JS exit事件代替实际进程退出。
- 真正packaged历史/附件smoke `renicode-packaged-smoke-1793325961273/report.json` 退出0：生产包isPackaged、独立userData/CLI stage、自启动后台认证/PID/401、非空合成历史与synthetic.txt、plugin禁用状态/SQLite完整性均通过；Playwright close后原生桌面PID已消失，wrapper exit0，不再触发关闭后dispatcher读取。合成后台cleanup使用Service.stop，不声称正常后台冷停迁移证据。
- 第三版asar与15项Electron发行资源逐字节审计全部通过；合成guardian候选清单在暂存时保存完整哈希：EXE `b9aef48e35b0a488b519cd76f86017c7e2a2d74b7d52bc8044d8dd66e68212ad`，app.asar `c9b34542040a011c8d4bfdf469736ec67eaee1c64c63eb2882338dde0937e713`，CLI `2db8aa7025773c35e983df0399c11b790f28b1a9e3699491e3af3f5ed688c6e1`；清单 `1793325901695/generations/a267b63d-0f6d-47b9-8fbe-57640dab1e60/candidate.json`。曾尝试PowerShell表格输出hash但被显示列宽截断，不用截断值作为证据；完整值以该已验证清单为准。
- 完整源包MpCmdRun正常自定义扫描曾退出0、输出found no threats。随后执行真实 `bun script/deploy-renicode.ts --check --generation --skip-build`（复用上述已完整check/build/scan的包，不重复生成未扫描新包），编译出独立新launcher `RenicodePortable/launcher/245f405b-422a-43db-a9d1-65454f571927/RenicodeLauncher.exe` 后，stage-generation读取源Renicode.exe时EUNKNOWN失败，整体退出1。
- **新的安全阻塞**：失败后短时Get-Item仍见EXE，随后Get-FileHash/Bun.file均ENOENT。按时间排序的Defender新检测InitialDetectionTime为1793326096115/1793326125298，处置时间1793326158157/1793326158288，ThreatID2147765393、`Trojan:Win32/Cinjo.O!cl`、SeverityID5、ThreatStatusID3、ActionSuccess=true、IsActive=false。源包EXE已隔离。先前扫描通过不解除后续检测，不能称误报或永久安全。情报已为1.463.30.0、engine1.1.26100.4，实时/杀毒/行为监控均开启；没有因新检测关闭/排除/恢复/换路径复制同一样本或上传样本。
- 实际A/B最终状态核对：active B、previous A，两槽位仍2.1.4-renicode.1，pending/guardian空，无实际generation候选目录；handoff新增id107 launcher-error，记录上述EUNKNOWN。现有A-B快捷方式仍指向原launcher `96bd260b-2340-41f8-ab27-812be4ede6ec/RenicodeLauncher.exe`，新编译launcher仅为未接入文件，未删除。**仅程序暂存未成功，未激活，未复制/迁移实时profile**。
- 当前停止点为新安全软件隔离门禁，而非未获取退出证据。后续先审阅完整构建来源/候选哈希与新检测，按用户/企业IT批准走Microsoft复核或验证新的安全构建路径；不恢复本次隔离样本或靠禁用ASAR/防护、签名伪装规避检测。本轮所有执行任务结束；没有新提交/推送，剩余942条warning仍待审查，计划未完成。

### 2026-10-30 后续接续说明

本轮只读事件XML/Defender/A-B核验与本地脱敏英文复核材料见 `docs/validation/renicode-defender-review.md`；事件读取进程与检测文件区分，不推断DLP导致误报。用户选择先继续warning清理，并另批准最小主题rgba输出类型修正，主计划revision5；最终923warnings/0errors、137改动文件changed lint0、主题逐值对比及UI回归见warning验证第四批。没有新包、新安全放行或部署重试，A/B仍active B/previous A、两槽2.1.4、pending/guardian空、handoff107。没有恢复/上传样本、防护变更、实时profile或真实进程操作。本轮命令均结束，warning与整个对齐交付仍未完成。

### 用户观察新构建：实际程序暂存成功（2026-10-30）

- 用户明确要求重新生成并观察，安全中心允许/恢复由其手动处理。首次全命令300秒timeout与PowerShell参数失败历史见Defender复核记录；同参数quoted打包 `sh_18b241259001vdk2VkKezq41uH` 最终结束成功。完整check923warnings/0errors、11guide blocks/Turbo36/36，desktop main/preload/renderer已完整构建，含最新主题修正；保留6条CSS优化警告。
- 新包asar/品牌/版本/main/preload/三资源与15项Electron资源审计全部通过。新候选清单 `Temp/opencode/renicode-user-watched-candidate-1793335984998.json`：EXE SHA256 `681f2694f515a9ff15603cafde13c1fb1c7682bf9f9169a51f03baad4426a063`；app.asar `da0eafdc3b6baa7c68c8e9a4904f35d993c9788aaeab7be7e517d2b65f8afe7d`；CLI仍 `2db8aa7025773c35e983df0399c11b790f28b1a9e3699491e3af3f5ed688c6e1`。不沿用旧EXE/asar哈希，不称微软已判误报。
- 完整新包正常MpCmdRun扫描退出0、found no threats，日志 `renicode-user-watched-scan-20261030.log`；运行和暂存后读取Cinjo明细未出现新的检测。安全允许项由用户处理，未修改防护/添加排除/恢复样本；扫描不是厂商判定或绝对安全保证。
- 新包真实guardian验证退出0，资产 `renicode-generation-guardian-1793336106622/report.json`：实际CLI stage/prepare/自启动后台/认证健康晋升/协议不变/desktop与guardian正常退出/活后台rollback拒绝/合成后台cleanup后回退/两profile保留及旧合成数据hash不变通过，模型调用0。
- 新包packaged历史附件验证退出0，资产 `renicode-packaged-smoke-1793336175688/report.json`：isPackaged、独立CLI/后台认证/PID/401、非空合成历史与附件、plugin禁用与SQLite、原生desktop消失/wrapper0通过。只清理测试所属后台，不将Windows Service.stop信号终止当真实后台优雅停机证据。
- 实际 `deploy-renicode.ts --check --generation --skip-build` 退出0，复用上述check/build/scan/runtime已核验包。**generation `318a38a2-f425-40cc-a69d-537c36e554c6` 已仅程序暂存**，candidate slot A新不可变目录 `slots/A/dbf3bad2-1f59-4a5d-a10d-219e83b672e5`，handoff108 generation-package-staged；没有覆盖活动槽或原安装。
- 真实candidate清单7项文件逐SHA256复核全部通过，结果 `Temp/opencode/renicode-user-watched-staged-verified-20261030.json`。readonly状态active B/previous A、registered A/B仍2.1.4、pending/guardian空，目标profile目录未创建。新launcher `launcher/fcbae890-4290-4a77-9717-350c5bbe441e/RenicodeLauncher.exe`已接入A-B快捷方式，但没有启动guardian或新版。本次**暂存成功，未激活，未迁移实时profile**；此前handoff107失败历史保留。

### 用户授权安排真实激活：旧后台门禁仍未满足

- 用户在说明正常退出窗口/独立profile复制/启动健康验证后回复“现在安排激活”，授权实际代际准备与激活，但不授权AI强制关闭/重启旧桌面或后台。
- 再次核验candidate7项哈希、pending/guardian空及目标profile未创建。CIM未见Renicode桌面/guardian，旧版后台 `ai.renicode.desktop/cli/2.1.4-renicode.1-x64/opencode-cli.exe` PID25384仍运行；只读认证GET `/api/session/active`返回0个前台drain。没有打印凭据或Session正文/ID；0 active不表示后台已停或可在活后台复制。
- 已核对现有Service.stop在Windows通过SIGTERM并可能升级SIGKILL终止，不冒称已验证的优雅停机。未执行stop/kill、真实prepare-generation或launch；等待用户完成旧后台停止窗口后再核验SQLite/恢复claim/冷复制等生产门禁。

### 用户授权停止旧后台与真实缓存门禁

- 用户明确要求协助停止旧后台。再次核对25384/旧版路径/注册版本及active0后，使用现有ServiceRegistration的所有权监控：把service.json原地改名为 `service.shutdown-0e39a76b-4d28-413e-84da-7848cea331af.json`保留。没有删除注册内容、发送SIGTERM/SIGKILL或触碰OpenCode后台。旧后台日志于2026-10-30T05:22:59.420Z明确记录PID25384 registration check failed; shutting down，CIM随后PID不存在。
- 外部PowerShell观察器nativeExited=true，但ExitCode返回null，因原脚本要求0而报告失败；不冒称已获得exit0。自身shutdown日志与实际进程退出证据保留，后续生产cold-copy门禁仍实际执行，不能用该观察器错误吞掉SQLite/claim检查。
- 首次真实prepare-generation退出1：Profile contains a link；未创建新profile或发布pending，未绕过链接检查。元数据盘点1816个链接全部在 `profile/cache/.bun/install/cache`，其他目录0链接，未跟随任何链接；完整路径/目标清单仅保留获准Temp，不包含文件正文，不入Git。
- 用户选择“跳过下载缓存（推荐）”，批准仅排除此可重建目录、原缓存不动/其他数据与所有门禁保留/可能重新下载依赖。同一计划revision6；新增显式 `prepare-generation --skip-bun-cache`，默认仍完整复制并拒绝链接，不新增任意排除。清单记录excluded；源目录不删/不移动缓存。
- 扩充既有cold-copy唯一owner表：cache-links、unapproved-cache-links、other-link，与原live/claim/existing/corrupt门禁同表。新断言在旧实现7pass/1fail，失败是cache-links未被批准排除；新实现重复80/80pass/410assertions、Desktop官方tsc通过。初次changed lint仅test空行1条失败，已补空行后继续最终检查，不放宽断言。实现/完整检查最终结果另记；未运行新包、复制真实profile或激活。

- 缓存排除最终检查已收齐：完整check923/0/11guide blocks/Turbo36/36、fixed-upstream changed lint137文件0问题；cold-copy/runtime/store实际收集3文件33/33pass/111assertions（命令另写preferences路径但未收集，不冒称4文件），以及cold-copy重复80/80通过。
- 正确flag的真实prepare再次被活后台拒绝；服务注册显示新的旧版PID7960、原旧PID25384已消失，并非把任意PID复用判为后台。未证实哪个外部客户端再次启动旧服务，不删除/关闭该未知客户端。目标profile仍未发布。
- 再核对7960/旧版路径/active门禁后，使用同一原地注册撤回触发自身shutdown；本次观察器提前持有native handle以获取ExitCode，保留第一轮ExitCode=null失败历史。停止与立即cold-copy组合任务 `sh_18b69448d001SmfEaCefEdV4hK`已转后台，日志 `renicode-real-generation-prepare-after-stop-20261030.log`；此处尚未收到结束通知，不宣称真实profile已复制/准备/激活，也不重复启动或轮询。

### OpenCode 与 Renicode 后台归属核验

用户质疑当前聊天是否使用旧Renicode后台。本轮实际CIM及当前shell父进程核验：工具进程powershell.exe的直接宿主PID26524，EXE为 `ai.opencode.desktop/cli/2.2.2-x64/opencode-cli.exe`；OpenCode桌面主PID25932从 `Programs/ai.opencode.desktop/OpenCode.exe`运行。此前被授权停止的旧Renicode PID25384/7960 EXE均在 `ai.renicode.desktop/cli/2.1.4-renicode.1-x64`，与当前工具宿主不同。没有停止或迁移OpenCode后台/profile；不把旧Renicode被拉起归因于当前聊天，启动来源尚未核实。背景cold-copy任务仍待结果。

### 真实代际准备、启动与健康晋升已完成（2026-10-30）

- 组合任务 `sh_18b69448d001SmfEaCefEdV4hK`随后成功结束：第二旧后台PID7960在注册监控shutdown后nativeExited=true、ExitCode=0、terminationSignalsSent=false。私有注册备份保留原profile目录，未发送终止信号；报告 `Temp/opencode/renicode-old-backend-shutdown-7960-20261030.json`。第一轮ExitCode=null的观察器失败历史不改写。
- 生产prepare成功完成SQLite完整性/外键/恢复claim、源副本哈希与最终停止复核，复制7759个文件到generation `318a38a2-f425-40cc-a69d-537c36e554c6`独立profile，仅排除已批准 `profile/cache/.bun/install/cache`；清单在该profile的renicode-generation.json。原下载缓存保留，目标旧注册lease移除、service环境过滤按现有实现执行，不跟随链接。
- 准备后readonly状态active B、pending A、guardian空；A候选2.2/B旧2.1.4，handoff114 staged。只有在准备成功后才显式Start-Process启动已接入的独立launcher，PID20592；没有调用服务自动发现/替换当前OpenCode，也没有直接绕过launcher启动EXE。
- **实际激活成功**：readonly控制为active A、previous B、pending空、guardian20592；新desktopPID5588，路径为新不可变slot A；独立新CLI PID34168，路径在该generation/profile/cli/2.2.0-renicode.1-x64，监听127.0.0.1:37253。run状态ready、ready_at存在，guardian经过生产15秒健康门槛晋升，handoff117 healthy。
- 新代际认证 `/api/info`实际HTTP200、PID/版本2.2.0-renicode.1一致，无认证 `/api/session`401；slot_profile绑定正确、原drafts.sqlite哈希仍与复制清单一致。结果 `Temp/opencode/renicode-real-activation-verified-20261030.json`不含凭据或真实聊天。CIM再次确认OpenCode2.2.2/PID26524仍在独立ai.opencode.desktop，新Renicode2.2/PID34168在独立generation；未出现旧RenicodeCLI。
- 补充在线SQLite审计首轮及仅提高该readonly连接busy_timeout至5000ms的一次重验均遇SQLITE_BUSY；没有停止新版、变更journal或绕过锁读取，不称补充在线审计通过。冷复制前后生产SQLite检查已通过，这是额外在线检查的局限，不用它伪称数据库损坏或取消成功激活事实。
- 用户后来表示可强行关闭Renicode后台；本次不需要且未采用该方式，旧后台实际已自行exit0。激活后读取Cinjo明细仍为此前记录，无新检测；用户手动允许不记作微软误报结论，没有由AI恢复样本/改防护/加排除或上传。
- 当前新Renicode桌面/guardian/独立后台是用户明确授权的应用运行，不是尚未结束的构建任务；构建/测试/复制/健康核验均已结束。旧原安装、旧slot B和原profile保留；回退仍须正常退出新版与后台，旧UI不自动包含升级后新增数据。未提交/推送，warning923仍待审，整体对齐计划继续active，不因部署成功自动完成。

### 后续warning第五批兼容交付（2026-10-30）

37个UI字典类型宽化清理后完整check886/0、changed lint174文件0问题，类型/回归及字典/JS等价审计通过。用户允许本次主动正常关闭Renicode；完整portable、资源、扫描与隔离运行后实施同profile/同后台的兼容A/B更新。首次新EXE发生57字节内嵌ASAR hash异常、来源未证实，初次B晋升不作为最终通过；异常包保留，使用本轮启动前冻结并已扫描/运行验证的正确原构建，通过新不可变目录替换两登记槽并重验实际slot扫描/header/hash。最终active B=`7e05e2ae-5169-4f59-b206-72f884ae4ffb`、previous A=`ed38258a-a785-440f-99c2-71278e130ab9`、pending空、guardian30120、desktop24288 ready、handoff132 healthy，CLI34168和代际profile不变；正确A正常退出native exit0，无强制终止或后台重启/数据迁移。完整失败、候选hash、首次闭窗ExitCode=null局限、冻结构建来源及最终核验见 `renicode-warning-cleanup.md` 第五批。未提交/推送、改防护、恢复/上传样本或删除历史包；所有命令已结束。剩余886warnings及EXE资源写入来源调查继续待完成，整体计划未完成。
