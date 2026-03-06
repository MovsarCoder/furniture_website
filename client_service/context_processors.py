from __future__ import annotations

from django.conf import settings

from client_service.services import get_navigation_works, resolve_country_code

LANGUAGE_PRESENTATION = {
    "en": {"label": "EN", "name": "English"},
    "de": {"label": "DE", "name": "Deutsch"},
    "fr": {"label": "FR", "name": "Français"},
}


def nav_our_works(request):
    current_host = request.get_host() if request is not None else ""
    country_code = resolve_country_code(current_host)
    current_language = getattr(request, "LANGUAGE_CODE", settings.LANGUAGE_CODE)
    current_host_without_port = current_host.split(":", 1)[0]

    language_options = []
    for code, label in settings.LANGUAGES:
        presentation = LANGUAGE_PRESENTATION.get(code, {"label": code.upper(), "name": str(label)})
        language_options.append(
            {
                "code": code,
                "short_label": presentation["label"],
                "name": presentation["name"],
                "is_active": code == current_language,
                "target_domain": settings.LANGUAGE_DOMAIN_MAP.get(code, ""),
                "current_host": current_host_without_port,
            }
        )

    return {
        "nav_our_works": get_navigation_works(country_code),
        "language_options": language_options,
        "current_language": current_language,
    }
