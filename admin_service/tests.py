import json

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from admin_service.models import ConsultationRequest


class ConsultationRequestViewTests(TestCase):
    def test_public_consultation_post_creates_request(self):
        response = self.client.post(
            reverse("admin_service:consultation_request"),
            data=json.dumps(
                {
                    "name": "Alex",
                    "phone": "+4912345678",
                    "consultation_type": "general",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertEqual(ConsultationRequest.objects.count(), 1)

    def test_management_page_requires_staff_access(self):
        response = self.client.get(reverse("admin_service:consultation_request"))

        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse("admin:login"), response["Location"])

    def test_status_update_requires_staff_access(self):
        request_obj = ConsultationRequest.objects.create(
            name="Alex",
            phone="+4912345678",
        )

        response = self.client.post(
            reverse(
                "admin_service:update_consultation_status",
                args=[request_obj.pk],
            ),
            data=json.dumps({"status": "completed"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertFalse(response.json()["success"])

    def test_staff_can_update_status(self):
        user_model = get_user_model()
        staff_user = user_model.objects.create_user(
            username="manager",
            password="test-pass-123",
            is_staff=True,
        )
        request_obj = ConsultationRequest.objects.create(
            name="Alex",
            phone="+4912345678",
        )

        self.client.force_login(staff_user)
        response = self.client.post(
            reverse(
                "admin_service:update_consultation_status",
                args=[request_obj.pk],
            ),
            data=json.dumps({"status": "completed"}),
            content_type="application/json",
        )

        request_obj.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(request_obj.status, "completed")
