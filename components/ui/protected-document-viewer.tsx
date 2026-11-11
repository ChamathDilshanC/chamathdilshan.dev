"use client";

import { IconFileDescription, IconLoader2, IconLock, IconX } from "@tabler/icons-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/api";
import type { ExperienceDocument } from "@/lib/types/content";

type PdfDocument = import("pdfjs-dist").PDFDocumentProxy;

function documentUrl(experienceId: number, documentId: string): string {
  return `${API_URL}/api/experience/${experienceId}/documents/${encodeURIComponent(documentId)}`;
}

function PdfPage({ pdf, pageNumber }: { pdf: PdfDocument; pageNumber: number }) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = frame.current;
    const target = canvas.current;
    if (!element || !target || !visible) return;
    let disposed = false;
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;

    const render = async () => {
      const page = await pdf.getPage(pageNumber);
      if (disposed) return;
      renderTask?.cancel();
      const original = page.getViewport({ scale: 1 });
      const maxWidth = Math.min(element.clientWidth || 280, 860);
      const maxHeight = Math.max(240, window.innerHeight - 140);
      const scale = Math.min(maxWidth / original.width, maxHeight / original.height);
      const viewport = page.getViewport({ scale: Math.max(0.1, scale) });
      const density = Math.min(window.devicePixelRatio || 1, 2);
      target.width = Math.floor(viewport.width * density);
      target.height = Math.floor(viewport.height * density);
      target.style.width = `${Math.floor(viewport.width)}px`;
      target.style.height = `${Math.floor(viewport.height)}px`;
      const context = target.getContext("2d", { alpha: false });
      if (!context) return;
      renderTask = page.render({
        canvasContext: context,
        viewport,
        transform: density === 1 ? undefined : [density, 0, 0, density, 0, 0],
      });
      try {
        await renderTask.promise;
      } catch (error) {
        if (!disposed && (error as Error).name !== "RenderingCancelledException") throw error;
      }
    };

    let timer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void render(), 80);
    });
    observer.observe(element);
    void render();
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      observer.disconnect();
      renderTask?.cancel();
    };
  }, [pageNumber, pdf, visible]);

  return (
    <div
      ref={frame}
      className="relative flex w-full max-w-[860px] justify-center bg-white-token shadow-[0_12px_40px_rgba(0,0,0,.22)]"
      style={{ aspectRatio: visible ? "auto" : "0.707 / 1" }}
    >
      <canvas ref={canvas} aria-label={`Document page ${pageNumber}`} className="block max-w-full select-none" />
      <Watermark />
    </div>
  );
}

function PdfCanvas({ url }: { url: string }) {
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let loaded: PdfDocument | null = null;
    void import("pdfjs-dist").then(async (pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      loaded = await pdfjs.getDocument({ url, isEvalSupported: false }).promise;
      if (active) setPdf(loaded);
      else void loaded.destroy();
    }).catch(() => {
      if (active) setError(true);
    });
    return () => {
      active = false;
      if (loaded) void loaded.destroy();
    };
  }, [url]);

  if (error) return <ViewerError />;
  if (!pdf) return <ViewerLoading />;
  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5 p-4 m:p-8">
      {Array.from({ length: pdf.numPages }, (_, index) => (
        <PdfPage key={index + 1} pdf={pdf} pageNumber={index + 1} />
      ))}
    </div>
  );
}

function ImageCanvas({ url, label }: { url: string; label: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const element = frame.current;
    const target = canvas.current;
    if (!element || !target) return;
    let active = true;
    let image: ImageBitmap | null = null;

    const render = () => {
      if (!image || !active) return;
      const maxWidth = Math.min(element.clientWidth || image.width, image.width, 860);
      const maxHeight = Math.max(240, window.innerHeight - 140);
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
      const width = Math.max(1, image.width * scale);
      const height = Math.max(1, image.height * scale);
      const density = Math.min(window.devicePixelRatio || 1, 2);
      target.width = Math.floor(width * density);
      target.height = Math.floor(height * density);
      target.style.width = `${Math.floor(width)}px`;
      target.style.height = `${Math.floor(height)}px`;
      const context = target.getContext("2d", { alpha: false });
      context?.setTransform(density, 0, 0, density, 0, 0);
      context?.drawImage(image, 0, 0, width, height);
    };

    void fetch(url, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Document unavailable");
        return response.blob();
      })
      .then(createImageBitmap)
      .then((bitmap) => {
        image = bitmap;
        render();
      })
      .catch(() => active && setError(true));

    const observer = new ResizeObserver(render);
    observer.observe(element);
    return () => {
      active = false;
      observer.disconnect();
      image?.close();
    };
  }, [url]);

  if (error) return <ViewerError />;
  return (
    <div ref={frame} className="relative mx-auto my-4 flex w-[calc(100%-2rem)] max-w-[860px] justify-center bg-white-token shadow-[0_12px_40px_rgba(0,0,0,.22)] m:my-8">
      <canvas ref={canvas} aria-label={label} className="block max-w-full select-none" />
      <Watermark />
    </div>
  );
}

function Watermark() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.14]">
      <div className="absolute top-1/2 left-1/2 grid w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-25 grid-cols-3 gap-x-12 gap-y-20 text-center font-geist text-[13px] font-medium tracking-[0.12em] text-black-token uppercase">
        {Array.from({ length: 18 }, (_, index) => <span key={index}>chamathdilshan.dev · view only</span>)}
      </div>
    </div>
  );
}

function ViewerLoading() {
  return <div className="flex min-h-80 items-center justify-center text-white-token"><IconLoader2 className="size-6 animate-spin" aria-label="Loading document" /></div>;
}

function ViewerError() {
  return <div className="flex min-h-80 items-center justify-center px-6 text-center type-body-2 text-white-token">This document could not be displayed. Please try again.</div>;
}

function DocumentModal({ experienceId, item, onClose }: { experienceId: number; item: ExperienceDocument; onClose: () => void }) {
  const [obscured, setObscured] = useState(false);
  const url = documentUrl(experienceId, item.id);

  useEffect(() => {
    const originalOverflow = documentBody().style.overflow;
    documentBody().style.overflow = "hidden";
    let timer = 0;
    const brieflyObscure = () => {
      setObscured(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setObscured(false), 1200);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "PrintScreen") brieflyObscure();
      if ((event.ctrlKey || event.metaKey) && ["p", "s", "u"].includes(event.key.toLowerCase())) event.preventDefault();
    };
    const onVisibility = () => setObscured(document.hidden);
    const onBlur = () => setObscured(true);
    const onFocus = () => window.setTimeout(() => setObscured(false), 250);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("beforeprint", brieflyObscure);
    return () => {
      window.clearTimeout(timer);
      documentBody().style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("beforeprint", brieflyObscure);
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
      onDragStart={prevent}
      onCopy={prevent}
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
        {item.format === "pdf" ? <PdfCanvas url={url} /> : <ImageCanvas url={url} label={item.label} />}
      </div>
      {obscured && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950 text-center text-white-token">
          <div className="flex flex-col items-center gap-3 px-6"><IconLock className="size-7" /><p className="type-body-2">Protected content hidden while this window is not active.</p></div>
        </div>
      )}
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
