"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { Curtain } from "@/components/motion/curtain";
import { Reveal } from "@/components/motion/reveal";
import { Media } from "@/components/ui/media";
import { useSiteContent } from "./site-content";
import { cn } from "@/lib/cn";
import { EASE_SWAP } from "@/lib/motion";

function Item({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="flex w-full flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-6 pt-7 text-left"
      >
        <span className="max-w-150 type-body-1 text-black-token">{question}</span>
        <span aria-hidden className="relative size-4 flex-none">
          <span className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-black-token" />
          <motion.span
            className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-black-token"
            initial={false}
            animate={{ rotate: open ? 0 : 90 }}
            transition={{ duration: 0.4, ease: EASE_SWAP }}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="answer"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_SWAP }}
          >
            <p className="max-w-150 pt-5 type-body-1 text-black-a60">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-10 h-px w-full bg-black-a16" />
    </div>
  );
}

function ReelCard() {
  const { reel } = useSiteContent().faq;
  return (
    <a
      href={reel.href}
      target="_blank"
      rel="noreferrer"
      className="touch-press group flex h-50.75 w-76.5 cursor-pointer flex-col items-center justify-center gap-3.5 overflow-clip rounded-[5px] bg-neutral-50 p-1"
    >
      <span className="touch-frame relative flex w-full flex-1 overflow-hidden rounded-[2.5px] bg-black-token">
        <Media
          src={reel.image}
          sizes="306px"
          className="touch-settle transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
      </span>
      <span className="flex w-full items-center justify-between px-2.5 pb-2.5">
        <span className="flex items-center gap-1">
          <svg aria-hidden viewBox="0 0 8 9" className="h-2.25 w-2 fill-black-token">
            <path d="M0 0 8 4.5 0 9z" />
          </svg>
          <span className="type-body-3 text-black-token">{reel.label}</span>
        </span>
        <span className="text-right type-body-3 text-black-a60">{reel.meta}</span>
      </span>
    </a>
  );
}

/** Questions and answers shown above the footer on every page. */
export function Faq() {
  const { faq } = useSiteContent();
  const pathname = usePathname();
  // On the dark contact page the section slides up over it with a white sheet.
  const overlap = pathname === "/contact";

  return (
    <section
      aria-labelledby="faq-title"
      className={cn(
        "relative z-1 flex w-full flex-col items-center justify-start bg-white-token px-6 pb-30",
        overlap ? "pt-15" : "pt-6",
      )}
    >
      {overlap && <Curtain className="bg-white-token" heightClassName="h-132.5" />}
      <div className="relative flex w-full max-w-360 flex-col items-center justify-center gap-3">
        <div className="h-px w-full bg-black-a16" />
        <div className="flex w-full flex-col items-start justify-between gap-10 l:flex-row">
          <div className="flex w-full flex-col items-start justify-center gap-10 l:max-w-140">
            <p id="faq-title" className="type-body-3 text-black-token">
              {faq.title}
            </p>
            <div className="hidden l:block">
              <ReelCard />
            </div>
          </div>
          <div className="w-full l:max-w-177.5">
            <div className="flex w-full flex-col items-center justify-center">
              {faq.items.map((item, i) => (
                <Reveal key={`${i}-${item.question}`} className="w-full" duration={0.8 + i * 0.1}>
                  <Item question={item.question} answer={item.answer} />
                </Reveal>
              ))}
            </div>
          </div>
          <div className="l:hidden">
            <ReelCard />
          </div>
        </div>
      </div>
    </section>
  );
}
