import type { ReactNode } from "react";
import { MotionProvider } from "@/components/site/motion-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <div className="flex min-h-screen flex-col bg-white font-sans text-sage-900 antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </MotionProvider>
  );
}
