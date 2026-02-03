from django.db import models
from django.db.models import IntegerField
import requests
from django.conf import settings

languages = [
    ("fr", "Français"),
    ("at", "Deutsch")
]

country = [
    ("fr", "Français"),
    ("at", "Austria")
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
    ("fr", "France"),
    ("at", "Austria"),
]

CURRENCIES = [
    ("usd", "USD $"),
    ("eur", "EUR €"),
]


class Category(models.Model):
    title = models.CharField(max_length=100, verbose_name="Название категории", unique=True)
    description = models.CharField(max_length=500, blank=True, verbose_name="Описание категории (не обязательно)", )

    def __str__(self):
        return f"{self.title}"


class Work(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название мебели")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="works", verbose_name="Категория")
    description = models.TextField(blank=True, verbose_name="Описание мебели")
    image = models.ImageField(upload_to="portfolio/", blank=True, null=True, verbose_name="Фотография мебели")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена", default=0)
    currency = models.CharField(max_length=5, choices=CURRENCIES, default="usd", verbose_name="Валюта")
    country = models.CharField(max_length=5, choices=COUNTRIES, default="us", verbose_name="Страна работы")
    date = models.DateField(blank=True, null=True, verbose_name="Дата изготовления")
    language = models.CharField(max_length=5, choices=languages, verbose_name="Выбор языка на работе")
    work_type = models.CharField(max_length=20, choices=WORK_TYPES, verbose_name="Тип работы", default="custom")
    status = models.CharField(max_length=20, choices=STATUSES, verbose_name="Статус", default="in_progress")
    material = models.CharField(max_length=100, blank=True, verbose_name="Материал")
    our_work = models.BooleanField(verbose_name="Отобразить в разделе наши работы НЕТ/ДА", blank=True, null=True, default=False)
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
    RATING_CHOICES = [
        (1, '1 звезда'),
        (2, '2 звезды'),
        (3, '3 звезды'),
        (4, '4 звезды'),
        (5, '5 звезд'),
    ]

    author_name = models.CharField(max_length=100, verbose_name="Автор отзыва", blank=True)
    text = models.TextField(blank=True, verbose_name="Текст отзыва")
    rating = models.IntegerField(choices=RATING_CHOICES, default=5, verbose_name="Рейтинг")
    project_name = models.CharField(max_length=200, verbose_name="Название проекта", blank=True, default="Мебель на заказ")
    is_verified = models.BooleanField(default=True, verbose_name="Проверенный клиент")
    helpful_count = models.IntegerField(default=0, verbose_name="Количество полезных голосов")
    date = models.DateField(auto_now_add=True, verbose_name="Дата добавления отзыва", blank=True)
    language = models.CharField(max_length=5, choices=languages, verbose_name="Выбор языка на отзыве")

    class Meta:
        verbose_name = "Отзывы"
        verbose_name_plural = "Отзывы"
        ordering = ['-date']

    def __str__(self):
        return f"{self.author_name} | {self.rating} звезд | {self.text[:50]}..."

    def get_stars_display(self):
        stars = ''
        for i in range(1, 6):
            if i <= self.rating:
                stars += '<span class="star filled">★</span>'
            else:
                stars += '<span class="star">☆</span>'
        return stars


class Contact(models.Model):
    branch_name = models.CharField(max_length=100, verbose_name="Название Филлиала")  # например: "Москва", "Берлин"
    phone = models.CharField(max_length=20, verbose_name="Номер телефона филлиала")
    email = models.EmailField(blank=True, verbose_name="Email филлиала")
    address = models.CharField(max_length=255, blank=True, verbose_name="Адрес филлиала")
    start_time = models.TimeField(blank=True, verbose_name='Открытие филлиала', null=True, help_text='Пример: 9:00')
    end_time = models.TimeField(blank=True, verbose_name='Закрытие филлиала', null=True, help_text='Пример: 24:00')
    whatsapp = models.URLField(blank=True, null=True, verbose_name="Контактный номер в Whastapp", help_text='wa.me/+phone_number', default='wa.me/+')
    instagram = models.URLField(blank=True, null=True, verbose_name="Страница филлиала в Instagram", help_text='https://www.instagram.com/Nickname"', default='https://www.instagram.com/')
    country = models.CharField(max_length=15, choices=country, default='am', verbose_name="Страна филлиала")
    language = models.CharField(max_length=5, choices=languages, default="en", verbose_name="Основной язык филлиала")

    class Meta:
        verbose_name = "Контакты"
        verbose_name_plural = "Контакты"

    def __str__(self):
        return f"{self.branch_name} | {self.address} | {self.country}"

    def save(self, *args, **kwargs):
        if self.address and (not self.latitude or not self.longitude):
            self.get_coordinates_from_address()
        super().save(*args, **kwargs)

    def get_coordinates_from_address(self):
        try:
            api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
            if not api_key:
                return

            address = f"{self.address}, {self.get_country_display()}"
            url = f"https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                'address': address,
                'key': api_key
            }

            response = requests.get(url, params=params)
            data = response.json()

            if data['status'] == 'OK' and data['results']:
                location = data['results'][0]['geometry']['location']
                self.latitude = location['lat']
                self.longitude = location['lng']
        except Exception as e:
            pass


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



class CarouselPhoto(models.Model):
    title = models.CharField(max_length=120, verbose_name="Title")
    caption = models.TextField(blank=True, verbose_name="Caption")
    image = models.ImageField(upload_to="carousel/", verbose_name="Image")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    order = models.PositiveIntegerField(default=0, verbose_name="Order")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Carousel photo"
        verbose_name_plural = "Carousel photos"

    def __str__(self):
        return self.title
