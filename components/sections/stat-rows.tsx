import { cn } from "@/lib/cn";

type Props = {
  rows: ReadonlyArray<{ label: string; value: string }>;
  className?: string;
};

/** Label / value rows separated by hairlines. */
export function StatRows({ rows, className }: Props) {
  return (
    <div className={cn("flex w-full flex-col items-center justify-center gap-3.5", className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex w-full flex-col items-center justify-center gap-3.5">
          <div className="flex w-full items-center justify-between">
            <p className="w-px max-w-37.5 flex-1 type-body-1 text-black-token">{row.label}</p>
            <p className="w-px max-w-37.5 flex-1 text-right type-body-1 text-black-a60">{row.value}</p>
          </div>
          <div className="h-px w-full bg-black-a10" />
        </div>
      ))}
    </div>
  );
}

/** "(Label)  text" row used in the about and case-study columns. */
export function LabelledRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-start justify-start gap-5 m:flex-row m:gap-50">
      <p className="w-full max-w-25 type-body-1 text-black-token m:w-px m:flex-1">{label}</p>
      <div className="w-full max-w-105.25 m:w-px m:flex-1">{children}</div>
    </div>
  );
}
