export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: "single" | "multi" | "text";
  options?: string[];
  allowOther?: boolean;
  placeholder?: string;
}

export const questions: Question[] = [
  {
    id: "genres",
    title: "Какие жанры тебе нравятся?",
    subtitle: "Можно выбрать несколько",
    type: "multi",
    options: [
      "Романтика 💕",
      "Триллер / Детектив 🔍",
      "Комедия 😂",
      "Историческая дорама 🏯",
      "Фэнтези / Мистика ✨",
      "Драма / Мелодрама 😢",
      "Экшн 💥",
      "Медицинская / Юридическая 🏥",
    ],
    allowOther: true,
  },
  {
    id: "mood",
    title: "Какое настроение сейчас?",
    subtitle: "Что хочется посмотреть?",
    type: "single",
    options: [
      "Хочу пореветь 😭",
      "Посмеяться от души 🤣",
      "Напряжённый сюжет 😰",
      "Лёгкое и тёплое 🌸",
      "Что-то мрачное и глубокое 🌑",
      "Романтику и бабочек в животе 🦋",
    ],
    allowOther: true,
  },
  {
    id: "length",
    title: "Какая длина сериала подойдёт?",
    type: "single",
    options: [
      "Короткий (8-12 серий)",
      "Средний (13-20 серий)",
      "Длинный (20+ серий)",
      "Не важно",
    ],
  },
  {
    id: "country",
    title: "Какая страна?",
    subtitle: "Откуда дорама?",
    type: "multi",
    options: [
      "Южная Корея 🇰🇷",
      "Китай 🇨🇳",
      "Япония 🇯🇵",
      "Тайланд 🇹🇭",
      "Тайвань 🇹🇼",
      "Не важно 🌍",
    ],
    allowOther: true,
  },
  {
    id: "favorites",
    title: "Какие дорамы тебе уже нравились?",
    subtitle: "Напиши названия через запятую, чтобы мы лучше поняли твой вкус",
    type: "text",
    placeholder: "Например: Goblin, Crash Landing on You, Vincenzo...",
  },
  {
    id: "dislike",
    title: "Что тебе НЕ нравится в дорамах?",
    subtitle: "Чего избегать?",
    type: "multi",
    options: [
      "Слишком медленный темп 🐌",
      "Любовные треугольники 💔",
      "Грустный финал 😞",
      "Много насилия 🩸",
      "Клише / предсказуемость 🔄",
      "Плохая актёрская игра 🎭",
    ],
    allowOther: true,
  },
  {
    id: "romance",
    title: "Насколько важна романтика?",
    type: "single",
    options: [
      "Обязательна! Без романтики не смотрю ❤️",
      "Желательна, но не главное 💛",
      "Можно без неё 🤷",
      "Лучше без романтики 🚫",
    ],
  },
  {
    id: "contact",
    title: "Куда прислать рекомендации? 📬",
    subtitle: "Telegram, Instagram или email — что удобнее",
    type: "text",
    placeholder: "@username / email / instagram...",
  },
];
