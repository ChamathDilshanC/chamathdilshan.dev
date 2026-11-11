"use client";

import Image from "next/image";
import { useState } from "react";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { Marquee } from "@/components/shadcn-space/animations/marquee";
import { toolboxLogo } from "@/lib/toolbox";
import type { ToolboxItem } from "@/lib/types/content";

function ToolLogo({ src, name }: { src: string | null; name: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="relative flex size-10 flex-none items-center justify-center">
      {src && !broken ? (
        <Image src={src} alt="" fill unoptimized sizes="56px" className="object-contain" onError={() => setBroken(true)} />
      ) : (
        <span aria-hidden className="font-geist text-[18px] font-semibold tracking-[-0.06em] text-white-a85">{name.trim().slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

export default function MarqueeBrands({ items }: { items: readonly ToolboxItem[] }) {
  const [paused, setPaused] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden border-y border-white-a16 py-2 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-1 before:w-16 before:bg-gradient-to-r before:from-neutral-900 before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-1 after:w-16 after:bg-gradient-to-l after:from-neutral-900 after:to-transparent">
      <Marquee
        className="w-full p-0 [--duration:32s] [--gap:3rem] m:[--gap:5rem]"
        pauseOnHover
        data-paused={paused}
      >
        {items.map((item, i) => {
          const src = toolboxLogo(item);
          return (
            <div key={`${i}-${item.name}`} className="group flex min-w-44 flex-none items-center gap-3 py-3 m:min-w-52 m:gap-4 m:py-4">
              <span className="font-geist text-[11px] tracking-[0.12em] text-white-a50">0{i + 1}</span>
              <ToolLogo src={src} name={item.name} />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate type-body-1 text-white-token">{item.name}</span>
                {item.role && <span className="truncate type-body-4 text-white-a50">{item.role}</span>}
              </span>
            </div>
          );
        })}
      </Marquee>
      <div className="flex justify-center border-t border-white-a10 py-1">
        <button
          type="button"
          aria-pressed={paused}
          aria-label="Pause toolbox scrolling"
          onClick={() => setPaused(!paused)}
          className="hidden items-center gap-2 px-2 py-1 font-geist text-[11px] text-white-a50 transition-colors hover:text-white-token focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white-token m:flex motion-reduce:hidden"
        >
          {paused ? <IconPlayerPlay aria-hidden className="size-3" /> : <IconPlayerPause aria-hidden className="size-3" />}
          {paused ? "Resume scrolling" : "Pause scrolling"}
        </button>
      </div>
    </div>
  );
}
