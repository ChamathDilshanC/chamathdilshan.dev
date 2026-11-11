"use client";

import {
  IconArrowDown,
  IconArrowUp,
  IconCloudUpload,
  IconFileDescription,
  IconGripVertical,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { errorMessage, type ExperienceDocumentOut } from "@/lib/admin/api";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_LIMIT,
  formatBytes,
  rejectDocumentReason,
  uploadProtectedDocument,
} from "@/lib/admin/upload";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { IconButton, Input } from "./ui";

type Pending = { id: string; name: string; progress: number };

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

export function ExperienceDocumentsField({
  value,
  onChange,
  folder,
  description,
  error,
}: {
  value: unknown;
  onChange: (value: ExperienceDocumentOut[]) => void;
  folder?: string;
  description?: string;
  error?: string;
}) {
  const list = useMemo(
    () => (Array.isArray(value) ? value : []) as ExperienceDocumentOut[],
    [value],
  );
  const latest = useRef(list);
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [over, setOver] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  useEffect(() => {
    latest.current = list;
  }, [list]);

  const upload = async (files: File[]) => {
    const accepted: File[] = [];
    for (const file of files) {
      const reason = rejectDocumentReason(file);
      if (reason) toast.error("Cannot upload document", { description: reason });
      else accepted.push(file);
    }
    if (!accepted.length) return;

    const jobs = accepted.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, file }));
    setPending((current) => [
      ...current,
      ...jobs.map(({ id, file }) => ({ id, name: file.name, progress: 0 })),
    ]);
    const uploaded: ExperienceDocumentOut[] = [];
    await Promise.all(
      jobs.map(async ({ id, file }) => {
        try {
          uploaded.push(
            await uploadProtectedDocument(
              file,
              (progress) =>
                setPending((current) =>
                  current.map((item) => (item.id === id ? { ...item, progress } : item)),
                ),
              folder,
            ),
          );
        } catch (uploadError) {
          toast.error(`Upload failed: ${file.name}`, { description: errorMessage(uploadError) });
        } finally {
          setPending((current) => current.filter((item) => item.id !== id));
        }
      }),
    );
    if (uploaded.length) {
      onChange([...latest.current, ...uploaded]);
      toast.success(uploaded.length === 1 ? "Protected document added" : `${uploaded.length} protected documents added`);
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    void upload(Array.from(event.dataTransfer.files));
  };
  const shift = (index: number, to: number) => {
    if (to < 0 || to >= list.length || to === index) return;
    onChange(move(list, index, to));
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[12.5px] font-semibold tracking-[-0.1px] text-black-token">
          Documents <span className="font-normal text-black-a60">({list.length})</span>
        </p>
        {description && <p className="mt-1 text-[12px] text-black-a60">{description}</p>}
        {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
      </div>

      {list.length > 0 && (
        <ol className="flex flex-col gap-2">
          {list.map((document, index) => (
            <li
              key={document.id}
              draggable
              onDragStart={() => setDragFrom(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null) shift(dragFrom, index);
                setDragFrom(null);
              }}
              onDragEnd={() => setDragFrom(null)}
              className={cn(
                "flex flex-col gap-3 rounded-[8px] bg-white-token p-3 ring-1 ring-black-a10 ring-inset transition-opacity m:flex-row m:items-center",
                dragFrom === index && "opacity-40",
              )}
            >
              <span className="flex size-10 flex-none items-center justify-center rounded-[6px] bg-neutral-50 text-black-a60">
                <IconFileDescription className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <Input
                  aria-label={`Button label for document ${index + 1}`}
                  value={document.label}
                  maxLength={80}
                  onChange={(event) =>
                    onChange(list.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item)))
                  }
                />
                <p className="mt-1.5 truncate text-[11.5px] text-black-a60">
                  {document.originalFilename} · {document.format.toUpperCase()} · {formatBytes(document.bytes)}
                  {document.pages > 1 ? ` · ${document.pages} pages` : ""}
                </p>
              </div>
              <div className="flex flex-none items-center self-end m:self-auto">
                <IconGripVertical className="mr-1 size-4 text-black-a60" aria-hidden />
                <IconButton label="Move document up" disabled={index === 0} onClick={() => shift(index, index - 1)}>
                  <IconArrowUp className="size-3.5" />
                </IconButton>
                <IconButton label="Move document down" disabled={index === list.length - 1} onClick={() => shift(index, index + 1)}>
                  <IconArrowDown className="size-3.5" />
                </IconButton>
                <IconButton label="Remove document" onClick={() => onChange(list.filter((_, itemIndex) => itemIndex !== index))}>
                  <IconTrash className="size-3.5" />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed px-5 py-7 text-center transition-colors",
          over ? "border-black-token bg-neutral-50" : "border-black-a16 bg-white-token",
        )}
      >
        <IconCloudUpload className="size-6 text-black-a60" />
        <p className="text-[13.5px] text-black-token">
          Drop documents here or{" "}
          <button type="button" onClick={() => input.current?.click()} className="cursor-pointer font-medium underline underline-offset-2">
            browse
          </button>
        </p>
        <p className="text-[12px] text-black-a60">
          PDF, JPG, PNG or WebP up to {formatBytes(DOCUMENT_LIMIT)} · stored as authenticated assets
        </p>
        <input
          ref={input}
          type="file"
          hidden
          accept={DOCUMENT_ACCEPT}
          multiple
          onChange={(event) => {
            void upload(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>

      {pending.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {pending.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-[6px] bg-neutral-50 px-3 py-2 text-[12.5px]">
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <span className="h-1 w-28 overflow-hidden rounded-full bg-black-a10">
                <span className="block h-full bg-black-token transition-[width]" style={{ width: `${Math.round(item.progress * 100)}%` }} />
              </span>
              <span className="w-9 text-right text-black-a60 tabular-nums">{Math.round(item.progress * 100)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
