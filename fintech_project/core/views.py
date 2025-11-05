from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Wallet, Transaction, KYCDocument, ExchangeRate
from .serializers import WalletSerializer, TransactionSerializer, KYCDocumentSerializer
from .services import CryptoRateService
from .email_service import EmailService
from .luna_service import LunaWalletService
from .kyc_service import KYCVerificationService
from .models import UserProfile, PaymentMethod

class WalletListCreateView(generics.ListCreateAPIView):
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wallet.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_wallets = Wallet.objects.filter(owner=self.request.user)
        return Transaction.objects.filter(wallet__in=user_wallets).order_by('-created_at')

class KYCListCreateView(generics.ListCreateAPIView):
    serializer_class = KYCDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return KYCDocument.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Get country from request data
        country = self.request.data.get('country')
        
        # Save KYC document
        doc = serializer.save(user=self.request.user, country=country)
        
        # Real verification process
        try:
            # Extract data using OCR if available
            result = KYCVerificationService.extract_document_data(
                doc.document.path, 
                doc.doc_type, 
                doc.country
            )
            
            if result['success']:
                doc.extracted_data = result['extracted_data']
                doc.confidence_score = result['confidence_score']
                
                # Auto-detect country if not provided
                if not doc.country:
                    detected_country = KYCVerificationService.determine_country_from_document(
                        result.get('raw_text', ''), doc.doc_type
                    )
                    if detected_country:
                        doc.country = detected_country
                
                # Real verification criteria
                should_approve, reason = KYCVerificationService.auto_approve_kyc(
                    result['extracted_data'], 
                    result['confidence_score'], 
                    doc.doc_type
                )
                
                if should_approve:
                    doc.status = 'APPROVED'
                    from django.utils import timezone
                    doc.reviewed_at = timezone.now()
                    
                    # Update user profile only if truly verified
                    profile, created = UserProfile.objects.get_or_create(user=self.request.user)
                    profile.verification_status = 'APPROVED'
                    if doc.country:
                        profile.country = doc.country
                    profile.update_limits()
                else:
                    # Requires manual review
                    doc.status = 'PENDING'
                    print(f"KYC requires manual review: {reason}")
            else:
                # OCR failed - manual review required
                doc.status = 'PENDING'
                doc.extracted_data = {'error': result.get('error', 'OCR processing failed')}
                doc.confidence_score = 0.0
                print(f"KYC OCR failed: {result.get('error')}")
        
        except Exception as e:
            # Any error - manual review required
            doc.status = 'PENDING'
            doc.confidence_score = 0.0
            doc.extracted_data = {'error': str(e)}
            print(f"KYC processing error: {e}")
        
        doc.save()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_crypto_rates(request):
    """Update crypto exchange rates"""
    success = CryptoRateService.fetch_rates()
    if success:
        return Response({'message': 'Rates updated successfully'})
    else:
        return Response({'error': 'Failed to update rates'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exchange_rates(request):
    """Get current exchange rates"""
    rates = {}
    
    # Get all rates from database
    for rate in ExchangeRate.objects.all():
        key = f"{rate.from_currency}_{rate.to_currency}"
        rates[key] = float(rate.rate)
    
    return Response(rates)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_crypto_wallet(request):
    """Create a new crypto wallet for user"""
    currency = request.data.get('currency')
    print(f"Creating wallet for {request.user.email}, currency: {currency}")
    
    if not currency:
        return Response({'error': 'Currency is required'}, status=400)
    
    if currency not in ['BTC', 'ETH', 'USDT']:
        return Response({'error': f'Invalid currency: {currency}. Must be BTC, ETH, or USDT'}, status=400)
    
    # Check if wallet already exists
    if Wallet.objects.filter(owner=request.user, currency=currency).exists():
        return Response({'error': f'{currency} wallet already exists'}, status=400)
    
    try:
        # Get business deposit address for crypto wallets
        deposit_address = None
        if currency in ['BTC', 'ETH', 'USDT']:
            luna_service = LunaWalletService()
            result = luna_service.get_business_deposit_address(currency)
            if result['success']:
                deposit_address = result['address']
            else:
                return Response({'error': 'Failed to get deposit address'}, status=500)
        
        # Create wallet
        wallet = Wallet.objects.create(
            owner=request.user,
            currency=currency,
            balance=0,
            deposit_address=deposit_address
        )
        
        serializer = WalletSerializer(wallet)
        return Response(serializer.data, status=201)
    except Exception as e:
        print(f"Error creating wallet: {e}")
        return Response({'error': 'Failed to create wallet'}, status=500)

@api_view(['POST'])
@permission_classes([])
def request_login_code(request):
    """Send login verification code"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(email=email)
        if user.check_password(password):
            # Generate and send real verification code
            code = EmailService.generate_code()
            EmailService.store_code(email, code)
            
            if EmailService.send_verification_code(email, code):
                return Response({'message': 'Verification code sent to your email'})
            else:
                return Response({'error': 'Failed to send verification email'}, status=500)
        else:
            return Response({'error': 'Invalid credentials'}, status=400)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=400)
    except Exception as e:
        print(f"Login code error: {e}")
        return Response({'error': 'Login failed'}, status=500)

@api_view(['POST'])
@permission_classes([])
def verify_login_code(request):
    """Verify login code and return token"""
    email = request.data.get('email')
    code = request.data.get('code')
    
    try:
        user = User.objects.get(email=email)
        # Verify real code from cache
        if EmailService.verify_code(email, code):
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            })
        else:
            return Response({'error': 'Invalid or expired code'}, status=400)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=400)

@api_view(['POST'])
@permission_classes([])
def register_user(request):
    """Send registration verification code"""
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        full_name = request.data.get('full_name')
        
        print(f"Registration attempt for: {email}")
        
        if not all([email, password, full_name]):
            return Response({'error': 'Email, password, and full name required'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=400)
        
        # Store registration data temporarily
        code = EmailService.generate_code()
        print(f"Generated code: {code}")
        
        EmailService.store_registration_data(email, {
            'email': email,
            'password': password,
            'full_name': full_name,
            'code': code
        })
        print("Registration data stored")
        
        if EmailService.send_registration_code(email, code):
            print("Email sent successfully")
            return Response({'message': 'Verification code sent to your email'})
        else:
            print("Email sending failed")
            return Response({'error': 'Failed to send verification email'}, status=500)
            
    except Exception as e:
        print(f"Registration error: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Registration failed: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([])
def verify_registration(request):
    """Verify registration code and create account"""
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not all([email, code]):
        return Response({'error': 'Email and code required'}, status=400)
    
    try:
        # Get stored registration data
        reg_data = EmailService.get_registration_data(email)
        if not reg_data or reg_data['code'] != code:
            return Response({'error': 'Invalid or expired code'}, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=reg_data['email'],
            email=reg_data['email'],
            password=reg_data['password'],
            first_name=reg_data['full_name'].split(' ')[0],
            last_name=' '.join(reg_data['full_name'].split(' ')[1:]) if len(reg_data['full_name'].split(' ')) > 1 else ''
        )
        
        # Create profile
        UserProfile.objects.create(
            user=user,
            full_name=reg_data['full_name']
        )
        
        # Create default NGN wallet
        Wallet.objects.create(
            owner=user,
            currency='NGN',
            balance=0
        )
        
        # Clean up stored data
        EmailService.delete_registration_data(email)
        
        return Response({'message': 'Registration successful! You can now login.'})
    except Exception as e:
        return Response({'error': 'Registration verification failed'}, status=500)

@api_view(['POST'])
@permission_classes([])
def forgot_password(request):
    """Send password reset code"""
    email = request.data.get('email')
    
    try:
        user = User.objects.get(email=email)
        # Generate and send reset code
        code = EmailService.generate_code()
        EmailService.store_code(f"reset_{email}", code)
        
        if EmailService.send_reset_code(email, code):
            return Response({'message': 'Reset code sent to your email'})
        else:
            return Response({'error': 'Failed to send email'}, status=500)
    except User.DoesNotExist:
        return Response({'error': 'Email not found'}, status=400)

@api_view(['POST'])
@permission_classes([])
def reset_password(request):
    """Reset password with code"""
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    
    if not all([email, code, new_password]):
        return Response({'error': 'Email, code, and new password required'}, status=400)
    
    try:
        user = User.objects.get(email=email)
        
        # Check if new password is same as current password
        if user.check_password(new_password):
            return Response({'error': 'New password cannot be the same as your current password'}, status=400)
        
        # Verify reset code
        if EmailService.verify_code(f"reset_{email}", code):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'})
        else:
            return Response({'error': 'Invalid or expired code'}, status=400)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def convert_currency(request):
    """Convert fiat to crypto"""
    from_currency = request.data.get('from_currency')
    to_currency = request.data.get('to_currency')
    amount = request.data.get('amount')
    
    try:
        amount = float(amount)
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid amount'}, status=400)
    
    # Get source wallet
    try:
        source_wallet = Wallet.objects.get(owner=request.user, currency=from_currency)
    except Wallet.DoesNotExist:
        return Response({'error': f'{from_currency} wallet not found'}, status=400)
    
    # Check sufficient balance
    if float(source_wallet.balance) < amount:
        return Response({'error': 'Insufficient balance'}, status=400)
    
    # Get or create target wallet
    target_wallet, created = Wallet.objects.get_or_create(
        owner=request.user,
        currency=to_currency,
        defaults={'balance': 0}
    )
    
    # Get conversion rate
    rate = CryptoRateService.get_rate(to_currency, from_currency)
    if not rate:
        return Response({'error': 'Exchange rate not available'}, status=400)
    
    # Calculate converted amount
    converted_amount = amount / float(rate)
    
    try:
        from django.db import transaction
        with transaction.atomic():
            # Deduct from source
            source_wallet.balance = float(source_wallet.balance) - amount
            source_wallet.save()
            
            # Add to target
            target_wallet.balance = float(target_wallet.balance) + converted_amount
            target_wallet.save()
            
            # Record transactions
            Transaction.objects.create(
                wallet=source_wallet,
                type='CONVERT',
                amount=-amount,
                counterparty=f'Convert to {to_currency}',
                metadata={'to_currency': to_currency, 'rate': float(rate), 'converted_amount': converted_amount}
            )
            
            Transaction.objects.create(
                wallet=target_wallet,
                type='CONVERT',
                amount=converted_amount,
                counterparty=f'Convert from {from_currency}',
                metadata={'from_currency': from_currency, 'rate': float(rate), 'source_amount': amount}
            )
        
        return Response({
            'message': 'Conversion successful',
            'converted_amount': converted_amount,
            'rate': float(rate)
        })
        
    except Exception as e:
        print(f"Conversion error: {e}")
        return Response({'error': 'Conversion failed'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crypto_deposit(request):
    """Handle crypto deposit - user sends to business Luna wallet"""
    currency = request.data.get('currency')
    tx_hash = request.data.get('tx_hash')
    amount = request.data.get('amount')
    
    if not all([currency, tx_hash, amount]):
        return Response({'error': 'Currency, tx_hash, and amount required'}, status=400)
    
    try:
        amount = float(amount)
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid amount'}, status=400)
    
    try:
        wallet = Wallet.objects.get(owner=request.user, currency=currency)
        
        # TODO: Verify transaction on blockchain via Luna API
        # For now, auto-approve and credit user balance
        from django.db import transaction
        with transaction.atomic():
            # Credit user wallet
            wallet.balance = float(wallet.balance) + amount
            wallet.save()
            
            # Record transaction
            Transaction.objects.create(
                wallet=wallet,
                type='DEPOSIT',
                amount=amount,
                counterparty='Luna Business Wallet',
                metadata={'tx_hash': tx_hash, 'status': 'confirmed'}
            )
        
        return Response({
            'message': 'Deposit confirmed and credited to your wallet',
            'new_balance': float(wallet.balance)
        })
        
    except Wallet.DoesNotExist:
        return Response({'error': f'{currency} wallet not found'}, status=400)
    except Exception as e:
        return Response({'error': 'Deposit failed'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crypto_withdraw(request):
    """Handle crypto withdrawal to external address"""
    currency = request.data.get('currency')
    amount = request.data.get('amount')
    to_address = request.data.get('to_address')
    
    if not all([currency, amount, to_address]):
        return Response({'error': 'Currency, amount, and to_address required'}, status=400)
    
    try:
        amount = float(amount)
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=400)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid amount'}, status=400)
    
    try:
        wallet = Wallet.objects.get(owner=request.user, currency=currency)
        
        # Check balance
        if float(wallet.balance) < amount:
            return Response({'error': 'Insufficient balance'}, status=400)
        
        # Validate address
        luna_service = LunaWalletService()
        if not luna_service.validate_address(currency, to_address):
            return Response({'error': 'Invalid address format'}, status=400)
        
        # Send via Luna API
        result = luna_service.send_crypto(currency, amount, to_address, request.user.id)
        
        if result['success']:
            from django.db import transaction
            with transaction.atomic():
                # Deduct from wallet
                wallet.balance = float(wallet.balance) - amount
                wallet.save()
                
                # Record transaction
                Transaction.objects.create(
                    wallet=wallet,
                    type='WITHDRAW',
                    amount=-amount,
                    counterparty=to_address,
                    metadata={'tx_hash': result['tx_hash'], 'status': 'pending'}
                )
            
            return Response({
                'message': 'Withdrawal initiated',
                'tx_hash': result['tx_hash']
            })
        else:
            return Response({'error': result['error']}, status=500)
            
    except Wallet.DoesNotExist:
        return Response({'error': f'{currency} wallet not found'}, status=400)
    except Exception as e:
        return Response({'error': 'Withdrawal failed'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_review_kyc(request, kyc_id):
    """Admin manual KYC review"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=403)
    
    action = request.data.get('action')  # 'approve' or 'reject'
    reason = request.data.get('reason', '')
    
    try:
        kyc_doc = KYCDocument.objects.get(id=kyc_id)
        
        if action == 'approve':
            kyc_doc.status = 'APPROVED'
            # Update user profile
            profile, created = UserProfile.objects.get_or_create(user=kyc_doc.user)
            profile.verification_status = 'APPROVED'
            if kyc_doc.country:
                profile.country = kyc_doc.country
            profile.update_limits()
            
        elif action == 'reject':
            kyc_doc.status = 'REJECTED'
            # Update user profile
            profile, created = UserProfile.objects.get_or_create(user=kyc_doc.user)
            profile.verification_status = 'REJECTED'
        
        from django.utils import timezone
        kyc_doc.reviewed_by = request.user
        kyc_doc.reviewed_at = timezone.now()
        kyc_doc.save()
        
        return Response({
            'message': f'KYC {action}d successfully',
            'status': kyc_doc.status
        })
        
    except KYCDocument.DoesNotExist:
        return Response({'error': 'KYC document not found'}, status=404)
    except Exception as e:
        return Response({'error': 'Review failed'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_kyc_list(request):
    """List all KYC documents for admin review"""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=403)
    
    status_filter = request.GET.get('status', 'PENDING')
    kyc_docs = KYCDocument.objects.filter(status=status_filter).order_by('-created_at')
    
    data = []
    for doc in kyc_docs:
        data.append({
            'id': doc.id,
            'user_email': doc.user.email,
            'doc_type': doc.doc_type,
            'country': doc.country,
            'confidence_score': doc.confidence_score,
            'extracted_data': doc.extracted_data,
            'status': doc.status,
            'created_at': doc.created_at,
            'document_url': doc.document.url if doc.document else None
        })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get user profile information"""
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        return Response({
            'email': request.user.email,
            'username': request.user.username,
            'full_name': profile.full_name,
            'country': profile.country,
            'verification_status': profile.verification_status,
            'daily_limit': profile.daily_limit,
            'monthly_limit': profile.monthly_limit,
            'is_verified': profile.is_verified()
        })
    except Exception as e:
        return Response({'error': 'Failed to fetch profile'}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """Update user profile information"""
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        full_name = request.data.get('full_name')
        if full_name:
            profile.full_name = full_name
            profile.save()
            
            # Update User model first_name and last_name
            name_parts = full_name.strip().split(' ', 1)
            request.user.first_name = name_parts[0] if name_parts else ''
            request.user.last_name = name_parts[1] if len(name_parts) > 1 else ''
            request.user.save()
        
        return Response({'message': 'Profile updated successfully'})
    except Exception as e:
        return Response({'error': 'Failed to update profile'}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payment_methods(request):
    """Get or create payment methods"""
    if request.method == 'GET':
        methods = PaymentMethod.objects.filter(user=request.user)
        data = []
        for method in methods:
            if method.method_type == 'BANK_NG':
                name = f"{method.bank_name} - {method.account_number[-4:]}"
                details = f"{method.account_number} ({method.bank_name})"
            else:
                name = f"M-Pesa - {method.account_number[-4:]}"
                details = method.account_number
                
            data.append({
                'id': method.id,
                'type': method.method_type.lower(),
                'name': name,
                'details': details,
                'is_active': method.is_active
            })
        return Response(data)
    
    elif request.method == 'POST':
        method_type = request.data.get('type', '').upper()
        name = request.data.get('name')
        details = request.data.get('details')
        
        if not method_type:
            return Response({'error': 'Type is required'}, status=400)
        
        try:
            if method_type == 'BANK_NG':
                # Extract account number and bank name from details
                account_number = details.split(' (')[0] if details else ''
                bank_name = details.split(' (')[1].replace(')', '') if ' (' in details else ''
                
                method = PaymentMethod.objects.create(
                    user=request.user,
                    method_type='BANK_NG',
                    account_number=account_number,
                    bank_name=bank_name
                )
            elif method_type == 'MPESA':
                method = PaymentMethod.objects.create(
                    user=request.user,
                    method_type='MPESA',
                    account_number=details
                )
            else:
                return Response({'error': 'Invalid method type'}, status=400)
            
            # Return formatted response
            if method.method_type == 'BANK_NG':
                response_name = f"{method.bank_name} - {method.account_number[-4:]}"
                response_details = f"{method.account_number} ({method.bank_name})"
            else:
                response_name = f"M-Pesa - {method.account_number[-4:]}"
                response_details = method.account_number
            
            return Response({
                'id': method.id,
                'type': method.method_type.lower(),
                'name': response_name,
                'details': response_details,
                'is_active': method.is_active
            }, status=201)
        except Exception as e:
            return Response({'error': f'Failed to create payment method: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([])
def test_endpoint(request):
    """Simple test endpoint"""
    return Response({'message': 'Server is working'})