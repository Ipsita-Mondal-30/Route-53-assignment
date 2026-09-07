# Route 53 Clone

## Tech Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS

Backend:
- FastAPI
- SQLAlchemy
- Alembic
- Poetry
- SQLite

## Project Structure

- `frontend/` — Next.js App Router UI
- `backend/` — FastAPI API and SQLite persistence
- `docs/` — project documentation

## Local Development

### Backend

```bash
cd backend
cp .env.example .env
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`.
Health: `GET /health`

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The UI is available at `http://localhost:3000`.

### Docker

```bash
docker compose up --build
```

## Environment Variables

Copy each `.env.example` before running locally. Do not commit `.env` files.

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

Demo login: `demo@example.com` / `DemoPass123!`

```bash
cd backend
poetry run python -m app.db.seed
poetry run uvicorn app.main:app --reload --port 8000
```
