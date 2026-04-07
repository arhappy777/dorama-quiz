import { NextResponse } from "next/server";

/* ---------------------------------------------------------------
   /api/track — прокси: принимает события от клиента и пересылает
   в Google Apps Script (GAS обходит CORS, пишет в таблицу + TG)
   --------------------------------------------------------------- */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbyfoP7b0-dj1WvR2nSd-k3R-Hbe9zNG-hz7piIbXzZEmY9fwfEITK5pAj7Qqk26Rm76rw/exec";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Пересылаем в GAS (сервер→сервер, без CORS проблем)
    // ВАЖНО: await обязателен — без него Vercel убивает функцию до завершения fetch
    const gasResponse = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      redirect: "follow",
    });

    console.log("GAS response status:", gasResponse.status);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Track proxy error:", e);
    return NextResponse.json({ ok: true });
  }
}
