from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Wallet, Transaction, KYCDocument, UserProfile, PaymentMethod, ExchangeRate

# Customize User admin to show email instead of username
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    list_editable = ('is_active', 'is_staff')
    actions = ['activate_users', 'deactivate_users', 'make_staff', 'remove_staff']
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users activated.')
    activate_users.short_description = 'Activate selected users'
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users deactivated.')
    deactivate_users.short_description = 'Deactivate selected users'
    
    def make_staff(self, request, queryset):
        updated = queryset.update(is_staff=True)
        self.message_user(request, f'{updated} users made staff.')
    make_staff.short_description = 'Make selected users staff'
    
    def remove_staff(self, request, queryset):
        updated = queryset.update(is_staff=False)
        self.message_user(request, f'{updated} users removed from staff.')
    remove_staff.short_description = 'Remove staff privileges'

# Re-register User with custom admin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'full_name', 'country', 'verification_status', 'daily_limit', 'monthly_limit', 'created_at')
    list_filter = ('verification_status', 'country', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'full_name')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('verification_status', 'daily_limit', 'monthly_limit')
    actions = ['approve_users', 'reject_users', 'reset_limits', 'set_high_limits']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    
    def approve_users(self, request, queryset):
        updated = queryset.update(verification_status='APPROVED')
        for profile in queryset:
            profile.update_limits()
        self.message_user(request, f'{updated} users approved and limits updated.')
    approve_users.short_description = 'Approve selected users'
    
    def reject_users(self, request, queryset):
        updated = queryset.update(verification_status='REJECTED')
        self.message_user(request, f'{updated} users rejected.')
    reject_users.short_description = 'Reject selected users'
    
    def reset_limits(self, request, queryset):
        for profile in queryset:
            profile.daily_limit = 100.00
            profile.monthly_limit = 1000.00
            profile.save()
        self.message_user(request, f'Limits reset for {queryset.count()} users.')
    reset_limits.short_description = 'Reset to default limits'
    
    def set_high_limits(self, request, queryset):
        for profile in queryset:
            profile.daily_limit = 50000.00
            profile.monthly_limit = 200000.00
            profile.save()
        self.message_user(request, f'High limits set for {queryset.count()} users.')
    set_high_limits.short_description = 'Set high limits VIP'

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('owner_email', 'currency', 'balance', 'deposit_address', 'created_at')
    list_filter = ('currency', 'created_at')
    search_fields = ('owner__email', 'currency')
    readonly_fields = ('created_at',)
    list_editable = ('balance',)
    actions = ['zero_balances', 'add_bonus_balance', 'freeze_wallets']
    
    def owner_email(self, obj):
        return obj.owner.email
    owner_email.short_description = 'Owner Email'
    
    def zero_balances(self, request, queryset):
        updated = queryset.update(balance=0)
        self.message_user(request, f'{updated} wallet balances set to zero.')
    zero_balances.short_description = 'Zero selected wallet balances'
    
    def add_bonus_balance(self, request, queryset):
        for wallet in queryset:
            if wallet.currency in ['NGN', 'KES']:
                wallet.balance += 1000  # Add 1000 fiat
            else:
                wallet.balance += 0.001  # Add small crypto amount
            wallet.save()
        self.message_user(request, f'Bonus balance added to {queryset.count()} wallets.')
    add_bonus_balance.short_description = 'Add bonus balance'
    
    def freeze_wallets(self, request, queryset):
        # This would require adding a frozen field to the model
        self.message_user(request, f'{queryset.count()} wallets selected for freezing.')
    freeze_wallets.short_description = 'Freeze selected wallets'

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('wallet_owner_email', 'wallet_currency', 'type', 'amount', 'counterparty', 'created_at')
    list_filter = ('type', 'wallet__currency', 'created_at')
    search_fields = ('wallet__owner__email', 'counterparty')
    readonly_fields = ('created_at',)
    
    def wallet_owner_email(self, obj):
        return obj.wallet.owner.email
    wallet_owner_email.short_description = 'User Email'
    
    def wallet_currency(self, obj):
        return obj.wallet.currency
    wallet_currency.short_description = 'Currency'

@admin.register(KYCDocument)
class KYCDocumentAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'doc_type', 'country', 'status', 'confidence_score', 'created_at')
    list_filter = ('status', 'doc_type', 'country', 'created_at')
    search_fields = ('user__email', 'doc_type')
    readonly_fields = ('created_at', 'confidence_score', 'extracted_data')
    list_editable = ('status',)
    actions = ['approve_kyc', 'reject_kyc', 'reset_to_pending', 'bulk_approve_high_confidence']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    
    def approve_kyc(self, request, queryset):
        from django.utils import timezone
        updated = 0
        for kyc in queryset:
            kyc.status = 'APPROVED'
            kyc.reviewed_by = request.user
            kyc.reviewed_at = timezone.now()
            kyc.save()
            
            # Update user profile
            profile, created = UserProfile.objects.get_or_create(user=kyc.user)
            profile.verification_status = 'APPROVED'
            if kyc.country:
                profile.country = kyc.country
            profile.update_limits()
            updated += 1
        
        self.message_user(request, f'{updated} KYC documents approved and user profiles updated.')
    approve_kyc.short_description = 'Approve selected KYC documents'
    
    def reject_kyc(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            status='REJECTED',
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
        self.message_user(request, f'{updated} KYC documents rejected.')
    reject_kyc.short_description = 'Reject selected KYC documents'
    
    def reset_to_pending(self, request, queryset):
        updated = queryset.update(status='PENDING', reviewed_by=None, reviewed_at=None)
        self.message_user(request, f'{updated} KYC documents reset to pending.')
    reset_to_pending.short_description = 'Reset to pending status'
    
    def bulk_approve_high_confidence(self, request, queryset):
        from django.utils import timezone
        high_confidence = queryset.filter(confidence_score__gte=80.0)
        updated = 0
        for kyc in high_confidence:
            kyc.status = 'APPROVED'
            kyc.reviewed_by = request.user
            kyc.reviewed_at = timezone.now()
            kyc.save()
            
            # Update user profile
            profile, created = UserProfile.objects.get_or_create(user=kyc.user)
            profile.verification_status = 'APPROVED'
            if kyc.country:
                profile.country = kyc.country
            profile.update_limits()
            updated += 1
        
        self.message_user(request, f'{updated} high-confidence KYC documents approved.')
    bulk_approve_high_confidence.short_description = 'Approve high confidence documents'

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'method_type', 'account_number', 'bank_name', 'is_active', 'created_at')
    list_filter = ('method_type', 'is_active', 'created_at')
    search_fields = ('user__email', 'account_number', 'bank_name')
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'

@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ('from_currency', 'to_currency', 'rate', 'updated_at')
    list_filter = ('from_currency', 'to_currency', 'updated_at')
    search_fields = ('from_currency', 'to_currency')