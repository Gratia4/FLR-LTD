import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/password-forms";

export const metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      image={{ src: "/images/flr-trusted-sourcing.webp", alt: "A pharmacy technician scanning stock in the FLR warehouse" }}
      eyebrow="Password security"
      title="Choose a strong new password"
      description="Use at least eight characters with an uppercase letter, a number and a symbol."
      back={{ href: "/login", label: "Back to sign in" }}
    >
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-sage-100" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
