from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User
from .models import RFQ


class RFQTests(TestCase):
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
            username='supplier_inc',
            email='supplier@inc.com',
            password='Password123!',
            role=User.Role.SUPPLIER
        )
        self.rfq_list_create_url = reverse('rfq-list-create')
        self.my_rfqs_url = reverse('rfq-my-list')

    def test_buyer_can_create_rfq(self):
        self.client.force_authenticate(user=self.buyer)
        deadline = (timezone.now() + timedelta(days=7)).isoformat()
        payload = {
            'product_name': 'MacBook Pro M3 Max',
            'description': '10 units for design team with 36GB RAM',
            'quantity': 10,
            'delivery_location': 'New York, NY',
            'deadline': deadline,
        }
        response = self.client.post(self.rfq_list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['product_name'], 'MacBook Pro M3 Max')
        self.assertEqual(response.data['buyer']['username'], 'buyer_corp')
        self.assertEqual(response.data['status'], 'OPEN')

    def test_supplier_cannot_create_rfq(self):
        self.client.force_authenticate(user=self.supplier)
        deadline = (timezone.now() + timedelta(days=7)).isoformat()
        payload = {
            'product_name': 'Test Item',
            'description': 'Description',
            'quantity': 5,
            'delivery_location': 'Austin, TX',
            'deadline': deadline,
        }
        response = self.client.post(self.rfq_list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_past_deadline_rejected_on_rfq_creation(self):
        self.client.force_authenticate(user=self.buyer)
        past_deadline = (timezone.now() - timedelta(days=1)).isoformat()
        payload = {
            'product_name': 'Old Item',
            'description': 'Old description',
            'quantity': 2,
            'delivery_location': 'Chicago, IL',
            'deadline': past_deadline,
        }
        response = self.client.post(self.rfq_list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('deadline', response.data)

    def test_buyer_can_edit_own_rfq(self):
        rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_name='Original Name',
            description='Original Desc',
            quantity=10,
            delivery_location='Seattle, WA',
            deadline=timezone.now() + timedelta(days=5)
        )
        self.client.force_authenticate(user=self.buyer)
        detail_url = reverse('rfq-detail', kwargs={'pk': rfq.id})
        response = self.client.patch(detail_url, {'product_name': 'Updated Name'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['product_name'], 'Updated Name')

    def test_buyer_cannot_edit_another_buyers_rfq(self):
        rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_name='Buyer 1 RFQ',
            description='Desc',
            quantity=10,
            delivery_location='Seattle, WA',
            deadline=timezone.now() + timedelta(days=5)
        )
        self.client.force_authenticate(user=self.other_buyer)
        detail_url = reverse('rfq-detail', kwargs={'pk': rfq.id})
        response = self.client.patch(detail_url, {'product_name': 'Hacked Name'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_supplier_can_browse_and_search_rfqs(self):
        RFQ.objects.create(
            buyer=self.buyer,
            product_name='Dell PowerEdge Server',
            description='Rackmount server',
            quantity=2,
            delivery_location='Dallas, TX',
            deadline=timezone.now() + timedelta(days=10)
        )
        RFQ.objects.create(
            buyer=self.buyer,
            product_name='Ergonomic Office Chairs',
            description='Mesh chairs',
            quantity=50,
            delivery_location='Miami, FL',
            deadline=timezone.now() + timedelta(days=10)
        )
        self.client.force_authenticate(user=self.supplier)
        response = self.client.get(self.rfq_list_create_url + '?search=PowerEdge')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['product_name'], 'Dell PowerEdge Server')

    def test_buyer_can_delete_own_rfq(self):
        rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_name='RFQ to Delete',
            description='To be deleted',
            quantity=5,
            delivery_location='Atlanta, GA',
            deadline=timezone.now() + timedelta(days=3)
        )
        self.client.force_authenticate(user=self.buyer)
        detail_url = reverse('rfq-detail', kwargs={'pk': rfq.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(RFQ.objects.filter(id=rfq.id).exists())

    def test_buyer_cannot_delete_another_buyers_rfq(self):
        rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_name='Protected RFQ',
            description='Do not delete',
            quantity=5,
            delivery_location='Atlanta, GA',
            deadline=timezone.now() + timedelta(days=3)
        )
        self.client.force_authenticate(user=self.other_buyer)
        detail_url = reverse('rfq-detail', kwargs={'pk': rfq.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(RFQ.objects.filter(id=rfq.id).exists())

    def test_rfq_creation_rejects_zero_or_negative_quantity(self):
        self.client.force_authenticate(user=self.buyer)
        deadline = (timezone.now() + timedelta(days=7)).isoformat()
        payload = {
            'product_name': 'Zero Quantity Item',
            'description': 'Description',
            'quantity': 0,
            'delivery_location': 'Boston, MA',
            'deadline': deadline,
        }
        response = self.client.post(self.rfq_list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('quantity', response.data)

    def test_rfq_edit_preserves_past_deadline_if_unchanged(self):
        # If deadline is in the past because time elapsed, buyer can still update status/description
        past_deadline = timezone.now() - timedelta(days=2)
        rfq = RFQ.objects.create(
            buyer=self.buyer,
            product_name='Past Due Item',
            description='Original description',
            quantity=10,
            delivery_location='Seattle, WA',
            deadline=past_deadline
        )
        self.client.force_authenticate(user=self.buyer)
        detail_url = reverse('rfq-detail', kwargs={'pk': rfq.id})
        response = self.client.patch(detail_url, {
            'status': 'CLOSED',
            'deadline': past_deadline.isoformat()
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rfq.refresh_from_db()
        self.assertEqual(rfq.status, 'CLOSED')
