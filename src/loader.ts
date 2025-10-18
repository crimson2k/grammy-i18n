import { readdir, stat } from "node:fs/promises";
import { parse } from "yaml";
import type { Translations, TranslationTree } from "./types";

/**
 * Loads and parses YAML translation files from a directory.
 * Supports both flat structure (ru.yaml) and nested structure (ru/user.yaml).
 *
 * @param localesDir - Path to the directory containing locale files
 * @returns Object mapping locale codes to their translation trees
 *
 * @example
 * ```
 * locales/
 * ├── en.yaml          -> { greeting: "Hello" }
 * ├── ru.yaml          -> { greeting: "Привет" }
 * └── uk/
 *     └── user.yaml    -> { user: { name: "Ім'я" } }
 * ```
 */
export async function loadTranslations(
  localesDir: string,
): Promise<Translations> {
  const translations: Translations = {};

  try {
    // Scan the directory for locale files
    const entries = await scanDirectory(localesDir);

    for (const entry of entries) {
      const { locale, path, namespace } = entry;

      // Parse YAML file
      const fileContent = await Bun.file(path).text();
      const content = parse(fileContent) as TranslationTree;

      // Initialize locale if it doesn't exist
      if (!translations[locale]) {
        translations[locale] = {};
      }

      // If namespace exists (e.g., ru/user.yaml), nest the content
      if (namespace) {
        translations[locale] = mergeDeep(
          translations[locale] as Record<string, unknown>,
          { [namespace]: content },
        ) as TranslationTree;
      } else {
        // Merge directly for flat files (e.g., ru.yaml)
        translations[locale] = mergeDeep(
          translations[locale] as Record<string, unknown>,
          content,
        ) as TranslationTree;
      }
    }

    return translations;
  } catch (error) {
    throw new Error(
      `Failed to load translations from ${localesDir}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Interface representing a discovered locale file.
 */
interface LocaleEntry {
  locale: string;
  path: string;
  namespace?: string;
}

/**
 * Recursively scans a directory for YAML/YML files.
 *
 * @param dirPath - Directory path to scan
 * @param baseDir - Base directory (used for recursion)
 * @param parentLocale - Parent locale code (used for nested directories)
 * @returns Array of locale entries
 */
async function scanDirectory(
  dirPath: string,
  baseDir: string = dirPath,
  parentLocale?: string,
): Promise<LocaleEntry[]> {
  const entries: LocaleEntry[] = [];

  // Read all files and directories
  const files = await readdir(dirPath);

  for (const file of files) {
    const fullPath = `${dirPath}/${file}`;

    // Check if it's a directory
    const isDirectory = await isDir(fullPath);

    if (isDirectory) {
      // Recursively scan subdirectory
      // The directory name is treated as locale code
      const nestedEntries = await scanDirectory(fullPath, baseDir, file);
      entries.push(...nestedEntries);
    } else if (file.endsWith(".yaml") || file.endsWith(".yml")) {
      // Extract locale and namespace from file path
      const fileName = file.replace(/\.(yaml|yml)$/, "");

      if (parentLocale) {
        // Nested file: ru/user.yaml -> locale: ru, namespace: user
        entries.push({
          locale: parentLocale,
          path: fullPath,
          namespace: fileName,
        });
      } else {
        // Flat file: ru.yaml -> locale: ru
        entries.push({
          locale: fileName,
          path: fullPath,
        });
      }
    }
  }

  return entries;
}

/**
 * Checks if a path is a directory.
 *
 * @param path - Path to check
 * @returns True if path is a directory
 */
async function isDir(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Deep merges two objects, combining nested properties.
 *
 * @param target - Target object
 * @param source - Source object to merge
 * @returns Merged object
 */
function mergeDeep(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const output = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = output[key];

    if (isObject(sourceValue) && isObject(targetValue)) {
      output[key] = mergeDeep(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else {
      output[key] = sourceValue;
    }
  }

  return output;
}

/**
 * Type guard to check if a value is a plain object.
 *
 * @param value - Value to check
 * @returns True if value is a plain object
 */
function isObject(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
