/**
 * Grammy I18N Plugin
 *
 * A standalone internationalization plugin for Grammy Telegram bot framework.
 * Supports YAML translation files with nested structures and variable interpolation.
 *
 * @module i18n
 */

// Filters
export { hears, hearsAny } from "./hears";
// Core I18N class
export { I18N } from "./i18n";
// Middlewares
export {
  ConstI18NMiddleware,
  ConstI18NMiddleware as I18NConstMiddleware,
  I18NMiddleware,
} from "./middlewares/i18n";

// Types
export type {
  I18NConfig,
  I18NFlavor,
  LanguageGetter,
  TranslationKey,
  VariablesFor,
  Translations,
  TranslationTree,
  Variables,
} from "./types";
