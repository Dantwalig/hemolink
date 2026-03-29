import React, { createContext, useContext, useState } from "react";
import { translations, LANGUAGES } from "./i18n.js";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("hl_lang") || "en";
  });

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem("hl_lang", code);
  };

  const t = (path) => {
    const keys = path.split(".");
    let obj = translations[lang] || translations.en;
    for (const key of keys) {
      if (obj == null) return path;
      obj = obj[key];
    }
    return obj ?? path;
  };

  return (
    <LangContext.Provider value={{ lang, changeLang, t, languages: LANGUAGES }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
