import { ContentGuard } from "@/components/layout/content-guard";
import { Faq } from "@/components/layout/faq";
import { PageProximitySidebar } from "@/components/layout/page-proximity-sidebar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/layout/toaster";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteContentProvider } from "@/components/layout/site-content";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { PlaceholderProvider } from "@/components/ui/placeholders";
import { getSiteContent } from "@/lib/content";
import { placeholders, sectionImages } from "@/lib/placeholders";

/** Shell for every public page: smooth scrolling, FAQ and footer. */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const previews = await placeholders(sectionImages(content));
  return (
    <SiteContentProvider value={content}>
      <PlaceholderProvider value={previews}>
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
            <PageProximitySidebar />
            <main id="main-content" className="contents">
              {children}
            </main>
            <Faq />
            <SiteFooter site={content.site} footer={content.footer} />
          </div>
        </MotionProvider>
      </PlaceholderProvider>
    </SiteContentProvider>
  );
}
