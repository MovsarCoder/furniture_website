from __future__ import annotations

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse

from admin_service.models import CarouselPhoto
from client_service.services import (
    build_homepage_stats,
    get_about_page_content,
    get_contact_queryset,
    get_review_queryset,
    get_work_queryset,
    resolve_country_code,
    sample_photo_list,
    sample_queryset,
)


def _safe_image_url(instance) -> str | None:
    image = getattr(instance, "image", None)
    if not image:
        return None

    try:
        return image.url
    except (AttributeError, ValueError):
        return None


def _build_showcase_photos(
    carousel_photos, works, limit: int = 12
) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []

    for photo in carousel_photos:
        image_url = _safe_image_url(photo)
        if image_url:
            items.append(
                {
                    "url": image_url,
                    "title": photo.title or "Furniture interior",
                }
            )

    for work in works:
        image_url = _safe_image_url(work)
        if image_url:
            items.append(
                {
                    "url": image_url,
                    "title": work.title or "Furniture",
                }
            )

    if not items:
        return []

    while len(items) < limit:
        items.extend(items[: max(1, limit - len(items))])

    return items[:limit]


def _pick_express_banner_photo(carousel_photos):
    preferred_key = "zv5yh3tgc8x433sclrpov5tudpbgiish"
    for photo in carousel_photos:
        if preferred_key in str(getattr(photo, "image", "")):
            return photo
    return carousel_photos[0] if carousel_photos else None


def index(request: HttpRequest) -> HttpResponse:
    country_code = resolve_country_code(request.get_host())
    featured_works = sample_queryset(
        get_work_queryset(country_code, our_work=True),
        3,
    )
    showcase_works = sample_queryset(
        get_work_queryset(country_code, our_work=True, with_images=True),
        10,
    )
    carousel_photos = list(
        CarouselPhoto.objects.filter(is_active=True).order_by("order", "-created_at")
    )
    review_queryset = get_review_queryset(request.LANGUAGE_CODE)

    context = {
        "works": featured_works,
        "carousel_photos": carousel_photos,
        "identity_photos": sample_photo_list(carousel_photos, 3),
        "store_gallery_photos": sample_photo_list(carousel_photos, 3),
        "showcase_photos": _build_showcase_photos(
            carousel_photos,
            showcase_works,
            limit=12,
        ),
        "express_banner_photo": _pick_express_banner_photo(carousel_photos),
        "portfolio_fallback_photo": carousel_photos[0] if carousel_photos else None,
        "reviews": review_queryset,
        "contacts": get_contact_queryset(country_code),
        **build_homepage_stats(country_code, review_queryset),
    }
    return render(request, "home/home.html", context=context)


def all_works(request: HttpRequest) -> HttpResponse:
    country_code = resolve_country_code(request.get_host())
    return render(
        request,
        "works/works.html",
        context={
            "works": get_work_queryset(country_code, our_work=True),
            "contacts": get_contact_queryset(country_code),
            "host_name": country_code or "local",
        },
    )


def work_detail(request: HttpRequest, pk: int) -> HttpResponse:
    country_code = resolve_country_code(request.get_host())
    queryset = get_work_queryset(country_code)
    work = get_object_or_404(queryset, pk=pk)
    return render(request, "works/work_detail.html", {"work": work})


def custom_page_not_found(request: HttpRequest, exception=None) -> HttpResponse:
    return render(request, "base/404.html", status=404)


def catalog_view(request: HttpRequest) -> HttpResponse:
    country_code = resolve_country_code(request.get_host())
    section = request.GET.get("section", "").strip()
    category = request.GET.get("category", "").strip()

    works = get_work_queryset(country_code, our_work=False)
    if category:
        works = works.filter(category__title=category)

    return render(
        request,
        "mobel/view_mobel.html",
        {
            "section": section,
            "category": category,
            "contacts": get_contact_queryset(country_code),
            "works": works,
        },
    )


def about_page(request: HttpRequest) -> HttpResponse:
    country_code = resolve_country_code(request.get_host())
    return render(
        request,
        "home/about.html",
        {
            "contacts": get_contact_queryset(country_code),
            "about_content": get_about_page_content(request.LANGUAGE_CODE),
        },
    )


def robots_txt(request: HttpRequest) -> HttpResponse:
    return render(
        request,
        "seo/robots.txt",
        {
            "sitemap_url": request.build_absolute_uri(reverse("sitemap")),
        },
        content_type="text/plain",
    )
