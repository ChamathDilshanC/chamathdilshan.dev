"use client";
import { ArrowUpRight } from "lucide-react";
import { useExperience } from "@/stores/experience-store";
export default function ProjectButton({ id }: { id: string }) {
  return (
    <button
      className="text-link"
      data-cursor="VIEW"
      onClick={(event) => {
        // Safari does not focus pointer-activated buttons automatically.
        event.currentTarget.focus({ preventScroll: true });
        useExperience.getState().set({ project: id, phase: "PROJECT_VIEW" });
      }}
    >
      Explore project <ArrowUpRight size={17} />
    </button>
  );
}
