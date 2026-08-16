# Subscription Page

Кастомная subscription page для [Remnawave](https://remna.st/) — страница подписки и выдача конфигов клиентам.

Форк с доработками: мерж связанных подписок, русский формат трафика в remarks, CI → Docker Hub.

## Быстрый старт

1. Скопируй `.env.sample` → `.env` и заполни минимум:

```env
REMNAWAVE_PANEL_URL=https://your-panel.example.com
REMNAWAVE_API_TOKEN=your_api_token
```

2. Запуск из готового образа:

```bash
docker compose -f docker-compose-prod.yml up -d
```

Образ: `frvrsd/subscription-page:latest` (переопределяется через `DOCKERHUB_USERNAME` в `.env`).

Сервис слушает `127.0.0.1:3010`. Сеть `remnawave-network` должна уже существовать (как у панели).

### Сборка локально

```bash
# frontend
cd frontend && npm ci && npm run start:build && cd ..

# образ
docker compose up -d --build
```

## Конфигурация

### Обязательные

| Переменная | Описание |
| --- | --- |
| `REMNAWAVE_PANEL_URL` | URL панели (`http://remnawave:3000` или публичный HTTPS) |
| `REMNAWAVE_API_TOKEN` | API token из Remnawave → Settings → API Tokens |
| `APP_PORT` | Порт приложения (по умолчанию `3010`) |

### Прокси и путь

| Переменная | Default | Описание |
| --- | --- | --- |
| `CUSTOM_SUB_PREFIX` | _(пусто)_ | Префикс пути без `/` по краям (например `sub`) |
| `TRUST_PROXY` | `1` | Express `trust proxy` — сколько hop’ов доверять для реального IP |
| `CADDY_AUTH_API_TOKEN` | | `X-Api-Key` к панели (Caddy Security / Tiny Auth) |
| `CLOUDFLARE_ZERO_TRUST_CLIENT_ID` / `_SECRET` | | Cloudflare Zero Trust к панели |

### Мерж связанных подписок (`linked_subs` в metadata)

| Переменная | Default | Описание |
| --- | --- | --- |
| `MERGE_MIHOMO` | `false` | Мерж в Mihomo/Clash YAML (`proxies` + inline `proxy-providers`) |
| `MERGE_MIHOMO_PROXY_GROUPS` | `false` | Также добавить имена в `proxy-groups` (нужен `MERGE_MIHOMO`) |
| `MERGE_BASE64` | `false` | Мерж base64-списков прокси |
| `MERGE_XRAY_HOSTS` | `false` | Мерж host-конфигов в Xray JSON-массив |
| `MERGE_XRAY_OUTBOUNDS` | `false` | Инжект outbounds в каждый Xray-конфиг (дедуп по `tag`) |
| `MERGE_HOSTS_POSITION` | `end` | Куда вставлять: `start` · `upper_middle` · `middle` · `end` |

### Трафик и fingerprint

| Переменная | Default | Описание |
| --- | --- | --- |
| `APPEND_TRAFFIC_LEFT` | `false` | Дописать значение header `traffic-left` к remarks связанных хостов. Единицы → русские (`Гб`, `Мб`, …); unlimited → `- ∞ | ∞` |
| `OVERRIDE_FINGERPRINT_PER_OS` | `false` | Reality `fingerprint` по OS клиента (`x-device-os` / User-Agent, fallback `firefox`) |

**Пример header в панели Remnawave:**

```text
traffic-left = - {{TRAFFIC_LEFT}} | {{TOTAL_TRAFFIC}}
```

В remark уйдёт, например: `- 12.5 Гб | 100 Гб` или `- ∞ | ∞`.

### Marzban legacy

| Переменная | Default | Описание |
| --- | --- | --- |
| `MARZBAN_LEGACY_LINK_ENABLED` | `false` | Поддержка старых Marzban-ссылок |
| `MARZBAN_LEGACY_SECRET_KEY` | | Секрет(ы) Marzban |
| `MARZBAN_LEGACY_SUBSCRIPTION_VALID_FROM` | | ISO-дата, с которой считать подписки валидными |

Полный список — в [`.env.sample`](.env.sample).

## Docker Hub / CI

GitHub Actions собирают образ и пушат в Docker Hub от имени owner репозитория (`frvrsd`).

| Триггер | Теги |
| --- | --- |
| Push тега | `frvrsd/subscription-page:latest`, `:${tag}` (amd64 + arm64) |
| Push в `dev` | `frvrsd/subscription-page:dev`, `:${sha}` |

**Secret в GitHub** (Settings → Secrets and variables → Actions → **New repository secret**):

| Name | Value |
| --- | --- |
| `DOCKERHUB_TOKEN` | [Access Token](https://hub.docker.com/settings/security) с правами Read/Write/Delete |

Опционально `DOCKERHUB_USERNAME`, если логин на Hub отличается от GitHub owner.

## Стек

- Backend: NestJS
- Frontend: React + Vite + Mantine
- Runtime: Node + PM2 в Docker

## Лицензия

AGPL-3.0 — см. [`LICENCE`](LICENCE).

Документация Remnawave: [docs.rw](https://docs.rw) · [remna.st](https://remna.st/)
