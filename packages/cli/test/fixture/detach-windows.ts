import { dlopen, ptr } from "bun:ffi"
import { clearInheritedHandles } from "../../src/services/detach-windows"

const library = dlopen("kernel32.dll", {
  CreateEventW: { args: ["ptr", "i32", "i32", "ptr"], returns: "u64" },
  GetHandleInformation: { args: ["u64", "ptr"], returns: "i32" },
  WaitForSingleObject: { args: ["u64", "u32"], returns: "u32" },
  CloseHandle: { args: ["u64"], returns: "i32" },
})
const security = Buffer.alloc(24)
security.writeUInt32LE(24, 0)
security.writeUInt32LE(1, 16)
const handle = library.symbols.CreateEventW(ptr(security), 1, 0, null)
const flags = Buffer.alloc(4)
try {
  const beforeValid = library.symbols.GetHandleInformation(handle, ptr(flags))
  const before = flags.readUInt32LE(0)
  clearInheritedHandles()
  const afterValid = library.symbols.GetHandleInformation(handle, ptr(flags))
  const after = flags.readUInt32LE(0)
  console.log(JSON.stringify({ beforeValid, before, afterValid, after, wait: library.symbols.WaitForSingleObject(handle, 0) }))
} finally {
  library.symbols.CloseHandle(handle)
  library.close()
}
