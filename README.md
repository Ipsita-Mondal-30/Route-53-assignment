# Route 53 Clone

## Tech Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS

Backend:
- FastAPI
- SQLAlchemy
- SQLite

## Project Structure

- `frontend/` — Next.js App Router UI
- `backend/` — FastAPI API and SQLite persistence
- `docs/` — project documentation

## Local Development

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`.

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
```
