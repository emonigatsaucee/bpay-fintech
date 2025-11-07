import requests
import json
from django.conf import settings

class AlternativeEmailService:
    """Alternative email service using EmailJS or similar service"""
    
    @staticmethod
    def send_via_emailjs(to_email, subject, message, code):
        """Send email using EmailJS service (client-side)"""
        # This would be handled on the frontend
        return {
            'success': True,
            'service': 'emailjs',
            'template_data': {
                'to_email': to_email,
                'subject': subject,
                'message': message,
                'code': code
            }
        }
    
    @staticmethod
    def send_via_webhook(to_email, subject, message, code):
        """Send email using webhook service like Zapier/Make"""
        try:
            webhook_url = settings.EMAIL_WEBHOOK_URL if hasattr(settings, 'EMAIL_WEBHOOK_URL') else None
            
            if not webhook_url:
                return {'success': False, 'error': 'No webhook URL configured'}
            
            payload = {
                'to': to_email,
                'subject': subject,
                'message': message,
                'code': code,
                'timestamp': str(timezone.now())
            }
            
            response = requests.post(webhook_url, json=payload, timeout=10)
            
            if response.status_code == 200:
                return {'success': True, 'service': 'webhook'}
            else:
                return {'success': False, 'error': f'Webhook failed: {response.status_code}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def send_sms_code(phone_number, code):
        """Send SMS as alternative to email"""
        try:
            # Using a service like Twilio, TextBelt, etc.
            sms_api_key = settings.SMS_API_KEY if hasattr(settings, 'SMS_API_KEY') else None
            
            if not sms_api_key:
                return {'success': False, 'error': 'SMS service not configured'}
            
            # Example with TextBelt (free SMS service)
            response = requests.post('https://textbelt.com/text', {
                'phone': phone_number,
                'message': f'Your BPAY verification code is: {code}',
                'key': sms_api_key,
            }, timeout=10)
            
            result = response.json()
            
            if result.get('success'):
                return {'success': True, 'service': 'sms'}
            else:
                return {'success': False, 'error': result.get('error', 'SMS failed')}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def generate_magic_link(email, code):
        """Generate magic link for passwordless login"""
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        import hashlib
        
        # Create a secure token
        token_data = f"{email}:{code}:{settings.SECRET_KEY}"
        token = hashlib.sha256(token_data.encode()).hexdigest()[:32]
        
        # Encode email for URL
        email_b64 = urlsafe_base64_encode(force_bytes(email))
        
        # Create magic link
        base_url = settings.FRONTEND_URL or 'http://localhost:3000'
        magic_link = f"{base_url}/magic-login?token={token}&email={email_b64}&code={code}"
        
        return {
            'success': True,
            'magic_link': magic_link,
            'token': token
        }