@echo off
echo ========================================
echo Recipe Costing App - Environment Setup
echo ========================================
echo.

if exist .env (
    echo .env file already exists!
    set /p OVERWRITE="Do you want to overwrite it? (y/n): "
    if /i not "%OVERWRITE%"=="y" goto :END
)

echo Creating .env file...
echo.

set /p DB_HOST="Enter MySQL host (default: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_USER="Enter MySQL username (default: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASSWORD="Enter MySQL password: "

set /p DB_NAME="Enter database name (default: recipe_costing_db): "
if "%DB_NAME%"=="" set DB_NAME=recipe_costing_db

echo.
echo Creating .env file with your configuration...

(
echo # Database Configuration
echo DB_HOST=%DB_HOST%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo DB_NAME=%DB_NAME%
echo.
echo # Server Configuration
echo PORT=3001
) > .env

echo.
echo ========================================
echo .env file created successfully!
echo ========================================
echo.
echo Your configuration:
type .env
echo.
echo You can now run the application with:
echo   npm run dev:server
echo.

:END
pause
