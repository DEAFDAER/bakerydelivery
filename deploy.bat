@echo off
REM 🚀 Bongao Bakery - Quick Deploy Script (Windows) - Vercel Frontend + Render Backend
REM This script helps automate the deployment process

echo 🥖 Bongao Bakery Deployment Helper (Vercel + Render)
echo ==================================================

REM Check if git is initialized
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit: Bongao Bakery project"
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo 🔗 Please add your GitHub repository as remote origin:
    echo git remote add origin https://github.com/YOUR_USERNAME/bongao-bakery.git
    echo.
    echo Then push your code:
    echo git push -u origin main
) else (
    echo ✅ Remote origin already configured
    echo 🔄 Pushing latest changes...
    git add .
    git commit -m "Update: %date% %time%"
    git push
)

echo.
echo 📋 Next Steps:
echo 1. Go to https://render.com and create a PostgreSQL database
echo 2. Deploy backend service using render.yaml
echo 3. Go to https://vercel.com and deploy frontend
echo 4. Configure environment variables in both platforms
echo 5. Update CORS settings with your Vercel frontend URL
echo.
echo 📖 For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
echo 🎉 Happy deploying!
pause
