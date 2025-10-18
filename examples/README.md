# Examples

This directory contains working examples of how to use Grammy I18N plugin.

## Running Examples

1. Install dependencies:
```bash
bun install
```

2. Create translation files in `./locales/` directory (see examples in each file for reference)

3. Set your bot token:
```bash
export BOT_TOKEN="your-bot-token-here"
```

4. Run an example:
```bash
bun run examples/basic.ts
```

## Available Examples

### 1. Basic Usage (`basic.ts`)

The simplest example showing:
- How to initialize I18N
- How to add middleware
- How to use `ctx.t()` in command handlers
- Variable interpolation

**Good for:** Getting started, understanding the basics

### 2. Multilingual Buttons (`buttons.ts`)

Shows how to work with keyboards:
- Creating inline keyboards with translated labels
- Handling callback queries
- Using `hears()` filter for text-based buttons
- Supporting multiple languages for the same buttons

**Good for:** Building bots with interactive keyboards

### 3. User Language Preferences (`user-locale.ts`)

Advanced example demonstrating:
- Storing user's language choice
- Language selection menu
- Custom language getter function
- Persisting preferences across sessions

**Good for:** Building production bots where users can choose their language

## Translation Files

All examples expect translation files in `./locales/` directory. Each example file includes sample YAML structures in comments.

Example structure:
```
locales/
├── en.yaml
├── ru.yaml
└── uk.yaml
```

## Need Help?

- Check the main [README](../README.md) for detailed documentation
- Read inline comments in example files
- Visit [Grammy documentation](https://grammy.dev)
