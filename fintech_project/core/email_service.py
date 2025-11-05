import smtplib
import random
import string
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.core.cache import cache
from django.conf import settings

class EmailService:
    @staticmethod
    def generate_code():
        """Generate 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    @staticmethod
    def send_verification_code(email, code):
        """Send verification code via email"""
        try:
            # Gmail SMTP configuration
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            sender_email = settings.EMAIL_HOST_USER
            sender_password = settings.EMAIL_HOST_PASSWORD
            
            if not sender_email or not sender_password:
                print(f"Email credentials missing: email={sender_email}, password={'*' * len(sender_password) if sender_password else None}")
                return False
            
            # Create message
            message = MIMEMultipart()
            message["From"] = sender_email
            message["To"] = email
            message["Subject"] = "BPAY - Your Login Verification Code"
            
            html_body = f"""
            <html><body>
            <h1>BPAY Login Code</h1>
            <p>Your verification code is: <strong>{code}</strong></p>
            <p>This code expires in 5 minutes.</p>
            </body></html>
            """
            
            message.attach(MIMEText(html_body, "html"))
            
            # Send email with timeout
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False
    
    @staticmethod
    def store_code(email, code):
        """Store verification code in cache for 5 minutes"""
        cache.set(f"login_code_{email}", code, 300)  # 5 minutes
    
    @staticmethod
    def verify_code(email, code):
        """Verify if code matches stored code"""
        stored_code = cache.get(f"login_code_{email}")
        if stored_code and stored_code == code:
            cache.delete(f"login_code_{email}")  # Delete after use
            return True
        return False
    
    @staticmethod
    def store_registration_data(email, data):
        """Store registration data temporarily for 10 minutes"""
        cache.set(f"reg_data_{email}", data, 600)  # 10 minutes
    
    @staticmethod
    def get_registration_data(email):
        """Get stored registration data"""
        return cache.get(f"reg_data_{email}")
    
    @staticmethod
    def delete_registration_data(email):
        """Delete stored registration data"""
        cache.delete(f"reg_data_{email}")
    
    @staticmethod
    def send_registration_code(email, code):
        """Send registration verification code via email"""
        try:
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            sender_email = settings.EMAIL_HOST_USER
            sender_password = settings.EMAIL_HOST_PASSWORD
            
            if not sender_email or not sender_password:
                return False
            
            message = MIMEMultipart()
            message["From"] = sender_email
            message["To"] = email
            message["Subject"] = "BPAY - Verify Your Registration"
            
            html_body = f"""
            <html><body>
            <h1>Welcome to BPAY</h1>
            <p>Your registration code is: <strong>{code}</strong></p>
            <p>This code expires in 10 minutes.</p>
            </body></html>
            """
            
            message.attach(MIMEText(html_body, "html"))
            
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Registration email failed: {e}")
            return False
    
    @staticmethod
    def send_reset_code(email, code):
        """Send password reset code via email"""
        try:
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            sender_email = settings.EMAIL_HOST_USER
            sender_password = settings.EMAIL_HOST_PASSWORD
            
            if not sender_email or not sender_password:
                return False
            
            message = MIMEMultipart()
            message["From"] = sender_email
            message["To"] = email
            message["Subject"] = "BPAY - Password Reset Code"
            
            html_body = f"""
            <html><body>
            <h1>BPAY Password Reset</h1>
            <p>Your reset code is: <strong>{code}</strong></p>
            <p>This code expires in 5 minutes.</p>
            </body></html>
            """
            
            message.attach(MIMEText(html_body, "html"))
            
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Reset email failed: {e}")
            return False