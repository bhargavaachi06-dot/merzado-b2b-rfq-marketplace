from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import User


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.me_url = reverse('auth-me')

    def test_register_buyer_successfully(self):
        payload = {
            'username': 'buyer_test',
            'email': 'buyer@example.com',
            'password': 'StrongPassword123!',
            'role': 'BUYER'
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['username'], 'buyer_test')
        self.assertEqual(response.data['user']['role'], 'BUYER')
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_register_supplier_successfully(self):
        payload = {
            'username': 'supplier_test',
            'email': 'supplier@example.com',
            'password': 'StrongPassword123!',
            'role': 'SUPPLIER'
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['role'], 'SUPPLIER')

    def test_register_duplicate_email_fails(self):
        User.objects.create_user(
            username='existing_user',
            email='dup@example.com',
            password='Password123!',
            role='BUYER'
        )
        payload = {
            'username': 'new_user',
            'email': 'dup@example.com',
            'password': 'Password123!',
            'role': 'BUYER'
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_tokens_and_user_info(self):
        User.objects.create_user(
            username='logintest',
            email='login@example.com',
            password='Password123!',
            role='BUYER'
        )
        response = self.client.post(self.login_url, {
            'username': 'logintest',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'BUYER')

    def test_me_endpoint_requires_auth(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint_returns_current_user(self):
        user = User.objects.create_user(
            username='authuser',
            email='auth@example.com',
            password='Password123!',
            role='SUPPLIER'
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'authuser')
        self.assertEqual(response.data['role'], 'SUPPLIER')
