from django.db import models
from django.conf import settings
from rfqs.models import RFQ


class Quotation(models.Model):
    rfq = models.ForeignKey(
        RFQ,
        on_delete=models.CASCADE,
        related_name='quotations'
    )
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quotations'
    )
    quoted_price = models.DecimalField(max_digits=12, decimal_places=2)
    estimated_delivery_time = models.PositiveIntegerField(
        help_text="Estimated delivery time in days"
    )
    message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['rfq', 'supplier']),
            models.Index(fields=['created_at']),
        ]
        # Unique constraint to prevent duplicate quotations from the same supplier for the same RFQ
        unique_together = ['rfq', 'supplier']

    def __str__(self):
        return f"Quotation #{self.id} on RFQ #{self.rfq_id} by {self.supplier.username} (${self.quoted_price})"
