"use client";

/* ---------------------------------------------------------------
   Dorama Quiz — Client-side Visitor Tracking
   Отправляет события в /api/track → Telegram-бот

   События:
   - visit_start  — пользователь зашёл (+ источник, устройство)
   - quiz_complete — прошёл весь квиз
   - visit_end     — ушёл (+ на каком шаге остановился, время)
   --------------------------------------------------------------- */

interface SourceInfo {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
  referrer_domain?: string;
  tg_user?: string;
  tg_user_id?: number;
  tg_first_name?: string;
  tg_last_name?: string;
  device: string;
  screen: string;
  browser_lang: string;
  url: string;
}

interface TrackEvent {
  event: "visit_start" | "quiz_complete" | "visit_end";
  session_id: string;
  source?: SourceInfo;
  step?: number;
  step_name?: string;
  total_steps?: number;
  time_spent_seconds?: number;
  answers?: Record<string, string | string[]>;
}

// --- State ---
let sessionId: string | null = null;
let startTime = 0;
let lastStep = -1;
let exitSent = false;
let currentAnswers: Record<string, string | string[]> = {};

// Названия шагов для отчёта
const STEP_NAMES: Record<number, string> = {
  [-1]: "Intro",
  0: "Жанры",
  1: "Настроение",
  2: "Длина серии",
  3: "Страна",
  4: "Любимые дорамы",
  5: "Не нравится",
  6: "Романтика",
  7: "Контакт",
};

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Собирает инфу об источнике: UTM, referrer, Telegram WebApp, устройство */
function getSourceInfo(): SourceInfo {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  const source: SourceInfo = {
    device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
    screen: `${screen.width}x${screen.height}`,
    browser_lang: navigator.language,
    url: window.location.href,
  };

  // UTM params
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmContent = params.get("utm_content");
  if (utmSource) source.utm_source = utmSource;
  if (utmMedium) source.utm_medium = utmMedium;
  if (utmCampaign) source.utm_campaign = utmCampaign;
  if (utmContent) source.utm_content = utmContent;

  // Referrer
  if (document.referrer) {
    source.referrer = document.referrer;
    try {
      source.referrer_domain = new URL(document.referrer).hostname;
    } catch { /* ignore */ }
  }

  // Telegram WebApp (если квиз открыт внутри Telegram)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      if (user.username) source.tg_user = user.username;
      if (user.id) source.tg_user_id = user.id;
      if (user.first_name) source.tg_first_name = user.first_name;
      if (user.last_name) source.tg_last_name = user.last_name;
    }
  } catch { /* ignore */ }

  // startapp / start param (Telegram deep links)
  const startapp = params.get("startapp") || params.get("start");
  if (startapp) {
    source.utm_content = source.utm_content || startapp;
  }

  return source;
}

/** Отправить событие на /api/track → GAS (серверный прокси обходит CORS) */
function sendTrackEvent(event: TrackEvent) {
  try {
    const body = JSON.stringify(event);

    if (event.event === "visit_end" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" })
      );
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: event.event === "visit_end",
      }).catch(() => { /* fire and forget */ });
    }
  } catch { /* silently fail — tracking should never break quiz */ }
}

// ============================================================
// PUBLIC API
// ============================================================

/** Вызвать при маунте Quiz-компонента (один раз) */
export function initTracking() {
  if (typeof window === "undefined") return;
  if (sessionId) return; // уже инициализировано

  sessionId = generateSessionId();
  startTime = Date.now();
  lastStep = -1;
  exitSent = false;

  // Уведомление: пользователь зашёл
  sendTrackEvent({
    event: "visit_start",
    session_id: sessionId,
    source: getSourceInfo(),
    step: -1,
    step_name: "Intro",
    total_steps: 8,
  });

  // Уведомление при выходе
  const handleExit = () => {
    if (exitSent) return;
    exitSent = true;

    const hasAnswers = Object.keys(currentAnswers).length > 0;
    sendTrackEvent({
      event: "visit_end",
      session_id: sessionId!,
      source: getSourceInfo(),
      step: lastStep,
      step_name: STEP_NAMES[lastStep] ?? `Step ${lastStep}`,
      total_steps: 8,
      time_spent_seconds: Math.round((Date.now() - startTime) / 1000),
      ...(hasAnswers ? { answers: currentAnswers } : {}),
    });
  };

  window.addEventListener("beforeunload", handleExit);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") handleExit();
  });
}

/** Вызвать при смене шага (step). Обновляет состояние — не шлёт в Telegram */
export function trackStep(step: number) {
  if (!sessionId) return;
  lastStep = step;
  exitSent = false; // сбросить, чтобы exit отправился с актуальным шагом
}

/** Обновить текущие ответы (для отправки при выходе) */
export function trackAnswers(answers: Record<string, string | string[]>) {
  currentAnswers = answers;
}

/** Вызвать при полном завершении квиза (с ответами) */
export function trackComplete(answers?: Record<string, string | string[]>) {
  if (!sessionId) return;
  lastStep = 8; // чтобы exit не отправлялся (квиз пройден)

  sendTrackEvent({
    event: "quiz_complete",
    session_id: sessionId,
    source: getSourceInfo(),
    step: 8,
    step_name: "Завершено",
    total_steps: 8,
    time_spent_seconds: Math.round((Date.now() - startTime) / 1000),
    answers,
  });
}
