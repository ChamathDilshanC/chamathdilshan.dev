"use client";

import { IconBulb, IconCategory, IconCode, IconRocket, IconServer, IconSparkles } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { useSiteContent } from "@/components/layout/site-content";
import { cn } from "@/lib/cn";
import { ContactError, sendContactMessage, type ContactField } from "@/lib/contact";
import { EASE_SOFT } from "@/lib/motion";
import { toast } from "@/lib/toast";

const field =
  "font-inter font-normal text-[13.2px] leading-[19.2px] tracking-[-0.5px] text-white-token bg-transparent outline-none border-none placeholder:text-white-a50";
const underline =
  "bordered relative w-full overflow-hidden after:border-b after:transition-colors focus-within:after:border-white";

const icons: Record<string, ReactNode> = {
  rocket: <IconRocket className="h-4 w-4" />,
  code: <IconCode className="h-4 w-4" />,
  server: <IconServer className="h-4 w-4" />,
  bulb: <IconBulb className="h-4 w-4" />,
  sparkles: <IconSparkles className="h-4 w-4" />,
};


const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: EASE_SOFT },
});

function Field({ label, children, delay }: { label: string; children: ReactNode; delay: number }) {
  return (
    <motion.label className="flex w-full flex-col items-start justify-start gap-2.5" {...reveal(delay)}>
      <span className="w-full type-body-3">{label}</span>
      {children}
    </motion.label>
  );
}

type FieldName = ContactField;

const problems: Record<FieldName, [title: string, description: string]> = {
  firstName: ["First name missing", "Tell me what to call you."],
  lastName: ["Last name missing", "Add your last name so I know who is writing."],
  email: ["Check your email", "I need a valid address to reply to you."],
  category: ["Pick a category", "Choose what you need help with."],
};

/**
 * Contact form. A valid submission goes to the API, which emails it to me
 * through Resend with the visitor as Reply-To. Nothing opens on the visitor's
 * side; a toast confirms the message was sent.
 */
export function ContactForm() {
  const { site, "page.contact": contact } = useSiteContent();
  const categories: DropdownOption[] = contact.categories.map((category) => ({
    value: category.value,
    title: category.title,
    description: category.description,
    icon: icons[category.icon] ?? <IconSparkles className="h-4 w-4" />,
  }));
  const formRef = useRef<HTMLFormElement>(null);
  const [invalid, setInvalid] = useState<FieldName | null>(null);
  const [sending, setSending] = useState(false);
  // Bumped after a successful send to remount (and so clear) the category picker.
  const [round, setRound] = useState(0);

  const fail = (name: FieldName) => {
    const [title, description] = problems[name];
    setInvalid(name);
    toast.error(title, { description });
    const target =
      name === "category"
        ? document.getElementById("contact-category")
        : formRef.current?.querySelector<HTMLInputElement>(`[name="${name}"]`);
    target?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const data = new FormData(form);

    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const categoryValue = String(data.get("category") ?? "");
    const message = String(data.get("message") ?? "").trim();
    const emailInput = form.querySelector<HTMLInputElement>('[name="email"]');

    if (!firstName) return fail("firstName");
    if (!lastName) return fail("lastName");
    if (!email || (emailInput && !emailInput.validity.valid)) return fail("email");
    const category = categories.find((option) => option.value === categoryValue);
    if (!category) return fail("category");

    setInvalid(null);
    setSending(true);
    try {
      await sendContactMessage({
        firstName,
        lastName,
        email,
        category: category.title,
        message,
        website: String(data.get("website") ?? ""),
      });
    } catch (err) {
      if (err instanceof ContactError && err.field) return fail(err.field);
      toast.error("Message not sent", {
        description: err instanceof Error ? err.message : "Something went wrong. Try again shortly.",
        action: {
          label: "Copy my email",
          onClick: () => void navigator.clipboard?.writeText(site.email),
          successLabel: "Copied",
        },
      });
      return;
    } finally {
      setSending(false);
    }

    form.reset();
    setRound((n) => n + 1);
    toast.success(`Thanks, ${firstName}!`, {
      description: "Your message is in my inbox. I will reply to you by email within one working day.",
    });
  };

  const lineColor = (name: FieldName) => (invalid === name ? "after:border-red-400/80" : "after:border-white-a16");
  const clear = (name: FieldName) => () => {
    if (invalid === name) setInvalid(null);
  };

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex w-full flex-col items-start justify-start gap-5 m:gap-12.5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />

      <div className="flex w-full flex-col items-center justify-center gap-5 m:flex-row">
        <Field label="First Name*" delay={0.5}>
          <span className={cn(underline, lineColor("firstName"), "flex h-10 items-center")}>
            <input
              name="firstName"
              required
              maxLength={100}
              autoComplete="given-name"
              placeholder="Jane"
              aria-invalid={invalid === "firstName"}
              onInput={clear("firstName")}
              className={cn(field, "h-full min-w-0 flex-1")}
            />
          </span>
        </Field>
        <Field label="Last Name*" delay={0.55}>
          <span className={cn(underline, lineColor("lastName"), "flex h-10 items-center")}>
            <input
              name="lastName"
              required
              maxLength={100}
              autoComplete="family-name"
              placeholder="Perera"
              aria-invalid={invalid === "lastName"}
              onInput={clear("lastName")}
              className={cn(field, "h-full min-w-0 flex-1")}
            />
          </span>
        </Field>
      </div>

      <Field label="Email*" delay={0.6}>
        <span className={cn(underline, lineColor("email"), "flex h-10 items-center")}>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            placeholder="jane@company.com"
            aria-invalid={invalid === "email"}
            onInput={clear("email")}
            className={cn(field, "h-full min-w-0 flex-1")}
          />
        </span>
      </Field>

      <motion.div className="flex w-full flex-col items-start justify-start gap-2.5" {...reveal(0.65)}>
        <span id="contact-category-label" className="w-full type-body-3">
          Category*
        </span>
        <DropdownSelect
          key={round}
          id="contact-category"
          name="category"
          labelId="contact-category-label"
          options={categories}
          placeholderIcon={<IconCategory className="h-5 w-5" />}
          placeholderTitle="Select a category"
          placeholderDescription="What do you need help with?"
          invalid={invalid === "category"}
          onChange={clear("category")}
        />
      </motion.div>

      <Field label="Message" delay={0.7}>
        <span className={cn(underline, "flex min-h-25 after:border-white-a16")}>
          <textarea
            name="message"
            maxLength={5000}
            placeholder="Tell me about your project..."
            data-lenis-prevent
            className={cn(field, "min-h-25 w-full resize-y py-2")}
          />
        </span>
      </Field>

      <motion.div className="h-10 w-full" {...reveal(0.75)}>
        <button
          type="submit"
          disabled={sending}
          aria-busy={sending}
          className="touch-press flex h-full w-full cursor-pointer items-center justify-center rounded-[10px] bg-white-a16 transition-colors duration-200 hover:bg-white-a50 disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-white-a16"
        >
          <span className="type-body-3 select-none">{sending ? "Sending…" : "Submit"}</span>
        </button>
      </motion.div>
    </form>
  );
}
