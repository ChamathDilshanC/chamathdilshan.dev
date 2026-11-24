import { describe, expect, it } from "vitest";
import { carouselOffset, wrapCarouselIndex } from "@/lib/journal-carousel";

describe("journal carousel", () => {
  it("wraps indexes in either direction", () => {
    expect(wrapCarouselIndex(6, 6)).toBe(0);
    expect(wrapCarouselIndex(-1, 6)).toBe(5);
    expect(wrapCarouselIndex(2, 0)).toBe(0);
  });

  it("uses the shortest visual distance around the loop", () => {
    expect(carouselOffset(5, 0, 6)).toBe(-1);
    expect(carouselOffset(0, 5, 6)).toBe(1);
    expect(carouselOffset(2, 0, 6)).toBe(2);
  });
});
