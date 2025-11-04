# BPAY Render Deployment Guide

## 🚀 Deploy to Render in 5 Minutes

### Step 1: Prepare Repository
```bash
# Commit all changes
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Create Render Services

1. **Go to [render.com](https://render.com) and sign up**

2. **Create PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `bpay-db`
   - Plan: Free tier
   - Note the connection string

3. **Create Redis Instance:**
   - Click "New +" → "Redis"
   - Name: `bpay-redis`
   - Plan: Free tier

4. **Create Backend Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Name: `bpay-backend`
   - Environment: `Python 3`
   - Build Command: `./build.sh`
   - Start Command: `cd fintech_project && gunicorn fintech_project.wsgi:application`

5. **Create Frontend Static Site:**
   - Click "New +" → "Static Site"
   - Connect your GitHub repo
   - Name: `bpay-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

### Step 3: Environment Variables

Add these to your backend service:

```bash
# Django
DJANGO_SECRET_KEY=your-generated-secret-key
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=your-backend-url.onrender.com

# Database (auto-filled by Render)
DATABASE_URL=postgresql://...

# Redis (auto-filled by Render)
REDIS_URL=redis://...

# Email
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Payment Gateways
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret
FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public
SASAPAY_CLIENT_ID=your-sasapay-client-id
SASAPAY_CLIENT_SECRET=your-sasapay-secret
SASAPAY_MERCHANT_CODE=your-merchant-code
CRYPTO_API_KEY=your-crypto-api-key

# URLs
FRONTEND_URL=https://your-frontend-url.onrender.com
BACKEND_URL=https://your-backend-url.onrender.com
```

### Step 4: Update Frontend API URL

Update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com/api'
  : 'http://localhost:8000/api';
```

### Step 5: Deploy!

1. **Push changes:**
   ```bash
   git add .
   git commit -m "Configure for Render"
   git push origin main
   ```

2. **Services will auto-deploy**
3. **Check logs for any issues**
4. **Test your app!**

## 🔧 Render Configuration

### Free Tier Limits:
- **Web Services**: Sleep after 15 minutes of inactivity
- **Database**: 1GB storage, 97 hours/month
- **Redis**: 25MB memory
- **Bandwidth**: 100GB/month

### Production Upgrade:
- **Starter Plan**: $7/month (no sleep, more resources)
- **PostgreSQL**: $7/month (persistent, more storage)
- **Redis**: $7/month (more memory)

## 🚨 Important Notes

1. **Free services sleep** - first request may be slow
2. **Database persists** even on free tier
3. **Use environment variables** for all secrets
4. **Monitor usage** to avoid overages
5. **Upgrade for production** traffic

## 📱 Your BPAY URLs

After deployment:
- **Frontend**: `https://bpay-frontend.onrender.com`
- **Backend API**: `https://bpay-backend.onrender.com/api`
- **Admin**: `https://bpay-backend.onrender.com/admin`

## 🔒 Security on Render

✅ **Automatic HTTPS**
✅ **Environment variables encrypted**
✅ **DDoS protection**
✅ **Regular security updates**

**BPAY is now live on Render! 🎉**