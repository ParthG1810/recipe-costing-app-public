# Upgrade Guide: V1 → V2 (Unlimited Vendors)

This guide will help you upgrade from the old 3-vendor system to the new unlimited vendors system.

---

## 🎯 What's New in V2

### **Major Changes:**
1. **Unlimited Vendors** - Add as many vendors as you want per product (no more 3-vendor limit!)
2. **New Database Structure** - Separate `product_vendors` table for better scalability
3. **Improved UI** - Better vendor management with add/remove buttons
4. **Cleaner API** - RESTful API with proper vendor handling

### **Files Changed:**
- `database_schema_v2.sql` - New database schema
- `server/index_v2.js` - New backend API
- `app/product-entry/page_v2.tsx` - Updated Product Entry page
- `app/product-management/page_v2.tsx` - Updated Product Management page
- `app/recipe-creation/page_v2.tsx` - Updated Recipe Creation page

---

## 📋 Prerequisites

- MySQL 8.0 or higher
- Node.js 18+ and npm
- Backup of your current database (if you have important data)

---

## 🚀 Upgrade Steps

### **Step 1: Backup Current Database (IMPORTANT!)**

```bash
# Windows PowerShell
cd "E:\Food Costing\Github\recipe-costing-app-public"

# Backup current database
mysqldump -u root -pMysql recipe_costing_db > backup_v1.sql
```

### **Step 2: Pull Latest Code from GitHub**

```powershell
git pull origin main
```

### **Step 3: Run New Database Schema**

**Option A: MySQL Workbench (Recommended)**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script
4. Select `database_schema_v2.sql`
5. Click Execute (⚡ lightning bolt icon)

**Option B: Command Line**
```powershell
# Add MySQL to PATH first
$env:Path += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"

# Run the schema
Get-Content database_schema_v2.sql | mysql -u root -pMysql recipe_costing_db
```

### **Step 4: Replace Backend Server**

```powershell
# Backup old server file
Copy-Item server/index.js server/index_v1_backup.js

# Replace with new server
Copy-Item server/index_v2.js server/index.js -Force
```

### **Step 5: Replace Frontend Pages**

```powershell
# Backup old pages
Copy-Item app/product-entry/page.tsx app/product-entry/page_v1_backup.tsx
Copy-Item app/product-management/page.tsx app/product-management/page_v1_backup.tsx
Copy-Item app/recipe-creation/page.tsx app/recipe-creation/page_v1_backup.tsx

# Replace with new pages
Copy-Item app/product-entry/page_v2.tsx app/product-entry/page.tsx -Force
Copy-Item app/product-management/page_v2.tsx app/product-management/page.tsx -Force
Copy-Item app/recipe-creation/page_v2.tsx app/recipe-creation/page.tsx -Force
```

### **Step 6: Restart Servers**

```powershell
# Stop current servers (Ctrl + C in each terminal)

# Terminal 1 - Start backend
npm run dev:server

# Terminal 2 - Start frontend
npm run dev:next
```

### **Step 7: Test the Application**

Open http://localhost:3000 and test:

1. ✅ **Product Entry** - Try adding a product with 5+ vendors
2. ✅ **Product Management** - Expand rows to see all vendors
3. ✅ **Recipe Creation** - Create a recipe and verify costs

---

## 🔄 Migrating Existing Data (Optional)

If you have existing products in the old V1 format, you can migrate them manually:

### **Migration SQL Script:**

```sql
USE recipe_costing_db;

-- For each existing product, insert vendors into product_vendors table
-- Example for product ID 1:

INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default)
SELECT 
  id as product_id,
  vendor1_name,
  vendor1_price,
  vendor1_weight,
  vendor1_package_size,
  (default_vendor_index = 0) as is_default
FROM products_v1_backup
WHERE vendor1_name IS NOT NULL;

-- Repeat for vendor2 and vendor3...
```

**Note:** The new schema comes with sample data, so you can start fresh if you don't have critical data to migrate.

---

## 🆘 Troubleshooting

### **Issue: "Table doesn't exist" error**
**Solution:** Make sure you ran `database_schema_v2.sql` completely

### **Issue: "Cannot find module" error**
**Solution:** Run `npm install` to install dependencies

### **Issue: Prices showing $0.00**
**Solution:** Check that products have at least one vendor with `is_default = TRUE`

### **Issue: Backend not starting**
**Solution:** 
1. Check MySQL is running
2. Verify database credentials in `server/index.js`
3. Check port 3001 is not in use

---

## 📊 Database Schema Comparison

### **Old V1 Schema:**
```
products
├── id
├── name
├── description
├── vendor1_name, vendor1_price, vendor1_weight, vendor1_package_size
├── vendor2_name, vendor2_price, vendor2_weight, vendor2_package_size
├── vendor3_name, vendor3_price, vendor3_weight, vendor3_package_size
└── default_vendor_index
```

### **New V2 Schema:**
```
products
├── id
├── name
├── description
└── default_vendor_id

product_vendors
├── id
├── product_id (FK → products.id)
├── vendor_name
├── price
├── weight
├── package_size
└── is_default
```

---

## ✅ Verification Checklist

After upgrade, verify:

- [ ] Database has `products` and `product_vendors` tables
- [ ] Backend server starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can add products with multiple vendors
- [ ] Can expand rows in Product Management
- [ ] Can edit products and add/remove vendors
- [ ] Recipe cost calculation works correctly

---

## 🔙 Rollback (If Needed)

If something goes wrong, you can rollback:

```powershell
# Restore database
Get-Content backup_v1.sql | mysql -u root -pMysql recipe_costing_db

# Restore old files
Copy-Item server/index_v1_backup.js server/index.js -Force
Copy-Item app/product-entry/page_v1_backup.tsx app/product-entry/page.tsx -Force
Copy-Item app/product-management/page_v1_backup.tsx app/product-management/page.tsx -Force
Copy-Item app/recipe-creation/page_v1_backup.tsx app/recipe-creation/page.tsx -Force

# Restart servers
```

---

## 📞 Support

If you encounter any issues during the upgrade:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Verify all files were copied correctly
4. Make sure MySQL is running

---

## 🎉 Success!

Once everything is working, you now have:
- ✅ Unlimited vendors per product
- ✅ Better database design
- ✅ Improved UI/UX
- ✅ Scalable architecture

Enjoy your upgraded Recipe Costing Application! 🚀
