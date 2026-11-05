"use client";

import { useParams } from "next/navigation";
import { EntityEditor } from "@/components/admin/entity-editor";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  return <EntityEditor key={id} kind="project" id={Number(id)} />;
}
