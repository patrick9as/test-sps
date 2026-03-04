import React, { createContext, useContext, useState } from "react";
import ptBR from "../locales/pt-BR.json";
import es from "../locales/es.json";
import en from "../locales/en.json";

const LOCALE_KEY = "app_locale";
const DICTIONARIES = { "pt-BR": ptBR, es, en };
const DEFAULT_LOCALE = "pt-BR";

const LanguageContext = createContext(null);

function getInitialLocale() {
  const stored = localStorage.getItem(LOCALE_KEY);
  return stored && DICTIONARIES[stored] ? stored : DEFAULT_LOCALE;
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);
  const dictionary = DICTIONARIES[locale];

  const setLanguage = (newLocale) => {
    if (!DICTIONARIES[newLocale]) return;
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_KEY, newLocale);
  };

  const t = (key) => {
    return dictionary[key] ?? key;
  };

  const value = { locale, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
