from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Wallet

@receiver(post_save, sender=User)
def create_default_wallets(sender, instance, created, **kwargs):
    """Create mandatory NGN and KES wallets for new users"""
    if created:
        # Create NGN wallet
        Wallet.objects.create(
            owner=instance,
            currency='NGN',
            balance=0
        )
        
        # Create KES wallet
        Wallet.objects.create(
            owner=instance,
            currency='KES', 
            balance=0
        )