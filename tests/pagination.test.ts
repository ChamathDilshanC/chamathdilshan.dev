import { describe, expect, it } from "vitest";
import { paginateItems } from "@/lib/pagination";

describe("public listing pagination", () => {
  it.each([0, 1, 6])("keeps %i items on one page", (count) => {
    const items = Array.from({ length: count }, (_, i) => i);
    const result = paginateItems(items);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual(items);
    expect(result.first).toBe(count ? 1 : 0);
    expect(result.last).toBe(count);
  });

  it("shows pagination starting with the seventh item", () => {
    const items = Array.from({ length: 7 }, (_, i) => i);
    expect(paginateItems(items).items).toEqual([0, 1, 2, 3, 4, 5]);
    expect(paginateItems(items, "2")).toMatchObject({ page: 2, totalPages: 2, items: [6], first: 7, last: 7 });
  });

  it("preserves item order without duplicates or omissions across pages", () => {
    const items = Array.from({ length: 19 }, (_, i) => ({ slug: `item-${i}` }));
    const pages = ["1", "2", "3", "4"].flatMap((page) => paginateItems(items, page).items);
    expect(pages).toEqual(items);
  });

  it.each([null, "", "0", "-1", "2.5", "2x", "Infinity", "9007199254740992"])("handles invalid page %s", (query) => {
    expect(paginateItems(Array.from({ length: 13 }), query).page).toBe(1);
  });

  it("clamps stale bookmarks when items have been removed", () => {
    expect(paginateItems([1, 2, 3, 4, 5, 6, 7], "99")).toMatchObject({ page: 2, totalPages: 2, items: [7] });
    expect(paginateItems([], "99")).toMatchObject({ page: 1, totalPages: 1, items: [] });
  });
});
