export const LIST_PAGE_SIZE = 6;

/** Invalid query values start at page one; stale page links clamp to the last page. */
export function paginateItems<T>(items: readonly T[], requestedPage: string | null = null) {
  const totalPages = Math.max(1, Math.ceil(items.length / LIST_PAGE_SIZE));
  const parsed = requestedPage && /^[1-9]\d*$/.test(requestedPage) ? Number(requestedPage) : 1;
  const page = Math.min(Number.isSafeInteger(parsed) ? parsed : 1, totalPages);
  const offset = (page - 1) * LIST_PAGE_SIZE;

  return {
    page,
    totalPages,
    items: items.slice(offset, offset + LIST_PAGE_SIZE),
    first: items.length ? offset + 1 : 0,
    last: Math.min(offset + LIST_PAGE_SIZE, items.length),
  };
}
