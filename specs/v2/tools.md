# V2 工具

状态：**现行语义概述。** Plugin 包负责公共工具类型；Core 负责注册、执行和通用输出大小限制。

## 工具

V2 为本地可执行工具提供统一的结构化工具值。类型化工具同时声明 schema 和执行逻辑：

```ts
const read = Tool.make({
  description: "Read a file",
  input: Schema.Struct({ path: Schema.String }),
  output: Schema.Struct({ content: Schema.String }),
  execute: ({ path }, context) =>
    readFile(path, context).pipe(Effect.map((output) => ({ output, content: output.content }))),
})
```

一个工具响应可携带三个值：声明并经 schema 校验的 `output` 是 Code Mode 接收的临时机器值；`content` 是持久化保存、面向模型的值；可选 `metadata` 是供工具专用界面使用的精简 JSON。没有 `output` 的工具有意只返回模型可见的 `content` 和可选 `metadata`。动态 MCP 和清单工具使用相同结构，搭配运行时 JSON Schema。

内置工具和静态编写的插件工具使用同一构造器和执行契约。

`Tool.Tool` 是透明的结构化值，恰好包含一个 `execute` 函数。它接受 Effect schema，以及同时实现 Standard Schema V1 和 Standard JSON Schema V1 的 schema。Tool 模块派生不含执行逻辑、面向模型的 `LLM.ToolDefinition` 值，并为注册表执行工具；调用者通常依赖 `Tool.make` 的类型推断，而不显式写出嵌套类型。

标准输入 schema 将模型输入校验为工具输入。标准输出 schema 将工具响应的 `output` 校验为 Code Mode 机器值。Effect 编解码器保留原生的输入解码和输出编码方向。

输入和输出编解码器是自包含的。Schema 转换不能依赖服务。工具依赖在构建时获取，并由 `execute` 捕获。

## 每个调用都有持久化标识

每个本地工具都接收同样的具体调用上下文：

```ts
interface Tool.Context {
  readonly sessionID: Session.ID
  readonly agent: Agent.ID
  readonly messageID: SessionMessage.ID
  readonly callID: string
  readonly progress: (update: Progress) => Effect.Effect<void>
}
```

`messageID` 是包含该调用的助手消息的持久化 ID。Session 运行器负责此关联，并向注册表提供完整上下文；注册表不会自行推断。`callID` 与持久化事件使用相同的调用标识。

解码后的工具输入单独传给 `execute`。原始提供商输入和领域服务不属于调用上下文。

Effect 中断是取消机制。工具可以将预期的类型化失败转换为 `ToolFailure`，但不得将中断或 defects 转换为模型可见的失败。

## 注册受作用域管理

工具在注册时命名：

```ts
yield *
  tools.register({
    read,
    write,
    grep,
  })
```

记录键就是编写者指定的名称。注册时先规范化，再派生实际面向模型的名称。可复用工具值本身没有名称。

```ts
interface Tools {
  readonly register: (
    tools: Readonly<Record<string, Tool.Any>>,
    options?: Tool.RegisterOptions,
  ) => Effect.Effect<void, Tool.RegistrationError, Scope.Scope>
}
```

注册会将不支持的名称字符替换为 `_`，并将 `execute` 保留给 Code Mode。

Location 插件仅获得受限的 `Tools` 注册能力，不接触内部注册表。每次激活都会获取 Location 服务，构建工具，并在新建的插件自有 Scope 内注册。

在同一个会话位置内：

- 同名工具以最新的活动注册为准。
- 关闭一个注册只移除该注册。
- 关闭当前生效的注册，会显露次新的活动注册。
- 后续修改调用者的注册记录，不改变已捕获的注册。

## 内置工具使用同一契约

内置工具使用同一工具 API，同时捕获可信的 Location 服务：

```ts
const filesystem = yield * FileSystem.Service
const permission = yield * PermissionV2.Service
const tools = yield * Tools.Service

yield *
  tools.register({
    grep: Tool.make({
      description: "Search file contents",
      input: Input,
      output: Output,
      execute: (input, context) =>
        Effect.gen(function* () {
          const root = yield* filesystem.resolveRoot(input)

          yield* permission.assert({
            sessionID: context.sessionID,
            agent: context.agent,
            source: {
              type: "tool",
              messageID: context.messageID,
              callID: context.callID,
            },
            action: "grep",
            resources: [input.pattern],
            save: ["*"],
            metadata: { root: root.resource },
          })

          return yield* filesystem.grep(input, root)
        }).pipe(/* translate expected typed errors to ToolFailure */),
    }),
  })
```

可信工具负责构造权限请求并安排顺序。`PermissionV2` 评估策略并管理审批。注册表不会注入 `assertPermission` 辅助函数。

共用工具类型不意味着权限相同。内置工具和可信 Location 插件可能捕获应用工具无法获取的服务。

## 请求捕获工具值

Location 作用域注册表通过请求级快照，将向模型公布的 LLM 定义与捕获的工具配对，负责实际查找和执行。每个本地调用依次进行：

1. 解析一个实际生效的具名注册。
2. 用输入编解码器解码提供商输入。
3. 使用运行器提供的上下文执行工具。
4. 用输出编解码器编码返回值；编码值是供 Code Mode 使用的临时机器输出。
5. 将工具响应规范化为标准的非空模型内容和可选 JSON 元数据。
6. 限制模型内容大小；校验元数据，对无效或过大的值发出警告并丢弃，而非使调用失败。
7. 将标准结果和托管输出路径传给 `execute.after` 钩子。
8. 向运行器返回一个 `ToolOutcome` 以便持久化发布：成功时包含 output、content 和可选 metadata；失败时包含错误和可选的最终部分结果快照。

无效输入绝不执行工具。无效输出绝不产生成功执行结果。

带有输出的工具省略 `content` 时，编码后的字符串成为一个文本项，其他编码 JSON 则序列化一次。不带 `output` 的工具必须提供非空模型内容。

每个模型请求捕获所有已公布名称的有效注册。执行使用这些捕获工具；后续注册变化仅影响后续请求。未知、被钩子移除以及最终步骤中的调用，通过同一执行边界分别失败；提供商支持时，最终步骤以 `toolChoice: "none"` 保留工具定义，以保留缓存的提示前缀。

持久化终态事件是自包含的：成功时仅保存非空模型内容和可选元数据；失败时保存一个错误及有大小限制的最终部分进度快照。提供商重放从标准内容派生传输值；协议要求原样保留的提供商托管载荷，存放在提供商自有结果状态中，绝不放入通用结果字段。

## 生产者和注册表负责不同限制

生产者可在完整工具结果产生前限制捕获量或将数据写入临时存储。例如，进程工具可保存无法留在内存中的输出。生产者限制必须准确报告自身造成的数据丢失；它独立于注册表的大小限制，不能声称可重建已丢弃的字节。

工具执行后，注册表限制发给提供商的模型内容：只测量文本部分，原生媒体保持不变并受生产者限制管理；默认截取保留头尾，中间放置省略标记。过大文本保留在托管存储中，并以有大小限制的预览替代；完整保留失败时，执行以操作失败结束，而非发布有数据损失的成功。元数据独立校验和计量，绝不成为无限制的旁路。托管路径不会仅为了保留记录而出现在 `Tool.make` 或工具输出 schema 中。

`execute.after` 钩子接收经过标准化和大小限制的结果，以及内部托管路径。钩子可有意变换该结果；修改后的内容在发布前再次规范化并限制大小。

## 失败处理保留中断语义

不同结果保持区分：

- `ToolFailure` 是预期的模型可见失败。
- 中断取消调用，不是工具结果。
- 非预期类型化错误和 defects 遵循运行器的操作失败策略。
- 未知和无效调用变为明确的模型可见执行错误，不执行工具。

工具只转换明确归类为可恢复的错误。不能在 `execute` 外围笼统捕获所有原因，因为这会吞掉中断和 defects。

## 约束

- **唯一执行入口：** `Tool.make(config)` 只能执行 `config.execute`。
- **编解码边界：** 工具看到解码后的输入；Code Mode 看到经校验的编码输出；模型内容和元数据来自工具响应。
- **标准表示：** 成功调用恰好保存一份模型表示；失败调用恰好保存一个错误，外加最多一份最终部分结果快照。其他视图都在具名边界派生。
- **元数据显式提供：** 响应没有元数据，结果也没有元数据，绝不复制 output 代替。
- **持久化标识：** 调用自有记录使用运行器提供的准确会话、智能体、助手消息和调用 ID。
- **作用域注册：** 关闭 Scope 只移除其对应注册，并显露先前的活动覆盖层。
- **捕获执行：** 调用执行模型请求中公布的已注册工具。
- **逐调用拒绝：** 拒绝一个不可用调用不能使其他调用失败。
- **存储封装：** 领域输出不随模型输出大小限制或保留策略变化。
