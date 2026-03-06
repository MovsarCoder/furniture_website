from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import include, path
from django.views.i18n import set_language
from django.views.generic.base import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from client_service.sitemaps import StaticViewSitemap, WorkSitemap

handler404 = "client_service.views.custom_page_not_found"

sitemaps = {
    "static": StaticViewSitemap,
    "works": WorkSitemap,
}

urlpatterns = [
    path("admin/", admin.site.urls),
    path("i18n/setlang/", set_language, name="set_language"),
    path(
        "favicon.ico",
        RedirectView.as_view(
            url=staticfiles_storage.url("images/logo.png"),
            permanent=False,
        ),
    ),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="sitemap"),
    path("admin_service/", include("admin_service.urls")),
    path("", include("client_service.urls")),
]

if settings.DEBUG or settings.SERVE_MEDIA_FILES:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
