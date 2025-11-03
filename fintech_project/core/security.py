from decimal import Decimal, InvalidOperation
from django.core.exceptions import ValidationError
import re
import logging

logger = logging.getLogger(__name__)

class FinancialValidator:
    """Validate financial operations for security"""
    
    @staticmethod
    def validate_amount(amount, currency):
        """Validate financial amounts"""
        try:
            amount = Decimal(str(amount))
        except (InvalidOperation, ValueError):
            raise ValidationError("Invalid amount format")
        
        if amount <= 0:
            raise ValidationError("Amount must be positive")
        
        # Currency-specific limits
        limits = {
            'NGN': {'min': Decimal('1'), 'max': Decimal('10000000')},  # 1 NGN to 10M NGN
            'KES': {'min': Decimal('1'), 'max': Decimal('1000000')},   # 1 KES to 1M KES
            'BTC': {'min': Decimal('0.00001'), 'max': Decimal('100')}, # 0.00001 to 100 BTC
            'ETH': {'min': Decimal('0.001'), 'max': Decimal('1000')},  # 0.001 to 1000 ETH
            'USDT': {'min': Decimal('1'), 'max': Decimal('100000')},   # 1 to 100K USDT
        }
        
        if currency in limits:
            if amount < limits[currency]['min']:
                raise ValidationError(f"Minimum amount is {limits[currency]['min']} {currency}")
            if amount > limits[currency]['max']:
                raise ValidationError(f"Maximum amount is {limits[currency]['max']} {currency}")
        
        return amount
    
    @staticmethod
    def validate_wallet_address(address, currency):
        """Validate crypto wallet addresses"""
        patterns = {
            'BTC': r'^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$',
            'ETH': r'^0x[a-fA-F0-9]{40}$',
            'USDT': r'^0x[a-fA-F0-9]{40}$',  # USDT on Ethereum
        }
        
        if currency in patterns:
            if not re.match(patterns[currency], address):
                raise ValidationError(f"Invalid {currency} address format")
        
        return address
    
    @staticmethod
    def check_daily_limits(user, amount, currency):
        """Check if transaction exceeds daily limits"""
        from django.utils import timezone
        from datetime import timedelta
        from .models import Transaction
        
        today = timezone.now().date()
        start_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
        
        # Get today's transactions
        today_transactions = Transaction.objects.filter(
            wallet__owner=user,
            wallet__currency=currency,
            created_at__gte=start_of_day,
            type__in=['WITHDRAW', 'TRANSFER']
        )
        
        today_total = sum(t.amount for t in today_transactions)
        user_profile = getattr(user, 'profile', None)
        
        if user_profile:
            daily_limit = user_profile.daily_limit
            if today_total + amount > daily_limit:
                raise ValidationError(f"Daily limit of {daily_limit} {currency} exceeded")
        
        return True

class FraudDetection:
    """Basic fraud detection mechanisms"""
    
    @staticmethod
    def check_suspicious_activity(user, amount, currency):
        """Check for suspicious transaction patterns"""
        from django.utils import timezone
        from datetime import timedelta
        from .models import Transaction
        
        # Check for rapid successive transactions
        last_hour = timezone.now() - timedelta(hours=1)
        recent_transactions = Transaction.objects.filter(
            wallet__owner=user,
            created_at__gte=last_hour
        ).count()
        
        if recent_transactions > 10:
            logger.warning(f"Suspicious activity: {recent_transactions} transactions in last hour for user {user.email}")
            raise ValidationError("Too many transactions in short period. Please contact support.")
        
        # Check for unusually large amounts
        if currency in ['NGN', 'KES'] and amount > Decimal('1000000'):
            logger.warning(f"Large transaction attempt: {amount} {currency} by user {user.email}")
            # Could trigger manual review instead of blocking
        
        return True