export type MockSession = {
  email: string;
  signedInAt: string;
};

const STORAGE_KEY = "route53.auth";

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function getMockSession(): MockSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as MockSession;
    if (!parsed.email || !parsed.signedInAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setMockSession(email: string): MockSession {
  const session: MockSession = {
    email: email.trim(),
    signedInAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearMockSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}

export type ConsoleSession = {
  id: string;
  name: string;
  workgroup: string;
};

export const DEMO_CONSOLE_SESSION: ConsoleSession = {
  id: "demo-user",
  name: "avi",
  workgroup: "Workp... (497535504622)",
};

const CONSOLE_SESSION_KEY = "route53.console.session";

export function ensureConsoleSession(): ConsoleSession {
  if (typeof window === "undefined") {
    return DEMO_CONSOLE_SESSION;
  }

  try {
    const raw = window.localStorage.getItem(CONSOLE_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ConsoleSession;
      if (parsed.id && parsed.name && parsed.workgroup) {
        return parsed;
      }
    }
  } catch {
    /* ignore corrupt session */
  }

  window.localStorage.setItem(
    CONSOLE_SESSION_KEY,
    JSON.stringify(DEMO_CONSOLE_SESSION),
  );
  return DEMO_CONSOLE_SESSION;
}

export function getConsoleSession(): ConsoleSession {
  return ensureConsoleSession();
}
