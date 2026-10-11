import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";
import { Container } from "./section";

/** Closing call to action shared by every public page. */
export function CtaBand() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <Reveal className="relative isolate grid overflow-hidden rounded-3xl bg-forest-900 text-white shadow-lift lg:grid-cols-[0.85fr_1.15fr]">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(520px_320px_at_100%_0%,rgb(249_168_37/0.28),transparent_70%),radial-gradient(520px_320px_at_0%_100%,rgb(61_153_67/0.4),transparent_70%)]" />
          <div className="relative aspect-[3/2] bg-forest-800 lg:aspect-auto lg:min-h-96">
            <Image src="/images/flr-partner-support.webp" alt="Illustration of healthcare business partners discussing a supply partnership" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center gap-8 px-6 py-10 sm:p-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-gold-300">Talk to our team</p>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
                Ready to stock trusted international brands?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-forest-100/80">
                Register your pharmacy, clinic or retail business. Our team verifies new partners within 24–48 business hours.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="xl" variant="gold">
                <Link href="/register">Become a partner <ArrowRight /></Link>
              </Button>
              <Button asChild size="xl" variant="inverse">
                <Link href="/contact"><MessageSquare /> Send a message</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
