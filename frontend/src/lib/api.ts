const LOCAL_API_URL = "http://localhost:8000";
const SAME_ORIGIN_API_PREFIX = "/api/backend";

function readEnvUrl(value: string | undefined): string {
  return value?.split(",")[0]?.trim().replace(/\/$/, "") || "";
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function getApiBaseUrl(): string {
  const configured = readEnvUrl(process.env.NEXT_PUBLIC_API_URL);

  // Hosted UI (Vercel) must never call localhost or a cross-origin API —
  // the same-origin proxy avoids CORS and keeps the session cookie first-party.
  if (typeof window !== "undefined" && !isLocalHostname(window.location.hostname)) {
    return SAME_ORIGIN_API_PREFIX;
  }

  if (configured) {
    return configured;
  }

  return typeof window === "undefined" ? LOCAL_API_URL : SAME_ORIGIN_API_PREFIX;
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function parseDetail(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown };
    if (typeof data.detail === "string") {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }
          if (item && typeof item === "object") {
            const entry = item as { msg?: unknown; loc?: unknown };
            if (typeof entry.msg === "string") {
              const loc = Array.isArray(entry.loc)
                ? entry.loc.filter((part) => part !== "body").join(".")
                : "";
              return loc ? `${loc}: ${entry.msg}` : entry.msg;
            }
            return JSON.stringify(item);
          }
          return String(item);
        })
        .join("; ");
    }
    if (data.detail != null) {
      return typeof data.detail === "object"
        ? JSON.stringify(data.detail)
        : String(data.detail);
    }
  } catch {
    /* ignore */
  }
  return response.statusText || "Request failed";
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseDetail(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
