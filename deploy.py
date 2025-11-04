#!/usr/bin/env python3
"""
BPAY Production Deployment Script
Run this to deploy BPAY securely to production
"""

import os
import sys
import secrets
import subprocess

def generate_secret_key():
    """Generate a secure Django secret key"""
    return secrets.token_urlsafe(50)

def create_env_file():
    """Create production .env file"""
    secret_key = generate_secret_key()
    
    env_content = f"""# BPAY Production Environment Variables
# Generated on deployment - DO NOT COMMIT TO VERSION CONTROL

# Django Settings
DJANGO_SECRET_KEY={secret_key}
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://bpay_user:secure_password@localhost:5432/bpay_production

# Redis Cache
REDIS_URL=redis://localhost:6379/0

# Email Settings (Update with your credentials)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Payment Gateway Keys (Update with real keys)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key
SASAPAY_CLIENT_ID=your_sasapay_client_id
SASAPAY_CLIENT_SECRET=your_sasapay_secret
SASAPAY_MERCHANT_CODE=your_merchant_code
CRYPTO_API_KEY=your_crypto_api_key

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Security
SECURE_SSL_REDIRECT=1
SECURE_HSTS_SECONDS=31536000
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file with secure settings")
    print("⚠️  IMPORTANT: Update the placeholder values with your real credentials")

def install_dependencies():
    """Install production dependencies"""
    print("📦 Installing production dependencies...")
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
    print("✅ Dependencies installed")

def setup_database():
    """Setup production database"""
    print("🗄️  Setting up database...")
    os.chdir('fintech_project')
    subprocess.run([sys.executable, 'manage.py', 'migrate'])
    subprocess.run([sys.executable, 'manage.py', 'collectstatic', '--noinput'])
    print("✅ Database setup complete")

def security_checklist():
    """Display security checklist"""
    print("\n🔒 PRODUCTION SECURITY CHECKLIST:")
    print("□ Update .env file with real credentials")
    print("□ Setup PostgreSQL database")
    print("□ Setup Redis cache")
    print("□ Configure SSL certificates (Let's Encrypt)")
    print("□ Setup firewall (only allow ports 80, 443, 22)")
    print("□ Setup backup system")
    print("□ Configure monitoring (Sentry)")
    print("□ Test payment gateways")
    print("□ Setup domain and DNS")
    print("□ Configure web server (Nginx)")

def main():
    print("🚀 BPAY Production Deployment")
    print("=" * 40)
    
    if not os.path.exists('requirements.txt'):
        print("❌ Error: Run this script from the project root directory")
        sys.exit(1)
    
    create_env_file()
    install_dependencies()
    setup_database()
    security_checklist()
    
    print("\n✅ Deployment preparation complete!")
    print("📋 Next steps:")
    print("1. Update .env file with real credentials")
    print("2. Setup production server (Ubuntu/CentOS)")
    print("3. Install PostgreSQL, Redis, Nginx")
    print("4. Configure SSL certificates")
    print("5. Run: gunicorn fintech_project.wsgi:application")

if __name__ == '__main__':
    main()