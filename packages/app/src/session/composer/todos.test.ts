import { expect, test } from "bun:test"
import type { JsonValue, SessionMessageAssistant } from "@opencode/client/promise"
import { sessionTodos, type Todo } from "./todos"

type TodoCase = { name: string; input: JsonValue; expected: Todo[] }

function message(id: string, todos: JsonValue, name = "todowrite"): SessionMessageAssistant {
  return {
    id,
    type: "assistant",
    agent: "build",
    model: { id: "model", providerID: "provider" },
    time: { created: 1 },
    content: [
      {
        id: `call_${id}`,
        type: "tool",
        name,
        state: { status: "completed", input: { todos }, content: [{ type: "text", text: "updated" }], metadata: {} },
        time: { created: 1, completed: 2 },
      },
    ],
  }
}

const cases: TodoCase[] = [
  { name: "a non-array input", input: { content: "not a list" }, expected: [] },
  {
    name: "invalid entries without losing valid neighbours",
    input: [
      null,
      false,
      42,
      "text",
      [],
      {},
      { content: 7 },
      { content: "" },
      { content: "valid", status: "completed" },
    ],
    expected: [{ content: "valid", status: "completed" }],
  },
  {
    name: "missing and unknown statuses as pending without trimming content",
    input: [{ content: "   " }, { content: "unknown", status: "new-status" }, { content: "invalid", status: false }],
    expected: [
      { content: "   ", status: "pending" },
      { content: "unknown", status: "pending" },
      { content: "invalid", status: "pending" },
    ],
  },
  {
    name: "each admitted status and no extra output fields",
    input: [
      { content: "pending", status: "pending", extra: "ignored" },
      { content: "running", status: "in_progress" },
      { content: "done", status: "completed" },
      { content: "cancelled", status: "cancelled" },
    ],
    expected: [
      { content: "pending", status: "pending" },
      { content: "running", status: "in_progress" },
      { content: "done", status: "completed" },
      { content: "cancelled", status: "cancelled" },
    ],
  },
]

test.each(cases)("projects $name", (item) => {
  expect(sessionTodos([message("input", item.input)])).toStrictEqual(item.expected)
})

test("uses the latest completed todowrite before the revert boundary", () => {
  const first = message("first", [{ content: "first" }])
  const second = message("second", [{ content: "second", status: "in_progress" }])
  const unrelated = message("read", [{ content: "not a todo" }], "read")

  const running: SessionMessageAssistant = {
    ...message("running", []),
    content: [
      {
        id: "call_running",
        type: "tool",
        name: "todowrite",
        state: { status: "running", input: { todos: [{ content: "not completed" }] }, metadata: {} },
        time: { created: 1 },
      },
    ],
  }

  const messages = [first, second, unrelated, running]

  expect(sessionTodos(messages)).toStrictEqual([{ content: "second", status: "in_progress" }])
  expect(sessionTodos(messages, "second")).toStrictEqual([{ content: "first", status: "pending" }])
  expect(sessionTodos(messages, "first")).toStrictEqual([])
  expect(sessionTodos(messages, "missing")).toStrictEqual([{ content: "second", status: "in_progress" }])
})
