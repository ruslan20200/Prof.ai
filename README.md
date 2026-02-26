# Prof.ai

Полноценная карьерная платформа с AI-функциями:

- подбор вакансий;
- mock interview с аналитикой;
- генерация резюме;
- авторизация и профиль пользователя.

Проект состоит из React-клиента (Vite) и Node.js API (Express), запускается как единое приложение.

## Технологии

- Frontend: React 19, TypeScript, Vite, TailwindCSS, Framer Motion, Zustand, Wouter
- Backend: Express, PostgreSQL (`pg`), JWT, bcrypt
- AI: OpenAI-совместимый endpoint (LM Studio / Azure Models / другие)
- Speech: Web Speech API + optional ElevenLabs

## Структура проекта

- `client/` — фронтенд (страницы, компоненты, хуки)
- `server/` — API и прод-сервер
- `shared/` — общие константы
- `infra/supabase/` — SQL-миграции и init-скрипты
- `scripts/free-api-port.mjs` — авто-очистка API порта перед `pnpm dev`

## Быстрый старт

### 1) Требования

- Node.js 20+
- pnpm 10+

### 2) Установка

```bash
pnpm install
```

### 3) Конфиг

```bash
copy .env.example .env
```

Заполните минимум:

- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_AI_API_KEY` (или локальный режим LM Studio)

### 4) Запуск dev

```bash
pnpm dev
```

Запускается одновременно:

- client: `http://localhost:3000` (или следующий свободный порт)
- api: `http://localhost:4001` (по `API_PORT`)

## Команды

- `pnpm dev` — локальный запуск client + api
- `pnpm check` — проверка TypeScript
- `pnpm build` — сборка client + server в `dist/`
- `pnpm start` — запуск production-сборки
- `pnpm preview` — превью клиента

## Переменные окружения (.env)

Полный шаблон: `.env.example`.

### Обязательные (для auth/API)

- `DATABASE_URL` — строка подключения PostgreSQL
- `JWT_SECRET` — секрет подписи JWT

### Основные AI

- `VITE_AI_BASE_URL` — базовый URL OpenAI-compatible API
- `VITE_AI_API_URL` — optional, полный URL endpoint `/chat/completions` (если задан — приоритетнее)
- `VITE_AI_MODEL` — имя модели
- `VITE_AI_API_KEY` — API ключ
- `VITE_GITHUB_TOKEN` — legacy fallback, можно не использовать

### Сеть в dev

- `API_PORT` — порт API dev-сервера (по умолчанию 4001)
- `VITE_API_PROXY_TARGET` — куда Vite проксирует `/api`

## Как работает Mock Interview

Страница `client/src/pages/Interview.tsx` состоит из 3 экранов:

1. Выбор вакансии
2. Чат интервью
3. Экран аналитики

Пайплайн:

1. `conductInterview(...)` генерирует вопросы по вакансии
2. Сообщения сохраняются в Zustand store (`interviewMessages`)
3. По завершению вызывается `analyzeInterview(...)`
4. JSON парсится и нормализуется, при ошибке применяется fallback-аналитика

Speech:

- STT: Web Speech Recognition (с авто-перезапуском после паузы до ручной остановки)
- TTS: ElevenLabs (если есть ключ) → fallback Web Speech Synthesis

## API endpoints

Базовый префикс: `/api`

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/onboarding-complete`
- `GET /api/health`

## База данных / Supabase

Для auth-only схемы:

1. Новый инстанс: применить `infra/supabase/auth_only_init.sql`
2. Если старая расширенная схема уже была:
	- сначала `infra/supabase/migrations/20260226_000003_auth_only_cleanup.sql`
	- затем `infra/supabase/auth_only_init.sql`

## Production

Сборка:

```bash
pnpm build
pnpm start
```

`pnpm start` запускает сервер из `dist/index.js`, который:

- отдает API
- отдает статические файлы клиента из `dist/public`
- обслуживает SPA routing через `index.html`

## Частые проблемы

### 1) `EADDRINUSE` на API порту

`pnpm dev` уже вызывает `scripts/free-api-port.mjs`, который освобождает `API_PORT` перед запуском.

Если проблема сохраняется — проверьте значение `API_PORT` и занятые порты в системе.

### 2) AI не отвечает

Проверьте:

- `VITE_AI_API_KEY`
- `VITE_AI_API_URL` / `VITE_AI_BASE_URL`
- `VITE_AI_MODEL`

### 3) Озвучка не работает

- Без `VITE_ELEVENLABS_API_KEY` используется браузерный TTS (бесплатно)
- В некоторых браузерах голос ограничен; лучше тестировать в Chrome/Edge

## Безопасность

- Не храните реальные ключи в репозитории.
- Используйте `.env` локально и `.env.example` как шаблон.
- Если секрет уже попал в git/чат — обязательно сделать rotate ключа.
