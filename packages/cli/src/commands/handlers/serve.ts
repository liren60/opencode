import { Effect, Option } from "effect"
import { Commands } from "../commands"
import { Runtime } from "../../framework/runtime"
import { ServerProcess } from "../../server-process"
import { Service } from "@opencode/client/effect/service"
import { ServiceConfig } from "../../services/service-config"
import { selfCommand } from "../../util/process"

export default Runtime.handler(
  Commands.commands.serve,
  Effect.fnUntraced(function* (input) {
    if (input.service && input.stdio) return yield* Effect.fail(new Error("--service and --stdio cannot be combined"))
    if (input.detach && !input.service) return yield* Effect.fail(new Error("--detach requires --service"))
    if (input.detach) {
      // A long-lived child of Electron on Windows can inherit its GPU/Mojo endpoints. The CLI's
      // own spawn isolates the final service; this launcher exits without stopping that service.
      const command = [...selfCommand(), "serve", "--service"]
      if (Option.isSome(input.hostname)) command.push("--hostname", input.hostname.value)
      if (Option.isSome(input.port)) command.push("--port", String(input.port.value))
      command.push(...input.cors.flatMap((origin) => ["--cors", origin]))
      if (process.env.OPENCODE_SERVICE_DETACH_WORKER === "1") {
        const { OPENCODE_SERVICE_DETACH_WORKER: _worker, ...env } = process.env
        if (process.platform === "win32") {
          const { clearInheritedHandles } = yield* Effect.promise(() => import("../../services/detach-windows"))
          yield* Effect.sync(clearInheritedHandles)
        }
        // Both Windows spawn implementations forward inheritable handles. Clear that inherited
        // set in this worker first; the explicit stderr channel still forwards startup errors.
        Bun.spawn(command, { env, stdin: "ignore", stdout: "ignore", stderr: "inherit", detached: true }).unref()
        return
      }
      const options = yield* ServiceConfig.options({ checkVersion: true })
      yield* Service.ensure({
        ...options,
        env: { ...options.env, OPENCODE_SERVICE_DETACH_WORKER: "1" },
        command: [...command, "--detach"],
      })
      return
    }
    return yield* ServerProcess.run({
      mode: input.service ? "service" : input.stdio ? "stdio" : "default",
      hostname: Option.getOrUndefined(input.hostname),
      port: Option.getOrUndefined(input.port),
      cors: input.cors.length > 0 ? input.cors : undefined,
    })
  }),
)
