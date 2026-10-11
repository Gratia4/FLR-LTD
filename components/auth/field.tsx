"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Accessible props for the control inside a <Field>: marks it invalid and links its error. */
export const fieldProps = (id: string, error?: string, hint?: boolean) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": [error ? `${id}-error` : "", hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined,
});

/** Label, control, optional hint and inline error, in one consistent block. */
export function Field({
  id,
  label,
  required,
  hint,
  error,
  className,
  action,
  children,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  /** Rendered at the end of the label row, e.g. a "Forgot password?" link. */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-semibold text-forest-900">
          <span>
            {label}
            {required && <span className="ml-0.5 text-brand-600" aria-hidden="true">*</span>}
          </span>
        </Label>
        {action}
      </div>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-xs leading-relaxed text-sage-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="animate-in fade-in slide-in-from-top-1 text-sm text-destructive duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
