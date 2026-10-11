import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Container, Eyebrow } from "./section";

/** Inner-page header with an optional editorial image alongside the copy. */
export function PageHero({
  eyebrow,
  title,
  description,
  translation,
  crumbs = [],
  children,
  image,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** The French line shown under the description. */
  translation?: string;
  crumbs?: Array<{ href: string; label: string }>;
  children?: ReactNode;
  image?: { src: string; alt: string };
}) {
  return (
    <section className="relative isolate overflow-hidden bg-forest-900 text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(700px_380px_at_88%_40%,rgb(61_153_67/0.4),transparent_70%),radial-gradient(500px_300px_at_0%_120%,rgb(249_168_37/0.14),transparent_70%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(100deg,transparent_25%,#000_90%)]"
      />
      <Container className="py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-forest-200/70">
          <Link href="/" className="transition-colors hover:text-white">Home</Link>
          {crumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" />
              <Link href={crumb.href} className="transition-colors hover:text-white">{crumb.label}</Link>
            </span>
          ))}
        </nav>
        <div className={image ? "grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14" : undefined}>
          <div>
            <Eyebrow tone="light">{eyebrow}</Eyebrow>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl lg:leading-[1.08]">
              {title}
            </h1>
            {description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-forest-100/80">{description}</p>}
            {translation && <p className="mt-3 max-w-2xl text-sm italic text-forest-200/60">{translation}</p>}
            {children}
          </div>
          {image && (
            <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-forest-800 shadow-lift ring-1 ring-white/10 lg:aspect-[4/3]">
              <Image src={image.src} alt={image.alt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
