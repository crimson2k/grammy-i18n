# Grammy I18N

Internationalization (i18n) plugin for [Grammy](https://grammy.dev) Telegram bot framework with **type-safe translations**.

## Features

- **YAML-based** - Easy-to-edit translation files with nested structure support
- **Variable interpolation** - Use `{{ variable }}` syntax in translations
- **Multiple locales** - Support for any number of languages
- **Flexible structure** - Flat or nested translation file organization
- **Grammy middleware** - Seamless integration with Grammy bot framework
- **Locale-aware filters** - `hears()` and `hearsAny()` for multilingual button/command handling
- **TypeScript support** - Full type definitions included

## Installation

```bash
# Using npm
npm install grammy-i18n

# Using Bun
bun add grammy-i18n

# Using pnpm
pnpm add grammy-i18n

# Using yarn
yarn add grammy-i18n
```

## Quick Start

### 1. Create translation files

Create a `locales` directory with YAML files for each language:

```yaml
# locales/en.yaml
greeting: "Hello, {{ name }}!"
welcome: "Welcome to our bot!"
buttons:
  start: "Start"
  help: "Help"
```

```yaml
# locales/ru.yaml
greeting: "Привет, {{ name }}!"
welcome: "Добро пожаловать в наш бот!"
buttons:
  start: "Начать"
  help: "Помощь"
```

### 2. Set up the bot

```typescript
import { Bot } from "grammy";
import { I18N, I18NMiddleware } from "grammy-i18n";

// Create I18N instance
const i18n = new I18N({
  localesDir: "./locales",
  defaultLocale: "en"
});

// Load translations
await i18n.load();

// Create bot
const bot = new Bot("YOUR_BOT_TOKEN");

// Add I18N middleware
bot.use(I18NMiddleware(i18n, (ctx) => {
  // Get user's language (from Telegram or your database)
  return ctx.from?.language_code ?? "en";
}));

// Use translations in handlers
bot.command("start", (ctx) => {
  const name = ctx.from?.first_name ?? "User";
  ctx.reply(ctx.t("greeting", { name }));
});

bot.start();
```

That's it! Your bot now supports multiple languages.

## API Reference

### `I18N` Class

Main class for managing translations.

```typescript
const i18n = new I18N({
  localesDir: "./locales",  // Path to translation files
  defaultLocale: "en"        // Fallback locale
});

await i18n.load();  // Load all translations (must be called before use)
```

**Methods:**

- `async load()` - Load all translation files
- `setLocale(locale: string)` - Set current locale
- `getLocale()` - Get current locale
- `t(key: string, variables?)` - Translate a key with optional variables
- `hasLocale(locale: string)` - Check if locale exists
- `getAvailableLocales()` - Get array of available locales

### Middlewares

#### `I18NMiddleware`

Dynamic locale per user based on a callback function.

```typescript
bot.use(I18NMiddleware(i18n, (ctx) => {
  // Return user's locale from context, database, etc.
  return ctx.from?.language_code ?? "en";
}));
```

#### `ConstI18NMiddleware`

Fixed locale for all users.

```typescript
bot.use(ConstI18NMiddleware(i18n, "ru"));
```

Both middlewares add `ctx.t()` and `ctx.i18n` to the context.

### Context Methods

After adding middleware, you can use:

```typescript
ctx.t(key: string, variables?: Record<string, string | number | boolean>): string
```

Example:
```typescript
bot.command("start", (ctx) => {
  ctx.reply(ctx.t("welcome"));
  ctx.reply(ctx.t("greeting", { name: ctx.from.first_name }));
});
```

### Filters

#### `hears(key)`

Match message text against translation in any locale.

```typescript
import { hears } from "grammy-i18n";

// Matches "Start" (en) or "Начать" (ru)
bot.filter(hears("buttons.start"), (ctx) => {
  ctx.reply("You clicked Start!");
});
```

#### `hearsAny(keys)`

Match message text against multiple translation keys.

```typescript
import { hearsAny } from "grammy-i18n";

bot.filter(hearsAny(["buttons.yes", "buttons.no"]), (ctx) => {
  // Handles both buttons in any language
});
```

## Translation File Structure

### Flat Structure

Each locale is a single file:

```
locales/
├── en.yaml
├── ru.yaml
└── uk.yaml
```

### Nested Structure

Each locale is a directory with namespace files:

```
locales/
├── en/
│   ├── common.yaml
│   ├── buttons.yaml
│   └── errors.yaml
└── ru/
    ├── common.yaml
    ├── buttons.yaml
    └── errors.yaml
```

In nested structure, files become namespaces:
```typescript
ctx.t("common.welcome")      // from common.yaml
ctx.t("buttons.start")       // from buttons.yaml
```

### Mixed Structure

You can also mix both approaches:

```
locales/
├── en.yaml           # Flat file
└── ru/               # Nested directory
    ├── main.yaml
    └── buttons.yaml
```

## Variable Interpolation

Use `{{ variableName }}` in translations:

```yaml
# locales/en.yaml
welcome: "Welcome, {{ name }}!"
items_count: "You have {{ count }} items"
profile: "{{ firstName }} {{ lastName }}, {{ age }} years old"
```

```typescript
ctx.t("welcome", { name: "John" });
// "Welcome, John!"

ctx.t("items_count", { count: 5 });
// "You have 5 items"

ctx.t("profile", { firstName: "John", lastName: "Doe", age: 30 });
// "John Doe, 30 years old"
```

## Examples

See the [examples](./examples) directory for complete working examples:

- [Basic bot](./examples/basic.ts) - Simple bot with translations
- [Multi-language buttons](./examples/buttons.ts) - Keyboard with locale-aware buttons
- [User preferences](./examples/user-locale.ts) - Store user's language preference

## Advanced Usage

### Nested Keys

Use dot notation for nested translations:

```yaml
# locales/en.yaml
user:
  profile:
    title: "User Profile"
    bio: "Biography"
  settings:
    title: "Settings"
```

```typescript
ctx.t("user.profile.title")    // "User Profile"
ctx.t("user.settings.title")   // "Settings"
```

### Fallback Behavior

If a translation is not found:
1. Tries current locale
2. Falls back to `defaultLocale`
3. Returns the key itself if still not found

```typescript
// If "missing.key" doesn't exist in ru or en
ctx.t("missing.key")  // Returns "missing.key"
```

### Direct I18N Usage (without middleware)

```typescript
const i18n = new I18N({
  localesDir: "./locales",
  defaultLocale: "en"
});

await i18n.load();

i18n.setLocale("ru");
console.log(i18n.t("greeting", { name: "Иван" }));
// "Привет, Иван!"
```

## TypeScript

The library is written in TypeScript and provides full type safety:

```typescript
import type { I18NFlavor, TranslationKey } from "grammy-i18n";
import type { Context } from "grammy";

// Extend your context type
type MyContext = Context & I18NFlavor;

const bot = new Bot<MyContext>("TOKEN");
```

## Requirements

- [Grammy](https://grammy.dev) ^1.0.0
- [yaml](https://github.com/eemeli/yaml) ^2.4.0

## Runtime Support

This library works with:
- Bun (recommended)
- Node.js
- Deno

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- [GitHub Issues](https://github.com/crimson2k/grammy-i18n/issues)
- [Grammy Community](https://grammy.dev/resources/faq.html#how-can-i-get-help)
