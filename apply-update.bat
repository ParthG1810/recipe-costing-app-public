@echo off
echo ========================================
echo Recipe Costing App - Apply Update
echo ========================================
echo.

set /p PATCH_FILE="Enter the patch file name (e.g., update-2025-11-02.patch): "

echo.
echo Checking for uncommitted changes...
git status

echo.
set /p CONTINUE="Do you want to continue? (y/n): "
if /i not "%CONTINUE%"=="y" goto :END

echo.
echo Applying patch...
git apply %PATCH_FILE%

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Patch failed to apply!
    echo Please contact Manus AI for assistance.
    goto :END
)

echo.
echo Patch applied successfully!
echo.
echo Reviewing changes...
git status

echo.
set /p COMMIT="Do you want to commit these changes? (y/n): "
if /i not "%COMMIT%"=="y" goto :END

echo.
set /p MESSAGE="Enter commit message: "

git add .
git commit -m "%MESSAGE%"

echo.
set /p PUSH="Do you want to push to GitHub? (y/n): "
if /i not "%PUSH%"=="y" goto :END

git push origin main

echo.
echo ========================================
echo Update complete!
echo ========================================

:END
pause
