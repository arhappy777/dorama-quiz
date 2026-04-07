"use client";

import { motion } from "framer-motion";
import { useI18n, type Lang } from "@/lib/i18n";

const langs: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "uk", label: "UA" },
  { code: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="fixed top-4 right-4 z-50 flex bg-surface/80 backdrop-blur-md border border-surface-lighter rounded-xl overflow-hidden">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className="relative px-3 py-1.5 text-sm font-medium transition-colors"
        >
          {lang === l.code && (
            <motion.div
              layoutId="lang-indicator"
              className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span
            className={`relative z-10 ${
              lang === l.code ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {l.label}
          </span>
        </button>
      ))}
    </div>
  );
}
