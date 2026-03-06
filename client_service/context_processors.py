from __future__ import annotations

from client_service.services import get_navigation_works, resolve_country_code


def nav_our_works(request):
    current_host = request.get_host() if request is not None else ""
    country_code = resolve_country_code(current_host)
    return {"nav_our_works": get_navigation_works(country_code)}
