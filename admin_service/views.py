import json

from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets

from admin_service.serializers import *

from admin_service.models import *


# ViewSets для автодокументации всех запросов для всех моделей
class WorkViewSet(viewsets.ModelViewSet):
    queryset = Work.objects.all()
    serializer_class = WorkSerializer


class StatsViewSet(viewsets.ModelViewSet):
    queryset = Stats.objects.all()
    serializer_class = StatsSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class ConsultationRequestsViewSet(viewsets.ModelViewSet):
    queryset = ConsultationRequest.objects.all()
    serializer_class = ConsultationRequestSerializer


# страница с отображением всех заявок на консультацию также генерация запросов для заявок
@csrf_exempt
@require_http_methods(["GET", "POST"])
def consultation_request(request):
    consultation = ConsultationRequest.objects.all()
    """Обработка заявок на консультацию"""
    if request.method == 'GET':
        # Подсчитываем статистику
        total_count = consultation.count()
        new_count = consultation.filter(status='new').count()
        completed_count = consultation.filter(status='completed').count()

        # Возвращаем страницу с информацией о консультациях
        return render(request, "consultation/consultation.html",
                      context={
                          "consultation_requests": consultation,
                          "total_count": total_count,
                          "new_count": new_count,
                          "completed_count": completed_count
                      })

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


# Post на смену статуса у заявки на консультацию
@csrf_exempt
@require_http_methods(["POST"])
def update_consultation_status(request, request_id):
    """Обновление статуса заявки на консультацию"""
    try:
        consultation = get_object_or_404(ConsultationRequest, id=request_id)
        data = json.loads(request.body)

        new_status = data.get('status')
        if new_status not in ['new', 'in_progress', 'completed', 'cancelled']:
            return JsonResponse({
                'success': False,
                'error': 'Неверный статус'
            }, status=400)

        consultation.status = new_status
        consultation.save()

        return JsonResponse({
            'success': True,
            'message': 'Статус успешно обновлен',
            'new_status': consultation.get_status_display()
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': 'Произошла ошибка при обновлении статуса'
        }, status=500)
