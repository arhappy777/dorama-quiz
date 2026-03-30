import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TG_BOT_TOKEN!;
const CHAT_ID = process.env.TG_CHAT_ID!;

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    const lines = [
      "🎬 *Новая заявка на рекомендацию дорам!*",
      "",
      `🎭 *Жанры:* ${formatAnswer(answers.genres)}`,
      `🌈 *Настроение:* ${formatAnswer(answers.mood)}`,
      `📏 *Длина:* ${formatAnswer(answers.length)}`,
      `🌍 *Страна:* ${formatAnswer(answers.country)}`,
      `⭐ *Любимые дорамы:* ${answers.favorites || "не указано"}`,
      `👎 *Не нравится:* ${formatAnswer(answers.dislike)}`,
      `💕 *Романтика:* ${formatAnswer(answers.romance)}`,
    ];

    const text = lines.join("\n");

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram API error:", err);
      return NextResponse.json({ ok: false, error: "Telegram send failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Submit error:", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

function formatAnswer(val: unknown): string {
  if (Array.isArray(val)) return val.join(", ") || "не указано";
  if (typeof val === "string") return val || "не указано";
  return "не указано";
}
