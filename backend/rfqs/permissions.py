from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.models import User


class IsBuyerOrReadOnly(BasePermission):
    """
    Allow read-only access to authenticated suppliers, but write access only to buyers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == User.Role.BUYER


class IsRFQOwner(BasePermission):
    """
    Object-level permission to only allow the buyer who created the RFQ to edit or delete it.
    """
    message = "You do not have permission to modify this RFQ."

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to suppliers and the owner buyer
        if request.method in SAFE_METHODS:
            if request.user.role == User.Role.BUYER:
                return obj.buyer == request.user
            return True  # Suppliers can view

        # Write permissions (PUT, PATCH, DELETE) are only allowed to the buyer who owns it
        return obj.buyer == request.user
