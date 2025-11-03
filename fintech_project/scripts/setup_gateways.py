#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fintech_project.settings')
django.setup()

from core.models import PaymentGateway, ExchangeRate
from decimal import Decimal

def setup_payment_gateways():
    """Initialize payment gateways"""
    gateways = [
        {
            'name': 'FLUTTERWAVE',
            'config': {
                'base_url': 'https://api.flutterwave.com/v3',
                'supported_currencies': ['NGN']
            }
        },
        {
            'name': 'SASAPAY',
            'config': {
                'base_url': 'https://sandbox.sasapay.app/api/v1',
                'supported_currencies': ['KES']
            }
        },
        {
            'name': 'CRYPTO',
            'config': {
                'supported_currencies': ['BTC', 'ETH']
            }
        }
    ]
    
    for gateway_data in gateways:
        gateway, created = PaymentGateway.objects.get_or_create(
            name=gateway_data['name'],
            defaults={
                'config': gateway_data['config'],
                'is_active': True
            }
        )
        if created:
            print(f"Created payment gateway: {gateway.name}")
        else:
            print(f"Payment gateway already exists: {gateway.name}")

def setup_exchange_rates():
    """Initialize exchange rates"""
    rates = [
        ('NGN', 'KES', Decimal('0.32')),
        ('KES', 'NGN', Decimal('3.12')),
        ('NGN', 'USD', Decimal('0.0024')),
        ('KES', 'USD', Decimal('0.0075')),
        ('BTC', 'USD', Decimal('45000')),
        ('ETH', 'USD', Decimal('3000')),
        ('USD', 'NGN', Decimal('416.67')),
        ('USD', 'KES', Decimal('133.33')),
        ('USD', 'BTC', Decimal('0.000022')),
        ('USD', 'ETH', Decimal('0.000333')),
    ]
    
    for from_curr, to_curr, rate in rates:
        exchange_rate, created = ExchangeRate.objects.get_or_create(
            from_currency=from_curr,
            to_currency=to_curr,
            defaults={'rate': rate}
        )
        if created:
            print(f"Created exchange rate: {from_curr}/{to_curr} = {rate}")
        else:
            exchange_rate.rate = rate
            exchange_rate.save()
            print(f"Updated exchange rate: {from_curr}/{to_curr} = {rate}")

if __name__ == '__main__':
    print("Setting up payment gateways...")
    setup_payment_gateways()
    
    print("\nSetting up exchange rates...")
    setup_exchange_rates()
    
    print("\nSetup completed successfully!")