import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, ArrowRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { humanise, toneFor, type Tone } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Title row that opens every portal page. */
export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-[0.14em] text-brand-600 uppercase">{eyebrow}</p>
        <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-forest-900 sm:text-[1.7rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sage-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const ACCENTS = {
  green: "bg-brand-50 text-brand-700 ring-brand-100",
  blue: "bg-sky-50 text-sky-600 ring-sky-100",
  gold: "bg-gold-50 text-gold-700 ring-gold-200",
  red: "bg-red-50 text-red-700 ring-red-100",
} as const;

export function StatCard({
  icon,
  label,
  value,
  note,
  accent = "green",
  attention,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  note?: ReactNode;
  accent?: keyof typeof ACCENTS;
  attention?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border bg-white p-5 shadow-soft transition-shadow hover:shadow-lift", attention ? "border-red-200 bg-gradient-to-br from-white to-red-50/60" : "border-sage-200/80")}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-sage-500">{label}</p>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl ring-1 [&_svg]:size-4.5", ACCENTS[accent])}>{icon}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-forest-900">{value}</p>
      {note && <p className="mt-1 text-xs text-sage-500">{note}</p>}
    </div>
  );
}

/** White card with an optional title row. */
export function Panel({
  title,
  eyebrow,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-sage-200/80 bg-white shadow-soft", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-sage-100 px-5 py-4">
          <div className="min-w-0">
            {eyebrow && <p className="text-[11px] font-bold tracking-[0.14em] text-brand-600 uppercase">{eyebrow}</p>}
            {title && <h2 className="mt-0.5 font-display text-base font-bold text-forest-900">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Text link with a trailing arrow, used in panel headers. */
export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
      {children}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

const TONES: Record<Tone, string> = {
  ok: "bg-brand-50 text-brand-700 ring-brand-200",
  warn: "bg-gold-50 text-gold-700 ring-gold-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-sky-50 text-sky-600 ring-sky-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  neutral: "bg-sage-100 text-sage-600 ring-sage-200",
};

export function StatusBadge({ kind, status, label }: { kind: Parameters<typeof toneFor>[0]; status: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset", TONES[toneFor(kind, status)])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label ?? humanise(status)}
    </span>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 [&_svg]:size-5.5">{icon}</span>
      <p className="mt-4 font-semibold text-forest-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-sage-500">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <AlertCircle className="size-4.5 shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="text-red-800 hover:bg-red-100 hover:text-red-900">
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  );
}

export function StatSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", count === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
      {Array.from({ length: count }, (_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}
    </div>
  );
}

export function RowSkeletons({ rows = 5 }: { rows?: number }) {
  return (
    <div className="grid gap-3 p-5">
      {Array.from({ length: rows }, (_, index) => <Skeleton key={index} className="h-12 rounded-xl" />)}
    </div>
  );
}
