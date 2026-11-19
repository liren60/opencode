import type { JsonValue, SessionMessageAssistant, SessionMessageAssistantTool } from "@opencode/client/promise"
import type { SessionDocument } from "../document"
import { CURRENT_SESSION_ID, STORY_MODEL, STORY_TIME, thinkingDocument } from "./current-session-fixtures"

export function storyTool(
  id: string,
  name: string,
  status: "streaming" | "running" | "completed" | "error",
  input: Record<string, JsonValue>,
  options: { metadata?: Record<string, JsonValue>; output?: string; error?: string; raw?: string } = {},
): SessionMessageAssistantTool {
  const state = ((): SessionMessageAssistantTool["state"] => {
    switch (status) {
      case "streaming":
        return { status, input: options.raw ?? JSON.stringify(input) }
      case "running":
        return { status, input, metadata: options.output ? { ...options.metadata, output: options.output } : { ...options.metadata } }
      case "error":
        return {
          status, input,
          error: { type: "ToolExecutionError", message: options.error ?? `${name} failed visibly` },
          metadata: options.metadata,
        }
      case "completed":
        return { status, input, content: [{ type: "text", text: options.output ?? "Complete" }], metadata: options.metadata }
    }
  })()

  const time: SessionMessageAssistantTool["time"] = { created: STORY_TIME }

  if (status !== "streaming") time.ran = STORY_TIME + 100

  if (status === "completed" || status === "error") time.completed = STORY_TIME + 200

  return {
    type: "tool",
    id,
    name,
    state,
    time,
  }
}

export function storyDocument(content: SessionMessageAssistant["content"], busy = false): SessionDocument {
  return {
    sessionID: CURRENT_SESSION_ID,
    messages: [
      ...thinkingDocument.messages,
      {
        id: "msg_tool_projection_assistant",
        type: "assistant",
        agent: "build",
        model: STORY_MODEL,
        content,
        time: busy ? { created: STORY_TIME } : { created: STORY_TIME, completed: STORY_TIME + 300 },
      },
    ],
    status: { type: busy ? "busy" : "idle" },
    diffs: [],
  }
}

export function storyPatchFile(file: string, status: "modified" | "added" = "modified") {
  return {
    file,
    status,
    patch:
      status === "added"
        ? "@@ -0,0 +1 @@\n+export const after = true"
        : "@@ -1 +1 @@\n-export const before = true\n+export const after = true",
    additions: 1,
    deletions: status === "added" ? 0 : 1,
  }
}
