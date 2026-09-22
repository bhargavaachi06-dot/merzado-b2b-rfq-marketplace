from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import RFQ
from .serializers import RFQSerializer
from .filters import RFQFilter
from .permissions import IsBuyerOrReadOnly, IsRFQOwner
from accounts.permissions import IsBuyer


class RFQListCreateView(generics.ListCreateAPIView):
    """
    GET /api/rfqs/ - Browse RFQs with search and filtering (for Suppliers and Buyers).
    POST /api/rfqs/ - Create new RFQ (Buyer only).
    """
    serializer_class = RFQSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuyerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RFQFilter
    search_fields = ['product_name', 'description', 'delivery_location']
    ordering_fields = ['created_at', 'deadline', 'quantity']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = RFQ.objects.select_related('buyer').prefetch_related('quotations').all()
        # For suppliers browsing RFQs, default to open RFQs unless specified
        status_param = self.request.query_params.get('status')
        if user.is_supplier() and not status_param:
            queryset = queryset.filter(status=RFQ.Status.OPEN)
        return queryset


class MyRFQsListView(generics.ListAPIView):
    """
    GET /api/rfqs/my/ - Retrieve all RFQs created by the authenticated buyer.
    """
    serializer_class = RFQSerializer
    permission_classes = [permissions.IsAuthenticated, IsBuyer]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RFQFilter
    search_fields = ['product_name', 'description', 'delivery_location']
    ordering = ['-created_at']

    def get_queryset(self):
        return RFQ.objects.filter(buyer=self.request.user).select_related('buyer').prefetch_related('quotations')


class RFQDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/rfqs/{id}/ - Retrieve RFQ details (Buyer owner or Supplier).
    PUT /api/rfqs/{id}/ - Update RFQ (Buyer owner only).
    PATCH /api/rfqs/{id}/ - Partial update RFQ (Buyer owner only).
    DELETE /api/rfqs/{id}/ - Delete RFQ (Buyer owner only).
    """
    queryset = RFQ.objects.select_related('buyer').prefetch_related('quotations').all()
    serializer_class = RFQSerializer
    permission_classes = [permissions.IsAuthenticated, IsRFQOwner]
