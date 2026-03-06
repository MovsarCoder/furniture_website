"""
Django settings for furniture project.
"""

from pathlib import Path

from decouple import Csv, config
from django.utils.translation import gettext_lazy as _

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config(
    "SECRET_KEY",
    default="django-insecure-local-development-key",
)
DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="localhost,127.0.0.1,bmass.at,www.bmass.at,bmass.fr,www.bmass.fr",
    cast=Csv(),
)
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default=(
        "http://localhost:8000,"
        "http://127.0.0.1:8000,"
        "https://bmass.at,"
        "https://www.bmass.at,"
        "https://bmass.fr,"
        "https://www.bmass.fr"
    ),
    cast=Csv(),
)

INSTALLED_APPS = [
    "unfold",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.sitemaps",
    "django.contrib.staticfiles",
    "drf_spectacular",
    "admin_service",
    "client_service",
]

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "B'Mass API",
    "DESCRIPTION": "Internal API endpoints for the B'Mass furniture platform.",
    "VERSION": "1.0.0",
}

MIDDLEWARE = [
    "furniture.middleware.LocalhostAwareSecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "furniture.middleware.DomainLanguageMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "furniture.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "client_service" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "django.template.context_processors.i18n",
                "client_service.context_processors.nav_our_works",
            ],
        },
    },
]

WSGI_APPLICATION = "furniture.wsgi.application"

DB_ENGINE = config("DB_ENGINE", default="django.db.backends.sqlite3")

if DB_ENGINE in {
    "django.db.backends.postgresql",
    "django.db.backends.postgresql_psycopg2",
}:
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": config("DB_NAME", default="furniture_db"),
            "USER": config("DB_USER", default="db_user"),
            "PASSWORD": config("DB_PASSWORD", default="db_password"),
            "HOST": config("DB_HOST", default="db"),
            "PORT": config("DB_PORT", default="5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / config("DB_NAME", default="db.sqlite3"),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en"
TIME_ZONE = "Europe/Moscow"
USE_I18N = True
USE_TZ = True

LANGUAGES = [
    ("en", _("English")),
    ("de", _("Deutsch")),
    ("fr", _("Français")),
]

GOOGLE_MAPS_API_KEY = config("GOOGLE_MAPS_API_KEY", default="")

LOCALE_PATHS = [BASE_DIR / "locale"]

DOMAIN_LANGUAGE_MAP = {
    "bmass.at": "de",
    "www.bmass.at": "de",
    "bmass.fr": "fr",
    "www.bmass.fr": "fr",
    "localhost": "en",
    "127.0.0.1": "en",
}

LANGUAGE_DOMAIN_MAP = {
    "en": "",
    "de": "bmass.at",
    "fr": "bmass.fr",
}

STATIC_URL = "/static/"
STATICFILES_DIRS = [
    BASE_DIR / "client_service" / "static",
    BASE_DIR / "client_service" / "templates" / "static",
]
STATIC_ROOT = BASE_DIR / "staticfiles"

USE_MANIFEST_STATIC = config(
    "USE_MANIFEST_STATIC",
    default=not DEBUG,
    cast=bool,
)
staticfiles_backend = "django.contrib.staticfiles.storage.StaticFilesStorage"
if not DEBUG:
    staticfiles_backend = (
        "whitenoise.storage.CompressedManifestStaticFilesStorage"
        if USE_MANIFEST_STATIC
        else "whitenoise.storage.CompressedStaticFilesStorage"
    )

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": staticfiles_backend},
}

WHITENOISE_MAX_AGE = 31536000 if not DEBUG else 0

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
SERVE_MEDIA_FILES = config("SERVE_MEDIA_FILES", default=DEBUG, cast=bool)

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=not DEBUG, cast=bool)
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
LANGUAGE_COOKIE_SECURE = not DEBUG
LANGUAGE_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"
SECURE_HSTS_SECONDS = config(
    "SECURE_HSTS_SECONDS",
    default=2592000 if not DEBUG else 0,
    cast=int,
)
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG

if DEBUG:
    # Keep local runserver strictly HTTP even if a production-like env var leaks
    # into the developer environment.
    SECURE_SSL_REDIRECT = False
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
