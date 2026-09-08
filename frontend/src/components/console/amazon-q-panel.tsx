"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  History,
  Maximize2,
  Plus,
  SendHorizontal,
  Settings,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import { askAmazonQ } from "@/lib/amazon-q-api";

const SUGGESTIONS = [
  {
    id: "zone",
    title: "How do I create a public hosted zone?",
    subtitle: "Steps to create a zone and get assigned name servers.",
    tag: "Q&A",
  },
  {
    id: "alias",
    title: "When should I use an alias record instead of a CNAME?",
    subtitle: "Route 53 alias vs CNAME at the zone apex and for AWS targets.",
    tag: "Q&A",
  },
  {
    id: "weighted",
    title: "How do weighted routing policies work?",
    subtitle: "Split traffic across records with health checks.",
    tag: "Q&A",
  },
] as const;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export function AmazonQPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    const history = messages.map(({ role, text: body }) => ({
      role,
      text: body,
    }));
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);

    try {
      const reply = await askAmazonQ([...history, { role: "user", text: trimmed }]);
      setMessages((current) => [
        ...current,
        { id: `a-${Date.now()}`, role: "assistant", text: reply },
      ]);
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.detail
          : "Amazon Q is unavailable. Try again.";
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: detail,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside
      className={`flex h-full flex-col overflow-hidden border-[#2a313c] bg-[#161d27] transition-[width] duration-200 ease-out ${
        open
          ? "w-[min(100%,380px)] shrink-0 border-r opacity-100"
          : "pointer-events-none w-0 min-w-0 shrink-0 border-r-0 opacity-0"
      }`}
      aria-hidden={!open}
      aria-labelledby={titleId}
    >
      <div className="flex h-full w-[min(100vw,380px)] flex-col">
        <div className="flex h-10 shrink-0 items-center justify-between px-3">
          <h2 id={titleId} className="text-[14px] leading-5 font-bold text-white">
            Amazon Q
          </h2>
          <div className="flex items-center text-[#d5dbdb]">
            <PanelIconButton
              label="New conversation"
              onClick={() => {
                setMessages([]);
                setDraft("");
                inputRef.current?.focus();
              }}
            >
              <Plus className="h-[15px] w-[15px]" strokeWidth={2} />
            </PanelIconButton>
            <PanelIconButton label="Library">
              <BookOpen className="h-[15px] w-[15px]" strokeWidth={2} />
            </PanelIconButton>
            <PanelIconButton label="History">
              <History className="h-[15px] w-[15px]" strokeWidth={2} />
            </PanelIconButton>
            <PanelIconButton label="Settings">
              <Settings className="h-[15px] w-[15px]" strokeWidth={2} />
            </PanelIconButton>
            <span className="mx-0.5 h-4 w-px bg-[#545b64]" aria-hidden="true" />
            <PanelIconButton label="Open in a new window">
              <Maximize2 className="h-[14px] w-[14px]" strokeWidth={2} />
            </PanelIconButton>
            <PanelIconButton label="Close Amazon Q" onClick={onClose}>
              <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
            </PanelIconButton>
          </div>
        </div>
        <div
          className="h-px w-full shrink-0 bg-linear-to-r from-[#c51a70] via-[#6b4ae0] to-[#3ec6e0]"
          aria-hidden="true"
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-8 pb-4">
          {messages.length === 0 ? (
            <div className="mb-8 flex flex-col items-center">
              <AmazonQHexLogo />
              <p className="mt-5 text-center text-[20px] leading-7 font-bold text-white">
                How can I help you today?
              </p>
            </div>
          ) : (
            <div className="mb-4 flex flex-col gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[92%] rounded-lg px-3 py-2 text-[13px] leading-5 whitespace-pre-wrap ${
                    message.role === "user"
                      ? "self-end bg-[#232f3e] text-white"
                      : "self-start bg-[#1b232d] text-[#d5dbdb]"
                  }`}
                >
                  {message.text}
                </div>
              ))}
              {loading ? (
                <div className="self-start max-w-[92%] rounded-lg bg-[#1b232d] px-3 py-2 text-[13px] leading-5 text-[#8d99a6]">
                  Amazon Q is thinking…
                </div>
              ) : null}
            </div>
          )}

          <label className="relative mt-auto block">
            <span className="sr-only">Ask Amazon Q</span>
            <textarea
              ref={inputRef}
              rows={4}
              maxLength={10000}
              value={draft}
              placeholder="Ask about Route 53 hosted zones, records, or routing policies."
              className="w-full resize-none rounded-md border border-[#687078] bg-transparent px-3 py-2.5 pr-9 text-[14px] leading-5 font-normal text-white placeholder:text-[#8d99a6] placeholder:italic outline-none focus:border-[#42b4ff] focus:shadow-[0_0_0_1px_#42b4ff]"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(draft);
                }
              }}
            />
            <button
              type="button"
              aria-label="Send"
              disabled={!draft.trim() || loading}
              className="absolute right-2 bottom-3 inline-flex h-7 w-7 items-center justify-center text-white hover:text-[#42b4ff] disabled:text-[#545b64]"
              onClick={() => void send(draft)}
            >
              <SendHorizontal className="h-4 w-4" strokeWidth={2} />
            </button>
          </label>
          <p className="mt-1.5 text-[12px] leading-4 text-[#8d99a6]">
            Max 10000 characters
          </p>

          {messages.length === 0 ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="rounded-lg border border-[#3d3348] bg-[#1a1e29] px-3 py-2.5 text-left hover:border-[#5a4a6a] hover:bg-[#1e2430]"
                  onClick={() => {
                    setDraft(item.title);
                    inputRef.current?.focus();
                  }}
                >
                  <span className="block text-[13px] leading-5 font-bold text-white">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[12px] leading-4 text-[#8d99a6]">
                    {item.subtitle}
                  </span>
                  <span className="mt-2 inline-flex rounded-sm bg-[#e8c4ff] px-1.5 py-px text-[11px] leading-4 font-bold text-[#2a1038]">
                    {item.tag}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 px-4 py-2.5">
          <p className="text-[12px] leading-4 text-[#aab7b8]">
            Help us improve Amazon Q by{" "}
            <a href="#" className="font-bold text-[#42b4ff] hover:underline">
              providing feedback
            </a>
            .
          </p>
        </div>
      </div>
    </aside>
  );
}

function AmazonQHexLogo() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aq-hex-stroke" x1="36" y1="68" x2="36" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C51A70" />
          <stop offset="0.45" stopColor="#6B4AE0" />
          <stop offset="1" stopColor="#2E8DE1" />
        </linearGradient>
        <linearGradient id="aq-hex-fill" x1="56" y1="8" x2="12" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B2E9C" />
          <stop offset="0.4" stopColor="#5B4ADB" />
          <stop offset="1" stopColor="#2E8DE1" />
        </linearGradient>
      </defs>
      <path
        d="M36 6.5 61.5 21.2v29.6L36 65.5 10.5 50.8V21.2L36 6.5Z"
        fill="url(#aq-hex-fill)"
        fillOpacity="0.18"
        stroke="url(#aq-hex-stroke)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        fill="#fff"
        d="M47.05 25.18 36.02 18.8a2.6 2.6 0 0 0-2.54 0L22.45 25.18c-.96.54-1.74 1.9-1.74 3v12.36c0 1.1.78 2.46 1.74 3.02l10.72 6.18c.48.28 1.1.42 1.74.42s1.26-.14 1.74-.42l10.72-6.18c.96-.56 1.74-1.92 1.74-3.02V28.18c0-1.1-.78-2.46-1.74-3h-.32Zm-11.05 21L25.8 40.3V28.5l10.2-5.88 10.2 5.88v9.44l-6.18-3.56v-1.48c0-.52-.28-.98-.72-1.24l-2.56-1.48a1.5 1.5 0 0 0-1.48 0l-2.56 1.48c-.44.26-.72.74-.72 1.24v2.96c0 .52.28.98.72 1.24l2.56 1.48c.22.12.48.2.74.2.26 0 .52-.06.74-.2l1.28-.74 6.18 3.56-8.2 4.74Z"
      />
    </svg>
  );
}

function PanelIconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-sm hover:bg-[#232f3e] hover:text-white"
    >
      {children}
    </button>
  );
}
