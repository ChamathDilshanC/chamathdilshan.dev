"use client";

import { IconSparkles } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import MatrixOrb from "@/components/ui/matrix-orb";
import PromptBox from "@/components/ui/prompt-box";
import StreamingResponse from "@/components/ui/streaming-response";
import { streamChat, type ChatHistoryMessage } from "@/lib/chat";

type Message = ChatHistoryMessage & { id: number; status?: "streaming" | "done" };

const STARTER = "Ask me about Chamath's work, projects, or experience.";

export function AboutChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }, [messages]);

  const submit = async (value: string) => {
    const message = value.trim();
    if (!message || streaming) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const userId = Date.now();
    const assistantId = userId + 1;
    const history = messages.map(({ role, content }) => ({ role, content }));
    setError("");
    setStreaming(true);
    setMessages((current) => [
      ...current,
      { id: userId, role: "user", content: message },
      { id: assistantId, role: "assistant", content: "", status: "streaming" },
    ]);

    try {
      await streamChat(message, history, (event) => {
        if (event.type === "token") {
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantId ? { ...item, content: item.content + event.text } : item,
            ),
          );
        } else if (event.type === "error") {
          setError(event.message);
        }
      }, controller.signal);
      setMessages((current) =>
        current.map((item) => (item.id === assistantId ? { ...item, status: "done" } : item)),
      );
    } catch (reason) {
      if ((reason as Error).name !== "AbortError") {
        setError(reason instanceof Error ? reason.message : "The assistant is unavailable.");
        setMessages((current) => current.filter((item) => item.id !== assistantId));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages((current) =>
      current.map((item) => (item.status === "streaming" ? { ...item, status: "done" } : item)),
    );
  };

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col gap-6 overflow-hidden rounded-[5px] border border-black-a10 bg-transparent p-5 m:p-7.5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="type-body-1 text-black-token">Ask about Chamath</p>
          <p className="mt-1 type-body-4 text-black-a60">A quick portfolio assistant</p>
        </div>
        <IconSparkles aria-hidden className="size-5 text-glow-orange" />
      </div>

      <div ref={messagesRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <MatrixOrb state="idle" size={112} color="#F75001" dots={9} labels={{ idle: "Ready" }} />
            <p className="max-w-60 type-body-4 text-black-a60">{STARTER}</p>
          </div>
        ) : (
          messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="mb-4 ml-auto w-fit max-w-[85%] rounded-[5px] bg-black-token px-3.5 py-2.5 type-body-3 text-white-token">
                {message.content}
              </div>
            ) : (
              <div key={message.id} className="mb-4 rounded-[5px] bg-neutral-50 px-3.5 py-3 text-black-token">
                <StreamingResponse
                  text={message.content || "Thinking…"}
                  status={message.status ?? "done"}
                  actions={false}
                  speed={18}
                  className="text-black-token"
                />
              </div>
            ),
          )
        )}
      </div>

      {error && <p role="alert" className="type-body-4 text-red-700">{error}</p>}
      <div className="flex items-center gap-3">
        <MatrixOrb state={streaming ? "thinking" : "listening"} size={42} color="#F75001" dots={7} labels={{ listening: "", thinking: "" }} />
        <PromptBox
          className="min-w-0 flex-1"
          status={streaming ? "streaming" : "idle"}
          onSubmit={(value) => void submit(value)}
          onStop={stop}
          placeholder="Ask a question…"
          hint="Press enter to send"
          efforts={[{ id: "quick", label: "Quick" }]}
        />
      </div>
    </div>
  );
}
