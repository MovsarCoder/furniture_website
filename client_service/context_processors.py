from admin_service.models import Work, COUNTRIES


def nav_our_works(request):
    qs = Work.objects.filter(our_work=True).select_related("category")

    if request is not None:
        host_name = request.get_host().removeprefix("bmass.")
        country_codes = {code for code, _ in COUNTRIES}
        if host_name in country_codes:
            qs = qs.filter(country=host_name)

    works = qs.order_by("-created_at")[:12]
    return {
        "nav_our_works": works,
    }
