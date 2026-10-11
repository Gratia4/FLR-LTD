import Link from "next/link";
import { Suspense } from "react";
import { LockKeyhole, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandDirectory } from "@/components/site/brand-directory";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Container } from "@/components/site/section";

export const metadata = { title: "Our Brands" };

export default function BrandsPage() {
  return (
    <>
      <PageHero
        eyebrow="Brand catalogue"
        title="Our brand portfolio"
        description="International dermocosmetic, baby care and wellness brands, distributed to verified healthcare and retail partners across Rwanda."
        translation="Notre portefeuille de marques"
        crumbs={[{ href: "/brands", label: "Brands" }]}
        image={{ src: "/images/flr-care-portfolio.webp", alt: "Illustrative still life of unbranded skincare and wellness packaging in sage and ivory tones" }}
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mb-12 flex flex-col gap-5 rounded-3xl border border-gold-200 bg-gold-50 p-6 sm:flex-row sm:items-center sm:p-7">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold-500 text-forest-950">
              <LockKeyhole className="size-5.5" />
            </span>
            <div className="flex-1">
              <h2 className="font-semibold text-forest-900">Wholesale pricing is protected</h2>
              <p className="mt-1 text-sm leading-relaxed text-sage-700">
                Approved clients sign in to see RWF prices, minimum order quantities, case sizes, stock and ordering.
              </p>
            </div>
            <Button asChild className="self-start sm:self-auto">
              <Link href="/login"><LogIn /> Client login</Link>
            </Button>
          </div>

          <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-sage-100" />}>
            <BrandDirectory />
          </Suspense>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
