from django.db.models import Avg
from django.shortcuts import render, get_object_or_404

from admin_service.models import *


def index(request):
    works = Work.objects.order_by("?")[:3]
    reviews = Review.objects.all()
    contacts = Contact.objects.all()
    stats = Stats.objects.first()

    total_projects = Work.objects.count()
    avg_rating = reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    avg_rating = round(avg_rating, 1) if avg_rating else 0.0

    return render(request, "home/home.html", context={
        "works": works,
        "reviews": reviews,
        "contacts": contacts,
        "stats": stats,
        "total_projects": total_projects,
        "avg_rating": avg_rating,
    })


def all_works(request):
    works = Work.objects.all()
    contacts = Contact.objects.all()
    return render(request, "works/works.html", context={
        "works": works,
        "contacts": contacts
    })


def work_detail(request, pk):
    work = get_object_or_404(Work, pk=pk)
    return render(request, "works/work_detail.html", {
        "work": work,
    })


def custom_page_not_found(request, exception=None):
    """Кастомная 404 страница в едином стиле сайта."""
    return render(request, "base/404.html", status=404)
