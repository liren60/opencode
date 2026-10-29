# 目录／配置／插件生命周期方案

状态：**历史决策记录。** 已选择并实现方案 B，即 Location 作用域内可重放的 Catalog 变换。以下所有接口和流程都是历史方案草图，不是现行 API 参考；当前行为以 Core 为准。

此决策比较了提供商／模型输入放在哪里，以及启动后可见目录状态如何变化。以下设计保留了这次比较。

## 场景

- 初次加载：打开 Location，激活内置／已配置插件，构建首个可见目录。
- 配置：手工编写的提供商／模型定义和覆盖设置。
- models.dev：通过定时器刷新远程提供商／模型数据。
- 认证：活动凭据启用／配置提供商，凭据之后可能失效或消失。
- 插件激活：Location 打开期间，插件开始贡献内容。
- 插件禁用：插件停止贡献，其影响必须消失。
- 配置编辑：Location 打开期间，手工配置发生变化。
- 策略：提供商已存在后，允许／拒绝使用的选择发生变化。

## A. 已否决：配置变换与服务重载

`Config` 按顺序合并文档，然后运行有序、可重放的插件变换。每个变换是一个接收 `Draft<Config.Info>` 的回调，可修改任意配置字段。

```ts
type ConfigTransform = (config: Draft<Config.Info>) => void

const transform = yield * Config.transform()

yield *
  transform((config) => {
    config.providers ??= {}
    config.providers.acme = {
      /* ... */
    }
    config.model = "acme/code"
    config.permissions = [
      /* ... */
    ]
  })
```

由于变换可修改配置的任何部分，变换变化时不能安全地只触发 `Catalog.reload()` 或其他局部服务重载。所有依赖配置的服务都必须根据新变换后的配置原地重载。

```ts
const transform = yield* Config.transform()
yield* transform((draft) => mutateAnyConfigField(draft))
  → Reload.all()
    → Policy.reload()
    → Catalog.reload()
    → Agent.reload()
    → MCP.reload()
    → other config-consuming services reload
```

### 初次加载

已配置插件的安装／更新不应阻塞 Location 就绪。先根据手工配置和快速内置插件构建初始快照，再在后台激活慢插件，并合并由此产生的重载请求。

```ts
LocationServiceMap.get(ref)
  → build location layer
    → Config.layer reads authored documents
      → merge authored documents
      → run currently active Config transforms
    → Policy.layer reads transformed Config
    → Catalog.layer reads transformed Config
      → materialize baseline provider/model catalog
  → PluginBoot baseline ready
    → Frontend.fetchCatalog()

PluginBoot background fiber
  → install/update plugin packages concurrently
  → activate completed plugins
    → Config.transform()
      → transform(updateConfig)
    → ReloadScheduler.request()
      → debounce short burst of completed activations
      → Reload.all()
        → Config.get()
          → run newly active Config transforms
        → Catalog.reload()
          → Catalog.Event.Updated
            → Frontend.refetchCatalog()
```

初始层构建不是重载。只有活动 Location 变化后，例如后台插件激活或配置来源变化，才运行 `Reload.all()`。多个插件相近时间完成时，防抖可减少重复的全服务重载；每批仍重载所有使用配置的服务，因为配置变换可修改任意字段。

### 配置

```ts
config file loaded
  → config source/watch trigger records new documents
    → Reload.all()
      → Policy.reload()
      → Catalog.reload()
        → Catalog.Event.Updated
          → Frontend.refetchCatalog()
```

### models.dev 数据刷新

```ts
timer fires
  → ModelsDevPlugin.refresh()
    → ModelsDev.get()
    → transform(applyModelsDevToConfig)
    → Reload.all()
      → Policy.reload()
      → Catalog.reload()
        → Catalog.Event.Updated
          → Frontend.refetchCatalog()
```

`Catalog` 不知道 `ModelsDev` 的存在；插件在目录读取配置前变换配置。

### 认证

```ts
Account.switched(providerID)
  → AuthPlugin.refresh(providerID)
    → Account.active(providerID)
    → transform(applyAuthToConfig)
    → Reload.all()
      → Policy.reload()
      → Catalog.reload()
        → Catalog.Event.Updated
          → Frontend.refetchCatalog()
```

### 插件激活

```ts
Plugin.activate("acme-models")
  → Config.transform()
    → transform(applyAcmeConfig)
  → Reload.all()
    → Policy.reload()
    → Catalog.reload()
      → Catalog.Event.Updated
        → Frontend.refetchCatalog()
```

### 插件禁用

```ts
Plugin.disable("company-naming")
  → close plugin scope
    → Config internally unregisters transform in finalizer
  → Reload.all()
    → Policy.reload()
    → Catalog.reload()
      → sonnet.name = "Sonnet"
      → Catalog.Event.Updated
        → Frontend.refetchCatalog()
```

### 配置编辑

```ts
file watcher sees edit
  → config source/watch trigger records updated documents
  → Reload.all()
    → Policy.reload()
    → Catalog.reload()
      → Catalog.Event.Updated
        → Frontend.refetchCatalog()
```

### 策略

```ts
policy config changes
  → config source/watch trigger records updated documents
  → Reload.all()
    → Policy.reload()
    → Catalog.reload()
      → apply updated policy
      → Catalog.Event.Updated
        → Frontend.refetchCatalog()
```

### 权衡

- 插件接收 `Draft<Config.Info>`，可查看先前的配置状态，并通过可重放变换修改任意配置字段。
- 禁用插件会移除其配置变换，让服务重新构建状态，无需手动撤销。
- models.dev 和认证成为配置变换，而非目录依赖。
- `Config` 负责变换可见字段的合并／顺序语义。
- 配置变换可修改任何内容，因此局部服务重载不安全；任意变换变化后，所有使用配置的服务都需重载。
- `Catalog` 依赖提供商／模型配置语义，是全服务重载的一部分。
- 一次重载最多产生一个 `Catalog.Event.Updated` 通知。
- 延迟插件激活避免阻塞就绪，但启动期间插件陆续完成可能造成多批全服务重载。

## B. 已选择：目录变换

插件注册可重放的目录变换。每个变换接收 `Catalog.Editor`，其辅助方法修改私有目录草稿；`Catalog` 根据活动变换重新构建可见记录。

```ts
interface Catalog {
  transform(): Effect.Effect<(update: (catalog: Catalog.Editor) => void) => Effect.Effect<void>, never, Scope.Scope>
}
```

```ts
const transform = yield* Catalog.transform()
yield* transform(update)
  → replace this transform callback
  → apply active transforms in registration order
  → apply policy
  → commit diff
    → Event.publish(Catalog.Event.Updated)
      → Frontend.refetchCatalog()
```

### 初次加载

已配置插件的安装／更新不应阻塞 Location 就绪。先根据立即可用的来源构建初始目录，再在后台激活慢插件，并合并刷新请求。

```ts
LocationServiceMap.get(ref)
  → build location layer
    → Catalog.layer creates empty catalog state
    → PluginBoot.layer activates immediately available plugins
      → ConfigProviderPlugin installs Catalog.transform()
      → ModelsDevPlugin installs Catalog.transform()
      → AuthPlugin installs Catalog.transform()
    → Catalog.layer applies active transforms during boot
    → apply policy
    → materialize baseline provider/model catalog
  → PluginBoot baseline ready
    → Frontend.fetchCatalog()

PluginBoot background fiber
  → install/update plugin packages concurrently
  → activate completed plugins
    → Catalog.transform()
      → transform(updateCatalog)
        → Catalog internally rebuilds
          → Catalog.Event.Updated
            → Frontend.refetchCatalog()
```

每个完成激活的插件调用其变换时，都会重建目录。对插件完成进行防抖，需要显式添加批处理／暂停重建机制；变换接口本身不提供此能力。

### 配置

```ts
config file loaded
  → ConfigProviderAdapter.load()
    → transform(applyConfigToCatalog)
      → Catalog internally rebuilds
```

### models.dev 数据刷新

```ts
timer fires
  → ModelsDevPlugin.refresh()
    → ModelsDev.get()
    → transform(applyModelsDevToCatalog)
      → Catalog internally rebuilds
      → commit diff
```

### 认证

```ts
Account.switched(providerID)
  → AuthPlugin.refresh()
    → transform(applyAuthToCatalog)
      → Catalog internally rebuilds
        → replay active transforms including current auth
        → apply policy
        → commit diff
```

### 插件激活

```ts
Plugin.activate("acme-models")
  → Catalog.transform()
    → transform(applyAcmeToCatalog)
    → Catalog internally rebuilds
      → commit diff
```

### 插件禁用

```ts
Plugin.disable("company-naming")
  → close plugin scope
    → Catalog internally unregisters transform in finalizer
    → Catalog internally rebuilds
      → sonnet.name = "Sonnet"
      → commit diff
```

### 配置编辑

```ts
file watcher sees edit
  → ConfigProviderAdapter.load()
    → transform(applyUpdatedConfigToCatalog)
      → Catalog internally rebuilds
```

### 策略

```ts
policy changes
  → Catalog rebuild trigger
    → replay all active transforms
    → apply updated policy last
    → commit diff
```

### 权衡

- 禁用、来源刷新和策略重新评估都是变换重放操作。
- 认证不必表示成配置。
- 配置只是目录来源之一，而非目录依赖。
- API 结构与 A 相同，但可变草稿是目录状态，而非配置状态。
- 除读取外，目录还需要变换顺序和内部重建行为。
- 必须明确重新计算顺序、串行化和差异事件。
- 一次内部重建最多产生一个 `Catalog.Event.Updated` 通知。
- 延迟插件激活避免阻塞就绪，且只有目录变换变化才重建目录。
- 对这些重建进行防抖，需要额外批处理接口，或在暴露更新前安装多个变换的激活协调器。
