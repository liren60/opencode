# Renicode 免安装 A/B 启动器

## 本机部署

```powershell
bun script/deploy-renicode.ts --check
```

保留现有安装和 `Renicode.lnk`，新增桌面入口 `Renicode A-B.lnk`。程序和独立启动器位于 `%LOCALAPPDATA%\RenicodePortable`，会话仍使用 `%APPDATA%\ai.renicode.desktop`，不会复制到程序槽位或桌面。

首次部署将当前安装复制为 A，并将本地新构建放入 B。启动器等待当前桌面正常退出，不强行打断会话。后续更新只写非活动槽位；正在使用的版本正常退出后才切换。

候选版必须完成主进程 IPC 注册、后台服务认证健康请求、页面加载，并存活 15 秒；启动限时 90 秒。启动失败（包括无法创建进程）或渲染进程崩溃时回退，连续失败最多三次。正常退出不会自动重开（明确排队的升级除外）。初始旧版本没有健康上报，必须存活 30 秒且其独立后台服务通过版本和认证健康检查，才视为基线可用；不能用旧版探测方式确认新候选。

独立启动器由 Bun 编译为 EXE，不依赖 Bun 安装或 Renicode 的 Electron 文件。启动器更新放在新的目录，不覆盖正在运行的启动器。未配置系统服务、登录自启或机器唤醒。

## 查看状态与手动回退

只修复启动器和桌面入口，不重建桌面、不切换槽位、不自动启动程序：

```powershell
bun script/deploy-renicode.ts --launcher-only
```

在源码目录运行：

```powershell
bun packages/desktop/script/renicode-launcher.ts status
# 先正常退出由启动器管理的桌面，再执行：
bun packages/desktop/script/renicode-launcher.ts rollback
```

启动器将活动槽位、候选槽位、运行结果和任务交接写入独立的 `launcher.sqlite`。可以在部署时用 `--session` 和 `--note` 记录交接。恢复现有会话不等于自动发送新提示；这一版不会自行调用模型或消耗模型 token。

## 回退边界

以下同指纹更新共用一个 profile；OpenCode 2.2 这种后台或桌面存储不兼容更新必须使用下节的独立代际流程，不能绕过指纹检查。

- 后台 CLI 必须逐字节一致；桌面迁移、迁移器、数据库 schema 的构建指纹必须一致，否则拒绝升级。
- 第一次从已有本机安装导入，需要显式信任该安装，且它的迁移记录必须匹配源码。该初始化不是对任意旧版本的自动兼容检测。
- 这不是数据库快照恢复方案。不允许借此自动部署数据库迁移；不保证撤销应用行为对用户数据的改变。
- 哈希检查覆盖关键启动文件，不能替代完整功能测试、签名验证或对任意损坏的保证。
- Windows 和启动器自身损坏、磁盘故障不在 A/B 应用版本回退的保护范围内。
- 重复点击入口仍会检查槽位文件完整性。缺失文件会写入交接日志；若文件被安全软件隔离，应核查保护历史记录，而不是绕过检查。
- A/B 共用同一独立后台服务及暂存 CLI；安全软件阻止后台程序时，回退桌面版本不能修复这个共同故障。
- 槽位目录不可变，部署不会删除历史包；当前实现需人工管理历史包的磁盘占用。

## 不兼容更新：版本化 profile

```powershell
bun script/deploy-renicode.ts --check --generation
```

`--check` 包含构建和部署写入，不是 dry-run。`--generation` 只暂存不可变程序包和候选清单，不复制 profile、不写自动 pending、不启动 guardian。旧版继续使用原程序/原 profile；不要直接运行新版 EXE，它要求 migration-aware launcher 提供已准备的代际。

暂存输出的 `stagedGeneration` 是代际 ID。**只有用户正常退出桌面、guardian 已退出且旧后台已正常停止后**，才显式执行：

```powershell
bun packages/desktop/script/renicode-launcher.ts prepare-generation --generation <stagedGeneration>
bun packages/desktop/script/renicode-launcher.ts status
# 核对 pending 与独立 profile 绑定后，显式启动；不安排无人值守迁移：
bun packages/desktop/script/renicode-launcher.ts launch
```

准备阶段拒绝活后台、执行恢复 claim、已有目标、链接或损坏数据库；完整复制 profile 到 `generations/<id>/profile`，验证文件哈希和 SQLite 完整性/外键，过滤目标的旧 service lease 与路径 overrides，原 profile 不修改。新版使用独立配置、CLI 暂存及服务端口。复制中断的 `.preparing` 目录保留，不自动覆盖或删除。

失败回退绑定旧程序和旧 profile；后续手动回退前也须正常退出新版桌面/guardian、正常停止新版后台。升级后新增聊天/设置保留在新版代际，旧 UI 不自动显示这些新增数据；跨代际合并不在本流程范围。原安装、程序历史与任一 profile 均不自动删除。正常退出门禁未满足时，保持“仅程序已暂存”，不能声称升级已激活。
