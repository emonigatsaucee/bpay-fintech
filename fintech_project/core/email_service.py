import smtplib
import random
import string
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.core.cache import cache
from django.conf import settings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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
            sender_email = os.getenv('EMAIL_HOST_USER')
            sender_password = os.getenv('EMAIL_HOST_PASSWORD')
            
            if not sender_email or not sender_password:
                print(f"Email credentials missing: email={sender_email}, password={'*' * len(sender_password) if sender_password else None}")
                return False
            
            # Create message
            message = MIMEMultipart()
            message["From"] = sender_email
            message["To"] = email
            message["Subject"] = "BPAY - Your Login Verification Code"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); margin: 0; padding: 20px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }}
                    .header {{ background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 30px; text-align: center; }}
                    .logo-container {{ display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }}
                    .logo {{ width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 15px; }}
                    .brand-name {{ font-size: 28px; font-weight: bold; }}
                    .tagline {{ font-size: 16px; opacity: 0.9; margin-top: 5px; }}
                    .content {{ padding: 50px 40px; text-align: center; }}
                    .title {{ font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 10px; }}
                    .subtitle {{ color: #6b7280; margin-bottom: 30px; font-size: 16px; }}
                    .code-box {{ background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 3px dashed #3b82f6; border-radius: 16px; padding: 30px; margin: 30px 0; }}
                    .code {{ font-size: 36px; font-weight: bold; color: #3b82f6; letter-spacing: 12px; font-family: 'Courier New', monospace; }}
                    .expiry {{ background: #fef3c7; color: #92400e; padding: 12px 20px; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                    .warning {{ background: #fee2e2; color: #dc2626; padding: 15px 20px; border-radius: 8px; font-size: 14px; margin-top: 20px; border-left: 4px solid #dc2626; }}
                    .footer {{ background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }}
                    .footer-logo {{ color: #3b82f6; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo-container">
                            <div class="logo">
                                <span style="color: white; font-weight: bold; font-size: 18px;">BP</span>
                            </div>
                            <div>
                                <div class="brand-name">BPAY</div>
                            </div>
                        </div>
                        <div class="tagline">Easy Bitcoin Payments</div>
                    </div>
                    <div class="content">
                        <h1 class="title">Login Verification Code</h1>
                        <p class="subtitle">Enter this code to complete your secure login</p>
                        <div class="code-box">
                            <div class="code">{code}</div>
                        </div>
                        <div class="expiry">
                            <svg style="width: 16px; height: 16px; display: inline; margin-right: 8px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            This code expires in 5 minutes
                        </div>
                        <div class="warning">
                            <svg style="width: 16px; height: 16px; display: inline; margin-right: 8px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                            Security Notice: If you didn't request this code, please ignore this email and secure your account immediately.
                        </div>
                    </div>
                    <div class="footer">
                        <div class="footer-logo">BPAY</div>
                        © 2025 BPAY - Easy Bitcoin Payments<br>
                        Secure | Fast | Reliable<br><br>
                        This is an automated message, please do not reply.
                    </div>
                </div>
            </body>
            </html>
            """
            
            message.attach(MIMEText(html_body, "html"))
            
            # Send email
            server = smtplib.SMTP(smtp_server, smtp_port)
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
            sender_email = os.getenv('EMAIL_HOST_USER')
            sender_password = os.getenv('EMAIL_HOST_PASSWORD')
            
            if not sender_email or not sender_password:
                return False
            
            message = MIMEMultipart()
            message["From"] = sender_email
            message["To"] = email
            message["Subject"] = "BPAY - Verify Your Registration"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); margin: 0; padding: 20px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }}
                    .header {{ background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 40px 30px; text-align: center; }}
                    .logo {{ width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; }}
                    .content {{ padding: 50px 40px; text-align: center; }}
                    .code-box {{ background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 3px dashed #059669; border-radius: 16px; padding: 30px; margin: 30px 0; }}
                    .code {{ font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 12px; font-family: 'Courier New', monospace; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">
                            <span style="color: white; font-weight: bold; font-size: 18px;">BP</span>
                        </div>
                        <h1 style="margin: 0; font-size: 28px;">Welcome to BPAY</h1>
                        <p style="margin: 5px 0 0; opacity: 0.9;">Verify Your Registration</p>
                    </div>
                    <div class="content">
                        <h1 style="font-size: 24px; color: #1f2937; margin-bottom: 10px;">Complete Your Registration</h1>
                        <p style="color: #6b7280; margin-bottom: 30px;">Enter this code to verify your email and create your account</p>
                        <div class="code-box">
                            <div class="code">{code}</div>
                        </div>
                        <div style="background: #fef3c7; color: #92400e; padding: 12px 20px; border-radius: 8px; margin: 20px 0;">
                            This code expires in 10 minutes
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message.attach(MIMEText(html_body, "html"))
            
            server = smtplib.SMTP(smtp_server, smtp_port)
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
            sender_email = os.getenv('EMAIL_HOST_USER')
            sender_password = os.getenv('EMAIL_HOST_PASSWORD')
            
            if not sender_email or not sender_password:
                return False
            
            message = MIMEMultipart()
            message["From"] = sender_email
            message["To"] = email
            message["Subject"] = "BPAY - Password Reset Code"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); margin: 0; padding: 20px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }}
                    .header {{ background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 40px 30px; text-align: center; }}
                    .logo {{ width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; }}
                    .content {{ padding: 50px 40px; text-align: center; }}
                    .code-box {{ background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 3px dashed #dc2626; border-radius: 16px; padding: 30px; margin: 30px 0; }}
                    .code {{ font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 12px; font-family: 'Courier New', monospace; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">
                            <span style="color: white; font-weight: bold; font-size: 18px;">BP</span>
                        </div>
                        <h1 style="margin: 0; font-size: 28px;">BPAY</h1>
                        <p style="margin: 5px 0 0; opacity: 0.9;">Password Reset Request</p>
                    </div>
                    <div class="content">
                        <h1 style="font-size: 24px; color: #1f2937; margin-bottom: 10px;">Reset Your Password</h1>
                        <p style="color: #6b7280; margin-bottom: 30px;">Enter this code to reset your password</p>
                        <div class="code-box">
                            <div class="code">{code}</div>
                        </div>
                        <div style="background: #fef3c7; color: #92400e; padding: 12px 20px; border-radius: 8px; margin: 20px 0;">
                            This code expires in 5 minutes
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message.attach(MIMEText(html_body, "html"))
            
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Reset email failed: {e}")
            return False