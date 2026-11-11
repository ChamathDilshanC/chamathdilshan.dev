"use client";

import { IconFileDescription, IconLock, IconX } from "@tabler/icons-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import type { ExperienceDocument } from "@/lib/types/content";

function documentUrl(experienceId: number, documentId: string): string {
  return `${API_URL}/api/experience/${experienceId}/documents/${encodeURIComponent(documentId)}`;
}

function preloadDocument(url: string): void {
  const image = new Image();
  image.decoding = "async";
  image.src = url;
}

function ImageCanvas({ url, label }: { url: string; label: string }) {
  const [error, setError] = useState(false);

  if (error) return <ViewerError />;
  return (
    <div className="relative flex max-h-[calc(100vh-7rem)] w-full justify-center bg-transparent">
      {/* The protected API URL is runtime-generated and must bypass Next image optimization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={label}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={() => setError(true)}
        className="block max-h-[calc(100vh-7rem)] max-w-full select-none object-contain"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.16]">
        <div className="absolute top-1/2 left-1/2 grid w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-25 grid-cols-2 gap-x-16 gap-y-20 text-center font-geist text-[12px] font-medium tracking-[0.12em] text-black-token uppercase">
          {Array.from({ length: 12 }, (_, index) => <span key={index}>chamathdilshan.dev | view only</span>)}
        </div>
      </div>
    </div>
  );
}

function ViewerError() {
  return <div className="flex min-h-80 items-center justify-center px-6 text-center type-body-2 text-white-token">This document could not be displayed. Please try again.</div>;
}

function DocumentModal({ experienceId, item, onClose }: { experienceId: number; item: ExperienceDocument; onClose: () => void }) {
  const url = documentUrl(experienceId, item.id);

  useEffect(() => {
    const originalOverflow = documentBody().style.overflow;
    documentBody().style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if ((event.ctrlKey || event.metaKey) && ["p", "s", "u"].includes(event.key.toLowerCase())) event.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      documentBody().style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [onClose]);

  const prevent = (event: React.SyntheticEvent) => event.preventDefault();
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
      className="protected-document fixed inset-0 z-100 flex flex-col bg-neutral-950"
      onContextMenu={prevent}
    >
      <header className="flex h-15 flex-none items-center justify-between gap-4 border-b border-white/15 px-4 text-white-token m:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <IconLock className="size-4 flex-none text-white-a50" />
          <div className="min-w-0">
            <p className="truncate type-body-2">{item.label}</p>
            <p className="text-[11px] tracking-[0.08em] text-white-a50 uppercase">Protected view · download disabled</p>
          </div>
        </div>
        <button type="button" autoFocus aria-label="Close document" onClick={onClose} className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 hover:bg-white/10">
          <IconX className="size-4" />
        </button>
      </header>
      <div className="document-scroll min-h-0 flex-1 overflow-y-auto bg-neutral-900" tabIndex={0}>
        <ImageCanvas url={url} label={item.label} />
      </div>
    </div>,
    document.body,
  );
}

function documentBody(): HTMLElement {
  return document.body;
}

export function ProtectedDocumentButtons({ experienceId, documents }: { experienceId: number; documents: ExperienceDocument[] }) {
  const [open, setOpen] = useState<ExperienceDocument | null>(null);
  if (!documents.length) return null;
  return (
    <>
      <div className="flex flex-wrap gap-2" aria-label="Experience documents">
        {documents.map((document) => (
          <button
            key={document.id}
            type="button"
            onClick={() => setOpen(document)}
            onPointerEnter={() => preloadDocument(documentUrl(experienceId, document.id))}
            onFocus={() => preloadDocument(documentUrl(experienceId, document.id))}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 type-body-3 text-black-token ring-1 ring-black-a16 ring-inset transition-colors hover:bg-neutral-50 hover:ring-black-a60"
          >
            <IconFileDescription className="size-4" />
            {document.label}
          </button>
        ))}
      </div>
      {open && <DocumentModal experienceId={experienceId} item={open} onClose={() => setOpen(null)} />}
    </>
  );
}
