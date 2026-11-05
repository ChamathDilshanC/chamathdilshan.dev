import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { Parallax } from "@/components/motion/parallax";
import { ContactForm } from "@/components/sections/contact-form";
import { Media } from "@/components/ui/media";
import { getSiteContent } from "@/lib/content";
import { enter } from "@/lib/enter";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell me about your product and what you need.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const page = (await getSiteContent())["page.contact"];
  return (
    <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start bg-neutral-900 p-6 pb-40">
      <SiteHeader active="contact" />
      <div className="h-17.5 w-full flex-none" />
      <div className="flex w-full flex-col items-start justify-start gap-20 l:max-w-360 l:flex-row l:gap-31.75">
        <div
          className="animate-enter relative order-1 h-88.5 w-full flex-none rounded-[5px] m:h-180 l:order-0 l:h-195.75 l:w-143.5"
          style={enter(0.5, { y: "40px" })}
        >
          <Parallax overscan={10} className="absolute inset-0 rounded-[5px]">
            <Media src={page.image} alt={page.imageAlt} sizes="(min-width: 1200px) 574px, 100vw" preload />
          </Parallax>
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 z-1 block aspect-square w-[9%] min-w-8 -translate-1/2 rounded-full bg-white-token [mask:radial-gradient(circle_at_72%_28%,transparent_34%,#000_35%)]"
          />
        </div>
        <div className="order-0 flex w-full flex-col items-start justify-center gap-12.5 l:order-0 l:gap-20 l:pt-20">
          <div className="flex w-full flex-col items-start justify-center gap-5 l:gap-12.5">
            <h1 className="animate-enter w-full type-heading-3 text-white-token" style={enter(0.6)}>
              {page.title}
            </h1>
            <p className="animate-enter w-full max-w-87.5 type-body-3 text-white-a50" style={enter(0.7)}>
              {page.intro}
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
