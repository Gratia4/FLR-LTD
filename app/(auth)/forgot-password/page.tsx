"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle, EnvelopeSimple } from "@phosphor-icons/react";
import { api, errorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);setError("");const form=new FormData(event.currentTarget);try{const result=await api.post<{message:string}>("/api/v1/auth/forgot-password",{email:form.get("email")},{auth:false});setMessage(result.message);}catch(cause){setError(errorMessage(cause));}finally{setLoading(false)}}
  return <main className="auth-page"><section className="auth-aside"><Link href="/login"><ArrowLeft/>Back to sign in</Link><div><span>Account recovery</span><h1>Secure access, restored safely.</h1><p>We will send a one-time reset link if the email belongs to an active FLR account.</p></div><small>FLR Ltd. · Kigali, Rwanda</small></section><section className="auth-panel"><form className="auth-form" onSubmit={submit}><div className="auth-logo"><EnvelopeSimple/></div><span>Account recovery</span><h2>Reset your password</h2>{message?<div className="auth-success"><CheckCircle/><p>{message}</p></div>:<><p>Enter the email address used for your partner or staff account.</p>{error&&<div className="form-error" role="alert">{error}</div>}<label>Email address<input name="email" type="email" required autoComplete="email"/></label><button type="submit" disabled={loading}>{loading?"Sending…":"Send reset link"}</button></>}<p className="auth-switch"><Link href="/login">Return to sign in</Link></p></form></section></main>;
}
