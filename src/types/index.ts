import type { Context } from "grammy";
import type { I18N } from "../i18n";

// Default types when no generated types are available
// Users should run `grammy-i18n-generate` to get autocomplete for their specific translations
export type TranslationKey = string;
export type VariablesFor<K extends TranslationKey> = K extends string
	? Record<string, string | number | boolean> | undefined
	: never;

/**
 * Represents a nested translation object structure.
 * Can contain strings or nested objects with more translations.
 */
export type TranslationTree = {
	[key: string]: string | TranslationTree;
};

/**
 * Collection of translations for all supported locales.
 */
export type Translations = {
	[locale: string]: TranslationTree;
};

/**
 * Variables object for template interpolation.
 */
export type Variables = Record<string, string | number | boolean>;

/**
 * Configuration options for I18N instance.
 */
export interface I18NConfig {
	/**
	 * Path to the directory containing locale files.
	 */
	localesDir: string;

	/**
	 * Default locale to use when no locale is specified.
	 */
	defaultLocale: string;
}

/**
 * Function type for getting the user's locale from context.
 */
export type LanguageGetter<C extends Context> = (
	ctx: C,
) => string | Promise<string>;

/**
 * Grammy context flavor that adds i18n translation method with autocomplete.
 */
export interface I18NFlavor {
	/**
	 * I18N instance attached to context.
	 * Used internally by filters like `hears()`.
	 */
	i18n: I18N;

	/**
	 * Translates a key with optional variable interpolation.
	 * Provides autocomplete for keys and required variables.
	 *
	 * @param key - Translation key (autocompleted from YAML files)
	 * @param variables - Variables for template interpolation (typed per key)
	 * @returns Translated string or the key if translation not found
	 *
	 * @example
	 * ```typescript
	 * ctx.t("user.welcome.start", { fullName: "John" }) // Autocomplete for both key and variables!
	 * ```
	 */
	t<K extends TranslationKey>(key: K, variables?: VariablesFor<K>): string;
}
