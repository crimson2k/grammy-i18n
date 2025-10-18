/**
 * Buttons Example with I18N
 *
 * This example shows how to create multilingual inline keyboards
 * and handle button clicks using the hears() filter.
 */

import { Bot, type Context, InlineKeyboard } from "grammy";
import { hears, I18N, type I18NFlavor, I18NMiddleware } from "grammy-i18n";

// Define custom context type with I18N flavor
type MyContext = Context & I18NFlavor;

// Create I18N instance
const i18n = new I18N({
	localesDir: "./locales",
	defaultLocale: "en",
});

await i18n.load();

// Create bot with custom context type
const bot = new Bot<MyContext>(process.env.BOT_TOKEN ?? "");

// Add I18N middleware
bot.use(
	I18NMiddleware(i18n, (ctx) => {
		return ctx.from?.language_code ?? "en";
	}),
);

// Start command with multilingual keyboard
bot.command("start", (ctx) => {
	// Create keyboard with translated button labels
	const keyboard = new InlineKeyboard()
		.text(ctx.t("buttons.catalog"), "catalog")
		.text(ctx.t("buttons.cart"), "cart")
		.row()
		.text(ctx.t("buttons.settings"), "settings")
		.text(ctx.t("buttons.help"), "help");

	ctx.reply(ctx.t("welcome"), {
		reply_markup: keyboard,
	});
});

// Handle button callbacks
bot.callbackQuery("catalog", (ctx) => {
	ctx.answerCallbackQuery();
	ctx.reply(ctx.t("messages.catalog_opened"));
});

bot.callbackQuery("cart", (ctx) => {
	ctx.answerCallbackQuery();
	const itemCount = 3; // Example
	ctx.reply(ctx.t("messages.cart_items", { count: itemCount }));
});

bot.callbackQuery("settings", (ctx) => {
	ctx.answerCallbackQuery();
	ctx.reply(ctx.t("messages.settings_opened"));
});

bot.callbackQuery("help", (ctx) => {
	ctx.answerCallbackQuery();
	ctx.reply(ctx.t("messages.help_text"));
});

// Alternative: Using hears() filter for text-based buttons
// This works with regular keyboards (ReplyKeyboardMarkup)

// Create a keyboard with text buttons
bot.command("menu", (ctx) => {
	const message = ctx.t("messages.choose_option");

	// Note: In real app, you would use Keyboard builder
	// This is just to demonstrate the concept
	ctx.reply(message);
});

// The hears() filter matches messages in ANY language
// If user clicks "Catalog" (en) or "Каталог" (ru), this handler will trigger
bot.filter(hears("buttons.catalog"), (ctx) => {
	ctx.reply(ctx.t("messages.catalog_opened"));
});

bot.filter(hears("buttons.settings"), (ctx) => {
	ctx.reply(ctx.t("messages.settings_opened"));
});

// Start the bot
bot.start();

console.log("Bot with multilingual buttons is running...");

/**
 * Example translation files:
 *
 * locales/en.yaml:
 * ```yaml
 * welcome: "Welcome! Choose an option:"
 * buttons:
 *   catalog: "📦 Catalog"
 *   cart: "🛒 Cart"
 *   settings: "⚙️ Settings"
 *   help: "❓ Help"
 * messages:
 *   catalog_opened: "Here's our catalog of products..."
 *   cart_items: "You have {{ count }} items in your cart"
 *   settings_opened: "Settings menu"
 *   help_text: "Need help? Contact @support"
 *   choose_option: "Please choose an option from the menu"
 * ```
 *
 * locales/ru.yaml:
 * ```yaml
 * welcome: "Добро пожаловать! Выберите опцию:"
 * buttons:
 *   catalog: "📦 Каталог"
 *   cart: "🛒 Корзина"
 *   settings: "⚙️ Настройки"
 *   help: "❓ Помощь"
 * messages:
 *   catalog_opened: "Вот наш каталог товаров..."
 *   cart_items: "В вашей корзине {{ count }} товаров"
 *   settings_opened: "Меню настроек"
 *   help_text: "Нужна помощь? Напишите @support"
 *   choose_option: "Пожалуйста, выберите опцию из меню"
 * ```
 */
