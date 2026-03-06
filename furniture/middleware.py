from __future__ import annotations

import ipaddress

from django.conf import settings
from django.middleware.security import SecurityMiddleware
from django.utils import translation


class LocalhostAwareSecurityMiddleware(SecurityMiddleware):
    """
    Preserves HTTPS enforcement for public domains while keeping local runserver
    accessible over plain HTTP.
    """

    @staticmethod
    def _is_local_host(host: str) -> bool:
        normalized_host = host.strip().lower()
        if normalized_host == "localhost" or normalized_host.endswith(".localhost"):
            return True

        try:
            address = ipaddress.ip_address(normalized_host)
        except ValueError:
            return normalized_host.endswith(".local")

        return address.is_loopback or address.is_private

    def _skip_https_enforcement(self, request) -> bool:
        if getattr(settings, "RUNNING_DEV_SERVER", False):
            return True

        host = request.get_host().split(":", 1)[0]
        return self._is_local_host(host)

    def process_request(self, request):
        if self._skip_https_enforcement(request):
            return None
        return super().process_request(request)

    def process_response(self, request, response):
        response = super().process_response(request, response)

        if not self._skip_https_enforcement(request):
            return response

        response.headers.pop("Strict-Transport-Security", None)
        for cookie in response.cookies.values():
            cookie["secure"] = ""

        return response


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

        request.COOKIES[settings.LANGUAGE_COOKIE_NAME] = language
        translation.activate(language)
        request.LANGUAGE_CODE = language

        response = self.get_response(request)

        cookie_domain = None
        if host and not LocalhostAwareSecurityMiddleware._is_local_host(host):
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
