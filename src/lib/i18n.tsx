"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Lang = "ru" | "en" | "uk";

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// UI translations (not questions — those are separate)
const ui: Record<string, Record<Lang, string>> = {
  "meta.title.ru": { ru: "Dorama Quiz — Найди свою идеальную дораму", en: "Dorama Quiz — Find Your Perfect K-Drama", uk: "Dorama Quiz — Знайди свою ідеальну дораму" },
  "meta.description": { ru: "Пройди квиз и получи персональные рекомендации дорам", en: "Take the quiz and get personalized drama recommendations", uk: "Пройди квіз та отримай персональні рекомендації дорам" },
  "intro.heading": { ru: "Dorama Quiz", en: "Dorama Quiz", uk: "Dorama Quiz" },
  "intro.text": { ru: "Ответь на несколько вопросов, и мы подберём дораму специально для тебя!", en: "Answer a few questions and we'll find the perfect drama for you!", uk: "Відповідай на кілька запитань, і ми підберемо дораму спеціально для тебе!" },
  "intro.start": { ru: "Начать ✨", en: "Start ✨", uk: "Почати ✨" },
  "done.heading": { ru: "Спасибо!", en: "Thank you!", uk: "Дякуємо!" },
  "done.text": { ru: "Твои ответы отправлены! Скоро подберём идеальные дорамы для тебя 🍿", en: "Your answers have been sent! We'll pick the perfect dramas for you soon 🍿", uk: "Твої відповіді надіслано! Скоро підберемо ідеальні дорами для тебе 🍿" },
  "nav.back": { ru: "← Назад", en: "← Back", uk: "← Назад" },
  "nav.next": { ru: "Далее →", en: "Next →", uk: "Далі →" },
  "nav.submit": { ru: "Отправить 🚀", en: "Submit 🚀", uk: "Надіслати 🚀" },
  "nav.submitting": { ru: "Отправка...", en: "Submitting...", uk: "Надсилання..." },
  "error.submit": { ru: "Не удалось отправить. Попробуй ещё раз!", en: "Failed to submit. Please try again!", uk: "Не вдалося надіслати. Спробуй ще раз!" },
  "error.send": { ru: "Ошибка отправки", en: "Submission error", uk: "Помилка надсилання" },
  "input.other": { ru: "Другое...", en: "Other...", uk: "Інше..." },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quiz-lang");
      if (saved === "en" || saved === "ru" || saved === "uk") return saved;
    }
    return "ru";
  });

  const handleSetLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("quiz-lang", newLang);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = ui[key];
      if (!entry) return key;
      return entry[lang];
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
