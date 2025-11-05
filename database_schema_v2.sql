-- ============================================
-- Recipe Costing Application - Database Schema V2
-- ============================================
-- This version uses a separate product_vendors table
-- to allow unlimited vendors per product
--
-- HOW TO RUN:
-- Option 1: MySQL Workbench
--   1. Open MySQL Workbench
--   2. Connect to your MySQL server
--   3. File > Open SQL Script > Select this file
--   4. Click Execute (lightning bolt icon)
--
-- Option 2: Command Line
--   mysql -u root -pMysql recipe_costing_db < database_schema_v2.sql
-- ============================================

-- Use the database
USE recipe_costing_db;

-- ============================================
-- DROP EXISTING TABLES
-- ============================================
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS product_vendors;
DROP TABLE IF EXISTS products;

-- ============================================
-- CREATE PRODUCTS TABLE (Simplified)
-- ============================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  default_vendor_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CREATE PRODUCT_VENDORS TABLE (New)
-- ============================================
CREATE TABLE product_vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  package_size VARCHAR(10) DEFAULT 'g',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_vendor_name (vendor_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CREATE RECIPES TABLE
-- ============================================
CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
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
  
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_recipe_id (recipe_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Sample Products
INSERT INTO products (name, description) VALUES
('Toor Dal', 'Yellow split pigeon peas'),
('Basmati Rice', 'Premium long grain rice'),
('Ghee', 'Pure clarified butter'),
('Besan', 'Gram flour'),
('Curd', 'Fresh yogurt'),
('All-Purpose Flour', 'High-quality all-purpose flour for baking'),
('Granulated Sugar', 'Pure white granulated sugar'),
('Butter (Unsalted)', 'Premium unsalted butter');

-- Sample Product Vendors (Multiple vendors per product)
-- Toor Dal vendors
INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) VALUES
(1, 'ABC Suppliers', 120.00, 1, 'kg', FALSE),
(1, 'XYZ Traders', 115.00, 1, 'kg', TRUE),
(1, 'PQR Wholesale', 118.00, 1, 'kg', FALSE);

-- Basmati Rice vendors
INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) VALUES
(2, 'ABC Suppliers', 80.00, 1, 'kg', TRUE),
(2, 'XYZ Traders', 85.00, 1, 'kg', FALSE),
(2, 'PQR Wholesale', 82.00, 1, 'kg', FALSE);

-- Ghee vendors
INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) VALUES
(3, 'ABC Suppliers', 500.00, 1, 'kg', FALSE),
(3, 'XYZ Traders', 480.00, 1, 'kg', TRUE),
(3, 'PQR Wholesale', 490.00, 1, 'kg', FALSE);

-- Besan vendors
INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) VALUES
(4, 'ABC Suppliers', 60.00, 1, 'kg', FALSE),
(4, 'XYZ Traders', 58.00, 1, 'kg', TRUE),
(4, 'PQR Wholesale', 62.00, 1, 'kg', FALSE);

-- Curd vendors
INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) VALUES
(5, 'ABC Suppliers', 50.00, 1, 'kg', FALSE),
(5, 'XYZ Traders', 48.00, 1, 'kg', TRUE),
(5, 'PQR Wholesale', 52.00, 1, 'kg', FALSE);

-- All-Purpose Flour vendors
INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) VALUES
(6, 'Sysco', 15.99, 5, 'kg', FALSE),
(6, 'Gordon Food Service', 14.50, 5, 'kg', TRUE);

-- Granulated Sugar vendors
INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) VALUES
(7, 'Sysco', 12.99, 2, 'kg', TRUE);

-- Butter vendors
INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) VALUES
(8, 'Sysco', 8.99, 454, 'g', FALSE),
(8, 'Gordon Food Service', 8.50, 454, 'g', TRUE);

-- Sample Recipes
INSERT INTO recipes (name, description) VALUES
('Dal Tadka', 'Spiced lentil curry'),
('Jeera Rice', 'Cumin flavored rice'),
('Kadhi', 'Yogurt-based curry');

-- Sample Recipe Ingredients
INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES
(1, 1, 200, 'g'),
(1, 3, 10, 'g'),
(2, 2, 250, 'g'),
(2, 3, 15, 'g'),
(3, 4, 100, 'g'),
(3, 5, 500, 'g');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT 'Products Table' as 'Table', COUNT(*) as 'Row Count' FROM products
UNION ALL
SELECT 'Product Vendors Table', COUNT(*) FROM product_vendors
UNION ALL
SELECT 'Recipes Table', COUNT(*) FROM recipes
UNION ALL
SELECT 'Recipe Ingredients Table', COUNT(*) FROM recipe_ingredients;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- New schema with unlimited vendors per product
-- product_vendors table allows any number of vendors
-- is_default flag indicates which vendor is the default
