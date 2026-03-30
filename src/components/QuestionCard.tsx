"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/lib/questions";

interface Props {
  question: Question;
  value: string | string[] | undefined;
  onChange: (val: string | string[]) => void;
}

export function QuestionCard({ question, value, onChange }: Props) {
  const [otherText, setOtherText] = useState("");

  if (question.type === "text") {
    return (
      <Card question={question}>
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={3}
          className="w-full bg-surface border border-surface-lighter rounded-xl p-4 text-white
                     placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary
                     resize-none transition-all"
        />
      </Card>
    );
  }

  if (question.type === "single") {
    return (
      <Card question={question}>
        <div className="space-y-2.5">
          {question.options?.map((opt) => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(opt)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                value === opt
                  ? "border-primary bg-primary/15 text-white shadow-md shadow-primary/20"
                  : "border-surface-lighter bg-surface-light hover:border-gray-500 text-gray-300"
              }`}
            >
              {opt}
            </motion.button>
          ))}
          {question.allowOther && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Другое..."
                value={value && !question.options?.includes(value as string) ? (value as string) : otherText}
                onChange={(e) => {
                  setOtherText(e.target.value);
                  if (e.target.value) onChange(e.target.value);
                }}
                className="flex-1 bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-white
                           placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          )}
        </div>
      </Card>
    );
  }

  // multi
  const selected = (value as string[]) || [];

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next);
  }

  return (
    <Card question={question}>
      <div className="space-y-2.5">
        {question.options?.map((opt) => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(opt)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
              selected.includes(opt)
                ? "border-primary bg-primary/15 text-white shadow-md shadow-primary/20"
                : "border-surface-lighter bg-surface-light hover:border-gray-500 text-gray-300"
            }`}
          >
            <span className="mr-2">
              {selected.includes(opt) ? "✅" : "⬜"}
            </span>
            {opt}
          </motion.button>
        ))}
        {question.allowOther && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Другое..."
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otherText.trim()) {
                  onChange([...selected, otherText.trim()]);
                  setOtherText("");
                }
              }}
              className="flex-1 bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-white
                         placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {otherText.trim() && (
              <button
                onClick={() => {
                  onChange([...selected, otherText.trim()]);
                  setOtherText("");
                }}
                className="px-4 py-3 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all"
              >
                +
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function Card({ question, children }: { question: Question; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="bg-surface rounded-2xl p-6 border border-surface-lighter shadow-2xl"
    >
      <h2 className="text-xl font-bold text-white mb-1">{question.title}</h2>
      {question.subtitle && (
        <p className="text-sm text-gray-400 mb-4">{question.subtitle}</p>
      )}
      {children}
    </motion.div>
  );
}
