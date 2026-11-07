"use client";

import { IconCopy, IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";
import { Dropzone, MediaGrid, mediaFolder, useMedia } from "@/components/admin/media";
import { Button, ConfirmDialog, Dialog, EmptyState, ErrorBanner, Field, Input, Notice, PageHeader, Select, Spinner } from "@/components/admin/ui";
import { AdminApiError, adminFetch, errorMessage, type MediaOut, type Overview } from "@/lib/admin/api";
import { formatBytes } from "@/lib/admin/upload";
import { thumbnail, videoSrc } from "@/lib/media";
import { toast } from "@/lib/toast";

type Usage = { where: string; label: string };

function Details({ item, onClose, onChanged }: { item: MediaOut; onClose: () => void; onChanged: () => void }) {
  const [alt, setAlt] = useState(item.alt);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{ usages: Usage[] } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const saveAlt = async () => {
    setSaving(true);
    try {
      await adminFetch(`/api/admin/media/${item.id}`, { method: "PATCH", body: { alt } });
      toast.success("Alt text saved");
      onChanged();
    } catch (err) {
      toast.error("Not saved", { description: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (force: boolean) => {
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/media/${item.id}${force ? "?force=true" : ""}`, { method: "DELETE" });
      toast.success("Deleted from Cloudinary");
      onChanged();
      onClose();
    } catch (err) {
      const usages = (err instanceof AdminApiError && (err.detail as { usages?: Usage[] } | null)?.usages) || null;
      if (usages) setConfirm({ usages });
      else toast.error("Not deleted", { description: errorMessage(err) });
    } finally {
      setDeleting(false);
    }
  };

  const facts = [
    item.kind === "video" ? "Video" : "Image",
    item.format.toUpperCase(),
    item.width && item.height ? `${item.width} × ${item.height}` : null,
    formatBytes(item.bytes),
    item.duration ? `${item.duration.toFixed(1)} s` : null,
  ].filter(Boolean);

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={item.originalFilename || item.publicId.split("/").pop()}
      description={facts.join(" · ")}
      footer={
        <>
          <Button variant="danger" icon={<IconTrash className="size-4" />} loading={deleting && !confirm} onClick={() => remove(false)}>
            Delete
          </Button>
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="relative flex max-h-[55svh] items-center justify-center overflow-hidden rounded-[8px] bg-neutral-900">
          {item.kind === "video" ? (
            <video src={videoSrc(item.url)} poster={item.poster ?? undefined} controls playsInline className="max-h-[55svh] w-full" />
          ) : (
            <Image
              src={thumbnail(item.url, 1400)}
              alt={item.alt}
              width={item.width ?? 1400}
              height={item.height ?? 900}
              unoptimized
              className="max-h-[55svh] w-auto object-contain"
            />
          )}
        </div>
        <Field label="URL" aside={
          <Button
            size="sm"
            variant="ghost"
            icon={<IconCopy className="size-3.5" />}
            onClick={() => void navigator.clipboard.writeText(item.url).then(() => toast.success("URL copied"))}
          >
            Copy
          </Button>
        }>
          <Input readOnly value={item.url} className="font-mono text-[12px]" onFocus={(e) => e.target.select()} />
        </Field>
        <Field label="Default alt text" description="Suggested when this file is picked for a field.">
          <div className="flex gap-2">
            <Input value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} />
            <Button loading={saving} disabled={alt === item.alt} onClick={saveAlt}>
              Save
            </Button>
          </div>
        </Field>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title="This file is in use"
        confirmLabel="Delete anyway"
        busy={deleting}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(true)}
        description={
          <>
            <p>It is used in:</p>
            <ul className="mt-2 list-disc pl-5 text-black-token">
              {confirm?.usages.map((u) => <li key={u.where}>{u.label}</li>)}
            </ul>
            <p className="mt-3">Deleting it leaves those places without an image until you pick a new one.</p>
          </>
        }
      />
    </Dialog>
  );
}

export default function MediaPage() {
  const { data, error, isLoading, mutate } = useMedia();
  const { data: overview } = useSWR<Overview>("/api/admin/overview");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [selected, setSelected] = useState<MediaOut | null>(null);
  const folders = [...new Set((data ?? []).map((item) => mediaFolder(item.publicId)))].sort();
  const items = (data ?? []).filter(
    (item) => (filter === "all" || item.kind === filter) && (folderFilter === "all" || mediaFolder(item.publicId) === folderFilter),
  );
  const total = (data ?? []).reduce((sum, item) => sum + item.bytes, 0);

  return (
    <>
      <PageHeader
        title="Media"
        description="Images and videos stored on Cloudinary. Files are resized, compressed and converted automatically when the site shows them."
      />
      {overview && !overview.mediaConfigured && (
        <Notice>Cloudinary is not configured on the API, so uploads are disabled.</Notice>
      )}
      <Dropzone onUploaded={() => void mutate()} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(["all", "image", "video"] as const).map((value) => (
            <Button key={value} size="sm" variant={filter === value ? "primary" : "ghost"} onClick={() => setFilter(value)}>
              {value === "all" ? "All" : value === "image" ? "Images" : "Videos"}
            </Button>
          ))}
        </div>
        {folders.length > 0 && (
          <Select
            value={folderFilter}
            onChange={setFolderFilter}
            options={[{ value: "all", label: "All folders" }, ...folders.map((value) => ({ value, label: value }))]}
            className="max-w-80"
          />
        )}
        {data && (
          <p className="text-[12.5px] text-black-a60">
            {data.length} file{data.length === 1 ? "" : "s"} · {formatBytes(total)}
          </p>
        )}
      </div>
      {error && <ErrorBanner>{errorMessage(error)}</ErrorBanner>}
      {isLoading && <Spinner />}
      {data && items.length === 0 && <EmptyState title="No files" description="Drop images or videos above to upload them." />}
      {items.length > 0 && <MediaGrid items={items} onPick={setSelected} columns="grid-cols-2 m:grid-cols-3 l:grid-cols-5" />}
      {selected && <Details key={selected.id} item={selected} onClose={() => setSelected(null)} onChanged={() => void mutate()} />}
    </>
  );
}
