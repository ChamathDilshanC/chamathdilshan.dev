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
export function SkillTile({ skill, className }: { skill: Skill; className?: string }) {
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
    <div className={cn("group/skill flex flex-col items-center justify-center gap-4 rounded-[5px] bg-neutral-50", className)}>
      <span className="font-geist text-[19px] font-semibold tracking-[-0.04em] text-black-token">{skill.name}</span>
      {icon && (
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
      )}
    </div>
  );
}
