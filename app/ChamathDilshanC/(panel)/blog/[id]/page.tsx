"use client";

import { useParams } from "next/navigation";
import { EntityEditor } from "@/components/admin/entity-editor";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  return <EntityEditor key={id} kind="post" id={Number(id)} />;
}
