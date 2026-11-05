"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthFrame } from "@/components/admin/auth-frame";
import { ADMIN } from "@/components/admin/shell";
import { ErrorBanner, Notice } from "@/components/admin/ui";
import { adminFetch } from "@/lib/admin/api";
import { API_URL } from "@/lib/api";

const ERRORS: Record<string, string> = {
  forbidden: "That Google account is not allowed to sign in here.",
  expired: "The sign-in took too long or was started in another tab. Try again.",
  cancelled: "Google sign-in was cancelled.",
  google: "Google could not confirm your account. Try again.",
  email: "Your identity was confirmed, but the verification email could not be sent. Try again shortly.",
  not_configured: "Google sign-in is not configured on the API yet.",
};

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="size-4.5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function Login() {
  const router = useRouter();
  const error = useSearchParams().get("error");
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // Already signed in? Go straight to the dashboard.
    adminFetch("/api/auth/me")
      .then(() => router.replace(`${ADMIN}/dashboard`))
      .catch(() => undefined);
    adminFetch<{ google: boolean }>("/api/auth/status")
      .then((status) => setConfigured(status.google))
      .catch(() => setConfigured(null));
  }, [router]);

  return (
    <AuthFrame
      step="Step 1 of 2"
      title="Sign in to the admin"
      description="Continue with the owner’s Google account. A 6-digit code is then emailed to it to finish signing in."
    >
      {error && <ErrorBanner>{ERRORS[error] ?? "Sign-in failed. Try again."}</ErrorBanner>}
      {configured === false && !error && (
        <Notice>Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and ADMIN_EMAIL on the API to enable sign-in.</Notice>
      )}
      <a
        href={`${API_URL}/api/auth/google/login`}
        className="flex h-11 items-center justify-center gap-2.5 rounded-[7px] bg-black-token text-[14px] font-medium text-white-token transition-colors hover:bg-neutral-900/85"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-white-token">
          <GoogleLogo />
        </span>
        Continue with Google
      </a>
      <p className="text-[12px] leading-[1.5] text-black-a60">
        Only the configured owner account can sign in. Any other Google account is refused before a code is sent.
      </p>
    </AuthFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
