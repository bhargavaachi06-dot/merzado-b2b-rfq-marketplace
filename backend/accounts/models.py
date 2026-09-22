from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        BUYER = 'BUYER', 'Buyer'
        SUPPLIER = 'SUPPLIER', 'Supplier'

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.BUYER
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # Ensure email is treated as required
    REQUIRED_FIELDS = ['email']

    def is_buyer(self):
        return self.role == self.Role.BUYER

    def is_supplier(self):
        return self.role == self.Role.SUPPLIER

    def __str__(self):
        return f"{self.username} ({self.role})"
