"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ArrowLeft, Eye, EyeSlash, LockKey } from "@phosphor-icons/react";
import { api, errorMessage } from "@/lib/api";
import { saveSession, type AuthUser } from "@/lib/session";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  mustChangePassword?: boolean;
  user: AuthUser;
};

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await api.post<LoginResponse>("/api/v1/auth/login", {
        email: form.get("email"), password: form.get("password"),
      }, { auth: false });
      saveSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        mustChangePassword: result.mustChangePassword,
        user: result.user,
      }, form.get("remember") === "on");
      if (result.mustChangePassword) router.replace("/account/password?first=1");
      else if (result.user.role === "CLIENT") router.replace(search.get("next") || "/wholesale-preview");
      else router.replace("/admin/overview");
    } catch (cause) { setError(errorMessage(cause, "Login failed. Please try again.")); }
    finally { setLoading(false); }
  }

  return <main className="auth-page"><section className="auth-aside"><Link href="/"><ArrowLeft/>Back to website</Link><div><span>FLR Ltd.</span><h1>Your wholesale portal, always available.</h1><p>Secure access to wholesale operations, verified clients, orders and inventory.</p></div><small>Pharmaceutical Wholesale · Dépôt Pharmaceutique</small></section><section className="auth-panel"><form className="auth-form" onSubmit={submit}><div className="auth-logo">FLR</div><span>Secure portal access</span><h2>Welcome back</h2><p>Sign in with your approved client or FLR staff account.</p>{search.get("expired")&&<div className="form-error">Your session expired. Please sign in again.</div>}{error&&<div className="form-error" role="alert">{error}</div>}<label>Business email<input name="email" type="email" required autoComplete="email" placeholder="name@company.com" disabled={loading}/></label><label>Password<div className="password-field"><input name="password" type={visible?"text":"password"} required autoComplete="current-password" placeholder="Your password" disabled={loading}/><button type="button" onClick={()=>setVisible(value=>!value)} aria-label={visible?"Hide password":"Show password"}>{visible?<EyeSlash/>:<Eye/>}</button></div></label><div className="form-row"><label className="check"><input name="remember" type="checkbox" disabled={loading}/>Remember me</label><Link href="/forgot-password">Forgot password?</Link></div><button type="submit" disabled={loading}>{loading?"Signing in…":"Login to your account"}</button><div className="secure-note"><LockKey/>Encrypted, role-protected access</div><p className="auth-switch">Not registered? <Link href="/register">Create a partner account</Link></p></form></section></main>;
}

export default function LoginPage() {
  return <Suspense fallback={<main className="portal-loading"><p>Loading secure sign in…</p></main>}><LoginForm/></Suspense>;
}
