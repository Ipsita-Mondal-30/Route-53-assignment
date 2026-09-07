# Route 53 Clone

AWS Route 53 console clone — Next.js frontend + FastAPI backend (session auth,
hosted zones, DNS records, SQLite).

## Tech stack

| Area | Stack |
|------|--------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Alembic, Poetry, SQLite |

## Project structure

- `frontend/` — console UI (App Router)
- `backend/` — REST API (see [`backend/README.md`](backend/README.md))
- `docs/` — project documentation

## Local development

### Backend

```bash
cd backend
cp .env.example .env
poetry install
poetry run alembic upgrade head
poetry run python -m app.db.seed
poetry run uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000  
- OpenAPI: http://localhost:8000/docs  
- Health: `GET /health`

Full backend docs: [`backend/README.md`](backend/README.md).

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

UI: http://localhost:3000

### Docker (full stack)

```bash
docker compose up --build
```

Backend SQLite is stored in the Docker volume `route53_sqlite` so data survives
container restarts.

## Demo login

`demo@example.com` / `DemoPass123!`

The seed script also creates sample hosted zones and DNS records (all 9 types).

## Environment

Copy each `.env.example` before running. Do not commit `.env` files.

Frontend (`frontend/.env.example`):

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend (`backend/.env.example`):

```text
DATABASE_URL=sqlite:///./data/route53.db
SESSION_SECRET=change-me-dev-secret
SESSION_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001
ENVIRONMENT=dev
DEMO_USER_EMAIL=demo@example.com
DEMO_USER_PASSWORD=DemoPass123!
```
