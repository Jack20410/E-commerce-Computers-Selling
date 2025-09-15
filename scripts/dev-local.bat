@echo off
echo Starting development environment (local)...

echo.
echo Starting backend...
start cmd /k "cd /d %~dp0\..\src && npm install && npm run dev"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5

echo.
echo Starting frontend...
start cmd /k "cd /d %~dp0\..\frontend && npm install && npm run dev"

echo.
echo Development environment started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001
echo.
echo To stop: Close both terminal windows or press Ctrl+C in each
echo.
pause
