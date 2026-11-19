# Renicode 2.2.5 同步验收记录

<!-- wiki: {"kind":"validation","workflow":"review","revision":1,"change":"none","relations":["docs/plans/renicode-upstream-align.md","docs/discussions/opencode-upstream-sync.md","docs/validation/renicode-warning-cleanup.md","docs/validation/renicode-align-upgrade.md"]} -->

## 基线与边界

- **最新安全阻塞（2026-11-04，覆盖当前放行状态，不改写旧成功）：** delivery1793783097659的编译launcher SHA256 `983e0f767e99a8f3170cefd0b819df0fee76d50c8fc258c0bb8a8cdcc3fe48e7` 首次单文件Defender扫描 **exit2/0x80508023**，引擎日志明确Completion Failed；未当作no-threat。随后原生Windows路径、仅launcher目录的同参数custom scan **exit0/found no threats**，hash未变，两个日志各自保留。**launcher尚未执行，compiled guardian尚未运行。**
- 在packaged desktop完成后的全包97文件复核中，Bun读取新`win-unpacked/Renicode.exe` **EUNKNOWN/-4094**，没有生成成功对照manifest；随后PowerShell只读hash仍为冻结`f844b327130d875d0a4ecddd641811c65ec504d7c23c8c5a04663e1b09bad3f4`、文件246588928bytes，但这不证明安全。Defender新增实时告警 **Trojan:Win32/Cinjo.O!cl / ThreatID2147765393 / SeverityID5 / IsActive=true / DidThreatExecute=false**，InitialDetectionTime epoch1793784995558，两条1116事件针对这个新EXE。事件ProcessName分别为读取上下文Bun与`C:/Program Files (x86)/Dlp/dlp3.0/CGEData.exe`，不能据此归因文件修改或断言误报。实时/行为/IOAV/AV保护仍开启。此前custom scan no-threat、EXE/hash与packaged smoke成功仅保留为历史事实，**不构成本次安全放行**。
- 已因此停止compiled guardian/pipe继承/运行后完整性与实际A/B暂存；未执行deploy/真实prepare-generation/launch，真实profile/服务/槽位未动，未提交推送。未放行、恢复、排除、删除样本或更改防护策略，也未上传外部样本。证据：delivery的`security-blocker.json`、`launcher-defender.log`、`launcher-directory-defender.log`、`launcher-defender-engine-tail.txt`、`runtime-defender-detections.json`、`runtime-defender-threat.json`、`runtime-defender-threat-events.json`。需先由安全核查解决此告警，再重新满足完整包扫描/hash/ASAR与guardian门禁；不以补跑成功覆盖失败。

- 新版packaged desktop实收退出0，资产`renicode-sync-225-packaged-smoke-1793784655739`：isPackaged/profile隔离、历史正文/附件、disabled plugin保留、SQLite完整性、自己启动实际2.2.5-renicode.1的独立CLI stage、认证health/未认证401均通过；Playwright wrapper exit0、nativeDesktopGone=true。测试后台Service.stop仅用于合成注册cleanup，不称其优雅后台退出证据；未关闭真实后台。为交付独立launcher，用与deploy完全相同参数在delivery私有目录编译RenicodeLauncher.exe，随后扫描并让同一guardian harness直接执行编译EXE而非Bun源码；尚未扫描/运行guardian，未部署。

- 恢复旧source共享cache后的直接入口仍失败：资产`renicode-sync-225-packaged-warm-source-upgrade-1793784425439`明确startup-deadline60001.864ms、exit143，旧stderr空、新CLI未启动，失败保留；cache并未解决问题。再仅旧源码换成此前已有import probe分阶段loader，资产`renicode-sync-225-packaged-old-stage-upgrade-1793784559242`实收退出0：旧preload261.929ms/entry-import-return840.389ms/监听9017.883ms；新**编译CLI直接执行**监听219.777ms、重启177.937ms，两个实际info.version均2.2.5-renicode.1/能力persistentPty=true。old-restored也走source诊断loader，四后台均正常exit0；原journal54→59五项、export/inbox/非空历史附件/归档/升级读写/重启/backup恢复、job导入/KV清理/SQLite/源与draft hash断言完整通过，模型调用0。此为新编译CLI直接启动/升级恢复证据，不证明旧source直接入口cold或warm失败已修复；保留诊断loader标记，不称旧发行包验证。独立packaged desktop smoke正在运行，仅旧保留Temp合成fixture复制到新root；guardian/A-B未执行。

- packaged runtime首轮在旧源码`old-seed`60秒未监听，资产`renicode-sync-225-packaged-upgrade-1793784228683`/delivery`packaged-upgrade.log`失败保留，phases空/旧stderr空、新编译CLI尚未运行。对比此前直接入口观测脚本发现新外部生成器漏掉其`BUN_RUNTIME_TRANSPILER_CACHE_PATH=Temp/opencode/opencode-test-transpiler-cache`；独立warm-source副本仅对旧源码恢复同一设置，并记录启动deadline/exit/startupMs，编译新CLI使用新隔离profile不启用源码cache。原60秒启动/15秒退出/30秒API与完整五迁移/附件/回退断言不变。`packaged-warm-source-upgrade`→桌面→guardian wrapper已启动，不能称旧源码cold失败已修复或拿warm成功抹去历史；未部署。

- 新包native-path静态审计全部通过：品牌/version/renderer/main/preload、CLI/版本/storage资源与源码stage逐字节一致、15项Electron发行资源一致；ASAR实际header及EXE内嵌hash均为`d0285ee32eb03489f54acebf87fe69e30c490e2ac014b20b7d7df53252b3fadb`，EXE SHA256 `f844b327130d875d0a4ecddd641811c65ec504d7c23c8c5a04663e1b09bad3f4`。完整包97文件/871672471bytes，manifest SHA256 `dc91f28a01ac7063a50ee9d8e6729a593fd490351a940d720594d216cb58f454`。Defender26100.4-0 custom scan退出0/明确found no threats；使用仅custom scan的DisableRemediation以忽略排除项/扫描archives/不修改被测包，不改变系统保护策略，扫描前后97hash与ASAR header完全一致。实时/行为/IOAV/AV保护均读取为开启，签名1.463.117.0。staged/unstaged新增文本高置信度凭据模式均0命中，有限范围不是完整安全或依赖漏洞审计；`source-security.json`保存diff hashes。隔离packaged-upgrade→desktop→guardian串行wrapper已启动，仅Temp合成profile，原期限/五迁移/历史附件/回退/退出门禁保持，结果待收。真实profile/服务/活动槽位未写入。

- 统一CLI+desktop `bun script/build-renicode.ts --portable --check --electron-dist=.../dist-complete`实际退出0，交付资产`renicode-sync-225-delivery-1793783097659`/`build.log`，Electron44.9.1/x64、renderer Vite38.34s、内嵌ASAR资源更新；未使用desktop-only，输出此前不存在。首轮静态审计退出1：ASAR3.4.1在Windows按path.sep解析条目，旧外部脚本传`out/renderer/index.html`找不到资源；源码output中index.html存在，archive metadata实际2.2.5-renicode.1。仅新外部审计副本改path.join并修正明确report目的地，保留`static-audit.log`/`static-first-failure.json`；新包未修改，后续扫描/运行/部署门禁尚未收齐。

- 窄屏追加修复最终实收：独立production `renicode-sync-225-terminal-rename-1793782868671` build退出0/Vite29.30s，原owner连续 **10/0、50.0s**，完整terminal **21/0、59.2s**，1worker/0retry。`tab.tsx`仅把blurEnabled检查从save移到onBlur，不新增产品接口、等待/重试或测试断言。GUI官方tsc退出0；本轮`tab.tsx`/shared persistent-pty两文件`--deny-warnings` lint **0warning/0error**。canonical补命令级strip后退出0，**340warnings/0errors、11guide blocks、36/36任务（33cached）**。`lint:changed origin/dev`因本地无该ref退出1；固定v2.2.5基准的真实lint-changed仍 **148问题/42文件/273变更文件、退出1**，逐项完整identity及42文件hash均与此前冻结340清单一致（`renicode-sync-225-lint-pty-reconcile.json`），无本轮新/移位warning，不称lint-changed零警告。统一CLI+desktop build wrapper已运行，拒绝覆盖已有out/dist并写独立delivery日志；结果尚待收，未部署。

- PTY第三轮`terminal-side.log`实收 **3/0、51.8s、1worker/0retry**，输入12000行/1497808bytes/SHA256 `fcd6b16bcaa6478823e023e5f63e5b996bed52e5e078cae4819852be4eb73c47`；三trace解析非空及哈希冻结在`terminal-side-audit.json`，visible/hidden/workload-teardown分别2075.3/1228.1/1364.2ms、CPU963.971/914.613/909.333ms，hidden return18.7ms，teardown home104.6ms/CPU64.375ms。单位范围为Chromium renderer单样本，不称daemon IPC/Electron总RAM或趋势；bytes为累计Ghostty写入观察含checkpoint重放，非native唯一输出量。native日志为VT控制流，追加审计曾将resize重绘误当重复producer（两次审计失败保留于工具记录），最终保留原始bytes并核验12000首次记录顺序，显式报告重绘记录；原teardown解析连续保留记录的断言未改。
- 共享mock受影响完整terminal keeper实收 **20/1**，窄屏Escape/Enter owner在Enter后仍显示Rename输入Deploy，`tab.tsx`的save把初始化blurEnabled门禁也用于显式Enter。用户已追加批准最小修复：门禁仅保留onBlur，save仍检查editing；原断言/期限不变。独立修后production build→owner10次→完整keeper正在执行，日志将置于`renicode-sync-225-terminal-rename-*`，修前失败不覆盖。e2e官方tsc已退出0。canonical首次因命令未补Node strip-types而未加载lint插件失败，原日志保留；补已有命令级NODE_OPTIONS后新版日志`renicode-sync-225-check-pty-rename-strip.log`执行中，不改全局配置。

- 2026-11-04 PTY进行中：`terminal-first.log`三fail为native找不到bare `pwsh.exe`；`terminal-runtime.log`三fail为seeded Terminal1未激活，快捷键新建Terminal2。第二轮native启动正常，均未进入12000行输出工作量；测试PTY在finally清理，native日志保留。第三轮`terminal-side.config.ts`/`terminal-side.log`仅外部夹具展开Review侧面板/选择Terminal1，无旧bottom种子，不改产品/原期限；结果待收。共享`persistent-pty.ts`新增可选onInput/onResize native桥接，普通夹具默认不变，keeper/官方e2e tsc/canonical尚需重验。资产仍为`renicode-sync-225-performance-1793778902255`，独立失败目录不覆盖。

- 2026-11-03，用户明确批准同步官网 V2 稳定 **2.2.5**。固定源码 `9bbb8ce18c80f099e0e448775f59d965ead40a21`；不追随滚动 dev。唯一有效计划仍在 `docs/plans/renicode-upstream-align.md` revision12。
- 实施工作树 `C:/Users/reni.li/Downloads/PG/renicode-sync`，分支 `sync-renicode`。HEAD仍为原 align HEAD，承接以未提交 staged/unstaged delta存在；无新增提交/推送。
- 原两工作树260个变化文件保护副本及SHA256 manifest位于 `Temp/opencode/renicode-sync-225-input-20261103`。完整保护tree为 `0ed62130dc39c572f7d8cb5a13fbf8882fafa6ce`，包括未变但需要后续审查的旧终端probe；不修改或删除原源码工作树。
- 本报告仅记录新版实际证据。旧2.2.0的909/235等测试、旧EXE/ASAR哈希及旧安全结果均不是新版通过证据。

## 已完成的实际验证

| 检查 | 结果 | Temp/opencode 证据 |
| --- | --- | --- |
| 独立 frozen-lockfile安装 | 成功，1777包，76.65s | `renicode-sync-225-install.log` |
| Client生成 | `packages/client`运行`bun run generate`成功 | `renicode-sync-225-client-generate.log` |
| canonical check | 349warnings/0errors；11guide blocks；36/36任务成功，25cached | `renicode-sync-225-check-terminal-owner.log` |
| 原生lint JSON | 退出0，349diagnostics，105源文件hash已冻结；未自动认定全部合理 | `renicode-sync-225-lint-snapshot/diagnostics.json`、`source-hashes.json` |
| App官方tsc | 修正media夹具后退出0 | `renicode-sync-225-app-tsc-media.log` |
| App完整unit | 958pass/0fail，2749assertions，129files | `renicode-sync-225-app-tests.log`的unit末尾 |
| App完整browser | 303pass/0fail，2359assertions，54files | `renicode-sync-225-browser-resume.log` |
| UI完整unit | 318pass/0fail，2576assertions，20files | `renicode-sync-225-ui-tests.log` |
| SessionUI完整unit | 325pass/0fail，872assertions，27files | `renicode-sync-225-session-ui-tests.log` |
| GUI-plugins完整unit | 271pass/1既有能力skip/0fail，699assertions，40files | `renicode-sync-225-gui-tests.log` |
| 窗口恢复owner | 10pass/0fail，26assertions | `renicode-sync-225-window-state.log` |
| 新终端connection/model/writer owner | 23pass/0fail，59assertions | `renicode-sync-225-terminal-owner.log` |
| database migration owner | 22pass/0fail，46assertions；含新增shell/agent旧KV数据导入表 | `renicode-sync-225-database-migration.log` |

PowerShell打印的NativeCommandError段可来自Bun正常stderr；本报告以实际exit、suite汇总与失败断言为准，不据该段自动认定产品失败。storage磁盘故障、ECONNRESET和多Solid实例提示保留，不宣称运行日志无告警。

## 失败与修复历史

1. 初始三方apply因3个本地有差异的上游删除失败，未写入；第二轮排除这些删除后写入43冲突。只对冲突三方LF归一后剩31文件手工整合。无unmerged/冲突标记，初次cached whitespace check通过。
2. 初始lint/check因Node22.16默认不加载`.ts` JS插件而未启动。命令环境加`NODE_OPTIONS=--experimental-strip-types`，不改全局配置/源码规则；实际首轮350warnings/1error，重复statusLabel已最小修正。
3. App初始Bun typecheck7错误/4文件；修未用Project import、重复旧状态函数、旧pty字段，官方tsc随后定位2处缺media，补unexpected fixture边界后通过。生产ServerSDK与API不为了测试变形。
4. App完整命令120秒host timeout发生在unit958/0完成后的browser阶段，不能算整体完成。只重新执行browser、host预算300秒，不改任何单项timeout/retry/skip；实际303/0通过，未重复已通过unit。
5. Core四文件owner初轮30pass/1fail：上游persistent-pty-daemon fixture调用`sleep`，本机PATH缺该程序。保持为真实失败，待用既有工具的命令级环境补齐，不关闭或重启真实daemon/用户程序。

## 迁移与负向证明

- 新增5迁移：schedule、session_part、session_time_busy、schedule_checks、job。job会将`job.background/%`的有效KV记录导入新表并删除旧前缀；交付只能独立profile代际，不能直接让旧CLI读写迁移后数据。
- 原`database-migration.test.ts`扩展同一owner的shell/agent表：检查所有迁移后字段、child/parent映射、时间、recovery原JSON、无关KV保留和重复应用只记一次。没有重复一套迁移实现或操作真实数据库。
- 外部Temp派生迁移将导入SQL改为`WHERE 0`，保留删除语句；同一新增断言实际**0pass/2fail**，收到空job表而期待完整记录。证据 `renicode-sync-225-job-negative/result.log`。首轮派生脚本因源码反引号转义未匹配而未启动测试；修匹配后才得到上述真实负向结果。生产迁移和owner测试未被mutation修改。

## 终端旧覆盖承接

- 上游commit `ef712d3a783759e673eba38077a7a2f540c76337`将桌面终端改为持久PTY，删除生产`SerializeAddon`与前端序列化路径。保留孤立旧测试曾使canonical在`serialize.test.ts`缺失模块处失败（25/30任务结束），失败日志保留。
- 审查后承接上游删除旧SerializeAddon test及terminal benchmark/probe。修改过的旧test/benchmark逐字节在保护副本，全部旧文件亦在保护输入tree和官方delta，原align工作树仍保留；不是清理用户历史。
- 新恢复契约owner：`packages/gui-plugins/src/terminal/connection.test.ts`的“writes output received before a resize at the old size, then resets to the resize checkpoint”；用户可见reload/离开后的恢复由`packages/app/e2e/regression/terminal.spec.ts`的新keeper承接，GUI keeper尚需实际运行。
- 外部Temp派生connection丢弃checkpoint写入，原owner恢复断言实际**0pass/1fail**，明确缺少restored/checkpoint输出，证据 `renicode-sync-225-terminal-negative/result.log`。生产connection/owner测试未修改。旧前端tail读取操作数不适用于不存在的实现，不能据删除宣称新版性能更好。
- **性能门槛不取消**：旧可见输出、隐藏输出、大scrollback teardown工作量需在新版持久PTY harness上采集生产before/after原始trace；目前未完成，旧benchmark源码冻结仅为历史，不是新版测量。

## 尚未完成

- 全仓官方tsc、Desktop完整suite结果待收；Core缺sleep环境owner需收口。
- 349项新版诊断与旧逐项清单需要有据复核；数量减少不等于全部已审，无修改lint规则/全局豁免许可。
- 原Settings keeper修正的新版验收、相关GUI/component keepers、新终端GUI及生产benchmark仍待收齐。
- 新版完整CLI/desktop包构建、ASAR/资源/hash、安全扫描、隔离启动、升级/回退隔离及A/B仅程序暂存未执行。
- 无真实profile复制/迁移、强制关闭/重启、防护变更或激活。本报告不是完成交付或安全放行。

## 2026-11-03 后续收齐与GUI启动阻塞

- 全仓官方 `bun run typecheck:tsc` 实际退出0：**35/35任务、0cached，1m36.876s**，证据 `renicode-sync-225-full-tsc.log`。Desktop完整suite实际 **274pass/0fail、1044assertions、45files、92.15s**，证据 `renicode-sync-225-desktop-tests.log`。以上取代前述待收状态，不删除历史。
- Core仅补初轮失败的 incompatible-daemon case：命令PATH加入既有 Git `usr/bin/sleep.exe`，**1pass/8filtered/0fail、5assertions**，证据 `renicode-sync-225-daemon-sleep-env.log`。没有改变产品/fixture或单项期限；初轮30pass/1fail仍保留。
- 最新349诊断按完整identity（路径、code、message、offset/length）和源SHA256与旧443逐项已审清单比对：**314精确匹配，35需复核**，证据 `renicode-sync-225-lint-snapshot/review-delta.json`。未将35项机械豁免。
- 六文件生产GUI keeper首次命令实际退出1：**Timed out waiting 120000ms from config.webServer**。没有进入用例执行阶段，没有keeper断言失败/通过证据。日志 `renicode-sync-225-keepers.log`；保留构建的CSS highlight、动态import和chunk size告警。host1200000ms未触发；是配置的启动预算覆盖构建+静态服务而耗尽。
- 按仓库既有外部production-target模式恢复：先独立生产build（同fixtures、origin、Renicode版本参数，host600000ms），成功后使用仓库 `e2e/utils/serve.ts` 的隔离静态服务器跑原六文件，保持2workers/0retries及所有原用例/断言期限。不重启真实应用/后台，不降低为dev build；独立build当前待完成。

## 2026-11-03 35项复核与窗口文件入口补漏

- 35项非精确匹配已逐项复核：9项只缺结构空行，已修；另26项有实际边界保留依据。原生后续lint **340diagnostics/101源文件、退出0**；冻结 `renicode-sync-225-lint-after-review/{diagnostics.json,source-hashes.json,accounting.json}`，逐项对账 **314完整identity+源hash精确承接、26重新审查、9 spacing修正**。不是将35项批量自动豁免；保留review-delta349原快照。
- 26项：picker故意缺location的响应桥2；voice逐工具解析前的任意参数字典1；MCP shorthand/object归一1；headless scroll geometry桥1；regions键值相关性桥2；window raw/单flag恢复边界6；native headers开放可变字典1；logging scope/unknown EPIPE边界3；Lighthouse窄Puppeteer适配1；native CDP方法/session相关边界7；Home navigator存在性1。每项在accounting中含当前源码SHA256、原生完整诊断和具体审查依据，不以这些代码审查替代未完成GUI/native验收。
- window复核发现真实合并漏保留：新版严格StateFile Struct在读取文件时整份拒绝含坏flag的JSON，绕过旧定制windowFlags“只丢弃坏flag、保留bounds/extra/另一个正常flag”。原10owner只直接传入坏flag对象；在同一3行表加真实文件读取链，首轮 **6pass/4fail**含本次fixture双重tmpdir导入导致1个额外失败。去掉命名冲突、复用既有Core scoped tmpdir后，生产未修状态实际 **7pass/3fail**，均为文件链丢失全部bounds/flag/extra，证据 `renicode-sync-225-window-file-before-fixture.log`，初始失误日志也保留。
- 最小修正StateFile为 `Schema.fromJsonString(Schema.Record(Schema.String, Schema.Json))`，仅承认JSON对象并保留所有字段，将既有几何/单flag策略交给resolver；坏JSON/非对象/缺文件仍拒绝，不操作真实窗口/profile。原3行表保留直接输入断言，增加读文件链断言；同一owner10次 **100pass/0fail、320assertions**，`renicode-sync-225-window-file-after.log`；Desktop官方tsc退出0，`renicode-sync-225-window-file-tsc.log`。修后完整Desktop/canonical已启动，结果待收；不能继续用修前274/0代表修后完整suite。
- settings、projection、search-controller、Home projects只增加空行；四文件与staged修前源的**全部非空白字符及Bun生成JavaScript逐字节相等**，证据 `renicode-sync-225-spacing-proof.json`。window另3空行和上述真实读取修正分开，不称它完全保行为。没有在timeline增加算法/运行成本，生产性能门槛不变。
- 独立production fixture build实际退出0：49.27s、PWA2820entries，日志 `renicode-sync-225-keeper-build.log`；静态服务器 `127.0.0.1:4310` 实际HTTP200，六文件keeper以外部production-target运行，2workers/0retries，独立日志 `renicode-sync-225-keepers-static.log`及 `renicode-sync-225-keeper-static-results`；仍待完成通知。App build成功不等于完整CLI/desktop交付构建。
- Protocol完整package实际 **10pass/0fail、17assertions、5files**，`renicode-sync-225-protocol-tests.log`。Client完整suite已启动，结果待收。未改Protocol/HttpApi，不需要因窗口修正重新Client生成。

### 修后整仓检查与Client新增失败

- canonical修后再次真实退出0：**340warnings/0errors、11guide blocks、36/36任务（32cached）**，日志 `renicode-sync-225-check-reviewed.log`。`git diff --check`成功。修后完整Desktop **274pass/0fail、1050assertions、45files、35.70s**，日志 `renicode-sync-225-desktop-reviewed-tests.log`；这才是窗口文件入口修正后的完整suite证据。
- Client完整package真实退出1：**252pass/4skip/1fail/1error、1123assertions、25files、96.34s**。失败 `promise-service.test.ts` 的 “recovers when an unresponsive contender is evicted after a prior failure”，收到内部 “Timed out waiting for the background service to start”；随后同一pending rejection成为between-tests unhandled error。日志 `renicode-sync-225-client-tests.log`。这是夹具通过显式私有registration/child command创建的隔离服务，不是操作真实用户后台。
- 已核对本case使用 `accelerate(Service.ensure)` 内部 promiseTimeout3000ms/requestTimeout100ms、原Bun package5000ms。启动10次局部复现以确认失败性质，**未放宽任何期限、添加skip/retry、修改客户端产品代码或扩大防护/真实服务操作**。局部通过也不能抹除完整suite失败；恢复链与夹具调度根因仍待定位。
- 当前运行命令：六文件生产GUI keeper `renicode-sync-225-keepers-static.log`；Client失败owner10次复现 `renicode-sync-225-client-contender-repro.log`；隔离4310静态服务器持续服务这些keeper。没有性能采样与这些负载混跑，没有完成完整CLI/desktop构建、安全扫描或A/B暂存。

### 实际GUI失败与Client内部预算定位

- 六文件production keeper完成，**162pass/2fail、5.7分钟、2workers/0retries**，日志 `renicode-sync-225-keepers-static.log`。Settings含revision11短query修正及非法scheme keeper本次通过；整个六文件集不是通过。另162项成功不重跑以充数。
- Review diagram zoom/fit case（`review.spec.ts:996`）实际失败于最终rect精确相等：width338/height61/y477.5一致，x初始1030.015625、fit后1030，相差1/64px。尚需判定初次布局测量时机/浮点布局与产品fit契约，不先放宽断言或改产品。独立失败artifact `renicode-sync-225-keeper-static-results/regression-review-diagram--89963-d-fit-it-back-into-its-pane-chromium/`含context、截图、video。
- Terminal窄屏双击未选中tab重命名（`terminal.spec.ts:413`）实际失败于input存在但inactive，10秒focus断言未满足；桌面对应case通过，不等于窄屏通过。新terminal挂载请求focus与tab edit竞态需定位。独立artifact `.../regression-terminal-narrow-0344e-cted-yet-starts-renaming-it-chromium/`，context/截图/video保留。
- Client原owner10次局部复现实际 **5pass/5fail**，均内部3秒预算，日志 `renicode-sync-225-client-contender-repro.log`。外部Temp派生source只增加时间诊断、原产品/原case未改，初诊2/3；细分诊断3/2：PtyHandoff环境读取0–1ms，失败轮原生同步spawn分别887/900/887ms或900/872/828ms，挂起owner终止只2–4ms；第三个spawn返回时已3289/3208ms，超过原3000ms。通过轮同一恢复流程在1447/1454/2918ms返回ready。证据 `renicode-sync-225-client-contender-diagnostic-detail/result-detail.log`，支持真实Windows三次进程创建成本耗尽测试加速预算，而非无证据归为产品恢复死锁。
- 拟仅此非deadline-contract case使用内部10秒总预算、Bun单项15秒，保持requestTimeout100ms/spawnDelay200ms/全部原恢复与identity断言；全局fixture其他case不变、产品默认120秒不变、不增加retry。**此期限变更待用户确认，当前未实施**；原完整失败和5/5复现保留，确认后仍须新owner10次及受影响suite实际验证。
- 上条待确认是历史状态：用户随后明确“批准单项调整（推荐）”，已仅此case实施内部3000→10000ms、Bun5000→15000ms；`accelerate`可选预算默认仍3000ms。原恢复/identity断言、100ms请求期限、其他case及产品120秒预算全部不变，不加retry。批准后原owner连续10次 **10pass/0fail、190filtered、20assertions、28.10s**，日志 `renicode-sync-225-client-contender-approved.log`。原完整失败和5/5复现保留；受影响suite和Client官方tsc待验证，不能以此10/0代替完整suite通过。
- 当前所有check/unit/GUI/诊断命令均已结束，只有本任务隔离4310静态服务器仍运行；没有后台未收测试命令，没有真实服务/profile/防护/活动槽操作。GUI两失败、其余component/后台隔离、原性能及统一构建/安全/A-B仍未完成。

### 单项批准后的受影响验收（接续）

- Client官方 `bun run typecheck:tsc` 已实际退出0，日志 `renicode-sync-225-client-approved-tsc.log`；配置include仅src，因此测试文件本身另由实际Bun suite执行验证，不将tsc表述为测试文件类型全覆盖。完整Client package（覆盖promise-service及fixture的service/service-reconnect消费者）已启动，日志 `renicode-sync-225-client-approved-suite.log`，结果待通知；canonical后续check也已启动，`renicode-sync-225-check-client-approved.log`。
- GUI两失败只在Temp生成诊断副本：原owner的case/全部断言不变，Terminal记录真实focus调用、focusin及调用栈；Review记录SVG及祖先geometry/style/scroll。同一4310生产build，1worker/0retries/每项3次，trace on，证据目录 `renicode-sync-225-gui-diagnostic/`；结果待收。诊断不是新keeper、不是修复通过证据，没有改原spec或renderer源码，也没有性能采样与回归负载混跑。

- 单项批准后完整Client实际退出0：**253pass/4既有skip/0fail、1125assertions、25files、98.23s**，`renicode-sync-225-client-approved-suite.log`。包含promise-service/service/service-reconnect及夹具消费者；不重复这些通过项充数。修后canonical也真实退出0：**340warnings/0errors、11guide blocks、36/36任务、0cached、48.187s**，`renicode-sync-225-check-client-approved.log`。以上检查在后述MobileDrawer产品修正前完成，不作为其修后证据。
- 首组GUI诊断完成 **Review3pass/Terminal2pass1fail**（合计5/1，49.2s）。Terminal失败中Rename的focus调用及focusin均成功，随后约0.7ms More入口按钮迟到恢复focus，再转终端textarea。两通过轮中More恢复在用户双击前完成。指向共享移动抽屉的关闭焦点恢复与后续用户动作竞态，排除本次失败为input未连接或简单终端初挂载抢焦。所有调用栈与trace见 `renicode-sync-225-gui-diagnostic/report.json`和results；没有以诊断副本成功替代原owner失败。
- 最小修正在 `packages/app/src/shell/mobile-drawer.tsx` 的onFinalFocus：先保留调用者回调/防止默认行为；若activeElement已经是抽屉外的非body元素，则取消迟到的自动回焦。仍在抽屉内或body时保留原恢复；没有增加终端专属宿主判断、改重命名断言或期限、添加延迟或重试。App官方tsc已退出0，`renicode-sync-225-mobile-focus-tsc.log`；隔离生产build正在输出到Temp独立dist，origin4320，不覆盖仍提供修前证据的4310/dist。修后keeper尚待构建，不记通过。
- Review增加测量诊断的10次 **10pass**，1worker/0retry，`renicode-sync-225-gui-diagnostic-review/run.log`；测量初始ref后才读祖先，原精确断言仍在。没有复现原1/64px差异，尚不能证实根因或放宽断言。已启动原未修改owner 10次、5workers、trace on/0retry，`renicode-sync-225-review-owner-repro.log`待收；这是压力复现，不是性能数据或补跑放行。
- App完整component suite已在无既有.vite缓存的本工作树启动，独立3294故事服务器、2workers/0retries，`renicode-sync-225-app-components.log`及对应results；含plugin-host/graph、terminal、移动抽屉/composer等受影响入口，结果与optimizer reload数待收。该套为组件回归，不能替代生产GUI/性能/后台代际验证。
- MobileDrawer修后独立production fixture build实际退出0：**34.86s、PWA2820entries**，`renicode-sync-225-mobile-focus-build.log`；Temp独立dist由仅改dist路径的既有静态server副本在4320服务，HTTP200。原4310与修前dist未覆盖，不重启任何真实应用/后台。原未修改窄屏rename owner在4320跑10次、5workers/0retry/trace on，`renicode-sync-225-terminal-focus-owner.log`结果待收；canonical修后 `renicode-sync-225-check-mobile-focus.log`待收。
- 原Review owner压力复现10次实收 **10pass/0fail、5workers/0retry、32.4s**，`renicode-sync-225-review-owner-repro.log`。源码/精确rect断言未改，仍无法重现或证明初轮1/64px根因；不因补跑通过取消原162/2中的Review阻塞。
- MobileDrawer修后canonical实际退出0：**340warnings/0errors、11guide blocks、36/36（34cached）、4.313s**，`renicode-sync-225-check-mobile-focus.log`；`git diff --check`通过。修后窄屏owner10次、App完整components仍待收；另外四个受影响生产keeper文件（terminal完整、mobile-model-pickers、mobile-plugin-drawers、mobile-session-options）2workers/0retry已启动，`renicode-sync-225-mobile-focus-affected.log`，覆盖默认Escape回焦、模型/variant选择、嵌套插件返回和全部终端行为，不视为重复旧162通过项充数。
- 上条4320新静态server存在本次夹具失误：dist由native `path.resolve`变成带正斜杠的字符串，Windows target.startsWith边界比较永远不匹配，导致脚本资源404。4320 owner10次真实 **0pass/10fail**，全部在openSession的页面就绪断言前失败、未到重命名；日志/artifact保留，不能记为产品修后失败或通过。已启动的四文件4320 suite同受影响，尚待结束通知，不靠重试或改期限处理，不覆盖该日志。
- 修正仅Temp静态server dist表达式保留 `path.resolve(absolutePath)`，另在4321启动，不关闭/重启4320、原4310或真实应用/后台。复用同一已完成production dist；生产getCurrentServerUrl明确返回location.origin，故不需要因端口重建。4321 index HTTP200且入口JS **HTTP200、text/javascript、6877bytes**，此次同时核对静态资源而非只查HTML。窄屏原owner新的10次/5workers/0retry/trace on在4321运行，`renicode-sync-225-terminal-focus-native-owner.log`结果待通知。
- 4321原四文件受影响suite也已运行，2workers/0retry，独立日志 `renicode-sync-225-mobile-focus-native-affected.log`及results，结果待通知。当前待收仅App完整component suite、4321窄屏owner10次、4321四keeper及4320错误夹具四keeper终止结果；Client/check/tsc/build和Review诊断/压力复现均已结束。没有性能采样、统一CLI/desktop包、安全扫描、真实profile迁移或A/B暂存。
- 4321窄屏原owner已实收 **10pass/0fail、5workers/0retry、24.4s**，`renicode-sync-225-terminal-focus-native-owner.log`。保留双击后立即及第二个terminal连接后两次focus断言；修前正式162/2及诊断Terminal2/1负向证据不删除，4320页面启动0/10单独归类夹具错误。共享MobileDrawer改动通过此owner，不重复覆盖或削弱终端case。剩余待收App完整components、4321四keeper以及4320错误夹具四keeper终止结果；Review原失败、性能/后台代际/安全/统一构建/A-B仍阻塞。
- 4321四文件受影响生产keeper已实际 **47pass/0fail、2workers/0retry、2.1m**，`renicode-sync-225-mobile-focus-native-affected.log`。覆盖terminal完整、mobile-model-pickers、mobile-plugin-drawers和mobile-session-options；Escape默认回焦、模型/variant选择后的回焦、嵌套抽屉返回、窄屏rename两次focus及cancel/Enter均通过。此结果与窄屏owner10次分别记录，不相加为独立合同数量；原六文件162/2及错误4320批次仍保留。App完整components和4320错误夹具批次仍待完成通知；Review原失败、后台代际/性能/统一包/安全/A-B门禁仍未完成。

### 完整组件与两项失败根因诊断（接续）

- App完整component冷启动实际 **220pass/0fail、2workers/0retry、7.5m**，`renicode-sync-225-app-components.log`。完成日志未见依赖重新优化/full-reload/Outdated Optimize记录；仅PowerShell原生stderr包装，不是产品错误。完成后的`.vite`缓存移到 `renicode-sync-225-app-components-vite-cache`保留，SessionUI完整component在新的冷缓存/3295端口/2workers/0retry启动，`renicode-sync-225-session-ui-components.log`，仍待完成通知，不轮询。
- Server完整隔离HOME/XDG suite实际 **107pass/8skip/1fail、6040assertions、40files、84.55s**，`renicode-sync-225-server-suite.log`。失败为原 `schedule.test.ts:180` 双Server leader case的marker ENOENT；原5秒预算未改。8项是实际skip，未以诊断补跑抵销初轮失败。
- 仅Temp schedule诊断副本打印current、保持原断言/期限，再次 **0pass/1fail**，`renicode-sync-225-schedule-diagnostic/run.log`：current已经done/lastOutcome=checked/runCount=0，但marker缺失。直接调用生产 `ShellSelect.resolve({ priority: "compat" })`及`ShellSelect.args`执行原命令，实际选择Windows PowerShell5.1，stderr明确 **`The token '&&' is not a valid statement separator in this version.`**、exit1、无marker；证据 `renicode-sync-225-shell-command-evidence/result.json`。因此原命令未执行写文件，不能以done/checked证明一次执行，也不是deadline失败。
- Temp派生portable诊断只将同一检查换成 `bun schedule-check.cjs`，脚本在原dir向runs.txt追加`x\n`并exit1；原双Server启动、原恰好一行x断言、done断言、5秒预算不变。实际 **1pass/0fail、2assertions**，`renicode-sync-225-schedule-portable-diagnostic/run.log`。此为夹具方向的支持证据，正式源码尚未改、Server完整失败尚不解除。
- Review产品既有slow=1/speed=0.25慢动作诊断真实 **0pass/3fail**，`renicode-sync-225-gui-diagnostic-review-motion/run.log`及无损保留原日志/trace。初始x1030.390625/1030.375等，fit后1030；width338/height61/y477.5不变。全祖先单次补诊断 **0pass/1fail**，`renicode-sync-225-gui-diagnostic-review-ancestors/run.log`：初始整条祖先x一起偏移，review内容width704、容器/aside width703.65625、right固定1431；translate均none。产品 `screen.tsx` 的sideMotion.paint正在用chat.width的calc推进面板边缘，`panelOpacity`在飞行绝大多数时间已为1，不能拿computed opacity1当落位。
- Temp Review readiness副本仅在初始boundingBox前轮询既有session-side-panel-content的inline opacity清空；产品paint只有closed=0清除此飞行paint值。保留原精确rect、所有zoom/fit断言、原10秒assertion/60秒case期限/0retry，仍用慢动作主动复现；`renicode-sync-225-review-readiness-diagnostic/run.log`待完成通知。无新增产品测试信号、sleep或放宽精度，正式Review spec和Session产品未改。
- 错误4320四文件批次已收到执行器 **600000ms超时、未完成** 通知；没有完整suite统计，不能补记0/47或成功，不加外部期限续跑。原资源404失败日志/artifact保留，正确4321独立47/0记录不覆盖它。当前待收SessionUI component及Review readiness诊断；尚无统一CLI/desktop包、安全扫描、真实profile迁移、活动槽覆盖或A/B暂存，也无新增提交/推送。
- SessionUI完整component冷启动实收 **177pass/0fail、2workers/0retry、5.3m**，`renicode-sync-225-session-ui-components.log`；完成日志没有optimizer重新优化/full-reload/Outdated Optimize记录。与App220/0分别证明各自拥有的组件合同，不复制keeper或将此当生产benchmark。
- Review慢动作下Temp readiness诊断实收 **3pass/0fail、1worker/0retry、53.9s**，`renicode-sync-225-review-readiness-diagnostic/run.log`；原0/3及祖先0/1完整保存。支持原初始boundingBox采在面板尚未落位的夹具就绪缺口，而非Fit修改了SVG尺寸：仅增加落位等待后，原exact rect全部相等。正式Review spec尚未改。拟仅该case在采reference前等待既有inline飞行paint清空；产品Session布局、原所有zoom/fit精确断言及10秒/60秒期限不变。
- 拟另仅Server leader case将不兼容PowerShell5.1的POSIX `printf ... && false`换成真实Bun子脚本向相同marker追加一行x并exit1，仍经生产ShellSelect/Spawner、双Server同DB竞争、原done及恰好一行x断言和原5秒预算。正式Server case尚未改。两个最小夹具方向已分别有修前失败/Temp修后通过证据，确认后仍需正式owner10次、受影响Review/Server suite和checks；Temp通过不解除正式失败或性能/代际/安全/统一构建/A-B门禁。
- 上条拟议随后获用户明确“**批准两处最小修正（推荐）**”。已应用到正式Review与Server两个owner，仅readiness/命令夹具变化。原所有结果断言、预算及产品不变；没有复制诊断logging进入正式测试，没有新增产品测试缝隙。正式Server leader10次 `renicode-sync-225-schedule-approved-owner.log`、完整Server `renicode-sync-225-server-approved-suite.log`（隔离HOME/XDG，原5秒）、Server官方tsc `renicode-sync-225-server-approved-tsc.log`已启动。Review慢动作wrapper只直接import正式owner（无复制断言），10次/5workers/0retry/原slow旋钮，`renicode-sync-225-review-approved-motion/run.log`；完整Review生产keeper `renicode-sync-225-review-approved-suite.log`在4321/2workers/0retry也已启动。canonical `renicode-sync-225-check-fixtures-approved.log`结果待通知。所有初轮失败仍保留；这些是测试负载，不同时采性能、不写实时profile或槽位、不强关重启应用/后台。
- 正式Review owner在既有slow旋钮下连续10次实收 **10pass/0fail、5workers/0retry、1.9m**，`renicode-sync-225-review-approved-motion/run.log`；wrapper直接import正式spec，原exact rect不变，足以支持readiness修正后的主动竞态回归，仍待完整Review keeper。Server官方tsc实收退出0；正式Server leader10次却 **5pass/5fail、17assertions、101.33s**，`renicode-sync-225-schedule-approved-owner.log`及readable副本。原5秒期限的多个timeout，另有marker ENOENT和current仍active的晚到错误；不能把这些异步尾部错误机械相加为新的独立case数量。此批与完整Server/Review/check并行，尚未测出分段成本或确认调度根因，不以“负载”直接免责、不加budget/retry。跨shell命令修正解决已证实的PS语法问题，但Server仍阻塞正式验收。
- 为正式Review新增的一行readiness另启动App `typecheck:e2e`，`renicode-sync-225-review-approved-e2e-tsc.log`待收；检查本身不是已通过，需逐项对账既有diagnostics，不能用产品tsc替代测试文件检查。最新 `git diff --check`通过。
- 完整Review正式production keeper实收 **29pass/0fail、实际1worker/0retry、3.3m**，`renicode-sync-225-review-approved-suite.log`。命令workers2，但单文件默认不fullyParallel，实际只1worker；不表述为两worker并行覆盖。结合正式慢动作owner10/0，原图表就绪阻塞有修前负向/修后原断言成功证据；原162/2保留不改写成162/0。
- canonical实收 **340warnings/0errors、11guide blocks、36/36（31cached）、65.552s**，`renicode-sync-225-check-fixtures-approved.log`。Server完整新suite实收 **103pass/8skip/5fail、6038assertions、40files、168.15s**，`renicode-sync-225-server-approved-suite.log`。五失败为artifact原5秒timeout、三项OpenAI OAuth callback原2秒Effect期限、Session instance pending request原2秒期限；leader在完整suite未报fail（只打印失败），但不能以这次单项通过抵销正式owner5/5失败。五项与leader5/5各自保留，继续阻塞Server，不机械加总异步错误或扩大期限。
- App官方E2E类型首检实际退出2且有 **2处diagnostics**，并不是旧skill所述4项：composer.spec.ts Go provider fixture的`default.build`旧catalog格式、settings.spec.ts未用Match。新Review行无diagnostic。仅残留同步修正为原同一模型身份 `{ providerID: "opencode-go", modelID: "glm-5-go" }`、移除未用import；原Go tray/picker/Settings所有结果断言与期限不变，没有改产品catalog或默认模型算法。新 `renicode-sync-225-e2e-tsc-residuals-fixed.log` 与Go原两case生产owner `renicode-sync-225-go-catalog.log`已启动，结果待通知。
- 新Temp Server分段诊断只打印seed-start/seed-disposed/boot-start/boot-ready/first-status/marker-read/asserted时间与实际current，保持正式owner原命令/双Server竞争/原5秒预算及所有断言；3次 `renicode-sync-225-schedule-timing-diagnostic/run.log`待收。它不放宽预算，不用诊断成功覆盖正式10次5/5或完整103/8/5失败。当前后台测试仅此诊断、Go两case和App E2E类型检查；正式Review/Server/check/Server官方tsc均已完成。性能、后台五迁移完整升级回退、统一包、安全验收、实时profile迁移/A-B仍未完成。
- 残留修正后App官方 `typecheck:e2e`实收退出0，`renicode-sync-225-e2e-tsc-residuals-fixed.log`；Go tray/picker原两case实收 **2/0、实际1worker/0retry、18.3s**，`renicode-sync-225-go-catalog.log`。模型身份仍opencode-go/glm-5-go，所有原断言/期限未动；未再次重复完整Settings（此次只删未用import）。最新canonical `renicode-sync-225-check-e2e-residuals-fixed.log`已启动，仍待通知。
- Server分段诊断3次实收 **3/0、6assertions、11.50s**，原5秒budget未改。第一轮seed scope直到dispose耗2806.43ms、boot-ready3045.17ms、marker/assert完成4404.90ms；后二轮seed-disposed533.61/515.99ms、boot-ready759.15/733.89ms、原断言1950.83/1937.57ms完成，marker均只有一行x。支持cold seed成本占掉大部分单项5秒窗口，但未在这3次重现5/5中的timeout，不能由成功诊断宣称正式10次通过或直接认定无调度缺陷。此轮没有并行完整suite，仅Go两case/e2e tsc轻负载；该背景与此前重负载明确区分，不能覆盖原失败。
- 源码核实新完整Server三OAuth失败在test helper `connectOpenAI`等待plugin integration出现的 **2秒Effect readiness期限**，Session instance的同类2秒等待也未满足；不是已经证明产品OAuth重试期限错误。五失败仍待原owner定位与成本证据，未扩大测试或产品期限、未skip/retry。当前没有未收测试，只有最新canonical待通知及本任务隔离静态服务；未执行性能采样、完整CLI/desktop统一包、安全扫描、五迁移完整隔离升级回退或A/B暂存/激活。
- 最新canonical实收退出0：**340warnings/0errors、11guide blocks、36/36（34cached）、5.274s**，`renicode-sync-225-check-e2e-residuals-fixed.log`；最新`git diff --check`退出0，仅LF/CRLF提示。全部本轮测试/诊断/check命令已完成，没有待收后台测试；保留独立静态服务器和原工作树，不重启/关闭真实应用或后台。Review/组件/E2E类型门槛已收齐，Server正式leader5/5与新完整103/8/5仍是当前阻塞，不能称本轮整体通过；下一步优先原Server owner分段定位，再做完整隔离五迁移/profile升级回退、串行性能、统一包/安全/A-B，未执行这些后续步骤。

### Server 就绪契约与目录负载诊断（重启后接续）

- Harness重启通知使本任务隔离4310静态server取消，4320/4321临时server分别退出4；没有重启真实桌面/后台，也没有因通知重跑已通过Client/Review/组件/类型验收。此前“静态服务仍保留运行”是当时状态，不再代表当前状态。正式Server未通过历史保持。
- Temp `renicode-sync-225-server-readiness-diagnostic/` 仅从正式fetch/artifact owner解析绝对imports并为ServerFetch.make加请求计时包装，保留原所有断言、轮询间隔、2秒Effect readiness、5秒默认期限及既有both-ports单项10秒期限。计时日志只记路径、状态与OpenAI方法/Agent权限身份，不采授权URL或凭据；读取catalog使用response.clone，存在诊断额外开销，不能作为生产性能样本。源码及日志/压缩身份summary.json均保留。
- 首次过滤实际选中 **4个case，各3次，共12pass/0fail、159assertions、22.30s**，`run.log`：两OAuth case、Session instance及artifact。过滤里的第三OAuth文字与正式名不符，没有选中，不能写成五case15/0。另按正式名 `explains how to recover when both OpenAI OAuth callback ports are busy` 独立诊断 **3/0、9assertions、14.49s**，`oauth-both-ports.log`，保留原单项10秒及helper2秒；其真实callback重试约3659ms，不能缩短产品重试来过测试。
- 首个integration请求约1206.54ms、warm约596–691ms，返回时chatgpt-browser方法已存在，每轮只发一次catalog请求；Agent请求约392–455ms，一次返回build的shell/*/ask规则。artifact先在fetch后执行是warm，scope约728–807ms；另以新隔离profile/新Bun进程单独artifact冷诊断 **3/0、66assertions、3.59s**，`artifact-cold.log`，没有重现原5秒timeout。这些是根因调查，均不抵销正式leader5/5或完整103/8/5。
- 固定v2.2.5源码核实 `handlers/integration.ts:57`直接await Plugin.awaitActivation，`handlers/agent.ts:12`经awaitPlugins等待同一激活（该服务端guard为5秒）；它们与固定官方commit的git diff为空。故fetch helper中“Catalog endpoints no longer wait for plugin initialization”注释在该基线已过时：外层2秒retry范围包含首次真实Location启动/插件激活，并不是只等待HTTP返回之后的目录补齐。没有删除该helper或扩大其期限，也没有改产品服务端guard。
- ModelsDev既有公开Options包含snapshot；`fetch:false`只禁网络、仍加载多MB捆绑目录。Temp另一派生 `renicode-sync-225-server-minimal-catalog-diagnostic/` 仅给fixture的models增加既有 `snapshot:false`，保留全部真实内置插件、OpenAI监听/重试、Agent权限、artifact本地/plugin提供方、双Server同DB与Bun检查命令及所有原期限/断言，选六case各3次运行中，`run.log`待通知。此为隔离目录工作量方向的诊断，正式owner尚未改models配置；不以小目录成功替代原生产目录性能/升级门禁，也不把重负载历史直接归为环境免责。
- Temp最小目录诊断实收 **18pass/0fail、174assertions、六case各3次、63.64s**，`renicode-sync-225-server-minimal-catalog-diagnostic/run.log`；原阶段JSON单独保存 `stages.json`。leader seed-disposed106.36/149.00/149.24ms、boot-ready277.49–335.98ms、原恰好一行x及done断言999.36–1051.29ms完成；此前完整目录分段diagnostic的seed516–2806ms/assert1938–4405ms是另一批时点/负载，不是严密同负载A/B比例，不能宣称确定性能改善或根因已排尽。integration首请求990ms、warm521–569ms，Agent首349.63ms；目录禁用后仍跑全部真实内置插件及原OAuth retry，未mock或减少核心结果断言。
- 正式拟议只能限定三个owner文件中的这六case（artifact1、fetch OAuth3/Session instance1、leader1）的既有models选项；不能把fetch共享options或startServer共享fixture全局改成小目录而影响其他合同。完整模型目录的测试与生产性能门槛仍保留。当前仅外部诊断已实施、正式文件无此改动，未删除旧2秒helper或扩大任何期限；18/0不解除正式5/5或完整103/8/5失败。所有当前诊断均已结束，无待收后台测试，三个隔离静态server已结束；真实程序/profile/槽位及安全防护未操作，无新增提交/推送。
- 上述限定模型目录夹具获用户明确“**批准限定六 case（推荐）**”。已只在artifact/fetch/schedule三个正式owner中的六case配置snapshot:false，保持fetch共享options及通用startServer不变；没有改helper2秒、Bun默认5秒/both-ports既有10秒、原检查循环、结果断言或产品。正式六case各连续10次已启动，绝对Junit `renicode-sync-225-server-catalog-approved-owner.xml` 与独立日志 `renicode-sync-225-server-catalog-approved-owner.log`，通过原隔离HOME/XDG runner执行。此轮暂不并行完整suite/GUI/性能采样，先测原owner实际结果；结果待通知，不提前称60/0。后续仍需受影响完整suite/官方check及原性能/代际/安全/统一包/A-B门禁。

### 限定六 owner 正式实收与 OAuth listener 阻塞

- 接续获用户明确“**批准最小解绑修正（推荐）**”。已仅改openai.ts的bind：命名本次error/listening回调，成功/错误主动cleanup，返回Effect.sync(cleanup)供中断清理，server.listen仍原端口/localhost；仅off自身两个回调。正式both-ports owner承接Temp局部warning资源断言，acquireRelease卸载process监听，原三结果断言及helper2秒/case10秒保持。没有公共API变化、无需Client generate，没有改邻近其他provider。正式owner连续10次执行中，`renicode-sync-225-oauth-listener-owner-after.log/xml`待通知；修前0/1保留，不提前称修后通过。
- 修后正式both-ports owner连续10次实收 **10pass/0fail、40assertions、50.31s**，XML排除120 filtered后确认恰好10次，同类warning0条，`renicode-sync-225-oauth-listener-owner-after-summary.json`。原三恢复结果断言与新增资源断言共同通过；这不是中断路径的独立覆盖证明。Core既有provider-openai/context-caps两文件 **9/0、72assertions、3.67s**，没有新增重复keeper；Core与Server官方tsc均退出0。三个callback case各10次及随后串行完整Server已启动，canonical另启动，均待完成通知，不以待收项目放行。
- listener修后canonical实收退出0：**340warnings/0errors、11guide blocks、36/36（30cached）、19.36s**，`renicode-sync-225-oauth-listener-check.log`；sdk-docs258 declarations/964 members/289 parameters、21files、0problem。此日志已重新核验guide数量；callback/full Server仍待结束通知，不将其视为完成，其他交付门禁不变。
- 接续callback正式三case各连续10次实收 **30pass/0fail、120assertions、79.28s**；随后串行完整Server **108pass/8既有skip/0fail、6068assertions、116tests/40files、77.06s**。对应 `renicode-sync-225-oauth-listener-callback-after.log/xml`、`renicode-sync-225-oauth-listener-server-after.log/xml`；XML排除filtered节点确认callback恰好三case各10次、完整实际执行108，两个日志MaxListenersExceededWarning均0，汇总 `renicode-sync-225-oauth-listener-regression-summary.json`。按实收记录6068，不沿用先前6137断言数；产品只改bind清理，原结果断言未删除或放宽。与修前资源断言0/1、修后owner10/0、Core9/0、Core/Server官方tsc及canonical共同收齐本项验收；不额外宣称未单独覆盖的中断路径已有证明。
- 本轮listener测试/check均已结束，无未收后台测试。listener资源回归阻塞已解除，所有旧失败及20/2条warning证据保留；整体同步仍未交付放行。接续五迁移与独立profile的合成升级/重启/回退、必要Core/CLI回归、串行生产PTY七场景、统一构建、资源/ASAR/hash、安全扫描、隔离运行及A/B暂存尚未完成。不使用旧报告冒充2.2.5成功；未新增提交/推送、真实服务操作或实时profile迁移。

### 五迁移与独立 profile 源码运行验收（接续）

- Temp新建 `renicode-sync-225-upgrade-prepare.ts` 从保留的旧升级harness生成独立 `renicode-sync-225-upgrade-e2e.ts`，原脚本/报告不覆盖。旧CLI取原opencode-align源码，新CLI取renicode-sync源码；运行时版本为local，单独记录packageVersion/entry和migration.gen SHA256，明确sourceRuntime=true、packagedRuntimeVerified=false，不冒称新版统一包已生成或运行。生产cold-copy与drafts迁移逻辑直接从当前源码导入，不改产品或测试缝隙。
- 仅Temp合成source/backup/candidate/restored desktop代际及外部合成workspace，HOME/XDG/USERPROFILE/TEMP/DB/config明确隔离，过滤继承OpenCode/Renicode overrides与provider凭据。私有CLI仅serve --stdio/127.0.0.1/port0，随机测试密码，不连接选举服务；禁模型fetch及项目/Claude配置，prompt均resume:false/delivery:queue，无模型调用。正常关闭stdin要求exit0；原harness的60秒启动/15秒测试子进程清理上限保持，只作用其自身合成子进程，不作用真实程序。
- 保留旧harness全对象export/inbox、非空历史附件、archive、active为空、升级后读写、新版重启及备份回退旧版读写断言。新补生产prepareGeneration分别生成backup/candidate/restored（正常停止、SQLite/claim/逐文件hash门禁不绕过），要求journal仅新增固定五迁移、legacy completed shell job从KV导入且旧job.background键清除、无关KV保留、新增表/字段、source backend/drafts字节不变及candidate draft一致。此仅当前合成场景，不代替完整packaged/guardian/PTY性能验证。
- 已从packages/cli启动独立源码运行，`renicode-sync-225-upgrade-e2e-first.log`待完成通知；每次资产根唯一，失败report与子进程日志保留。未运行真实launcher/deploy或读取复制实时profile，未扩大迁移/激活授权。
- 首轮实收退出1，资产 `renicode-sync-225-upgrade-1793777610137/report.json` status=failed/phases为空，错误old-seed exited before listening。旧CLI源码packageVersion实际 **2.2.0**，不是按旧发行包称2.2.2；源码migration.gen hash记录仍为54项基线。旧合成log只到cli starting，stderr为空，未生成后端库、未启动新版或执行五迁移。首轮脚本没有记录退出码/60秒deadline触发，故不把原因认定为转译成本或产品异常；没有重复修改产品、扩大期限或使用旧成功覆盖失败。
- 另生成 `renicode-sync-225-upgrade-e2e-observed.ts`，原首轮脚本/日志/资产保持。仅增加启动deadline及退出码/elapsed记录，并采用现有CLI fixture惯例的共享 `Temp/opencode/opencode-test-transpiler-cache`（每个profile/XDG/DB仍隔离）；不增加retry，不扩大60秒启动/15秒清理/30秒请求期限，不减少任何原升级断言。新独立执行 `renicode-sync-225-upgrade-e2e-observed.log`待通知；只能支持诊断与候选fixture方向，不能抵销首轮失败或视为packaged验收。
- 观测轮退出1，`renicode-sync-225-upgrade-1793777790122/report.json`明确old-seed在60000.38ms触发启动deadline，其自身合成PID4844被harness终止，60007.92ms收exit143；stderr为空、尚无cli log/后端库。不是自然退出、不是正常退出验收或新版migration失败。共享转译缓存未解决，不能认定原失败是冷缓存或提高期限；两失败保留，所有测试子进程均已结束。
- 进一步Temp `renicode-sync-225-cli-import-probe.ts`只在自己的测试子进程打印loader/preload-ready/entry-import-start/returned阶段，先动态加载既有preload，再把自身argv设为原serve参数并导入原未改CLI entry。另生 `renicode-sync-225-upgrade-e2e-stages.ts`保留原观测与全部升级断言/期限，按完整stdout行记录阶段；此是分段诊断，不替代原直接CLI启动验收，不改产品或真实进程。`renicode-sync-225-upgrade-e2e-stages.log`执行中待通知，观察是否卡preload/entry/后端；五迁移与profile回退仍未完成。
- 阶段loader实收退出0，资产 `renicode-sync-225-upgrade-1793777976576/report.json`：preload约293–315ms，旧entry首导入4558ms、新entry首导入26408ms，warm新/旧entry约1086/1003ms；这是导入阶段时点，不是完整启动性能样本，不能定位此前direct CLI冷失败的确定根因。四个测试后台正常exit0；journal54→59且仅固定五项新增，export/inbox/非空历史附件/archive/升级读写/restart/旧backup恢复读写、legacy job导入与KV清理/无关KV保留及SQLite/源hash断言全通过。独立 `verified-summary.json`复核source backend/drafts、candidate/restored drafts哈希均与停止点一致。明确sourceRuntime=true/packagedRuntimeVerified=false；诊断模式成功不替代直接入口。
- 随后原observed直接入口脚本**未修改**、新独立root复核实收退出0，`renicode-sync-225-upgrade-e2e-direct-after-stages.log`、资产 `renicode-sync-225-upgrade-1793778116744/report.json`：四测试后台正常exit0、全部原升级/重启/回退断言与五migration/profile/job/hash断言通过。此为阶段诊断后共享cache已热的直接入口证据，不是同负载冷/暖A-B，不能抵销首两次60秒失败或声称旧源码冷启动问题已解决。源码层合成迁移/数据保留/代际回退功能已获得正向支持；最终统一包还须真实packaged/guardian验证，启动性能门禁保留，不自动放行。
- 当前本批全部源码升级脚本结束，无未收后台测试；所有资产仅Temp合成数据，模型调用0。没有修改旧/新CLI产品入口或扩大原期限，没有读取复制实时profile、关闭真实服务、运行部署/launcher、提交推送。后续必要Core/CLI回归、串行持久PTY生产七场景及统一包/安全/packaged/A-B仍待收。
- 随后独立复核直接入口warm资产 `1793778116744/verified-summary.json`：journal54→59、四exit0、source backend/drafts及candidate/restored drafts哈希全部一致。启动新版完整CLI suite，Temp原隔离runner按CLI既有默认30000ms运行（不是Server5秒或新增预算），HOME/XDG/TEMP与provider凭据隔离、RECORD=false，`renicode-sync-225-cli-full.log/xml`待通知；不并行采生产性能样本。
- Core既有database-migration/schedule/tool-schedule/job四文件按原script/test.ts（30秒默认）实收 **85pass/0fail、369assertions、2.52s**，`renicode-sync-225-core-schedule-job.log/xml`。日志中migration="failing"/Error("stop")为既有回滚负向case主动注入，整个suite退出0，不误当产品迁移失败或隐去它；没有改产品/测试期限/断言。当前仅CLI完整suite待收，其他门禁保留。
- CLI首次完整实收 **348pass/15既有skip/1fail、1359assertions、364tests/54files、216.22s**，`renicode-sync-225-cli-full.log/xml`，退出1。唯一失败是原debug-paths owner的config路径：Temp runner设置OPENCODE_CONFIG_DIR到私有全局目录，而该owner仅覆盖XDG_CONFIG_HOME，既有产品Global.layerWith优先使用OPENCODE_CONFIG_DIR，故原期待的case目录被runner覆盖。diff中额外tmp/db并非toMatchObject失败原因，真正差异是config；不误称字段新增需要放宽断言。这是本次外部runner夹具错误，不改产品或正式owner，不把整suite写成通过。
- 新独立 `renicode-sync-225-cli-suite-xdg.ts`只把runner的OPENCODE_CONFIG_DIR设undefined，仍以私有XDG_CONFIG_HOME/HOME隔离；删除的是测试启动器自加的覆盖值，不移除产品/用户配置，真实profile不访问。原runner/失败日志保持。原debug-paths case连续10次→随后完整CLI已启动，日志 `renicode-sync-225-cli-xdg-owner.log/xml`、`renicode-sync-225-cli-full-xdg.log/xml`待通知；保持原所有断言/30秒CLI默认，不加retry/skip或修改测试目录。性能采样与统一构建/安全/A-B仍未执行。
- 修正外部runner后原debug-paths case连续10次实收 **10pass/0fail、40assertions、23.36s**；随后完整CLI **349pass/15既有skip/0fail、1361assertions、364tests/54files、192.86s**，退出0。XML排除filtered/skipped确认owner实际10次、完整实际349，汇总 `renicode-sync-225-cli-xdg-summary.json`；产品/正式owner/原30秒期限均未改。原348/15/1失败保留且原因明确为外部覆盖优先级，不当上游产品修正。日志远程pair警示为既有提示/拒绝路径测试输出，不表示启用了用户真实远程服务；没有改变真实配置。
- 当前CLI/Core/Server/源码升级等本批全部命令已完成，无未收后台测试。功能回归及合成五迁移数据保留已有正向证据，但原源码冷启动60秒失败及最终生产性能/统一CLI+desktop构建/资源ASAR哈希/安全扫描/packaged guardian/A-B门禁继续保留。下一步准备新版production性能harness，采样只在无并行测试负载时串行运行；未运行部署、迁移实时profile、强关真实程序或提交推送。

### 新版生产性能：独立构建与七场景（2026-11-04）

- 外部 `renicode-sync-225-performance-prepare.ts`生成独立资产 `Temp/opencode/renicode-sync-225-performance-1793778902255`，新版production fixture构建退出0（Vite23.27s），保留sourcemaps、build.log与manifest；Sentry上传凭据未继承，未覆盖旧冻结产物、项目dist或任何槽位。仅源码web生产包，不冒称最终CLI/desktop统一包。
- 原Home500/5000/10000、10000条Home20背景更新、text projection40mixed/320mixed/320tool-heavy七场景沿用当前两个spec与原断言/期限，Chromium/1worker/0retry/no explicit GC。原始context/metrics/frames/emitted保留；场景/helper源hash与旧align源差异另记inputs.json，历史单样本与新版不冒称严格A/B或趋势。
- 首轮 `seven.log`/`seven-exit.json`退出1：Playwright静态server子shell无法解析bare bun，尚未开始任何场景；不是生产build或真实后台启动失败。失败资产保留。仅新外部 `seven-absolute.config.ts`使用已安装Bun绝对路径，并生成独立seven-absolute日志/results/report/traces；场景/产品/期限不改，无重试。新一轮串行采样执行中待通知，不并行构建或其他测试。
- 原Home spec的interaction trace未实际调用startTrace；因此原样时间采样不会产生Home raw Chrome trace。另准备外部诊断副本，imports重绑同一当前源码、只将traceScope设page，保留原场景断言与期限；这四份opt-in详细trace将另存并标识profiler开销，不能混入原时间样本或宣称不存在的trace已收齐。原投影spec已有interaction startTrace。
- 持久PTY三工作量仍待适配；原SerializeAddon与产品probe已由上游删除，不恢复它们或增加产品测试接缝。原12000行ANSI/native ConPTY输入和visible/hidden/full-scrollback-teardown工作量保留，新的传输/保留边界必须明示，不能以旧serialize指标冒充新持久PTY性能。
- 绝对路径配置实收 **7pass/0fail、44.8s、1worker/0retry**，原七场景/spec/断言/期限全部未改；`seven-absolute.log`、`seven-absolute-report.json`、`seven-absolute-exit.json`与完整 `seven-absolute-records.json`保存每个context/metrics及投影frames/emitted完整数组。`inputs.json`的七个场景/helper/measurement源文件与旧align工作树**SHA256全部相同**；fixtureVersion/输出工作量也一致，但时间戳、浏览器执行环境/新版应用源码及历史采样日期不同，仍不是严格A/B。
- 外部审计 `seven-absolute-audit.json`退出0：实际7个唯一scenario、全部status passed/retry0/repeat0、进程exit0；三投影raw Chrome trace均可解析、traceEvents非空，记录bytes/SHA256/event count。Home500/5000/10000仍分别1/1/2列表请求、12目录/64可操作行；20背景更新仍23sessionReads。投影仍82/642/642messages、61/472/2392parts、85374/658569/2592009历史字节、160deltas、rowReplacements0；counters=false/no explicit GC。结果仅完成与指标收集，不新增机器依赖阈值或据此宣布速度/内存优化。
- 本次Home rowsMs约312.60/440.40/572.80；20更新median35.10ms/P95 37.80ms。投影initialReadyMs约641.74/6478.03/807.77，流后readyMs约5029.50/5035.00/4980.20。助手最初口头把320mixed的6.48s与另一批较短历史样本比较，称明显高于旧单样本；核对本次实际对应的20261102冻结基线后**当场更正**：旧320mixed initialReadyMs约7660.50，本次6478.03，不能声称已发现新退化，也不能用两个单样本宣布改善。原始数据与这次比较失误均保留；initialReady含fixture/setup/页面/首markdown就绪，不当纯投影CPU耗时或源码冷启动根因证据。
- Home opt-in诊断另轮实收 **4pass/0fail、18.1s、1worker/0retry**；原生产bundle不改，仅外部副本imports重绑同一源码/traceScope interaction→page，所有原断言与期限不变。`home-trace.log`/report/exit、`home-diagnostic-records.json`完整保存，`home-diagnostic-audit.json`确认四trace均可解析/非空并冻结SHA256/bytes/event count；这些page-lifetime trace与七场景原样时间记录分开，不把profiler开销混成原样A/B。现在三投影interaction trace＋四Home独立诊断trace已齐。
- 本轮两次正式采样与诊断均已结束，Playwright所属测试静态server随其退出；无未收后台任务。只生成外部Temp harness、独立production产物与原工作树验收文档，没有改本轮应用/Protocol/HttpApi源码、真实程序/profile/活动槽、防护或提交推送。七场景完成与原始证据收集已落实；持久PTY三场景、原源码CLI冷启动未解历史、最终统一CLI/desktop构建、ASAR/hash/安全、packaged/guardian与A/B仍未收齐，不能提前交付。

- 正式六case各连续10次实收 **60pass/0fail、580assertions、127.52s**。Junit总170包含110 filtered/skipped，实际执行60；按XML的skipped节点排除后 `renicode-sync-225-server-catalog-approved-owner-verified-summary.json` 确认六case各10次。早先 `owner-summary.json` 将空skipped元素错误纳入，保留但不作为证据。所有原期限及断言保持，未增加retry；60次日志另有20条MaxListenersExceededWarning，不能忽略。
- 随后完整Server实收 **108pass/8既有skip/0fail、6137assertions、116tests/40files、55.83s**，`renicode-sync-225-server-catalog-approved-suite.log/xml`；另外2条同类listener warnings。Server官方tsc退出0；canonical退出0，**340warnings/0errors、36/36（33cached）、17.139s**，`renicode-sync-225-check-server-catalog-approved.log`（此日志guide数量尚未重新核验，不沿用上一轮数字）。这些支持限定夹具回归通过，不抹除原leader5/5、完整107/8/1与103/8/5，也不解除资源/性能/代际/统一包/安全/A-B门禁。
- 原both-ports owner独立trace **1/0、3assertions**，`renicode-sync-225-server-warning-trace.log`，warning调用栈为Node once → node:_http_server:407 → `packages/core/src/plugin/provider/openai.ts:152`。真实绑定重试时，失败只通过error回调resume，不移除listen注册的once listening回调；同一Server累计到11触发警告，不是诊断包装产生。
- Temp仅扩展现有both-ports owner，保持原三断言、真实1455/1457端口、原helper2秒与单项10秒，并通过局部process warning监听及acquireRelease卸载增加空listening警告断言；没有mock/globalThis或新重复case。首次生成因CRLF anchor失败未产出测试，规范换行后成功，历史保留。正式运行 `renicode-sync-225-oauth-listener-owner-before.log` 实收 **0pass/1fail、4assertions、5.45s**，原三恢复结果断言通过，新增资源断言收到一条MaxListenersExceededWarning而失败（case4433.78ms）。这证明原实现资源问题，不以此前suite0fail抵销。
- 已核实安装的Effect4.0.6 callback实现：返回的清理Effect仅在中断时执行，不自动覆盖正常成功/错误。因此拟议仅在openai.ts的bind为本次error/listening回调命名，成功/失败时主动解绑，并返回中断解绑Effect；不移除他人listeners，不提高上限，不改端口、重试次数、200ms间隔、错误文案或公共API。产品与正式owner尚未修改，待用户确认；批准后在原owner承接资源断言，连续10次及callback/full Server回归、Core/Server官方tsc与canonical须重新收齐。当前无未收后台测试，无新增提交/推送、真实服务重启、实时profile迁移或A/B暂存/激活。
