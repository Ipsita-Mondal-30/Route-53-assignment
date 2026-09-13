#!/bin/sh
set -eu

# Render/Docker default data dir. Used if the configured DATABASE_URL (e.g. Aiven)
# is unreachable so the API can still boot for demos.
SQLITE_FALLBACK="sqlite:////app/data/route53.db"

migrate_and_seed() {
  echo "Running database migrations against ${DATABASE_URL:-"(unset / app default)"}..."
  alembic upgrade head
  echo "Seeding demo data..."
  python -m app.db.seed
}

if ! migrate_and_seed; then
  echo "WARNING: Primary database unreachable. Falling back to ${SQLITE_FALLBACK}"
  export DATABASE_URL="${SQLITE_FALLBACK}"
  migrate_and_seed
fi

echo "Starting API (DATABASE_URL=${DATABASE_URL:-default})..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
