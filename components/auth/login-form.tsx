"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, Clock, Loader2, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, errorMessage } from "@/lib/api";
import { saveSession, type AuthUser } from "@/lib/session";
import { AuthHeading } from "./auth-shell";
import { Field, fieldProps } from "./field";
import { PasswordInput } from "./password-input";

type LoginResponse = { accessToken: string; refreshToken: string; mustChangePassword?: boolean; user: AuthUser };

const schema = z.object({
  email: z.email("Enter the email address on your account."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean(),
});
type Credentials = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState("");
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Credentials>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async ({ email, password, remember }: Credentials) => {
    setError("");
    try {
      const result = await api.post<LoginResponse>("/api/v1/auth/login", { email, password }, { auth: false });
      saveSession(
        { accessToken: result.accessToken, refreshToken: result.refreshToken, mustChangePassword: result.mustChangePassword, user: result.user },
        remember,
      );
      const requested = search.get("next");
      const clientDestination = requested && (requested === "/wholesale" || requested.startsWith("/client")) ? requested : "/wholesale";
      if (result.mustChangePassword) router.replace("/account/password?first=1");
      else if (result.user.role === "CLIENT") router.replace(clientDestination);
      else router.replace("/admin/overview");
    } catch (cause) {
      setError(errorMessage(cause, "Login failed. Please try again."));
    }
  };

  return (
    <div className="grid gap-8">
      <AuthHeading icon={<LogIn />} eyebrow="Secure portal access" title="Welcome back" description="Sign in with your approved client or FLR staff account." />

      {search.get("expired") && !error && (
        <Alert className="border-gold-200 bg-gold-50 text-gold-700">
          <Clock />
          <AlertDescription className="text-gold-700">Your session expired. Please sign in again.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1 border-destructive/30 bg-destructive/5">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <Field id="email" label="Business email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="name@company.com" className="h-10" disabled={isSubmitting} {...register("email")} {...fieldProps("email", errors.email?.message)} />
        </Field>
        <Field
          id="password"
          label="Password"
          error={errors.password?.message}
          action={<Link href="/forgot-password" className="text-sm font-semibold text-brand-700 hover:underline">Forgot password?</Link>}
        >
          <PasswordInput autoComplete="current-password" placeholder="Your password" disabled={isSubmitting} {...register("password")} {...fieldProps("password", errors.password?.message)} />
        </Field>
        <Controller
          control={control}
          name="remember"
          render={({ field }) => (
            <div className="flex items-center gap-2.5">
              <Checkbox id="remember" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} disabled={isSubmitting} />
              <Label htmlFor="remember" className="text-sm font-medium text-sage-700">Keep me signed in on this device</Label>
            </div>
          )}
        />
        <Button type="submit" size="xl" disabled={isSubmitting} className="mt-1 w-full">
          {isSubmitting ? <><Loader2 className="animate-spin" /> Signing in…</> : "Sign in to your account"}
        </Button>
      </form>

      <p className="text-center text-sm text-sage-600">
        New to FLR? <Link href="/register" className="font-semibold text-brand-700 hover:underline">Register your business</Link>
      </p>
    </div>
  );
}
