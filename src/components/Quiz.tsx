"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { questions, type Question } from "@/lib/questions";
import { QuestionCard } from "./QuestionCard";

export function Quiz() {
  const [step, setStep] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const currentQ = step >= 0 ? questions[step] : null;
  const progress = step >= 0 ? ((step + 1) / questions.length) * 100 : 0;

  function handleAnswer(questionId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function canNext(): boolean {
    if (!currentQ) return true;
    const val = answers[currentQ.id];
    if (!val) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      setDone(true);
    } catch {
      setError("Не удалось отправить. Попробуй ещё раз!");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center space-y-6"
      >
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Спасибо!
        </h2>
        <p className="text-lg text-gray-300">
          Твои ответы отправлены! Скоро подберём идеальные дорамы для тебя 🍿
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg w-full space-y-6">
      {/* Progress bar */}
      {step >= 0 && (
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === -1 ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <div className="text-7xl">🎬</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dorama Quiz
            </h1>
            <p className="text-lg text-gray-300">
              Ответь на несколько вопросов, и мы подберём дораму специально для тебя!
            </p>
            <button
              onClick={() => setStep(0)}
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl
                         hover:opacity-90 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50"
            >
              Начать ✨
            </button>
          </motion.div>
        ) : currentQ ? (
          <QuestionCard
            key={currentQ.id}
            question={currentQ}
            value={answers[currentQ.id]}
            onChange={(v) => handleAnswer(currentQ.id, v)}
          />
        ) : null}
      </AnimatePresence>

      {/* Navigation */}
      {step >= 0 && (
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setStep((s) => s - 1)}
            className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors"
          >
            ← Назад
          </button>
          <span className="text-sm text-gray-500">
            {step + 1} / {questions.length}
          </span>
          {step < questions.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="px-5 py-2.5 bg-surface-light hover:bg-surface-lighter text-white rounded-xl
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Далее →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl
                         hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all
                         shadow-lg shadow-primary/30"
            >
              {submitting ? "Отправка..." : "Отправить 🚀"}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-center text-sm">{error}</p>
      )}
    </div>
  );
}
