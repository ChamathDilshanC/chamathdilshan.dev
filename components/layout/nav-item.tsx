"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  title: string;
  /** Two-digit index shown as a superscript. */
  number: string;
  /** Faded to 50%. */
  dimmed?: boolean;
  /** Shows the underline. */
  underlined?: boolean;
  current?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  onHover?: (hovering: boolean) => void;
};

/** "Title ⁰¹" navigation link with an animated underline. */
export function NavItem({ href, title, number, dimmed, underlined, current, className, style, onClick, onHover }: Props) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "relative flex h-min w-min flex-none cursor-pointer items-end justify-center gap-3 overflow-clip text-white-token",
        className,
      )}
      style={style}
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
    >
      <span className="relative flex h-min w-min flex-none items-start justify-start gap-2.5">
        <motion.span
          className="relative flex flex-none flex-col justify-start whitespace-pre"
          initial={false}
          animate={{ opacity: dimmed ? 0.5 : 1 }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        >
          <span className="type-body-3">{title}</span>
        </motion.span>
        <span
          aria-hidden
          className={cn(
            "absolute -inset-x-px bottom-0.5 z-1 h-px origin-left scale-x-0 bg-white-token transition-transform duration-300 ease-out",
            underlined && "scale-x-100",
          )}
        />
      </span>
      <span aria-hidden className="relative flex h-min w-min flex-none items-center justify-center overflow-clip pb-2">
        <span className="whitespace-pre type-body-6">{number}</span>
      </span>
    </Link>
  );
}
