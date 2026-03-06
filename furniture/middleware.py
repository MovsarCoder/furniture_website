from __future__ import annotations

from django.conf import settings
from django.utils import translation


class DomainLanguageMiddleware:
    """
    Resolves the active language from a domain mapping before LocaleMiddleware.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.domain_language_map = getattr(settings, "DOMAIN_LANGUAGE_MAP", {})
        self.supported_languages = dict(settings.LANGUAGES)

    def __call__(self, request):
        host = request.get_host().split(":", 1)[0].strip().lower()
        requested_language = request.GET.get("lang")

        if requested_language in self.supported_languages:
            language = requested_language
        else:
            language = self.domain_language_map.get(host, settings.LANGUAGE_CODE)

        translation.activate(language)
        request.LANGUAGE_CODE = language

        response = self.get_response(request)

        cookie_domain = None
        if host and host not in {"localhost", "127.0.0.1"}:
            cookie_domain = host

        if request.COOKIES.get(settings.LANGUAGE_COOKIE_NAME) != language:
            response.set_cookie(
                settings.LANGUAGE_COOKIE_NAME,
                language,
                max_age=365 * 24 * 60 * 60,
                domain=cookie_domain,
                secure=getattr(settings, "LANGUAGE_COOKIE_SECURE", False),
                samesite=getattr(settings, "LANGUAGE_COOKIE_SAMESITE", "Lax"),
            )

        return response
