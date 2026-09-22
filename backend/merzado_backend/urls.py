"""
URL configuration for merzado_backend project.
MERZADO Mini B2B RFQ Marketplace API.
"""

from django.contrib import admin
from django.urls import path, include
from quotations.views import RFQQuotationListCreateView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication APIs
    path('api/auth/', include('accounts.urls')),

    # RFQ APIs
    path('api/rfqs/', include('rfqs.urls')),

    # Quotations nested under RFQ: /api/rfqs/{rfq_id}/quotations/
    path('api/rfqs/<int:rfq_id>/quotations/', RFQQuotationListCreateView.as_view(), name='rfq-quotations-list-create'),

    # Supplier Quotations APIs: /api/quotations/my/ and /api/quotations/{id}/
    path('api/quotations/', include('quotations.urls')),
]
