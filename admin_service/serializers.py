from rest_framework import serializers
from admin_service.models import *


class WorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Work
        fields = "__all__"


class StatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stats
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"


class OpeningHourSerializer(serializers.ModelSerializer):
    day_label = serializers.CharField(source="get_day_display", read_only=True)
    day_full = serializers.CharField(read_only=True)

    class Meta:
        model = OpeningHour
        fields = ("id", "day", "day_label", "day_full", "is_closed", "open_time", "close_time")


class ContactSerializer(serializers.ModelSerializer):
    opening_hours = OpeningHourSerializer(many=True, read_only=True)

    class Meta:
        model = Contact
        fields = "__all__"


class ConsultationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationRequest
        fields = "__all__"
