"use client";

import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";

/** Gooey, morphing toasts (goey-toast). Trigger them with `toast` from `@/lib/toast`. */
export function Toaster() {
  return <GooeyToaster position="bottom-right" theme="dark" offset="24px" closeButton="top-right" showTimestamp={false} />;
}
