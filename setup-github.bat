@echo off
echo ========================================
echo Recipe Costing App - GitHub Setup
echo ========================================
echo.

set /p GITHUB_URL="Enter your GitHub repository URL (e.g., https://github.com/username/recipe-costing-app.git): "

echo.
echo Adding remote origin...
git remote add origin %GITHUB_URL%

echo.
echo Verifying remote...
git remote -v

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Setup complete!
echo Your code is now on GitHub.
echo ========================================
pause
