import type { Context, MiddlewareFn } from "grammy";
import type { I18N } from "../i18n";
import type { I18NFlavor, LanguageGetter } from "../types";

/**
 * Creates a middleware that adds i18n translation method to Grammy context.
 * Uses a callback function to determine the user's locale dynamically.
 *
 * @param i18n - I18N instance
 * @param languageGetter - Function that returns the user's locale from context
 * @returns Grammy middleware function
 *
 * @example
 * ```typescript
 * const i18n = new I18N({
 *   localesDir: "./locales",
 *   defaultLocale: "en"
 * });
 * await i18n.load();
 *
 * // Use user's language from context
 * bot.use(I18NMiddleware(i18n, (ctx) => ctx.user.langCode));
 *
 * bot.command("start", (ctx) => {
 *   ctx.reply(ctx.t("welcome", { name: ctx.from.first_name }));
 * });
 * ```
 */
export function I18NMiddleware<C extends Context>(
  i18n: I18N,
  languageGetter: LanguageGetter<C>,
): MiddlewareFn<C & I18NFlavor> {
  return async (ctx, next) => {
    // Get user's locale
    const locale = await languageGetter(ctx);

    // Create a locale-specific I18N instance
    const userI18n = Object.create(i18n);
    userI18n.setLocale(locale);

    // Add i18n instance to context (for filters like hears)
    ctx.i18n = userI18n;

    // Add translation method to context
    ctx.t = (
      key: string,
      variables?: Record<string, string | number | boolean>,
    ) => {
      return userI18n.t(key, variables);
    };

    await next();
  };
}

/**
 * Creates a middleware that adds i18n translation method to Grammy context.
 * Uses a constant locale for all users (useful for single-language bots).
 *
 * @param i18n - I18N instance
 * @param locale - Fixed locale code to use
 * @returns Grammy middleware function
 *
 * @example
 * ```typescript
 * const i18n = new I18N({
 *   localesDir: "./locales",
 *   defaultLocale: "ru"
 * });
 * await i18n.load();
 *
 * // Always use Russian locale
 * bot.use(I18NConstMiddleware(i18n, "ru"));
 *
 * bot.command("start", (ctx) => {
 *   ctx.reply(ctx.t("welcome"));
 * });
 * ```
 */
export function ConstI18NMiddleware<C extends Context>(
  i18n: I18N,
  locale: string,
): MiddlewareFn<C & I18NFlavor> {
  let validated = false;

  return async (ctx, next) => {
    // Validate locale on first execution (after i18n.load() has been called)
    if (!validated) {
      if (!i18n.hasLocale(locale)) {
        throw new Error(
          `Locale "${locale}" not found. Available locales: ${i18n.getAvailableLocales().join(", ")}`,
        );
      }
      // Set the locale once
      i18n.setLocale(locale);
      validated = true;
    }

    // Add i18n instance to context (for filters like hears)
    ctx.i18n = i18n;

    // Add translation method to context
    ctx.t = (
      key: string,
      variables?: Record<string, string | number | boolean>,
    ) => {
      return i18n.t(key, variables);
    };

    await next();
  };
}
