from django.test import TestCase
from django.urls import reverse

from admin_service.models import AboutPageContent, Category, Contact, Review, Work


class ClientPagesTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(title="Shelf")
        cls.at_work = Work.objects.create(
            title="Vienna Shelf",
            category=cls.category,
            country="at",
            language="de",
            our_work=True,
        )
        cls.fr_work = Work.objects.create(
            title="Paris Shelf",
            category=cls.category,
            country="fr",
            language="fr",
            our_work=True,
        )
        cls.catalog_item = Work.objects.create(
            title="Catalog Shelf",
            category=cls.category,
            country="at",
            language="de",
            our_work=False,
        )
        cls.contact = Contact.objects.create(
            branch_name="Vienna",
            phone="+431234567",
            country="at",
            language="de",
        )
        Review.objects.create(
            author_name="Anna",
            text="Great quality",
            rating=5,
            language="de",
        )
        AboutPageContent.objects.create(
            language="de",
            title="Uber uns",
            content="German content",
        )

    def test_portfolio_filters_by_domain_country(self):
        response = self.client.get(
            reverse("client_service:portfolio"),
            HTTP_HOST="bmass.at",
        )

        self.assertEqual(response.status_code, 200)
        works = list(response.context["works"])
        self.assertEqual([work.pk for work in works], [self.at_work.pk])

    def test_catalog_view_excludes_portfolio_items(self):
        response = self.client.get(
            reverse("client_service:catalog"),
            {"category": "Shelf"},
            HTTP_HOST="bmass.at",
        )

        self.assertEqual(response.status_code, 200)
        works = list(response.context["works"])
        self.assertEqual([work.pk for work in works], [self.catalog_item.pk])

    def test_about_page_falls_back_when_english_content_is_missing(self):
        response = self.client.get(reverse("client_service:about"), HTTP_HOST="localhost")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["about_content"].language, "de")

    def test_robots_txt_exposes_sitemap_location(self):
        response = self.client.get(reverse("client_service:robots_txt"), HTTP_HOST="localhost")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/plain")
        self.assertContains(response, "Sitemap: http://localhost/sitemap.xml")

    def test_sitemap_contains_portfolio_work_url(self):
        response = self.client.get(reverse("sitemap"), HTTP_HOST="localhost")

        self.assertEqual(response.status_code, 200)
        self.assertContains(
            response,
            reverse("client_service:work_detail", args=[self.at_work.pk]),
        )
