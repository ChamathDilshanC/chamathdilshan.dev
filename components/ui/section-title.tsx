import { cn } from "@/lib/cn";

type Props = {
  title: string;
  aside?: string;
  /** dark = on white sections, light = on dark sections. */
  tone?: "dark" | "light";
  className?: string;
};

/** Hairline rule with a label on the left and a note on the right. Opens every section. */
export function SectionTitle({ title, aside, tone = "dark", className }: Props) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex w-full flex-col items-center justify-center gap-3", className)}>
      <div className={cn("h-px w-full", dark ? "bg-black-a16" : "bg-white-a16")} />
      <div className="flex w-full items-center justify-between gap-4">
        <p className={cn("flex-none whitespace-pre type-body-3", dark ? "text-black-token" : "text-white-token")}>
          {title}
        </p>
        {aside && (
          <p className={cn("min-w-0 truncate text-right type-body-3", dark ? "text-black-a60" : "text-white-a50")}>
            {aside}
          </p>
        )}
      </div>
    </div>
  );
}
