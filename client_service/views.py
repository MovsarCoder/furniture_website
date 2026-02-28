from django.db.models import Avg
from django.shortcuts import render, get_object_or_404

from admin_service.models import *


LOCAL_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0"}


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

    carousel_photos = CarouselPhoto.objects.filter(is_active=True)
    reviews = Review.objects.all()
    contacts = Contact.objects.prefetch_related("opening_hours").all()
    stats = Stats.objects.first()

    total_projects = Work.objects.count()
    avg_rating = reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    avg_rating = round(avg_rating, 1) if avg_rating else 0.0

    return render(request, "home/home.html", context={
        "works": works,
        "carousel_photos": carousel_photos,
        "reviews": reviews,
        "contacts": contacts,
        "stats": stats,
        "total_projects": total_projects,
        "avg_rating": avg_rating,
    })


def all_works(request):
    works = Work.objects.filter(our_work=True)
    contacts = Contact.objects.prefetch_related("opening_hours").all()
    country_code = _resolve_country_code(request)

    if country_code:
        works = works.filter(country=country_code)

    return render(request, "works/works.html", context={
        "works": works,
        "contacts": contacts,
        "host_name": country_code or "local",
    })


def work_detail(request, pk):
    work = get_object_or_404(Work, pk=pk)
    return render(request, "works/work_detail.html", {
        "work": work,
    })


def custom_page_not_found(request, exception=None):
    """Кастомная 404 страница в едином стиле сайта."""
    return render(request, "base/404.html", status=404)


def catalog_view(request):
    country_code = _resolve_country_code(request)
    section = request.GET.get('section')
    category = request.GET.get('category')

    works = Work.objects.all()
    contacts = Contact.objects.prefetch_related("opening_hours").all()

    if category:
        works = works.filter(category__title=category, our_work=False)
        if country_code:
            works = works.filter(country=country_code)

    return render(request, 'mobel/view_mobel.html', {
        'section': section,
        'category': category,
        "contacts": contacts,
        "works": works,
    })


def about_page(request):
    contacts = Contact.objects.prefetch_related("opening_hours").all()
    current_language = request.LANGUAGE_CODE

    about_content = (
        AboutPageContent.objects.filter(language=current_language).first()
        or AboutPageContent.objects.filter(language="en").first()
    )

    return render(request, "home/about.html", {
        "contacts": contacts,
        "about_content": about_content,
    })
