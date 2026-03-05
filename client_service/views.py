import random

from django.db.models import Avg
from django.shortcuts import render, get_object_or_404

from admin_service.models import *

LOCAL_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0"}


def _pick_random_photos(photos, limit):
    pool = list(photos)
    if not pool:
        return []
    if len(pool) <= limit:
        random.shuffle(pool)
        return pool
    return random.sample(pool, limit)


def _build_showcase_photos(carousel_photos, works, limit=9):
    items = []

    for photo in carousel_photos:
        if getattr(photo, "image", None):
            try:
                image_url = photo.image.url
            except Exception:
                image_url = None
            if image_url:
                items.append(
                    {
                        "url": image_url,
                        "title": getattr(photo, "title", "") or "Furniture interior",
                    }
                )

    for work in works:
        if getattr(work, "image", None):
            try:
                image_url = work.image.url
            except Exception:
                image_url = None
            if image_url:
                items.append(
                    {
                        "url": image_url,
                        "title": getattr(work, "title", "") or "Furniture",
                    }
                )

    if not items:
        return []

    random.shuffle(items)
    base = list(items)
    idx = 0
    while len(items) < limit and base:
        items.append(base[idx % len(base)])
        idx += 1

    return items[:limit]


def _pick_express_banner_photo(carousel_photos):
    preferred_key = "zv5yh3tgc8x433sclrpov5tudpbgiish"
    for photo in carousel_photos:
        if preferred_key in str(getattr(photo, "image", "")):
            return photo
    return carousel_photos[0] if carousel_photos else None


def _resolve_country_code(request):
    host = request.get_host().split(":")[0].strip().lower()
    if host.startswith("www."):
        host = host[4:]
    if host.startswith("bmass."):
        host = host.split("bmass.", 1)[1]

    available_country_codes = {code for code, _ in COUNTRIES}
    if host in LOCAL_HOSTS:
        return None
    return host if host in available_country_codes else None


def index(request):
    country_code = _resolve_country_code(request)
    works = Work.objects.filter(our_work=True)
    if country_code:
        works = works.filter(country=country_code)
    works = works.order_by("?")[:3]

    showcase_works = Work.objects.filter(our_work=True, image__isnull=False).exclude(
        image=""
    )
    if country_code:
        showcase_works = showcase_works.filter(country=country_code)
    showcase_works = list(showcase_works.order_by("?")[:10])

    carousel_photos = list(CarouselPhoto.objects.filter(is_active=True))
    random.shuffle(carousel_photos)
    identity_photos = _pick_random_photos(carousel_photos, 3)
    store_gallery_photos = _pick_random_photos(carousel_photos, 3)
    showcase_photos = _build_showcase_photos(carousel_photos, showcase_works, limit=12)
    express_banner_photo = _pick_express_banner_photo(carousel_photos)
    portfolio_fallback_photo = (
        random.choice(carousel_photos) if carousel_photos else None
    )
    reviews = Review.objects.all()
    contacts = Contact.objects.prefetch_related("opening_hours").all()

    total_projects = Work.objects.count()
    avg_rating = reviews.aggregate(avg_rating=Avg("rating"))["avg_rating"] or 0
    avg_rating = round(avg_rating, 1) if avg_rating else 0.0
    stats_clients = max(1000, total_projects * 2)
    stats_projects = max(500, total_projects)
    stats_years = 14
    stats_delivery_weeks = 2

    return render(
        request,
        "home/home.html",
        context={
            "works": works,
            "carousel_photos": carousel_photos,
            "identity_photos": identity_photos,
            "store_gallery_photos": store_gallery_photos,
            "showcase_photos": showcase_photos,
            "express_banner_photo": express_banner_photo,
            "portfolio_fallback_photo": portfolio_fallback_photo,
            "reviews": reviews,
            "contacts": contacts,
            "total_projects": total_projects,
            "avg_rating": avg_rating,
            "stats_clients": stats_clients,
            "stats_projects": stats_projects,
            "stats_years": stats_years,
            "stats_delivery_weeks": stats_delivery_weeks,
        },
    )


def all_works(request):
    works = Work.objects.filter(our_work=True)
    contacts = Contact.objects.prefetch_related("opening_hours").all()
    country_code = _resolve_country_code(request)

    if country_code:
        works = works.filter(country=country_code)

    return render(
        request,
        "works/works.html",
        context={
            "works": works,
            "contacts": contacts,
            "host_name": country_code or "local",
        },
    )


def work_detail(request, pk):
    work = get_object_or_404(Work, pk=pk)
    return render(
        request,
        "works/work_detail.html",
        {
            "work": work,
        },
    )


def custom_page_not_found(request, exception=None):
    """Кастомная 404 страница в едином стиле сайта."""
    return render(request, "base/404.html", status=404)


def catalog_view(request):
    country_code = _resolve_country_code(request)
    section = request.GET.get("section")
    category = request.GET.get("category")

    works = Work.objects.all()
    contacts = Contact.objects.prefetch_related("opening_hours").all()

    if category:
        works = works.filter(category__title=category, our_work=False)
        if country_code:
            works = works.filter(country=country_code)

    return render(
        request,
        "mobel/view_mobel.html",
        {
            "section": section,
            "category": category,
            "contacts": contacts,
            "works": works,
        },
    )


def about_page(request):
    contacts = Contact.objects.prefetch_related("opening_hours").all()
    current_language = request.LANGUAGE_CODE

    about_content = (
        AboutPageContent.objects.filter(language=current_language).first()
        or AboutPageContent.objects.filter(language="en").first()
    )

    return render(
        request,
        "home/about.html",
        {
            "contacts": contacts,
            "about_content": about_content,
        },
    )
