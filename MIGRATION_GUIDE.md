# Database Migration Guide

## 📋 Overview

Whenever there are database schema changes, you'll receive a **`database_migration.sql`** file that drops and recreates all tables with the updated schema.

---

## 🚀 Quick Start (Windows)

### Option 1: Double-Click the Batch File (Easiest)

1. Double-click **`run-migration.bat`**
2. Type `yes` when prompted
3. Done! Tables are recreated with sample data

### Option 2: MySQL Workbench (Visual)

1. Open **MySQL Workbench**
2. Connect to your MySQL server
3. Click **File** > **Open SQL Script**
4. Select **`database_migration.sql`**
5. Click the **⚡ Execute** button (lightning bolt icon)
6. Done!

### Option 3: Command Line

```bash
# Navigate to project directory
cd E:\Food Costing\recipe-costing-app-public

# Run the migration
mysql -u root -pMysql recipe_costing_db < database_migration.sql
```

---

## ⚠️ Important Notes

### Data Loss Warning

**This migration will DELETE ALL existing data!**

If you have important data:
1. Export it first using MySQL Workbench
2. Run the migration
3. Import your data back

### When to Run Migration

Run the migration when:
- ✅ You pull new code with database changes
- ✅ You see database-related errors
- ✅ I tell you "database schema has changed"
- ✅ Tables are missing or have wrong columns

### Don't Run Migration When

- ❌ Just testing the app
- ❌ No database changes in the update
- ❌ You want to keep your existing data

---

## 📝 What the Migration Does

1. **Drops existing tables** (in safe order):
   - `recipe_ingredients`
   - `recipes`
   - `products`

2. **Creates new tables** with updated schema:
   - `products` - with vendor package sizes
   - `recipes` - recipe information
   - `recipe_ingredients` - links recipes to products

3. **Inserts sample data** (optional):
   - 5 sample products (Toor Dal, Rice, Ghee, etc.)
   - 3 sample recipes (Dal Tadka, Jeera Rice, Kadhi)
   - Recipe ingredients linking them together

---

## 🔧 Customizing the Migration

### Remove Sample Data

If you don't want sample data, edit `database_migration.sql`:

1. Find the section: `-- INSERT SAMPLE DATA`
2. Comment out or delete the INSERT statements
3. Save and run the migration

### Change MySQL Password

If your MySQL password is not `Mysql`:

**Option A: Edit the batch file**
```batch
# In run-migration.bat, change this line:
mysql -u root -pMysql recipe_costing_db < database_migration.sql

# To (replace YOUR_PASSWORD):
mysql -u root -pYOUR_PASSWORD recipe_costing_db < database_migration.sql
```

**Option B: Run manually**
```bash
mysql -u root -p recipe_costing_db < database_migration.sql
# Then enter your password when prompted
```

---

## 🐛 Troubleshooting

### Error: "MySQL command not found"

**Solution:**
Add MySQL to your Windows PATH:
1. Find MySQL bin folder: `C:\Program Files\MySQL\MySQL Server 8.0\bin\`
2. Add to System PATH environment variable
3. Restart Command Prompt

Or run from MySQL bin directory:
```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root -pMysql recipe_costing_db < "E:\Food Costing\recipe-costing-app-public\database_migration.sql"
```

### Error: "Access denied for user 'root'"

**Solution:**
Check your MySQL password:
```bash
# Try with password prompt
mysql -u root -p recipe_costing_db < database_migration.sql
```

### Error: "Unknown database 'recipe_costing_db'"

**Solution:**
Create the database first:
```sql
CREATE DATABASE recipe_costing_db;
```

Then run the migration.

### Error: "Cannot delete or update a parent row"

**Solution:**
This shouldn't happen with this migration script, but if it does:
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Run your migration
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 📊 Verify Migration Success

After running the migration, verify it worked:

### Option 1: MySQL Workbench
1. Refresh the schema
2. Check that tables exist: `products`, `recipes`, `recipe_ingredients`
3. Right-click table > "Select Rows" to see sample data

### Option 2: Command Line
```sql
USE recipe_costing_db;

-- Check tables exist
SHOW TABLES;

-- Check row counts
SELECT 'Products' as 'Table', COUNT(*) as 'Rows' FROM products
UNION ALL
SELECT 'Recipes', COUNT(*) FROM recipes
UNION ALL
SELECT 'Recipe Ingredients', COUNT(*) FROM recipe_ingredients;

-- View sample products
SELECT id, name, vendor1_name, vendor1_price, vendor1_package_size FROM products;
```

Expected output:
- 5 products
- 3 recipes
- 5 recipe ingredients

---

## 🔄 Migration Workflow

When I make database changes:

1. **I'll tell you:** "Database schema changed - run migration"
2. **I'll provide:** Updated `database_migration.sql` file
3. **You run:** `run-migration.bat` or the SQL file
4. **You restart:** Both servers (Express + Next.js)
5. **You test:** The application with new schema

---

## 💾 Backup Your Data (Optional)

If you have important data, backup before migration:

### Export Data
```bash
# Export all data
mysqldump -u root -pMysql recipe_costing_db > backup.sql

# Export only data (no schema)
mysqldump -u root -pMysql --no-create-info recipe_costing_db > data_only.sql
```

### Import Data After Migration
```bash
# Import data
mysql -u root -pMysql recipe_costing_db < backup.sql
```

---

## 📁 File Locations

- **Migration SQL:** `database_migration.sql`
- **Windows Runner:** `run-migration.bat`
- **This Guide:** `MIGRATION_GUIDE.md`

All files are in your project root directory.

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Run migration (Windows) | Double-click `run-migration.bat` |
| Run migration (CLI) | `mysql -u root -pMysql recipe_costing_db < database_migration.sql` |
| Backup database | `mysqldump -u root -pMysql recipe_costing_db > backup.sql` |
| Check tables | `SHOW TABLES;` in MySQL |
| View products | `SELECT * FROM products;` |

---

**Need help?** Let me know if you encounter any issues with the migration!
