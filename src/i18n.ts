import { interpolate } from "./interpolator";
import { loadTranslations } from "./loader";
import type {
  I18NConfig,
  Translations,
  TranslationTree,
  Variables,
} from "./types";

/**
 * I18N class for managing internationalization.
 * Loads translations from YAML files and provides translation methods.
 *
 * @example
 * ```typescript
 * const i18n = new I18N({
 *   localesDir: "./locales",
 *   defaultLocale: "en"
 * });
 *
 * await i18n.load();
 *
 * i18n.setLocale("ru");
 * console.log(i18n.t("greeting")); // "Привет"
 * ```
 */
export class I18N {
  private translations: Translations = {};
  private currentLocale: string;
  private readonly defaultLocale: string;
  private readonly localesDir: string;
  private loaded = false;

  /**
   * Creates a new I18N instance.
   *
   * @param config - Configuration object
   */
  constructor(config: I18NConfig) {
    this.localesDir = config.localesDir;
    this.defaultLocale = config.defaultLocale;
    this.currentLocale = config.defaultLocale;
  }

  /**
   * Loads all translation files from the locales directory.
   * Must be called before using translation methods.
   *
   * @throws Error if loading fails
   */
  async load(): Promise<void> {
    this.translations = await loadTranslations(this.localesDir);
    this.loaded = true;

    // Validate that default locale exists
    if (!this.translations[this.defaultLocale]) {
      throw new Error(
        `Default locale "${this.defaultLocale}" not found in translations`,
      );
    }
  }

  /**
   * Sets the current locale for translations.
   *
   * @param locale - Locale code (e.g., "en", "ru", "uk")
   */
  setLocale(locale: string): void {
    this.currentLocale = locale;
  }

  /**
   * Gets the current locale.
   *
   * @returns Current locale code
   */
  getLocale(): string {
    return this.currentLocale;
  }

  /**
   * Translates a key to the current locale with optional variable interpolation.
   *
   * @param key - Translation key (supports dot notation for nested keys)
   * @param variables - Optional variables for template interpolation
   * @returns Translated string or the key if translation not found
   *
   * @example
   * ```typescript
   * i18n.t("greeting") // "Hello"
   * i18n.t("welcome", { name: "John" }) // "Welcome, John!"
   * i18n.t("user.profile.title") // "User Profile"
   * ```
   */
  t(key: string, variables?: Variables): string {
    if (!this.loaded) {
      throw new Error(
        "I18N not loaded. Call load() method before using translations.",
      );
    }

    // Try to get translation from current locale
    let translation = this.getTranslation(this.currentLocale, key);

    // Fallback to default locale if not found
    if (translation === null && this.currentLocale !== this.defaultLocale) {
      translation = this.getTranslation(this.defaultLocale, key);
    }

    // If still not found, return the key
    if (translation === null) {
      return key;
    }

    // Interpolate variables if provided
    return interpolate(translation, variables);
  }

  /**
   * Gets a translation from a specific locale by key.
   * Supports dot notation for nested keys (e.g., "user.profile.title").
   *
   * @param locale - Locale code
   * @param key - Translation key
   * @returns Translation string or null if not found
   */
  private getTranslation(locale: string, key: string): string | null {
    const localeTranslations = this.translations[locale];

    if (!localeTranslations) {
      return null;
    }

    // Split key by dots for nested access
    const keys = key.split(".");
    let current: string | TranslationTree = localeTranslations;

    for (const k of keys) {
      if (typeof current === "object" && current !== null && k in current) {
        current = current[k]!;
      } else {
        return null;
      }
    }

    // Return only if it's a string (leaf node)
    return typeof current === "string" ? current : null;
  }

  /**
   * Checks if a locale is available.
   *
   * @param locale - Locale code to check
   * @returns True if locale exists in loaded translations
   */
  hasLocale(locale: string): boolean {
    return locale in this.translations;
  }

  /**
   * Gets all available locales.
   *
   * @returns Array of locale codes
   */
  getAvailableLocales(): string[] {
    return Object.keys(this.translations);
  }
}
