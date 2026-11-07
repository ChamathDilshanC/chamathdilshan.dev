"use client";

import { IconDeviceFloppy, IconExternalLink, IconTrash } from "@tabler/icons-react";
import { useEffect, useState, type ReactNode } from "react";
import { AdminApiError, errorMessage, type FieldErrors, type JsonSchemaRoot } from "@/lib/admin/api";
import { toast } from "@/lib/toast";
import { SchemaForm, type FieldGroup } from "./schema-form";
import { Button, ButtonLink, Card, ConfirmDialog, ErrorBanner, PageHeader } from "./ui";

type Props = {
  title: ReactNode;
  description?: ReactNode;
  back: { href: string; label: string };
  schema: JsonSchemaRoot;
  initial: Record<string, unknown>;
  groups?: FieldGroup[];
  /** Wrap an ungrouped form in a card with this title. */
  cardTitle?: string;
  saveLabel?: string;
  viewHref?: string | null;
  onSave: (value: Record<string, unknown>) => Promise<void>;
  onDelete?: () => Promise<void>;
  deleteLabel?: string;
  aside?: ReactNode;
  uploadFolder?: string;
};

/** A schema-driven form with save / delete, field errors and an unsaved-changes guard. */
export function FormEditor({
  title,
  description,
  back,
  schema,
  initial,
  groups,
  cardTitle,
  saveLabel = "Save changes",
  viewHref,
  onSave,
  onDelete,
  deleteLabel = "Delete",
  aside,
  uploadFolder,
}: Props) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async () => {
    setSaving(true);
    setProblem(null);
    try {
      await onSave(value);
      setSaved(value);
      setErrors({});
      toast.success("Saved", { description: "The live site updates on the next visit." });
    } catch (err) {
      if (err instanceof AdminApiError) setErrors(err.fieldErrors);
      setProblem(errorMessage(err));
      toast.error("Not saved", { description: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      setSaved(value); // do not warn about unsaved changes while navigating away
      await onDelete();
    } catch (err) {
      toast.error("Not deleted", { description: errorMessage(err) });
      setDeleting(false);
      setConfirming(false);
    }
  };

  const form = <SchemaForm schema={schema} value={value} onChange={setValue} errors={errors} groups={groups} uploadFolder={uploadFolder} />;

  return (
    <form
      className="flex flex-col gap-6 pb-20"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <PageHeader
        back={back}
        title={title}
        description={description}
        actions={
          <>
            {viewHref && (
              <ButtonLink href={viewHref} external icon={<IconExternalLink className="size-4" />}>
                View
              </ButtonLink>
            )}
            {onDelete && (
              <Button variant="danger" icon={<IconTrash className="size-4" />} onClick={() => setConfirming(true)}>
                {deleteLabel}
              </Button>
            )}
            <Button type="submit" variant="primary" loading={saving} icon={<IconDeviceFloppy className="size-4" />}>
              {saveLabel}
            </Button>
          </>
        }
      />
      {aside}
      {problem && <ErrorBanner>{problem}</ErrorBanner>}
      {groups ? form : <Card title={cardTitle}>{form}</Card>}

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 l:pl-64">
          <div className="flex w-full max-w-160 items-center justify-between gap-3 rounded-[10px] bg-neutral-900 py-2.5 pr-2.5 pl-4 text-white-token shadow-2xl">
            <span className="text-[13px]">Unsaved changes</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-white-a50 hover:bg-white-a10 hover:text-white-token" onClick={() => setValue(saved)}>
                Discard
              </Button>
              <Button size="sm" type="submit" loading={saving} className="bg-white-token text-black-token ring-0 hover:bg-white-a85">
                {saveLabel}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title={`${deleteLabel}?`}
        description="This cannot be undone. Files on Cloudinary are kept in the media library."
        busy={deleting}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
    </form>
  );
}
