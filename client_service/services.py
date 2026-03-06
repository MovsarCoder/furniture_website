from __future__ import annotations

import random

from django.conf import settings
from django.db.models import Avg, QuerySet

from admin_service.constants import COUNTRY_CODES
from admin_service.models import AboutPageContent, CarouselPhoto, Contact, Review, Work

LOCAL_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0"}


def resolve_country_code(host: str | None) -> str | None:
    if not host:
        return None

    normalized_host = host.split(":", 1)[0].strip().lower()
    if normalized_host.startswith("www."):
        normalized_host = normalized_host[4:]
    if normalized_host.startswith("bmass."):
        normalized_host = normalized_host.split("bmass.", 1)[1]

    if normalized_host in LOCAL_HOSTS:
        return None

    return normalized_host if normalized_host in COUNTRY_CODES else None


def get_contact_queryset(country_code: str | None = None) -> QuerySet[Contact]:
    queryset = Contact.objects.prefetch_related("opening_hours").order_by("branch_name")
    if country_code:
        queryset = queryset.filter(country=country_code)
    return queryset


def get_work_queryset(
        country_code: str | None = None,
        *,
        our_work: bool | None = None,
        with_images: bool = False,
) -> QuerySet[Work]:
    queryset = Work.objects.select_related("category")

    if country_code:
        queryset = queryset.filter(country=country_code)
    if our_work is not None:
        queryset = queryset.filter(our_work=our_work)
    if with_images:
        queryset = queryset.filter(image__isnull=False).exclude(image="")

    return queryset


def get_navigation_works(country_code: str | None = None, limit: int = 12) -> QuerySet[Work]:
    return get_work_queryset(country_code, our_work=True).order_by("-created_at")[:limit]


def get_review_queryset(language_code: str | None = None) -> QuerySet[Review]:
    queryset = Review.objects.order_by("-date")
    if not language_code:
        return queryset

    localized_queryset = queryset.filter(language=language_code)
    return localized_queryset if localized_queryset.exists() else queryset


def get_about_page_content(language_code: str | None) -> AboutPageContent | None:
    fallback_languages = [
        language_code,
        settings.LANGUAGE_CODE,
        "de",
        "fr",
        "en",
    ]

    for code in dict.fromkeys(filter(None, fallback_languages)):
        content = AboutPageContent.objects.filter(language=code).first()
        if content:
            return content

    return AboutPageContent.objects.order_by("language").first()


def sample_queryset(queryset: QuerySet[Work], limit: int) -> list[Work]:
    items = list(queryset)
    if len(items) <= limit:
        random.shuffle(items)
        return items
    return random.sample(items, limit)


def sample_photo_list(photos: list[CarouselPhoto], limit: int) -> list[CarouselPhoto]:
    if len(photos) <= limit:
        copied = list(photos)
        random.shuffle(copied)
        return copied
    return random.sample(photos, limit)


def build_homepage_stats(
        country_code: str | None,
        review_queryset: QuerySet[Review],
) -> dict[str, float | int]:
    total_projects = get_work_queryset(country_code).count()
    avg_rating = review_queryset.aggregate(avg_rating=Avg("rating"))["avg_rating"] or 0
    avg_rating = round(avg_rating, 1) if avg_rating else 0.0

    return {
        "total_projects": total_projects,
        "avg_rating": avg_rating,
        "stats_clients": max(1000, total_projects * 2),
        "stats_projects": max(500, total_projects),
        "stats_years": 14,
        "stats_custom_pieces": max(1200, total_projects * 3),
    }
