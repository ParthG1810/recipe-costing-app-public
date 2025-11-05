-- ============================================
-- Recipe Costing Application - Database Migration
-- ============================================
-- This script drops existing tables and recreates them with the latest schema
-- Run this file whenever there are database schema changes
--
-- HOW TO RUN:
-- Option 1: MySQL Workbench
--   1. Open MySQL Workbench
--   2. Connect to your MySQL server
--   3. File > Open SQL Script > Select this file
--   4. Click Execute (lightning bolt icon)
--
-- Option 2: MySQL Command Line
--   mysql -u root -p < database_migration.sql
--
-- Option 3: Windows Command Prompt
--   mysql -u root -pMysql recipe_costing_db < database_migration.sql
-- ============================================

-- Use the database
USE recipe_costing_db;

-- ============================================
-- DROP EXISTING TABLES
-- ============================================
-- Drop tables in reverse order of dependencies to avoid foreign key errors

DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS products;

-- ============================================
-- CREATE PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Vendor 1 Information (REQUIRED)
  vendor1_name VARCHAR(255),
  vendor1_price DECIMAL(10, 2),
  vendor1_weight DECIMAL(10, 2),
  vendor1_package_size VARCHAR(10) DEFAULT 'kg',
  
  -- Vendor 2 Information (OPTIONAL)
  vendor2_name VARCHAR(255) NULL,
  vendor2_price DECIMAL(10, 2) NULL,
  vendor2_weight DECIMAL(10, 2) NULL,
  vendor2_package_size VARCHAR(10) DEFAULT 'kg',
  
  -- Vendor 3 Information (OPTIONAL)
  vendor3_name VARCHAR(255) NULL,
  vendor3_price DECIMAL(10, 2) NULL,
  vendor3_weight DECIMAL(10, 2) NULL,
  vendor3_package_size VARCHAR(10) DEFAULT 'kg',
  
  -- Default vendor selection (0 = Vendor 1, 1 = Vendor 2, 2 = Vendor 3)
  default_vendor_index INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX idx_name (name),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CREATE RECIPES TABLE
-- ============================================
CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX idx_name (name),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CREATE RECIPE_INGREDIENTS TABLE
-- ============================================
CREATE TABLE recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  
  -- Foreign key constraints
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  
  -- Indexes for better performance
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT SAMPLE DATA (Optional - Comment out if not needed)
-- ============================================

-- Sample Products with weight fields
INSERT INTO products (name, description, vendor1_name, vendor1_price, vendor1_weight, vendor1_package_size, vendor2_name, vendor2_price, vendor2_weight, vendor2_package_size, vendor3_name, vendor3_price, vendor3_weight, vendor3_package_size, default_vendor_index) VALUES
('Toor Dal', 'Yellow split pigeon peas', 'ABC Suppliers', 120.00, 1, 'kg', 'XYZ Traders', 115.00, 1, 'kg', 'PQR Wholesale', 118.00, 1, 'kg', 1),
('Basmati Rice', 'Premium long grain rice', 'ABC Suppliers', 80.00, 1, 'kg', 'XYZ Traders', 85.00, 1, 'kg', 'PQR Wholesale', 82.00, 1, 'kg', 0),
('Ghee', 'Pure clarified butter', 'ABC Suppliers', 500.00, 1, 'kg', 'XYZ Traders', 480.00, 1, 'kg', 'PQR Wholesale', 490.00, 1, 'kg', 1),
('Besan', 'Gram flour', 'ABC Suppliers', 60.00, 1, 'kg', 'XYZ Traders', 58.00, 1, 'kg', 'PQR Wholesale', 62.00, 1, 'kg', 1),
('Curd', 'Fresh yogurt', 'ABC Suppliers', 50.00, 1, 'kg', 'XYZ Traders', 48.00, 1, 'kg', 'PQR Wholesale', 52.00, 1, 'kg', 1),
('All-Purpose Flour', 'High-quality all-purpose flour for baking', 'Sysco', 15.99, 5, 'kg', 'Gordon Food Service', 14.50, 5, 'kg', NULL, NULL, NULL, NULL, 1),
('Granulated Sugar', 'Pure white granulated sugar', 'Sysco', 12.99, 2, 'kg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
('Butter (Unsalted)', 'Premium unsalted butter', 'Sysco', 8.99, 454, 'g', 'Gordon Food Service', 8.50, 454, 'g', NULL, NULL, NULL, NULL, 1);

-- Sample Recipes
INSERT INTO recipes (name, description) VALUES
('Dal Tadka', 'Spiced lentil curry'),
('Jeera Rice', 'Cumin flavored rice'),
('Kadhi', 'Yogurt-based curry');

-- Sample Recipe Ingredients
-- Dal Tadka recipe (recipe_id = 1)
INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES
(1, 1, 200, 'g'),  -- Toor Dal
(1, 3, 10, 'g');   -- Ghee

-- Jeera Rice recipe (recipe_id = 2)
INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES
(2, 2, 250, 'g'),  -- Basmati Rice
(2, 3, 15, 'g');   -- Ghee

-- Kadhi recipe (recipe_id = 3)
INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES
(3, 4, 100, 'g'),  -- Besan
(3, 5, 500, 'g');  -- Curd

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment these to verify the migration

-- SELECT 'Products Table' as 'Table', COUNT(*) as 'Row Count' FROM products
-- UNION ALL
-- SELECT 'Recipes Table', COUNT(*) FROM recipes
-- UNION ALL
-- SELECT 'Recipe Ingredients Table', COUNT(*) FROM recipe_ingredients;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables have been successfully recreated with the latest schema
-- Weight fields added for all vendors
-- Vendors 2 and 3 are now optional (can be NULL)
-- Sample data has been inserted (if not commented out)
