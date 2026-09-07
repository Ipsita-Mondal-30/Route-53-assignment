export const SEQUENCE_TIMEOUT_MS = 800;

export type ShortcutAction =
  | "hosted-zones"
  | "dashboard"
  | "create-zone"
  | "refresh"
  | "focus-search"
  | "show-help"
  | "close"
  | "delete-selected";

export type ShortcutRow = {
  keys: string[];
  action: string;
};

export const SHORTCUT_HELP_ROWS: ShortcutRow[] = [
  { keys: ["G", "H"], action: "Hosted Zones" },
  { keys: ["G", "D"], action: "Dashboard" },
  { keys: ["C"], action: "Create hosted zone" },
  { keys: ["/"], action: "Focus search" },
  { keys: ["R"], action: "Refresh" },
  { keys: ["?"], action: "Show shortcuts" },
  { keys: ["Esc"], action: "Close dialog" },
  { keys: ["Delete"], action: "Delete selected records or zones" },
];

const NON_TYPING_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

export function hasBlockingModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  if (target.closest("[contenteditable='true'], [contenteditable='']")) {
    return true;
  }
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type.toLowerCase();
    return !NON_TYPING_INPUT_TYPES.has(type);
  }
  return Boolean(target.closest("textarea, select, [contenteditable='true']"));
}

export function isTableContext(target: EventTarget | null): boolean {
  if (target instanceof HTMLElement && target.closest("[data-shortcut-table]")) {
    return true;
  }
  if (typeof document === "undefined") {
    return false;
  }
  return Boolean(
    document.querySelector("[data-shortcut-table] [data-selected='true']"),
  );
}

export type SequenceState = {
  prefix: "g" | null;
  at: number;
};

export const EMPTY_SEQUENCE: SequenceState = { prefix: null, at: 0 };

export function resolveShortcut(
  state: SequenceState,
  key: string,
  now: number,
  timeout = SEQUENCE_TIMEOUT_MS,
): { state: SequenceState; action: ShortcutAction | null } {
  const prefix =
    state.prefix && now - state.at < timeout ? state.prefix : null;

  if (prefix === "g") {
    if (key === "h") {
      return { state: EMPTY_SEQUENCE, action: "hosted-zones" };
    }
    if (key === "d") {
      return { state: EMPTY_SEQUENCE, action: "dashboard" };
    }
  }

  if (key === "g") {
    return { state: { prefix: "g", at: now }, action: null };
  }
  if (key === "c") {
    return { state: EMPTY_SEQUENCE, action: "create-zone" };
  }
  if (key === "r") {
    return { state: EMPTY_SEQUENCE, action: "refresh" };
  }
  if (key === "/") {
    return { state: EMPTY_SEQUENCE, action: "focus-search" };
  }
  if (key === "?") {
    return { state: EMPTY_SEQUENCE, action: "show-help" };
  }
  if (key === "escape") {
    return { state: EMPTY_SEQUENCE, action: "close" };
  }
  if (key === "delete") {
    return { state: EMPTY_SEQUENCE, action: "delete-selected" };
  }

  return { state: EMPTY_SEQUENCE, action: null };
}

export function visibleShortcutTarget<T extends HTMLElement>(
  selector: string,
): T | null {
  if (typeof document === "undefined") {
    return null;
  }
  const nodes = document.querySelectorAll<T>(selector);
  for (const node of nodes) {
    if (node.closest("[hidden]")) {
      continue;
    }
    if (typeof node.checkVisibility === "function") {
      if (!node.checkVisibility({ checkVisibilityCSS: true })) {
        continue;
      }
    } else if (node.getClientRects().length === 0) {
      continue;
    }
    return node;
  }
  return null;
}
