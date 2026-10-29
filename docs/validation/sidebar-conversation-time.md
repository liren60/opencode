# 左侧对话时间语义修正

<!-- wiki: {"kind":"validation","workflow":"completed","revision":1,"change":"none","relations":[]} -->

## 范围与依据

- 2026-10-28 用户反馈：仅点选左侧对话，时间变为 `now`；要求按对话活动更新，而不是按查看更新。本次是此前侧栏时间功能的缺陷修正，不扩展其他 Cursor 功能。
- 未找到本任务的独立讨论或生效计划文件；按本次用户反馈及原任务修复范围执行，不推断其他计划授权。
- 原实现读取通用 `session.time.updated`。只读本机 API 观察到某个旧对话 `updated=1793151700948`，而最后一次对话结束 `idle=1793081269189`，最后一条回复完成时间为 `1793081269187`。通用修改时间不代表最后对话结束；本次不声称已定位哪项后台写入导致该通用字段变化。

## 修正契约

- 侧栏紧凑时间、完整日期及无障碍说明统一使用 `time.idle ?? time.created`。
- 只有新的对话执行结束才推进显示时间；单纯点选、查看、设置修改不推进。没有结束记录时显示创建时间，正在执行的新对话结束后刷新。
- 提示改为 `Last conversation`；不改变首页索引的排序规则，不逐条请求聊天历史，不修改数据库或后台二进制。
- 扩展 `packages/app/e2e/regression/home.spec.ts` 现有日期 keeper，不增加重复单元测试：保护选中时通用时间较新而对话时间保持不变、没有结束记录时回退创建日期、后续对话结束刷新三个相关状态。旧测试只让 `updated` 改变，没有区分两个时间的含义。

## 实际验证

- 修复前生产构建：新的 keeper 在点击目标对话后失败，预期 `5d`，实际 `now`。第一次试跑还暴露 mock 缺少 view 端点，夹具调整为已读状态后重新验证，仍仅因日期断言失败。
- 5000 对话生产基线 `sidebar-conversation-before`：1 次列表请求，2,574,810 字节，rowsMs=4190.8，heapUsedMB=29.40。单次样本，只用于前后成本检查，不证明性能趋势。
- 修复后生产构建成功。最初复测误用构建前启动的静态服务，它缓存旧 index.html，重建后对应旧资源已不存在，10 项均在页面挂载前失败；另开 4341 静态服务后验证，未修改生产代码或放宽断言。
- 日期 keeper：`--repeat-each 10 --workers 5 --retries 0`，10/10 通过（7.4s）。首页 keeper：`PLAYWRIGHT_FULLY_PARALLEL=1`、5 workers、无重试，15/15 通过（8.2s）。
- `packages/app` 的 `bun typecheck` 通过（1607 文件）。全仓库 `bun --bun run check` 通过，1276 lint 警告、0 错误；第一次未加 `--bun` 时由 Node 加载 TypeScript lint 插件失败，重新使用 Bun 执行后成功。
- `bun run typecheck:e2e` 仍被其他现存 performance/composer/review/timeline-stream 文件错误阻塞；本次修改的 home keeper 无类型错误。
- 5000 对话比较 `sidebar-conversation-after`：列表请求仍为 1 次、2,574,810 字节；rowsMs=342.9，heapUsedMB=16.47。前后单次样本的节点数与堆大小也不同，不能把耗时下降归因于此次改动；可确认没有新增列表请求或传输成本。
- `bun --bun run script/deploy-renicode.ts --check` 成功：更新暂存 B 槽 `1eae6407-1d83-41c4-943a-fd60ff764b32`，活动槽仍 A `fd3fb5c0-da75-431c-8f45-803835037052`，交接记录 65 为 `staged`。没有强制停止当前桌面；此报告不声称候选已激活或通过真实桌面验收。
- 后台二进制与活动槽 SHA256 均为 `701465411A501AF61C992DA47B82E324FCEEC3BDA085AF698C2D507F20E57386`，未替换后台实现或变更数据库。

## 部署边界

- 当前桌面实际路径在 A 槽；查询启动器发现旧的失败/回退记录且 guardian 为空。这不是本次时间修正的验证结果；不重启桌面或后台，也不顺带修复启动器。
- 更新按 `script/renicode-portable.md` 暂存非活动槽位，保留当前运行版本和历史槽位，最终明确报告暂存或激活状态。
