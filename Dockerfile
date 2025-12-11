# Используем официальный образ Python
FROM python:3.11-slim

WORKDIR /app

# Системные зависимости (если нужны для psycopg/сборки)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      gcc \
      libpq-dev \
      python3-dev \
      ca-certificates \
      && rm -rf /var/lib/apt/lists/*

# Копируем requirements и устанавливаем зависимости
COPY requirements.txt /app/
RUN pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt

# Копируем entrypoint в /app и делаем исполняемым
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Копируем проект в рабочую директорию
COPY . /app/

# (Опционально) не выполнять collectstatic на этапе build, делаем это в entrypoint
# RUN python manage.py collectstatic --noinput

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "furniture.wsgi:application"]
