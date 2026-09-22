from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User
from rfqs.models import RFQ
from .models import Quotation


class QuotationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.buyer = User.objects.create_user(
            username='buyer_corp',
            email='buyer@corp.com',
            password='Password123!',
            role=User.Role.BUYER
        )
        self.other_buyer = User.objects.create_user(
            username='other_buyer',
            email='other@buyer.com',
            password='Password123!',
            role=User.Role.BUYER
        )
        self.supplier = User.objects.create_user(
            username='supplier_one',
            email='supplier1@inc.com',
            password='Password123!',
            role=User.Role.SUPPLIER
        )
        self.other_supplier = User.objects.create_user(
            username='supplier_two',
            email='supplier2@inc.com',
            password='Password123!',
            role=User.Role.SUPPLIER
        )

        self.open_rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_name='Warehouse Pallets',
            description='Wooden pallets standard size',
            quantity=100,
            delivery_location='Denver, CO',
            deadline=timezone.now() + timedelta(days=7),
            status=RFQ.Status.OPEN
        )

    def test_supplier_can_submit_quotation(self):
        self.client.force_authenticate(user=self.supplier)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': self.open_rfq.id})
        payload = {
            'quoted_price': '2500.00',
            'estimated_delivery_time': 5,
            'message': 'We have ready inventory and can ship immediately.'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quoted_price'], '2500.00')
        self.assertEqual(response.data['supplier']['username'], 'supplier_one')
        self.assertEqual(response.data['estimated_delivery_time'], 5)

    def test_buyer_cannot_submit_quotation(self):
        self.client.force_authenticate(user=self.buyer)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': self.open_rfq.id})
        payload = {
            'quoted_price': '1000.00',
            'estimated_delivery_time': 3,
            'message': 'Buyer trying to quote'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_supplier_cannot_submit_quotation_after_deadline(self):
        expired_rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_name='Expired Item',
            description='Expired',
            quantity=10,
            delivery_location='Denver, CO',
            deadline=timezone.now() - timedelta(days=1),
            status=RFQ.Status.OPEN
        )
        self.client.force_authenticate(user=self.supplier)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': expired_rfq.id})
        payload = {
            'quoted_price': '1200.00',
            'estimated_delivery_time': 4,
            'message': 'Quote after deadline'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_supplier_cannot_submit_quotation_to_closed_rfq(self):
        closed_rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_name='Closed RFQ Item',
            description='Closed',
            quantity=10,
            delivery_location='Denver, CO',
            deadline=timezone.now() + timedelta(days=5),
            status=RFQ.Status.CLOSED
        )
        self.client.force_authenticate(user=self.supplier)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': closed_rfq.id})
        payload = {
            'quoted_price': '1200.00',
            'estimated_delivery_time': 4,
            'message': 'Quote on closed RFQ'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_buyer_can_view_received_quotations_for_their_rfq(self):
        # Create quote
        Quotation.objects.create(
            rfq=self.open_rfq,
            supplier=self.supplier,
            quoted_price=Decimal('2400.00'),
            estimated_delivery_time=4,
            message='First quote'
        )
        # Owner buyer requests quotes
        self.client.force_authenticate(user=self.buyer)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': self.open_rfq.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['quoted_price'], '2400.00')

    def test_other_buyer_cannot_view_quotations_for_another_buyers_rfq(self):
        Quotation.objects.create(
            rfq=self.open_rfq,
            supplier=self.supplier,
            quoted_price=Decimal('2400.00'),
            estimated_delivery_time=4
        )
        self.client.force_authenticate(user=self.other_buyer)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': self.open_rfq.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_supplier_cannot_view_all_quotations_on_rfq(self):
        # Supplier attempts to GET /api/rfqs/{id}/quotations/
        self.client.force_authenticate(user=self.supplier)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': self.open_rfq.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_supplier_can_view_their_own_quotations(self):
        Quotation.objects.create(
            rfq=self.open_rfq,
            supplier=self.supplier,
            quoted_price=Decimal('1800.00'),
            estimated_delivery_time=3,
            message='Fast delivery'
        )
        self.client.force_authenticate(user=self.supplier)
        my_quotes_url = reverse('quotation-my-list')
        response = self.client.get(my_quotes_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['quoted_price'], '1800.00')

    def test_duplicate_quotation_rejected_with_conflict(self):
        Quotation.objects.create(
            rfq=self.open_rfq,
            supplier=self.supplier,
            quoted_price=Decimal('2000.00'),
            estimated_delivery_time=5
        )
        self.client.force_authenticate(user=self.supplier)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': self.open_rfq.id})
        payload = {
            'quoted_price': '1900.00',
            'estimated_delivery_time': 4,
            'message': 'Duplicate bid attempt'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_quotation_rejects_zero_or_negative_price(self):
        self.client.force_authenticate(user=self.supplier)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': self.open_rfq.id})
        payload = {
            'quoted_price': '0.00',
            'estimated_delivery_time': 5
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quoted_price', response.data)

    def test_quotation_rejects_zero_or_negative_delivery_time(self):
        self.client.force_authenticate(user=self.supplier)
        url = reverse('rfq-quotations-list-create', kwargs={'rfq_id': self.open_rfq.id})
        payload = {
            'quoted_price': '1500.00',
            'estimated_delivery_time': 0
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('estimated_delivery_time', response.data)

    def test_supplier_cannot_view_another_suppliers_quotation_detail(self):
        quote = Quotation.objects.create(
            rfq=self.open_rfq,
            supplier=self.supplier,
            quoted_price=Decimal('3000.00'),
            estimated_delivery_time=6
        )
        # Other supplier tries to view quote detail
        self.client.force_authenticate(user=self.other_supplier)
        detail_url = reverse('quotation-detail', kwargs={'pk': quote.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
