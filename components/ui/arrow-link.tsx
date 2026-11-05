import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  children: React.ReactNode;
  /** light = white on dark backgrounds, dark = black on light backgrounds. */
  variant?: "light" | "dark";
  className?: string;
};

const swap = "transition-none group-hover:transition-transform group-focus-visible:transition-transform ease-[cubic-bezier(0.65,0,0.35,1)]";

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn("absolute inset-0 size-full", className)}>
      <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

/**
 * Text link with a trailing arrow and an underline.
 * On hover the arrow flies out to the top right while a new one slides in, and
 * the underline wipes away to the right before redrawing from the left.
 * Touch screens draw the underline and slide the arrow in as the link scrolls
 * into view instead.
 */
export function ArrowLink({ href, children, variant = "light", className }: Props) {
  const tone = variant === "light" ? "text-white-token" : "text-black-token";
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const content = (
    <>
      <span className="relative flex max-w-full flex-none items-start justify-start">
        <span className={cn("relative flex-none whitespace-pre type-body-1", tone)}>{children}</span>
        <span className="w-36 min-w-6 shrink" />
        <span className={cn("relative size-4 flex-none overflow-hidden", tone)}>
          <Arrow className={cn(swap, "touch-arrow duration-500 group-hover:translate-x-[160%] group-hover:-translate-y-[160%] group-focus-visible:translate-x-[160%] group-focus-visible:-translate-y-[160%]")} />
          <Arrow className={cn(swap, "-translate-x-[160%] translate-y-[160%] duration-500 group-hover:translate-0 group-focus-visible:translate-0")} />
        </span>
      </span>
      <span className={cn("relative h-px flex-none self-stretch", tone)}>
        <span className={cn("touch-line absolute inset-0 origin-right bg-current duration-300 group-hover:scale-x-0 group-focus-visible:scale-x-0", swap)} />
        <span className={cn("absolute inset-0 origin-left scale-x-0 bg-current delay-200 duration-400 group-hover:scale-x-100 group-focus-visible:scale-x-100", swap)} />
      </span>
    </>
  );

  const classes = cn(
    "touch-frame group relative flex h-min w-min max-w-full cursor-pointer flex-col items-start justify-center gap-2.5 overflow-clip no-underline",
    className,
  );

  return external ? (
    <a href={href} className={classes} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {content}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
