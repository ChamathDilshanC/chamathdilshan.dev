import Link from "next/link";
import { Curtain } from "@/components/motion/curtain";
import { ArrowLink } from "@/components/ui/arrow-link";
import type { Footer, SiteSettings } from "@/lib/types/content";
import { FooterNav } from "./footer-nav";
import { Wordmark } from "./wordmark";

/** Glowing footer with contact details, navigation and the giant wordmark. */
export function SiteFooter({ site, footer }: { site: SiteSettings; footer: Footer }) {
  const [user, domain] = site.email.split("@");
  return (
    <footer className="relative z-1 flex w-full flex-col items-center justify-end gap-17.5 glow-gradient px-6 pt-11.25 pb-6">
      <Curtain heightClassName="h-132.5" className="glow-grain mask-b-from-62% mask-b-to-100%" />

      <div className="relative h-px w-full max-w-360 bg-white-a16" />

      <div className="relative flex w-full max-w-360 flex-col items-start justify-between gap-12.5 l:flex-row">
        <div className="flex flex-col items-start justify-start gap-12.5">
          <div className="flex w-full flex-col items-start justify-center">
            <h2 className="w-full type-heading-4 text-white-a50">{footer.heading}</h2>
            <p className="w-full type-heading-4 text-white-token max-m:text-[min(40px,8.6vw)] max-m:leading-[1.1]">
              <a href={`mailto:${site.email}`} className="type-link-1">
                {user}@<wbr />
                {domain}
              </a>
            </p>
          </div>
          <ArrowLink href={footer.cta.href} variant="light">
            {footer.cta.label}
          </ArrowLink>
        </div>
        <div className="w-full l:max-w-115">
          <FooterNav />
        </div>
      </div>

      <div className="relative h-px w-full max-w-360 bg-white-a16" />

      <div className="relative flex w-full max-w-360 flex-col items-start justify-between gap-6 m:flex-row m:items-end">
        <Link href="/" aria-label={`${site.name} home`} className="block w-full text-white-token m:w-[77%]">
          <Wordmark text={site.wordmark} label={site.name} animated={false} />
        </Link>
        <div className="flex w-min flex-col items-start justify-center gap-2.5 m:items-end">
          <p className="whitespace-nowrap type-body-1">{footer.copyright.replaceAll("{year}", site.year)}</p>
          <p className="whitespace-nowrap type-body-1 text-white-a50">
            {footer.credit.label}{" "}
            <a href={footer.credit.href} target="_blank" rel="noreferrer" className="type-link-1">
              {footer.credit.linkLabel}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
