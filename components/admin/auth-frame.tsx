import type { ReactNode } from "react";
import { AdminBrand } from "./shell";

/** Full-screen glow backdrop with a centred card, shared by the sign-in steps. */
export function AuthFrame({ step, title, description, children }: {
  step: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="glow-gradient flex min-h-svh flex-col items-center justify-between gap-10 px-4 py-6">
      <div className="flex w-full max-w-104 justify-start">
        <AdminBrand />
      </div>
      <section className="w-full max-w-104 rounded-[10px] bg-white-token p-7 shadow-2xl m:p-8">
        <p className="text-[12px] font-medium text-black-a60">{step}</p>
        <h1 className="mt-2 font-geist text-[24px] leading-[1.15] font-semibold tracking-[-0.8px]">{title}</h1>
        <div className="mt-2 text-[13.5px] leading-[1.55] text-black-a60">{description}</div>
        <div className="mt-7 flex flex-col gap-4">{children}</div>
      </section>
      <p className="max-w-104 text-center text-[12px] leading-[1.5] text-white-a50">
        Owner-only area. Sign-in attempts are logged.
      </p>
    </div>
  );
}
