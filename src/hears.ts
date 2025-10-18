import type { Context, Filter } from "grammy";
import type { I18NFlavor, TranslationKey } from "./types";

/**
 * Creates a filter function that matches messages against translated text.
 * Useful for handling button clicks or text commands in multiple languages.
 *
 * @param key - Translation key to match against
 * @returns Grammy filter function
 *
 * @example
 * ```typescript
 * // YAML: buttons.catalog: "Каталог"
 * bot.filter(hears("buttons.catalog"), (ctx) => {
 *   // Triggered when user sends "Каталог" (ru) or "Catalog" (en)
 *   ctx.reply("Opening catalog...");
 * });
 * ```
 */
export function hears<C extends Context & I18NFlavor>(
  key: TranslationKey,
): (ctx: C) => ctx is Filter<C, "message:text"> {
  return (ctx: C): ctx is Filter<C, "message:text"> => {
    if (!ctx.message?.text) return false;
    if (!ctx.i18n) return false;

    // Get all available locales
    const locales = ctx.i18n.getAvailableLocales();

    // Check if message text matches translation in any locale
    for (const locale of locales) {
      const tempI18n = Object.create(ctx.i18n);
      tempI18n.setLocale(locale);
      const translatedText = tempI18n.t(key);

      if (ctx.message.text === translatedText) {
        return true;
      }
    }

    return false;
  };
}

/**
 * Creates a filter function that matches messages against multiple translated texts.
 * Useful for handling multiple button options.
 *
 * @param keys - Array of translation keys to match against
 * @returns Grammy filter function
 *
 * @example
 * ```typescript
 * bot.filter(hearsAny(["buttons.yes", "buttons.no"]), (ctx) => {
 *   // Triggered for either button in any language
 * });
 * ```
 */
export function hearsAny<C extends Context & I18NFlavor>(
  keys: TranslationKey[],
): (ctx: C) => ctx is Filter<C, "message:text"> {
  return (ctx: C): ctx is Filter<C, "message:text"> => {
    if (!ctx.message?.text) return false;
    if (!ctx.i18n) return false;

    const locales = ctx.i18n.getAvailableLocales();

    for (const key of keys) {
      for (const locale of locales) {
        const tempI18n = Object.create(ctx.i18n);
        tempI18n.setLocale(locale);
        const translatedText = tempI18n.t(key);

        if (ctx.message.text === translatedText) {
          return true;
        }
      }
    }

    return false;
  };
}
