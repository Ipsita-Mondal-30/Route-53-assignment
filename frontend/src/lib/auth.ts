import { apiFetch } from "@/lib/api";

export type AuthUser = {
  id: number;
  email: string;
  created_at: string;
};

export type ConsoleSession = {
  id: string;
  name: string;
  workgroup: string;
  email: string;
};

export const DEMO_CONSOLE_SESSION: ConsoleSession = {
  id: "demo-user",
  name: "avi",
  workgroup: "Workpunkt (497535504622)",
  email: "demo@example.com",
};

const CONSOLE_SESSION_KEY = "route53.console.session";

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function userToConsoleSession(user: AuthUser): ConsoleSession {
  const local = user.email.split("@")[0] || "user";
  if (user.email.toLowerCase() === "demo@example.com") {
    return {
      ...DEMO_CONSOLE_SESSION,
      id: String(user.id),
      email: user.email,
    };
  }
  return {
    id: String(user.id),
    name: local,
    workgroup: `Account (${user.id})`,
    email: user.email,
  };
}

export function saveConsoleSession(session: ConsoleSession): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CONSOLE_SESSION_KEY, JSON.stringify(session));
}

export function clearConsoleSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(CONSOLE_SESSION_KEY);
}

export function readConsoleSession(): ConsoleSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CONSOLE_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ConsoleSession;
    if (parsed.id && parsed.name && parsed.workgroup) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** @deprecated Prefer loginWithPassword / fetchCurrentUser */
export function ensureConsoleSession(): ConsoleSession {
  return readConsoleSession() ?? DEMO_CONSOLE_SESSION;
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<ConsoleSession> {
  const user = await apiFetch<AuthUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const session = userToConsoleSession(user);
  saveConsoleSession(session);
  return session;
}

export async function signupWithPassword(
  email: string,
  password: string,
): Promise<ConsoleSession> {
  const user = await apiFetch<AuthUser>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const session = userToConsoleSession(user);
  saveConsoleSession(session);
  return session;
}

export async function logoutSession(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST" });
  } finally {
    clearConsoleSession();
  }
}

export async function fetchCurrentUser(): Promise<ConsoleSession | null> {
  try {
    const user = await apiFetch<AuthUser>("/auth/me");
    const session = userToConsoleSession(user);
    saveConsoleSession(session);
    return session;
  } catch {
    clearConsoleSession();
    return null;
  }
}
