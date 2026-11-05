"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useState } from "react";
import type { NavKey } from "@/lib/types/content";
import { cn } from "@/lib/cn";
import { enter } from "@/lib/enter";
import { EASE_HERO, EASE_SWAP } from "@/lib/motion";
import { Logo } from "./logo";
import { NavItem } from "./nav-item";
import { useSiteContent } from "./site-content";

const pad = (n: number) => String(n).padStart(2, "0");

/** Desktop navigation. Hovering a link fades the others; the current page stays underlined. */
function DesktopNav({ active }: { active?: NavKey }) {
  const nav = useSiteContent().navigation.items;
  const [hovered, setHovered] = useState<NavKey | null>(null);
  // On the home page every link is lit; elsewhere the current page is highlighted.
  const focus = hovered ?? (active && active !== "home" ? active : null);

  return (
    <nav aria-label="Main" className="relative flex h-min w-min items-center justify-center gap-11">
      {nav.map((item, i) => (
        <NavItem
          key={item.key}
          href={item.href}
          title={item.title}
          number={pad(i + 1)}
          current={item.key === active}
          dimmed={focus !== null && focus !== item.key}
          underlined={focus === item.key}
          className="animate-enter"
          style={enter(0.68 + 0.08 * i, { y: "20%" })}
          onHover={(on) => setHovered(on ? item.key : null)}
        />
      ))}
    </nav>
  );
}

const panel: Variants = {
  closed: { clipPath: "inset(0% 0% 100% 0%)" },
  open: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0.5, ease: EASE_SWAP } },
  exit: { clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.4, ease: EASE_SWAP, delay: 0.05 } },
};
const list: Variants = {
  closed: {},
  open: { transition: { delayChildren: 0.3, staggerChildren: 0.06 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};
const row: Variants = {
  closed: { opacity: 0, y: -10 },
  open: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_HERO } },
};

function Burger({ open }: { open: boolean }) {
  const bar = "absolute top-1/2 left-1/2 -mt-px -ml-[9px] h-0.5 w-4.5 rounded-[1px] bg-white-token";
  const transition = { duration: 0.4, ease: EASE_SWAP };
  return (
    <span aria-hidden className="relative block size-6">
      <motion.span className={bar} initial={false} animate={{ y: open ? 0 : -4, rotate: open ? 45 : 0 }} transition={transition} />
      <motion.span className={bar} initial={false} animate={{ y: open ? 0 : 4, rotate: open ? -45 : 0 }} transition={transition} />
    </span>
  );
}

/** Phone and tablet header: logo, burger and a drop-down menu panel. */
function MobileHeader({ active, className }: { active?: NavKey; className?: string }) {
  const nav = useSiteContent().navigation.items;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={cn("relative w-full", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="panel"
            className="absolute inset-x-0 top-0 bg-neutral-900 px-6 pt-22 pb-10"
            variants={panel}
            initial="closed"
            animate="open"
            exit="exit"
          >
            <motion.nav aria-label="Main" className="flex flex-col gap-2.5" variants={list}>
              {nav.map((item, i) => (
                <motion.div key={item.key} variants={row} className="flex flex-col gap-2.5">
                  <NavItem
                    href={item.href}
                    title={item.title}
                    number={pad(i + 1)}
                    current={item.key === active}
                    dimmed={item.key !== active}
                    onClick={() => setOpen(false)}
                  />
                  <div className="h-px w-full bg-white-a16" />
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-1 flex w-full items-center justify-between p-6">
        <Logo />
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className="animate-enter -m-1 cursor-pointer p-1"
          style={enter(0.68, { y: "20%" })}
        >
          <Burger open={open} />
        </button>
      </div>
    </header>
  );
}

/** Header overlaid on the top of every page hero. */
export function SiteHeader({ active }: { active?: NavKey }) {
  return (
    <div className="absolute inset-x-0 top-0 z-2 l:inset-x-6 l:top-6">
      <MobileHeader active={active} className="l:hidden" />
      <header className="relative hidden h-min w-full items-center justify-between overflow-clip l:flex">
        <div className="flex w-[22%] flex-none items-center justify-start">
          <Logo />
        </div>
        <DesktopNav active={active} />
        <div className="w-[22%] flex-none" />
      </header>
    </div>
  );
}
