import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ChangePasswordForm } from "@/components/auth/password-forms";

export const metadata = { title: "Change password" };

export default function ChangePasswordPage() {
  return (
    <AuthShell
      image={{ src: "/images/flr-trusted-sourcing.webp", alt: "A pharmacy technician scanning stock in the FLR warehouse" }}
      eyebrow="Account security"
      title="Protect your FLR account"
      description="Replace your temporary password before entering the management console or the wholesale portal."
      points={["Passwords are hashed and never visible to staff", "Every sign-in is role-protected"]}
    >
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-sage-100" />}>
        <ChangePasswordForm />
      </Suspense>
    </AuthShell>
  );
}
