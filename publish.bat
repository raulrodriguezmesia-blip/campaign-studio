@echo off
title Campaign Studio Publisher

echo ============================================
echo PUBLISH CAMPAIGN-STUDIO TO GITHUB
echo ============================================

set /p GH_USER="GitHub Username (raulrodigpez): "
if "%GH_USER%" neq "" (
    set GH_USER=raulrodigpez
)

cd /d "D:\automatizacion-convocatorias\campaign-studio"

echo.
echo Initializing git repository...
git init

echo.
echo Adding all files...
git add .

echo.
echo Creating commit...
git commit -m "feat: Campaign Studio - Enterprise AI marketing platform

- FastAPI backend with OpenAI gpt-4.1-mini + gpt-image-1.5
- OpenTelemetry observability with Jaeger + Prometheus
- Multi-stage Docker build
- Kubernetes manifests
- GitHub Actions CI/CD pipeline
- Production-ready architecture"

echo.
echo Setting remote...
git remote add origin https://github.com/%GH_USER%/campaign-studio.git

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Push failed. Ensure repository exists at:
    echo https://github.com/%GH_USER%/campaign-studio
    pause
    exit /b 1
)

echo.
echo SUCCESS: Campaign Studio published!
pause