from django.db.models import Avg
from django.shortcuts import render, get_object_or_404
from django.utils import translation
from django.conf import settings
from django.urls import translate_url

from admin_service.models import *


# Create your views here.


def index(request):
    works = Work.objects.order_by("?")[:3]
    reviews = Review.objects.all()
    contacts = Contact.objects.all()
    stats = Stats.objects.first()

    # Calculate real statistics
    total_projects = Work.objects.count()
    avg_rating = reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    avg_rating = round(avg_rating, 1) if avg_rating else 4.9

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
    contacts = Contact.objects.all()
    """Кастомная 404 страница в едином стиле сайта."""
    return render(request, "base/404.html", status=404)