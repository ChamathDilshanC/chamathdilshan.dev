import { cn } from "@/lib/cn";

type Props = {
  heading?: string;
  items: readonly string[];
  tone?: "dark" | "light";
  className?: string;
};

function Plus({ tone }: { tone: "dark" | "light" }) {
  const bar = cn("absolute top-0 bottom-0 left-[calc(50%-0.5px)] w-px", tone === "dark" ? "bg-black-a60" : "bg-white-a50");
  return (
    <span aria-hidden className="flex w-min flex-none items-center justify-center pb-0.75">
      <span className="relative block h-2 w-2">
        <span className={bar} />
        <span className={cn(bar, "rotate-90")} />
      </span>
    </span>
  );
}

/** "What's included" style list with small plus markers. */
export function PlusList({ heading, items, tone = "dark", className }: Props) {
  return (
    <div className={cn("flex w-full flex-col items-start justify-center gap-4.5", className)}>
      {heading && (
        <p className={cn("w-full type-body-1", tone === "dark" ? "text-black-token" : "text-white-token")}>{heading}</p>
      )}
      <ul className="flex w-full flex-col gap-4.5">
        {items.map((item) => (
          <li key={item} className="flex w-full items-center justify-center gap-1.5">
            <Plus tone={tone} />
            <p className={cn("flex-1 type-body-3", tone === "dark" ? "text-black-a60" : "text-white-a50")}>{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
