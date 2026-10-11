import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Globe2, LockKeyhole, Tag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/site/brand-logo";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Container, SectionHeading } from "@/components/site/section";
import { brandGroups, brandPortfolio } from "@/lib/brands";

export const dynamicParams = false;

export function generateStaticParams() {
  return brandPortfolio.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = brandPortfolio.find((entry) => entry.slug === slug);
  return { title: brand ? `${brand.name} — Wholesale in Rwanda` : "Brand" };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = brandPortfolio.find((entry) => entry.slug === slug);
  if (!brand) notFound();

  const group = brandGroups.find((entry) => entry.id === brand.group)!;
  const related = brandPortfolio.filter((entry) => entry.group === brand.group && entry.slug !== brand.slug).slice(0, 4);
  const facts = [
    { icon: Tag, label: "Category", value: brand.category },
    { icon: Globe2, label: "Origin", value: brand.origin },
    { icon: BadgeCheck, label: "Portfolio tier", value: brand.tier },
  ];

  return (
    <>
      <PageHero
        eyebrow={group.label}
        title={brand.name}
        description={`${brand.name} is part of FLR Ltd.’s ${group.label.toLowerCase()} portfolio, available to verified wholesale partners across Rwanda.`}
        crumbs={[{ href: "/brands", label: "Brands" }, { href: `/brands/${brand.slug}`, label: brand.name }]}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="grid min-h-72 place-items-center rounded-3xl border border-sage-200/80 bg-[radial-gradient(circle_at_50%_40%,#fff_0%,var(--color-sage-50)_75%)] p-10">
            <BrandLogo brand={brand} size="lg" />
          </Reveal>

          <Reveal delay={0.08} className="flex flex-col gap-5">
            <dl className="grid gap-3">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-center gap-4 rounded-2xl border border-sage-200/80 bg-white p-4">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><fact.icon className="size-4.5" /></span>
                  <div>
                    <dt className="text-xs font-medium text-sage-500">{fact.label}</dt>
                    <dd className="font-semibold text-forest-900">{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="rounded-3xl bg-forest-900 p-6 text-white">
              <p className="flex items-center gap-2 font-semibold"><LockKeyhole className="size-4.5 text-gold-400" /> Wholesale access</p>
              <p className="mt-2 text-sm leading-relaxed text-forest-100/75">
                Product ranges, RWF pricing, stock levels and ordering for {brand.name} are available to approved partners.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="gold"><Link href="/login">Client login</Link></Button>
                <Button asChild variant="inverse"><Link href="/register">Become a partner</Link></Button>
              </div>
            </div>
            <p className="flex items-center gap-2 text-sm text-sage-500"><Truck className="size-4" /> Delivered from Kigali to partners across Rwanda.</p>
          </Reveal>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="bg-sage-50/70 py-16 sm:py-20">
          <Container>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="Also in this portfolio" title={`More ${group.label.toLowerCase()} brands`} />
              <Button asChild variant="outline" className="self-start sm:self-auto">
                <Link href={`/brands?category=${group.id}`}><ArrowLeft /> Back to {group.label.toLowerCase()}</Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/brands/${entry.slug}`}
                  className="group flex flex-col rounded-3xl border border-sage-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="grid h-20 place-items-center"><BrandLogo brand={entry} size="sm" /></div>
                  <div className="mt-4 flex items-center justify-between border-t border-sage-100 pt-4">
                    <span>
                      <b className="block text-sm font-semibold text-forest-900">{entry.name}</b>
                      <span className="text-xs text-sage-500">{entry.category}</span>
                    </span>
                    <ArrowUpRight className="size-4.5 text-sage-300 transition group-hover:text-brand-600" />
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaBand />
    </>
  );
}
