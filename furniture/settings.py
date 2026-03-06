"""
Django settings for furniture project.
"""

import sys
from pathlib import Path

from decouple import Csv, config
from django.utils.translation import gettext_lazy as _

BASE_DIR = Path(__file__).resolve().parent.parent
RUNNING_DEV_SERVER = any(arg.startswith("runserver") for arg in sys.argv)
RUNNING_TESTS = any(arg == "test" for arg in sys.argv)
RUNNING_LOCAL_ENV = RUNNING_DEV_SERVER or RUNNING_TESTS
LOCAL_DOMAIN_LANGUAGE_MAP = {
    "at.localhost": "de",
    "www.at.localhost": "de",
    "fr.localhost": "fr",
    "www.fr.localhost": "fr",
}
DEFAULT_ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "testserver",
    "at.localhost",
    "www.at.localhost",
    "fr.localhost",
    "www.fr.localhost",
    "bmass.at",
    "www.bmass.at",
    "bmass.fr",
    "www.bmass.fr",
]
DEFAULT_CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://0.0.0.0:8000",
    "http://at.localhost:8000",
    "http://www.at.localhost:8000",
    "http://fr.localhost:8000",
    "http://www.fr.localhost:8000",
    "https://bmass.at",
    "https://www.bmass.at",
    "https://bmass.fr",
    "https://www.bmass.fr",
]

SECRET_KEY = config(
    "SECRET_KEY",
    default="django-insecure-local-development-key",
)
DEBUG = config("DEBUG", default=RUNNING_LOCAL_ENV, cast=bool)

ALLOWED_HOSTS = list(
    dict.fromkeys(
        DEFAULT_ALLOWED_HOSTS
        + config(
            "ALLOWED_HOSTS",
            default="",
            cast=Csv(),
        )
    )
)
CSRF_TRUSTED_ORIGINS = list(
    dict.fromkeys(
        DEFAULT_CSRF_TRUSTED_ORIGINS
        + config(
            "CSRF_TRUSTED_ORIGINS",
            default="",
            cast=Csv(),
        )
    )
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
    **LOCAL_DOMAIN_LANGUAGE_MAP,
    "localhost": "en",
    "127.0.0.1": "en",
    "0.0.0.0": "en",
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
SERVE_MEDIA_FILES = config(
    "SERVE_MEDIA_FILES",
    default=RUNNING_LOCAL_ENV or not DEBUG,
    cast=bool,
)

ENABLE_SSL_SECURITY = config(
    "ENABLE_SSL_SECURITY",
    default=not DEBUG and not RUNNING_LOCAL_ENV,
    cast=bool,
)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = config(
    "SECURE_SSL_REDIRECT",
    default=ENABLE_SSL_SECURITY,
    cast=bool,
)
SESSION_COOKIE_SECURE = ENABLE_SSL_SECURITY
CSRF_COOKIE_SECURE = ENABLE_SSL_SECURITY
LANGUAGE_COOKIE_SECURE = ENABLE_SSL_SECURITY
LANGUAGE_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"
SECURE_HSTS_SECONDS = config(
    "SECURE_HSTS_SECONDS",
    default=2592000 if ENABLE_SSL_SECURITY else 0,
    cast=int,
)
SECURE_HSTS_INCLUDE_SUBDOMAINS = ENABLE_SSL_SECURITY
SECURE_HSTS_PRELOAD = ENABLE_SSL_SECURITY

if RUNNING_LOCAL_ENV:
    # Keep the local development server strictly HTTP even when testing with
    # production-like settings, automated tests, or real domains mapped
    # through /etc/hosts.
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    LANGUAGE_COOKIE_SECURE = False
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
