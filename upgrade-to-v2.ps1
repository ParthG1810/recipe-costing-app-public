# ============================================
# Recipe Costing Application - Upgrade to V2
# ============================================
# This script automatically upgrades from V1 to V2
# Run this in PowerShell from your project directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Recipe Costing App - Upgrade to V2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Backing up V1 files..." -ForegroundColor Yellow

# Create backup directory
$backupDir = "backup_v1_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup old files
Copy-Item "server/index.js" "$backupDir/index.js" -Force -ErrorAction SilentlyContinue
Copy-Item "app/product-entry/page.tsx" "$backupDir/product-entry-page.tsx" -Force -ErrorAction SilentlyContinue
Copy-Item "app/product-management/page.tsx" "$backupDir/product-management-page.tsx" -Force -ErrorAction SilentlyContinue
Copy-Item "app/recipe-creation/page.tsx" "$backupDir/recipe-creation-page.tsx" -Force -ErrorAction SilentlyContinue

Write-Host "✓ V1 files backed up to: $backupDir" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Replacing with V2 files..." -ForegroundColor Yellow

# Replace server file
if (Test-Path "server/index_v2.js") {
    Copy-Item "server/index_v2.js" "server/index.js" -Force
    Write-Host "✓ Backend server updated" -ForegroundColor Green
} else {
    Write-Host "✗ server/index_v2.js not found!" -ForegroundColor Red
}

# Replace frontend pages
if (Test-Path "app/product-entry/page_v2.tsx") {
    Copy-Item "app/product-entry/page_v2.tsx" "app/product-entry/page.tsx" -Force
    Write-Host "✓ Product Entry page updated" -ForegroundColor Green
} else {
    Write-Host "✗ app/product-entry/page_v2.tsx not found!" -ForegroundColor Red
}

if (Test-Path "app/product-management/page_v2.tsx") {
    Copy-Item "app/product-management/page_v2.tsx" "app/product-management/page.tsx" -Force
    Write-Host "✓ Product Management page updated" -ForegroundColor Green
} else {
    Write-Host "✗ app/product-management/page_v2.tsx not found!" -ForegroundColor Red
}

if (Test-Path "app/recipe-creation/page_v2.tsx") {
    Copy-Item "app/recipe-creation/page_v2.tsx" "app/recipe-creation/page.tsx" -Force
    Write-Host "✓ Recipe Creation page updated" -ForegroundColor Green
} else {
    Write-Host "✗ app/recipe-creation/page_v2.tsx not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Database migration..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: You need to run the database migration manually!" -ForegroundColor Red
Write-Host ""
Write-Host "Option 1 - MySQL Workbench (Recommended):" -ForegroundColor Cyan
Write-Host "  1. Open MySQL Workbench" -ForegroundColor White
Write-Host "  2. Connect to your MySQL server" -ForegroundColor White
Write-Host "  3. File → Open SQL Script" -ForegroundColor White
Write-Host "  4. Select: database_schema_v2.sql" -ForegroundColor White
Write-Host "  5. Click Execute (⚡ lightning bolt icon)" -ForegroundColor White
Write-Host ""
Write-Host "Option 2 - Command Line:" -ForegroundColor Cyan
Write-Host '  Get-Content database_schema_v2.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pMysql recipe_costing_db' -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upgrade Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run the database migration (see above)" -ForegroundColor White
Write-Host "2. Restart your servers:" -ForegroundColor White
Write-Host "   - Stop current servers (Ctrl + C)" -ForegroundColor White
Write-Host "   - Terminal 1: npm run dev:server" -ForegroundColor White
Write-Host "   - Terminal 2: npm run dev:next" -ForegroundColor White
Write-Host "3. Open http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Your V1 files are backed up in: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you encounter any issues, check UPGRADE_TO_V2.md for troubleshooting." -ForegroundColor Yellow
Write-Host ""
