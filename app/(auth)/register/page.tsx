import { RegistrationWizard } from "@/components/auth/registration-wizard";
import { MotionProvider } from "@/components/site/motion-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata = { title: "Register your business" };

export default function RegisterPage() {
  return (
    <MotionProvider>
      <div className="min-h-screen bg-sage-50 font-sans text-sage-900 antialiased">
        <SiteHeader />

        <div className="relative isolate overflow-hidden bg-forest-900 text-white">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(640px_320px_at_88%_45%,rgb(61_153_67/0.4),transparent_70%),radial-gradient(400px_260px_at_0%_130%,rgb(249_168_37/0.16),transparent_70%)]" />
          <div className="mx-auto max-w-7xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
            <p className="text-xs font-bold tracking-[0.16em] text-gold-300 uppercase">B2B partner application</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">Register your business</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-forest-100/80">
              Apply for access to wholesale pricing, live stock and online ordering. It takes about 10 minutes.
            </p>
          </div>
        </div>

        <main className="relative z-10 mx-auto -mt-14 max-w-7xl px-5 pb-20 sm:px-8">
          <RegistrationWizard />
        </main>
        <SiteFooter />
      </div>
    </MotionProvider>
  );
}
