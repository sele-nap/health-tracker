"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { en, fr, type Locale } from "@/lib/i18n";
import { persistLocale } from "@/server/actions/settings";

type Translations = typeof en;

type LocaleContextValue = {
  locale: Locale;
  tr: Translations;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      setLocaleState(next);
      persistLocale(next).catch(() => {});
      router.refresh();
    },
    [router]
  );

  const tr = locale === "fr" ? fr : en;

  return (
    <LocaleContext.Provider value={{ locale, tr, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
