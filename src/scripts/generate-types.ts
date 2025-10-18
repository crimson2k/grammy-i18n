import { readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { parse } from "yaml";

/**
 * Grammy I18N Type Generator
 *
 * This script generates TypeScript types from YAML translation files,
 * providing IDE autocomplete for both translation keys and their variables.
 *
 * Part of the Grammy I18N Plugin - a standalone, portable i18n solution.
 *
 * Usage:
 *   bun run src/plugins/i18n/scripts/generate-types.ts
 *
 * Or add to package.json:
 *   "i18n:generate": "bun run src/plugins/i18n/scripts/generate-types.ts"
 *
 * @see README.md for full documentation
 */

interface TranslationTree {
  [key: string]: string | TranslationTree;
}

interface Translations {
  [locale: string]: TranslationTree;
}

/**
 * Scans directory for YAML files and loads translations
 */
async function loadTranslations(localesDir: string): Promise<Translations> {
  const translations: Translations = {};

  const entries = await scanDirectory(localesDir);

  for (const entry of entries) {
    const { locale, path, namespace } = entry;

    const fileContent = await Bun.file(path).text();
    const content = parse(fileContent) as TranslationTree;

    if (!translations[locale]) {
      translations[locale] = {};
    }

    if (namespace) {
      translations[locale] = mergeDeep(
        translations[locale] as Record<string, unknown>,
        {
          [namespace]: content,
        },
      ) as TranslationTree;
    } else {
      translations[locale] = mergeDeep(
        translations[locale] as Record<string, unknown>,
        content,
      ) as TranslationTree;
    }
  }

  return translations;
}

interface LocaleEntry {
  locale: string;
  path: string;
  namespace?: string;
}

async function scanDirectory(
  dirPath: string,
  baseDir: string = dirPath,
  parentLocale?: string,
): Promise<LocaleEntry[]> {
  const entries: LocaleEntry[] = [];
  const files = await readdir(dirPath);

  for (const file of files) {
    // Skip generated directory
    if (file === "generated") continue;

    const fullPath = `${dirPath}/${file}`;
    const isDirectory = await isDir(fullPath);

    if (isDirectory) {
      const nestedEntries = await scanDirectory(fullPath, baseDir, file);
      entries.push(...nestedEntries);
    } else if (file.endsWith(".yaml") || file.endsWith(".yml")) {
      const fileName = file.replace(/\.(yaml|yml)$/, "");

      if (parentLocale) {
        entries.push({
          locale: parentLocale,
          path: fullPath,
          namespace: fileName,
        });
      } else {
        entries.push({
          locale: fileName,
          path: fullPath,
        });
      }
    }
  }

  return entries;
}

async function isDir(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

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

function isObject(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Extracts all translation keys from a translation tree
 */
function extractKeys(
  tree: TranslationTree,
  prefix: string = "",
): Map<string, string> {
  const keys = new Map<string, string>();

  for (const [key, value] of Object.entries(tree)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      keys.set(fullKey, value);
    } else if (value && typeof value === "object") {
      const nestedKeys = extractKeys(value as TranslationTree, fullKey);
      for (const [nestedKey, nestedValue] of nestedKeys) {
        keys.set(nestedKey, nestedValue);
      }
    }
  }

  return keys;
}

/**
 * Extracts variable names from a template string
 */
function extractVariables(template: string): string[] {
  const regex = /\{\{\s*(\w+)\s*\}\}/g;
  const variables: string[] = [];
  let match: RegExpExecArray | null = regex.exec(template);

  while (match !== null) {
    if (match[1]) {
      variables.push(match[1]);
    }
    match = regex.exec(template);
  }

  return variables;
}

/**
 * Generates TypeScript type definitions
 */
function generateTypes(translations: Translations): string {
  // Get keys from the first locale (assuming all locales have the same keys)
  const firstLocale = Object.keys(translations)[0];
  if (!firstLocale || !translations[firstLocale]) {
    return "export type TranslationKey = string;\nexport type TranslationVariables = Record<string, never>;\n";
  }

  const keys = extractKeys(translations[firstLocale] as TranslationTree);

  // Generate union type for all keys
  const keyUnion = Array.from(keys.keys())
    .map((key) => `  | "${key}"`)
    .join("\n");

  // Generate variables mapping
  const variablesMapping: string[] = [];
  for (const [key, template] of keys) {
    const variables = extractVariables(template);
    if (variables.length > 0) {
      const varsType = variables
        .map((v) => `${v}: string | number | boolean`)
        .join("; ");
      variablesMapping.push(`  "${key}": { ${varsType} };`);
    }
  }

  const variablesType =
    variablesMapping.length > 0
      ? `{\n${variablesMapping.join("\n")}\n}`
      : "Record<string, never>";

  return `/**
 * Auto-generated translation types.
 * DO NOT EDIT MANUALLY - run 'bun run i18n:generate' to regenerate.
 */

/**
 * All available translation keys
 */
export type TranslationKey =
${keyUnion};

/**
 * Variables required for each translation key
 */
export type TranslationVariables = ${variablesType};

/**
 * Helper type to get variables for a specific key
 */
export type VariablesFor<K extends TranslationKey> = K extends keyof TranslationVariables
  ? TranslationVariables[K]
  : Record<string, never>;
`;
}

/**
 * Main function
 */
async function main() {
  const localesDir = "./locales";
  const outputPath = "./locales/generated/types.ts";

  console.log("Scanning translation files...");
  const translations = await loadTranslations(localesDir);

  const locales = Object.keys(translations);
  console.log(`Found locales: ${locales.join(", ")}`);

  console.log("Generating TypeScript types...");
  const types = generateTypes(translations);

  // Create output directory if it doesn't exist
  const outputDir = dirname(outputPath);
  await mkdir(outputDir, { recursive: true });

  await writeFile(outputPath, types, "utf-8");

  console.log(`Types generated: ${outputPath}`);

  // Count keys
  const firstLocale = Object.keys(translations)[0];
  if (firstLocale && translations[firstLocale]) {
    const keyCount = extractKeys(translations[firstLocale] as TranslationTree).size;
    console.log(`Total translation keys: ${keyCount}`);
  }
}

main().catch((error) => {
  console.error("Error generating types:", error);
  process.exit(1);
});
