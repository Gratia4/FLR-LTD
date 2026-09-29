"use client";

import type { ReactNode } from "react";
import { ConsoleShell } from "./console-shell";
import { can, type AuthUser } from "@/lib/session";

/**
 * Compatibility boundary for the pages that pre-date the new console shell.
 * Keeping it small lets those screens migrate independently without leaving
 * the application in a broken, half-renamed state.
 */
export function AdminShell({
  user,
  active,
  onLogout,
  children,
}: {
  user: AuthUser | null;
  active: string;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <ConsoleShell
      user={user}
      active={active === "dashboard" ? "applications" : active}
      onLogout={onLogout}
      can={(area) => can(user?.role, area)}
    >
      {children}
    </ConsoleShell>
  );
}
