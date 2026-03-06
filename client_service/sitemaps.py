from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from admin_service.models import Work


class StaticViewSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return [
            "client_service:index",
            "client_service:about",
            "client_service:portfolio",
            "client_service:catalog",
        ]

    def location(self, item):
        return reverse(item)


class WorkSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        return Work.objects.select_related("category").filter(our_work=True)

    def location(self, obj):
        return reverse("client_service:work_detail", args=[obj.pk])

    def lastmod(self, obj):
        return obj.created_at
