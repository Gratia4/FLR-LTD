"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, ArrowRight, KeyRound, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, errorMessage } from "@/lib/api";
import { clearSession } from "@/lib/session";
import { newPasswordSchema } from "@/lib/validation";
import { AuthHeading } from "./auth-shell";
import { Field, fieldProps } from "./field";
import { PasswordChecklist, PasswordInput } from "./password-input";

function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1 border-destructive/30 bg-destructive/5">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function SuccessPanel({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="grid justify-items-center gap-4 rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
      <span className="grid size-14 place-items-center rounded-full bg-brand-600 text-white [&_svg]:size-7">{icon}</span>
      <h3 className="font-display text-xl font-bold text-forest-900">{title}</h3>
      <p className="leading-relaxed text-sage-600">{message}</p>
      {action}
    </div>
  );
}

/* ----------------------------- forgot password ---------------------------- */

const emailSchema = z.object({ email: z.email("Enter the email address on your account.") });

export function ForgotPasswordForm() {
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });

  const onSubmit = async ({ email }: { email: string }) => {
    setError("");
    try {
      const result = await api.post<{ message: string }>("/api/v1/auth/forgot-password", { email }, { auth: false });
      setSent(result.message);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  return (
    <div className="grid gap-8">
      <AuthHeading icon={<KeyRound />} eyebrow="Account recovery" title="Reset your password" description="Enter the email address used for your partner or staff account. We’ll send a one-time reset link." />
      {sent ? (
        <SuccessPanel icon={<MailCheck />} title="Check your inbox" message={sent} />
      ) : (
        <>
          <ErrorAlert message={error} />
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
            <Field id="email" label="Email address" error={errors.email?.message}>
              <Input type="email" autoComplete="email" placeholder="name@company.com" className="h-10" disabled={isSubmitting} {...register("email")} {...fieldProps("email", errors.email?.message)} />
            </Field>
            <Button type="submit" size="xl" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <><Loader2 className="animate-spin" /> Sending…</> : "Send reset link"}
            </Button>
          </form>
        </>
      )}
      <p className="text-center text-sm text-sage-600">
        Remembered it? <Link href="/login" className="font-semibold text-brand-700 hover:underline">Return to sign in</Link>
      </p>
    </div>
  );
}

/* ------------------------------ reset password ---------------------------- */

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async ({ password }: { password: string }) => {
    setError("");
    try {
      const result = await api.post<{ message: string }>("/api/v1/auth/reset-password", { token, password }, { auth: false });
      setDone(result.message);
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  return (
    <div className="grid gap-8">
      <AuthHeading icon={<KeyRound />} eyebrow="Secure reset" title="Set a new password" description="This reset link can be used once." />
      {done ? (
        <SuccessPanel
          icon={<ShieldCheck />}
          title="Password updated"
          message={done}
          action={<Button asChild size="lg" className="mt-2"><Link href="/login">Continue to sign in <ArrowRight /></Link></Button>}
        />
      ) : !token ? (
        <ErrorAlert message="This reset link is missing its security token. Request a new link to continue." />
      ) : (
        <>
          <ErrorAlert message={error} />
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
            <Field id="password" label="New password" error={errors.password?.message}>
              <PasswordInput autoComplete="new-password" disabled={isSubmitting} {...register("password")} {...fieldProps("password", errors.password?.message)} />
            </Field>
            <PasswordChecklist value={watch("password")} />
            <Field id="confirm" label="Confirm new password" error={errors.confirm?.message}>
              <PasswordInput autoComplete="new-password" disabled={isSubmitting} {...register("confirm")} {...fieldProps("confirm", errors.confirm?.message)} />
            </Field>
            <Button type="submit" size="xl" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <><Loader2 className="animate-spin" /> Updating…</> : "Update password"}
            </Button>
          </form>
        </>
      )}
      <p className="text-center text-sm text-sage-600">
        Link expired? <Link href="/forgot-password" className="font-semibold text-brand-700 hover:underline">Request another link</Link>
      </p>
    </div>
  );
}

/* ------------------------------ change password --------------------------- */

const changeSchema = newPasswordSchema.and(z.object({ currentPassword: z.string().min(1, "Enter your current password.") }));

export function ChangePasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const firstLogin = params.get("first") === "1";
  const [error, setError] = useState("");
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof changeSchema>>({
    resolver: zodResolver(changeSchema),
    defaultValues: { currentPassword: "", password: "", confirm: "" },
  });

  const onSubmit = async ({ currentPassword, password }: z.infer<typeof changeSchema>) => {
    setError("");
    try {
      await api.post("/api/v1/auth/change-password", { currentPassword, password });
      clearSession();
      router.replace("/login");
    } catch (cause) {
      setError(errorMessage(cause));
    }
  };

  return (
    <div className="grid gap-8">
      <AuthHeading
        icon={<ShieldCheck />}
        eyebrow={firstLogin ? "Required security step" : "Account security"}
        title="Change your password"
        description={firstLogin ? "Replace your temporary password before continuing. You’ll sign in again with the new one." : "You’ll be asked to sign in again with your new password."}
      />
      <ErrorAlert message={error} />
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <Field id="currentPassword" label={firstLogin ? "Temporary password" : "Current password"} error={errors.currentPassword?.message}>
          <PasswordInput autoComplete="current-password" disabled={isSubmitting} {...register("currentPassword")} {...fieldProps("currentPassword", errors.currentPassword?.message)} />
        </Field>
        <Field id="password" label="New password" error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" disabled={isSubmitting} {...register("password")} {...fieldProps("password", errors.password?.message)} />
        </Field>
        <PasswordChecklist value={watch("password")} />
        <Field id="confirm" label="Confirm new password" error={errors.confirm?.message}>
          <PasswordInput autoComplete="new-password" disabled={isSubmitting} {...register("confirm")} {...fieldProps("confirm", errors.confirm?.message)} />
        </Field>
        <Button type="submit" size="xl" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <><Loader2 className="animate-spin" /> Saving…</> : "Save new password"}
        </Button>
      </form>
    </div>
  );
}
