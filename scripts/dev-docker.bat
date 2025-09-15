@echo off
echo Starting development environment (Docker)...

echo.
echo Building and starting Docker containers...
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo.
echo Waiting for containers to be ready...
timeout /t 10

echo.
echo Docker development environment started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause
