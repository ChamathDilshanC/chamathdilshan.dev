"use client";

import { IconCheck, IconChevronUp } from "@tabler/icons-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DropdownOption = {
  value: string;
  title: string;
  description: string;
  icon: ReactNode;
};

type Props = {
  /** Form field name; the selected value is submitted through a hidden input. */
  name: string;
  options: readonly DropdownOption[];
  /** Id of the element that labels this field. */
  labelId: string;
  /** Id for the trigger button, so a form can focus it. */
  id?: string;
  /** Icon, title and subtitle shown before anything is chosen. */
  placeholderIcon: ReactNode;
  placeholderTitle: string;
  placeholderDescription: string;
  defaultValue?: string;
  invalid?: boolean;
  onChange?: (value: string) => void;
  className?: string;
};

/**
 * A card that expands into a list of options (icon, title, description).
 * The card rounds off as it opens, the subtitle tucks away, the chevron
 * flips and the options rise in one after another.
 *
 * Keyboard: Enter, Space or ↓ opens; ↑ ↓ Home End move; Enter or Space picks;
 * Escape or Tab closes.
 */
export function DropdownSelect({
  name,
  options,
  labelId,
  id,
  placeholderIcon,
  placeholderTitle,
  placeholderDescription,
  defaultValue,
  invalid = false,
  onChange,
  className,
}: Props) {
  const fallbackId = useId();
  const triggerId = id ?? `${fallbackId}-trigger`;
  const listId = `${fallbackId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | undefined>(defaultValue);
  const selected = options.find((option) => option.value === value);

  // Close when clicking anywhere outside the card.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const focusOption = (index: number) => {
    const count = options.length;
    optionRefs.current[((index % count) + count) % count]?.focus();
  };

  const openList = (focusIndex?: number) => {
    setOpen(true);
    const start = focusIndex ?? Math.max(0, options.findIndex((option) => option.value === value));
    // Wait for the list to become focusable (it is inert while closed).
    requestAnimationFrame(() => focusOption(start));
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const choose = (option: DropdownOption) => {
    setValue(option.value);
    onChange?.(option.value);
    close();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openList(event.key === "ArrowUp" ? options.length - 1 : undefined);
    }
  };

  const onOptionKeyDown = (event: KeyboardEvent<HTMLLIElement>, index: number, option: DropdownOption) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusOption(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusOption(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusOption(0);
        break;
      case "End":
        event.preventDefault();
        focusOption(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(option);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "w-full overflow-hidden select-none",
        "bg-[#181818] shadow-xl shadow-black/50 ring-1",
        "transition-all duration-500 ease-in-out",
        open ? "rounded-3xl" : "rounded-2xl",
        invalid ? "ring-red-400/70" : "ring-white-a10",
        className,
      )}
    >
      <input type="hidden" name={name} value={value ?? ""} />

      {/* Header */}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${triggerId}`}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKeyDown}
        className="flex w-full cursor-pointer items-center gap-4 p-4 text-left outline-none focus-visible:bg-white/[0.04]"
      >
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-white-a10 text-white-a85 transition-colors duration-300">
          {selected?.icon ?? placeholderIcon}
        </span>
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="block font-geist text-[16px] leading-[20px] font-medium tracking-[-0.3px] text-white-token">
            {selected?.title ?? placeholderTitle}
          </span>
          <span
            className={cn(
              "block truncate font-geist text-[13.5px] leading-[18px] text-white-a50",
              "transition-all duration-500 ease-in-out",
              open ? "mt-0 max-h-0 opacity-0" : "mt-0.5 max-h-6 opacity-100",
            )}
          >
            {selected?.description ?? placeholderDescription}
          </span>
        </span>
        <span className="flex h-8 w-8 flex-none items-center justify-center">
          <IconChevronUp
            aria-hidden
            className={cn(
              "h-5 w-5 text-white-a50 transition-transform duration-500 ease-in-out",
              open ? "rotate-0" : "rotate-180",
            )}
          />
        </span>
      </button>

      {/* Options */}
      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            inert={!open}
            className="space-y-1 px-2 pb-4"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={() => choose(option)}
                  onKeyDown={(event) => onOptionKeyDown(event, index, option)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl p-3 outline-none",
                    "transition-all duration-500 ease-in-out",
                    "hover:bg-white/[0.05] focus-visible:bg-white/[0.07]",
                    isSelected && "bg-white/[0.06]",
                    open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  )}
                  style={{ transitionDelay: open ? `${index * 75}ms` : "0ms" }}
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white-a10 text-white-a85">
                    {option.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-geist text-[14.5px] leading-[19px] font-medium tracking-[-0.2px] text-white-token">
                      {option.title}
                    </span>
                    <span className="block truncate font-geist text-[13px] leading-[18px] text-white-a50">
                      {option.description}
                    </span>
                  </span>
                  <IconCheck
                    aria-hidden
                    className={cn(
                      "h-4 w-4 flex-none text-white-token transition-opacity duration-300",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
