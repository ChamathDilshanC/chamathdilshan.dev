import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Curtain } from "@/components/motion/curtain";
import { ArrowLink } from "@/components/ui/arrow-link";
import type { Footer, SiteSettings } from "@/lib/types/content";
import { FooterNav } from "./footer-nav";
import { Wordmark } from "./wordmark";

const PROFILE_IMAGE =
  "https://res.cloudinary.com/vmfn84y1/image/upload/f_auto,q_auto,c_fill,g_face,w_256,h_256/v1793902790/chamathdilshan.dev/shared/hcc5l3yfawhijzq2vbsc-15.png";

/** Glowing footer with contact details, navigation and the giant wordmark. */
export function SiteFooter({ site, footer }: { site: SiteSettings; footer: Footer }) {
  const [user, domain] = site.email.split("@");
  return (
    <footer className="relative z-1 flex w-full flex-col items-center justify-end gap-17.5 glow-gradient px-6 pt-11.25 pb-6">
      <Curtain heightClassName="h-132.5" className="glow-grain mask-b-from-62% mask-b-to-100%" />

      <div className="relative -mb-8 flex w-full max-w-360 justify-center l:justify-end">
        <div className="inline-flex h-14 min-w-72 items-center gap-2.5 rounded-full border border-white/20 bg-black/35 p-1.5 pr-5 shadow-[0_12px_45px_rgba(0,0,0,0.28)] backdrop-blur-md l:min-w-80">
          <Avatar className="size-12 border border-white/25 ring-2 ring-white/10 ring-offset-2 ring-offset-black/40">
            <AvatarImage src={footer.profileImage?.trim() || PROFILE_IMAGE} alt="Chamath Dilshan" />
            <AvatarFallback className="bg-orange-600 text-white">CD</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Independent engineer</p>
            <p className="font-geist text-sm font-medium text-white">Chamath Dilshan</p>
          </div>
        </div>
      </div>

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
