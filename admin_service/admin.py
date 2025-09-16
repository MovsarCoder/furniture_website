from unfold.admin import ModelAdmin
from django.contrib import admin
from .models import Review, Contact, Work


@admin.register(Work)
class WorkAdmin(ModelAdmin):
    list_display = ('title', 'price', 'currency', 'country', 'work_type', 'status', 'created_at')
    list_editable = ("price", "currency", "country", "work_type", "status")
    list_filter = ('work_type', 'status', 'country')
    search_fields = ('title', 'description')


@admin.register(Review)
class ReviewAdmin(ModelAdmin):
    list_display = ('author_name', 'text', 'date', 'language')
    list_editable = ("text", "language")
    list_filter = ('language',)
    search_fields = ('author_name', 'text')


@admin.register(Contact)
class ContactAdmin(ModelAdmin):
    list_display = ('branch_name', 'phone', 'email', 'address', "start_time", "end_time", 'country', 'language')
    list_editable = ("phone", "email", "address", "start_time", "end_time", "country", "language")
    list_filter = ('country', 'language', "start_time", "end_time")
    search_fields = ('branch_name', 'address')
