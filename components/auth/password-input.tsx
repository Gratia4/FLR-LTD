"use client";

import { Check, Eye, EyeOff, X } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Password field with a show/hide toggle. */
export function PasswordInput({ className, ...props }: ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("h-10 pr-10", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-sage-400 transition-colors hover:bg-sage-100 hover:text-forest-900"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

/** The same rules the backend enforces for every new password. */
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "An uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "A number", test: (value: string) => /[0-9]/.test(value) },
  { label: "A symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

/** Live checklist + strength bar under a new-password field. */
export function PasswordChecklist({ value }: { value: string }) {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  const tone = passed <= 1 ? "bg-destructive" : passed < PASSWORD_RULES.length ? "bg-gold-500" : "bg-brand-500";
  return (
    <div className="grid gap-2.5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {PASSWORD_RULES.map((rule, index) => (
          <span key={rule.label} className={cn("h-1 rounded-full transition-colors duration-300", index < passed && value ? tone : "bg-sage-200")} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li key={rule.label} className={cn("flex items-center gap-1.5 text-xs transition-colors", ok ? "text-brand-700" : "text-sage-500")}>
              {ok ? <Check className="size-3.5" /> : <X className="size-3.5 opacity-50" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
