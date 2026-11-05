"use client";

import { IconLoader2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/* --- buttons -------------------------------------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-black-token text-white-token hover:bg-neutral-900/85 disabled:bg-black-a60",
  secondary: "bg-white-token text-black-token ring-1 ring-black-a10 ring-inset hover:bg-neutral-50",
  ghost: "text-black-a60 hover:bg-black-a10/50 hover:text-black-token",
  danger: "bg-white-token text-red-600 ring-1 ring-red-200 ring-inset hover:bg-red-50",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md";
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading, icon, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[6px] font-inter font-medium tracking-[-0.2px] whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "h-8 px-2.5 text-[12.5px]" : "h-9.5 px-3.5 text-[13.5px]",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <IconLoader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({
  href,
  variant = "secondary",
  icon,
  children,
  className,
  external,
}: {
  href: string;
  variant?: Variant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const classes = cn(
    "inline-flex h-9.5 items-center justify-center gap-1.5 rounded-[6px] px-3.5 font-inter text-[13.5px] font-medium tracking-[-0.2px] whitespace-nowrap transition-colors",
    variants[variant],
    className,
  );
  if (external)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {icon}
        {children}
      </a>
    );
  return (
    <Link href={href} className={classes}>
      {icon}
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 flex-none cursor-pointer items-center justify-center rounded-[6px] text-black-a60 transition-colors hover:bg-black-a10/60 hover:text-black-token disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* --- inputs --------------------------------------------------------------- */

const control =
  "w-full rounded-[6px] bg-white-token px-3 font-inter text-[13.5px] text-black-token ring-1 ring-black-a10 ring-inset outline-none transition-shadow placeholder:text-black/35 focus:ring-2 focus:ring-black-token aria-[invalid=true]:ring-red-400";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn(control, "h-9.5", className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 4, ...rest },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={cn(control, "min-h-20 resize-y py-2 leading-[1.5]", className)} {...rest} />;
});

export function Select({
  value,
  onChange,
  options,
  className,
  id,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  id?: string;
  invalid?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      className={cn(control, "h-9.5 cursor-pointer pr-8", className)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  id?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex flex-none">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-5 w-9 rounded-full bg-black-a16 transition-colors peer-checked:bg-black-token peer-focus-visible:ring-2 peer-focus-visible:ring-black-token peer-focus-visible:ring-offset-2" />
        <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white-token shadow-sm transition-transform peer-checked:translate-x-4" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[13.5px] font-medium text-black-token">{label}</span>
        {description && <span className="text-[12.5px] leading-[1.45] text-black-a60">{description}</span>}
      </span>
    </label>
  );
}

/* --- layout --------------------------------------------------------------- */

export function Field({
  label,
  htmlFor,
  description,
  error,
  children,
  aside,
}: {
  label: ReactNode;
  htmlFor?: string;
  description?: ReactNode;
  error?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[12.5px] font-medium tracking-[-0.1px] text-black-token">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-[12px] text-red-600">
          {error}
        </p>
      ) : (
        description && <p className="text-[12px] leading-[1.45] text-black-a60">{description}</p>
      )}
    </div>
  );
}

export function Card({ title, description, actions, children, className }: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[8px] bg-white-token ring-1 ring-black-a10", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-black-a10 px-5 py-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && <h2 className="font-geist text-[15px] font-semibold tracking-[-0.3px] text-black-token">{title}</h2>}
            {description && <p className="text-[12.5px] leading-[1.45] text-black-a60">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="flex flex-col gap-5 p-5">{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-3">
      {back && (
        <Link href={back.href} className="w-fit text-[12.5px] text-black-a60 transition-colors hover:text-black-token">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-geist text-[26px] leading-[1.15] font-semibold tracking-[-0.9px] text-black-token">{title}</h1>
          {description && <p className="max-w-150 text-[13.5px] leading-[1.5] text-black-a60">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "dark"; children: ReactNode }) {
  const tones = {
    neutral: "bg-black-a10/60 text-black-a60",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 ring-inset",
    warning: "bg-amber-50 text-amber-800 ring-1 ring-amber-200 ring-inset",
    dark: "bg-black-token text-white-token",
  };
  return (
    <span className={cn("inline-flex h-5.5 items-center rounded-full px-2 text-[11.5px] font-medium whitespace-nowrap", tones[tone])}>
      {children}
    </span>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-10 text-[13px] text-black-a60">
      <IconLoader2 className="size-4 animate-spin" />
      {label}…
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[8px] border border-dashed border-black-a16 px-6 py-14 text-center">
      <p className="font-geist text-[15px] font-semibold tracking-[-0.3px]">{title}</p>
      {description && <p className="max-w-90 text-[13px] leading-[1.5] text-black-a60">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-[6px] bg-red-50 px-4 py-3 text-[13px] leading-[1.5] text-red-700 ring-1 ring-red-200 ring-inset">
      {children}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[6px] bg-amber-50 px-4 py-3 text-[13px] leading-[1.5] text-amber-900 ring-1 ring-amber-200 ring-inset">
      {children}
    </div>
  );
}

/* --- dialog --------------------------------------------------------------- */

/** Native <dialog>: focus trapping, Escape and the top layer for free. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const widths = { sm: "max-w-110", md: "max-w-160", lg: "max-w-230", xl: "max-w-300" };
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto max-h-[calc(100svh-32px)] w-[calc(100vw-32px)] overflow-hidden rounded-[10px] bg-white-token p-0 text-black-token shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-[2px]",
        widths[size],
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100svh-32px)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-black-a10 px-5 py-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="font-geist text-[16px] font-semibold tracking-[-0.3px]">{title}</h2>
              {description && <p className="text-[12.5px] text-black-a60">{description}</p>}
            </div>
            <IconButton label="Close" onClick={onClose}>
              <IconX className="size-4" />
            </IconButton>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
          {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-black-a10 px-5 py-3.5">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="bg-red-600 hover:bg-red-700" loading={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-[13.5px] leading-[1.55] text-black-a60">{description}</div>
    </Dialog>
  );
}

/* --- formatting ----------------------------------------------------------- */

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "never";
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return "just now";
  const units: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "minute"],
    [3600, "hour"],
    [86_400, "day"],
    [604_800, "week"],
    [2_629_800, "month"],
    [31_557_600, "year"],
  ];
  let unit: Intl.RelativeTimeFormatUnit = "second";
  let size = 1;
  for (const [s, u] of units) if (seconds >= s) [size, unit] = [s, u];
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-Math.round(seconds / size), unit);
}
