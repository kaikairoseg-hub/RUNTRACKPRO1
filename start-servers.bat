@echo off
echo ========================================
echo   RunTrack Pro - Starting Servers
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Checking Node.js version...
node --version
echo.

echo [2/4] Starting Backend Server (Port 4000)...
start "RunTrack Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul
echo Backend server starting in new window...
echo.

echo [3/4] Starting Frontend Server (Port 5173)...
start "RunTrack Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 3 /nobreak >nul
echo Frontend server starting in new window...
echo.

echo [4/4] Servers Started Successfully!
echo ========================================
echo   Access your app:
echo ========================================
echo   Computer: http://localhost:5173
echo   Phone:    http://192.168.1.105:5173
echo.
echo   Make sure your phone is on the same WiFi!
echo ========================================
echo.
echo Press any key to close this window...
echo (Server windows will stay open)
pause >nul
