import json

from django.views.decorators.http import require_http_methods
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.shortcuts import redirect

from admin_service.models import *


# Create your views here.


def index(request):
    works = Work.objects.order_by("?")[:3]
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
    return render(request, "works/work_detail.html", {
        "work": work,
    })


def custom_page_not_found(request, exception=None):
    contacts = Contact.objects.all()
    """Кастомная 404 страница в едином стиле сайта."""
    return render(request, "base/404.html", context={"contacts": contacts}, status=404)


@require_http_methods(["GET", "POST"])
def consultation_request(request):
    """Обработка заявок на консультацию"""
    if request.method == 'GET':
        # Возвращаем страницу с информацией о консультациях
        return redirect('client_service:index')

    # POST request handling
    try:
        data = json.loads(request.body)

        # Валидация данных
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        consultation_type = data.get('consultation_type', 'general')
        message = data.get('message', '').strip()
        preferred_time = data.get('preferred_time', '').strip()

        # Базовая валидация
        if not name or not phone:
            return JsonResponse({
                'success': False,
                'error': 'Имя и телефон обязательны для заполнения'
            }, status=400)

        # Создаем заявку
        consultation = ConsultationRequest.objects.create(
            name=name,
            phone=phone,
            email=email,
            consultation_type=consultation_type,
            message=message,
            preferred_time=preferred_time
        )

        return JsonResponse({
            'success': True,
            'message': 'Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.',
            'consultation_id': consultation.id
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Некорректные данные'
        }, status=400)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': 'Произошла ошибка при обработке заявки. Попробуйте позже.'
        }, status=500)

# Create your views here.
