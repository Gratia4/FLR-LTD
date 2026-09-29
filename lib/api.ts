import { clearSession, readSession, updateTokens } from "./session";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

function localApiUrl() {
  // If the Next dev server is opened through a LAN address, localhost would
  // point at the viewing device. Reuse the frontend hostname for port 8080.
  if (typeof window !== "undefined") return `${window.location.protocol}//${window.location.hostname}:8080`;
  return "http://localhost:8080";
}

export const API_URL = (configuredApiUrl === "same-host" || !configuredApiUrl ? localApiUrl() : configuredApiUrl).replace(/\/$/, "");

type ApiErrorBody = { error?: { message?: string; code?: string; details?: unknown } };

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = "REQUEST_FAILED",
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  /** Plain object is JSON-encoded; FormData is sent as-is. */
  body?: unknown;
  /** Attach the stored access token. Defaults to true. */
  auth?: boolean;
  /** Query string values; null/undefined/"" entries are dropped. */
  query?: Record<string, string | number | boolean | null | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  if (!query) return `${API_URL}${path}`;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const suffix = search.toString();
  return `${API_URL}${path}${suffix ? `?${suffix}` : ""}`;
}

/* -------------------------------------------------------------------------- *
 * Refresh: one in-flight attempt is shared by every concurrent 401 so a page
 * loading six panels does not fire six refreshes and invalidate its own token.
 * -------------------------------------------------------------------------- */

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const session = readSession();
  if (!session?.refreshToken) return null;

  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      if (!response.ok) return null;
      const body = (await response.json()) as { accessToken: string; refreshToken: string };
      updateTokens(body.accessToken, body.refreshToken);
      return body.accessToken;
    } catch {
      return null;
    } finally {
      // Release the lock on the next tick so queued callers read the new token.
      setTimeout(() => (refreshInFlight = null), 0);
    }
  })();

  return refreshInFlight;
}

/** Called when the session is unrecoverable — the app should return to sign-in. */
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

/* -------------------------------------------------------------------------- */

async function send<T>(path: string, options: RequestOptions, accessToken: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const isSerialized = typeof options.body === "string";

  if (options.body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      ...options,
      headers,
      body: options.body === undefined
        ? undefined
        : isFormData || isSerialized
          ? (options.body as BodyInit)
          : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiRequestError(
      "We could not reach the FLR service. Check your connection and try again.",
      0,
      "NETWORK_ERROR",
    );
  }

  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!response.ok) {
    throw new ApiRequestError(
      body.error?.message ?? "Your request could not be completed.",
      response.status,
      body.error?.code,
      body.error?.details,
    );
  }
  return body;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const useAuth = options.auth !== false;
  const session = useAuth ? readSession() : null;

  try {
    return await send<T>(path, options, session?.accessToken ?? null);
  } catch (error) {
    const expired =
      error instanceof ApiRequestError &&
      error.status === 401 &&
      useAuth &&
      !!session &&
      // A wrong password on the sign-in form is not an expired session.
      !path.startsWith("/api/v1/auth/login");

    if (!expired) throw error;

    const accessToken = await refreshAccessToken();
    if (accessToken) return send<T>(path, options, accessToken);

    clearSession();
    onSessionExpired?.();
    throw new ApiRequestError("Your session has expired. Please sign in again.", 401, "SESSION_EXPIRED");
  }
}

/** Convenience wrappers — `api.get("/path", { query })`, `api.post("/path", body)`. */
export const api = {
  get:   <T,>(path: string, options: RequestOptions = {}) => apiRequest<T>(path, { ...options, method: "GET" }),
  post:  <T,>(path: string, body?: unknown, options: RequestOptions = {}) => apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T,>(path: string, body?: unknown, options: RequestOptions = {}) => apiRequest<T>(path, { ...options, method: "PATCH", body }),
  put:   <T,>(path: string, body?: unknown, options: RequestOptions = {}) => apiRequest<T>(path, { ...options, method: "PUT", body }),
  delete:<T,>(path: string, options: RequestOptions = {}) => apiRequest<T>(path, { ...options, method: "DELETE" }),
};

export const errorMessage = (cause: unknown, fallback = "Something went wrong. Please try again.") =>
  cause instanceof ApiRequestError ? cause.message : fallback;
