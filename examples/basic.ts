/**
 * Basic I18N Example
 *
 * This example demonstrates the basic usage of Grammy I18N plugin.
 * Users receive messages in their Telegram language.
 */

import { Bot, type Context } from "grammy";
import { I18N, type I18NFlavor, I18NMiddleware } from "grammy-i18n";

// Define custom context type with I18N flavor
type MyContext = Context & I18NFlavor;

// Create I18N instance
const i18n = new I18N({
	localesDir: "./locales", // Path to your translation files
	defaultLocale: "en", // Fallback language
});

// Load translations
await i18n.load();

// Create bot with custom context type
const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? "");

// Add I18N middleware
// The language getter function determines which locale to use for each user
bot.use(
	I18NMiddleware(i18n, (ctx) => {
		// Use Telegram's language_code (e.g., "en", "ru", "uk")
		return ctx.from?.language_code ?? "en";
	}),
);

// Command handlers using translations
bot.command("start", (ctx) => {
	const name = ctx.from?.first_name ?? "User";

	// ctx.t() is now available thanks to the middleware
	ctx.reply(ctx.t("greeting", { name }));
});

bot.command("help", (ctx) => {
	ctx.reply(ctx.t("help_message"));
});

bot.command("about", (ctx) => {
	const version = "1.0.0";
	ctx.reply(ctx.t("about", { version }));
});

// Start the bot
bot.start();

console.log("Bot is running...");

/**
 * Example translation files:
 *
 * locales/en.yaml:
 * ```yaml
 * greeting: "Hello, {{ name }}! 👋"
 * help_message: "This is a multilingual bot. Try /start and /about commands."
 * about: "Bot version {{ version }}"
 * ```
 *
 * locales/ru.yaml:
 * ```yaml
 * greeting: "Привет, {{ name }}! 👋"
 * help_message: "Это многоязычный бот. Попробуйте команды /start и /about."
 * about: "Версия бота {{ version }}"
 * ```
 */
