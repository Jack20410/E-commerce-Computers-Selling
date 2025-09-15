# Deployment Guide

This guide explains how the automatic deployment workflow works and how to manage deployments effectively.

## 🚀 **Automatic Deployment Workflow**

### **Trigger**
The deployment is automatically triggered when you push code to the `deploy_2` branch:

```bash
git push origin deploy_2
```

### **What Happens During Deployment**

1. **Code Checkout** - GitHub Actions checks out the latest code
2. **SSH Connection** - Connects to your production server
3. **Code Update** - Pulls latest changes from `deploy_2` branch
4. **Environment Setup** - Creates/updates production environment variables
5. **Container Management** - Stops old containers, builds new ones
6. **Health Checks** - Verifies services are running correctly
7. **Cleanup** - Removes unused Docker resources

### **Deployment Flow Diagram**

```
Push to deploy_2 → GitHub Actions → SSH to Server → 
Pull Code → Update .env.production → Build Containers → 
Health Check → Deployment Complete
```

## 🔧 **Environment Configuration**

### **Automatic Environment Updates**

The workflow automatically updates these production settings:

```env
FRONTEND_URL=https://jabick.site
BACKEND_URL=https://api.jabick.site
GOOGLE_CALLBACK_URL=https://api.jabick.site/auth/google/callback

# VNPay Production Settings
VNP_RETURN_URL=https://jabick.site/payment/vnpay-return
VNP_URL=https://vnpayment.vn/paymentv2/vpcpay.html
VNP_API=https://vnpayment.vn/merchant_webapi/api/transaction
```

### **Development vs Production**

| Setting | Development | Production |
|---------|-------------|------------|
| Frontend URL | http://localhost:3000 | https://jabick.site |
| Backend URL | http://localhost:3001 | https://api.jabick.site |
| VNPay URL | Sandbox | Production |
| VNPay Return | localhost:3000 | jabick.site |

## 📋 **Deployment Checklist**

### **Before Pushing to deploy_2**

- [ ] Test locally with `scripts/dev-local.bat`
- [ ] Test with Docker using `scripts/dev-docker.bat`
- [ ] Verify VNPay integration works in sandbox
- [ ] Check all environment variables are set
- [ ] Test critical user flows (registration, checkout, payment)

### **After Deployment**

- [ ] Check GitHub Actions status
- [ ] Verify frontend loads at https://jabick.site
- [ ] Test backend API at https://api.jabick.site/health
- [ ] Test VNPay payment flow in production
- [ ] Monitor server logs for any errors

## 🔍 **Monitoring & Troubleshooting**

### **Check Deployment Status**

1. **GitHub Actions**: Go to your repository's Actions tab
2. **Server Logs**: SSH to server and run:
   ```bash
   cd ~/Projects/E-commerce-Computers-Selling
   docker-compose -f docker-compose.production.yml logs -f
   ```

### **Common Issues & Solutions**

#### **Deployment Failed - Health Check Error**
```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# Check specific service logs
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs frontend
```

#### **Frontend Not Loading**
- Check if containers are running
- Verify nginx configuration
- Check frontend build logs

#### **Backend API Not Responding**
- Check backend container logs
- Verify database connection
- Check environment variables

#### **VNPay Not Working**
- Verify VNP_RETURN_URL is correct
- Check VNP_TMN_CODE and VNP_HASH_SECRET
- Ensure production VNPay URLs are used

### **Manual Deployment Commands**

If automatic deployment fails, you can deploy manually:

```bash
# SSH to your server
ssh user@your-server.com

# Navigate to project directory
cd ~/Projects/E-commerce-Computers-Selling

# Pull latest code
git pull origin deploy_2

# Deploy using production script
./scripts/deploy-production.sh
```

## 🔄 **Rollback Procedure**

If deployment fails and you need to rollback:

```bash
# SSH to server
ssh user@your-server.com
cd ~/Projects/E-commerce-Computers-Selling

# Rollback to previous commit
git log --oneline -5  # See recent commits
git checkout <previous-commit-hash>

# Redeploy with previous version
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

## 📊 **Health Monitoring**

### **Automated Health Checks**

The deployment workflow includes:
- Backend health endpoint check
- Frontend availability check
- Container status verification

### **Manual Health Checks**

```bash
# Check backend health
curl https://api.jabick.site/health

# Check frontend
curl https://jabick.site

# Check containers
docker-compose -f docker-compose.production.yml ps
```

## 🔐 **Security Considerations**

### **Environment Variables**
- Never commit `.env.production` with real credentials
- Use GitHub Secrets for sensitive data
- Regularly rotate JWT secrets and API keys

### **Server Security**
- Keep server OS updated
- Use SSH keys instead of passwords
- Configure firewall rules
- Regular security audits

## 📝 **Development Workflow**

### **Recommended Git Flow**

1. **Feature Development**
   ```bash
   git checkout -b feature/new-feature
   # Develop and test locally
   git commit -m "Add new feature"
   ```

2. **Testing**
   ```bash
   git checkout main
   git merge feature/new-feature
   # Test with Docker
   ./scripts/dev-docker.bat
   ```

3. **Deployment**
   ```bash
   git checkout deploy_2
   git merge main
   git push origin deploy_2  # Triggers automatic deployment
   ```

### **Branch Strategy**

- `main` - Stable development code
- `deploy_2` - Production deployment branch
- `feature/*` - Feature development branches

## 🛠 **Maintenance**

### **Regular Tasks**

- Monitor server resources (CPU, memory, disk)
- Check Docker logs for errors
- Update dependencies regularly
- Backup database
- Monitor payment transactions

### **Performance Optimization**

- Use Docker image caching
- Optimize database queries
- Implement CDN for static assets
- Monitor API response times

## 📞 **Support & Troubleshooting**

### **Quick Debug Commands**

```bash
# Check all running containers
docker ps

# View resource usage
docker stats

# Check disk space
df -h

# View system logs
journalctl -f
```

### **Getting Help**

1. Check GitHub Actions logs
2. Review server logs
3. Check this documentation
4. Create GitHub issue if needed

Remember: Always test changes locally before pushing to `deploy_2`!
