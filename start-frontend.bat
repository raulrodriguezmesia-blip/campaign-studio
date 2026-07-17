@echo off
title Campaign Studio Frontend Server
echo ============================================
echo CAMPAIGN STUDIO - Frontend Server
echo ============================================
echo.
echo Starting server...
cd /d "C:\Users\campaign-studio"

REM Kill any existing http servers
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *http.server*" 2>nul

echo.
echo Server starting on http://localhost:8080
echo Press Ctrl+C to stop
echo.

python -m http.server 8080

pause