# 简体中文文案审校

日期：2026-10-27。范围：项目中心扩展的简体中文（`zh`）界面，包括本轮引用快照提示。英文既有键和值保持不变；不翻译仓库原文、项目名称、路径或文档声明的状态。

## 对照资料

- [VS Code 简体中文语料](https://github.com/microsoft/vscode-loc/blob/main/i18n/vscode-language-pack-zh-hans/translations/main.i18n.json)：对照“会话”“草稿”“仓库”“只读”“快照”等开发工具语境。采用“项目登记文件”，不译为 Windows“注册表”。
- [Firefox 简体中文设置语料](https://github.com/mozilla-l10n/firefox-l10n/blob/main/zh-CN/browser/browser/preferences/preferences.ftl)：对照“设置”“保存”“重试”“搜索”“扩展”“选中的文本”等完整界面用语。
- [Unicode CLDR 基数规则](https://github.com/unicode-org/cldr/blob/main/common/supplemental/plurals.xml)：`zh` 只有 `other`，文档计数使用 `{{count}} 篇文档`，仍通过 SDK `plural` 渲染，不在组件里选择复数类别。
- [教育部国语辞典资料的萌典入口：快照](https://www.moedict.tw/a/快照.json)：国语义项主要是摄影语境；计算机“快照”的用法另由开发工具语料核对，不据摄影义机械翻译。

## 一致性与保留项

- Project Center → 项目中心；registry → 项目登记文件；registered → 已登记。
- citation → 引用；snapshot → 引用快照；fingerprint → 指纹。提示区同时展示快照指纹与最近读取的原文指纹。
- historical/unverified → 历史/待核验，不暗示资料已经验证或适用于当前 VC5 API。
- “匹配”只指与最近读取的原文匹配，不声称持续监视磁盘；提示用户主动刷新。
- VC5、API、SHA-256 保留为产品名及技术缩写；`Downloads/PG/Reni_ProjectCenter/web/wiki-projects.json` 保留为可定位的路径（2026-10-28 随用户项目目录迁移更新）。
- 本轮不提供繁体中文，避免把大陆简体用语未经审校直接套用到其他地区。

以上是术语、语义、占位符与计数规则的对照审校，不声称外部母语审校者已签字。激活后仍需用户复核中文操作文案，尤其是“已登记来源”“引用快照”是否符合实际阅读习惯。
