# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **grammy-i18n**, a standalone internationalization (i18n) plugin for the Grammy Telegram bot framework. It provides:
- YAML-based translation file loading with nested structures
- Variable interpolation in translation strings (using `{{ variable }}` syntax)
- Grammy middleware for adding `ctx.t()` translation method to bot contexts
- Type-safe translation keys and variables via auto-generated TypeScript types
- Locale-aware filters (`hears`, `hearsAny`) for handling multilingual button/command matching

## Development Commands

**Run the project:**
```bash
bun run index.ts
```

**Install dependencies:**
```bash
bun install
```


**No tests are currently configured** (no test files found in codebase).

## Architecture

### Core Components

**`I18N` class** (`src/i18n.ts`):
- Main class for managing translations
- Loads YAML files from `localesDir` via `loadTranslations()`
- Provides `t(key, variables?)` method for translation with fallback to `defaultLocale`
- Supports dot notation for nested keys (e.g., `"user.profile.title"`)

**Translation Loader** (`src/loader.ts`):
- Recursively scans directory for `.yaml`/`.yml` files
- Supports two structures:
  - Flat: `en.yaml` → locale "en"
  - Nested: `en/user.yaml` → locale "en" with namespace "user"
- Uses `Bun.file()` for file reading and `yaml` package for parsing
- Deep merges translations from multiple files per locale

**Middlewares** (`src/middlewares/i18n.ts`):
- `I18NMiddleware(i18n, languageGetter)`: Dynamic locale per user via callback function
- `ConstI18NMiddleware(i18n, locale)`: Fixed locale for all users
- Both add `ctx.t()` and `ctx.i18n` to Grammy context

**Filters** (`src/hears.ts`):
- `hears(key)`: Matches message text against translation in any locale
- `hearsAny(keys)`: Matches against multiple translation keys
- Useful for handling multilingual button clicks

**Interpolator** (`src/interpolator.ts`):
- Replaces `{{ variableName }}` placeholders with actual values
- Missing variables are left as placeholders (not replaced)

### Type System

**Generated Types** (`locales/generated/types.ts`):
- Auto-generated from YAML translation files
- Provides autocomplete for translation keys and required variables
- Must be regenerated when YAML files change

**Type Exports** (`src/types/index.ts`):
- `I18NFlavor`: Grammy context extension with `ctx.t()` and `ctx.i18n`
- `TranslationKey`: Union of all translation keys (from generated types)
- `VariablesFor<K>`: Variables required for key K (from generated types)
- `I18NConfig`: Configuration object for `new I18N()`
- `LanguageGetter<C>`: Function type for getting user's locale from context

## Translation File Structure

Translations are stored in `./locales/` (configurable via `I18NConfig.localesDir`).

**Example structure:**
```
locales/
├── en.yaml              # Flat file for English
├── ru.yaml              # Flat file for Russian
└── uk/                  # Nested directory for Ukrainian
    ├── user.yaml        # Namespace: "user"
    └── buttons.yaml     # Namespace: "buttons"
```

**YAML format with variables:**
```yaml
# en.yaml
greeting: "Hello, {{ name }}!"
user:
  welcome: "Welcome to {{ botName }}"
  profile:
    title: "User Profile"
```


## Usage Pattern

```typescript
import { I18N, I18NMiddleware } from "grammy-i18n";
import { Bot } from "grammy";

const i18n = new I18N({
  localesDir: "./locales",
  defaultLocale: "en"
});

await i18n.load(); // Must be called before using translations

const bot = new Bot("TOKEN");

// Add middleware with dynamic locale detection
bot.use(I18NMiddleware(i18n, (ctx) => ctx.from?.language_code ?? "en"));

// Use ctx.t() in handlers
bot.command("start", (ctx) => {
  ctx.reply(ctx.t("greeting", { name: ctx.from.first_name }));
});
```

## Key Implementation Details

- The project uses **Bun** as the runtime (not Node.js)
- Strict TypeScript configuration with `"strict": true` and `noUncheckedIndexedAccess`
- Module system: `"module": "Preserve"` with `"moduleResolution": "bundler"`
- The `I18N` class throws an error if `t()` is called before `load()`
- Missing translations fall back to `defaultLocale`, then to the key itself
- The middleware creates locale-specific I18N instances using `Object.create()` to avoid mutating the shared instance
