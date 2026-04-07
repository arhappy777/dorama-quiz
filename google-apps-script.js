/**
 * Dorama Quiz — Google Apps Script
 * Вставить в Google Spreadsheet: Extensions → Apps Script
 *
 * После вставки:
 * 1. Deploy → New deployment → Web app → Anyone → Deploy
 * 2. Скопировать URL деплоя
 * 3. Вставить URL в .env.local как NEXT_PUBLIC_TRACKING_URL (или напрямую в tracking.ts)
 *
 * Что делает:
 * - Логирует каждый визит/шаг/выход в Google Sheet
 * - Шлёт уведомления в Telegram-бот
 */

// ===== НАСТРОЙКИ =====
const TG_BOT_TOKEN = "8633701076:AAHC5i7GHtOa359gwJXU2HA4uFGM5lblFnY";
const TG_CHAT_ID   = "527284611";
const SHEET_NAME   = "Tracking";               // имя листа в таблице
const SUBMIT_SHEET = "Submissions";            // лист для заявок квиза
// =====================

/**
 * Обработка POST-запросов от квиза
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Записать в трекинг-лист (все события)
    logToSheet(data);

    // Если quiz_complete с ответами — дополнительно в Submissions
    if (data.event === "quiz_complete" && data.answers) {
      logSubmission(data);
    }

    // Telegram — только финальное событие (одно сообщение)
    // visit_start → только в таблицу, без TG
    if (data.event === "visit_end" || data.event === "quiz_complete") {
      var message = buildTelegramMessage(data);
      if (message) {
        sendTelegram(message, data.event === "visit_end");
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("doPost error: " + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET для проверки что скрипт работает
 */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "Dorama Quiz Tracker is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// GOOGLE SHEET
// ============================================================

/**
 * Создать лист с заголовками если его нет
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Event",
      "Session ID",
      "Source",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "UTM Content",
      "Referrer",
      "TG User",
      "TG User ID",
      "TG Name",
      "Device",
      "Screen",
      "Browser Lang",
      "URL",
      "Step #",
      "Step Name",
      "Total Steps",
      "Time Spent (sec)"
    ]);

    // Форматирование заголовков
    const headerRange = sheet.getRange(1, 1, 1, 20);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4a86c8");
    headerRange.setFontColor("white");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Записать событие в таблицу
 */
function logToSheet(data) {
  const sheet = setupSheet();
  const src = data.source || {};

  const tgName = [src.tg_first_name, src.tg_last_name].filter(Boolean).join(" ");

  sheet.appendRow([
    new Date(),                                     // Timestamp
    data.event,                                     // Event type
    data.session_id,                                // Session ID
    detectSource(src),                              // Source (human-readable)
    src.utm_source || "",                           // UTM Source
    src.utm_medium || "",                           // UTM Medium
    src.utm_campaign || "",                         // UTM Campaign
    src.utm_content || "",                          // UTM Content
    src.referrer_domain || src.referrer || "",       // Referrer
    src.tg_user ? "@" + src.tg_user : "",           // TG Username
    src.tg_user_id || "",                           // TG User ID
    tgName,                                         // TG Full Name
    src.device || "",                               // Device
    src.screen || "",                               // Screen
    src.browser_lang || "",                         // Browser Lang
    src.url || "",                                  // URL
    data.step != null ? data.step : "",             // Step #
    data.step_name || "",                           // Step Name
    data.total_steps || "",                         // Total Steps
    data.time_spent_seconds || ""                   // Time Spent
  ]);
}

// ============================================================
// QUIZ SUBMISSIONS
// ============================================================

/**
 * Создать лист Submissions с заголовками
 */
function setupSubmitSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SUBMIT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SUBMIT_SHEET);
    sheet.appendRow([
      "Timestamp",
      "Session ID",
      "Жанры",
      "Настроение",
      "Длина",
      "Страна",
      "Любимые дорамы",
      "Не нравится",
      "Романтика",
      "Контакт",
      "Источник",
      "TG User",
      "Устройство"
    ]);

    var headerRange = sheet.getRange(1, 1, 1, 13);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#27ae60");
    headerRange.setFontColor("white");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Записать заявку квиза в таблицу
 */
function logSubmission(data) {
  var sheet = setupSubmitSheet();
  var a = data.answers || {};
  var src = data.source || {};

  sheet.appendRow([
    new Date(),
    data.session_id || "",
    formatField(a.genres),
    formatField(a.mood),
    formatField(a.length),
    formatField(a.country),
    a.favorites || "",
    formatField(a.dislike),
    formatField(a.romance),
    a.contact || "",
    detectSource(src),
    src.tg_user ? "@" + src.tg_user : "",
    src.device || ""
  ]);
}

/**
 * Форматировать поле ответа (массив → строка)
 */
function formatField(val) {
  if (Array.isArray(val)) return val.join(", ") || "не указано";
  if (typeof val === "string") return val || "не указано";
  return "не указано";
}

/**
 * Собрать Telegram-сообщение из заявки квиза
 */
function buildSubmitMessage(answers, source) {
  if (!answers) return "";
  var a = answers;

  var lines = [
    "🎬 *Новая заявка на рекомендацию дорам!*",
    "",
    "🎭 *Жанры:* " + formatField(a.genres),
    "🌈 *Настроение:* " + formatField(a.mood),
    "📏 *Длина:* " + formatField(a.length),
    "🌍 *Страна:* " + formatField(a.country),
    "⭐ *Любимые дорамы:* " + (a.favorites || "не указано"),
    "👎 *Не нравится:* " + formatField(a.dislike),
    "💕 *Романтика:* " + formatField(a.romance),
    "📬 *Контакт:* " + (a.contact || "не указано")
  ];

  // Добавить источник если есть
  if (source) {
    var sourceLabel = detectSource(source);
    if (sourceLabel !== "Direct") {
      lines.push("");
      lines.push("📍 Источник: " + sourceLabel);
    }
    if (source.tg_user) {
      lines.push("👤 @" + source.tg_user);
    }
  }

  return lines.join("\n");
}

// ============================================================
// TELEGRAM
// ============================================================

/**
 * Определить источник трафика
 */
function detectSource(src) {
  if (!src) return "Direct";
  var s = ((src.utm_source || "") + " " + (src.referrer_domain || "")).toLowerCase();
  if (s.indexOf("instagram") >= 0 || s.indexOf("ig") >= 0) return "Instagram";
  if (s.indexOf("telegram") >= 0 || s.indexOf("t.me") >= 0) return "Telegram";
  if (s.indexOf("facebook") >= 0 || s.indexOf("fb") >= 0) return "Facebook";
  if (s.indexOf("tiktok") >= 0) return "TikTok";
  if (s.indexOf("google") >= 0) return "Google";
  if (s.indexOf("youtube") >= 0 || s.indexOf("yt") >= 0) return "YouTube";
  if (s.indexOf("twitter") >= 0 || s.indexOf("x.com") >= 0) return "X/Twitter";
  if (src.referrer_domain) return src.referrer_domain;
  return "Direct";
}

/**
 * Форматирование источника для Telegram
 */
function formatSourceTG(src) {
  if (!src) return "Источник неизвестен";
  var lines = [];

  // Telegram user
  if (src.tg_user) {
    lines.push("👤 Telegram: @" + src.tg_user);
  } else if (src.tg_first_name) {
    var name = [src.tg_first_name, src.tg_last_name].filter(Boolean).join(" ");
    lines.push("👤 Telegram: " + name + " (id: " + src.tg_user_id + ")");
  }

  // Источник
  var sourceLabel = detectSource(src);
  var icons = {
    "Instagram": "📸", "Telegram": "🔵", "Facebook": "🔷",
    "TikTok": "🎵", "Google": "🔍", "YouTube": "▶️", "X/Twitter": "🐦"
  };
  var icon = icons[sourceLabel] || "🌐";
  if (sourceLabel !== "Direct") {
    lines.push("📍 Откуда: " + icon + " " + sourceLabel);
  }

  // UTM
  if (src.utm_source) {
    lines.push("🏷 UTM: " + src.utm_source + (src.utm_medium ? " / " + src.utm_medium : ""));
  }
  if (src.utm_campaign) lines.push("📊 Кампания: " + src.utm_campaign);

  // Устройство
  var deviceIcon = src.device === "mobile" ? "📱" : "💻";
  var deviceName = src.device === "mobile" ? "Мобильный" : "Десктоп";
  lines.push(deviceIcon + " " + deviceName + " (" + (src.screen || "?") + ")");

  return lines.length > 0 ? lines.join("\n") : "🔗 Прямой заход";
}

/**
 * Форматирование времени
 */
function formatTime(seconds) {
  if (!seconds || seconds <= 0) return "< 1 сек";
  if (seconds < 60) return seconds + " сек";
  var min = Math.floor(seconds / 60);
  var sec = seconds % 60;
  return sec > 0 ? min + " мин " + sec + " сек" : min + " мин";
}

/**
 * Прогресс-бар
 */
function progressBar(step, total) {
  if (step < 0) return repeat("░", total) + " 0/" + total;
  var filled = Math.min(step + 1, total);
  return repeat("▓", filled) + repeat("░", total - filled) + " " + filled + "/" + total;
}

function repeat(char, n) {
  var s = "";
  for (var i = 0; i < n; i++) s += char;
  return s;
}

/**
 * Собрать сообщение для Telegram
 */
function buildTelegramMessage(data) {
  var total = data.total_steps || 8;

  if (data.event === "quiz_complete") {
    // Прошёл квиз — одно сообщение со всем
    var lines = [
      "🎉 *Квиз пройден!*",
      "",
      formatSourceTG(data.source),
      "",
      "⏱ Время: " + formatTime(data.time_spent_seconds)
    ];

    // Ответы прямо в это же сообщение
    if (data.answers) {
      var a = data.answers;
      lines.push("");
      lines.push("🎭 Жанры: " + formatField(a.genres));
      lines.push("🌈 Настроение: " + formatField(a.mood));
      lines.push("📏 Длина: " + formatField(a.length));
      lines.push("🌍 Страна: " + formatField(a.country));
      lines.push("⭐ Любимые: " + (a.favorites || "—"));
      lines.push("👎 Не нравится: " + formatField(a.dislike));
      lines.push("💕 Романтика: " + formatField(a.romance));
      lines.push("📬 Контакт: " + (a.contact || "—"));
    }

    return lines.join("\n");
  }

  if (data.event === "visit_end") {
    var stepNum = data.step != null ? data.step : -1;
    if (stepNum >= total) return ""; // квиз пройден — не дублировать

    return [
      "🚪 *Ушёл с квиза*",
      "",
      formatSourceTG(data.source),
      "",
      "📍 Остановился: *" + (data.step_name || "Intro") + "*",
      "📊 " + progressBar(stepNum, total),
      "⏱ Провёл: " + formatTime(data.time_spent_seconds)
    ].join("\n");
  }

  return "";
}

/**
 * Отправить сообщение в Telegram
 */
function sendTelegram(text, silent) {
  if (!text || !TG_BOT_TOKEN || TG_BOT_TOKEN === "ВСТАВЬ_ТОКЕН_БОТА") return;

  try {
    var url = "https://api.telegram.org/bot" + TG_BOT_TOKEN + "/sendMessage";
    var payload = {
      chat_id: TG_CHAT_ID,
      text: text,
      parse_mode: "Markdown",
      disable_notification: !!silent
    };

    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log("Telegram error: " + err.toString());
  }
}

// ============================================================
// УТИЛИТЫ
// ============================================================

/**
 * Ручной запуск для создания листа (Run → setupSheet)
 */
function initializeSheet() {
  setupSheet();
  SpreadsheetApp.getUi().alert("Лист '" + SHEET_NAME + "' создан!");
}

/**
 * Тестовый визит (для проверки)
 */
function testVisit() {
  var testData = {
    postData: {
      contents: JSON.stringify({
        event: "visit_start",
        session_id: "test-" + Date.now(),
        source: {
          utm_source: "instagram",
          utm_medium: "story",
          device: "mobile",
          screen: "390x844",
          browser_lang: "ru-RU",
          url: "https://dorama-quiz.vercel.app/?utm_source=instagram"
        },
        step: -1,
        step_name: "Intro",
        total_steps: 8
      })
    }
  };

  doPost(testData);
  Logger.log("Test visit sent! Check sheet and Telegram.");
}
