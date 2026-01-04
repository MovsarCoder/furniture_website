# Инструкция по развертыванию на VPS сервере

## Требования
- VPS сервер с IP: 72.62.179.100
- Домены: bmass.at, bmass.fr (настроены DNS на этот IP)
- Docker и Docker Compose установлены
- Nginx установлен

## Шаг 1: Подготовка сервера

### Установка Docker (если не установлен)
```bash
# Для Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Установка Nginx (если не установлен)
```bash
sudo apt update
sudo apt install nginx -y
```

## Шаг 2: Настройка DNS

Убедитесь, что DNS записи для доменов указывают на ваш сервер:
```
A запись для bmass.at -> 72.62.179.100
A запись для www.bmass.at -> 72.62.179.100
A запись для bmass.fr -> 72.62.179.100
A запись для www.bmass.fr -> 72.62.179.100
```

## Шаг 3: Клонирование проекта на сервер

```bash
# Перейдите в директорию для проектов
cd /var/www

# Клонируйте репозиторий (или загрузите файлы через scp/sftp)
# git clone <your-repo-url> furniture_project
# ИЛИ
# Загрузите файлы проекта через scp/sftp в /var/www/furniture_project

cd /var/www/furniture_project
```

## Шаг 4: Создание .env файла

Создайте файл `.env` в корне проекта:

```bash
nano .env
```

Добавьте следующие переменные (замените на свои значения):

```env
SECRET_KEY=your-very-secret-key-here-generate-with-openssl-rand-hex-32
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
DB_NAME=furniture_db
DB_USER=db_user
DB_PASSWORD=your-strong-db-password-here
```

Сгенерируйте SECRET_KEY:
```bash
openssl rand -hex 32
```

## Шаг 5: Настройка Nginx

### Копирование конфигурации

```bash
# Скопируйте конфигурацию nginx
sudo cp nginx/nginx.conf /etc/nginx/sites-available/bmass

# Создайте симлинк
sudo ln -s /etc/nginx/sites-available/bmass /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Если всё OK, перезагрузите nginx
sudo systemctl reload nginx
```

### Важно: Обновите пути в nginx.conf

В файле `/etc/nginx/sites-available/bmass` убедитесь, что пути к статике и медиа правильные:
- `/var/www/furniture_project/staticfiles/` - путь к статическим файлам
- `/var/www/furniture_project/media/` - путь к медиа файлам

## Шаг 6: Создание директорий для статики и медиа

```bash
# Убедитесь, что директории существуют
mkdir -p /var/www/furniture_project/staticfiles
mkdir -p /var/www/furniture_project/media

# Установите правильные права (nginx должен иметь доступ)
sudo chown -R $USER:www-data /var/www/furniture_project
sudo chmod -R 755 /var/www/furniture_project
```

## Шаг 7: Запуск приложения

```bash
cd /var/www/furniture_project

# Запустите приложение в продакшн режиме
docker-compose -f docker-compose.yml up -d --build

# Проверьте логи
docker-compose -f docker-compose.yml logs -f
```

## Шаг 8: Создание суперпользователя

```bash
docker-compose -f docker-compose.yml exec web python manage.py createsuperuser
```

## Шаг 9: Настройка SSL (рекомендуется)

### Установка Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Получение SSL сертификатов

```bash
sudo certbot --nginx -d bmass.at -d www.bmass.at -d bmass.fr -d www.bmass.fr
```

Certbot автоматически обновит конфигурацию nginx для использования HTTPS.

### Автоматическое обновление сертификатов

Certbot автоматически создаёт cron задачу для обновления сертификатов, но можно проверить:

```bash
sudo certbot renew --dry-run
```

## Шаг 10: Обновление nginx.conf для HTTPS

После получения SSL сертификатов:

1. Раскомментируйте HTTPS блок в `/etc/nginx/sites-available/bmass`
2. Раскомментируйте редирект HTTP -> HTTPS
3. Проверьте конфигурацию: `sudo nginx -t`
4. Перезагрузите nginx: `sudo systemctl reload nginx`

## Полезные команды

### Остановка/запуск контейнеров
```bash
docker-compose -f docker-compose.yml stop
docker-compose -f docker-compose.yml start
docker-compose -f docker-compose.yml restart
```

### Просмотр логов
```bash
docker-compose -f docker-compose.yml logs -f web
docker-compose -f docker-compose.yml logs -f db
```

### Выполнение команд Django
```bash
docker-compose -f docker-compose.yml exec web python manage.py migrate
docker-compose -f docker-compose.yml exec web python manage.py collectstatic --noinput
docker-compose -f docker-compose.yml exec web python manage.py shell
```

### Бэкап базы данных
```bash
docker-compose -f docker-compose.yml exec db pg_dump -U db_user furniture_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление базы данных
```bash
docker-compose -f docker-compose.yml exec -T db psql -U db_user furniture_db < backup_file.sql
```

## Обновление приложения

```bash
cd /var/www/furniture_project

# Остановите контейнеры
docker-compose -f docker-compose.yml down

# Обновите код (если используете git)
git pull

# Пересоберите и запустите
docker-compose -f docker-compose.yml up -d --build

# Примените миграции (если есть)
docker-compose -f docker-compose.yml exec web python manage.py migrate

# Соберите статику (если нужно)
docker-compose -f docker-compose.yml exec web python manage.py collectstatic --noinput
```

## Мониторинг

### Проверка статуса контейнеров
```bash
docker-compose -f docker-compose.yml ps
```

### Использование ресурсов
```bash
docker stats
```

### Логи Nginx
```bash
sudo tail -f /var/log/nginx/bmass_access.log
sudo tail -f /var/log/nginx/bmass_error.log
```

## Безопасность

1. **Firewall**: Настройте UFW для ограничения доступа
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

2. **Секреты**: Никогда не коммитьте `.env` файл в git

3. **Регулярные обновления**: Регулярно обновляйте систему и контейнеры
```bash
sudo apt update && sudo apt upgrade -y
docker-compose -f docker-compose.yml pull
```

