# Grammy I18N Plugin

A standalone internationalization (i18n) plugin for [Grammy](https://grammy.dev/) Telegram bot framework. Provides multilingual support with YAML-based translations, nested structures, and variable interpolation.

## Features

- 🌍 **Multi-language support** - Easy management of multiple locales
- 📁 **Flexible file structure** - Support for both flat (`en.yaml`) and nested (`en/user.yaml`) structures
- 🔤 **Variable interpolation** - Dynamic content with `{{ variable }}` syntax
- 🎯 **Type-safe** - Full TypeScript support with auto-generated types from YAML
- ✨ **Autocomplete** - IDE autocomplete for translation keys and variables
- 🔌 **Standalone** - Fully portable, can be used in any Grammy project
- 🚀 **Two middleware modes** - Constant locale or dynamic locale selection

## Installation

This plugin is fully self-contained and portable. To use in your project:

1. **Copy the entire `i18n` directory** to your project:
   ```
   your-project/
   └── src/
       └── plugins/
           └── i18n/          # Copy this entire directory
               ├── scripts/   # Includes type generator
               ├── middlewares/
               ├── types/
               ├── i18n.ts
               ├── loader.ts
               ├── interpolator.ts
               ├── index.ts
               └── README.md
   ```

2. **Install dependency:**
   ```bash
   bun add yaml
   # or
   npm install yaml
   ```

3. **Add npm script** to your `package.json`:
   ```json
   {
     "scripts": {
       "i18n:generate": "bun run src/plugins/i18n/scripts/generate-types.ts"
     }
   }
   ```

## Quick Start

### 1. Create translation files

Create a `locales` directory with your translation files:

```
locales/
├── en.yaml
├── ru.yaml
└── uk/
    └── user.yaml
```

**locales/en.yaml:**
```yaml
greeting: Hello!
welcome: Welcome, {{ name }}!
user:
  profile: User Profile
  settings: Settings
```

**locales/ru.yaml:**
```yaml
greeting: Привет!
welcome: Добро пожаловать, {{ name }}!
user:
  profile: Профиль пользователя
  settings: Настройки
```

**locales/uk/user.yaml:**
```yaml
profile: Профіль користувача
settings: Налаштування
```

### 2. Initialize I18N

```typescript
import { Bot } from "grammy";
import { I18N, I18NMiddleware } from "./plugins/i18n";
import type { I18NFlavor } from "./plugins/i18n";

// Create bot with I18N flavor
type MyContext = Context & I18NFlavor;
const bot = new Bot<MyContext>("YOUR_BOT_TOKEN");

// Initialize I18N
const i18n = new I18N({
  localesDir: "./locales",
  defaultLocale: "en"
});

// Load translations (must be called before using middleware)
await i18n.load();

// Use middleware
bot.use(I18NMiddleware(i18n, (ctx) => {
  // Get user's language (from database, context, etc.)
  return ctx.user?.langCode || "en";
}));

// Use translations in handlers
bot.command("start", (ctx) => {
  ctx.reply(ctx.t("greeting"));
  ctx.reply(ctx.t("welcome", { name: ctx.from.first_name }));
});

bot.start();
```

## API Reference

### I18N Class

Main class for managing translations.

#### Constructor

```typescript
new I18N(config: I18NConfig)
```

**Parameters:**
- `config.localesDir` - Path to directory containing locale files
- `config.defaultLocale` - Default locale code (e.g., "en", "ru")

#### Methods

##### `load(): Promise<void>`

Loads all translation files from the locales directory. Must be called before using translations.

```typescript
const i18n = new I18N({
  localesDir: "./locales",
  defaultLocale: "en"
});

await i18n.load();
```

##### `t(key: string, variables?: Variables): string`

Translates a key with optional variable interpolation.

```typescript
i18n.t("greeting") // "Hello!"
i18n.t("welcome", { name: "John" }) // "Welcome, John!"
i18n.t("user.profile") // "User Profile"
```

##### `setLocale(locale: string): void`

Sets the current locale.

```typescript
i18n.setLocale("ru");
i18n.t("greeting") // "Привет!"
```

##### `getLocale(): string`

Returns the current locale.

```typescript
const locale = i18n.getLocale(); // "en"
```

##### `hasLocale(locale: string): boolean`

Checks if a locale is available.

```typescript
if (i18n.hasLocale("uk")) {
  i18n.setLocale("uk");
}
```

##### `getAvailableLocales(): string[]`

Returns all available locales.

```typescript
const locales = i18n.getAvailableLocales(); // ["en", "ru", "uk"]
```

### Middlewares

#### I18NMiddleware

Dynamic locale selection using a callback function.

```typescript
I18NMiddleware<C extends Context>(
  i18n: I18N,
  languageGetter: (ctx: C) => string | Promise<string>
): MiddlewareFn<C & I18NFlavor>
```

**Example:**
```typescript
// Get language from user database
bot.use(I18NMiddleware(i18n, (ctx) => ctx.user.langCode));

// Get language from Telegram user settings
bot.use(I18NMiddleware(i18n, (ctx) => ctx.from?.language_code || "en"));
```

#### I18NConstMiddleware

Constant locale for all users (single-language bot).

```typescript
I18NConstMiddleware<C extends Context>(
  i18n: I18N,
  locale: string
): MiddlewareFn<C & I18NFlavor>
```

**Example:**
```typescript
// Always use Russian
bot.use(I18NConstMiddleware(i18n, "ru"));

bot.command("start", (ctx) => {
  ctx.reply(ctx.t("greeting")); // Always in Russian
});
```

### Types

#### I18NFlavor

Grammy context flavor that adds the `t()` method.

```typescript
interface I18NFlavor {
  t(key: string, variables?: Variables): string;
}
```

#### I18NConfig

Configuration options for I18N instance.

```typescript
interface I18NConfig {
  localesDir: string;
  defaultLocale: string;
}
```

#### Variables

Object for variable interpolation.

```typescript
type Variables = Record<string, string | number | boolean>;
```

## Type Generation & Autocomplete

The plugin includes a powerful type generator that creates TypeScript types from your YAML files, providing **IDE autocomplete** for both translation keys and variables!

### Generate Types

After adding or modifying YAML translation files, run:

```bash
bun run i18n:generate
```

This will scan all YAML files in `locales/` and generate TypeScript types in `locales/generated/types.ts`.

### What You Get

**Before (no autocomplete):**
```typescript
ctx.t("user.welcome.start", { fullName: user.name }); // No IDE hints, easy to make typos
```

**After (with autocomplete):**
```typescript
ctx.t("user.welcome.start", { fullName: user.name });
//      ^                      ^
//      |                      |
//      |                      +-- IDE shows required variables: fullName
//      +-- IDE shows all available keys with autocomplete!
```

### Generated Types Structure

```typescript
// locales/generated/types.ts

export type TranslationKey =
  | "common.greeting"
  | "common.bye"
  | "user.welcome.start"
  | ... // all your keys

export type TranslationVariables = {
  "user.welcome.start": { fullName: string | number | boolean };
  // Only keys with variables are listed
};

export type VariablesFor<K extends TranslationKey> = ...;
```

### Workflow

1. **Add/modify** YAML translations:
   ```yaml
   # locales/ru/messages.yaml
   notification:
     new_message: "{{ count }} новых сообщений от {{ sender }}"
   ```

2. **Generate types**:
   ```bash
   bun run i18n:generate
   ```

3. **Use with autocomplete**:
   ```typescript
   ctx.t("messages.notification.new_message", {
     count: 5,
     sender: "Admin"
   }); // Full IDE autocomplete for key and required variables!
   ```

### Integration with CI/CD

Add type generation to your build process:

```json
{
  "scripts": {
    "build": "bun run i18n:generate && bun build src/main.ts",
    "dev": "bun run i18n:generate && bun run --watch src/main.ts"
  }
}
```

Or add a pre-commit hook to ensure types are always up to date.

## File Structure Patterns

### Flat Structure

Simple structure with one file per locale:

```
locales/
├── en.yaml
├── ru.yaml
└── uk.yaml
```

**en.yaml:**
```yaml
greeting: Hello!
user:
  profile: Profile
  settings: Settings
```

### Nested Structure

Organized structure with subdirectories:

```
locales/
├── en/
│   ├── common.yaml
│   └── user.yaml
├── ru/
│   ├── common.yaml
│   └── user.yaml
```

**en/common.yaml:**
```yaml
greeting: Hello!
welcome: Welcome!
```

**en/user.yaml:**
```yaml
profile: Profile
settings: Settings
```

**Result:**
```yaml
# Merged structure
common:
  greeting: Hello!
  welcome: Welcome!
user:
  profile: Profile
  settings: Settings
```

### Mixed Structure

Combination of flat and nested:

```
locales/
├── en.yaml
├── ru.yaml
├── uk/
│   ├── user.yaml
│   └── admin.yaml
```

## Variable Interpolation

Use `{{ variableName }}` syntax in your translations:

```yaml
# en.yaml
welcome: Welcome, {{ name }}!
message_count: You have {{ count }} new messages
order_status: Order #{{ orderId }} is {{ status }}
```

```typescript
ctx.t("welcome", { name: "Alice" })
// "Welcome, Alice!"

ctx.t("message_count", { count: 5 })
// "You have 5 new messages"

ctx.t("order_status", { orderId: 12345, status: "delivered" })
// "Order #12345 is delivered"
```

## Nested Keys

Access nested translations using dot notation:

```yaml
# en.yaml
user:
  profile:
    title: User Profile
    edit: Edit Profile
  settings:
    title: Settings
    language: Language
```

```typescript
ctx.t("user.profile.title") // "User Profile"
ctx.t("user.settings.language") // "Language"
```

## Advanced Usage

### Message Filters with `hears()`

The `hears()` function allows you to match user messages against translated text, making it easy to handle buttons and commands in multiple languages.

**Translation files:**
```yaml
# ru.yaml
buttons:
  catalog: Каталог
  settings: Настройки
  back: Назад

# en.yaml
buttons:
  catalog: Catalog
  settings: Settings
  back: Back
```

**Usage:**
```typescript
import { hears, hearsAny } from "./plugins/i18n";

// Match single button - no need to pass i18n!
bot.filter(hears("buttons.catalog"), (ctx) => {
  // Triggered when user clicks "Каталог" (ru) or "Catalog" (en)
  ctx.reply(ctx.t("catalog.opening"));
});

// Match multiple buttons
bot.filter(hearsAny(["buttons.back", "buttons.cancel"]), (ctx) => {
  // Triggered for either button in any language
  ctx.reply(ctx.t("returning_to_menu"));
});
```

**With TypeScript autocomplete:**
```typescript
bot.filter(hears("buttons.catalog"), async (ctx) => {
//                ^-- Autocomplete shows all available keys!
  await ctx.reply("Opening catalog...");
});
```

**Benefits:**
- ✅ Automatic multi-language support
- ✅ Type-safe translation keys
- ✅ No need to hardcode button text
- ✅ Works with all locales simultaneously

### Language Switcher

```typescript
import { InlineKeyboard } from "grammy";

bot.command("language", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("🇬🇧 English", "lang_en")
    .text("🇷🇺 Русский", "lang_ru")
    .text("🇺🇦 Українська", "lang_uk");

  await ctx.reply(ctx.t("select_language"), {
    reply_markup: keyboard
  });
});

bot.callbackQuery(/^lang_(.+)$/, async (ctx) => {
  const locale = ctx.match[1];

  // Update user's language in database
  await updateUserLanguage(ctx.from.id, locale);

  await ctx.answerCallbackQuery(ctx.t("language_changed"));
  await ctx.editMessageText(ctx.t("language_set", { lang: locale }));
});
```

### Fallback Behavior

If a translation key is not found:
1. Tries current locale
2. Falls back to default locale
3. Returns the key itself if not found

```typescript
i18n.setLocale("ru");

// If "missing.key" doesn't exist in Russian
ctx.t("missing.key")
// 1. Checks ru.yaml
// 2. Checks en.yaml (default)
// 3. Returns "missing.key"
```

### Type Safety

For better type safety, extend your context:

```typescript
import type { Context } from "grammy";
import type { I18NFlavor } from "./plugins/i18n";
import type { UserSelect } from "./database/models/user";

interface MyContextFlavor {
  user: UserSelect;
}

type MyContext = Context & MyContextFlavor & I18NFlavor;

const bot = new Bot<MyContext>("TOKEN");
```

## Portability

This plugin is completely standalone and can be easily moved between projects:

1. Copy the `i18n` directory to your new project
2. Install the `yaml` dependency
3. Create your `locales` directory
4. Import and use as shown above

No external dependencies on project-specific code!

## Error Handling

The plugin throws errors in these cases:

- **Locales directory not found**: Check `localesDir` path
- **Default locale not found**: Ensure default locale file exists
- **I18N not loaded**: Call `await i18n.load()` before using
- **Invalid locale in I18NConstMiddleware**: Locale must exist in translations

```typescript
try {
  await i18n.load();
} catch (error) {
  console.error("Failed to load translations:", error);
  process.exit(1);
}
```

## Best Practices

1. **Load once**: Call `i18n.load()` once at startup
2. **Organize keys**: Use nested structures for related translations
3. **Use dot notation**: `user.profile.title` instead of `user_profile_title`
4. **Consistent naming**: Use snake_case or camelCase consistently
5. **Default locale**: Always provide a complete default locale as fallback
6. **Variable names**: Use descriptive variable names in templates

## License

This plugin is part of your project and follows your project's license.

## Support

For issues or questions, refer to:
- [Grammy Documentation](https://grammy.dev/)
- [YAML Syntax](https://yaml.org/)
