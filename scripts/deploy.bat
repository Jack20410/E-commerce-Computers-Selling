@echo off
REM Deployment Script for E-commerce Computer Store (Windows)
REM Usage: scripts\deploy.bat [environment] [domain]
REM Example: scripts\deploy.bat production mystore.com

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
set DOMAIN=%2

if "%ENVIRONMENT%"=="" set ENVIRONMENT=production
if "%DOMAIN%"=="" set DOMAIN=yourdomain.com

echo 🚀 Starting deployment for environment: %ENVIRONMENT%
echo 🌐 Domain: %DOMAIN%

REM Validate environment
if not "%ENVIRONMENT%"=="development" if not "%ENVIRONMENT%"=="production" if not "%ENVIRONMENT%"=="staging" (
    echo ❌ Invalid environment. Use: development, production, or staging
    exit /b 1
)

REM Create environment files if they don't exist
if not exist ".env.%ENVIRONMENT%" (
    echo 📋 Creating .env.%ENVIRONMENT% from template...
    copy ".env.%ENVIRONMENT%.template" ".env.%ENVIRONMENT%" >nul
    
    REM Replace domain placeholders (Windows compatible)
    powershell -Command "(Get-Content '.env.%ENVIRONMENT%') -replace 'yourdomain.com', '%DOMAIN%' | Set-Content '.env.%ENVIRONMENT%'"
    
    echo ⚠️  Please review and update .env.%ENVIRONMENT% with your actual values
    echo 📝 Especially update:
    echo    - MONGODB_URI (if different)
    echo    - JWT_SECRET (use a secure secret)
    echo    - GOOGLE_CLIENT_ID/SECRET (if different)
    echo    - EMAIL_USER/PASSWORD (if different)
    echo.
)

REM Create frontend environment file
if not exist "frontend\.env.%ENVIRONMENT%" (
    echo 📋 Creating frontend\.env.%ENVIRONMENT% from template...
    copy "frontend\.env.%ENVIRONMENT%.template" "frontend\.env.%ENVIRONMENT%" >nul
    
    REM Replace domain placeholders
    powershell -Command "(Get-Content 'frontend\.env.%ENVIRONMENT%') -replace 'yourdomain.com', '%DOMAIN%' | Set-Content 'frontend\.env.%ENVIRONMENT%'"
)

REM Copy environment files
echo 📁 Copying environment files...
copy ".env.%ENVIRONMENT%" ".env" >nul
copy "frontend\.env.%ENVIRONMENT%" "frontend\.env" >nul

echo ✅ Environment files configured for %ENVIRONMENT%
echo 🔧 Domain set to: %DOMAIN%
echo.
echo Next steps:
echo 1. Review .env files and update any necessary values
echo 2. Run: docker-compose up -d --build
echo 3. Access your application at: https://%DOMAIN%
echo.
echo 🔍 To check logs: docker-compose logs -f backend

endlocal
