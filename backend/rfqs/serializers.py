from rest_framework import serializers
from django.utils import timezone
from .models import RFQ
from accounts.serializers import UserSerializer


class RFQSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    can_accept_quotations = serializers.BooleanField(read_only=True)
    quotations_count = serializers.SerializerMethodField()

    class Meta:
        model = RFQ
        fields = [
            'id',
            'buyer',
            'product_name',
            'description',
            'quantity',
            'delivery_location',
            'deadline',
            'status',
            'is_expired',
            'can_accept_quotations',
            'quotations_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'buyer', 'created_at', 'updated_at']

    def get_quotations_count(self, obj):
        return obj.quotations.count()

    def validate_product_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Product name is required.")
        val = value.strip()
        if len(val) > 255:
            raise serializers.ValidationError("Product name cannot exceed 255 characters.")
        return val

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Description is required.")
        return value.strip()

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

    def validate_delivery_location(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Delivery location is required.")
        val = value.strip()
        if len(val) > 255:
            raise serializers.ValidationError("Delivery location cannot exceed 255 characters.")
        return val

    def validate_deadline(self, value):
        # When updating, if deadline remains unchanged, permit it even if time has progressed
        if self.instance and self.instance.deadline == value:
            return value
        if value <= timezone.now():
            raise serializers.ValidationError("Deadline must be a valid future date and time.")
        return value

    def create(self, validated_data):
        # Automatically assign the logged-in buyer
        request = self.context.get('request')
        validated_data['buyer'] = request.user
        return super().create(validated_data)
