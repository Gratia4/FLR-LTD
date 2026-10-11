import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page-width wrapper with the site's side gutters. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}

export function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, tone = "brand", className }: { children: ReactNode; tone?: "brand" | "gold" | "light"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]",
        tone === "brand" && "text-brand-600",
        tone === "gold" && "text-gold-600",
        tone === "light" && "text-gold-300",
        className,
      )}
    >
      <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow tone={tone === "light" ? "light" : "brand"}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "mt-3 font-display text-2xl font-extrabold tracking-tight text-balance sm:text-3xl lg:text-[2.15rem] lg:leading-[1.15]",
          tone === "light" ? "text-white" : "text-forest-900",
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-[15px] leading-relaxed text-pretty", tone === "light" ? "text-forest-100/80" : "text-sage-600")}>
          {description}
        </p>
      )}
    </div>
  );
}
