import { API_URL } from "@/lib/api";

export type ChatRole = "user" | "assistant";

export type ChatHistoryMessage = {
  role: ChatRole;
  content: string;
};

export type ChatStreamEvent =
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export async function streamChat(
  message: string,
  history: ChatHistoryMessage[],
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal,
) {
  if (!API_URL) throw new Error("The assistant is not connected yet.");

  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ message, history: history.slice(-8) }),
    signal,
  });
  if (!response.ok) throw new Error("The assistant is temporarily unavailable.");
  if (!response.body) throw new Error("The assistant returned an empty response.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const consume = (chunk: string) => {
    buffer += chunk;
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const event = block.match(/^event:\s*(\w+)\s*$/m)?.[1];
      const data = block.match(/^data:\s*(.+)$/m)?.[1];
      if (!event || !data) continue;
      const payload = JSON.parse(data) as Record<string, string>;
      if (event === "token" && payload.text) onEvent({ type: "token", text: payload.text });
      if (event === "done") onEvent({ type: "done" });
      if (event === "error") onEvent({ type: "error", message: payload.message || "Request failed." });
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (value) consume(decoder.decode(value, { stream: !done }));
    if (done) break;
  }
  consume(decoder.decode());
}
