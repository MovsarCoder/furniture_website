from django.urls import path

from client_service.views import (
    about_page,
    all_works,
    catalog_view,
    index,
    robots_txt,
    work_detail,
)

app_name = "client_service"

urlpatterns = [
    path("", index, name="index"),
    path("about/", about_page, name="about"),
    path("portfolio/", all_works, name="portfolio"),
    path("portfolio/<int:pk>/", work_detail, name="work_detail"),
    path("catalog/", catalog_view, name="catalog"),
    path("robots.txt", robots_txt, name="robots_txt"),
]
