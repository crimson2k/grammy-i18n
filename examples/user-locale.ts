/**
 * User Locale Preferences Example
 *
 * This example demonstrates how to:
 * - Store user's language preference in a database/memory
 * - Allow users to change their language
 * - Use the stored preference instead of Telegram's language_code
 */

import { Bot, InlineKeyboard } from "grammy";
import { I18N, I18NMiddleware } from "grammy-i18n";

// Simple in-memory storage for user preferences
// In production, use a real database (PostgreSQL, MongoDB, etc.)
const userPreferences = new Map<number, string>();

// Create I18N instance
const i18n = new I18N({
  localesDir: "./locales",
  defaultLocale: "en",
});

await i18n.load();

// Create bot
const bot = new Bot(process.env.BOT_TOKEN ?? "");

// Add I18N middleware with custom language getter
bot.use(
  I18NMiddleware(i18n, (ctx) => {
    const userId = ctx.from?.id;

    if (!userId) return "en";

    // First, check if user has a saved preference
    const savedLocale = userPreferences.get(userId);
    if (savedLocale) {
      return savedLocale;
    }

    // Otherwise, use Telegram's language_code as default
    const telegramLang = ctx.from?.language_code ?? "en";

    // Save it for next time
    userPreferences.set(userId, telegramLang);

    return telegramLang;
  })
);

// Start command
bot.command("start", (ctx) => {
  const name = ctx.from?.first_name ?? "User";
  const currentLang = userPreferences.get(ctx.from!.id) ?? "en";

  ctx.reply(
    ctx.t("welcome", { name }) + "\n\n" +
    ctx.t("current_language", { lang: currentLang })
  );
});

// Language selection command
bot.command("language", async (ctx) => {
  // Create keyboard with available languages
  const availableLocales = i18n.getAvailableLocales();

  const keyboard = new InlineKeyboard();

  const languageNames: Record<string, string> = {
    en: "🇬🇧 English",
    ru: "🇷🇺 Русский",
    uk: "🇺🇦 Українська",
    es: "🇪🇸 Español",
    de: "🇩🇪 Deutsch",
  };

  for (const locale of availableLocales) {
    const displayName = languageNames[locale] ?? locale;
    keyboard.text(displayName, `lang_${locale}`).row();
  }

  await ctx.reply(ctx.t("choose_language"), {
    reply_markup: keyboard,
  });
});

// Handle language selection
bot.callbackQuery(/^lang_(.+)$/, async (ctx) => {
  const selectedLang = ctx.match[1];

  if (!selectedLang) {
    return ctx.answerCallbackQuery("Error");
  }

  // Check if locale exists
  if (!i18n.hasLocale(selectedLang)) {
    return ctx.answerCallbackQuery(ctx.t("language_not_available"));
  }

  // Save user's preference
  const userId = ctx.from.id;
  userPreferences.set(userId, selectedLang);

  // Update the locale for this request
  ctx.i18n.setLocale(selectedLang);

  // Send confirmation
  await ctx.answerCallbackQuery(ctx.t("language_changed"));

  // Edit the message to show confirmation
  await ctx.editMessageText(
    ctx.t("language_changed_message", { lang: selectedLang })
  );
});

// Example command to demonstrate the language is persisted
bot.command("info", (ctx) => {
  const userId = ctx.from?.id;
  const savedLang = userId ? userPreferences.get(userId) : undefined;

  ctx.reply(
    ctx.t("user_info", {
      id: userId ?? 0,
      lang: savedLang ?? "not set",
    })
  );
});

// Start the bot
bot.start();

console.log("Bot with user locale preferences is running...");

/**
 * Example translation files:
 *
 * locales/en.yaml:
 * ```yaml
 * welcome: "Hello, {{ name }}! 👋"
 * current_language: "Your current language: {{ lang }}"
 * choose_language: "Choose your language:"
 * language_changed: "✅ Language changed!"
 * language_changed_message: "Your language has been changed to {{ lang }}"
 * language_not_available: "This language is not available"
 * user_info: "Your ID: {{ id }}\nYour language: {{ lang }}"
 * ```
 *
 * locales/ru.yaml:
 * ```yaml
 * welcome: "Привет, {{ name }}! 👋"
 * current_language: "Ваш текущий язык: {{ lang }}"
 * choose_language: "Выберите ваш язык:"
 * language_changed: "✅ Язык изменён!"
 * language_changed_message: "Ваш язык был изменён на {{ lang }}"
 * language_not_available: "Этот язык недоступен"
 * user_info: "Ваш ID: {{ id }}\nВаш язык: {{ lang }}"
 * ```
 *
 * locales/uk.yaml:
 * ```yaml
 * welcome: "Привіт, {{ name }}! 👋"
 * current_language: "Ваша поточна мова: {{ lang }}"
 * choose_language: "Оберіть вашу мову:"
 * language_changed: "✅ Мову змінено!"
 * language_changed_message: "Вашу мову було змінено на {{ lang }}"
 * language_not_available: "Ця мова недоступна"
 * user_info: "Ваш ID: {{ id }}\nВаша мова: {{ lang }}"
 * ```
 */
