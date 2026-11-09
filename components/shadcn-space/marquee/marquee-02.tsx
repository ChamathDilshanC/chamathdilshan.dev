"use client";

// Installed with: pnpm dlx shadcn@latest add @shadcn-space/marquee-02
// The original brand marquee now takes the Toolbox items managed in the admin.
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import { Marquee } from "@/components/shadcn-space/animations/marquee";
import { toolboxLogo } from "@/lib/toolbox";
import type { ToolboxItem } from "@/lib/types/content";

function ToolLogo({ src, name }: { src: string | null; name: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="relative flex size-12 flex-none items-center justify-center m:size-14">
      {src && !broken ? (
        <Image src={src} alt="" fill unoptimized sizes="56px" className="object-contain" onError={() => setBroken(true)} />
      ) : (
        <span aria-hidden className="font-geist text-[28px] font-semibold text-white-a85">{name.trim().slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

export default function MarqueeBrands({ items }: { items: readonly ToolboxItem[] }) {
  const [paused, setPaused] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <Marquee className="w-full p-0 [--duration:30s] [--gap:2.5rem] m:[--gap:5rem]" pauseOnHover data-paused={paused}>
        {items.map((item, i) => {
          const src = toolboxLogo(item);
          return (
            <div key={`${i}-${item.name}`} className="flex min-w-44 flex-none items-center gap-4 py-4 m:min-w-52">
              <ToolLogo key={src} src={src} name={item.name} />
              <span className="flex flex-col gap-1">
                <span className="type-body-1 text-white-token">{item.name}</span>
                {item.role && <span className="type-body-4 text-white-a50">{item.role}</span>}
              </span>
            </div>
          );
        })}
      </Marquee>
      <button
        type="button"
        aria-pressed={paused}
        aria-label="Pause toolbox scrolling"
        onClick={() => setPaused(!paused)}
        className="flex items-center gap-2 rounded-[5px] px-3 py-2 font-geist text-[12.5px] text-white-a50 transition-colors hover:bg-white-a10 hover:text-white-token focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white-token motion-reduce:hidden"
      >
        {paused ? <IconPlayerPlay aria-hidden className="size-4" /> : <IconPlayerPause aria-hidden className="size-4" />}
        {paused ? "Resume scrolling" : "Pause scrolling"}
      </button>
    </div>
  );
}
