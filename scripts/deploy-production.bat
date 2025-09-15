@echo off
echo Deploying to production...

echo.
echo Building and starting production containers...
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

echo.
echo Waiting for containers to be ready...
timeout /t 15

echo.
echo Production environment deployed!
echo Frontend: https://jabick.site
echo Backend: https://api.jabick.site
echo.
echo To view logs: docker-compose -f docker-compose.production.yml logs -f
echo To stop: docker-compose -f docker-compose.production.yml down
echo.
pause
