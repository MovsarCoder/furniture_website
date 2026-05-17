from __future__ import annotations

import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _

from admin_service.constants import (
    CONSULTATION_STATUSES,
    CONSULTATION_TYPES,
    COUNTRY_CHOICES,
    DEFAULT_COUNTRY_CODE,
    DEFAULT_LANGUAGE_CODE,
    LANGUAGE_CHOICES,
    WORK_STATUSES,
    WORK_TYPES,
)
from admin_service.validators import IMAGE_EXTENSION_VALIDATOR, validate_image_upload


def work_image_upload_to(instance, filename: str) -> str:
    extension = filename.rsplit(".", 1)[-1].lower()
    return f"portfolio/{instance.work_id}/images/{uuid.uuid4().hex}.{extension}"


class Category(models.Model):
    title = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Название категории",
    )
    description = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Описание категории (не обязательно)",
    )

    class Meta:
        ordering = ["title"]
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

    def __str__(self) -> str:
        return self.title


class Work(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название мебели")
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="works",
        verbose_name="Категория",
    )
    description = models.TextField(blank=True, verbose_name="Описание мебели")
    image = models.ImageField(
        upload_to="portfolio/",
        blank=True,
        null=True,
        verbose_name="Фотография мебели",
        validators=[IMAGE_EXTENSION_VALIDATOR, validate_image_upload],
    )
    country = models.CharField(
        max_length=5,
        choices=COUNTRY_CHOICES,
        default=DEFAULT_COUNTRY_CODE,
        db_index=True,
        verbose_name="Страна работы",
    )
    date = models.DateField(blank=True, null=True, verbose_name="Дата изготовления")
    language = models.CharField(
        max_length=5,
        choices=LANGUAGE_CHOICES,
        default=DEFAULT_LANGUAGE_CODE,
        db_index=True,
        verbose_name="Язык работы",
    )
    work_type = models.CharField(
        max_length=20,
        choices=WORK_TYPES,
        default="custom",
        verbose_name="Тип работы",
    )
    status = models.CharField(
        max_length=20,
        choices=WORK_STATUSES,
        default="in_progress",
        db_index=True,
        verbose_name="Статус",
    )
    material = models.CharField(max_length=100, blank=True, verbose_name="Материал")
    our_work = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Показывать в разделе наши работы",
    )
    width = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Ширина (см)",
    )
    height = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Высота (см)",
    )
    depth = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Глубина (см)",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Дата добавления",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Работа"
        verbose_name_plural = "Работы"
        indexes = [
            models.Index(
                fields=["country", "our_work", "-created_at"],
                name="work_country_showcase_idx",
            ),
            models.Index(
                fields=["language", "-created_at"],
                name="work_language_created_idx",
            ),
        ]

    def __str__(self) -> str:
        return self.title

    @property
    def primary_image(self):
        gallery_files = self.gallery_files
        return gallery_files[0] if gallery_files else None

    @property
    def gallery_files(self) -> list:
        if self.pk:
            prefetched_cache = getattr(self, "_prefetched_objects_cache", {})
            if "images" in prefetched_cache:
                files = [
                    work_image.image
                    for work_image in prefetched_cache["images"]
                    if work_image.image
                ]
            else:
                files = [
                    work_image.image
                    for work_image in self.images.all()
                    if work_image.image
                ]
        else:
            files = []

        if files:
            return files

        return [self.image] if self.image else []


class WorkImage(models.Model):
    work = models.ForeignKey(
        Work,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="Работа",
    )
    image = models.ImageField(
        upload_to=work_image_upload_to,
        verbose_name="Изображение",
        validators=[IMAGE_EXTENSION_VALIDATOR, validate_image_upload],
    )
    order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        verbose_name="Порядок",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Изображение работы"
        verbose_name_plural = "Изображения работы"
        indexes = [
            models.Index(fields=["work", "order"], name="work_image_order_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.work.title} | image #{self.order + 1}"


class Review(models.Model):
    RATING_CHOICES = [
        (1, "1 звезда"),
        (2, "2 звезды"),
        (3, "3 звезды"),
        (4, "4 звезды"),
        (5, "5 звезд"),
    ]

    author_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Автор отзыва",
    )
    text = models.TextField(blank=True, verbose_name="Текст отзыва")
    rating = models.IntegerField(
        choices=RATING_CHOICES,
        default=5,
        verbose_name="Рейтинг",
    )
    project_name = models.CharField(
        max_length=200,
        blank=True,
        default="Мебель на заказ",
        verbose_name="Название проекта",
    )
    is_verified = models.BooleanField(default=True, verbose_name="Проверенный клиент")
    helpful_count = models.IntegerField(
        default=0,
        verbose_name="Количество полезных голосов",
    )
    date = models.DateField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Дата добавления отзыва",
    )
    language = models.CharField(
        max_length=5,
        choices=LANGUAGE_CHOICES,
        default=DEFAULT_LANGUAGE_CODE,
        db_index=True,
        verbose_name="Язык отзыва",
    )

    class Meta:
        ordering = ["-date"]
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        indexes = [
            models.Index(fields=["language", "-date"], name="review_language_date_idx"),
        ]

    def __str__(self) -> str:
        preview = self.text[:50] if self.text else ""
        return f"{self.author_name} | {self.rating} звезд | {preview}..."


class Contact(models.Model):
    branch_name = models.CharField(max_length=100, verbose_name="Название филиала")
    phone = models.CharField(max_length=20, verbose_name="Номер телефона филиала")
    email = models.EmailField(blank=True, verbose_name="Email филиала")
    address = models.CharField(max_length=255, blank=True, verbose_name="Адрес филиала")
    whatsapp = models.URLField(
        blank=True,
        null=True,
        default="https://wa.me/",
        help_text="https://wa.me/<phone_number>",
        verbose_name="Контактный номер в WhatsApp",
    )
    instagram = models.URLField(
        blank=True,
        null=True,
        default="https://www.instagram.com/",
        help_text="https://www.instagram.com/<nickname>/",
        verbose_name="Страница филиала в Instagram",
    )
    country = models.CharField(
        max_length=15,
        choices=COUNTRY_CHOICES,
        default=DEFAULT_COUNTRY_CODE,
        db_index=True,
        verbose_name="Страна филиала",
    )
    language = models.CharField(
        max_length=5,
        choices=LANGUAGE_CHOICES,
        default=DEFAULT_LANGUAGE_CODE,
        db_index=True,
        verbose_name="Основной язык филиала",
    )

    class Meta:
        ordering = ["branch_name"]
        verbose_name = "Контакт"
        verbose_name_plural = "Контакты"

    def __str__(self) -> str:
        return f"{self.branch_name} | {self.address} | {self.country}"

    def save(self, *args, **kwargs) -> None:
        super().save(*args, **kwargs)
        self.ensure_opening_hours()

    def ensure_opening_hours(self) -> None:
        existing_days = set(self.opening_hours.values_list("day", flat=True))
        missing_days = [
            OpeningHour(contact=self, day=day)
            for day in range(7)
            if day not in existing_days
        ]
        if missing_days:
            OpeningHour.objects.bulk_create(missing_days)

    def get_all_opening_hours(self):
        return self.opening_hours.all()


class OpeningHour(models.Model):
    class Day(models.IntegerChoices):
        MONDAY = 0, _("MO")
        TUESDAY = 1, _("DI")
        WEDNESDAY = 2, _("MI")
        THURSDAY = 3, _("DO")
        FRIDAY = 4, _("FR")
        SATURDAY = 5, _("SA")
        SUNDAY = 6, _("SO")

    DAY_FULL = {
        Day.MONDAY: _("Monday"),
        Day.TUESDAY: _("Tuesday"),
        Day.WEDNESDAY: _("Wednesday"),
        Day.THURSDAY: _("Thursday"),
        Day.FRIDAY: _("Friday"),
        Day.SATURDAY: _("Saturday"),
        Day.SUNDAY: _("Sunday"),
    }

    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name="opening_hours",
    )
    day = models.PositiveSmallIntegerField(
        choices=Day.choices,
        verbose_name="День недели",
    )
    is_closed = models.BooleanField(default=False, verbose_name="Выходной")
    open_time = models.TimeField(
        blank=True,
        null=True,
        help_text="Формат: ЧЧ:ММ",
        verbose_name="Открытие",
    )
    close_time = models.TimeField(
        blank=True,
        null=True,
        help_text="Формат: ЧЧ:ММ",
        verbose_name="Закрытие",
    )

    class Meta:
        ordering = ("day",)
        verbose_name = "График работы"
        verbose_name_plural = "График работы"
        constraints = [
            models.UniqueConstraint(
                fields=["contact", "day"],
                name="unique_opening_hour_per_day",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.contact.branch_name} | {self.get_day_display()}"

    @property
    def day_full(self):
        return self.DAY_FULL.get(self.day, "")


class ConsultationRequest(models.Model):
    name = models.CharField(max_length=100, verbose_name="Имя клиента")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    email = models.EmailField(blank=True, verbose_name="Email")
    consultation_type = models.CharField(
        max_length=20,
        choices=CONSULTATION_TYPES,
        default="general",
        verbose_name="Тип консультации",
    )
    message = models.TextField(blank=True, verbose_name="Сообщение")
    preferred_time = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Предпочтительное время",
    )
    status = models.CharField(
        max_length=20,
        choices=CONSULTATION_STATUSES,
        default="new",
        db_index=True,
        verbose_name="Статус",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Дата создания",
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Заявка на консультацию"
        verbose_name_plural = "Заявки на консультацию"

    def __str__(self) -> str:
        return f"{self.name} | {self.phone} | {self.get_consultation_type_display()}"


class CarouselPhoto(models.Model):
    title = models.CharField(max_length=120, default="N/A", verbose_name="Title")
    image = models.ImageField(
        upload_to="carousel/",
        verbose_name="Image",
        validators=[IMAGE_EXTENSION_VALIDATOR, validate_image_upload],
    )
    is_active = models.BooleanField(default=True, db_index=True, verbose_name="Active")
    order = models.PositiveIntegerField(default=0, db_index=True, verbose_name="Order")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Carousel photo"
        verbose_name_plural = "Carousel photos"

    def __str__(self) -> str:
        return self.title


class AboutPageContent(models.Model):
    language = models.CharField(
        max_length=5,
        choices=LANGUAGE_CHOICES,
        unique=True,
        verbose_name="Язык страницы",
    )
    title = models.CharField(
        max_length=200,
        default="About Us",
        verbose_name="Заголовок",
    )
    subtitle = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Подзаголовок",
    )
    content = models.TextField(default="", verbose_name="Основной текст")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        ordering = ["language"]
        verbose_name = "About Us (контент)"
        verbose_name_plural = "About Us (контент)"

    def __str__(self) -> str:
        return f"About Us [{self.language}]"
