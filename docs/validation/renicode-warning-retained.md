# Renicode 合理边界警告保留清单

<!-- wiki: {"kind":"validation","workflow":"completed","revision":3,"change":"none","relations":["docs/plans/renicode-upstream-align.md","docs/discussions/opencode-upstream-sync.md","docs/validation/renicode-warning-cleanup.md"]} -->

日期：2026-10-30。本清单是已完成的局部审查记录，**不是全部剩余warning已经审查或整个计划完成**。只列经本轮核对的必要边界；其他诊断不能自动归入本清单。

接续更新：2026-11-02，主计划revision9。新增审查见下文；旧49条与IndexedDB待补证据的历史保留，不把新增依据回写成此前已审完。

## 授权与判断标准

- 主计划revision7：用户选择“不加例外，保留警告”。不改全局规则、不添加局部例外、不机械补SAFETY注释、不换写法隐藏unknown，也不缩窄通用codec契约。
- 合理保留须说明真实输入来源、解析/解释职责、消费者及现有验证。仅因既有代码或检查退出0，不能判断警告合理。
- 行号对应 `PG/opencode-align` 本轮源码。完整单项诊断资产 `Temp/opencode/renicode-warning-drafts-audit-lint-20261030.json`；本轮未修改drafts生产源码，原886盘点的该文件50条与本轮targeted诊断一致。

## 通用草稿 codec：48条合理保留，2条待补证据

文件：`packages/app/src/runtime/persistence/drafts.ts`。

真实调用链是 `storage.ts` 的泛型 `persisted<S extends Schema.ConstraintCodec<object, unknown>>` → `Schema.encodeSync(initialized)` → `draft.setDocument(prefix + config.key, encode(value))`（storage.ts:586–599、755–765）。codec encoded端明确为unknown，草稿层负责通用树上的文本分块与blob引用处理；读取后再由所属codec `deserialize: Schema.decodeUnknownSync(json)`解释业务文档。不能把整个encoded树替成composer字段、仅JSON对象的固定schema或断言为已经解码的业务模型。

| 规则 | 行号 | 数量 | 审查依据 |
| --- | --- | ---: | --- |
| no-unknown-parameters | 22、112、206、232、290、352、370、482、545 | 9 | 22/370承接通用encoded文档；112扫描任意树的图像引用；232/290/352是encode/decode/rename递归owner，未命中特殊节点的值须保留。206是blob上传Promise拒绝边界，仅清除失效缓存并原样抛出，不当成功类型使用。482是documents/blobs IndexedDB写入入口，值由所属store writer决定。545是JSON reviver内的chunk ID列表，保留既有String转换，不假定所有历史ID均为string。 |
| no-unknown-returns | 232、290、352 | 3 | 递归转换返回原有任意值或节点转换结果；下游由JSON序列化/所属codec解释，不能伪造“已解析composer对象”的返回类型。 |
| no-runtime-typeof | 119、123、126、233、245、248、257、262、270、274、293、296、305、355、358、364、543、564 | 18 | 119–364在该通用树解析owner内区分对象、文本、图像dataUrl、text/image引用与URL；未知邻居继续递归/保留，不做全对象缩窄。543为JSON reviver的引用提取边界。564为readAsDataURL的FileReader load结果边界，DOM结果类型仍包含string/ArrayBuffer/null，保留现有非string为空的策略。 |
| require-safety-comment-for-type-assertion | 120、124、246、258、294、297、356、359 | 8 | 外层value先排除数组与非对象；内部blob/ref先检查非空对象。这些断言只提供可索引的unknown属性视图，不声称id/kind/url已经合法；实际使用前仍逐字段检查。按用户选择保留诊断及本表依据，不新增机械注释。 |
| no-unsafe-dictionary-type | 120、124、246、258、294、297、356、359 | 8 | 同一树解析owner的属性视图，未知键和值正是必须递归保留的内容；消费者不把unknown字典当业务对象。不改成固定字段字典以消除诊断。 |
| no-known-value-widening | 362、364 | 2 | rename两个引用分支返回具体新对象，但整个递归函数还必须原样返回其他任意值，unknown返回契约不能缩成这两个局部分支；没有丢失可以在全函数成立的业务契约。 |

**未纳入合理保留**：495/535的IndexedDB读取断言（string/Blob）各1条，仍需补齐实际store读写/返回契约证据。仅核对writer不足以把它们当作已审完，不声称本文件50条全部合理。

现有真实owner回归覆盖大文本分块/复用、缺块恢复、上传失败重试、引用改名、surrogate边界、两文档图像引用及延迟加载；此次完整App运行中该文件没有失败，但App完整suite另有locale/plugin冷加载超时，不能将其说成整套通过。没有本轮drafts运行逻辑修改，不将已有回归当作新的性能/任意外部数据兼容性证明。

## 语音连接异常边界：1条合理保留

`packages/app/src/voice/call.ts:115`，`no-unknown-parameters`。

- 输入来自 `connect()` Promise拒绝，包括VoiceTransport、麦克风/平台API和AbortSignal错误，不保证均为VoiceFailure。
- 此catch就是解释异常的owner：仅对 `instanceof VoiceFailure` 读取其reason，其他异常映射为既有connection失败；结束的通话不再drop。没有未检查的业务字段读取或unknown字典传播。
- 保留unknown，不改名为cause以利用规则豁免，不去掉注解获得any，也不伪造所有失败都是VoiceFailure。该函数的状态类型整理经官方App检查，运行代码不变；现有voice重复回归通过，但没有声称覆盖真实麦克风或网络设备。

## 本清单边界与后续

- 当前仅49条有依据保留（drafts48、voice1）；其余未审条目仍待处理，不能由本清单计算全仓完成率。
- 固定上游changed lint允许显示上述已审保留项，但结果与全仓未审项必须分开报告；不称显示1条诊断的changed lint为0问题。
- 本轮没有打包/部署/关闭真实桌面或后台，没有实时profile操作。最终全数处理或有依据保留后才统一打包，安全、内嵌ASAR/header及冻结候选hash、隔离运行和A/B门禁仍保留。

## 2026-11-02：IndexedDB读取owner补证据，新增2条

`drafts.ts:495/535`，均为 `require-safety-comment-for-type-assertion`。读取由 `createBrowserDraftStore` 的私有 `get` 统一封装，DOM的IDBRequest没有store相关返回泛型，故Promise暴露unknown；不能由DOM接口直接推导string/Blob。

- database固定为 `opencode-drafts` version 1，upgrade创建documents/blobs两store（443–447）。本模块唯一documents非删除writer是506的 `put(value, key)`，value受Driver.set的string契约约束；528只删除。blobs唯一非删除writer是529–531的putBlob，经Driver.putBlob的Blob输入后调用私有write；不存在向这两store写任意encoded文档的公开入口。
- 495/535只把相应store的已写入类型映射回Driver读契约，保留不存在时null；`createDraftStore`再解释serialized文档/引用，不能把string/Blob偷换为已解码业务文档。无需缩窄通用encoded树。
- 本轮未修改该生产代码或补SAFETY注释。现有drafts测试在最新完整App909/909中通过，覆盖的是memoryDriver及草稿行为，**不是本轮新增的真实IndexedDB端到端或任意外部数据库损坏证明**。本依据是私有store读写契约；不声称校验了被外部修改的同名数据库内容。

## 2026-11-02：错误formatter必要解释边界，10条

文件 `packages/app/src/runtime/server/errors.ts`，行号对应新增完整config/model decoder后的源码。

| 规则 | 行号 | 数量 | 依据 |
| --- | --- | ---: | --- |
| no-unknown-parameters | 58、85、102、106 | 4 | 58是Promise/ClientError/平台Error/历史named error的文案解释owner，不能伪造所有异常已经属于同一Server DTO；85仅在本文件内部对Error.cause及cause.body拆封；102解释客户端本地产生的Error，106解释原始或包装后的SessionNotFoundError。只有检查后的字符串/布尔值对外返回。 |
| no-unknown-returns | 85 | 1 | 拆封保留原异常、cause或body，紧接着由58的完整Schema decoder或106的tag/ID检查解释；不是把unknown传播为成功业务数据。 |
| no-runtime-typeof | 68、71、78、86、109 | 5 | 68/71是通用可读message的对象/字符串边界，78承接非空原始字符串异常；86只允许对象cause拆封，109排除null/原始值后才读取结构tag/ID。不能移除这类Error兼容边界或把原始异常断言成某个固定成功DTO。 |

**不以此豁免原不完整config/model guard**：仅data为对象就读内部字段确实会抛TypeError，用户批准后已改完整Schema解码。原owner新增5条断言在冻结HEAD上实际5fail、原合法13pass；新版180/180重复和完整App909/909通过。错误输入解析问题是真修复，不是合理保留。现有导出错误类型、合法文案和其他fallback优先级保留；当前剩余10条不包含已移除的错误guard。

## 2026-11-02：TextReveal CSS值与平台能力边界，8条

`packages/ui/src/components/text-reveal.tsx`，均为 `no-runtime-typeof`。

- 5/7/13/15（4条）：组件duration/travel的公开输入明确允许number或string；数字需加ms/px，已有CSS字符串原样保留，undefined使用原fallback。这是有类型联合的表示转换，不是把任意unknown当成功值；不能将两种合法输入统一强制转成数字或引入另一套单位置换契约。
- 97/105/120/139（4条）：requestAnimationFrame/cancelAnimationFrame的平台能力判断；缺失时保留同步完成/不取消的既有路径，不假定所有渲染环境都有浏览器调度API，不用换成另一种功能检测来隐藏诊断。
- 冗余old字段断言已改为具名真实mutable状态，已知string/undefined的next/prev只检查undefined，不重复typeof。外部81组合法输入条件对比完全一致，Bun编译JS除已审条件外逐字节一致，全部JSX/CSS/定时和布局逻辑保留。UI官方tsc及315/315通过；**该unit suite不是TextReveal所有真实渲染/动画时序的GUI验收**，最终交付仍需相应GUI门禁。

## 2026-11-02：作用域键的名义品牌构造，7条

`packages/app/src/runtime/server/scope.ts:24/26/35/44/51/58/64`，均为 `require-safety-comment-for-type-assertion`。

- local来自固定无NUL字面量；fromServerKey先归一sidecar/显式canonical-local，再通过fragment拒绝NUL。fromRoute检查构造后的完整route字符串；from/prefix经compose逐项检查后用唯一NUL separator连接。
- route/scope提取函数先要求separator存在，再对提取片段执行fragment，分别保留last/first separator定位语义。这些断言只赋予本模块定义的字符串名义品牌，不声称验证了URL/目录存在或获取外部权限，不改变字符串字节。
- scope.test的五处fixture断言已改用真正ServerConnection.Key.make与ServerScope.fromServerKey；原local/remote/canonical和invalid-fragment断言保持，最新完整App suite通过。未修改品牌生产构造、引入运行时Schema替换或机械注释；不声称本测试证明任意URL安全或跨服务器授权。

## 2026-11-02：错误页递归状态解释，8条

`packages/app/src/shell/errors/description.ts`。

| 规则 | 行号 | 数量 | 依据 |
| --- | --- | ---: | --- |
| no-unknown-parameters | 1、14、17 | 3 | 错误页直接接收原异常；1解释localServerStartup标记，14/17递归解释status/cause/data，不保证异常属于某个DTO或没有自环。 |
| no-runtime-typeof | 3、18、25 | 3 | 对象标记精确比较true；递归排除null/原始值后维护seen；状态只接受number整数且100–599，其他值继续既有cause优先/data次之路径。 |
| require-safety-comment-for-type-assertion / no-unsafe-dictionary-type | 20 | 各1 | 仅提供unknown字段视图，不将字段当合法number或异常类型；status在25完整检查，cause/data再次进入同一递归owner且seen拒绝循环。 |

消费者error.tsx只使用已解释的状态/文案key；现有cause/data、非法范围、自环及startup true/false owner断言在最新完整App suite通过。本轮没有改这个生产算法、增加全局错误契约或宣称覆盖任意外部对象getter。

## 2026-11-02：历史Composer metadata解释，6条

`packages/app/src/session/composer/selection.ts:3/9/13/14/18/23`：unsafe dictionary 1、runtime typeof 5。

真实调用是region.tsx:80的durable Session info与最近历史message.metadata；metadata属于通用消息metadata，不保证历史model/agent字段合法。此函数就是把历史投影成composer选择的owner：model先要求非数组对象、providerID/modelID字段为string，variant及agent分别检查string；durable info优先。不能把完整消息metadata缩成固定Composer DTO，也不假定所有历史值已由当前composer schema编码。输出字段已经是实际字符串/undefined，不传播未知属性。现有durable优先/历史fallback owner断言在完整909/909中通过；本轮未改生产函数或宣称新增所有坏metadata/生产性能覆盖。

## 当前总量与明确边界

- 上述新增41条：IndexedDB2、formatter10、TextReveal8、scope7、description8、selection6。连同原drafts48及voice1，当前**90条**有具体依据保留。
- 最终全仓原生诊断仍为**806warnings/0errors**；其中**716条仍未完成处理/审查**。固定上游changed lint实际退出1、197文件中3文件19条，恰为上述已审formatter10/TextReveal8/voice1；不把19条说成0，也不因这些触及文件已审就声称其他716条完成。
- 机器清单固定本次原生诊断快照，见 `Temp/opencode/renicode-warning-reviewed-20261102.json`；后续新增或漂移诊断不自动获得本清单的判断。全数处理/有依据保留后才统一打包，不关闭规则、不增加例外、不操作当前桌面、后台、profile或防护。

## 2026-11-02 三组全部交回后的最终诊断对账

上述90条/716未审是前一冻结快照的历史，不是当前未审状态。主计划revision10全量并行原始716项已全部交回；主助手对806原项与最新全仓原生JSON、186文件hash完成独立对账，资产为 `Temp/opencode/renicode-warning-final-accounting-20261102.{ts,json}`。

| 范围 | 原待审数 | 修正 | 原项有据保留 | 新增已审边界 | 当前原生warnings |
| --- | ---: | ---: | ---: | ---: | ---: |
| 原先已审边界 | 90 | 0 | 90 | 0 | 90 |
| App生产 | 104 | 37 | 67 | 2 | 69 |
| 其余组件生产 | 234 | 95 | 139 | 9 | 148 |
| Tests/Stories/工具 | 378 | 244 | 134 | 2 | 136 |
| 全仓 | **806** | **376** | **430** | **13** | **443** |

- 精确identity含filename/rule/line/column，原716项一一对应；当前443项与全仓native JSON精确对应，没有未分类/漏项/额外未审项。全部当前severity为warning，0errors。原90个边界文件hash仍等于旧证据；App/组件/测试186个owner的当前hash都等于最终报告。此对账不把可能的后续新增或源码漂移自动纳入合理。
- 当前逐项保留记录（含全部诊断标签、实际输入/checked invariant/消费者、源码hash和覆盖限制）：App `renicode-warning-parallel-app-diagnostics-20261102.json`；组件 `renicode-warning-parallel-components-report-20261102.json`；测试工具 `renicode-warning-parallel-fixtures-diagnostics-20261102.json`。它们位于获准Temp，汇总443条snapshot也包含每条实际basis；对应三份report.md保留真正命令、失败历史和相互重叠测试的限制，不把报告总数当unique测试数。
- App保留项覆盖泛型Solid setter/persisted codec、未知错误/权限动态翻译/媒体与原生能力等真实解释边界；新的2项是已获准helpers内data对象/message字符串检查。权限translator断言不声称key已在catalog中，而依赖真实owner缺键返回undefined/consumer隐藏缺描述的兼容行为；不以封闭action映射删除历史/自定义key。
- 组件保留项覆盖Protocol通用tool metadata、媒体解码、原生/CDP/名义DOM/generic component桥接、Logger任意值及platform能力。9新增是四个真正unknown media输入与五个window raw parser/flag/clone检查，不把这些raw字段断言为已解析WindowState。CDP/Puppeteer泛型缩窄曾被真实消费者/官方tsc拒绝，恢复原兼容桥而非牺牲功能清零。
- 测试工具保留项覆盖故意坏输入validator、未补齐的历史wire消息、懒执行Solid JSX、receiver-aware Proxy、通用seed/metrics/region key及Playwright序列化边界、控制artifact/native ABI和既有opaque Page/Route/Canvas/headless geometry adapter。每类明确只证明真正被调用的方法，不伪装为完整浏览器/Canvas能力。新增2项局部FileFind/Lists断言保留故意缺location/旧字段的fallback场景，已移除整个SDK的三处粗断言；不能通过补location让测试丧失坏输入意义。
- Tests原两个重复composer-history shorthand标签的对应关系在报告中明确为**一项修正/一项保留的grouped emission**，不编造可证明的具体emitter归属；全部原/current标签数量仍精确。恢复报告时曾遗漏的session-fixture字典与SSE旧行号偏移已纠正，失败/恢复记录保留。
- 全仓canonical check实际443warnings/0errors、36/36成功；全仓官方tsc35/35成功；App909/909和browser235/235、UI315/315、SessionUI317/317、GUI255pass/1既有WSLskip/0fail。Desktop cleanup先失败后复用既有临时目录helper，owner10次460/460通过；重启打断的组件后缀115/115通过，原首轮Composer失败仍保留，不能编造一次完整372绿suite日志。**这不是最终交付验收完成**：一项旧/新同样失败的Settings search keeper尚需解决，afterbenchmark/desktop新包/安全/完整性/A-B门禁仍待收齐。合理warnings已审与真实测试失败分开，不能将测试失败列为合理warning或借此提前激活。
