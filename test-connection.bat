@echo off
echo ========================================
echo   RunTrack Pro - Connection Test
echo ========================================
echo.

echo [1/6] Checking Computer IP Address...
echo.
ipconfig | findstr /C:"IPv4 Address"
echo.

echo [2/6] Checking if servers are running...
echo.
echo Backend (Port 4000):
netstat -ano | findstr :4000 | findstr LISTENING
if %errorLevel% EQU 0 (
    echo   [OK] Backend is running
) else (
    echo   [FAIL] Backend is NOT running!
)
echo.
echo Frontend (Port 5173):
netstat -ano | findstr :5173 | findstr LISTENING
if %errorLevel% EQU 0 (
    echo   [OK] Frontend is running
) else (
    echo   [FAIL] Frontend is NOT running!
)
echo.

echo [3/6] Checking Firewall Rules...
echo.
netsh advfirewall firewall show rule name="RunTrack Backend - Port 4000" >nul 2>&1
if %errorLevel% EQU 0 (
    echo   [OK] Backend firewall rule exists
) else (
    echo   [FAIL] Backend firewall rule missing!
)
netsh advfirewall firewall show rule name="RunTrack Frontend - Port 5173" >nul 2>&1
if %errorLevel% EQU 0 (
    echo   [OK] Frontend firewall rule exists
) else (
    echo   [FAIL] Frontend firewall rule missing!
)
echo.

echo [4/6] Testing Backend Connection...
curl -s http://localhost:4000/health >nul 2>&1
if %errorLevel% EQU 0 (
    echo   [OK] Backend responds on localhost
) else (
    echo   [FAIL] Backend not responding!
)
echo.

echo [5/6] Testing Frontend Connection...
curl -s http://localhost:5173 >nul 2>&1
if %errorLevel% EQU 0 (
    echo   [OK] Frontend responds on localhost
) else (
    echo   [FAIL] Frontend not responding!
)
echo.

echo [6/6] Network Configuration...
echo.
echo WiFi Adapter Info:
netsh wlan show interfaces | findstr /C:"SSID" /C:"State"
echo.

echo ========================================
echo   Connection Test Complete
echo ========================================
echo.
echo If all tests pass but phone still can't connect:
echo.
echo POSSIBLE ISSUES:
echo 1. WiFi Router has AP Isolation enabled
echo    - Check router settings and disable "AP Isolation"
echo    - Also called "Client Isolation" or "Guest Mode"
echo.
echo 2. Phone and Computer on different networks
echo    - Verify both show same WiFi name
echo    - Not on 5GHz vs 2.4GHz different networks
echo.
echo 3. Antivirus software blocking
echo    - Temporarily disable antivirus and test
echo.
echo 4. VPN or Proxy on either device
echo    - Disable VPN on both laptop and phone
echo.
echo 5. Phone using mobile data instead of WiFi
echo    - Ensure WiFi is connected on phone
echo    - Disable mobile data temporarily
echo.
echo ========================================
echo.
pause
