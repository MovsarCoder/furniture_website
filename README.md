# B'Mass Furniture Platform

Production-oriented Django project for a multilingual furniture studio website. The platform combines a polished customer-facing storefront, a refined Django admin for content management, and a lightweight internal API/documentation layer for controlled back-office usage.

## Project Description

B'Mass presents custom furniture, portfolio work, catalog items, contact branches, and consultation requests across localized experiences. The codebase is structured for long-term maintenance with improved query reuse, safer production defaults, SEO support, and cleaner frontend behavior.

## Technology Stack

- Python
- Django
- PostgreSQL
- JavaScript
- HTML
- CSS

Supporting packages:

- Django REST Framework
- drf-spectacular
- WhiteNoise
- Pillow
- python-decouple
- django-unfold

## Project Advantages

- Production-safe configuration with environment-driven settings, secure cookie/HSTS support, and WhiteNoise-backed static delivery.
- Cleaner data layer with normalized language codes, safer image validation, and indexes for common portfolio/review queries.
- Reused service/query helpers that reduce duplicated filtering logic across views and context processors.
- Better admin ergonomics with clearer filters, targeted search, queryset optimization, and more focused list displays.
- Improved frontend quality through cleaned templates, duplicate script removal, language switcher activation, and safer empty-state handling.
- SEO improvements including canonical metadata, OpenGraph tags, `robots.txt`, and `sitemap.xml`.
- Basic automated coverage for high-risk paths such as consultation requests, country filtering, and sitemap/robots responses.

## Project Architecture

```text
.
├── admin_service/
│   ├── admin.py
│   ├── constants.py
│   ├── models.py
│   ├── serializers.py
│   ├── templates/
│   ├── tests.py
│   ├── urls.py
│   ├── validators.py
│   └── views.py
├── client_service/
│   ├── context_processors.py
│   ├── services.py
│   ├── sitemaps.py
│   ├── static/
│   ├── templates/
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── furniture/
│   ├── middleware.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── locale/
├── media/
├── Dockerfile
├── docker-compose.yml
├── docker-compose2.yml
├── entrypoint.sh
├── requirements.txt
└── manage.py
```

### Folder Responsibilities

- `admin_service/`: business entities, admin configuration, serializers, validation, and consultation handling.
- `client_service/`: public pages, shared query/service helpers, sitemap generation, and global template context.
- `furniture/`: project settings, middleware, URL composition, and runtime entrypoints.
- `locale/`: German and French translation catalogs.
- `media/`: uploaded portfolio/carousel assets.

## Installation Instructions

### 1. Clone the project

```bash
git clone <repository-url>
cd furniture_project_2
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a local environment file from the provided example:

```bash
cp .env.example .env
```

Recommended local defaults:

```env
SECRET_KEY=replace-this-with-a-random-secret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
GOOGLE_MAPS_API_KEY=
USE_MANIFEST_STATIC=False
SERVE_MEDIA_FILES=True
```

### 5. Apply migrations

```bash
python manage.py migrate
```

### 6. Create a superuser

```bash
python manage.py createsuperuser
```

### 7. Run the development server

```bash
python manage.py runserver
```

### 8. Run checks and tests

```bash
python manage.py check
python manage.py test
```

### Optional: Docker workflow

```bash
docker-compose up --build
```

For a production-style validation run:

```bash
DEBUG=False SECRET_KEY='replace-me-with-a-long-random-secret' python manage.py check --deploy
```

## Developer

**MovCoder**

Telegram  
[https://t.me/movcoder](https://t.me/movcoder)

Instagram  
[https://instagram.com/movsarcoder](https://instagram.com/movsarcoder)

Email  
[blackstar013.bs@gmail.com](mailto:blackstar013.bs@gmail.com)

Phone  
+7 989 915 42 45

**For development requests or collaboration, please contact using the information above.**
