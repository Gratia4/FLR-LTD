import { cn } from "@/lib/utils";

/** The FLR mark: three peaks in the brand's blue, gold and green. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 32" aria-hidden="true" className={cn("h-8 w-10 shrink-0", className)}>
      <path d="M0 31 L11 7 L22 31 Z" fill="#1565c0" />
      <path d="M8 31 L19.5 1 L31 31 Z" fill="#f9a825" />
      <path d="M17 31 L28.5 8 L40 31 Z" fill="#3d9943" />
    </svg>
  );
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-lg font-extrabold tracking-tight", tone === "light" ? "text-white" : "text-forest-900")}>
          FLR Ltd.
        </span>
        <span className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]", tone === "light" ? "text-forest-200" : "text-sage-500")}>
          Pharmaceutical wholesale
        </span>
      </span>
    </span>
  );
}
