/**
 * Admin surface root layout.
 *
 * Everything under /ChamathDilshanC is owner-only and must never be cached,
 * pre-rendered, or indexed.  (CACHING.md §8.2 / §15, SECURITY.md §8)
 *
 * Route protection here is UX only — the real authorization boundary is the
 * server-side check on /api/admin/* in the backend.
 */
import { Toaster } from "@/components/layout/toaster";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-svh bg-neutral-50 font-inter text-black-token antialiased">
      <Toaster />
      {children}
    </div>
  );
}
