from django.urls import path
from .views import RFQListCreateView, MyRFQsListView, RFQDetailView

urlpatterns = [
    path('', RFQListCreateView.as_view(), name='rfq-list-create'),
    path('my/', MyRFQsListView.as_view(), name='rfq-my-list'),
    path('<int:pk>/', RFQDetailView.as_view(), name='rfq-detail'),
]
