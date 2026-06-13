@echo off
echo ========================================
echo   RunTrack Pro - Configure Firewall
echo ========================================
echo.
echo This script will add Windows Firewall rules
echo to allow phone access to your app.
echo.
echo Ports to open:
echo   - 4000 (Backend Server)
echo   - 5173 (Frontend Server)
echo.
pause

REM Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo.
    echo ERROR: This script requires Administrator privileges!
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo.
echo [1/4] Adding firewall rule for Backend (Port 4000)...
netsh advfirewall firewall add rule name="RunTrack Backend - Port 4000" dir=in action=allow protocol=TCP localport=4000
if %errorLevel% EQU 0 (
    echo SUCCESS: Backend port 4000 allowed
) else (
    echo WARNING: Failed to add rule for port 4000
)

echo.
echo [2/4] Adding firewall rule for Frontend (Port 5173)...
netsh advfirewall firewall add rule name="RunTrack Frontend - Port 5173" dir=in action=allow protocol=TCP localport=5173
if %errorLevel% EQU 0 (
    echo SUCCESS: Frontend port 5173 allowed
) else (
    echo WARNING: Failed to add rule for port 5173
)

echo.
echo [3/4] Verifying firewall rules...
netsh advfirewall firewall show rule name="RunTrack Backend - Port 4000"
netsh advfirewall firewall show rule name="RunTrack Frontend - Port 5173"

echo.
echo [4/4] Testing ports...
netstat -ano | findstr :4000
netstat -ano | findstr :5173

echo.
echo ========================================
echo   Firewall Configuration Complete!
echo ========================================
echo.
echo Your phone should now be able to access:
echo   http://192.168.1.105:5173
echo.
echo Make sure:
echo   1. Phone is on same WiFi network
echo   2. Servers are running
echo   3. Try accessing from phone browser
echo.
pause
