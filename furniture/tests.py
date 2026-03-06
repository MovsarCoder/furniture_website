from __future__ import annotations

import importlib
from pathlib import Path
from tempfile import TemporaryDirectory

from django.test import SimpleTestCase, override_settings
from django.urls import clear_url_caches, set_urlconf


class MediaServingTests(SimpleTestCase):
    def _reload_project_urls(self) -> None:
        clear_url_caches()
        set_urlconf(None)

        import furniture.urls as project_urls

        importlib.reload(project_urls)

    def tearDown(self) -> None:
        self._reload_project_urls()
        super().tearDown()

    def test_media_files_are_served_when_debug_is_disabled(self):
        with TemporaryDirectory() as media_root:
            media_file = Path(media_root) / "portfolio" / "sample.txt"
            media_file.parent.mkdir(parents=True, exist_ok=True)
            media_file.write_text("media-ok", encoding="utf-8")

            with override_settings(
                DEBUG=False,
                SERVE_MEDIA_FILES=True,
                MEDIA_ROOT=Path(media_root),
                ALLOWED_HOSTS=["testserver"],
            ):
                self._reload_project_urls()
                response = self.client.get("/media/portfolio/sample.txt")

            self.assertEqual(response.status_code, 200)
            self.assertEqual(b"".join(response.streaming_content), b"media-ok")
