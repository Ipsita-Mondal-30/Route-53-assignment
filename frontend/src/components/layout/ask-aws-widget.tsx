"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ApiError } from "@/lib/api";
import { askAwsChat, explainSelection } from "@/lib/ask-aws-api";

const INTRO_STORAGE_KEY = "ask-aws-intro-dismissed";

const SUGGESTIONS = [
  "I want to learn about AWS products and services",
  "I need technical support",
  "I have an account and billing issue",
] as const;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type SelectionExplain = {
  text: string;
  x: number;
  y: number;
  placeBelow: boolean;
};

export function AskAwsWidget() {
  const [chatOpen, setChatOpen] = useState(false);
  const [explainerOn, setExplainerOn] = useState(false);
  const [showExplainerTip, setShowExplainerTip] = useState(false);
  const [bubbles, setBubbles] = useState({ chat: false, explainer: false });
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState<SelectionExplain | null>(null);
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const explainRequest = useRef(0);

  const unread = (bubbles.chat ? 1 : 0) + (bubbles.explainer ? 1 : 0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (sessionStorage.getItem(INTRO_STORAGE_KEY) === "1") {
      return;
    }
    const timer = window.setTimeout(() => {
      setBubbles({ chat: true, explainer: true });
    }, 500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!chatOpen) {
      return;
    }
    inputRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setChatOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  useEffect(() => {
    if (!explainerOn) {
      setShowExplainerTip(false);
      setSelection(null);
      setExplanation("");
      return;
    }
    setShowExplainerTip(true);
    const timer = window.setTimeout(() => setShowExplainerTip(false), 3200);
    return () => window.clearTimeout(timer);
  }, [explainerOn]);

  useEffect(() => {
    if (!explainerOn) {
      return;
    }

    function ignoreTarget(node: Node | null) {
      return Boolean(widgetRef.current?.contains(node));
    }

    function onMouseUp(event: MouseEvent) {
      if ((event.target as HTMLElement | null)?.closest("[data-ask-aws-explainer]")) {
        return;
      }
      const sel = window.getSelection();
      const text = sel?.toString().replace(/\s+/g, " ").trim() ?? "";
      if (!sel || sel.rangeCount === 0 || text.length < 6) {
        setSelection(null);
        return;
      }
      if (ignoreTarget(sel.anchorNode)) {
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        return;
      }
      const x = Math.min(
        window.innerWidth - 24,
        Math.max(24, rect.left + rect.width / 2),
      );
      const placeBelow = rect.top < 190;
      setSelection({
        text,
        x,
        y: placeBelow ? rect.bottom + 12 : rect.top,
        placeBelow,
      });
    }

    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, [explainerOn]);

  useEffect(() => {
    if (!selection) {
      setExplanation("");
      setExplaining(false);
      return;
    }

    const requestId = ++explainRequest.current;
    setExplaining(true);
    setExplanation("");

    void explainSelection(selection.text)
      .then((text) => {
        if (explainRequest.current === requestId) {
          setExplanation(text);
        }
      })
      .catch((err) => {
        if (explainRequest.current !== requestId) {
          return;
        }
        setExplanation(
          err instanceof ApiError
            ? err.detail
            : "Explanation is unavailable. Try again.",
        );
      })
      .finally(() => {
        if (explainRequest.current === requestId) {
          setExplaining(false);
        }
      });
  }, [selection]);

  function dismissIntro() {
    setBubbles({ chat: false, explainer: false });
    sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
  }

  function openChat() {
    setChatOpen(true);
    dismissIntro();
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    const history = messages.map(({ role, text: body }) => ({ role, text: body }));
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);

    try {
      const reply = await askAwsChat([...history, { role: "user", text: trimmed }]);
      setMessages((current) => [
        ...current,
        { id: `a-${Date.now()}`, role: "assistant", text: reply },
      ]);
    } catch (err) {
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text:
            err instanceof ApiError
              ? err.detail
              : "Ask AWS is unavailable. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const chatActive = chatOpen || explainerOn;

  return (
    <div
      ref={widgetRef}
      className="pointer-events-none fixed right-4 bottom-5 z-[60] flex flex-col items-end gap-2.5 sm:right-5"
    >
      {chatOpen ? (
        <AskAwsPanel
          draft={draft}
          loading={loading}
          messages={messages}
          inputRef={inputRef}
          onDraftChange={setDraft}
          onMinimize={() => setChatOpen(false)}
          onOpenDisclaimer={() => setDisclaimerOpen(true)}
          onSend={(text) => void send(text)}
        />
      ) : null}

      {!chatOpen && (bubbles.chat || bubbles.explainer) ? (
        <div className="pointer-events-auto flex w-[min(calc(100vw-32px),320px)] flex-col gap-2">
          {bubbles.chat ? (
            <IntroBubble
              align="right"
              icon={<ChatBubbleIcon className="h-5 w-5 text-[#9ecfff]" />}
              text="Hi, I can connect you with an AWS representative or answer questions you have on AWS."
              onClose={() => {
                setBubbles((current) => {
                  const next = { ...current, chat: false };
                  if (!next.explainer) {
                    sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
                  }
                  return next;
                });
              }}
            />
          ) : null}
          {bubbles.explainer ? (
            <IntroBubble
              align="left"
              icon={<ExplainerIcon className="h-5 w-5 text-[#d4b4ff]" />}
              text="Need more info? Highlight any text to get an explanation generated with AWS generative AI."
              onClose={() => {
                setBubbles((current) => {
                  const next = { ...current, explainer: false };
                  if (!next.chat) {
                    sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
                  }
                  return next;
                });
              }}
            />
          ) : null}
        </div>
      ) : null}

      <div className="pointer-events-auto flex items-end gap-2">
        <div className="relative">
          {explainerOn && showExplainerTip && !chatOpen ? (
            <div className="ask-aws-tooltip absolute bottom-[calc(100%+10px)] left-1/2 z-10 -translate-x-1/2 rounded-md bg-[#16191f] px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-white shadow-lg">
              Explainer
            </div>
          ) : null}
          <div className="flex h-12 items-center rounded-[14px] bg-white px-1.5 shadow-[0_6px_20px_rgba(15,20,26,0.22)]">
            <button
              type="button"
              aria-pressed={explainerOn}
              aria-label={explainerOn ? "Turn off Explainer" : "Turn on Explainer"}
              onClick={() => {
                setExplainerOn((value) => !value);
                setBubbles((current) => ({ ...current, explainer: false }));
              }}
              className={`relative h-9 w-[70px] rounded-[11px] transition-colors ${
                explainerOn ? "ask-aws-gradient" : "bg-[#d9dfe3]"
              }`}
            >
              <span
                className={`absolute top-0.5 flex h-8 w-8 items-center justify-center rounded-[9px] bg-white shadow-sm transition-[left] duration-200 ${
                  explainerOn ? "left-[34px]" : "left-0.5"
                }`}
              >
                <ExplainerIcon className="h-4 w-4 text-[#16191f]" />
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label={chatOpen ? "Close Ask AWS" : "Open Ask AWS"}
          aria-expanded={chatOpen}
          onClick={() => {
            if (chatOpen) {
              setChatOpen(false);
              return;
            }
            openChat();
          }}
          className={`relative flex h-14 w-14 items-center justify-center rounded-[16px] text-white shadow-[0_8px_22px_rgba(15,20,26,0.28)] transition ${
            chatActive ? "ask-aws-gradient" : "bg-[#16191f] hover:bg-black"
          }`}
        >
          <ChatBubbleIcon className="h-6 w-6" filled={!chatActive} />
          {unread > 0 && !chatOpen ? (
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#d13212] px-1 text-[11px] leading-none font-bold text-white">
              {unread}
            </span>
          ) : null}
        </button>
      </div>

      {typeof document !== "undefined" && explainerOn && selection
        ? createPortal(
            <ExplainerCard
              x={selection.x}
              y={selection.y}
              placeBelow={selection.placeBelow}
              loading={explaining}
              text={explanation}
              source={selection.text}
              onClose={() => setSelection(null)}
            />,
            document.body,
          )
        : null}

      {typeof document !== "undefined" && disclaimerOpen
        ? createPortal(
            <DisclaimerDialog onClose={() => setDisclaimerOpen(false)} />,
            document.body,
          )
        : null}
    </div>
  );
}

function AskAwsPanel({
  draft,
  loading,
  messages,
  inputRef,
  onDraftChange,
  onMinimize,
  onOpenDisclaimer,
  onSend,
}: {
  draft: string;
  loading: boolean;
  messages: ChatMessage[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onDraftChange: (value: string) => void;
  onMinimize: () => void;
  onOpenDisclaimer: () => void;
  onSend: (text: string) => void;
}) {
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  return (
    <section
      aria-labelledby={titleId}
      className="pointer-events-auto flex h-[min(640px,calc(100dvh-120px))] w-[min(calc(100vw-24px),380px)] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_16px_48px_rgba(15,20,26,0.28)]"
    >
      <div className="ask-aws-gradient relative shrink-0 px-5 pt-3 pb-4 text-white">
        <button
          type="button"
          aria-label="Minimize Ask AWS"
          onClick={onMinimize}
          className="absolute top-2.5 right-3 flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15"
        >
          <span className="block h-[2px] w-3.5 rounded-full bg-white" />
        </button>
        <div className="flex items-center gap-2 pr-8">
          <h2 id={titleId} className="text-[22px] leading-7 font-bold">
            Ask AWS
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2 py-0.5 text-[11px] font-medium">
            <HexBadge className="h-3 w-3" />
            built-in
          </span>
        </div>
        <p className="mt-2 max-w-[320px] text-[13px] leading-5 text-white/95">
          Get helpful guidance and recommendations from AWS generative AI
          assistant.
        </p>
        <label className="relative mt-4 block">
          <span className="sr-only">Ask a question</span>
          <input
            ref={inputRef}
            value={draft}
            maxLength={4000}
            placeholder="Ask a question"
            className="h-11 w-full rounded-full border-0 bg-white pr-12 pl-4 text-[14px] text-[#161d26] outline-none placeholder:text-[#8d99a6]"
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSend(draft);
              }
            }}
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!draft.trim() || loading}
            onClick={() => onSend(draft)}
            className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#7d8a96] text-white disabled:bg-[#b6bec4]"
          >
            <SendArrowIcon className="h-4 w-4" />
          </button>
        </label>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <div>
            <p className="text-[16px] leading-6 font-bold text-[#161d26]">
              Want help getting started?
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[#545b64]">
              Tell us a little bit about what you&apos;re looking for.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => onSend(suggestion)}
                  className="ask-aws-chip rounded-[12px] px-4 py-3 text-left text-[14px] leading-5 text-[#161d26] hover:bg-[#f8fafc]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5 whitespace-pre-wrap ${
                  message.role === "user"
                    ? "self-end bg-[#eef2ff] text-[#161d26]"
                    : "self-start bg-[#f4f6f7] text-[#161d26]"
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading ? (
              <div className="self-start rounded-2xl bg-[#f4f6f7] px-3.5 py-2.5 text-[13px] text-[#545b64]">
                Ask AWS is thinking…
              </div>
            ) : null}
          </div>
        )}
      </div>

      <p className="shrink-0 px-5 pb-4 text-center text-[11px] leading-4 text-[#687078]">
        By chatting, you agree to this{" "}
        <button
          type="button"
          onClick={onOpenDisclaimer}
          className="text-[#006ce0] hover:underline"
        >
          disclaimer
        </button>
        .
      </p>
    </section>
  );
}

function IntroBubble({
  align,
  icon,
  text,
  onClose,
}: {
  align: "left" | "right";
  icon: React.ReactNode;
  text: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`ask-aws-bubble relative flex gap-2.5 rounded-[12px] bg-[#1b232d] px-3.5 py-3 text-white shadow-[0_10px_24px_rgba(15,20,26,0.28)] ${
        align === "right" ? "ask-aws-bubble-right" : "ask-aws-bubble-left"
      }`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="pr-4 text-[13px] leading-5">{text}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center text-[#aab7b8] hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

function ExplainerCard({
  x,
  y,
  placeBelow,
  loading,
  text,
  source,
  onClose,
}: {
  x: number;
  y: number;
  placeBelow: boolean;
  loading: boolean;
  text: string;
  source: string;
  onClose: () => void;
}) {
  return (
    <div
      data-ask-aws-explainer="true"
      className={`pointer-events-auto fixed z-70 w-[min(calc(100vw-24px),340px)] -translate-x-1/2 rounded-[14px] bg-white p-4 shadow-[0_16px_40px_rgba(15,20,26,0.28)] ${
        placeBelow ? "" : "-translate-y-full"
      }`}
      style={{ left: x, top: y }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="ask-aws-gradient flex h-7 w-7 items-center justify-center rounded-lg text-white">
            <ExplainerIcon className="h-3.5 w-3.5" />
          </span>
          <p className="text-[13px] font-bold text-[#161d26]">Explanation</p>
        </div>
        <button
          type="button"
          aria-label="Close explanation"
          onClick={onClose}
          className="text-[18px] leading-none text-[#687078] hover:text-[#161d26]"
        >
          ×
        </button>
      </div>
      <p className="mb-2 line-clamp-2 text-[11px] leading-4 text-[#8d99a6]">
        “{source}”
      </p>
      <p className="text-[13px] leading-5 whitespace-pre-wrap text-[#161d26]">
        {loading ? "Generating an explanation…" : text}
      </p>
    </div>
  );
}

function DisclaimerDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="ask-aws-disclaimer-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h3
          id="ask-aws-disclaimer-title"
          className="text-[16px] font-bold text-[#161d26]"
        >
          Ask AWS disclaimer
        </h3>
        <p className="mt-2 text-[13px] leading-5 text-[#545b64]">
          Ask AWS is a generative AI assistant. Replies can be inaccurate or
          incomplete. Do not share passwords, account numbers, or other
          sensitive information. This demo uses OpenAI to generate responses
          about AWS and Route 53.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 inline-flex h-9 items-center rounded-full bg-[#16191f] px-4 text-[13px] font-bold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ChatBubbleIcon({
  className,
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5.2 5.2A2.7 2.7 0 0 1 7.9 3.5h8.2A2.7 2.7 0 0 1 18.8 6.2v6.2a2.7 2.7 0 0 1-2.7 2.7H10.4L6.4 18.4c-.6.4-1.4 0-1.4-.8V6.2A2.7 2.7 0 0 1 5.2 5.2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExplainerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8 5.5h5.2c1.8 0 3.3 1.5 3.3 3.3v.4c0 1.8-1.5 3.3-3.3 3.3H11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.2 5.5v13"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 18.5h4.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.8 14.2 19 16.4l-2.2 2.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 10h11M11 6.5 14.5 10 11 13.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HexBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8 1.6 13.4 4.7v6.6L8 14.4 2.6 11.3V4.7L8 1.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
