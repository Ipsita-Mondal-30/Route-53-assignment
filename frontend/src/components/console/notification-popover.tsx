"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellIcon } from "@/components/console/console-icons";
import { Monitor, User } from "lucide-react";

import {
  NOTIFICATIONS_CHANGED_EVENT,
  formatNotificationAge,
  listNotifications,
  markNotificationRead,
  type ConsoleNotificationItem,
  type NotificationTab,
} from "@/lib/notifications-api";

const TABS: { id: NotificationTab; label: string; icon?: "user" | "monitor" }[] = [
  { id: "recent", label: "Most recent" },
  { id: "user_configured", label: "User configured", icon: "user" },
  { id: "aws_managed", label: "AWS managed", icon: "monitor" },
];

export function NotificationNavButton({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    function loadUnread() {
      void listNotifications("recent")
        .then((data) => {
          if (!cancelled) {
            setUnread(data.unread_count);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setUnread(0);
          }
        });
    }
    loadUnread();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, loadUnread);
    window.addEventListener("focus", loadUnread);
    return () => {
      cancelled = true;
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, loadUnread);
      window.removeEventListener("focus", loadUnread);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={onToggle}
        className={`relative inline-flex h-12 w-10 items-center justify-center hover:bg-[#232f3e] ${
          open ? "bg-[#232f3e] text-[#42b4ff]" : "text-white"
        }`}
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unread > 0 && !open ? (
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#42b4ff]" />
        ) : null}
      </button>
      <NotificationPopover
        open={open}
        onClose={onClose}
        onUnreadChange={setUnread}
      />
    </>
  );
}

export function NotificationPopover({
  open,
  onClose,
  onUnreadChange,
}: {
  open: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}) {
  const [tab, setTab] = useState<NotificationTab>("recent");
  const [items, setItems] = useState<ConsoleNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    void listNotifications(tab)
      .then((data) => {
        if (!cancelled) {
          setItems(data.items);
          onUnreadChange?.(data.unread_count);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [onUnreadChange, open, tab]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute top-full right-0 z-[70] w-[420px] overflow-hidden rounded-md border border-[#687078] bg-[#1b232d] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-[16px] font-bold text-white">Notifications</h2>
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-[14px] font-bold text-[#42b4ff] hover:underline"
        >
          Notification center
        </Link>
      </div>

      <div className="hz-tabs flex border-b border-[#414d5c] px-2">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`hz-tab inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-bold whitespace-nowrap ${
                active ? "hz-tab-active text-white" : "text-[#aab7b8] hover:text-white"
              }`}
            >
              {item.icon === "user" ? (
                <User className="h-3.5 w-3.5" strokeWidth={2.25} />
              ) : null}
              {item.icon === "monitor" ? (
                <Monitor className="h-3.5 w-3.5" strokeWidth={2.25} />
              ) : null}
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {loading ? (
          <p className="px-4 py-8 text-center text-[13px] text-[#aab7b8]">Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-[#aab7b8]">
            No notifications
          </p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id} className="border-b border-[#2a313c]">
                <button
                  type="button"
                  className="flex w-full gap-2 px-4 py-3 text-left hover:bg-[#232f3e]"
                  onClick={() => {
                    const wasUnread = !item.read_at;
                    void markNotificationRead(item.id);
                    setItems((current) =>
                      current.map((row) =>
                        row.id === item.id
                          ? { ...row, read_at: row.read_at ?? new Date().toISOString() }
                          : row,
                      ),
                    );
                    if (wasUnread) {
                      onUnreadChange?.(
                        Math.max(
                          0,
                          items.filter((row) => !row.read_at && row.id !== item.id)
                            .length,
                        ),
                      );
                    }
                  }}
                >
                  <Monitor
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#42b4ff]"
                    strokeWidth={2}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[13px] font-bold text-[#42b4ff]">
                        {item.category}
                      </span>
                      <span className="shrink-0 text-[12px] text-[#aab7b8]">
                        {formatNotificationAge(item.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] leading-4 text-[#d5dbdb]">
                      {item.body}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
