@echo off
echo ========================================
echo   RunTrack Pro - Stopping Servers
echo ========================================
echo.

echo [1/2] Stopping Backend Server (Port 4000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    taskkill /F /PID %%a >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo Backend server stopped (PID: %%a)
    )
)

echo [2/2] Stopping Frontend Server (Port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo Frontend server stopped (PID: %%a)
    )
)

echo.
echo ========================================
echo   All servers stopped!
echo ========================================
echo.
pause
