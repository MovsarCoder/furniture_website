# 🚀 Быстрая настройка сервера - Шпаргалка

## ⚠️ ВАЖНО: Просто загрузить проект недостаточно!

Нужно также настроить **nginx** как прокси-сервер между доменами и Docker контейнером.

## 📋 Пошаговая инструкция:

### 1. Настройте DNS (в панели управления доменами)
```
A запись: bmass.at      -> 72.62.179.100
A запись: www.bmass.at  -> 72.62.179.100
A запись: bmass.fr      -> 72.62.179.100
A запись: www.bmass.fr  -> 72.62.179.100
```

### 2. Загрузите проект на сервер

**Вариант A: Через SCP (с Mac/Linux)**
```bash
scp -r /Users/mansur/Desktop/furniture_project_2 user@72.62.179.100:/var/www/furniture_project
```

**Вариант B: Через SFTP/FTP клиент**
- Подключитесь к серверу
- Загрузите папку `furniture_project_2` в `/var/www/furniture_project`

### 3. Подключитесь к серверу
```bash
ssh user@72.62.179.100
cd /var/www/furniture_project
```

### 4. Создайте файл .env
```bash
nano .env
```

Добавьте содержимое:
```env
SECRET_KEY=$(openssl rand -hex 32)
DEBUG=False
ALLOWED_HOSTS=bmass.at,www.bmass.at,bmass.fr,www.bmass.fr,localhost,127.0.0.1
GOOGLE_MAPS_API_KEY=ваш-ключ-google-maps
DB_NAME=furniture_db
DB_USER=db_user
DB_PASSWORD=придумайте-надежный-пароль
```

Сгенерируйте SECRET_KEY:
```bash
openssl rand -hex 32
```

### 5. Запустите скрипт автоматической настройки
```bash
chmod +x setup_server.sh
sudo ./setup_server.sh
```

Скрипт автоматически:
- ✅ Установит Docker и Docker Compose (если не установлены)
- ✅ Установит nginx (если не установлен)
- ✅ Настроит nginx конфигурацию
- ✅ Закомментирует порт 8000 в docker-compose.yml
- ✅ Запустит Docker контейнеры
- ✅ Применит миграции
- ✅ Соберет статические файлы

### 6. Создайте суперпользователя
```bash
docker-compose exec web python manage.py createsuperuser
```

### 7. Проверьте работу
Откройте в браузере:
- http://bmass.at
- http://bmass.fr

### 8. (Опционально) Настройте SSL/HTTPS
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d bmass.at -d www.bmass.at -d bmass.fr -d www.bmass.fr
```

---

## 🔄 Как это работает:

```
Интернет запрос на bmass.at
         ↓
    Nginx (порт 80)
         ↓
Docker контейнер (localhost:8000)
         ↓
   Django приложение
```

**Nginx обязателен**, потому что:
- Принимает запросы на домены (порт 80/443)
- Проксирует в Docker контейнер (localhost:8000)
- Обслуживает статические файлы (быстрее)
- Поддерживает SSL/HTTPS

---

## 🛠️ Полезные команды:

```bash
# Просмотр логов
docker-compose logs -f

# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Запуск
docker-compose up -d

# Обновление после изменений кода
docker-compose down
docker-compose up -d --build
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py collectstatic --noinput
```

---

## ❓ Если что-то не работает:

1. **Проверьте логи:**
   ```bash
   docker-compose logs -f web
   docker-compose logs -f db
   sudo tail -f /var/log/nginx/bmass_error.log
   ```

2. **Проверьте статус контейнеров:**
   ```bash
   docker-compose ps
   ```

3. **Проверьте nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **Проверьте DNS:**
   ```bash
   dig bmass.at
   ping bmass.at
   ```

