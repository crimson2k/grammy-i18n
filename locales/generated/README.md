# Generated Types

This directory contains auto-generated TypeScript types for your translation files.

## What is this?

When you run `grammy-i18n-generate`, it scans your YAML translation files and generates TypeScript type definitions that provide autocomplete and type-checking for your translations.

## Usage

### 1. Generate types

```bash
npx grammy-i18n-generate
```

This creates `types.ts` in this directory.

### 2. Enable in tsconfig.json

Add this file to your TypeScript configuration:

```json
{
  "include": [
    "src/**/*",
    "locales/generated/types.ts"
  ]
}
```

### 3. Enjoy autocomplete!

Now you get full autocomplete in your code:

```typescript
// TypeScript knows all your translation keys!
ctx.t("greeting", { name: "John" });  // ✅ Autocomplete
ctx.t("buttons.start");                // ✅ Autocomplete

// And checks required variables
ctx.t("greeting", { name: "John" });  // ✅ OK
ctx.t("greeting");                     // ❌ Error: missing 'name'
```

## How it works

The generated file uses **module augmentation** to override the library's default types:

```typescript
declare module "grammy-i18n" {
  export type { TranslationKey, VariablesFor };
}
```

This means TypeScript will use your generated types instead of the library's generic `string` type.

## When to regenerate

Run `grammy-i18n-generate` whenever you:
- Add new translation keys
- Remove translation keys
- Add/change variables in translations
- Add new locales

## Important

- ⚠️ **DO NOT** edit `types.ts` manually - it will be overwritten
- ✅ **DO** commit this file to version control (so other developers get types)
- ✅ **DO** regenerate after changing YAML files
- ✅ **DO** add to your `tsconfig.json` include
