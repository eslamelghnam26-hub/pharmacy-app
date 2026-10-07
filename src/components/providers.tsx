"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  translate,
  settingsCookieValue,
  SETTINGS_COOKIE,
  type Lang,
  type TKey,
} from "@/lib/i18n";

type Theme = "light" | "dark";

type AppContextValue = {
  lang: Lang;
  theme: Theme;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  initialLang,
  initialTheme,
  children,
}: {
  initialLang: Lang;
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const router = useRouter();

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next);
      document.cookie = `${SETTINGS_COOKIE}=${settingsCookieValue(next, currentTheme())}; path=/; max-age=31536000`;
      document.documentElement.lang = next;
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      router.refresh();
    },
    [router],
  );

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      document.cookie = `${SETTINGS_COOKIE}=${settingsCookieValue(currentLang(), next)}; path=/; max-age=31536000`;
      document.documentElement.classList.toggle("dark", next === "dark");
      router.refresh();
    },
    [router],
  );

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    [lang],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      theme,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      setTheme,
      t,
    }),
    [lang, theme, setLang, setTheme, t],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Helper for writing the cookie in a way that keeps both current values.
function currentLang(): Lang {
  return document.documentElement.lang === "ar" ? "ar" : "en";
}

function currentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}