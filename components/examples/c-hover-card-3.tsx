import { CalendarDays } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

const PROFILE_IMAGE =
  "https://res.cloudinary.com/vmfn84y1/image/upload/f_auto,q_auto,c_fill,g_face,w_256,h_256/v1793902790/chamathdilshan.dev/shared/hcc5l3yfawhijzq2vbsc-15.png"

type FooterProfileHoverCardProps = {
  email: string
  image?: string | null
}

export function FooterProfileHoverCard({ email, image }: FooterProfileHoverCardProps) {
  const profileImage = image?.trim() || PROFILE_IMAGE

  return (
    <div className="flex items-center justify-center">
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div className="group inline-flex h-14 min-w-72 cursor-pointer items-center gap-2.5 rounded-full border border-white/20 bg-black/35 p-1.5 pr-5 shadow-[0_12px_45px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-300 hover:border-orange-300/70 hover:bg-black/50 l:min-w-80">
            <Avatar className="size-12 border border-white/25 ring-2 ring-white/10 ring-offset-2 ring-offset-black/40 transition duration-300 group-hover:scale-105 group-hover:ring-orange-300/40">
              <AvatarImage src={profileImage} alt="Chamath Dilshan" />
              <AvatarFallback className="bg-orange-600 text-white">CD</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                Hover to meet
              </p>
              <p className="font-geist text-sm font-medium text-white transition group-hover:text-orange-200">
                Chamath Dilshan
              </p>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          side="bottom"
          align="end"
          sideOffset={16}
          className="w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-white/15 bg-[#101010]/95 p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-400/25 via-[#101010] to-emerald-300/10 px-4 py-4">
            <div className="absolute -top-8 -right-8 size-24 rounded-full bg-orange-300/20 blur-2xl" />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
              Independent engineer
            </p>
          </div>
          <div className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-geist text-lg font-medium text-white">Chamath Dilshan</p>
                <p className="mt-1 text-xs text-white/55">Web apps · APIs · Cloud</p>
              </div>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                Available
              </span>
            </div>
            <p className="text-sm leading-6 text-white/70">
              I build fast, accessible products for ambitious teams that plan for tomorrow.
            </p>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                <span>Building since 2021</span>
              </div>
              <a
                href={`mailto:${email}`}
                className="text-xs font-semibold text-orange-200 transition hover:text-white"
              >
                Let’s talk
              </a>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
