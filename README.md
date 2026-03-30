# Dorama Quiz 🎬

Квиз для подбора дорам с отправкой результатов в Telegram.

## Деплой на Vercel

1. Пушни репо на GitHub:
   ```bash
   cd E:\DORAMA\dorama-quiz
   git init && git add . && git commit -m "init: dorama quiz"
   gh repo create dorama-quiz --private --source=. --push
   ```

2. Зайди на [vercel.com](https://vercel.com) → Import Project → выбери `dorama-quiz`

3. Добавь Environment Variables:
   - `TG_BOT_TOKEN` = токен бота
   - `TG_CHAT_ID` = ID чата

4. Deploy!

## Локальный запуск

```bash
npm install
npx next dev
```

Открой http://localhost:3000
