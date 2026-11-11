"use client";

import Image from "next/image";
import { useState } from "react";
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
  if (items.length === 0) return null;

  return (
    <div className="grid w-full grid-cols-1 border-t border-white-a16 m:grid-cols-2 l:grid-cols-5">
      {items.map((item, i) => {
        const src = toolboxLogo(item);
        return (
          <div
            key={`${i}-${item.name}`}
            className="group flex min-h-32 items-center gap-4 border-b border-white-a16 py-6 pr-6 transition-colors duration-300 hover:bg-white-a10 m:min-h-36 m:pl-5 l:min-h-48 l:flex-col l:items-start l:justify-between l:gap-8 l:border-r l:py-7 l:pl-5 l:last:border-r-0"
          >
            <span className="font-geist text-[11px] tracking-[0.12em] text-white-a50">0{i + 1}</span>
            <div className="flex min-w-0 items-center gap-4 l:items-end">
              <ToolLogo src={src} name={item.name} />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate type-body-1 text-white-token transition-colors group-hover:text-white-token-2">{item.name}</span>
                {item.role && <span className="truncate type-body-4 text-white-a50">{item.role}</span>}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
