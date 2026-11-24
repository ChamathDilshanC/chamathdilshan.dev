/** Keeps a carousel index inside its item count. */
export function wrapCarouselIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * Returns the shortest signed distance from the active item to another item.
 * This keeps the carousel loop visually continuous at either end.
 */
export function carouselOffset(index: number, activeIndex: number, count: number): number {
  if (count <= 1) return 0;
  const forward = wrapCarouselIndex(index - activeIndex, count);
  return forward > count / 2 ? forward - count : forward;
}
