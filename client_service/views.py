from django.shortcuts import render, get_object_or_404

from admin_service.models import *


# Create your views here.


def index(request):
    works = Work.objects.order_by("?")[:4]
    reviews = Review.objects.all()
    contacts = Contact.objects.all()
    stats = Stats.objects.first()

    return render(request, "home/home.html", context={
        "works": works,
        "reviews": reviews,
        "contacts": contacts,
        "stats": stats,
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
    contacts = Contact.objects.all()
    return render(request, "works/work_detail.html", {
        "work": work,
        "contacts": contacts
    })


def custom_page_not_found(request, exception=None):
    contacts = Contact.objects.all()
    """Кастомная 404 страница в едином стиле сайта."""
    return render(request, "base/404.html", context={"contacts": contacts}, status=404)
# Create your views here.
