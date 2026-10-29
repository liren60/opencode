# 旧 OpenCode 项目会话迁入 Renicode

<!-- wiki: {"kind":"validation","workflow":"review","revision":1,"change":"none","relations":["docs/validation/renicode-directory-rename.md"]} -->

日期：2026-10-28。

## 授权与范围

- 用户明确选择当前 Renicode 左侧旧项目入口，不涉及另一套原版 OpenCode 软件。
- 迁移旧 `Downloads/opencode` 和 `Downloads/PG/opencode` 路径的会话到 `Downloads/PG/renicode`，保留会话 ID、原始历史消息与父子关系；备份核对后关闭旧项目入口，不删除会话、不卸载软件。
- “自我进化计划的总体框架”有一条未执行 synthetic 待办。用户明确选择备份后取消该待办再迁移，不批准恢复执行。取消的 inbox ID：`msg_177b4cb5d002NRkDApC7K0yWSS`。

## 备份与执行

- 通过当前 Renicode 的已认证 HTTP API 读取完整分页会话列表、导出 transcript 和 inbox，并调用 `session.move` 迁移；不直接修改实时数据库。
- 初始清单共 33 个会话：16 个在旧 OpenCode 目录、3 个已在新 Renicode 目录、14 个属于其他项目。其他项目不动。
- 16 个旧路径会话共备份 1505 条历史消息。备份位于 `%LOCALAPPDATA%/Temp/opencode/renicode-session-migration-backup`，包含原始清单、逐会话 transcript/inbox 与 SHA256 清单；未删除备份。
- 一次性操作脚本：`%LOCALAPPDATA%/Temp/opencode/migrate-renicode-sessions.py`。
- 第一次尝试因待办检查在任何迁移前停止；用户批准取消后，第一次迁移的严格全 transcript 校验发现新增系统记录并停止。逐项核对确认原有 105 条消息完全不变，仅新增 location-switched 和 idle；调用 interrupt 返回 false，没有活跃执行。
- 修正验收口径为按原消息 ID/顺序逐一保留并验证 SHA256，只允许新增 location-switched/idle 系统记录，不允许新增模型消息或改写历史。继续处理余下 15 个会话。

## 实际结果与边界

- 作业结果 `status=completed`，`moved=16`、`verified=16`、`remainingAtOldPaths=0`、无失败。
- 原 1505 条消息完整保留；会话 ID 不变，父子关系核对通过。迁移产生的系统记录不是重复导入原消息。
- 三个原本已在新目录的会话不重复导入。对应 Renicode 项目现在共有 19 个会话。
- 本记录编写时仅会话迁移完成；旧入口关闭的 UI 验证待补记，不能将旧目录零会话直接当成左侧已隐藏。不重启应用或后台。
