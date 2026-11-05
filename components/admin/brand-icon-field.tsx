"use client";

/**
 * Brand icon picker backed by theSVG (https://thesvg.org).
 *
 * The catalog manifest is fetched once (about 260 KB gzipped, cached for the
 * session) and searched in memory, as theSVG's docs recommend; there is no
 * search API. Picking an icon stores its CDN URL, so the site renders it by
 * slug without bundling anything. Any other image URL can still be pasted.
 */

import { IconExternalLink, IconSearch, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useDeferredValue, useId, useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";
import { cn } from "@/lib/utils";
import {
  ICON_VARIANTS,
  REGISTRY_URL,
  THESVG,
  VARIANT_HINTS,
  VARIANT_LABELS,
  iconUrl,
  parseIconUrl,
  searchIcons,
  type TheSvgIcon,
  type TheSvgRegistry,
} from "@/lib/thesvg";
import { Button, Field, Input } from "./ui";

const RESULTS = 18;

async function loadRegistry(url: string): Promise<TheSvgRegistry> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`theSVG catalog: ${res.status}`);
  return (await res.json()) as TheSvgRegistry;
}

/** A small square preview; light variants sit on black so they stay visible. */
function Preview({ src, dark, className }: { src: string; dark?: boolean; className?: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <span
      className={cn(
        "relative flex flex-none items-center justify-center overflow-hidden rounded-[6px] ring-1 ring-black-a10 ring-inset",
        dark ? "bg-black-token" : "bg-neutral-50",
        className,
      )}
    >
      {broken ? (
        <span className="text-[11px] text-black-a60">?</span>
      ) : (
        <Image key={src} src={src} alt="" fill unoptimized sizes="64px" className="object-contain p-[18%]" onError={() => setBroken(true)} />
      )}
    </span>
  );
}

export function BrandIconField({
  label,
  description,
  error,
  value,
  onChange,
  nullable,
  suggest,
}: {
  label: string;
  description?: string;
  error?: string;
  value: unknown;
  onChange: (value: string | null) => void;
  nullable: boolean;
  /** Searched until something is typed: the skill's name. */
  suggest?: string;
}) {
  const id = useId();
  const url = typeof value === "string" ? value : "";
  const picked = parseIconUrl(url);
  const [typed, setTyped] = useState<string | null>(null);
  const [pasting, setPasting] = useState(Boolean(url) && !picked);
  const query = typed ?? suggest ?? "";
  const deferred = useDeferredValue(query);

  const { data, error: loadError, isLoading, mutate } = useSWRImmutable(REGISTRY_URL, loadRegistry);
  const icons = data?.icons;
  const results = useMemo(() => (icons ? searchIcons(icons, deferred, RESULTS) : []), [icons, deferred]);
  const entry = useMemo<TheSvgIcon | undefined>(
    () => (picked && icons ? icons.find((icon) => icon.slug === picked.slug) : undefined),
    [icons, picked],
  );
  const variants = ICON_VARIANTS.filter((v) => !entry || entry.variants.includes(v));
  const clear = () => onChange(nullable ? null : "");

  return (
    <Field label={label} htmlFor={id} description={description} error={error}>
      <div className="flex flex-col gap-3 rounded-[8px] bg-neutral-50/70 p-3 ring-1 ring-black-a10 ring-inset">
        {url && (
          <div className="flex items-center gap-3">
            <Preview src={url} dark={picked?.variant === "light"} className="size-14" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="truncate text-[13px] font-medium">
                {entry?.title ?? (picked ? picked.slug : "Custom image")}
                {picked && <span className="ml-1.5 font-normal text-black-a60">theSVG · {picked.slug}</span>}
              </p>
              {picked && (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Icon style">
                  {variants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      aria-pressed={picked.variant === variant}
                      title={VARIANT_HINTS[variant]}
                      onClick={() => onChange(iconUrl(picked.slug, variant))}
                      className={cn(
                        "h-6.5 cursor-pointer rounded-[4px] px-2 text-[12px] ring-1 ring-inset",
                        picked.variant === variant
                          ? "bg-black-token text-white-token ring-black-token"
                          : "bg-white-token text-black-token ring-black-a10 hover:ring-black-token",
                      )}
                    >
                      {VARIANT_LABELS[variant]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button size="sm" variant="ghost" onClick={clear}>
              Remove
            </Button>
          </div>
        )}

        <div className="relative">
          <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-black-a60" />
          <Input
            id={id}
            type="search"
            value={query}
            placeholder="Search theSVG, e.g. React"
            autoComplete="off"
            onChange={(e) => setTyped(e.target.value)}
            className="pl-8"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setTyped("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-[3px] p-0.5 text-black-a60 hover:bg-black-a10 hover:text-black-token"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>

        {loadError ? (
          <div className="flex items-center justify-between gap-3 text-[12.5px] text-red-600">
            Couldn&apos;t load the theSVG catalog.
            <Button size="sm" onClick={() => void mutate()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <p className="text-[12.5px] text-black-a60">Loading theSVG catalog…</p>
        ) : !deferred.trim() ? (
          <p className="text-[12.5px] text-black-a60">Type a name to find its icon.</p>
        ) : results.length === 0 ? (
          <p className="text-[12.5px] text-black-a60">No icons match “{deferred}”. Try another spelling, or paste an image URL below.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-1.5 m:grid-cols-6" aria-label={`Icons matching ${deferred}`}>
            {results.map((icon) => {
              const selected = picked?.slug === icon.slug;
              return (
                <li key={icon.slug}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    title={`${icon.title} (${icon.slug})`}
                    onClick={() => onChange(iconUrl(icon.slug))}
                    className={cn(
                      "flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-[6px] bg-white-token px-1.5 pt-2.5 pb-1.5 ring-1 ring-inset transition-shadow",
                      selected ? "ring-2 ring-black-token" : "ring-black-a10 hover:ring-black-a60",
                    )}
                  >
                    <span className="relative size-8">
                      <Image src={iconUrl(icon.slug)} alt="" fill unoptimized sizes="32px" className="object-contain" />
                    </span>
                    <span className="w-full truncate text-center text-[11px] leading-tight">{icon.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-black-a60">
          <a href={THESVG} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-black-token">
            Icons by theSVG
            <IconExternalLink className="size-3" />
          </a>
          <button type="button" onClick={() => setPasting((open) => !open)} className="cursor-pointer underline-offset-2 hover:text-black-token hover:underline">
            {pasting ? "Hide image URL" : "Use another image URL"}
          </button>
        </div>
        {pasting && (
          <Input
            value={url}
            aria-label="Image URL"
            placeholder="https://…"
            onChange={(e) => onChange(e.target.value ? e.target.value : nullable ? null : "")}
            className="font-mono text-[12px]"
          />
        )}
      </div>
    </Field>
  );
}
