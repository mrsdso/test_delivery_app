from rest_framework import serializers
import logging
from .models import (
    TransportModel, PackagingType, ServiceType, DeliveryStatus, Delivery, TechState
)
from django.contrib.auth.models import User

logger = logging.getLogger(__name__)

class TransportModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportModel
        fields = '__all__'

class PackagingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackagingType
        fields = '__all__'

class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = '__all__'

class DeliveryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryStatus
        fields = '__all__'

class TechStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechState
        fields = ['id', 'name']

class DeliverySerializer(serializers.ModelSerializer):
    media_file = serializers.FileField(required=False, allow_null=True)
    log_file = serializers.FileField(required=False, allow_null=True)
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Delivery
        fields = "__all__"
        read_only_fields = ("created_by_name",)

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
        return None

    def validate(self, data):
        logger.info(f"Validating delivery data: {data}")
        return data

    def create(self, validated_data):
        logger.info(f"Creating delivery with data: {validated_data}")
        return super().create(validated_data)

    def update(self, instance, validated_data):
        logger.info(f"Updating delivery {instance.id} with data: {validated_data}")
        # Не позволяем изменять created_by при обновлении через API
        validated_data.pop('created_by', None)
        return super().update(instance, validated_data)