from django.urls import path
from rest_framework.routers import DefaultRouter

from admin_service.views import *

# Create your views here.

app_name = "admin_service"

router = DefaultRouter()
router.register("works", WorkViewSet)
router.register("stats", StatsViewSet)
router.register("reviews", ReviewViewSet)
router.register("contacts", ContactViewSet)
router.register("consultation_requests", ConsultationRequestsViewSet)

urlpatterns = [
    *router.urls,
    path("consultation-request/", consultation_request, name="consultation_request"),
    path("consultation-request/<int:request_id>/update-status/", update_consultation_status, name="update_consultation_status"),
]
