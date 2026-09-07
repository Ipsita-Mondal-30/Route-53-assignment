# Backend

FastAPI service for the Route 53 clone.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

- `GET /` — health response
- `GET /health` — `{"status": "ok"}`

## Tests

```bash
pytest
```
