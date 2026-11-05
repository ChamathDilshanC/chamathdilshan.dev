"use client";

import { IconCheck, IconCloudUpload, IconPhoto, IconPlayerPlayFilled } from "@tabler/icons-react";
import Image from "next/image";
import { useCallback, useRef, useState, type DragEvent } from "react";
import useSWR from "swr";
import { errorMessage, fetcher, type MediaOut } from "@/lib/admin/api";
import { ACCEPT, LIMITS, formatBytes, rejectReason, uploadToCloudinary } from "@/lib/admin/upload";
import { thumbnail } from "@/lib/media";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button, Dialog, EmptyState, Spinner } from "./ui";

export type MediaKind = keyof typeof ACCEPT;

/* --- preview -------------------------------------------------------------- */

export function MediaThumb({
  url,
  kind,
  alt = "",
  className,
  width = 320,
}: {
  url: string;
  kind: "image" | "video";
  alt?: string;
  className?: string;
  width?: number;
}) {
  return (
    <span className={cn("relative block overflow-hidden bg-neutral-900", className)}>
      {url ? (
        <Image src={thumbnail(url, width)} alt={alt} fill unoptimized sizes={`${width}px`} className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-white-a50">
          <IconPhoto className="size-6" />
        </span>
      )}
      {kind === "video" && (
        <span className="absolute bottom-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white-token">
          <IconPlayerPlayFilled className="size-3" />
        </span>
      )}
    </span>
  );
}

/* --- upload --------------------------------------------------------------- */

type Pending = { id: string; name: string; progress: number };

export function useUploader(onUploaded: (items: MediaOut[]) => void) {
  const [pending, setPending] = useState<Pending[]>([]);

  const upload = useCallback(
    async (files: File[], kind: MediaKind) => {
      const accepted: File[] = [];
      for (const file of files) {
        const reason = rejectReason(file, kind);
        if (reason) toast.error("Cannot upload", { description: reason });
        else accepted.push(file);
      }
      if (accepted.length === 0) return;

      const jobs = accepted.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, file }));
      setPending((list) => [...list, ...jobs.map(({ id, file }) => ({ id, name: file.name, progress: 0 }))]);

      const done: MediaOut[] = [];
      await Promise.all(
        jobs.map(async ({ id, file }) => {
          try {
            const item = await uploadToCloudinary(file, (progress) =>
              setPending((list) => list.map((p) => (p.id === id ? { ...p, progress } : p))),
            );
            done.push(item);
          } catch (err) {
            toast.error(`Upload failed: ${file.name}`, { description: errorMessage(err) });
          } finally {
            setPending((list) => list.filter((p) => p.id !== id));
          }
        }),
      );
      if (done.length) {
        toast.success(done.length === 1 ? "Uploaded" : `Uploaded ${done.length} files`);
        onUploaded(done);
      }
    },
    [onUploaded],
  );

  return { pending, upload };
}

export function Dropzone({
  kind = "any",
  multiple = true,
  onUploaded,
  compact,
}: {
  kind?: MediaKind;
  multiple?: boolean;
  onUploaded: (items: MediaOut[]) => void;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const { pending, upload } = useUploader(onUploaded);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    const files = Array.from(event.dataTransfer.files);
    void upload(multiple ? files : files.slice(0, 1), kind);
  };

  const what = kind === "image" ? "images" : kind === "video" ? "videos" : "images or videos";
  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed text-center transition-colors",
          compact ? "px-4 py-5" : "px-6 py-10",
          over ? "border-black-token bg-neutral-50" : "border-black-a16 bg-white-token",
        )}
      >
        <IconCloudUpload className="size-6 text-black-a60" />
        <p className="text-[13.5px] text-black-token">
          Drop {what} here or{" "}
          <button type="button" onClick={() => input.current?.click()} className="cursor-pointer font-medium underline underline-offset-2">
            browse
          </button>
        </p>
        <p className="text-[12px] text-black-a60">
          {kind !== "video" && `Images up to ${formatBytes(LIMITS.image)}`}
          {kind === "any" && " · "}
          {kind !== "image" && `Videos up to ${formatBytes(LIMITS.video)}`} · stored on Cloudinary
        </p>
        <input
          ref={input}
          type="file"
          hidden
          accept={ACCEPT[kind]}
          multiple={multiple}
          onChange={(e) => {
            void upload(Array.from(e.target.files ?? []), kind);
            e.target.value = "";
          }}
        />
      </div>
      {pending.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {pending.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-[6px] bg-neutral-50 px-3 py-2 text-[12.5px]">
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              <span className="h-1 w-28 overflow-hidden rounded-full bg-black-a10">
                <span className="block h-full bg-black-token transition-[width]" style={{ width: `${Math.round(p.progress * 100)}%` }} />
              </span>
              <span className="w-9 text-right text-black-a60 tabular-nums">{Math.round(p.progress * 100)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --- library + picker ----------------------------------------------------- */

export function useMedia() {
  return useSWR<MediaOut[]>("/api/admin/media", fetcher);
}

export function MediaGrid({
  items,
  selected,
  onPick,
  columns = "grid-cols-2 m:grid-cols-4 l:grid-cols-5",
}: {
  items: MediaOut[];
  selected?: Set<number>;
  onPick: (item: MediaOut) => void;
  columns?: string;
}) {
  return (
    <ul className={cn("grid gap-3", columns)}>
      {items.map((item) => {
        const active = selected?.has(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onPick(item)}
              aria-pressed={selected ? active : undefined}
              className={cn(
                "group flex w-full cursor-pointer flex-col gap-1.5 rounded-[8px] p-1 text-left transition-colors",
                active ? "bg-black-token text-white-token" : "hover:bg-neutral-50",
              )}
            >
              <span className="relative block">
                <MediaThumb url={item.url} kind={item.kind} alt={item.alt} className="aspect-[4/3] w-full rounded-[6px]" />
                {active && (
                  <span className="absolute top-1.5 right-1.5 flex size-5.5 items-center justify-center rounded-full bg-white-token text-black-token">
                    <IconCheck className="size-3.5" />
                  </span>
                )}
              </span>
              <span className={cn("truncate px-1 pb-0.5 text-[11.5px]", active ? "text-white-a85" : "text-black-a60")}>
                {item.originalFilename || item.publicId.split("/").pop()}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function MediaPicker({
  open,
  onClose,
  kind = "any",
  multiple = false,
  onSelect,
  title,
}: {
  open: boolean;
  onClose: () => void;
  kind?: MediaKind;
  multiple?: boolean;
  onSelect: (items: MediaOut[]) => void;
  title?: string;
}) {
  const { data, error, isLoading, mutate } = useMedia();
  const [selected, setSelected] = useState<Map<number, MediaOut>>(new Map());
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");

  const close = () => {
    setSelected(new Map());
    onClose();
  };
  const finish = (items: MediaOut[]) => {
    if (items.length === 0) return;
    onSelect(items);
    close();
  };

  const toggle = (item: MediaOut) => {
    if (!multiple) return finish([item]);
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.set(item.id, item);
      return next;
    });
  };

  const items = (data ?? []).filter((item) => (kind === "any" ? filter === "all" || item.kind === filter : item.kind === kind));

  return (
    <Dialog
      open={open}
      onClose={close}
      size="xl"
      title={title ?? (multiple ? "Choose files" : kind === "video" ? "Choose a video" : kind === "image" ? "Choose an image" : "Choose a file")}
      description="Upload new files or pick from the library."
      footer={
        multiple ? (
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="primary" disabled={selected.size === 0} onClick={() => finish([...selected.values()])}>
              Add {selected.size || ""} selected
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        <Dropzone
          kind={kind}
          multiple={multiple}
          compact
          onUploaded={(uploaded) => {
            void mutate();
            if (!multiple) finish(uploaded.slice(0, 1));
            else
              setSelected((current) => {
                const next = new Map(current);
                for (const item of uploaded) next.set(item.id, item);
                return next;
              });
          }}
        />
        {kind === "any" && (
          <div className="flex gap-1.5">
            {(["all", "image", "video"] as const).map((value) => (
              <Button key={value} size="sm" variant={filter === value ? "primary" : "ghost"} onClick={() => setFilter(value)}>
                {value === "all" ? "All" : value === "image" ? "Images" : "Videos"}
              </Button>
            ))}
          </div>
        )}
        {isLoading ? (
          <Spinner label="Loading library" />
        ) : error ? (
          <p className="text-[13px] text-red-600">{errorMessage(error)}</p>
        ) : items.length === 0 ? (
          <EmptyState title="Nothing here yet" description="Uploaded files appear here." />
        ) : (
          <MediaGrid items={items} selected={multiple ? new Set(selected.keys()) : undefined} onPick={toggle} />
        )}
      </div>
    </Dialog>
  );
}
