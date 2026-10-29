# OpenCode 项目简介

<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo">
    </picture>
  </a>
</p>
<p align="center">开源 AI 编码助手。</p>
<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/@opencode/cli"><img alt="npm" src="https://img.shields.io/npm/v/@opencode/cli?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/opencode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/opencode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">中文（默认）</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![OpenCode Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://opencode.ai)

---

### 安装

```bash
# YOLO
curl -fsSL https://opencode.ai/v2/install | bash

# Package managers
npm i -g @opencode/cli@latest      # or bun/pnpm/yarn
brew install anomalyco/tap/opencode-v2 # macOS and Linux (recommended, always up to date)
brew install opencode              # macOS and Linux (official brew formula, updated less)
sudo pacman -S opencode            # Arch Linux (Stable)
paru -S opencode-beta              # Arch Linux (Latest from AUR)
mise use -g opencode               # Any OS
nix run github:anomalyco/opencode  # Nix
```

> [!TIP]
> 安装前请移除早于 0.1.x 的版本。

### 桌面应用（测试版）

OpenCode 也提供桌面应用，可从 [opencode.ai/download](https://opencode.ai/download) 下载。

| 平台                  | 下载                               |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `opencode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `opencode-desktop-mac-x64.dmg`     |
| Windows               | `opencode-desktop-win-x64.exe`     |
| Linux                 | `.deb`, `.rpm`, or `.AppImage`     |

```bash
# macOS (Homebrew)
brew install --cask opencode-desktop
```

#### 安装目录

安装脚本将 OpenCode 安装到 `$HOME/.opencode/bin`。

### 智能体

OpenCode 内置两个智能体，可使用 `Tab` 键切换。

- **build** — 默认智能体，拥有完整访问权限，用于开发工作
- **plan** — 只读智能体，用于分析和代码探索
  - 默认拒绝文件编辑
  - 运行 bash 命令前请求权限
  - 适合探索陌生代码库或规划修改

还内置了用于复杂搜索和多步骤任务的 **general** 子智能体。
它供内部使用，也可在消息中通过 `@general` 调用。

了解更多[智能体信息](https://opencode.ai/v2/docs/agents)。

### 文档

有关 OpenCode 配置的更多信息，请[**查看文档**](https://opencode.ai/v2/docs)。

### 参与贡献

如果有兴趣为 OpenCode 做贡献，请在提交合并请求前阅读[贡献指南](./CONTRIBUTING.md)。

### 基于 OpenCode 开发

如果你的项目与 OpenCode 相关，且名称包含 “opencode”（例如 “opencode-dashboard” 或 “opencode-mobile”），请在 README 中注明：该项目并非由 OpenCode 团队开发，与我们没有任何关联。

---

**加入社区** [Discord](https://discord.gg/opencode) | [X.com](https://x.com/opencode)
