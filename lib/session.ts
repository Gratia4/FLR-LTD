export type UserRole = "CLIENT" | "SUPER_ADMIN" | "SALES_MANAGER" | "CONTENT_MANAGER" | "LOGISTICS" | "FINANCE";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  businessId: string | null;
  businessName: string | null;
  preferredLanguage?: string;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  mustChangePassword?: boolean;
};

const ACCESS = "flr_access_token";
const REFRESH = "flr_refresh_token";
const USER = "flr_user";
const FLAG = "flr_must_change_password";

/** Fires whenever the session changes so every mounted hook re-reads it. */
export const SESSION_EVENT = "flr:session";

const stores = () => (typeof window === "undefined" ? [] : [window.localStorage, window.sessionStorage]);

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EVENT));
}

export function saveSession(session: Session, remember: boolean) {
  if (typeof window === "undefined") return;
  const primary = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  for (const key of [ACCESS, REFRESH, USER, FLAG]) other.removeItem(key);

  primary.setItem(ACCESS, session.accessToken);
  primary.setItem(REFRESH, session.refreshToken);
  primary.setItem(USER, JSON.stringify(session.user));
  if (session.mustChangePassword) primary.setItem(FLAG, "1");
  else primary.removeItem(FLAG);
  notify();
}

/** Replaces the tokens after a refresh without disturbing where they are stored. */
export function updateTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  const store = stores().find((candidate) => candidate.getItem(ACCESS));
  if (!store) return;
  store.setItem(ACCESS, accessToken);
  store.setItem(REFRESH, refreshToken);
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  for (const store of stores()) {
    const accessToken = store.getItem(ACCESS);
    const refreshToken = store.getItem(REFRESH);
    const rawUser = store.getItem(USER);
    if (!accessToken || !rawUser) continue;
    try {
      return {
        accessToken,
        refreshToken: refreshToken ?? "",
        user: JSON.parse(rawUser) as AuthUser,
        mustChangePassword: store.getItem(FLAG) === "1",
      };
    } catch {
      clearSession();
      return null;
    }
  }
  return null;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  for (const store of stores()) for (const key of [ACCESS, REFRESH, USER, FLAG]) store.removeItem(key);
  notify();
}

export const isStaff = (role: UserRole | undefined) => !!role && role !== "CLIENT";

/** Mirrors PERMISSIONS in the backend so the console hides what it cannot call. */
export const PERMISSIONS: Record<string, UserRole[]> = {
  registrations: ["SUPER_ADMIN", "SALES_MANAGER"],
  clients: ["SUPER_ADMIN", "SALES_MANAGER"],
  catalogue: ["SUPER_ADMIN", "CONTENT_MANAGER"],
  inventory: ["SUPER_ADMIN", "LOGISTICS", "CONTENT_MANAGER"],
  fulfilment: ["SUPER_ADMIN", "LOGISTICS", "SALES_MANAGER"],
  finance: ["SUPER_ADMIN", "FINANCE"],
  staff: ["SUPER_ADMIN"],
  analytics: ["SUPER_ADMIN", "SALES_MANAGER", "FINANCE"],
  communications: ["SUPER_ADMIN", "SALES_MANAGER", "CONTENT_MANAGER"],
};

export const can = (role: UserRole | undefined, area: keyof typeof PERMISSIONS | string) =>
  !!role && (PERMISSIONS[area] ?? []).includes(role);
