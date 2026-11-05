"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import useSWR from "swr";
import { AuthFrame } from "@/components/admin/auth-frame";
import { ADMIN } from "@/components/admin/shell";
import { Button, ErrorBanner, Spinner } from "@/components/admin/ui";
import { AdminApiError, adminFetch, errorMessage, fetcher } from "@/lib/admin/api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type Challenge = { email: string; expiresAt: string; resendAt: string; resendsLeft: number; attemptsLeft: number };

const LENGTH = 6;

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function CodeInput({ value, onChange, onComplete, disabled, invalid }: {
  value: string;
  onChange: (code: string) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const set = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, LENGTH);
    onChange(clean);
    refs.current[Math.min(clean.length, LENGTH - 1)]?.focus();
    if (clean.length === LENGTH) onComplete(clean);
  };

  const onKey = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      onChange(value.slice(0, i - 1));
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    set(e.clipboardData.getData("text"));
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit code">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={LENGTH}
          aria-label={`Digit ${i + 1}`}
          autoFocus={i === 0}
          onPaste={onPaste}
          onKeyDown={onKey(i)}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, "");
            if (!typed) return onChange(value.slice(0, i));
            set(value.slice(0, i) + typed);
          }}
          className={cn(
            "h-13 w-full min-w-0 rounded-[7px] bg-neutral-50 text-center font-geist text-[22px] font-semibold tabular-nums ring-1 ring-inset outline-none focus:ring-2 focus:ring-black-token disabled:opacity-50",
            invalid ? "ring-red-400" : "ring-black-a10",
          )}
        />
      ))}
    </div>
  );
}

export default function VerifyPage() {
  const router = useRouter();
  const now = useNow();
  const { data, error, isLoading, mutate } = useSWR<Challenge>("/api/auth/challenge", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const submit = async (value: string) => {
    if (busy || value.length !== LENGTH) return;
    setBusy(true);
    setProblem(null);
    try {
      await adminFetch("/api/auth/verify", { method: "POST", body: { code: value } });
      toast.success("Signed in");
      router.replace(`${ADMIN}/dashboard`);
    } catch (err) {
      setProblem(errorMessage(err));
      setCode("");
      void mutate();
      setBusy(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await mutate(await adminFetch<Challenge>("/api/auth/resend", { method: "POST" }), { revalidate: false });
      setProblem(null);
      setCode("");
      toast.success("New code sent", { description: "Check your inbox — the previous code no longer works." });
    } catch (err) {
      toast.error("Could not send a new code", { description: errorMessage(err) });
    } finally {
      setResending(false);
    }
  };

  const expired = error instanceof AdminApiError && error.status === 401;
  const wait = data ? Math.max(0, Math.ceil((new Date(data.resendAt).getTime() - now) / 1000)) : 0;
  const minutesLeft = data ? Math.max(0, Math.ceil((new Date(data.expiresAt).getTime() - now) / 60000)) : 0;

  return (
    <AuthFrame
      step="Step 2 of 2"
      title="Check your email"
      description={
        data ? (
          <>
            Enter the 6-digit code sent to <span className="font-medium text-black-token">{data.email}</span>. It expires in{" "}
            {minutesLeft} minute{minutesLeft === 1 ? "" : "s"}.
          </>
        ) : (
          "Enter the 6-digit code from the email."
        )
      }
    >
      {isLoading ? (
        <Spinner label="Loading" />
      ) : expired || (data && minutesLeft === 0) ? (
        <>
          <ErrorBanner>This sign-in has expired. Start again with Google.</ErrorBanner>
          <Link
            href={`${ADMIN}/login`}
            className="flex h-11 items-center justify-center rounded-[7px] bg-black-token text-[14px] font-medium text-white-token"
          >
            Back to sign in
          </Link>
        </>
      ) : error ? (
        <ErrorBanner>{errorMessage(error)}</ErrorBanner>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(code);
          }}
        >
          <CodeInput value={code} onChange={setCode} onComplete={submit} disabled={busy} invalid={Boolean(problem)} />
          {problem && <p role="alert" className="text-[12.5px] text-red-600">{problem}</p>}
          <Button type="submit" variant="primary" className="h-11 text-[14px]" loading={busy} disabled={code.length !== LENGTH}>
            Verify and sign in
          </Button>
          <div className="flex items-center justify-between text-[12.5px] text-black-a60">
            <Link href={`${ADMIN}/login`} className="hover:text-black-token">
              Use a different account
            </Link>
            {data && data.resendsLeft > 0 ? (
              <button
                type="button"
                onClick={resend}
                disabled={wait > 0 || resending}
                className="cursor-pointer font-medium text-black-token disabled:cursor-default disabled:font-normal disabled:text-black-a60"
              >
                {wait > 0 ? `Resend in ${wait}s` : resending ? "Sending…" : "Resend code"}
              </button>
            ) : (
              <span>No resends left</span>
            )}
          </div>
        </form>
      )}
    </AuthFrame>
  );
}
