# BPAY - Multi-Currency Wallet System

A complete fintech solution supporting NGN, KES, and cryptocurrency wallets with integrated payment gateways, user-to-user transfers, currency conversion, and KYC compliance.

## 🚀 Features

### Core Functionality
- **Multi-Currency Wallets**: NGN, KES, BTC, ETH support
- **User-to-User Transfers**: Send money between users across currencies
- **Deposit/Withdrawal**: Integrated payment gateways
- **Currency Conversion**: Real-time exchange rates
- **KYC Compliance**: Document upload and admin review system

### Payment Integrations
- **NGN**: Flutterwave (deposits & withdrawals)
- **KES**: SasaPay (M-Pesa integration)
- **Crypto**: Business account integration

### Modern Frontend
- React.js with Tailwind CSS
- Real-time balance updates
- Mobile-responsive design
- Intuitive wallet management

## 🛠️ Developer Setup

### First Time Setup
```powershell
# Clone and setup virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Database setup
cd fintech_project
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Install frontend dependencies
cd ../frontend
npm install
```

### Daily Development (2 Terminals)

**Terminal 1 - Backend:**
```powershell
cd C:\Users\USER\fintech
.\.venv\Scripts\Activate.ps1
cd fintech_project
python manage.py runserver
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\USER\fintech\frontend
npm start
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

## 📡 API Endpoints

### Authentication
- `POST /api/auth/token/` - Login
- `POST /api/auth/token/refresh/` - Refresh token

### Wallets
- `GET /api/wallets/` - List user wallets
- `POST /api/wallets/` - Create new wallet
- `POST /api/wallets/{id}/transfer/` - Send money
- `POST /api/wallets/{id}/deposit/` - Deposit funds
- `POST /api/wallets/{id}/withdraw/` - Withdraw funds
- `POST /api/wallets/{id}/convert/` - Convert currency

### Transactions
- `GET /api/transactions/` - Transaction history

### KYC
- `GET /api/kyc/` - List KYC documents
- `POST /api/kyc/` - Upload document
- `POST /api/kyc/{id}/review/` - Admin review (staff only)

## 🔧 Configuration

### Environment Variables
```bash
# Payment Gateway Keys
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public
SASAPAY_CLIENT_ID=your_sasapay_client_id
SASAPAY_CLIENT_SECRET=your_sasapay_secret
SASAPAY_MERCHANT_CODE=your_merchant_code
CRYPTO_API_KEY=your_crypto_api_key

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Django
DJANGO_SECRET_KEY=your_django_secret
DJANGO_DEBUG=1
```

## 💳 Payment Gateway Integration

### Flutterwave (NGN)
- Handles Nigerian Naira deposits and withdrawals
- Bank transfer integration
- Webhook support for real-time updates

### SasaPay (KES)
- M-Pesa STK Push for deposits
- B2C transfers for withdrawals
- Real-time transaction status

### Crypto Integration
- Business account for fiat-crypto conversion
- Support for BTC and ETH
- Secure wallet address generation

## 🎨 Frontend Features

### Dashboard
- Multi-currency balance overview
- Recent transaction history
- Quick action buttons
- Real-time updates

### Wallet Management
- Create wallets for each currency
- Send money to other users
- Deposit/withdraw with payment gateways
- Convert between currencies

### Transaction History
- Filterable transaction list
- Real-time status updates
- Detailed transaction metadata

### KYC Management
- Document upload interface
- Status tracking
- Admin review system

## 🔒 Security Features

- JWT authentication
- CORS protection
- Input validation
- Atomic transactions
- Secure file uploads
- User data isolation

## 📱 Mobile Responsive

The frontend is fully responsive and works seamlessly on:
- Desktop browsers
- Tablets
- Mobile devices

## 🚀 Production Deployment

### Backend
1. Set production environment variables
2. Use PostgreSQL database
3. Configure static file serving
4. Set up SSL certificates
5. Use production payment gateway URLs

### Frontend
1. Build production bundle: `npm run build`
2. Serve static files
3. Configure API endpoints

## 📞 Support

For technical support or questions about integration, please refer to the API documentation or contact the development team.

---

**Built with Django REST Framework + React.js**