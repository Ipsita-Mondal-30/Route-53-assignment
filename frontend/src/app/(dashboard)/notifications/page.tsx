"use client";

import { useEffect, useState } from "react";
import { Monitor, User } from "lucide-react";

import {
  formatNotificationAge,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ConsoleNotificationItem,
  type NotificationTab,
} from "@/lib/notifications-api";

const TABS: { id: NotificationTab; label: string; icon?: "user" | "monitor" }[] = [
  { id: "recent", label: "Most recent" },
  { id: "user_configured", label: "User configured", icon: "user" },
  { id: "aws_managed", label: "AWS managed", icon: "monitor" },
];

export default function NotificationCenterPage() {
  const [tab, setTab] = useState<NotificationTab>("recent");
  const [items, setItems] = useState<ConsoleNotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listNotifications(tab)
      .then((data) => {
        if (!cancelled) {
          setItems(data.items);
          setUnread(data.unread_count);
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
  }, [tab]);

  return (
    <div className="mx-auto w-full max-w-[860px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-[24px] leading-8 font-bold text-white">Notification center</h1>
        <button
          type="button"
          className="text-[14px] font-bold text-[#42b4ff] hover:underline disabled:opacity-50"
          disabled={unread === 0}
          onClick={() => {
            void markAllNotificationsRead().then(() => {
              setUnread(0);
              setItems((current) =>
                current.map((item) => ({
                  ...item,
                  read_at: item.read_at ?? new Date().toISOString(),
                })),
              );
            });
          }}
        >
          Mark all as read
        </button>
      </div>

      <div className="hz-tabs mb-0 flex border-b border-[#414d5c]">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`hz-tab inline-flex items-center gap-1.5 px-4 py-2.5 text-[14px] font-bold ${
                active ? "hz-tab-active text-[#42b4ff]" : "text-[#d5dbdb] hover:text-white"
              }`}
            >
              {item.icon === "user" ? <User className="h-4 w-4" /> : null}
              {item.icon === "monitor" ? <Monitor className="h-4 w-4" /> : null}
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-b-lg border border-t-0 border-[#414d5c]">
        {loading ? (
          <p className="px-5 py-10 text-center text-[14px] text-[#aab7b8]">Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-[#aab7b8]">
            No notifications
          </p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id} className="border-b border-[#2a313c] last:border-b-0">
                <button
                  type="button"
                  className="flex w-full gap-3 px-5 py-4 text-left hover:bg-[#1c2430]"
                  onClick={() => {
                    void markNotificationRead(item.id).then((updated) => {
                      setItems((current) =>
                        current.map((row) => (row.id === updated.id ? updated : row)),
                      );
                      setUnread((count) => Math.max(0, count - (item.read_at ? 0 : 1)));
                    });
                  }}
                >
                  <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-[#42b4ff]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[14px] font-bold text-[#42b4ff]">
                        {item.category}
                      </span>
                      <span className="shrink-0 text-[12px] text-[#aab7b8]">
                        {formatNotificationAge(item.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-5 text-[#d5dbdb]">{item.body}</p>
                    {!item.read_at ? (
                      <span className="mt-2 inline-block text-[12px] font-bold text-[#42b4ff]">
                        Unread
                      </span>
                    ) : null}
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
