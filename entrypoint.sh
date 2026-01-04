#!/bin/sh
set -e

# Параметры подключения (по умолчанию соответствуют docker-compose)
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-furniture_db}"
DB_USER="${DB_USER:-db_user}"
DB_PASSWORD="${DB_PASSWORD:-db_password}"
RETRIES=60
SLEEP=1

wait_for_db() {
  if [ -z "$DB_HOST" ]; then
    echo "DB_HOST не задан — предполагается локальный сокет. Продолжаю..."
    return 1
  fi

  echo "Ожидание Postgres $DB_HOST:$DB_PORT..."
  i=0
  while ! python - <<PY >/dev/null 2>&1
import os, sys
try:
    import psycopg
    conn = psycopg.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        connect_timeout=2
    )
    conn.close()
except Exception:
    sys.exit(1)
sys.exit(0)
PY
  do
    i=$((i+1))
    if [ $i -ge $RETRIES ]; then
      echo "Не удалось подключиться к Postgres после $RETRIES попыток."
      return 1
    fi
    sleep $SLEEP
  done

  echo "Postgres доступен."
  return 0
}

wait_for_db || echo "Продолжаю без гарантии доступности БД."

echo "Применяю миграции..."
python manage.py migrate --noinput || echo "Migrate завершился с ошибкой."

echo "Собираю static файлы..."
python manage.py collectstatic --noinput || echo "collectstatic завершился с ошибкой."

# Передаём управление CMD (gunicorn)
exec "$@"
