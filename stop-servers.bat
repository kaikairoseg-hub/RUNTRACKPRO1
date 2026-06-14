@echo off
title RunTrack Pro - Stop Servers

:: Close named windows opened by start-servers.bat
taskkill /FI "WINDOWTITLE eq RunTrack Backend" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq RunTrack Frontend" /T /F >nul 2>nul

:: Also kill by port as fallback
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 2^>nul') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 2^>nul') do taskkill /F /PID %%a >nul 2>nul

echo Servers stopped.
timeout /t 2 /nobreak >nul
exit
