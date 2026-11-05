"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { cloudinaryLoader, isCloudinary } from "@/lib/media";
import type { Skill } from "@/lib/types/content";

/** Grey tile with a skill's name, and its logo above it when one is set. */
export function SkillTile({ skill, className }: { skill: Skill; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-[5px] bg-neutral-50", className)}>
      {skill.icon && (
        <span className="relative size-9">
          <Image
            src={skill.icon}
            alt=""
            fill
            sizes="36px"
            unoptimized={!isCloudinary(skill.icon)}
            loader={isCloudinary(skill.icon) ? cloudinaryLoader : undefined}
            className="object-contain"
          />
        </span>
      )}
      <span className="font-geist text-[19px] font-semibold tracking-[-0.04em] text-black-token">{skill.name}</span>
    </div>
  );
}
