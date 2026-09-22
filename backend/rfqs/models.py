from django.db import models
from django.conf import settings
from django.utils import timezone


class RFQ(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        CLOSED = 'CLOSED', 'Closed'

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rfqs'
    )
    product_name = models.CharField(max_length=255)
    description = models.TextField()
    quantity = models.PositiveIntegerField()
    delivery_location = models.CharField(max_length=255)
    deadline = models.DateTimeField()
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'deadline']),
            models.Index(fields=['delivery_location']),
        ]

    @property
    def is_expired(self):
        return timezone.now() > self.deadline

    @property
    def can_accept_quotations(self):
        return self.status == self.Status.OPEN and not self.is_expired

    def __str__(self):
        return f"RFQ #{self.id} - {self.product_name} ({self.status})"
