# Locales

This directory contains example translation files for demonstration and testing purposes.

## Structure

```
locales/
├── en.yaml         # English translations (example)
├── ru.yaml         # Russian translations (example)
└── generated/      # Auto-generated TypeScript types (gitignored)
    └── types.ts
```

## For Library Users

When you install `grammy-i18n` in your project, create your own `locales/` directory in your project root with your translation files.

Example:

```yaml
# locales/en.yaml
greeting: "Hello, {{ name }}!"
welcome: "Welcome!"
buttons:
  start: "Start"
  help: "Help"
```

Then generate types:

```bash
bunx grammy-i18n-generate
```

This will create `locales/generated/types.ts` with TypeScript definitions for autocomplete.

## For Contributors

These example files are used for testing the type generation system. The `generated/` folder is gitignored and should be regenerated locally when needed.

To regenerate types:

```bash
bun run i18n:generate
```
