from django.contrib import admin
from .models import Quotation


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ['id', 'rfq', 'supplier', 'quoted_price', 'estimated_delivery_time', 'created_at']
    list_filter = ['created_at']
    search_fields = ['rfq__product_name', 'supplier__username', 'message']
