#!/bin/bash

# Deployment Script for E-commerce Computer Store
# Usage: ./scripts/deploy.sh [environment] [domain]
# Example: ./scripts/deploy.sh production mystore.com

set -e

ENVIRONMENT=${1:-production}
DOMAIN=${2:-yourdomain.com}

echo "🚀 Starting deployment for environment: $ENVIRONMENT"
echo "🌐 Domain: $DOMAIN"

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" ]]; then
    echo "❌ Invalid environment. Use: development, production, or staging"
    exit 1
fi

# Create environment files if they don't exist
if [[ ! -f ".env.$ENVIRONMENT" ]]; then
    echo "📋 Creating .env.$ENVIRONMENT from template..."
    cp ".env.$ENVIRONMENT.template" ".env.$ENVIRONMENT"
    
    # Replace domain placeholders
    sed -i "s/yourdomain.com/$DOMAIN/g" ".env.$ENVIRONMENT"
    
    echo "⚠️  Please review and update .env.$ENVIRONMENT with your actual values"
    echo "📝 Especially update:"
    echo "   - MONGODB_URI (if different)"
    echo "   - JWT_SECRET (use a secure secret)"
    echo "   - GOOGLE_CLIENT_ID/SECRET (if different)"
    echo "   - EMAIL_USER/PASSWORD (if different)"
    echo ""
fi

# Create frontend environment file
if [[ ! -f "frontend/.env.$ENVIRONMENT" ]]; then
    echo "📋 Creating frontend/.env.$ENVIRONMENT from template..."
    cp "frontend/.env.$ENVIRONMENT.template" "frontend/.env.$ENVIRONMENT"
    
    # Replace domain placeholders
    sed -i "s/yourdomain.com/$DOMAIN/g" "frontend/.env.$ENVIRONMENT"
fi

# Copy environment files
echo "📁 Copying environment files..."
cp ".env.$ENVIRONMENT" ".env"
cp "frontend/.env.$ENVIRONMENT" "frontend/.env"

echo "✅ Environment files configured for $ENVIRONMENT"
echo "🔧 Domain set to: $DOMAIN"
echo ""
echo "Next steps:"
echo "1. Review .env files and update any necessary values"
echo "2. Run: docker-compose up -d --build"
echo "3. Access your application at: https://$DOMAIN"
echo ""
echo "🔍 To check logs: docker-compose logs -f backend"
