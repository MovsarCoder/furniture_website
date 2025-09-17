from unfold.admin import ModelAdmin
from django.contrib import admin
from .models import Review, Contact, Work, Stats


@admin.register(Work)
class WorkAdmin(ModelAdmin):
    list_display = ('id', 'title', 'price', 'currency', 'country', 'date', 'language', 'work_type', 'status', 'material', 'width', 'height', 'depth', 'created_at')
    list_editable = ('price', 'currency', 'country', 'date', 'language', 'work_type', 'status', 'material', 'width', 'height', 'depth')
    list_filter = ('work_type', 'status', 'country', 'date', 'created_at', 'language',)
    search_fields = ('title', 'description', "date", "created_at", "status", "work_type", "language", 'country')


@admin.register(Stats)
class StatAdmin(ModelAdmin):
    list_display = ("id", "clients_count", "projects_count", "years_experience", "delivery_weeks")
    list_editable = ("clients_count", "projects_count", "years_experience", "delivery_weeks")


@admin.register(Review)
class ReviewAdmin(ModelAdmin):
    list_display = ('id', 'author_name', 'text', 'date', 'language')
    list_editable = ("text", "language")
    list_filter = ('language', 'date')
    search_fields = ('author_name', 'text', 'language')


@admin.register(Contact)
class ContactAdmin(ModelAdmin):
    list_display = ('id', 'branch_name', 'phone', 'email', 'address', 'latitude', 'longitude', "start_time", "end_time", 'country', 'language')
    list_editable = ("phone", "email", "address", 'latitude', 'longitude', "start_time", "end_time", "country", "language")
    list_filter = ('country', 'language', "start_time", "end_time")
    search_fields = ('branch_name', 'address')
