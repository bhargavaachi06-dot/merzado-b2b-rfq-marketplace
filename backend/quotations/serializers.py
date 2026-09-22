from rest_framework import serializers
from django.utils import timezone
from .models import Quotation
from rfqs.models import RFQ
from accounts.serializers import UserSerializer


class RFQBriefSerializer(serializers.ModelSerializer):
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)

    class Meta:
        model = RFQ
        fields = [
            'id',
            'product_name',
            'quantity',
            'delivery_location',
            'deadline',
            'status',
            'buyer_username',
        ]


class QuotationSerializer(serializers.ModelSerializer):
    supplier = UserSerializer(read_only=True)
    rfq_details = RFQBriefSerializer(source='rfq', read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id',
            'rfq',
            'rfq_details',
            'supplier',
            'quoted_price',
            'estimated_delivery_time',
            'message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'supplier', 'created_at', 'updated_at']

    def validate_quoted_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quoted price must be greater than zero.")
        return value

    def validate_estimated_delivery_time(self, value):
        if value <= 0:
            raise serializers.ValidationError("Estimated delivery time must be at least 1 day.")
        return value

    def validate_message(self, value):
        if value and len(value) > 2000:
            raise serializers.ValidationError("Message cannot exceed 2000 characters.")
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        rfq = attrs.get('rfq') or getattr(self.instance, 'rfq', None)

        if not rfq:
            raise serializers.ValidationError({"rfq": "RFQ is required."})

        # Ensure user is a supplier
        if request and not request.user.is_supplier():
            raise serializers.ValidationError("Only suppliers can submit quotations.")

        # Check RFQ status
        if rfq.status == RFQ.Status.CLOSED:
            raise serializers.ValidationError("Cannot submit a quotation for a closed RFQ.")

        # Check deadline
        if timezone.now() > rfq.deadline:
            raise serializers.ValidationError("Cannot submit a quotation after the RFQ deadline has passed.")

        # Prevent duplicate quotations by the same supplier on creation
        if not self.instance and request and Quotation.objects.filter(rfq=rfq, supplier=request.user).exists():
            raise serializers.ValidationError("You have already submitted a quotation for this RFQ.")

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['supplier'] = request.user
        return super().create(validated_data)
