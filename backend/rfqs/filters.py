import django_filters
from .models import RFQ


class RFQFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')
    delivery_location = django_filters.CharFilter(
        field_name='delivery_location',
        lookup_expr='icontains'
    )
    min_quantity = django_filters.NumberFilter(field_name='quantity', lookup_expr='gte')
    max_quantity = django_filters.NumberFilter(field_name='quantity', lookup_expr='lte')

    class Meta:
        model = RFQ
        fields = ['status', 'delivery_location', 'min_quantity', 'max_quantity']
