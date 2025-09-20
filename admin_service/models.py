from django.db import models
from django.db.models import IntegerField

# Create your models here.

class ConsultationRequest(models.Model):
    CONSULTATION_TYPES = [
        ("design", "Дизайн-проект"),
        ("custom", "На заказ"),
        ("repair", "Ремонт/Реставрация"),
        ("general", "Общая консультация"),
    ]
    
    STATUS_CHOICES = [
        ("new", "Новая"),
        ("in_progress", "В обработке"),
        ("completed", "Завершена"),
        ("cancelled", "Отменена"),
    ]
    
    name = models.CharField(max_length=100, verbose_name="Имя клиента")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    email = models.EmailField(blank=True, verbose_name="Email")
    consultation_type = models.CharField(
        max_length=20, 
        choices=CONSULTATION_TYPES, 
        default="general",
        verbose_name="Тип консультации"
    )
    message = models.TextField(blank=True, verbose_name="Сообщение")
    preferred_time = models.CharField(
        max_length=50, 
        blank=True, 
        verbose_name="Предпочтительное время"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default="new",
        verbose_name="Статус"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        verbose_name = "Заявка на консультацию"
        verbose_name_plural = "Заявки на консультацию"
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"{self.name} | {self.phone} | {self.get_consultation_type_display()}"

languages = [
    ("en", "English"),
    ("fr", "Français"),
    ("de", "Deutsch")
]

country = [
    ("am", "America"),
    ("fr", "Français"),
    ("de", "Deutsch")
]

WORK_TYPES = [
    ("custom", "На заказ"),
    ("template", "По шаблону"),
    ("restoration", "Реставрация"),
    ("assembly", "Сборка"),
    ("design", "Дизайн-проект"),
]

STATUSES = [
    ("in_progress", "В производстве"),
    ("completed", "Готово"),
    ("delivered", "Доставлено"),
]

COUNTRIES = [
    ("us", "United States"),
    ("fr", "France"),
    ("de", "Germany"),
]

CURRENCIES = [
    ("usd", "USD $"),
    ("eur", "EUR €"),
]


class Work(models.Model):
    title = models.CharField(max_length=255, blank=True, verbose_name="Название мебели | Тип")
    description = models.TextField(blank=True, verbose_name="Описание мебели")
    image = models.ImageField(upload_to="portfolio/", verbose_name="Фотография мебели")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена", default=0)
    currency = models.CharField(max_length=5, choices=CURRENCIES, default="usd", verbose_name="Валюта")
    country = models.CharField(max_length=5, choices=COUNTRIES, default="us", verbose_name="Страна работы")
    date = models.DateField(blank=True, null=True, verbose_name="Дата изготовления")
    language = models.CharField(max_length=5, choices=languages, verbose_name="Выбор языка на работе")
    work_type = models.CharField(max_length=20, choices=WORK_TYPES, verbose_name="Тип работы", default="custom")
    status = models.CharField(max_length=20, choices=STATUSES, verbose_name="Статус", default="in_progress")
    material = models.CharField(max_length=100, blank=True, verbose_name="Материал")
    width = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True, verbose_name="Ширина (см)")
    height = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True, verbose_name="Высота (см)")
    depth = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True, verbose_name="Глубина (см)")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, verbose_name='Дата добавления')

    class Meta:
        verbose_name = "Работа"
        verbose_name_plural = "Работы"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} | {self.price} {self.currency}"


class Stats(models.Model):
    clients_count = IntegerField(default=0, null=True, blank=True, verbose_name='Количество довольных клиентов')
    projects_count = IntegerField(default=0, null=True, blank=True, verbose_name='Колисество выполненных работ')
    years_experience = IntegerField(default=0, null=True, blank=True, verbose_name='Опыт работы')
    delivery_weeks = IntegerField(default=0, null=True, blank=True, verbose_name='время доставки', help_text='Указывайте количество недель')

    class Meta:
        verbose_name = "Статистика"
        verbose_name_plural = "Статистика"

    def save(self, *args, **kwargs):
        if not self.pk and Stats.objects.exists():
            raise ValueError("Можно создать только одну запись Stats!")
        return super().save(*args, **kwargs)

    def __str__(self):
        return "Статистика компании (Singleton)"


class Review(models.Model):
    author_name = models.CharField(max_length=100, verbose_name="Автор отзыва", blank=True)
    text = models.TextField(blank=True, verbose_name="Текст отзыва")
    date = models.DateField(auto_now_add=True, verbose_name="Дата добавления отзыва", blank=True)
    language = models.CharField(max_length=5, choices=languages, verbose_name="Выбор языка на отзыве")

    class Meta:
        verbose_name = "Отзывы"
        verbose_name_plural = "Отзывы"

    def __str__(self):
        return f"{self.author_name} | {self.text}"


class Contact(models.Model):
    branch_name = models.CharField(max_length=100, verbose_name="Название Филлиала")  # например: "Москва", "Берлин"
    phone = models.CharField(max_length=20, verbose_name="Номер телефона филлиала")
    email = models.EmailField(blank=True, verbose_name="Email филлиала")
    address = models.CharField(max_length=255, blank=True, verbose_name="Адрес филлиала")
    start_time = models.TimeField(blank=True, verbose_name='Открытие филлиала', null=True, help_text='Пример: 9:00')
    end_time = models.TimeField(blank=True, verbose_name='Закрытие филлиала', null=True, help_text='Пример: 24:00')
    whatsapp = models.URLField(blank=True, null=True, verbose_name="Контактный номер в Whastapp", help_text='wa.me/+phone_number')
    instagram = models.URLField(blank=True, null=True, verbose_name="Страница филлиала в Instagram", help_text='https://www.instagram.com/Nickname"')
    country = models.CharField(max_length=15, choices=country, default='am', verbose_name="Страна филлиала")
    language = models.CharField(max_length=5, choices=languages, default="en", verbose_name="Основной язык филлиала")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name="Широта")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, verbose_name="Долгота")

    class Meta:
        verbose_name = "Контакты"
        verbose_name_plural = "Контакты"

    def __str__(self):
        return f"{self.branch_name} | {self.address} | {self.country}"

# Create your models here.
