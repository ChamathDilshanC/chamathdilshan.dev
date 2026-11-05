import { ContentGuard } from "@/components/layout/content-guard";
import { Faq } from "@/components/layout/faq";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/layout/toaster";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteContentProvider } from "@/components/layout/site-content";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { getSiteContent } from "@/lib/content";

/** Shell for every public page: smooth scrolling, FAQ and footer. */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return (
    <SiteContentProvider value={content}>
      <a
        href="#main-content"
        className="sr-only type-body-3 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-[5px] focus:bg-white focus:px-4 focus:py-3 focus:text-black"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <ContentGuard />
      <Toaster />
      <MotionProvider>
        <div className="protected relative flex min-h-svh w-full flex-col items-center justify-start overflow-x-clip bg-black-token">
          <main id="main-content" className="contents">
            {children}
          </main>
          <Faq />
          <SiteFooter site={content.site} footer={content.footer} />
        </div>
      </MotionProvider>
    </SiteContentProvider>
  );
}
