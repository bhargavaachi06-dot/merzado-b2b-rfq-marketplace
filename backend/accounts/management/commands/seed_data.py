from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from accounts.models import User
from rfqs.models import RFQ
from quotations.models import Quotation


class Command(BaseCommand):
    help = 'Seeds initial demo data with Buyers, Suppliers, RFQs, and Quotations'

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data for MERZADO...")

        # Create or retrieve Buyer
        buyer, _ = User.objects.get_or_create(
            username='buyer1',
            defaults={
                'email': 'buyer@merzado.com',
                'role': User.Role.BUYER
            }
        )
        buyer.set_password('Buyer123!')
        buyer.save()

        # Create or retrieve Suppliers
        supplier1, _ = User.objects.get_or_create(
            username='supplier1',
            defaults={
                'email': 'supplier1@merzado.com',
                'role': User.Role.SUPPLIER
            }
        )
        supplier1.set_password('Supplier123!')
        supplier1.save()

        supplier2, _ = User.objects.get_or_create(
            username='supplier2',
            defaults={
                'email': 'supplier2@merzado.com',
                'role': User.Role.SUPPLIER
            }
        )
        supplier2.set_password('Supplier123!')
        supplier2.save()

        # Create RFQs
        rfq1, _ = RFQ.objects.get_or_create(
            buyer=buyer,
            product_name='Commercial Enterprise Laptops (16GB RAM, 512GB SSD)',
            defaults={
                'description': 'Procurement of 50 enterprise-grade laptops for engineering onboarding. Must include 3-year on-site warranty and Kensington lock support.',
                'quantity': 50,
                'delivery_location': 'Austin Tech Center, TX',
                'deadline': timezone.now() + timedelta(days=14),
                'status': RFQ.Status.OPEN
            }
        )

        rfq2, _ = RFQ.objects.get_or_create(
            buyer=buyer,
            product_name='Heavy-Duty Ergonomic Warehouse Packing Tables',
            defaults={
                'description': 'Adjustable steel workstations with overhead LED lighting and ESD-safe tabletop. Standard dimensions 60" x 30".',
                'quantity': 25,
                'delivery_location': 'Chicago Fulfillment Hub, IL',
                'deadline': timezone.now() + timedelta(days=21),
                'status': RFQ.Status.OPEN
            }
        )

        rfq3, _ = RFQ.objects.get_or_create(
            buyer=buyer,
            product_name='Corrugated Shipping Boxes - Double Wall 18x14x12',
            defaults={
                'description': '20,000 units of corrugated kraft cartons with ECT-44 edge crush test rating.',
                'quantity': 20000,
                'delivery_location': 'Dallas Logistics Center, TX',
                'deadline': timezone.now() + timedelta(days=7),
                'status': RFQ.Status.OPEN
            }
        )

        rfq4, _ = RFQ.objects.get_or_create(
            buyer=buyer,
            product_name='Industrial Backup Diesel Generator 150kW',
            defaults={
                'description': 'Completed procurement for facility emergency standby power.',
                'quantity': 2,
                'delivery_location': 'Denver Facility, CO',
                'deadline': timezone.now() - timedelta(days=3),
                'status': RFQ.Status.CLOSED
            }
        )

        # Create Quotations for rfq1
        Quotation.objects.get_or_create(
            rfq=rfq1,
            supplier=supplier1,
            defaults={
                'quoted_price': Decimal('42500.00'),
                'estimated_delivery_time': 7,
                'message': 'Tier-1 Dell certified partner. Includes 3-year ProSupport next business day on-site.'
            }
        )

        Quotation.objects.get_or_create(
            rfq=rfq1,
            supplier=supplier2,
            defaults={
                'quoted_price': Decimal('39900.00'),
                'estimated_delivery_time': 12,
                'message': 'Lenovo ThinkPad fleet discount pricing. Expedited freight delivery.'
            }
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully!"))
        self.stdout.write(self.style.SUCCESS("Credentials:"))
        self.stdout.write("  Buyer:    username='buyer1',    password='Buyer123!'")
        self.stdout.write("  Supplier: username='supplier1', password='Supplier123!'")
        self.stdout.write("  Supplier: username='supplier2', password='Supplier123!'")
