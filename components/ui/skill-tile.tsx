"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { cloudinaryLoader, isCloudinary } from "@/lib/media";
import type { Skill } from "@/lib/types/content";

/**
 * Grey tile with a skill's name and, centred under it, its logo when one is
 * set (usually a theSVG icon). The logo blurs into focus when the tile comes
 * into view and sits on a soft glow of its own colours that grows on hover
 * (on touch screens, while the tile crosses the middle of the screen).
 * A logo that fails to load is dropped rather than shown broken.
 */
export function SkillTile({ skill, className, variant = "light" }: { skill: Skill; className?: string; variant?: "light" | "galaxy" | "plain" }) {
  const [broken, setBroken] = useState(false);
  const icon = skill.icon && !broken ? skill.icon : null;
  const cloudinary = icon ? isCloudinary(icon) : false;
  const image = {
    src: icon ?? "",
    fill: true,
    sizes: "40px",
    unoptimized: !cloudinary,
    loader: cloudinary ? cloudinaryLoader : undefined,
    draggable: false,
  } as const;

  return (
    <div
      className={cn(
        "group/skill flex flex-col items-center justify-center gap-4 rounded-[5px]",
        variant === "galaxy"
          ? "border border-white-a10 bg-white-a10 text-white-token shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm"
          : variant === "plain"
            ? "bg-transparent"
            : "bg-neutral-50",
        className,
      )}
    >
      <span className={cn("font-geist text-[17px] font-semibold tracking-[-0.04em]", variant === "galaxy" ? "text-white-token" : "text-black-token")}>
        {skill.name}
      </span>
      {icon ? (
        <motion.span
          className="relative size-10"
          initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            aria-hidden
            className="touch-glow absolute inset-0 scale-125 opacity-25 blur-md transition-[opacity,scale] duration-500 ease-out group-hover/skill:scale-160 group-hover/skill:opacity-55"
          >
            <Image {...image} alt="" className="object-contain" />
          </span>
          <Image
            {...image}
            alt=""
            className="touch-pop object-contain transition-[scale] duration-500 ease-out group-hover/skill:scale-110"
            onError={() => setBroken(true)}
          />
        </motion.span>
      ) : variant === "galaxy" ? (
        <span aria-hidden className="relative flex size-10 items-center justify-center">
          <span className="absolute size-8 rounded-full border border-white-a16" />
          <span className="absolute size-2 rounded-full bg-[#d6eaff] shadow-[0_0_18px_#b8ddff]" />
          <span className="size-1 rounded-full bg-[#ffdcb9]" />
        </span>
      ) : null}
    </div>
  );
}
