import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dorama Quiz — Найди свою идеальную дораму",
  description: "Пройди квиз и получи персональные рекомендации дорам",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
