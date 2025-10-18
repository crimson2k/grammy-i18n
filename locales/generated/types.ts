/**
 * Auto-generated translation types.
 * DO NOT EDIT MANUALLY - run 'grammy-i18n-generate' to regenerate.
 */

/**
 * All available translation keys
 */
export type TranslationKey =
  | "greeting"
  | "welcome"
  | "buttons.start"
  | "buttons.help"
  | "buttons.settings";

/**
 * Variables required for each translation key
 */
export type TranslationVariables = {
  "greeting": { name: string | number | boolean };
};

/**
 * Helper type to get variables for a specific key
 */
export type VariablesFor<K extends TranslationKey> = K extends keyof TranslationVariables
  ? TranslationVariables[K]
  : undefined;

// Module augmentation to override library types
declare module "grammy-i18n" {
  export type { TranslationKey, VariablesFor };
}
