# Renicode 对齐 2.2：隔离合并初步验证

<!-- wiki: {"kind":"validation","workflow":"completed","revision":1,"change":"none","relations":["docs/plans/renicode-upstream-align.md","docs/validation/renicode-launcher-visibility.md"]} -->

日期：2026-10-28。此报告仅记录已执行的初步检查，不是 2.2 对齐验收通过。

## 环境与范围

- 工作树 `C:/Users/reni.li/Downloads/opencode-align`，分支 `align-renicode`；固定上游 `86ce19d96eccbfb95af3ff3189c7071575f94339`，合并仍进行中。
- Windows、Bun 1.4.4。命令显式配置本进程 PATH；原生窗口测试的 TEMP/TMP 指向获准临时目录，不修改全局环境。
- 原工作区应用源码、运行中的桌面/后台、真实数据库及 profile 未改变；未构建、安装依赖、部署、提交或推送。

## 实际证据

| 检查 | 结果与边界 |
| --- | --- |
| desktop：`bun test script/renicode-launcher-runtime.test.ts src/main/lifecycle/renicode-launcher-store.test.ts --timeout 30000` | 17 pass、7 fail、24 tests。7 个 bootstrap readiness 用例均无法加载未安装的 `@opencode/client/service`；不能视为后台兼容或完整回归通过。 |
| desktop：`bun test script/renicode-launcher-runtime.test.ts --test-name-pattern 'native window' --rerun-each 10 --timeout 30000` | 30 pass、0 fail、110 filtered out，5.67s。真实 Windows GUI 首次 ShowWindow 验证基线、候选、第二实例三路径；不启动真实 Renicode。 |
| desktop：`bun test src/main/lifecycle/renicode-launcher-store.test.ts --rerun-each 10 --timeout 30000` | 100 pass、0 fail，167ms。仅证明独立 launcher-store 现有契约。 |
| Bun.Transpiler 解析 12 个修改文件 | configure、appearance、early、electron-vite、patch、settings controller、English 字典、新桌面 build、根 build/deploy/migrate、electron-builder 全部语法解析通过；不解析 import 依赖，也不等同类型检查。脚本保留在 `%LOCALAPPDATA%/Temp/opencode/renicode-align-parse.ts`。 |
| 修改文件 `git diff --check` 与已解决路径 `git diff --cached --check` | 通过。未对尚有冲突标记的整个合并作通过声明。 |
| launcher/runtime/test 与冻结 GUI fixture 迁移核对 | 原始 SHA-256 不同（CRLF/LF）；规范化换行后正文全部一致。首次严格字节核对失败后改用明确的规范化比较，不声称逐字节一致。 |

第一次使用 PowerShell `bun -e` 的解析命令因引号传递被去掉而失败；改为临时 `.ts` 文件后成功。这是命令执行问题，不是修改源码解析失败。

## 未验证与交接

- 已解决 12/22 初始 Git 冲突路径，仍有 10 个 unmerged 路径；这不是工作完成率。
- patch 审批与同路径移动需要新版 Core 实际回归；窗口/profile 构建需类型检查与隔离启动验证。
- 完整新版依赖、全仓 lint/typecheck、项目中心 GUI、Home/draft/worktree 行为与性能、完整打包、后台/数据库升级回退尚未验证。
- A/B 后台字节与数据库指纹门禁原样保留，未执行暂存或激活；不能用旧版本通过记录代替新版证据。
