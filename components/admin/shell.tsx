"use client";

import {
  IconArticle,
  IconBriefcase,
  IconExternalLink,
  IconHistory,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconLogout,
  IconMenu2,
  IconPhoto,
  IconStack2,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import useSWR, { SWRConfig } from "swr";
import { AdminApiError, adminFetch, fetcher, type Me } from "@/lib/admin/api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui";

export const ADMIN = "/ChamathDilshanC";

const NAV = [
  { href: `${ADMIN}/dashboard`, label: "Dashboard", icon: IconLayoutDashboard },
  { href: `${ADMIN}/sections`, label: "Sections", icon: IconLayoutGrid },
  { href: `${ADMIN}/projects`, label: "Projects", icon: IconBriefcase },
  { href: `${ADMIN}/blog`, label: "Journal", icon: IconArticle },
  { href: `${ADMIN}/skills`, label: "Skills", icon: IconStack2 },
  { href: `${ADMIN}/media`, label: "Media", icon: IconPhoto },
  { href: `${ADMIN}/audit-logs`, label: "Activity", icon: IconHistory },
];

const AdminContext = createContext<Me | null>(null);
export const useAdmin = () => useContext(AdminContext);

function Mark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block size-3.25 rounded-full bg-current [mask:radial-gradient(circle_at_72%_28%,transparent_34%,#000_35%)]", className)}
    />
  );
}

export function AdminBrand({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span className={cn("flex items-center gap-1.5", tone === "light" ? "text-white-token" : "text-black-token")}>
      <Mark />
      <span className="font-geist text-[15px] leading-none font-extrabold tracking-[-0.02em]">CHAMATH</span>
      <span className={cn("ml-1 text-[12px] font-medium", tone === "light" ? "text-white-a50" : "text-black-a60")}>Admin</span>
    </span>
  );
}

function Sidebar({ me, onNavigate }: { me: Me; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const logout = async () => {
    setLeaving(true);
    try {
      await adminFetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* the session is gone either way */
    }
    router.replace(`${ADMIN}/login`);
  };

  return (
    <div className="flex h-full flex-col gap-6 bg-neutral-900 px-3 py-5 text-white-token">
      <Link href={`${ADMIN}/dashboard`} onClick={onNavigate} className="px-3 py-1">
        <AdminBrand />
      </Link>
      <nav aria-label="Admin" className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-[6px] px-3 text-[13.5px] transition-colors",
                active ? "bg-white-a10 text-white-token" : "text-white-a50 hover:bg-white-a10/60 hover:text-white-token",
              )}
            >
              <Icon className="size-4.5" stroke={1.6} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex h-9 items-center gap-2.5 rounded-[6px] px-3 text-[13.5px] text-white-a50 transition-colors hover:bg-white-a10/60 hover:text-white-token"
        >
          <IconExternalLink className="size-4.5" stroke={1.6} />
          View site
        </a>
        <div className="mt-2 flex items-center gap-2.5 border-t border-white-a10 px-3 pt-4">
          <span className="flex size-8 flex-none items-center justify-center rounded-full bg-white-a16 text-[12px] font-semibold uppercase">
            {(me.name || me.email).charAt(0)}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[12.5px] text-white-token">{me.name || "Owner"}</span>
            <span className="truncate text-[11.5px] text-white-a50">{me.email}</span>
          </span>
          <button
            type="button"
            onClick={logout}
            disabled={leaving}
            aria-label="Sign out"
            title="Sign out"
            className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-[6px] text-white-a50 transition-colors hover:bg-white-a10 hover:text-white-token"
          >
            <IconLogout className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Admin frame: checks the session, then renders the sidebar and the page.
 * This is a convenience redirect only — every API call is authorized by the API.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const { data: me, error } = useSWR<Me>("/api/auth/me", fetcher, { revalidateOnFocus: true, shouldRetryOnError: false });

  const unauthorized = error instanceof AdminApiError && error.status === 401;
  useEffect(() => {
    if (unauthorized) router.replace(`${ADMIN}/login`);
  }, [unauthorized, router]);

  if (!me) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-neutral-50">
        {error && !unauthorized ? (
          <p className="max-w-80 text-center text-[13.5px] text-black-a60">{error.message}</p>
        ) : (
          <Spinner label="Checking your session" />
        )}
      </div>
    );
  }

  return (
    <SWRConfig
      value={{
        fetcher,
        onError: (err) => {
          if (err instanceof AdminApiError && err.status === 401) {
            toast.error("Signed out", { description: "Your session ended. Sign in again." });
            router.replace(`${ADMIN}/login`);
          }
        },
      }}
    >
      <AdminContext.Provider value={me}>
        <div className="flex min-h-svh bg-neutral-50 text-black-token">
          <aside className="sticky top-0 hidden h-svh w-60 flex-none l:block">
            <Sidebar me={me} />
          </aside>

          {menu && (
            <div className="fixed inset-0 z-50 l:hidden">
              <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setMenu(false)} />
              <aside className="relative h-full w-64">
                <Sidebar me={me} onNavigate={() => setMenu(false)} />
              </aside>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black-a10 bg-white-token/90 px-4 backdrop-blur l:hidden">
              <AdminBrand tone="dark" />
              <button
                type="button"
                aria-label={menu ? "Close menu" : "Open menu"}
                onClick={() => setMenu(!menu)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-[6px] hover:bg-neutral-50"
              >
                {menu ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
              </button>
            </header>
            <main className="mx-auto flex w-full max-w-290 flex-col gap-7 px-4 py-7 m:px-8 m:py-10">{children}</main>
          </div>
        </div>
      </AdminContext.Provider>
    </SWRConfig>
  );
}
