# 📦 Инструкция по публикации в npm

## Подготовка к публикации

### 1. Проверка структуры пакета

```bash
# Проверить, что будет опубликовано
npm pack --dry-run

# Должны быть:
# ✅ dist/ - все скомпилированные файлы (.js, .d.ts, .js.map, .d.ts.map)
# ✅ README.md
# ✅ LICENSE
# ✅ package.json
# ❌ НЕТ: src/, examples/, locales/, tsconfig.json
```

### 2. Проверка сборки

```bash
# Чистая сборка
bun run clean && bun run build

# Проверить, что dist/ создан корректно
ls -la dist/
```

### 3. Проверка типов

```bash
# Проверить, что .d.ts файлы созданы
find dist -name "*.d.ts"

# Должны быть:
# dist/index.d.ts - главный файл типов
# dist/types/index.d.ts - типы
# dist/i18n.d.ts
# dist/hears.d.ts
# dist/loader.d.ts
# dist/interpolator.d.ts
# dist/middlewares/i18n.d.ts
# dist/cli/generate.d.ts
```

### 4. Проверка CLI

```bash
# Проверить, что CLI работает после сборки
node dist/cli/generate.js --help
```

## Публикация

### Первая публикация

```bash
# 1. Авторизоваться в npm (если ещё не авторизованы)
npm login

# 2. Проверить, что название свободно
npm search grammy-i18n

# 3. Опубликовать
npm publish

# Если хотите сделать scoped пакет (@yourname/grammy-i18n):
# npm publish --access public
```

### Обновление версии

```bash
# Patch (0.1.0 -> 0.1.1) - bugfix
npm version patch

# Minor (0.1.0 -> 0.2.0) - новая функциональность
npm version minor

# Major (0.1.0 -> 1.0.0) - breaking changes
npm version major

# Затем опубликовать
npm publish
```

## Автоматизация публикации

### Используя GitHub Actions

Создайте файл `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Build
        run: bun run build
      
      - name: Publish to npm
        uses: JS-DevTools/npm-publish@v3
        with:
          token: ${{ secrets.NPM_TOKEN }}
```

### Настройка NPM_TOKEN

1. Получите токен на https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Добавьте его в GitHub Secrets вашего репозитория

## Проверка после публикации

```bash
# Установить пакет в тестовый проект
mkdir test-install
cd test-install
npm init -y
npm install grammy-i18n

# Проверить, что типы доступны
cat node_modules/grammy-i18n/package.json
ls node_modules/grammy-i18n/dist/

# Проверить импорты
node -e "import('grammy-i18n').then(m => console.log(Object.keys(m)))"
```

## Что публикуется

### ✅ Включено в пакет:

- `dist/**/*` - все скомпилированные файлы
  - `*.js` - JavaScript файлы
  - `*.d.ts` - TypeScript декларации
  - `*.js.map` - Source maps для JS
  - `*.d.ts.map` - Source maps для типов
- `README.md` - документация
- `LICENSE` - лицензия
- `package.json` - манифест пакета

### ❌ НЕ включено (через .npmignore):

- `src/` - исходный TypeScript код
- `examples/` - примеры использования
- `locales/` - примеры переводов
- `tsconfig.json`, `tsconfig.build.json` - конфиги TypeScript
- `.github/`, `.vscode/` - настройки IDE и CI
- `node_modules/` - зависимости
- Тесты и прочие dev-файлы

## Важные моменты

### 1. Source Maps включены

Source maps (`.js.map`, `.d.ts.map`) помогают:
- Отладке в production
- IDE показывает правильные типы
- Stack traces указывают на правильные строки

### 2. Типы TypeScript

Пакет экспортирует полные типы через:
```json
{
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts"
    }
  }
}
```

Пользователи получат:
- ✅ Autocomplete для всех функций
- ✅ Type checking
- ✅ IntelliSense в IDE

### 3. CLI команда

После установки доступна команда:
```bash
npx grammy-i18n-generate
```

Указывает на: `./dist/cli/generate.js`

### 4. Совместимость

Пакет работает с:
- ✅ Node.js >= 18
- ✅ Bun
- ✅ ESM modules
- ✅ TypeScript projects
- ✅ JavaScript projects

## Checklist перед публикацией

- [ ] Версия обновлена (`npm version`)
- [ ] Проект собран (`bun run build`)
- [ ] Нет ошибок TypeScript
- [ ] CLI работает (`node dist/cli/generate.js --help`)
- [ ] README.md актуален
- [ ] CHANGELOG.md обновлён (если есть)
- [ ] Все коммиты запушены
- [ ] Тесты проходят (когда будут добавлены)
- [ ] `npm pack --dry-run` показывает правильные файлы

## Команды для быстрой публикации

```bash
# Полный цикл релиза
bun run clean && \
bun run build && \
node dist/cli/generate.js --help && \
npm version patch && \
git push && git push --tags && \
npm publish
```

## Проблемы и решения

### "Cannot find module" после установки

**Проблема:** Пользователи не могут импортировать пакет

**Решение:** Проверьте, что в package.json правильно указаны:
- `main` - указывает на JS файл
- `types` - указывает на .d.ts файл
- `exports` - настроен правильно

### Типы не работают в TypeScript

**Проблема:** IDE не показывает autocomplete

**Решение:** 
- Проверьте наличие `dist/**/*.d.ts` файлов
- Убедитесь, что `.d.ts.map` файлы тоже опубликованы
- Проверьте `tsconfig.json` пользователя

### CLI команда не найдена

**Проблема:** `grammy-i18n-generate` не работает

**Решение:**
- Проверьте shebang в `dist/cli/generate.js`: `#!/usr/bin/env node`
- Убедитесь, что файл имеет права на выполнение
- Проверьте `bin` в package.json

## Дополнительно

### Тестирование пакета локально

```bash
# Создать .tgz файл
npm pack

# Установить в другой проект
cd ../test-project
npm install ../grammy-i18n/grammy-i18n-0.1.0.tgz
```

### Отмена публикации

```bash
# Можно отменить в течение 72 часов
npm unpublish grammy-i18n@0.1.0

# ⚠️ ВНИМАНИЕ: Это удалит версию навсегда!
# Используйте только в крайних случаях
```

### Deprecate версии

```bash
# Пометить версию как устаревшую (не удаляя)
npm deprecate grammy-i18n@0.1.0 "Use version 0.2.0 instead"
```
