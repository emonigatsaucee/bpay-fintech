from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('wallets/', views.WalletListCreateView.as_view(), name='wallet-list'),
    path('wallets/crypto/create/', views.create_crypto_wallet, name='create-crypto-wallet'),
    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),
    path('kyc/', views.KYCListCreateView.as_view(), name='kyc-list'),
    path('rates/update/', views.update_crypto_rates, name='update-rates'),
    path('rates/', views.get_exchange_rates, name='get-rates'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/login-code/', views.request_login_code, name='login_code'),
    path('auth/verify-login/', views.verify_login_code, name='verify_login'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/verify-registration/', views.verify_registration, name='verify_registration'),
    path('auth/forgot-password/', views.forgot_password, name='forgot_password'),
    path('auth/reset-password/', views.reset_password, name='reset_password'),
    path('wallets/convert/', views.convert_currency, name='convert_currency'),
    path('crypto/deposit/', views.crypto_deposit, name='crypto_deposit'),
    path('crypto/withdraw/', views.crypto_withdraw, name='crypto_withdraw'),
    path('admin/kyc/', views.admin_kyc_list, name='admin_kyc_list'),
    path('admin/kyc/<int:kyc_id>/review/', views.admin_review_kyc, name='admin_review_kyc'),
    path('user/profile/', views.user_profile, name='user_profile'),
    path('user/profile/update/', views.update_user_profile, name='update_user_profile'),
    path('payment-methods/', views.payment_methods, name='payment_methods'),
]