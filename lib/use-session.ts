"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setSessionExpiredHandler } from "./api";
import { can, clearSession, isStaff, readSession, SESSION_EVENT, type AuthUser, type Session } from "./session";

type State = { session: Session | null; status: "loading" | "ready" | "anonymous" };

function useStoredSession(): State {
  const [state, setState] = useState<State>({ session: null, status: "loading" });

  useEffect(() => {
    const sync = () => {
      const session = readSession();
      setState({ session, status: session ? "ready" : "anonymous" });
    };
    sync();
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener("storage", sync); // keeps other tabs in step
    return () => {
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}

function useLogout() {
  const router = useRouter();
  return useCallback(async () => {
    const session = readSession();
    // Revoke server-side, but never block sign-out on the network.
    if (session?.refreshToken) {
      await api.post("/api/v1/auth/logout", { refreshToken: session.refreshToken }, { auth: false }).catch(() => undefined);
    }
    clearSession();
    router.replace("/login");
  }, [router]);
}

/** Guards the staff console. Redirects anyone who is not signed-in staff. */
export function useAdminSession() {
  const router = useRouter();
  const { session, status } = useStoredSession();
  const logout = useLogout();

  useEffect(() => {
    setSessionExpiredHandler(() => router.replace("/login?expired=1"));
    return () => setSessionExpiredHandler(null);
  }, [router]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !isStaff(session.user.role)) router.replace("/login");
    else if (session.mustChangePassword) router.replace("/account/password?first=1");
  }, [session, status, router]);

  const user = session && isStaff(session.user.role) ? session.user : null;
  return {
    user,
    role: user?.role,
    token: session?.accessToken ?? "",
    loading: status === "loading",
    logout,
    can: (area: string) => can(user?.role, area),
  };
}

/** Guards the client portal. */
export function usePortalSession() {
  const router = useRouter();
  const { session, status } = useStoredSession();
  const logout = useLogout();

  useEffect(() => {
    setSessionExpiredHandler(() => router.replace("/login?expired=1"));
    return () => setSessionExpiredHandler(null);
  }, [router]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login?next=/wholesale");
    else if (session.user.role !== "CLIENT") router.replace("/admin/overview");
    else if (session.mustChangePassword) router.replace("/account/password?first=1");
  }, [session, status, router]);

  const user: AuthUser | null = session?.user.role === "CLIENT" ? session.user : null;
  return { user, loading: status === "loading", logout };
}

/** Read-only view of the session for public pages (the storefront header). */
export function useOptionalSession() {
  const { session, status } = useStoredSession();
  const logout = useLogout();
  return { user: session?.user ?? null, loading: status === "loading", logout };
}
