"use client";

import { IconArrowUp, IconSparkles, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import MatrixOrb from "@/components/ui/matrix-orb";
import PromptBox from "@/components/ui/prompt-box";
import StreamingResponse from "@/components/ui/streaming-response";
import { streamChat, type ChatHistoryMessage } from "@/lib/chat";

type Message = ChatHistoryMessage & { id: number; status?: "streaming" | "done" };

const STARTER = "Ask me about Chamath's work, projects, or experience.";
const INSTANT_ABOUT =
  "Independent software engineer building fast, accessible web apps, APIs and cloud platforms for ambitious teams that plan for tomorrow.";

function instantReply(value: string) {
  const question = value.toLowerCase().replace(/\s+/g, " ").trim();
  if (
    [
      "what does chamath do",
      "what do you do",
      "who is chamath",
      "about chamath",
      "tell me about chamath",
      "what kind of work",
    ].some((term) => question.includes(term))
  ) {
    return INSTANT_ABOUT;
  }
  return null;
}

export function AboutChat({ floatingOnly = false }: { floatingOnly?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement && stickToBottomRef.current) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  }, [messages]);

  const handleMessagesScroll = () => {
    const messagesElement = messagesRef.current;
    if (!messagesElement) return;
    const distanceFromBottom =
      messagesElement.scrollHeight - messagesElement.scrollTop - messagesElement.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;
    setShowScrollTop(messagesElement.scrollTop > 160);
  };

  const scrollMessagesToTop = () => {
    messagesRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (value: string) => {
    const message = value.trim();
    if (!message || streaming) return;

    const instant = instantReply(message);
    const userId = Date.now();
    const assistantId = userId + 1;
    const history = messages.map(({ role, content }) => ({ role, content }));
    setError("");
    stickToBottomRef.current = true;

    if (instant) {
      setMessages((current) => [
        ...current,
        { id: userId, role: "user", content: message },
        { id: assistantId, role: "assistant", content: instant, status: "done" },
      ]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
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

  const panel = (
    <div
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded || undefined}
      aria-label={expanded ? "AI portfolio assistant" : undefined}
      className={`relative flex min-h-0 w-full flex-col gap-6 overflow-hidden rounded-[5px] border border-black-a10 bg-transparent p-5 m:p-7.5 ${
        expanded
          ? "h-[min(760px,calc(100svh-32px))] max-w-[960px] bg-white-token shadow-2xl"
          : "h-full"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="type-body-1 text-black-token">Ask about Chamath</p>
          <p className="mt-1 type-body-4 text-black-a60">A quick portfolio assistant</p>
        </div>
        <div className="flex items-center gap-3">
          <IconSparkles aria-hidden className="size-5 text-glow-orange" />
          {expanded && (
            <button
              type="button"
              aria-label="Close expanded chat"
              onClick={() => setExpanded(false)}
              className="flex size-9 items-center justify-center rounded-full border border-black-a10 text-black-a60 transition-colors hover:bg-black/[0.05] hover:text-black-token"
            >
              <IconX aria-hidden className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={messagesRef}
          onScroll={handleMessagesScroll}
          className="flex h-full touch-pan-y flex-col overscroll-contain overflow-y-scroll"
        >
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
        {showScrollTop && (
          <button
            type="button"
            aria-label="Scroll chat to top"
            onClick={scrollMessagesToTop}
            className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-white-token text-black-token shadow-[0_4px_20px_rgb(0_0_0_/_20%)] transition-transform hover:-translate-y-0.5"
          >
            <IconArrowUp aria-hidden className="size-4" />
          </button>
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
          inputProps={{ autoFocus: expanded }}
        />
      </div>
    </div>
  );

  const expandedPanel = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" onClick={() => setExpanded(false)}>
      <div className="flex h-full w-full items-center justify-center" onClick={(event) => event.stopPropagation()}>
        {panel}
      </div>
    </div>
  );

  const launcher = (
    <button
      type="button"
      aria-label="Open AI chat"
      onClick={() => setExpanded(true)}
      className="group fixed right-5 bottom-[5.75rem] z-40 flex size-16 items-center justify-center rounded-full bg-white-token text-glow-orange shadow-[0_4px_24px_rgb(0_0_0_/_25%)] transition-transform duration-300 ease-out hover:-translate-y-1 m:right-7.5 m:bottom-[6.5rem] motion-safe:animate-bounce"
    >
      <span aria-hidden className="absolute inset-0 rounded-full bg-glow-orange/15 motion-safe:animate-ping" />
      <Image
        src="/images/chatbot-robot.png"
        alt=""
        width={72}
        height={72}
        className="relative size-18 object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </button>
  );

  if (floatingOnly) return expanded ? expandedPanel : launcher;
  return expanded ? expandedPanel : <>{panel}{launcher}</>;
}
