"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { USER_SETTINGS_STORAGE_KEY } from "@/lib/user-settings-storage";

export type VisualMode = "browser" | "light" | "dark";

export type ConsoleLanguage =
  | "en-US"
  | "en-GB"
  | "de-DE"
  | "es-ES"
  | "fr-FR"
  | "it-IT"
  | "ja-JP"
  | "ko-KR"
  | "pt-BR"
  | "zh-CN"
  | "zh-TW";

export const LANGUAGE_OPTIONS: { value: ConsoleLanguage; label: string }[] = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "de-DE", label: "Deutsch" },
  { value: "es-ES", label: "Español" },
  { value: "fr-FR", label: "Français" },
  { value: "it-IT", label: "Italiano" },
  { value: "ja-JP", label: "日本語" },
  { value: "ko-KR", label: "한국어" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "zh-CN", label: "中文(简体)" },
  { value: "zh-TW", label: "中文(繁體)" },
];

export type SettingsCopy = {
  title: string;
  language: string;
  visualMode: string;
  beta: string;
  browserDefault: string;
  light: string;
  dark: string;
  seeAll: string;
};

const SETTINGS_COPY: Record<ConsoleLanguage, SettingsCopy> = {
  "en-US": {
    title: "Current user settings",
    language: "Language",
    visualMode: "Visual mode",
    beta: "beta",
    browserDefault: "Browser default",
    light: "Light",
    dark: "Dark",
    seeAll: "See all user settings",
  },
  "en-GB": {
    title: "Current user settings",
    language: "Language",
    visualMode: "Visual mode",
    beta: "beta",
    browserDefault: "Browser default",
    light: "Light",
    dark: "Dark",
    seeAll: "See all user settings",
  },
  "de-DE": {
    title: "Aktuelle Benutzereinstellungen",
    language: "Sprache",
    visualMode: "Visueller Modus",
    beta: "beta",
    browserDefault: "Browserstandard",
    light: "Hell",
    dark: "Dunkel",
    seeAll: "Alle Benutzereinstellungen anzeigen",
  },
  "es-ES": {
    title: "Configuración actual del usuario",
    language: "Idioma",
    visualMode: "Modo visual",
    beta: "beta",
    browserDefault: "Predeterminado del navegador",
    light: "Claro",
    dark: "Oscuro",
    seeAll: "Ver toda la configuración de usuario",
  },
  "fr-FR": {
    title: "Paramètres utilisateur actuels",
    language: "Langue",
    visualMode: "Mode visuel",
    beta: "bêta",
    browserDefault: "Valeur par défaut du navigateur",
    light: "Clair",
    dark: "Sombre",
    seeAll: "Afficher tous les paramètres utilisateur",
  },
  "it-IT": {
    title: "Impostazioni utente correnti",
    language: "Lingua",
    visualMode: "Modalità visiva",
    beta: "beta",
    browserDefault: "Predefinito del browser",
    light: "Chiaro",
    dark: "Scuro",
    seeAll: "Vedi tutte le impostazioni utente",
  },
  "ja-JP": {
    title: "現在のユーザー設定",
    language: "言語",
    visualMode: "ビジュアルモード",
    beta: "ベータ",
    browserDefault: "ブラウザのデフォルト",
    light: "ライト",
    dark: "ダーク",
    seeAll: "すべてのユーザー設定を表示",
  },
  "ko-KR": {
    title: "현재 사용자 설정",
    language: "언어",
    visualMode: "시각 모드",
    beta: "베타",
    browserDefault: "브라우저 기본값",
    light: "라이트",
    dark: "다크",
    seeAll: "모든 사용자 설정 보기",
  },
  "pt-BR": {
    title: "Configurações atuais do usuário",
    language: "Idioma",
    visualMode: "Modo visual",
    beta: "beta",
    browserDefault: "Padrão do navegador",
    light: "Claro",
    dark: "Escuro",
    seeAll: "Ver todas as configurações do usuário",
  },
  "zh-CN": {
    title: "当前用户设置",
    language: "语言",
    visualMode: "视觉模式",
    beta: "测试版",
    browserDefault: "浏览器默认",
    light: "浅色",
    dark: "深色",
    seeAll: "查看所有用户设置",
  },
  "zh-TW": {
    title: "目前的使用者設定",
    language: "語言",
    visualMode: "視覺模式",
    beta: "測試版",
    browserDefault: "瀏覽器預設",
    light: "淺色",
    dark: "深色",
    seeAll: "查看所有使用者設定",
  },
};

type StoredSettings = {
  language: ConsoleLanguage;
  visualMode: VisualMode;
};

const defaultSettings: StoredSettings = {
  language: "en-US",
  visualMode: "browser",
};

function isLanguage(value: unknown): value is ConsoleLanguage {
  return LANGUAGE_OPTIONS.some((option) => option.value === value);
}

function isVisualMode(value: unknown): value is VisualMode {
  return value === "browser" || value === "light" || value === "dark";
}

function loadSettings(): StoredSettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }
  try {
    const raw = window.localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return defaultSettings;
    }
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    return {
      language: isLanguage(parsed.language) ? parsed.language : defaultSettings.language,
      visualMode: isVisualMode(parsed.visualMode)
        ? parsed.visualMode
        : defaultSettings.visualMode,
    };
  } catch {
    return defaultSettings;
  }
}

function prefersDark(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(mode: VisualMode, browserDark = prefersDark()): "light" | "dark" {
  if (mode === "light") {
    return "light";
  }
  if (mode === "dark") {
    return "dark";
  }
  return browserDark ? "dark" : "light";
}

function applyDocumentSettings(language: ConsoleLanguage, theme: "light" | "dark") {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.lang = language;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

type UserSettingsContextValue = {
  hydrated: boolean;
  language: ConsoleLanguage;
  visualMode: VisualMode;
  theme: "light" | "dark";
  copy: SettingsCopy;
  setLanguage: (language: ConsoleLanguage) => void;
  setVisualMode: (mode: VisualMode) => void;
};

const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [browserDark, setBrowserDark] = useState(true);

  useEffect(() => {
    const loaded = loadSettings();
    const dark = prefersDark();
    setSettings(loaded);
    setBrowserDark(dark);
    applyDocumentSettings(loaded.language, resolveTheme(loaded.visualMode, dark));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    applyDocumentSettings(settings.language, resolveTheme(settings.visualMode, browserDark));
  }, [browserDark, hydrated, settings]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      setBrowserDark(media.matches);
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setLanguage = useCallback((language: ConsoleLanguage) => {
    setSettings((current) => ({ ...current, language }));
  }, []);

  const setVisualMode = useCallback((visualMode: VisualMode) => {
    setSettings((current) => ({ ...current, visualMode }));
  }, []);

  const theme = resolveTheme(settings.visualMode, browserDark);
  const value = useMemo<UserSettingsContextValue>(
    () => ({
      hydrated,
      language: settings.language,
      visualMode: settings.visualMode,
      theme,
      copy: SETTINGS_COPY[settings.language],
      setLanguage,
      setVisualMode,
    }),
    [hydrated, setLanguage, setVisualMode, settings.language, settings.visualMode, theme],
  );

  return (
    <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>
  );
}

export function useUserSettings(): UserSettingsContextValue {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error("useUserSettings must be used within UserSettingsProvider");
  }
  return context;
}
