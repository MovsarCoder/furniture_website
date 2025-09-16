from django.urls import path
from client_service.views import *

# Create your views here.

app_name = "client_service"

urlpatterns = [
    path("", index, name="index"),
    path("portfolio/", all_works, name="portfolio"),
    path("portfolio/<int:pk>/", work_detail, name="work_detail"),
    path("test-404/", lambda request: custom_page_not_found(request, None)),
]
