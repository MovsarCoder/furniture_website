from django import forms
from django.contrib import admin
from django.db import models
from django.db.models import Max
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline

from admin_service.forms import WorkAdminForm
from admin_service.models import (
    AboutPageContent,
    CarouselPhoto,
    Category,
    ConsultationRequest,
    Contact,
    OpeningHour,
    Review,
    Work,
    WorkImage,
)


class OpeningHourInline(TabularInline):
    model = OpeningHour
    extra = 0
    max_num = 7
    can_delete = False
    fields = ("day", "is_closed", "open_time", "close_time")
    readonly_fields = ("day",)
    ordering = ("day",)
    formfield_overrides = {
        models.TimeField: {
            "widget": forms.TimeInput(attrs={"type": "time", "step": "300"})
        },
    }


class WorkImageInline(TabularInline):
    model = WorkImage
    extra = 0
    max_num = 10
    can_delete = True
    fields = ("preview", "image", "order")
    readonly_fields = ("preview",)
    ordering = ("order", "id")

    def has_add_permission(self, request, obj=None):
        return False

    @admin.display(description="Превью")
    def preview(self, obj):
        if not obj.pk or not obj.image:
            return "—"
        return format_html(
            '<img src="{}" style="width: 96px; height: 72px; object-fit: cover; '
            'border-radius: 8px;" alt="">',
            obj.image.url,
        )


@admin.register(Work)
class WorkAdmin(ModelAdmin):
    form = WorkAdminForm
    list_display = (
        "id",
        "title",
        "category",
        "country",
        "language",
        "work_type",
        "status",
        "our_work",
        "created_at",
    )
    list_editable = ("status", "our_work")
    list_filter = (
        "our_work",
        "work_type",
        "category",
        "status",
        "country",
        "language",
        "created_at",
    )
    search_fields = ("title", "description", "category__title", "material")
    autocomplete_fields = ("category",)
    list_select_related = ("category",)
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    inlines = [WorkImageInline]
    fieldsets = (
        (
            "Основная информация",
            {
                "fields": (
                    "title",
                    "category",
                    "description",
                    "new_images",
                )
            },
        ),
        (
            "Публикация",
            {
                "fields": (
                    "country",
                    "language",
                    "work_type",
                    "status",
                    "our_work",
                )
            },
        ),
        (
            "Характеристики",
            {
                "fields": (
                    "material",
                    "width",
                    "height",
                    "depth",
                    "date",
                )
            },
        ),
    )

    class Media:
        css = {"all": ("admin_service/css/work-images-admin.css",)}
        js = ("admin_service/js/work-images-admin.js",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.prefetch_related("images")

    def get_inline_instances(self, request, obj=None):
        if obj is None:
            return []
        return super().get_inline_instances(request, obj)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)

        work = form.instance
        next_order = (
            work.images.aggregate(max_order=Max("order"))["max_order"] or -1
        ) + 1

        for uploaded_image in form.cleaned_data.get("new_images") or []:
            WorkImage.objects.create(
                work=work,
                image=uploaded_image,
                order=next_order,
            )
            next_order += 1

        self._normalize_image_order(work)

    def _normalize_image_order(self, work):
        for index, image in enumerate(work.images.order_by("order", "id")):
            if image.order != index:
                image.order = index
                image.save(update_fields=["order"])


@admin.register(Review)
class ReviewAdmin(ModelAdmin):
    list_display = (
        "id",
        "author_name",
        "rating",
        "project_name",
        "is_verified",
        "helpful_count",
        "language",
        "date",
    )
    list_editable = ("rating", "is_verified")
    list_filter = ("language", "date", "rating", "is_verified")
    search_fields = ("author_name", "text", "project_name")
    ordering = ("-date",)
    date_hierarchy = "date"


@admin.register(Contact)
class ContactAdmin(ModelAdmin):
    list_display = (
        "id",
        "branch_name",
        "phone",
        "email",
        "country",
        "language",
    )
    list_editable = ("phone", "email")
    list_filter = ("country", "language")
    search_fields = ("branch_name", "phone", "email", "address")
    ordering = ("branch_name",)
    inlines = [OpeningHourInline]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.prefetch_related("opening_hours")

    def get_inline_instances(self, request, obj=None):
        if obj is None:
            return []
        return super().get_inline_instances(request, obj)


@admin.register(ConsultationRequest)
class ConsultationRequestAdmin(ModelAdmin):
    list_display = (
        "id",
        "name",
        "phone",
        "email",
        "consultation_type",
        "status",
        "created_at",
    )
    list_editable = ("status",)
    list_filter = ("status", "consultation_type", "created_at")
    search_fields = ("name", "phone", "email", "message")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"

    fieldsets = (
        ("Информация о клиенте", {"fields": ("name", "phone", "email")}),
        (
            "Детали консультации",
            {"fields": ("consultation_type", "message", "preferred_time")},
        ),
        ("Управление заявкой", {"fields": ("status",)}),
        (
            "Системная информация",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ("id", "title", "description")
    search_fields = ("title", "description")
    ordering = ("title",)


@admin.register(CarouselPhoto)
class CarouselPhotoAdmin(ModelAdmin):
    list_display = ("title", "is_active", "order", "created_at")
    list_editable = ("is_active", "order")
    list_filter = ("is_active",)
    search_fields = ("title",)
    ordering = ("order", "-created_at")


@admin.register(AboutPageContent)
class AboutPageContentAdmin(ModelAdmin):
    list_display = ("language", "title", "updated_at")
    search_fields = ("language", "title", "subtitle", "content")
    readonly_fields = ("updated_at",)
    ordering = ("language",)
