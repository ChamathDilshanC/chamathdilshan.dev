import { gooeyToast, type GooeyToastOptions } from "goey-toast";

/** Site look for every toast: near-black blob with a hairline border. */
const look: GooeyToastOptions = {
  fillColor: "#151515",
  borderColor: "rgba(255, 255, 255, 0.14)",
  borderWidth: 1,
  showTimestamp: false,
};

const withLook = (options?: GooeyToastOptions): GooeyToastOptions => ({ ...look, ...options });

/**
 * Site toasts (goey-toast). Needs <Toaster /> mounted, which the public
 * layout does. Call only from client components.
 *
 *   toast.success("Saved", { description: "All changes synced." })
 */
export const toast = {
  show: (title: string, options?: GooeyToastOptions) => gooeyToast(title, withLook(options)),
  success: (title: string, options?: GooeyToastOptions) => gooeyToast.success(title, withLook(options)),
  error: (title: string, options?: GooeyToastOptions) => gooeyToast.error(title, withLook(options)),
  warning: (title: string, options?: GooeyToastOptions) => gooeyToast.warning(title, withLook(options)),
  info: (title: string, options?: GooeyToastOptions) => gooeyToast.info(title, withLook(options)),
  promise: gooeyToast.promise,
  dismiss: gooeyToast.dismiss,
};
