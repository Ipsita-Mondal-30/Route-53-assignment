import { apiFetch } from "@/lib/api";

export type NotificationSource = "user_configured" | "aws_managed";
export type NotificationTab = "recent" | "user_configured" | "aws_managed";

export type ConsoleNotificationItem = {
  id: string;
  source: NotificationSource;
  category: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationListResponse = {
  items: ConsoleNotificationItem[];
  unread_count: number;
};

export const NOTIFICATIONS_CHANGED_EVENT = "route53:notifications-changed";

export function emitNotificationsChanged() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export async function listNotifications(
  tab: NotificationTab = "recent",
): Promise<NotificationListResponse> {
  return apiFetch<NotificationListResponse>(`/notifications?tab=${tab}`);
}

export async function markNotificationRead(
  id: string,
): Promise<ConsoleNotificationItem> {
  return apiFetch<ConsoleNotificationItem>(`/notifications/${id}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch<void>("/notifications/read-all", { method: "POST" });
}

export function formatNotificationAge(iso: string): string {
  const then = parseUtcMillis(iso);
  if (Number.isNaN(then)) {
    return "";
  }
  const minutes = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function parseUtcMillis(iso: string): number {
  const trimmed = iso.trim();
  if (!trimmed) {
    return Number.NaN;
  }
  const hasZone = /[zZ]$/.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed);
  return new Date(hasZone ? trimmed : `${trimmed}Z`).getTime();
}
