import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Client login" };

export default function LoginPage() {
  return (
    <AuthShell
      image={{ src: "/images/flr-healthcare-partnership.webp", alt: "A pharmacist advising a client at a pharmacy counter" }}
      eyebrow="FLR partner portal"
      title="Your wholesale portal, always available"
      description="Secure access to wholesale pricing, live stock, orders and invoices — for verified partners and FLR staff."
      points={["Contract pricing for your account", "Live availability and batch-traced stock", "Order history, invoices and documents"]}
    >
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-sage-100" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
