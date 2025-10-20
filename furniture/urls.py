"""
URL configuration for furniture project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.urls import re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf.urls.i18n import i18n_patterns
from django.views.i18n import set_language

handler404 = 'client_service.views.custom_page_not_found'

urlpatterns = [
    path('admin/', admin.site.urls),
    # Language switching endpoint
    path('i18n/setlang/', set_language, name='set_language'),
    
    # Auto documentation drf_spectacular
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    
    # Serve static and media files explicitly for both DEBUG modes
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

# Internationalized URLs
urlpatterns += i18n_patterns(
    path("i18n/", include("django.conf.urls.i18n")),
    path("admin_service/", include("admin_service.urls")),
    path("", include("client_service.urls")),  # Root website
    prefix_default_language=False,
)