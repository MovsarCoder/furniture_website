from django.utils import translation
from django.conf import settings

class DomainLanguageMiddleware:
    """
    Middleware для автоматического определения языка по домену.
    Должен быть перед LocaleMiddleware.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.domain_language_map = getattr(settings, 'DOMAIN_LANGUAGE_MAP', {})

    def __call__(self, request):
        host = request.get_host().split(':')[0]  # убираем порт

        # Если указан язык через GET-параметр (например, ?lang=fr)
        lang_from_url = request.GET.get('lang')
        if lang_from_url and lang_from_url in dict(settings.LANGUAGES):
            language = lang_from_url
        else:
            # Определяем язык по домену
            language = self.domain_language_map.get(host, settings.LANGUAGE_CODE)

        # Активируем язык для текущего запроса
        translation.activate(language)
        request.LANGUAGE_CODE = language

        # Получаем ответ
        response = self.get_response(request)

        # Сохраняем язык в cookie, чтобы LocaleMiddleware использовал его
        response.set_cookie(
            settings.LANGUAGE_COOKIE_NAME,  # 'django_language' по умолчанию
            language,
            max_age=365*24*60*60,  # 1 год
            domain=host,  # привязываем cookie к текущему домену
        )

        return response
