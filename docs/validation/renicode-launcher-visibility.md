# Renicode A/B 启动窗口可见性修复验证

<!-- wiki: {"kind":"validation","workflow":"completed","revision":1,"change":"none","relations":["script/renicode-portable.md"]} -->

日期：2026-10-28。环境：Windows、本机 RenicodePortable、Bun 1.4.4。

## 授权与范围

用户报告 Renicode 无法启动，随后明确表示“关闭了，你修复吧”，并确认没有其他会话在更新、由本会话继续修复。

本次只修复独立启动器的 GUI 启动标志、添加回归测试、更新 A/B 快捷方式并实机验证。不重建桌面包，不改后台服务、数据库 schema 或会话数据，不强制结束桌面或后台服务，不恢复其他暂停任务。保留工作树已有修改。

## 诊断与边界

- 09:35–09:39 历史记录显示 A/B 两槽位失败，记录 `exit=1`，最后 `retry-limit`。这些退出没有保留 stderr，无法确定每次退出的直接原因。
- 绕过启动器，直接启动桌面程序可以正常显示并运行；携带启动器健康上报环境直接启动也能达到 `ready`。
- 检查期间出现另一轮既有部署，B 槽位改为 `1eae6407-1d83-41c4-943a-fd60ff764b32`。这不是本会话部署的包；用户确认没有并行更新后继续定位。本次未覆盖该包。
- 旧启动器运行桌面 PID 32664 时，健康记录已成功，但 Win32 `EnumWindows` / `IsWindowVisible` 确认标题为 Renicode 的 `Chrome_WidgetWin_1` 主窗口不可见。
- 原代码为 GUI 子进程设置 `windowsHide: true`。Windows 会将启动时的隐藏指令应用到第一次 `ShowWindow`。真实原生窗口测试复现了这个可见性缺陷，不将历史所有 `exit=1` 都归因于它。

## 修复

- `packages/desktop/scripts/renicode-launcher-runtime.ts`：共享 `spawnDesktop`，不给桌面 GUI 设置隐藏标志；基线、候选及已有启动器时的第二实例共用该路径。
- `packages/desktop/scripts/renicode-launcher.ts`：第二实例使用同一 GUI 启动路径。后台 PowerShell / taskkill 的静默选项未改动。
- `packages/desktop/scripts/renicode-launcher-runtime.test.ts` 与 `scripts/fixtures/launcher-window.cs`：编译一次原生 GUI 小夹具，通过真实进程启动、第一次 `ShowWindow` 和 `IsWindowVisible` 验证三种路径。非 Windows 不运行该平台专有契约。

## 实际验证

| 验证 | 结果 |
| --- | --- |
| 临时恢复 `windowsHide: true`，运行可见性表 | 基线、候选、第二实例三例全失败：实际 `hidden`，期望 `visible`；随后撤销该临时变更 |
| `bun test scripts/renicode-launcher-runtime.test.ts --timeout 30000`，desktop 目录 | 14 pass、0 fail |
| runtime 与 launcher-store 两个测试文件，`--rerun-each 10 --timeout 30000` | 240 pass、0 fail，7.33 秒 |
| desktop 目录 `bun typecheck` | 通过 |
| 根目录 `bun run check` | 首次受旧 Node 无法加载 oxlint 的 `.ts` 插件阻塞 |
| 根目录 `bun --bun run check` | 通过；lint 0 errors、1279 warnings；35 个 typecheck 任务成功 |
| 三个 TypeScript 修改文件 Prettier check；`git diff --check` | 通过 |
| `bun script/deploy-renicode.ts --check --launcher-only` | 新编译独立启动器，更新快捷方式；不重建或暂存桌面包。此模式不执行脚本内的桌面 build check，完整检查由上一行独立运行 |
| 使用桌面快捷方式对应的新启动器启动 | 桌面 PID 30752；主窗口 `IsWindowVisible=true`；启动器写入 `healthy`，通过 15 秒存活检查 |
| 后台服务进程 | Renicode CLI PID 25680 与诊断开始时相同，没有重启 |

旧隐藏桌面通过目标主窗口 `WM_CLOSE` 正常退出，启动器记录 `user-exit`，没有强制结束。截图工具因用户正在操作返回 `USER_CONTROL`，未取得截图；窗口可见性证据来自 Win32 状态，不声称已人工验收所有页面功能。

## 部署结果与交接

快捷方式 `Renicode A-B.lnk` 已指向新启动器：

```text
%LOCALAPPDATA%\RenicodePortable\launcher\96bd260b-2340-41f8-ab27-812be4ede6ec\RenicodeLauncher.exe
```

修复已生效并通过本机启动验证，不只是待暂存更新。A/B 活动槽位仍为 B、前一槽位 A、无候选；本次未切换槽位，未覆盖原始安装或历史启动器。保留启动后的桌面供用户使用。历史退出原因无详细错误证据，若再次发生退出，应另行捕获退出详情，不能以本记录推断所有崩溃已修复。
