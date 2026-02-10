from unfold.admin import ModelAdmin
from django.contrib import admin
from .models import Review, Contact, Work, Stats, ConsultationRequest, Category, CarouselPhoto
from django.forms import ModelForm
from django.forms.widgets import TimeInput


@admin.register(Work)
class WorkAdmin(ModelAdmin):
    list_display = ('id', 'category', 'title', 'description', "our_work", 'price', 'currency', 'country', 'date', 'language', 'work_type', 'status', 'material', 'width', 'height', 'depth',
                    'created_at')
    list_editable = ('description', "our_work", 'category', 'price', 'currency', 'country', 'date', 'language', 'work_type', 'status', 'material', 'width', 'height', 'depth')
    list_filter = ('our_work', 'work_type', 'category', 'status', 'country', 'date', 'created_at', 'language',)
    search_fields = ('title', 'category', 'description', 'our_work', "date", "created_at", "status", "work_type", "language", 'country')
    date_hierarchy = 'created_at'


@admin.register(Stats)
class StatAdmin(ModelAdmin):
    list_display = ("id", "clients_count", "projects_count", "years_experience", "delivery_weeks")
    list_editable = ("clients_count", "projects_count", "years_experience", "delivery_weeks")


@admin.register(Review)
class ReviewAdmin(ModelAdmin):
    list_display = ('id', 'author_name', 'text', 'rating', 'project_name', 'is_verified', 'helpful_count', 'date', 'language')
    list_editable = ("text", "language", 'rating', 'project_name', 'is_verified')
    list_filter = ('language', 'date', 'rating', 'is_verified')
    search_fields = ('author_name', 'text', 'language')
    date_hierarchy = 'date'


class ContactAdminForm(ModelForm):
    class Meta:
        model = Contact
        fields = "__all__"
        widgets = {
            "start_time": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "end_time": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "monday_open": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "monday_close": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "tuesday_open": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "tuesday_close": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "wednesday_open": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "wednesday_close": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "thursday_open": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "thursday_close": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "friday_open": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "friday_close": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "saturday_open": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "saturday_close": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "sunday_open": TimeInput(format="%H:%M", attrs={"type": "time"}),
            "sunday_close": TimeInput(format="%H:%M", attrs={"type": "time"}),
        }


@admin.register(Contact)
class ContactAdmin(ModelAdmin):
    form = ContactAdminForm

    list_display = ('id', 'branch_name', 'phone', 'email', 'address', 'country', 'language')
    list_editable = ("phone", "email", "address", "country", "language")
    list_filter = ('country', 'language')
    search_fields = ('branch_name', 'address')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('branch_name', 'phone', 'email', 'address', 'country', 'language')
        }),
        ('Время работы по дням недели', {
            'fields': (
                ('monday_open', 'monday_close'),
                ('tuesday_open', 'tuesday_close'),
                ('wednesday_open', 'wednesday_close'),
                ('thursday_open', 'thursday_close'),
                ('friday_open', 'friday_close'),
                ('saturday_open', 'saturday_close'),
                ('sunday_open', 'sunday_close'),
            ),
            'classes': ('collapse',)
        }),
        ('Контакты в соцсетях', {
            'fields': ('whatsapp', 'instagram'),
            'classes': ('collapse',)
        }),
        ('Устаревшие поля (для совместимости)', {
            'fields': ('start_time', 'end_time'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ConsultationRequest)
class ConsultationRequestAdmin(ModelAdmin):
    list_display = ('id', 'name', 'phone', 'email', 'consultation_type', 'status', 'created_at')
    list_editable = ('status',)
    list_filter = ('status', 'consultation_type', 'created_at')
    search_fields = ('name', 'phone', 'email')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Информация о клиенте', {
            'fields': ('name', 'phone', 'email')
        }),
        ('Детали консультации', {
            'fields': ('consultation_type', 'message', 'preferred_time')
        }),
        ('Управление заявкой', {
            'fields': ('status',)
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('id', 'title', 'description')
    list_editable = ('description',)
    list_filter = ('title', 'description')


@admin.register(CarouselPhoto)
class CarouselPhotoAdmin(ModelAdmin):
    list_display = ("title", "is_active", "order", "created_at")
    list_editable = ("is_active", "order")
    list_filter = ("is_active",)
    search_fields = ("title", "caption")
    ordering = ("order", "-created_at")
