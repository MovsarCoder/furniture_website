from __future__ import annotations

import json
import logging

from django.contrib.auth.views import redirect_to_login
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.utils.translation import gettext as _
from django.views.decorators.http import require_http_methods
from rest_framework import permissions, viewsets

from admin_service.models import ConsultationRequest, Contact, Review, Work
from admin_service.serializers import (
    ConsultationRequestSerializer,
    ContactSerializer,
    ReviewSerializer,
    WorkSerializer,
)

logger = logging.getLogger(__name__)


class AdminOnlyModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]


class WorkViewSet(AdminOnlyModelViewSet):
    queryset = Work.objects.select_related("category").all()
    serializer_class = WorkSerializer


class ReviewViewSet(AdminOnlyModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class ContactViewSet(AdminOnlyModelViewSet):
    queryset = Contact.objects.prefetch_related("opening_hours").all()
    serializer_class = ContactSerializer


class ConsultationRequestsViewSet(AdminOnlyModelViewSet):
    queryset = ConsultationRequest.objects.all()
    serializer_class = ConsultationRequestSerializer


def _staff_required_response(request: HttpRequest) -> HttpResponse:
    return redirect_to_login(request.get_full_path(), reverse("admin:login"))


def _staff_required_json_response() -> JsonResponse:
    return JsonResponse({"success": False, "error": _("Access denied")}, status=403)


@require_http_methods(["GET", "POST"])
def consultation_request(request: HttpRequest) -> HttpResponse:
    if request.method == "GET":
        if not request.user.is_authenticated or not request.user.is_staff:
            return _staff_required_response(request)

        consultation_queryset = ConsultationRequest.objects.order_by("-created_at")
        return render(
            request,
            "consultation/consultation.html",
            context={
                "consultation_requests": consultation_queryset,
                "total_count": consultation_queryset.count(),
                "new_count": consultation_queryset.filter(status="new").count(),
                "completed_count": consultation_queryset.filter(
                    status="completed"
                ).count(),
            },
        )

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "error": _("Invalid data")},
            status=400,
        )

    name = payload.get("name", "").strip()
    phone = payload.get("phone", "").strip()
    email = payload.get("email", "").strip()
    consultation_type = payload.get("consultation_type", "general")
    message = payload.get("message", "").strip()
    preferred_time = payload.get("preferred_time", "").strip()

    if not name or not phone:
        return JsonResponse(
            {"success": False, "error": _("Name and phone are required")},
            status=400,
        )

    allowed_consultation_types = {
        choice for choice, _ in ConsultationRequest._meta.get_field("consultation_type").choices
    }
    if consultation_type not in allowed_consultation_types:
        consultation_type = "general"

    try:
        consultation = ConsultationRequest.objects.create(
            name=name,
            phone=phone,
            email=email,
            consultation_type=consultation_type,
            message=message,
            preferred_time=preferred_time,
        )
    except Exception:
        logger.exception("Failed to create consultation request")
        return JsonResponse(
            {
                "success": False,
                "error": _(
                    "An error occurred while processing the request. Please try again later."
                ),
            },
            status=500,
        )

    return JsonResponse(
        {
            "success": True,
            "message": _(
                "Thank you! Your request has been accepted. We will contact you soon."
            ),
            "consultation_id": consultation.id,
        }
    )


@require_http_methods(["POST"])
def update_consultation_status(request: HttpRequest, request_id: int) -> JsonResponse:
    if not request.user.is_authenticated or not request.user.is_staff:
        return _staff_required_json_response()

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"success": False, "error": _("Invalid data")},
            status=400,
        )

    new_status = payload.get("status")
    valid_statuses = {
        choice for choice, _ in ConsultationRequest._meta.get_field("status").choices
    }
    if new_status not in valid_statuses:
        return JsonResponse(
            {"success": False, "error": _("Invalid status")},
            status=400,
        )

    try:
        consultation = get_object_or_404(ConsultationRequest, id=request_id)
        consultation.status = new_status
        consultation.save(update_fields=["status", "updated_at"])
    except Exception:
        logger.exception("Failed to update consultation request status", extra={"request_id": request_id})
        return JsonResponse(
            {
                "success": False,
                "error": _("An error occurred while updating status"),
            },
            status=500,
        )

    return JsonResponse(
        {
            "success": True,
            "message": _("Status updated successfully"),
            "new_status": consultation.get_status_display(),
        }
    )
