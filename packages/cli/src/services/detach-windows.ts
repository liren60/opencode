import { dlopen, ptr } from "bun:ffi"

/** Prevent the short-lived launcher from forwarding its inherited Electron endpoints. */
export function clearInheritedHandles() {
  const nt = dlopen("ntdll.dll", {
    NtQuerySystemInformation: { args: ["u32", "ptr", "u32", "ptr"], returns: "i32" },
  })
  const kernel = dlopen("kernel32.dll", {
    SetHandleInformation: { args: ["u64", "u32", "u32"], returns: "i32" },
    GetLastError: { args: [], returns: "u32" },
  })
  try {
    const required = Buffer.alloc(4)
    let size = 16 * 1024 * 1024
    let table = Buffer.alloc(size)
    while (true) {
      const status = nt.symbols.NtQuerySystemInformation(64, ptr(table), table.length, ptr(required))
      if (status === 0) break
      if ((status >>> 0) !== 0xc0000004) throw new Error(`Failed to inspect launcher handles: NTSTATUS ${status}`)
      size = Math.max(size * 2, required.readUInt32LE(0))
      table = Buffer.alloc(size)
    }
    // SYSTEM_HANDLE_INFORMATION_EX has a two-ULONG_PTR header and 40-byte entries on Windows x64.
    // Only this worker's inherit flags change. Handles remain open until its normal process exit;
    // the subsequent spawn establishes its own explicit stderr handle.
    const count = Number(table.readBigUInt64LE(0))
    for (let index = 0; index < count; index++) {
      const offset = 16 + index * 40
      if (table.readBigUInt64LE(offset + 8) !== BigInt(process.pid)) continue
      if ((table.readUInt32LE(offset + 32) & 2) === 0) continue
      if (kernel.symbols.SetHandleInformation(table.readBigUInt64LE(offset + 16), 1, 0) === 0)
        throw new Error(`Failed to clear launcher handle inheritance: Windows error ${kernel.symbols.GetLastError()}`)
    }
  } finally {
    kernel.close()
    nt.close()
  }
}
