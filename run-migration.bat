@echo off
REM ============================================
REM Database Migration Runner for Windows
REM ============================================
echo.
echo ========================================
echo Recipe Costing App - Database Migration
echo ========================================
echo.

REM Check if MySQL is in PATH
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: MySQL command not found in PATH
    echo.
    echo Please add MySQL to your PATH or run this from MySQL bin directory
    echo Example: C:\Program Files\MySQL\MySQL Server 8.0\bin\
    echo.
    pause
    exit /b 1
)

echo This will DROP all existing tables and recreate them.
echo ALL DATA WILL BE LOST!
echo.
set /p CONFIRM="Are you sure you want to continue? (yes/no): "

if /i NOT "%CONFIRM%"=="yes" (
    echo.
    echo Migration cancelled.
    pause
    exit /b 0
)

echo.
echo Running database migration...
echo.

REM Run the migration
mysql -u root -pMysql recipe_costing_db < database_migration.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo Tables recreated:
    echo   - products
    echo   - recipes
    echo   - recipe_ingredients
    echo.
    echo Sample data has been inserted.
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Migration failed!
    echo ========================================
    echo.
    echo Please check:
    echo   1. MySQL is running
    echo   2. Database 'recipe_costing_db' exists
    echo   3. Username and password are correct
    echo.
)

pause
