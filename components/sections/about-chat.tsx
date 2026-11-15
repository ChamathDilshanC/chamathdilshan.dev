"use client";

import { IconSparkles } from "@tabler/icons-react";
import { useRef, useState } from "react";
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
    <div className="group relative isolate flex w-full flex-col gap-6 overflow-hidden rounded-[28px] border border-white/75 bg-white/55 p-5 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl m:rounded-[34px] m:p-7.5">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 -z-10 size-64 rounded-full bg-orange-300/35 blur-3xl transition-transform duration-700 group-hover:scale-125" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 -z-10 size-64 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-black-a60 shadow-sm backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-glow-orange shadow-[0_0_12px_#f75001]" />
            AI portfolio assistant
          </div>
          <p className="type-body-1 text-black-token">Ask about Chamath</p>
          <p className="mt-1 type-body-4 text-black-a60">A fast, focused way to explore the work.</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full border border-white/80 bg-white/60 text-glow-orange shadow-sm backdrop-blur-md">
          <IconSparkles aria-hidden className="size-4" />
        </div>
      </div>

      <div className="flex min-h-44 flex-col gap-4 overflow-y-auto rounded-[22px] border border-white/65 bg-white/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md m:p-4">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <MatrixOrb state="idle" size={112} color="#F75001" dots={9} labels={{ idle: "Ready" }} />
            <p className="max-w-60 type-body-4 text-black-a60">{STARTER}</p>
          </div>
        ) : (
          messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="self-end rounded-2xl rounded-br-md bg-black-token px-4 py-3 type-body-3 text-white-token shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]">
                {message.content}
              </div>
            ) : (
              <div key={message.id} className="rounded-2xl rounded-bl-md border border-white/75 bg-white/70 px-4 py-3 text-black-token shadow-sm backdrop-blur-xl">
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
        <div className="rounded-full border border-white/75 bg-white/55 p-1 shadow-sm backdrop-blur-md">
          <MatrixOrb state={streaming ? "thinking" : "listening"} size={42} color="#F75001" dots={7} labels={{ listening: "", thinking: "" }} />
        </div>
        <PromptBox
          className="min-w-0 flex-1 rounded-[22px] border-white/80 bg-white/65 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.4)] backdrop-blur-xl"
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
