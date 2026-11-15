"use client";

import { IconArrowUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const SHOW_AFTER = 320;

/** Floating shortcut for returning to the top of the current public page. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > SHOW_AFTER);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={`fixed right-5 bottom-5 z-40 flex size-11 items-center justify-center rounded-full bg-white-token text-black-token shadow-[0_4px_20px_rgb(0_0_0_/_25%)] mix-blend-difference transition-[opacity,transform] duration-300 ease-out m:right-7.5 m:bottom-7.5 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      tabIndex={visible ? 0 : -1}
    >
      <IconArrowUp aria-hidden className="size-5" stroke={1.8} />
    </button>
  );
}
