/**
 * Keep public navigation responsive while a server-rendered page is loading.
 * The primary nav uses full prefetching, but this fallback still appears when
 * a prefetch misses or the visitor is on a slow connection.
 */
export default function PublicLoading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="min-h-svh w-full bg-black-token px-6 pt-6 text-white-token"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex h-4.5 items-center gap-1.5" aria-hidden>
          <span className="block size-3.25 rounded-full bg-white-token [mask:radial-gradient(circle_at_72%_28%,transparent_34%,#000_35%)]" />
          <span className="h-3 w-19 rounded-sm bg-white-a16" />
        </div>
        <div className="hidden items-center gap-11 l:flex" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="h-4 w-16 animate-pulse rounded-sm bg-white-a16" />
          ))}
        </div>
        <span className="size-6 animate-pulse rounded-full bg-white-a16 l:hidden" aria-hidden />
      </div>
      <span className="sr-only">Loading page</span>
    </div>
  );
}
