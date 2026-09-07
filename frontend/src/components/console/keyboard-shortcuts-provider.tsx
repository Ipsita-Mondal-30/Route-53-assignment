"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { KeyboardShortcutsModal } from "@/components/console/keyboard-shortcuts-modal";
import {
  EMPTY_SEQUENCE,
  SEQUENCE_TIMEOUT_MS,
  hasBlockingModifier,
  isTableContext,
  isTypingTarget,
  resolveShortcut,
  visibleShortcutTarget,
  type SequenceState,
  type ShortcutAction,
} from "@/lib/keyboard-shortcuts";

type KeyboardShortcutsContextValue = {
  helpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
};

const KeyboardShortcutsContext =
  createContext<KeyboardShortcutsContextValue | null>(null);

export function KeyboardShortcutsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const sequenceRef = useRef<SequenceState>(EMPTY_SEQUENCE);
  const sequenceTimerRef = useRef<number | null>(null);

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  const clearSequence = useCallback(() => {
    sequenceRef.current = EMPTY_SEQUENCE;
    if (sequenceTimerRef.current !== null) {
      window.clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
  }, []);

  const runAction = useCallback(
    (action: ShortcutAction) => {
      switch (action) {
        case "hosted-zones":
          closeHelp();
          router.push("/hosted-zones");
          return;
        case "dashboard":
          closeHelp();
          router.push("/dashboard");
          return;
        case "create-zone":
          closeHelp();
          router.push("/hosted-zones/new");
          return;
        case "refresh":
          clickShortcutControl("[data-shortcut-refresh]");
          return;
        case "focus-search": {
          const pageSearch = visibleShortcutTarget<HTMLInputElement>(
            "[data-shortcut-search='page']",
          );
          const fallback = visibleShortcutTarget<HTMLInputElement>(
            "[data-shortcut-search]",
          );
          (pageSearch ?? fallback)?.focus();
          (pageSearch ?? fallback)?.select?.();
          return;
        }
        case "show-help":
          setHelpOpen((open) => !open);
          return;
        case "close":
          setHelpOpen(false);
          return;
        case "delete-selected":
          clickShortcutControl("[data-shortcut-delete]");
          return;
      }
    },
    [closeHelp, router],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (hasBlockingModifier(event)) {
        clearSequence();
        return;
      }
      if (event.key === "Escape") {
        clearSequence();
        if (helpOpen) {
          event.preventDefault();
          event.stopImmediatePropagation();
          closeHelp();
        }
        return;
      }
      if (event.repeat) {
        return;
      }
      if (isTypingTarget(event.target)) {
        clearSequence();
        return;
      }
      if (
        !helpOpen &&
        (document.querySelector('[aria-modal="true"]') ||
          document.querySelector('[role="menu"]'))
      ) {
        clearSequence();
        return;
      }
      if (helpOpen) {
        const lower = event.key.toLowerCase();
        const allowedWhileHelpOpen =
          lower === "g" ||
          lower === "h" ||
          lower === "d" ||
          lower === "c" ||
          event.key === "?";
        if (!allowedWhileHelpOpen) {
          return;
        }
      }

      const key =
        event.key === "?"
          ? "?"
          : event.key === "/"
            ? "/"
            : event.key.toLowerCase();
      const resolved = resolveShortcut(sequenceRef.current, key, Date.now());
      sequenceRef.current = resolved.state;

      if (sequenceTimerRef.current !== null) {
        window.clearTimeout(sequenceTimerRef.current);
        sequenceTimerRef.current = null;
      }
      if (resolved.state.prefix) {
        sequenceTimerRef.current = window.setTimeout(() => {
          sequenceRef.current = EMPTY_SEQUENCE;
          sequenceTimerRef.current = null;
        }, SEQUENCE_TIMEOUT_MS);
        return;
      }

      if (!resolved.action) {
        return;
      }
      if (resolved.action === "delete-selected") {
        if (!isTableContext(event.target)) {
          return;
        }
        const control = visibleShortcutTarget<HTMLButtonElement>(
          "[data-shortcut-delete]",
        );
        if (!control || control.disabled) {
          return;
        }
        event.preventDefault();
        control.click();
        return;
      }
      if (
        resolved.action === "focus-search" ||
        resolved.action === "show-help" ||
        resolved.action === "hosted-zones" ||
        resolved.action === "dashboard" ||
        resolved.action === "create-zone"
      ) {
        event.preventDefault();
      }
      runAction(resolved.action);
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      if (sequenceTimerRef.current !== null) {
        window.clearTimeout(sequenceTimerRef.current);
      }
    };
  }, [clearSequence, closeHelp, helpOpen, runAction]);

  const value = useMemo(
    () => ({ helpOpen, openHelp, closeHelp }),
    [closeHelp, helpOpen, openHelp],
  );

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      <p className="sr-only">
        Press question mark to open keyboard shortcuts.
      </p>
      {children}
      <KeyboardShortcutsModal open={helpOpen} onClose={closeHelp} />
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts(): KeyboardShortcutsContextValue {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      "useKeyboardShortcuts must be used within KeyboardShortcutsProvider",
    );
  }
  return context;
}

function clickShortcutControl(selector: string) {
  const control = visibleShortcutTarget<HTMLButtonElement>(selector);
  if (!control || control.disabled) {
    return;
  }
  control.click();
}
