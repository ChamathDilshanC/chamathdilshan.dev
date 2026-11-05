"use client";

import { IconArrowDown, IconArrowUp, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";
import { SchemaForm } from "@/components/admin/schema-form";
import { Button, ConfirmDialog, Dialog, EmptyState, ErrorBanner, IconButton, PageHeader, Spinner, Switch } from "@/components/admin/ui";
import { AdminApiError, adminFetch, errorMessage, type FieldErrors, type JsonSchemaRoot, type SkillOut } from "@/lib/admin/api";
import { defaultFor } from "@/lib/admin/schema";
import { thumbnail } from "@/lib/media";
import { toast } from "@/lib/toast";

type Draft = { id: number | null; value: Record<string, unknown> };

const input = ({ name, category, icon, featured, visible }: SkillOut) => ({ name, category, icon, featured, visible });

export default function SkillsPage() {
  const { data, error, isLoading, mutate } = useSWR<SkillOut[]>("/api/admin/skills");
  const { data: schema } = useSWR<JsonSchemaRoot>("/api/admin/schemas/skill", { revalidateOnFocus: false });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<SkillOut | null>(null);
  const [removing, setRemoving] = useState(false);

  const open = (skill?: SkillOut) => {
    if (!schema) return;
    setErrors({});
    setDraft(skill ? { id: skill.id, value: input(skill) } : { id: null, value: defaultFor(schema, schema) as Record<string, unknown> });
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      if (draft.id) await adminFetch(`/api/admin/skills/${draft.id}`, { method: "PUT", body: draft.value });
      else await adminFetch("/api/admin/skills", { method: "POST", body: draft.value });
      await mutate();
      toast.success(draft.id ? "Skill updated" : "Skill added");
      setDraft(null);
    } catch (err) {
      if (err instanceof AdminApiError) setErrors(err.fieldErrors);
      toast.error("Not saved", { description: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (skill: SkillOut, patch: Partial<SkillOut>) => {
    const next = { ...skill, ...patch };
    try {
      await mutate(
        adminFetch<SkillOut>(`/api/admin/skills/${skill.id}`, { method: "PUT", body: input(next) }).then(() =>
          (data ?? []).map((s) => (s.id === skill.id ? next : s)),
        ),
        { optimisticData: (data ?? []).map((s) => (s.id === skill.id ? next : s)), rollbackOnError: true, revalidate: false },
      );
    } catch (err) {
      toast.error("Not saved", { description: errorMessage(err) });
    }
  };

  const reorder = async (index: number, by: number) => {
    if (!data) return;
    const next = [...data];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(index + by, 0, item);
    try {
      await mutate(adminFetch<SkillOut[]>("/api/admin/skills/reorder", { method: "POST", body: { ids: next.map((s) => s.id) } }), {
        optimisticData: next,
        rollbackOnError: true,
        revalidate: false,
      });
    } catch (err) {
      toast.error("Could not reorder", { description: errorMessage(err) });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await adminFetch(`/api/admin/skills/${deleting.id}`, { method: "DELETE" });
      await mutate();
      toast.success(`Deleted ${deleting.name}`);
      setDeleting(null);
    } catch (err) {
      toast.error("Not deleted", { description: errorMessage(err) });
    } finally {
      setRemoving(false);
    }
  };

  const addButton = (
    <Button variant="primary" icon={<IconPlus className="size-4" />} onClick={() => open()} disabled={!schema}>
      Add skill
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Skills"
        description="Featured skills scroll across the home page; visible ones fill the Stack grid on the about page. Both follow this order."
        actions={addButton}
      />
      {error && <ErrorBanner>{errorMessage(error)}</ErrorBanner>}
      {isLoading && <Spinner />}
      {data && data.length === 0 && <EmptyState title="No skills yet" action={addButton} />}
      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded-[8px] bg-white-token ring-1 ring-black-a10">
          <table className="w-full min-w-150 text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-black-a10 text-[12px] text-black-a60">
                <th className="px-4 py-2.5 font-medium">Skill</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Home strip</th>
                <th className="px-4 py-2.5 font-medium">About grid</th>
                <th className="px-4 py-2.5 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((skill, i) => (
                <tr key={skill.id} className="border-b border-black-a10 last:border-0">
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-3">
                      <span className="relative flex size-8 flex-none items-center justify-center overflow-hidden rounded-[6px] bg-neutral-50 ring-1 ring-black-a10 ring-inset">
                        {skill.icon ? (
                          <Image src={thumbnail(skill.icon, 64)} alt="" fill unoptimized sizes="32px" className="object-contain p-1" />
                        ) : (
                          <span className="font-geist text-[12px] font-semibold">{skill.name.charAt(0)}</span>
                        )}
                      </span>
                      <span className="font-medium">{skill.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-black-a60">{skill.category || "—"}</td>
                  <td className="px-4 py-2.5">
                    <Switch checked={skill.featured} onChange={(featured) => void toggle(skill, { featured })} label={<span className="sr-only">Show {skill.name} in the home strip</span>} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Switch checked={skill.visible} onChange={(visible) => void toggle(skill, { visible })} label={<span className="sr-only">Show {skill.name} in the about grid</span>} />
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex justify-end">
                      <IconButton label="Move up" disabled={i === 0} onClick={() => reorder(i, -1)}>
                        <IconArrowUp className="size-4" />
                      </IconButton>
                      <IconButton label="Move down" disabled={i === data.length - 1} onClick={() => reorder(i, 1)}>
                        <IconArrowDown className="size-4" />
                      </IconButton>
                      <IconButton label={`Edit ${skill.name}`} onClick={() => open(skill)}>
                        <IconPencil className="size-4" />
                      </IconButton>
                      <IconButton label={`Delete ${skill.name}`} onClick={() => setDeleting(skill)}>
                        <IconTrash className="size-4" />
                      </IconButton>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit skill" : "Add skill"}
        footer={
          <>
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={save}>
              {draft?.id ? "Save" : "Add skill"}
            </Button>
          </>
        }
      >
        {draft && schema && (
          <SchemaForm schema={schema} value={draft.value} onChange={(value) => setDraft({ ...draft, value })} errors={errors} />
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting?.name ?? "skill"}?`}
        description="It disappears from the home strip and the about grid."
        busy={removing}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
