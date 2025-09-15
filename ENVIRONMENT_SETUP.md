# Environment Setup Guide

This guide explains how to properly configure and run the application in different environments.

## 🔧 Environment Configuration

### 1. Development (Local)
**Use when:** Coding on localhost without Docker
- Frontend runs on `http://localhost:5173` (Vite dev server)
- Backend runs on `http://localhost:3001` (Node.js)
- Uses `.env.development` for frontend

### 2. Docker Development
**Use when:** Testing with Docker containers locally
- Frontend runs on `http://localhost:3000` (Dockerized)
- Backend runs on `http://localhost:3001` (Dockerized)
- Uses `.env.docker` for frontend

### 3. Production
**Use when:** Deployed to your domain
- Frontend runs on `https://jabick.site`
- Backend runs on `https://api.jabick.site`
- Uses `.env.production` for frontend

## 🚀 Quick Start Commands

### Local Development
```bash
# Run the development script
scripts/dev-local.bat

# Or manually:
# Terminal 1 - Backend
cd src
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Docker Development
```bash
# Run the Docker development script
scripts/dev-docker.bat

# Or manually:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Production Deployment
```bash
# Run the production deployment script
scripts/deploy-production.bat

# Or manually:
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

## 📁 Environment Files

### Frontend Environment Files

#### `.env` (Default/Fallback)
```env
VITE_BACKEND_API_URL=http://localhost:3001
VITE_APP_NAME=Computer Store
VITE_NODE_ENV=development
```

#### `.env.development` (Local Development)
```env
VITE_BACKEND_API_URL=http://localhost:3001
VITE_NODE_ENV=development
```

#### `.env.docker` (Docker Development)
```env
VITE_BACKEND_API_URL=http://backend:3001
VITE_NODE_ENV=docker
```

#### `.env.production` (Production)
```env
VITE_BACKEND_API_URL=https://api.jabick.site
VITE_NODE_ENV=production
```

### Backend Environment File

#### `.env` (Backend Configuration)
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# VNPay Configuration
VNP_TMN_CODE=M6E6RMQP
VNP_HASH_SECRET=IB7NNB3ZXMBIGEAIDARCOPY04SHBMTV6
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/payment/vnpay-return
VNP_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
```

## 🔄 Switching Between Environments

### Development → Docker Development
1. Stop local servers (Ctrl+C)
2. Run `scripts/dev-docker.bat`
3. Access via `http://localhost:3000`

### Docker Development → Production
1. Update environment variables for production
2. Run `scripts/deploy-production.bat`
3. Access via your domain

### Quick Environment Switch
```bash
# Stop current environment
docker-compose down

# Start development
docker-compose up -d

# Start production
docker-compose -f docker-compose.production.yml up -d
```

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend
**Cause:** Wrong API URL configuration
**Solution:** 
- Local dev: Use `http://localhost:3001`
- Docker: Use `http://backend:3001`
- Production: Use `https://api.jabick.site`

### Issue: CORS errors
**Cause:** Frontend and backend running on different domains
**Solution:** Ensure CORS is properly configured in backend

### Issue: Environment variables not loading
**Cause:** Wrong environment file or build cache
**Solution:** 
```bash
# Clear build cache
docker-compose build --no-cache

# Verify environment file exists
ls frontend/.env*
```

### Issue: VNPay payment not working
**Cause:** Wrong return URL or environment
**Solution:**
- Development: `http://localhost:3000/payment/vnpay-return`
- Production: `https://jabick.site/payment/vnpay-return`

## 📝 Development Workflow

### Recommended Workflow
1. **Code locally** using `scripts/dev-local.bat`
2. **Test with Docker** using `scripts/dev-docker.bat`
3. **Deploy to production** using `scripts/deploy-production.bat`

### Environment-Specific Testing
- Test VNPay in sandbox mode for development
- Switch to production VNPay for live deployment
- Verify all API endpoints work in each environment

## 🔐 Security Notes

- Never commit `.env` files with real credentials
- Use different database URLs for development/production
- Update JWT secrets for production
- Configure SSL certificates for production
- Set up proper firewall rules for production

## 📊 Monitoring

### Development
- Check console logs for API calls
- Use browser DevTools Network tab
- Monitor Docker logs: `docker-compose logs -f`

### Production
- Set up logging aggregation
- Monitor server metrics
- Set up alerts for failures
- Regular health checks
