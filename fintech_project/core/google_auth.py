import os
import requests
from django.contrib.auth.models import User
from django.conf import settings
from .models import UserProfile, Wallet

class GoogleAuthService:
    @staticmethod
    def verify_google_token(token):
        """Verify Google OAuth token and return user info"""
        try:
            # Verify token with Google
            response = requests.get(
                f'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={token}',
                timeout=10
            )
            
            if response.status_code != 200:
                return None
                
            token_info = response.json()
            
            # Get user profile from Google
            profile_response = requests.get(
                f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={token}',
                timeout=10
            )
            
            if profile_response.status_code != 200:
                return None
                
            user_info = profile_response.json()
            
            return {
                'email': user_info.get('email'),
                'name': user_info.get('name'),
                'picture': user_info.get('picture'),
                'verified_email': user_info.get('verified_email', False)
            }
            
        except Exception as e:
            print(f"Google token verification failed: {e}")
            return None
    
    @staticmethod
    def get_or_create_user(google_user_info):
        """Get or create user from Google info"""
        try:
            email = google_user_info['email']
            name = google_user_info['name']
            
            # Try to get existing user
            try:
                user = User.objects.get(email=email)
                return user, False
            except User.DoesNotExist:
                pass
            
            # Create new user
            user = User.objects.create_user(
                username=email,
                email=email,
                first_name=name.split(' ')[0] if name else '',
                last_name=' '.join(name.split(' ')[1:]) if name and len(name.split(' ')) > 1 else ''
            )
            
            # Create profile - Google users are auto-verified for email
            UserProfile.objects.create(
                user=user,
                full_name=name,
                verification_status='PENDING'  # Still need KYC for full verification
            )
            
            # Create default NGN wallet
            Wallet.objects.create(
                owner=user,
                currency='NGN',
                balance=0
            )
            
            return user, True
            
        except Exception as e:
            print(f"Error creating Google user: {e}")
            return None, False