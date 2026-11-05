/** Shared easing curves. Every animation on the site uses one of these. */
type Bezier = [number, number, number, number];

/** Default reveal curve: soft start, long glide. */
export const EASE_SOFT: Bezier = [0.44, 0, 0.34, 0.98];
/** Expo-out used by the hero, text reveals and quote words. */
export const EASE_HERO: Bezier = [0.22, 1, 0.36, 1];
/** Symmetric curve for swaps: menus, carousels, link underlines. */
export const EASE_SWAP: Bezier = [0.65, 0, 0.35, 1];
/** Hover curve for the "See all" pill. */
export const EASE_PILL: Bezier = [0.64, 0.03, 0.21, 1];

/** Spring used to smooth scroll-linked values. */
export const SCROLL_SPRING = { stiffness: 400, damping: 60, mass: 1 } as const;

/**
 * Smooth-scroll feel (Lenis). Tune here.
 *
 * wheelMultiplier: distance per wheel notch or trackpad swipe, where 1 is the
 *   browser default. This sets the scrolling SPEED: while you keep scrolling,
 *   the page moves at roughly (notches per second × 100px × wheelMultiplier).
 *   1 ≈ normal · 0.75 ≈ calm · 0.55 ≈ slow · 0.35 ≈ slow motion (default) · 0.25 ≈ crawl
 * lerp: share of the remaining distance covered per 60fps frame (frame-rate
 *   independent). This sets the GLIDE: how softly each movement starts and
 *   comes to rest. Lower = silkier but floatier.
 *   0.1 ≈ snappy · 0.06 ≈ smooth · 0.035 ≈ silky · 0.025 ≈ slow motion (default)
 *   With 0.025 each movement is half done after ~0.45 s and settles after ~3 s.
 */
export const SMOOTH_SCROLL = { lerp: 0.025, wheelMultiplier: 0.35 } as const;
