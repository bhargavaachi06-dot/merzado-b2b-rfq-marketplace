from django.contrib import admin
from .models import RFQ


@admin.register(RFQ)
class RFQAdmin(admin.ModelAdmin):
    list_display = ['id', 'product_name', 'buyer', 'quantity', 'delivery_location', 'deadline', 'status', 'created_at']
    list_filter = ['status', 'deadline', 'created_at']
    search_fields = ['product_name', 'description', 'delivery_location', 'buyer__username']
