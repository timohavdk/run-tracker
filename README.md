# Run Tracker

Минималистичное PWA для учёта времени пробежек.

## Стек

- Vue 3 + TypeScript
- Vite
- SCSS CSS Modules
- vite-plugin-pwa
- vue-i18n (RU / EN)

## Возможности

- Таймер пробежки: старт, пауза, продолжение, завершение
- История последних 20 пробежек (localStorage)
- Переключение языка RU / EN
- Установка как PWA на телефон

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

После сборки приложение можно установить через браузер (Chrome: «Установить приложение»).

## Структура

```
src/
├── app/              # Корневой экран (vue + module.scss)
├── components/       # UI-компоненты (папка: vue + module.scss)
├── composables/      # Логика таймера
├── i18n/             # Переводы RU / EN
├── styles/           # Общие SCSS-токены
└── main.ts
```
