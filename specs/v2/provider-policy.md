# 提供商策略

状态：**已实现。**

## 用途

策略控制是否允许对具名资源执行操作。策略语句写在配置文件中，或由已连接的 OpenCode Console 下发，并由末端策略插件应用。

支持的操作如下：

```text
action:   provider.use
resource: provider ID, such as openai or company-ai

action:   tool.use
resource: <permission action>:<resource>, such as shell:sudo * or edit:*.env

action:   integration.use
resource: mcp:<server ID>, plugin:<unversioned package or absolute local path>,
          hosted:<integration ID>, or skill:<skill ID>
```

提供商配置和提供商策略相互独立：

- `providers` 描述端点、选项和模型覆盖设置。
- `experimental.policies` 决定是否允许使用提供商的操作。

即使提供商配置正确且凭据有效，策略仍可拒绝使用它。

## 目标

- 替代旧版 `enabled_providers` 和 `disabled_providers`。
- 用户未指定策略时，保持默认体验不变。
- 支持操作和资源的通配符匹配。
- 提供一套精简策略词汇，以后可覆盖 `plugin.load` 或 `mcp.connect` 等操作。
- 让用户策略覆盖仓库策略，并允许后续的组织托管策略覆盖二者。
- 保持评估简单：按顺序应用匹配语句，以最后匹配项为准。

## 非目标

- 策略不配置端点、凭据、模型或提供商选项。
- 策略不能让原本不可用的资源变得可用。
- 策略目前不提供条件、主体、审批提示或强制配置值。
- `tool.use` 语句绝不授予访问权；`allow` 与 `ask` 仍由权限和已保存审批决定。

## 语句结构

```jsonc
{
  "experimental": {
    "policies": [
      {
        "effect": "deny",
        "action": "provider.use",
        "resource": "openai",
      },
    ],
  },
}
```

```ts
interface PolicyInfo {
  effect: "allow" | "deny"
  action: "provider.use" | "tool.use" | "integration.use"
  resource: string
}
```

`ConfigPolicy` 负责语句 schema；`action` 是封闭集合，其他值的语句会在规范化时被丢弃并产生诊断。策略插件在所有其他目录变换之后解释 `provider.use`，在所有其他权限评估钩子之后解释 `tool.use`。

## 匹配

`action` 和 `resource` 都使用 opencode 现有的通配符匹配行为。

示例：

| 操作           | 资源               | 匹配范围                                                        |
| -------------- | ------------------ | --------------------------------------------------------------- |
| `provider.use` | `openai`           | 仅提供商 ID 为 `openai` 的使用操作 |
| `provider.use` | `company-*`        | 使用 `company-us`、`company-eu` 等提供商 ID |
| `tool.use`     | `shell:git push *` | `git push` 的 `shell` 权限，无论是否带参数 |
| `tool.use`     | `*`                | 对所有资源的所有权限检查 |

不存在按模式具体程度决定的优先级。具体资源不会自动优先于通配符资源；编写／评估顺序决定结果。

## 评估

评估操作和资源时：

1. 从 `allow` 开始。
2. 考虑所有 `action` 和 `resource` 与请求操作、资源匹配的语句。
3. 每条匹配语句用自己的 `effect` 替换当前决定。
4. 最后匹配的语句决定结果。

概念示例：

```ts
function evaluate(action: string, resource: string, fallback: Policy.Effect, statements: Policy.Info[]) {
  return (
    statements.findLast(
      (statement) => Wildcard.match(action, statement.action) && Wildcard.match(resource, statement.resource),
    )?.effect ?? fallback
  )
}
```

每个调用者为自身操作提供适当的默认效果。目录中的提供商使用默认 `"allow"`，因此没有提供商策略语句时延续正常行为：允许使用其他条件满足的提供商。

## 单个配置文档内的顺序

语句保留用户编写顺序。

要拒绝 Anthropic 以外的所有提供商：

```jsonc
{
  "experimental": {
    "policies": [
      {
        "effect": "deny",
        "action": "provider.use",
        "resource": "*",
      },
      {
        "effect": "allow",
        "action": "provider.use",
        "resource": "anthropic",
      },
    ],
  },
}
```

结果：

```text
provider.use / anthropic -> allow
provider.use / openai    -> deny
```

要允许内部提供商，但排除实验性提供商：

```jsonc
{
  "experimental": {
    "policies": [
      { "effect": "deny", "action": "provider.use", "resource": "*" },
      { "effect": "allow", "action": "provider.use", "resource": "company-*" },
      { "effect": "deny", "action": "provider.use", "resource": "company-experimental-*" },
    ],
  },
}
```

结果：

```text
company-stable: allowed
company-experimental-fast: denied
openai: denied
```

## 多个手工配置文档之间的顺序

普通设置和策略需要不同的优先级：

- 普通设置按正序读取，因此 Location 特定设置覆盖用户全局设置。
- 策略将手工配置文档逆序读取，因此用户全局策略可覆盖仓库策略。
- 每个文档内部的语句仍保持编写顺序。

至少，这意味着仓库不能静默重新启用用户全局拒绝的资源。

项目配置：

```jsonc
{
  "experimental": {
    "policies": [{ "effect": "allow", "action": "provider.use", "resource": "openai" }],
  },
}
```

用户全局配置：

```jsonc
{
  "experimental": {
    "policies": [{ "effect": "deny", "action": "provider.use", "resource": "openai" }],
  },
}
```

结果：

```text
provider.use / openai -> deny
```

直接项目文件与 `.opencode` 文件之间的相对策略优先级，有意留待 `.opencode` 配置评审时确定。

## 组织托管策略

组织托管策略不是普通手工配置。托管语句追加在逆序手工语句之后，因此具有最终决定权：组织的 `deny` 不能被仓库或用户的 `allow` 解除；组织的 `allow` 则会解除低优先级的 `deny`。

```text
repository policy -> user-global policy -> organization-managed policy
```

### 下发

OpenCode Console 将工作区的提供商和工具策略编译为面向已认证调用者的语句，通过 `GET /api/v2/config` 与托管提供商一同返回：

```jsonc
{
  "providers": { "opencode": {} },
  "experimental": {
    "policies": [
      { "action": "provider.use", "resource": "*", "effect": "deny" },
      { "action": "provider.use", "resource": "opencode", "effect": "allow" },
      { "action": "tool.use", "resource": "shell:sudo *", "effect": "deny" },
    ],
  },
}
```

- 调用者没有语句时省略 `experimental`；省略与空数组等价。
- 列表按调用者生成，顺序有意义。客户端按收到的原样保存，绝不重排、去重或规范化语句。
- Console 插件的每个请求（包括本次获取和 token 刷新）都携带 `User-Agent`：`opencode/<channel>/<version>/<app>`。Console 据此判断成员运行的 OpenCode 版本，以及它是否会评估下发语句；否则，忽略语句的旧构建与执行语句的构建无法区分。
- `ManagedPolicy`（`packages/core/src/managed-policy.ts`）在进程全局保存当前语句和组织名称。Console 插件（`opencode.provider.opencode`）每次应用配置快照时写入，策略插件在评估时同步读取。
- 语句随 Console 插件快照和连接变化：切换凭据会替换，断开连接或 Console 返回 404 会清除。不同连接的语句绝不合并。
- 新鲜度与快照一致：下次轮询（约一分钟）或下次凭据切换时更新。

### 失败

现有连接的配置获取或凭据刷新失败时，保留该连接最后的配置、提供商和语句，并记录警告。丢弃配置会使托管提供商默认不可用，却让策略默认放行，因为成员个人凭据仍能工作，而组织限制消失。断开连接、切换凭据或返回 404 仍会替换快照。没有持久化离线缓存。

### 提示消息

如果决定拒绝的 `tool.use` 语句由组织托管，提示为 `Blocked by <organization>'s policy`（被该组织策略阻止）；连接没有组织名时为 `Blocked by your organization's policy`（被你的组织策略阻止）。手工语句对应 `Blocked by configuration policy`（被配置策略阻止）。

### 保护

不得允许插件添加、移除或覆盖策略语句。插件可以贡献功能或配置的提供商；策略决定 opencode 是否允许通过其托管执行路径进行操作。

配置中的插件 `remove` 操作无论使用何种选择器（`-*`、`-opencode.*` 或准确 ID），都忽略 `opencode.config.policy` 和 `opencode.provider.opencode`。否则仓库可关闭策略执行，或关闭获取组织语句的流程。

提供商策略不是可执行插件的完整沙箱。被拒绝的提供商不得通过正常提供商／模型路径使用；如果合规要求覆盖任意插件代码，则需要另行治理。

## 工具策略

`tool.use` 是唯一的工具策略操作。允许语句绝不覆盖智能体／会话的拒绝，也不会授予已保存审批。

Console 托管配置忽略未知字段，跳过不支持的操作语句，并保留所有受支持语句的顺序。未来新增操作不能使响应中的提供商或已支持策略失效。受支持操作仍必须有有效的 resource 和 effect；格式错误的受支持语句仍属于配置错误。被跳过的操作不会由该客户端执行。手工配置会丢弃不支持的语句并产生诊断。

`tool.use` 语句在 `permission.evaluate` 钩子中运行，位于智能体和会话规则、已保存审批及所有其他插件钩子之后。对工具检查的每个资源，将 `<action>:<resource>` 字符串与语句资源匹配；任意资源最后匹配的语句为 `deny` 时，评估变为 `deny`，并显示上述提示。

```text
tool.use / shell:sudo ls        -> deny   (statement shell:sudo *)
tool.use / shell:git status     -> unchanged: the agent's rules decide allow or ask
```

- 智能体或会话规则配置的 `deny`，在钩子运行前就已拒绝。
- 语句 `deny` 覆盖 `allow` 和 `ask`，包括已保存的“始终允许”审批。
- 语句 `allow` 不授予权限，只解除之前范围更广的语句 `deny`。

## 技能集成策略

技能使用自身 OpenCode ID（如有命名空间则包含命名空间）。被拒绝技能不会出现在客户端目录或模型指导中，也不能通过 skill 工具、提示中的提及或独立激活加载。

```jsonc
{
  "experimental": {
    "policies": [
      { "action": "integration.use", "resource": "skill:*", "effect": "deny" },
      { "action": "integration.use", "resource": "skill:team:review", "effect": "allow" },
    ],
  },
}
```

受保护的末端配置策略插件通过 `ctx.skill.transform` 过滤 `skill:<id>`，沿用提供商和 MCP 目录模式。技能领域不解释策略语句。配置和托管策略变化会重载目录，在变换后的值可见后发布更新。移除限制会恢复已注册技能，无需重装。全局集成允许列表也会排除技能，除非显式允许其 ID。技能策略不会删除已存储在会话历史中的内容，也不会对插件文件系统访问实施沙箱隔离。

插件钩子受现有插件集成资源管理：阻止外部插件会阻止其导入，或卸载其活动代次（包括钩子）。没有单独的钩子资源；必需的内置策略插件和 Console 认证插件仍受保护。

## 与提供商配置的关系

```jsonc
{
  "providers": {
    "company-ai": {
      "package": "@opencode/ai/providers/openai-compatible",
      "settings": { "baseURL": "https://ai.company.example/v1" },
    },
  },
  "experimental": {
    "policies": [
      { "effect": "deny", "action": "provider.use", "resource": "*" },
      { "effect": "allow", "action": "provider.use", "resource": "company-ai" },
    ],
  },
}
```

提供商条目配置 `company-ai`；策略语句使它成为唯一允许使用的提供商。

无论提供商如何被发现或变得可用，提供商策略都适用，包括：

- models.dev 目录数据
- 环境凭据
- 已保存账户
- 内置提供商插件
- 显式提供商配置

## 应用提供商策略

在检查提供商策略前，先组装提供商记录和模型覆盖设置。否则后续提供商加载可能重新创建已过滤的提供商。

流程：

1. 构建提供商／模型目录条目，包括已连接 Console 托管的提供商。
2. 应用配置的提供商和模型覆盖设置。
3. 对逆序手工语句和随后追加的组织托管语句运行末端配置策略变换。
4. 移除被最后匹配的 `provider.use` 语句拒绝的提供商。

配置重载会刷新插件策略快照并重建目录。Console 快照变化会通知策略插件重建目录，并重新运行末端变换。

## 旧版迁移

旧版拒绝列表：

```jsonc
{
  "disabled_providers": ["openai", "google"],
}
```

等价的 V2 策略：

```jsonc
{
  "experimental": {
    "policies": [
      { "effect": "deny", "action": "provider.use", "resource": "openai" },
      { "effect": "deny", "action": "provider.use", "resource": "google" },
    ],
  },
}
```

旧版允许列表：

```jsonc
{
  "enabled_providers": ["anthropic", "openai"],
}
```

等价的 V2 策略：

```jsonc
{
  "experimental": {
    "policies": [
      { "effect": "deny", "action": "provider.use", "resource": "*" },
      { "effect": "allow", "action": "provider.use", "resource": "anthropic" },
      { "effect": "allow", "action": "provider.use", "resource": "openai" },
    ],
  },
}
```

## MCP 集成策略

受保护的末端配置策略插件通过 `ctx.mcp.transform`，将 `integration.use` 语句应用于 `mcp:<server-name>`。在配置和插件提供的目录条目组装完成后，它移除被拒绝的服务器。MCP 领域负责连接和资源清理，不解释策略语句。

插件激活会批量注册目录，因此被拒绝服务器不会建立初始连接。配置和托管策略更新会重载目录。移除已有服务器会关闭连接，并移除其工具、指令、提示、资源和资源模板。显式连接以及直接工具、提示、资源调用，对已移除服务器通过常规“未找到”路径拒绝。再次允许服务器会恢复其目录条目并重新连接。

策略先评估手工语句，再评估组织语句，以最后匹配项决定访问。API 添加的服务器覆盖设置也是同一目录的输入，因此同样经过策略变换。目录移除不会为任意可执行插件提供沙箱；插件导入治理仍是独立的 `plugin:*` 集成策略检查。
