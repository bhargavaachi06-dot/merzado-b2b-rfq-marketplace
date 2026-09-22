from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django.shortcuts import get_object_or_404

from .models import Quotation
from .serializers import QuotationSerializer
from .permissions import CanViewRFQQuotations, CanViewQuotationDetail
from rfqs.models import RFQ
from accounts.permissions import IsSupplier


class RFQQuotationListCreateView(generics.ListCreateAPIView):
    """
    POST /api/rfqs/{rfq_id}/quotations/ - Submit a quotation for an RFQ (Supplier only).
    GET /api/rfqs/{rfq_id}/quotations/ - View quotations received for this RFQ (Owner Buyer only).
    """
    serializer_class = QuotationSerializer

    def get_rfq(self):
        rfq_id = self.kwargs.get('rfq_id')
        return get_object_or_404(RFQ, pk=rfq_id)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSupplier()]
        # GET request: must be authenticated buyer
        return [permissions.IsAuthenticated(), CanViewRFQQuotations()]

    def get_queryset(self):
        rfq = self.get_rfq()
        # Verify that the requesting user is the owner of the RFQ
        if self.request.user != rfq.buyer:
            raise PermissionDenied("You can only view quotations for RFQs that you own.")
        return Quotation.objects.filter(rfq=rfq).select_related('supplier', 'rfq', 'rfq__buyer')

    def create(self, request, *args, **kwargs):
        rfq = self.get_rfq()

        # Check for duplicate quotation and return HTTP 409 Conflict
        if Quotation.objects.filter(rfq=rfq, supplier=request.user).exists():
            return Response(
                {"detail": "You have already submitted a quotation for this RFQ."},
                status=status.HTTP_409_CONFLICT
            )

        # Prepare data with rfq pk
        data = request.data.copy()
        data['rfq'] = rfq.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class MyQuotationsListView(generics.ListAPIView):
    """
    GET /api/quotations/my/ - Retrieve all quotations submitted by the authenticated supplier.
    """
    serializer_class = QuotationSerializer
    permission_classes = [permissions.IsAuthenticated, IsSupplier]

    def get_queryset(self):
        return Quotation.objects.filter(
            supplier=self.request.user
        ).select_related('supplier', 'rfq', 'rfq__buyer')


class QuotationDetailView(generics.RetrieveAPIView):
    """
    GET /api/quotations/{id}/ - Retrieve quotation details.
    Allowed for the supplier who submitted it or the buyer who owns the RFQ.
    """
    queryset = Quotation.objects.select_related('supplier', 'rfq', 'rfq__buyer').all()
    serializer_class = QuotationSerializer
    permission_classes = [permissions.IsAuthenticated, CanViewQuotationDetail]
