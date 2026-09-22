from rest_framework.permissions import BasePermission
from .models import User


class IsBuyer(BasePermission):
    """
    Allows access only to authenticated users with the BUYER role.
    """
    message = "Only buyers are authorized to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.BUYER
        )


class IsSupplier(BasePermission):
    """
    Allows access only to authenticated users with the SUPPLIER role.
    """
    message = "Only suppliers are authorized to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.SUPPLIER
        )
