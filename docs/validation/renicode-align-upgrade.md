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
