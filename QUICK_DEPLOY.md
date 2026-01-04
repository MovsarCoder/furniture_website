# Быстрое развертывание на сервере

## Краткая инструкция

**НЕТ**, просто загрузить и запустить Docker недостаточно! Нужно также настроить **nginx** как прокси-сервер.

## Что нужно сделать:

### 1. Настроить DNS записи
В настройках доменов `bmass.at` и `bmass.fr` создайте A-записи:
```
bmass.at      -> 72.62.179.100
www.bmass.at  -> 72.62.179.100
bmass.fr      -> 72.62.179.100
www.bmass.fr  -> 72.62.179.100
```

### 2. Загрузить проект на сервер
```bash
# На вашем компьютере (Mac)
scp -r /Users/mansur/Desktop/furniture_project_2 user@72.62.179.100:/var/www/furniture_project

# Или через SFTP/FTP клиент
# Загрузите всю папку furniture_project_2 в /var/www/furniture_project на сервере
```

### 3. На сервере выполнить команды:

```bash
# Подключитесь к серверу
ssh user@72.62.179.100

# Перейдите в директорию проекта
cd /var/www/furniture_project

# Создайте .env файл (важно!)
nano .env
```

Добавьте в `.env`:
```env
SECRET_KEY=сгенерируйте-ключ-командой-openssl-rand-hex-32
DEBUG=False
ALLOWED_HOSTS=bmass.at,www.bmass.at,bmass.fr,www.bmass.fr,localhost,127.0.0.1
GOOGLE_MAPS_API_KEY=ваш-ключ-google-maps
DB_NAME=furniture_db
DB_USER=db_user
DB_PASSWORD=придумайте-надежный-пароль
```

### 4. Запустить скрипт настройки (или выполнить вручную):

```bash
# Сделайте скрипт исполняемым
chmod +x setup_server.sh

# Запустите (требуются права sudo)
sudo ./setup_server.sh
```

ИЛИ выполните вручную:

```bash
# Установите Docker и nginx (если не установлены)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt update && sudo apt install nginx -y

# Настройте nginx
sudo cp nginx/nginx.conf /etc/nginx/sites-available/bmass
sudo ln -s /etc/nginx/sites-available/bmass /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo nginx -t
sudo systemctl reload nginx

# Создайте директории
mkdir -p staticfiles media
sudo chown -R $USER:www-data /var/www/furniture_project
sudo chmod -R 755 /var/www/furniture_project

# ВАЖНО: Закомментируйте порт 8000 в docker-compose.yml для продакшена
# Отредактируйте docker-compose.yml и закомментируйте строку:
#   ports:
#     - "8000:8000"
# (или используйте sed команду из скрипта)

# Запустите Docker
docker-compose up -d --build

# Примените миграции
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py collectstatic --noinput

# Создайте суперпользователя
docker-compose exec web python manage.py createsuperuser
```

### 5. Проверить работу
Откройте в браузере: `http://bmass.at` или `http://bmass.fr`

---

## Схема работы:

```
Интернет (домены) 
    ↓
Nginx (порт 80/443) 
    ↓
Docker контейнер (порт 8000, только localhost)
    ↓
Django приложение
```

**Nginx обязателен**, потому что:
- Он принимает запросы на домены (порт 80/443)
- Проксирует запросы в Docker контейнер (localhost:8000)
- Обслуживает статические файлы напрямую (быстрее)
- Обеспечивает SSL/HTTPS

