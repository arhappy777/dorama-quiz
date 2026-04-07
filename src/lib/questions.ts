import type { Lang } from "./i18n";

export interface Question {
  id: string;
  title: Record<Lang, string>;
  subtitle?: Record<Lang, string>;
  type: "single" | "multi" | "text";
  options?: Record<Lang, string>[];
  allowOther?: boolean;
  placeholder?: Record<Lang, string>;
}

// Helper to get localized string
export function loc(val: Record<Lang, string> | undefined, lang: Lang): string {
  if (!val) return "";
  return val[lang];
}

// Get localized options as strings
export function locOptions(options: Record<Lang, string>[] | undefined, lang: Lang): string[] {
  if (!options) return [];
  return options.map((o) => o[lang]);
}

// Find the option key (ru) from a localized value — for consistent storage
export function optionKey(options: Record<Lang, string>[] | undefined, value: string, lang: Lang): string {
  if (!options) return value;
  const opt = options.find((o) => o[lang] === value);
  return opt ? opt.ru : value; // always store in RU as key
}

export const questions: Question[] = [
  {
    id: "genres",
    title: { ru: "Какие жанры тебе нравятся?", en: "What genres do you like?", uk: "Які жанри тобі подобаються?" },
    subtitle: { ru: "Можно выбрать несколько", en: "You can pick several", uk: "Можна обрати кілька" },
    type: "multi",
    options: [
      { ru: "Романтика 💕", en: "Romance 💕", uk: "Романтика 💕" },
      { ru: "Триллер / Детектив 🔍", en: "Thriller / Detective 🔍", uk: "Трилер / Детектив 🔍" },
      { ru: "Комедия 😂", en: "Comedy 😂", uk: "Комедія 😂" },
      { ru: "Историческая дорама 🏯", en: "Historical drama 🏯", uk: "Історична дорама 🏯" },
      { ru: "Фэнтези / Мистика ✨", en: "Fantasy / Supernatural ✨", uk: "Фентезі / Містика ✨" },
      { ru: "Драма / Мелодрама 😢", en: "Drama / Melodrama 😢", uk: "Драма / Мелодрама 😢" },
      { ru: "Экшн 💥", en: "Action 💥", uk: "Екшн 💥" },
      { ru: "Медицинская / Юридическая 🏥", en: "Medical / Legal 🏥", uk: "Медична / Юридична 🏥" },
    ],
    allowOther: true,
  },
  {
    id: "mood",
    title: { ru: "Какое настроение сейчас?", en: "What's your mood right now?", uk: "Який настрій зараз?" },
    subtitle: { ru: "Что хочется посмотреть?", en: "What do you feel like watching?", uk: "Що хочеться подивитися?" },
    type: "single",
    options: [
      { ru: "Хочу пореветь 😭", en: "I want to cry 😭", uk: "Хочу поплакати 😭" },
      { ru: "Посмеяться от души 🤣", en: "Have a good laugh 🤣", uk: "Посміятися від душі 🤣" },
      { ru: "Напряжённый сюжет 😰", en: "Tense plot 😰", uk: "Напружений сюжет 😰" },
      { ru: "Лёгкое и тёплое 🌸", en: "Light and warm 🌸", uk: "Легке та тепле 🌸" },
      { ru: "Что-то мрачное и глубокое 🌑", en: "Something dark and deep 🌑", uk: "Щось похмуре та глибоке 🌑" },
      { ru: "Романтику и бабочек в животе 🦋", en: "Romance and butterflies 🦋", uk: "Романтику та метеликів у животі 🦋" },
    ],
    allowOther: true,
  },
  {
    id: "length",
    title: { ru: "Какая длина сериала подойдёт?", en: "What series length works for you?", uk: "Яка довжина серіалу підійде?" },
    type: "single",
    options: [
      { ru: "Короткий (8-12 серий)", en: "Short (8-12 episodes)", uk: "Короткий (8-12 серій)" },
      { ru: "Средний (13-20 серий)", en: "Medium (13-20 episodes)", uk: "Середній (13-20 серій)" },
      { ru: "Длинный (20+ серий)", en: "Long (20+ episodes)", uk: "Довгий (20+ серій)" },
      { ru: "Не важно", en: "Doesn't matter", uk: "Не важливо" },
    ],
  },
  {
    id: "country",
    title: { ru: "Какая страна?", en: "Which country?", uk: "Яка країна?" },
    subtitle: { ru: "Откуда дорама?", en: "Where is the drama from?", uk: "Звідки дорама?" },
    type: "multi",
    options: [
      { ru: "Южная Корея 🇰🇷", en: "South Korea 🇰🇷", uk: "Південна Корея 🇰🇷" },
      { ru: "Китай 🇨🇳", en: "China 🇨🇳", uk: "Китай 🇨🇳" },
      { ru: "Япония 🇯🇵", en: "Japan 🇯🇵", uk: "Японія 🇯🇵" },
      { ru: "Тайланд 🇹🇭", en: "Thailand 🇹🇭", uk: "Таїланд 🇹🇭" },
      { ru: "Тайвань 🇹🇼", en: "Taiwan 🇹🇼", uk: "Тайвань 🇹🇼" },
      { ru: "Не важно 🌍", en: "Doesn't matter 🌍", uk: "Не важливо 🌍" },
    ],
    allowOther: true,
  },
  {
    id: "favorites",
    title: { ru: "Какие дорамы тебе уже нравились?", en: "Which dramas have you enjoyed?", uk: "Які дорами тобі вже сподобались?" },
    subtitle: {
      ru: "Напиши названия через запятую, чтобы мы лучше поняли твой вкус",
      en: "Write titles separated by commas so we can understand your taste",
      uk: "Напиши назви через кому, щоб ми краще зрозуміли твій смак",
    },
    type: "text",
    placeholder: {
      ru: "Например: Goblin, Crash Landing on You, Vincenzo...",
      en: "E.g.: Goblin, Crash Landing on You, Vincenzo...",
      uk: "Наприклад: Goblin, Crash Landing on You, Vincenzo...",
    },
  },
  {
    id: "dislike",
    title: { ru: "Что тебе НЕ нравится в дорамах?", en: "What do you NOT like in dramas?", uk: "Що тобі НЕ подобається в дорамах?" },
    subtitle: { ru: "Чего избегать?", en: "What to avoid?", uk: "Чого уникати?" },
    type: "multi",
    options: [
      { ru: "Слишком медленный темп 🐌", en: "Too slow pacing 🐌", uk: "Занадто повільний темп 🐌" },
      { ru: "Любовные треугольники 💔", en: "Love triangles 💔", uk: "Любовні трикутники 💔" },
      { ru: "Грустный финал 😞", en: "Sad ending 😞", uk: "Сумний фінал 😞" },
      { ru: "Много насилия 🩸", en: "Too much violence 🩸", uk: "Багато насильства 🩸" },
      { ru: "Клише / предсказуемость 🔄", en: "Clichés / predictability 🔄", uk: "Кліше / передбачуваність 🔄" },
      { ru: "Плохая актёрская игра 🎭", en: "Bad acting 🎭", uk: "Погана акторська гра 🎭" },
    ],
    allowOther: true,
  },
  {
    id: "romance",
    title: { ru: "Насколько важна романтика?", en: "How important is romance?", uk: "Наскільки важлива романтика?" },
    type: "single",
    options: [
      { ru: "Обязательна! Без романтики не смотрю ❤️", en: "Essential! I don't watch without romance ❤️", uk: "Обов'язкова! Без романтики не дивлюсь ❤️" },
      { ru: "Желательна, но не главное 💛", en: "Preferred but not a must 💛", uk: "Бажана, але не головне 💛" },
      { ru: "Можно без неё 🤷", en: "Can do without 🤷", uk: "Можна без неї 🤷" },
      { ru: "Лучше без романтики 🚫", en: "Better without romance 🚫", uk: "Краще без романтики 🚫" },
    ],
  },
  {
    id: "contact",
    title: { ru: "Куда прислать рекомендации? 📬", en: "Where to send recommendations? 📬", uk: "Куди надіслати рекомендації? 📬" },
    subtitle: {
      ru: "Telegram, Instagram или email — что удобнее",
      en: "Telegram, Instagram or email — whatever works",
      uk: "Telegram, Instagram або email — що зручніше",
    },
    type: "text",
    placeholder: {
      ru: "@username / email / instagram...",
      en: "@username / email / instagram...",
      uk: "@username / email / instagram...",
    },
  },
];
