@echo off
title RunTrack Pro Launcher

:: Start backend in its own titled window
start "RunTrack Backend" /d "%~dp0backend" cmd /k "npm start"

:: Start frontend in its own titled window
start "RunTrack Frontend" /d "%~dp0frontend" cmd /k "npm run dev"

:: Close this launcher window immediately — no extra window stays open
exit
