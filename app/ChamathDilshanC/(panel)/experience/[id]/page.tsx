"use client";

import { useParams } from "next/navigation";
import { EntityEditor } from "@/components/admin/entity-editor";

export default function EditExperiencePage() {
  const { id } = useParams<{ id: string }>();
  return <EntityEditor key={id} kind="experience" id={Number(id)} />;
}
