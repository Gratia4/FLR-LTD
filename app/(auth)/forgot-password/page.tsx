import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/password-forms";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      image={{ src: "/images/flr-trusted-sourcing.webp", alt: "A pharmacy technician scanning stock in the FLR warehouse" }}
      eyebrow="Account recovery"
      title="Secure access, restored safely"
      description="We’ll email a one-time reset link if the address belongs to an active FLR account."
      back={{ href: "/login", label: "Back to sign in" }}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
