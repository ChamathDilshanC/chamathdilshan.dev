"use client";

import { useEffect } from "react";

/** Form fields stay fully usable: typing, selecting, copying and pasting. */
function isEditable(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("input, textarea, select, [contenteditable='true']") !== null;
}

/**
 * Discourages copying the public site's content: blocks the context menu
 * (so no "Save image as"), dragging, copying, selecting, and the save page,
 * view source and print shortcuts. Form fields are left alone.
 *
 * This is a deterrent for casual visitors only. Anything a browser displays
 * can still be captured with screenshots or developer tools.
 * Pair with the `.protected` styles in globals.css.
 */
export function ContentGuard() {
  useEffect(() => {
    const block = (event: Event) => {
      if (!isEditable(event.target)) event.preventDefault();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      const key = event.key.toLowerCase();
      // Save page, view source, print.
      if (key === "s" || key === "u" || key === "p") {
        event.preventDefault();
        return;
      }
      // Copy, cut and select all, outside form fields.
      if ((key === "c" || key === "x" || key === "a") && !isEditable(event.target)) event.preventDefault();
    };

    const events = ["contextmenu", "dragstart", "copy", "cut", "selectstart"] as const;
    events.forEach((name) => document.addEventListener(name, block));
    document.addEventListener("keydown", onKeyDown);
    return () => {
      events.forEach((name) => document.removeEventListener(name, block));
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
