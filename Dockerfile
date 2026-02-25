FROM python:3.12-slim

WORKDIR /app

# Устанавливаем нужные системные пакеты для сборки зависимостей
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      gcc \
      libpq-dev \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Копируем только requirements и устанавливаем зависимости
COPY requirements.txt /app/
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Копируем скрипт entrypoint и делаем его исполняемым
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Копируем остальной проект
COPY . /app/

# Открываем порт для приложения
EXPOSE 8000

# Настраиваем entrypoint и команду по умолчанию
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "furniture.wsgi:application"]