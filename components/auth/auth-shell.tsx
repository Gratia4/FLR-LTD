import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/site/logo";

/**
 * Split-screen frame for sign-in and account-security pages: an illustrated
 * brand panel on large screens, and the form on its own clean surface.
 */
export function AuthShell({
  image,
  eyebrow,
  title,
  description,
  points = [],
  back = { href: "/", label: "Back to website" },
  children,
}: {
  image: { src: string; alt: string };
  eyebrow: string;
  title: string;
  description: string;
  points?: string[];
  back?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-white font-sans text-sage-900 antialiased lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate hidden overflow-hidden bg-forest-950 text-white lg:flex lg:flex-col">
        <Image src={image.src} alt={image.alt} fill priority sizes="52vw" className="-z-20 object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/20" />
        <div className="p-10">
          <Link href="/" aria-label="FLR Ltd. home" className="inline-flex rounded-xl bg-forest-950/55 px-4 py-3 ring-1 ring-white/15 backdrop-blur-md">
            <Logo tone="light" />
          </Link>
        </div>
        <div className="mt-auto max-w-xl p-10 pb-14">
          <p className="text-xs font-bold tracking-[0.16em] text-gold-300 uppercase">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-balance xl:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-forest-100/85">{description}</p>
          {points.length > 0 && (
            <ul className="mt-8 grid gap-3">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm font-medium text-forest-50">
                  <CheckCircle2 className="size-5 shrink-0 text-brand-300" /> {point}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid h-1 grid-cols-3" aria-hidden="true">
          <span className="bg-sky-500" />
          <span className="bg-gold-500" />
          <span className="bg-brand-500" />
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <Link href={back.href} className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-sage-600 transition-colors hover:text-forest-900">
            <ArrowLeft className="size-4" /> <span className="sm:hidden">Back</span><span className="hidden sm:inline">{back.label}</span>
          </Link>
          <Link href="/" aria-label="FLR Ltd. home" className="lg:hidden"><Logo /></Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out motion-reduce:animate-none">{children}</div>
        </div>
        <p className="flex items-center justify-center gap-2 px-6 pb-6 text-xs text-sage-500">
          <LockKeyhole className="size-3.5" /> Encrypted, role-protected access · FLR Ltd.
        </p>
      </main>
    </div>
  );
}

/** Icon badge + heading block that opens each auth form. */
export function AuthHeading({ icon, eyebrow, title, description }: { icon: ReactNode; eyebrow: string; title: string; description?: ReactNode }) {
  return (
    <div>
      <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/25 [&_svg]:size-5">{icon}</span>
      <p className="mt-6 text-xs font-bold tracking-[0.16em] text-brand-600 uppercase">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-forest-900">{title}</h2>
      {description && <p className="mt-2 text-[15px] leading-relaxed text-sage-600">{description}</p>}
    </div>
  );
}
