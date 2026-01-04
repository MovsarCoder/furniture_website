#!/bin/bash
# Скрипт для автоматической настройки сервера
# Использование: sudo ./setup_server.sh

set -e

echo "🚀 Начинаем настройку сервера..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Пожалуйста, запустите скрипт с правами sudo: sudo ./setup_server.sh"
    exit 1
fi

# Определяем директорию проекта
PROJECT_DIR="/var/www/furniture_project"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Директория проекта не найдена: $PROJECT_DIR"
    echo "Убедитесь, что проект загружен в правильную директорию"
    exit 1
fi

cd "$PROJECT_DIR"

# Проверка .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден!"
    echo "Создайте файл .env перед запуском скрипта"
    exit 1
fi

echo "📦 Проверяем и устанавливаем Docker..."

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "Устанавливаем Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    # Добавляем текущего пользователя в группу docker
    if [ -n "$SUDO_USER" ]; then
        usermod -aG docker "$SUDO_USER"
    fi
else
    echo "✅ Docker уже установлен"
fi

# Проверка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Устанавливаем Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose уже установлен"
fi

echo "📦 Проверяем и устанавливаем Nginx..."

# Проверка и установка Nginx
if ! command -v nginx &> /dev/null; then
    apt update
    apt install -y nginx
else
    echo "✅ Nginx уже установлен"
fi

echo "🔧 Настраиваем Nginx..."

# Копирование конфигурации nginx
if [ -f "nginx/nginx.conf" ]; then
    cp nginx/nginx.conf /etc/nginx/sites-available/bmass
    echo "✅ Конфигурация nginx скопирована"
else
    echo "❌ Файл nginx/nginx.conf не найден!"
    exit 1
fi

# Создание симлинка
if [ ! -L /etc/nginx/sites-enabled/bmass ]; then
    ln -s /etc/nginx/sites-available/bmass /etc/nginx/sites-enabled/bmass
    echo "✅ Симлинк nginx создан"
fi

# Удаление дефолтной конфигурации
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
    echo "✅ Дефолтная конфигурация nginx удалена"
fi

# Проверка конфигурации nginx
if nginx -t; then
    echo "✅ Конфигурация nginx корректна"
    systemctl reload nginx
    echo "✅ Nginx перезагружен"
else
    echo "❌ Ошибка в конфигурации nginx!"
    exit 1
fi

echo "📁 Создаем директории..."

# Создание директорий
mkdir -p staticfiles media

# Определяем владельца (пользователя, который запустил sudo)
if [ -n "$SUDO_USER" ]; then
    OWNER="$SUDO_USER"
else
    OWNER="$(whoami)"
fi

# Установка прав
chown -R "$OWNER:www-data" "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"
chmod -R 775 staticfiles media  # Права на запись для медиа
echo "✅ Права установлены"

echo "🐳 Настраиваем Docker Compose..."

# Закомментируем порт 8000 в docker-compose.yml для продакшена
# (nginx будет проксировать запросы)
if grep -q "^\s*-\s*\"8000:8000\"" docker-compose.yml; then
    sed -i 's/^\(.*- "8000:8000"\)/#\1  # Закомментировано для продакшена с nginx/' docker-compose.yml
    echo "✅ Порт 8000 закомментирован в docker-compose.yml"
fi

echo "🚀 Запускаем Docker контейнеры..."

# Запуск контейнеров (от имени пользователя, не root)
if [ -n "$SUDO_USER" ]; then
    sudo -u "$SUDO_USER" docker-compose up -d --build
else
    docker-compose up -d --build
fi

echo "⏳ Ждем готовности контейнеров..."
sleep 10

echo "📦 Применяем миграции..."

# Применение миграций
if [ -n "$SUDO_USER" ]; then
    sudo -u "$SUDO_USER" docker-compose exec -T web python manage.py migrate --noinput || true
else
    docker-compose exec -T web python manage.py migrate --noinput || true
fi

echo "🎨 Собираем статические файлы..."

# Сборка статики
if [ -n "$SUDO_USER" ]; then
    sudo -u "$SUDO_USER" docker-compose exec -T web python manage.py collectstatic --noinput || true
else
    docker-compose exec -T web python manage.py collectstatic --noinput || true
fi

echo ""
echo "✅ Настройка сервера завершена!"
echo ""
echo "📊 Статус контейнеров:"
if [ -n "$SUDO_USER" ]; then
    sudo -u "$SUDO_USER" docker-compose ps
else
    docker-compose ps
fi

echo ""
echo "📝 Следующие шаги:"
echo "1. Убедитесь, что DNS записи настроены для доменов bmass.at и bmass.fr"
echo "2. Создайте суперпользователя: docker-compose exec web python manage.py createsuperuser"
echo "3. Проверьте работу сайта: http://bmass.at"
echo "4. (Опционально) Настройте SSL: sudo certbot --nginx -d bmass.at -d www.bmass.at -d bmass.fr -d www.bmass.fr"
echo ""
echo "📋 Полезные команды:"
echo "  Просмотр логов: docker-compose logs -f"
echo "  Перезапуск: docker-compose restart"
echo "  Остановка: docker-compose down"

