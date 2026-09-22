from rest_framework.permissions import BasePermission
from accounts.models import User


class CanViewRFQQuotations(BasePermission):
    """
    Only the buyer who owns the RFQ can view the list of quotations received for it.
    """
    message = "Only the buyer who owns this RFQ can view its received quotations."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.BUYER)


class CanViewQuotationDetail(BasePermission):
    """
    Only the supplier who submitted the quotation OR the buyer who owns the RFQ can view this quotation.
    """
    message = "You do not have permission to view this quotation."

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        return obj.supplier == request.user or obj.rfq.buyer == request.user
