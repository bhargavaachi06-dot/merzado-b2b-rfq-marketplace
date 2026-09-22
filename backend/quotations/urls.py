from django.urls import path
from .views import MyQuotationsListView, QuotationDetailView

urlpatterns = [
    path('my/', MyQuotationsListView.as_view(), name='quotation-my-list'),
    path('<int:pk>/', QuotationDetailView.as_view(), name='quotation-detail'),
]
