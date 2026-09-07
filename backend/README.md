# Route 53 Clone — Backend

FastAPI API for the Route 53 console clone: session-based auth, hosted zones,
and DNS records backed by SQLAlchemy + SQLite.

Interactive docs (dev): [http://localhost:8000/docs](http://localhost:8000/docs)

## Setup

```bash
cd backend
cp .env.example .env
poetry install
poetry run alembic upgrade head
poetry run python -m app.db.seed
poetry run uvicorn app.main:app --reload --port 8000
```

Demo credentials (from `.env`):

- Email: `demo@example.com`
- Password: `DemoPass123!`

### Docker

```bash
cd backend
docker compose up --build
```

SQLite lives in the named volume `route53_sqlite` and persists across restarts.
The container entrypoint runs `alembic upgrade head`, seeds demo data, then
starts uvicorn.

## Architecture

Layered structure (request flows top → bottom):

```text
┌─────────────────────────────────────────────────────────┐
│  app/main.py                                            │
│  FastAPI app · CORS · request-id · exception handlers   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  app/api/v1/*                                           │
│  HTTP routes · Depends(get_current_user) · schemas I/O  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  app/services/*                                         │
│  Business logic (auth, hosted zones, DNS records)       │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  app/models/*  +  app/db/session.py                     │
│  SQLAlchemy ORM · SQLite (Alembic migrations)           │
└─────────────────────────────────────────────────────────┘

Cross-cutting: app/core/{config,security,logging,exceptions,rate_limit}
```

| Layer | Responsibility |
|-------|----------------|
| `api/` | HTTP adapters, status codes, cookie handling |
| `schemas/` | Pydantic request/response models |
| `services/` | Domain rules (no FastAPI imports) |
| `models/` | ORM tables + `record_count` sync events |
| `core/` | Settings, hashing, logging, middleware |
| `db/` | Engine, sessions, seed script |

## Database schema

```text
users
  id PK
  email UNIQUE
  password_hash
  created_at
       │
       │ 1:N
       ▼
sessions                    hosted_zones
  id PK (token)               id PK (Z…)
  user_id → users.id          name
  expires_at                  type  (Public|Private)
  created_at                  comment
                              record_count
                              created_by → users.id
                              created_at / updated_at
                                   │
                                   │ 1:N  ON DELETE CASCADE
                                   ▼
                              dns_records
                                id PK (UUID)
                                hosted_zone_id → hosted_zones.id
                                name, type, ttl, value
                                priority / weight / port   (MX, SRV)
                                caa_flag / caa_tag         (CAA)
                                created_at / updated_at
```

**Relationships**

- `User` 1—* `Session` (server-side session cookies)
- `User` 1—* `HostedZone` (`created_by`)
- `HostedZone` 1—* `DnsRecord` (cascade delete; `record_count` kept in sync via mapper events)

## API overview

OpenAPI UI: **`/docs`** (enabled when `ENVIRONMENT=dev`). ReDoc: `/redoc`.

### Health

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/health` | No | `SELECT 1` readiness; `503` if DB down |

### Auth

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/auth/login` | No | Sets `session_id` cookie; rate-limited |
| `POST` | `/auth/logout` | Yes | Deletes session + clears cookie |
| `GET` | `/auth/me` | Yes | Current user |

### Hosted zones

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/hosted-zones` | Yes | `?search&sort_by&sort_order&page&page_size` |
| `POST` | `/hosted-zones` | Yes | Create (`201`); `409` on duplicate name |
| `GET` | `/hosted-zones/{id}` | Yes | `404` if missing |
| `PUT` | `/hosted-zones/{id}` | Yes | Update `comment` |
| `DELETE` | `/hosted-zones/{id}` | Yes | Cascades DNS records |

### DNS records

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/hosted-zones/{zone_id}/records` | Yes | `?search&type&page&page_size` |
| `POST` | `/hosted-zones/{zone_id}/records` | Yes | Type-specific validation |
| `GET` | `/records/{id}` | Yes | |
| `PUT` | `/records/{id}` | Yes | Full replace body |
| `DELETE` | `/records/{id}` | Yes | |

## Tests

```bash
poetry run pytest
```

Coverage is enforced at **80%** (`pytest-cov` / `--cov-fail-under=80`).
Tests use a temp SQLite file and set `SEED_SAMPLE_DNS=0`.

## Environment

See `.env.example`. Notable keys:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLAlchemy URL (SQLite by default) |
| `SESSION_SECRET` | App secret material |
| `SESSION_EXPIRE_MINUTES` | Session TTL |
| `CORS_ORIGINS` | Comma-separated allow-list (no `*` in prod) |
| `ENVIRONMENT` | `dev` \| `prod` |
| `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` | Seeded login |
| `SEED_SAMPLE_DNS` | `1` to seed sample zones/records |
