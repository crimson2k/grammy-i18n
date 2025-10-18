# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - Simplified (Unreleased)

### Removed

- **Type generation system** - Removed CLI tool (`grammy-i18n-generate`) and all type generation functionality
- **Global interface augmentation** - No longer uses `GrammyI18NTranslations` global interface
- **CLI commands** - Removed `bin` entry from package.json
- **Type generation scripts** - Removed `src/cli/` and `src/scripts/` directories

### Changed

- **Simplified types** - `TranslationKey` is now simply `string` (no autocomplete)
- **Simplified `VariablesFor`** - Now `Record<string, string | number | boolean> | undefined`
- **Cleaner package** - Smaller size, fewer dependencies concerns
- **Updated documentation** - Removed all references to type generation from README

### Why?

The type generation system added complexity without guaranteed value. This version focuses on:
- Simple, straightforward usage
- Easier to understand and maintain
- No additional build steps required
- Works out of the box

Translation keys are passed as plain strings. TypeScript provides basic type safety through the function signatures.

## [0.1.3] - Previous version

Had type generation system (removed).
