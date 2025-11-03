from django.conf import settings
from django.db import models
from django.contrib.auth.models import User


class Wallet(models.Model):
    CURRENCY_CHOICES = [
        ('NGN', 'Nigerian Naira'),
        ('KES', 'Kenya Shilling'),
        ('BTC', 'Bitcoin'),
        ('ETH', 'Ethereum'),
        ('USDT', 'Tether USD'),
    ]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallets')
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES)
    balance = models.DecimalField(max_digits=30, decimal_places=8, default=0)
    deposit_address = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('owner', 'currency')

    def __str__(self):
        return f"{self.owner.email} - {self.currency}"


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('DEPOSIT', 'Deposit'),
        ('WITHDRAW', 'Withdraw'),
        ('TRANSFER', 'Transfer'),
        ('CONVERT', 'Convert'),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=30, decimal_places=8)
    counterparty = models.CharField(max_length=255, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} {self.amount} {self.wallet.currency}"


class KYCDocument(models.Model):
    STATUS = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='kyc_documents')
    document = models.ImageField(upload_to='kyc/')
    doc_type = models.CharField(max_length=50)
    country = models.CharField(max_length=2, blank=True, null=True)
    extracted_data = models.JSONField(default=dict, blank=True)
    confidence_score = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"KYC {self.user.email} ({self.doc_type}) - {self.status}"


class PaymentGateway(models.Model):
    GATEWAY_TYPES = [
        ('FLUTTERWAVE', 'Flutterwave'),
        ('SASAPAY', 'SasaPay'),
        ('CRYPTO', 'Crypto Business Account'),
    ]
    
    name = models.CharField(max_length=50, choices=GATEWAY_TYPES, unique=True)
    is_active = models.BooleanField(default=True)
    config = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class DepositRequest(models.Model):
    STATUS = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=30, decimal_places=8)
    gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE)
    gateway_reference = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Deposit {self.amount} {self.wallet.currency} - {self.status}"


class WithdrawalRequest(models.Model):
    STATUS = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=30, decimal_places=8)
    gateway = models.ForeignKey(PaymentGateway, on_delete=models.CASCADE)
    gateway_reference = models.CharField(max_length=255, blank=True)
    destination = models.CharField(max_length=255)  # bank account, mobile money, etc
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Withdrawal {self.amount} {self.wallet.currency} - {self.status}"


class ExchangeRate(models.Model):
    from_currency = models.CharField(max_length=10)
    to_currency = models.CharField(max_length=10)
    rate = models.DecimalField(max_digits=20, decimal_places=8)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('from_currency', 'to_currency')

    def __str__(self):
        return f"{self.from_currency}/{self.to_currency}: {self.rate}"


class UserProfile(models.Model):
    VERIFICATION_STATUS = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=200, blank=True, null=True)
    country = models.CharField(max_length=2, blank=True, null=True)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='PENDING')
    daily_limit = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)
    monthly_limit = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} Profile"
    
    def is_verified(self):
        return self.verification_status == 'APPROVED'
    
    def update_limits(self):
        if self.is_verified():
            self.daily_limit = 10000.00
            self.monthly_limit = 50000.00
        else:
            self.daily_limit = 100.00
            self.monthly_limit = 1000.00
        self.save()
        print(f"Updated limits for {self.user.email}: Daily={self.daily_limit}, Monthly={self.monthly_limit}")


class PaymentMethod(models.Model):
    METHOD_TYPES = [
        ('BANK_NG', 'Nigerian Bank Account'),
        ('MPESA', 'M-Pesa'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    method_type = models.CharField(max_length=20, choices=METHOD_TYPES)
    account_number = models.CharField(max_length=50)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_name = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.method_type}"
