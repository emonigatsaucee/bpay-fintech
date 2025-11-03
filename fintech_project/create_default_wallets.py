import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fintech_project.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Wallet

# Create default wallets for existing users
for user in User.objects.all():
    # Create NGN wallet if doesn't exist
    if not Wallet.objects.filter(owner=user, currency='NGN').exists():
        Wallet.objects.create(owner=user, currency='NGN', balance=0)
        print(f"Created NGN wallet for {user.email}")
    
    # Create KES wallet if doesn't exist  
    if not Wallet.objects.filter(owner=user, currency='KES').exists():
        Wallet.objects.create(owner=user, currency='KES', balance=0)
        print(f"Created KES wallet for {user.email}")

print("Default wallets created successfully!")