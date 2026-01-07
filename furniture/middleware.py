"""
Middleware для определения языка по домену
Поддерживает отдельные домены для каждого языка:
- bmass.at - немецкий
- bmass.fr - французский
"""
from django.utils import translation
from django.conf import settings
from django.utils.translation import get_language


class DomainLanguageMiddleware:
    """
    Middleware для автоматического определения языка по домену.
    Должен быть размещен ПЕРЕД LocaleMiddleware в MIDDLEWARE.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Маппинг доменов на языки из settings
        self.domain_language_map = getattr(settings, 'DOMAIN_LANGUAGE_MAP', {
            'bmass.at': 'de',  # Немецкий
            'www.bmass.at': 'de',
            'bmass.fr': 'fr',  # Французский
            'www.bmass.fr': 'fr',
            'localhost': 'de',  # По умолчанию немецкий для локального тестирования
            '127.0.0.1': 'de',
        })
    
    def __call__(self, request):
        # Получаем домен из запроса
        host = request.get_host().split(':')[0]  # Убираем порт если есть
        
        # Проверяем параметр языка в URL (для локального тестирования)
        lang_from_url = request.GET.get('lang')
        if lang_from_url and lang_from_url in ['de', 'fr']:
            language = lang_from_url
            request.LANGUAGE_CODE = language
            translation.activate(language)
            response = self.get_response(request)
            return response
        
        # Проверяем, есть ли домен в маппинге
        language = self.domain_language_map.get(host)
        
        if language:
            # Устанавливаем язык для этого запроса
            # LocaleMiddleware потом подхватит это значение
            request.LANGUAGE_CODE = language
            # Активируем язык для текущего запроса
            translation.activate(language)
            
            # Ensure the language is preserved in session if needed
            request.session['django_language'] = language
        else:
            # Если домен не найден в маппинге, используем язык по умолчанию (немецкий)
            # Это важно для локального тестирования через 127.0.0.1
            request.LANGUAGE_CODE = settings.LANGUAGE_CODE
            translation.activate(settings.LANGUAGE_CODE)
        
        response = self.get_response(request)
        
        return response

