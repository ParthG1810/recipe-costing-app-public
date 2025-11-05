-- =====================================================
-- Complete Setup with Dummy Data
-- Recipe Costing Application - Weekly Menu Feature
-- =====================================================
-- This file contains:
-- 1. Schema creation for weekly menu tables
-- 2. Dummy data (27 recipes, 6 images, 1 menu, 30 items, 1 template)
--
-- Usage:
--   mysql -u root -pMysql recipe_costing_db < database/complete_setup_with_data.sql
-- =====================================================

-- =====================================================
-- PART 1: CREATE TABLES
-- =====================================================

-- Table: recipe_images
CREATE TABLE IF NOT EXISTS `recipe_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `canva_asset_id` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipe_id` (`recipe_id`),
  KEY `idx_is_default` (`is_default`),
  CONSTRAINT `fk_recipe_images_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: weekly_menus
CREATE TABLE IF NOT EXISTS `weekly_menus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT '1',
  `week_start_date` date NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `canva_design_id` varchar(255) DEFAULT NULL,
  `export_url` varchar(500) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_week` (`user_id`,`week_start_date`),
  KEY `idx_week_start_date` (`week_start_date`),
  KEY `idx_is_published` (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: weekly_menu_items
CREATE TABLE IF NOT EXISTS `weekly_menu_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `weekly_menu_id` int NOT NULL,
  `day_of_week` tinyint NOT NULL COMMENT '1=Monday, 2=Tuesday, ..., 6=Saturday',
  `recipe_id` int NOT NULL,
  `category` varchar(50) NOT NULL COMMENT 'Sabzi, Dal/Kadhi, Rice, Roti/Paratha, Special Items',
  `display_order` int NOT NULL DEFAULT '0',
  `cost` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_weekly_menu_id` (`weekly_menu_id`),
  KEY `idx_day_of_week` (`day_of_week`),
  KEY `idx_recipe_id` (`recipe_id`),
  CONSTRAINT `fk_menu_items_menu` FOREIGN KEY (`weekly_menu_id`) REFERENCES `weekly_menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_menu_items_recipe` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: canva_templates
CREATE TABLE IF NOT EXISTS `canva_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `template_name` varchar(255) NOT NULL,
  `canva_design_id` varchar(255) NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `design_type` varchar(50) NOT NULL DEFAULT 'flyer',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `is_system_template` tinyint(1) NOT NULL DEFAULT '0',
  `style` varchar(50) DEFAULT NULL COMMENT 'modern, traditional, colorful, minimalist',
  `description` text,
  `generation_prompt` text,
  `page_count` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_canva_design_id` (`canva_design_id`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_is_system_template` (`is_system_template`),
  KEY `idx_style` (`style`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: menu_share_links
CREATE TABLE IF NOT EXISTS `menu_share_links` (
  `id` int NOT NULL AUTO_INCREMENT,
  `weekly_menu_id` int NOT NULL,
  `share_token` varchar(255) NOT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `view_count` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_share_token` (`share_token`),
  KEY `idx_weekly_menu_id` (`weekly_menu_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_share_links_menu` FOREIGN KEY (`weekly_menu_id`) REFERENCES `weekly_menus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: customer_feedback
CREATE TABLE IF NOT EXISTS `customer_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `weekly_menu_id` int NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `rating` tinyint DEFAULT NULL COMMENT '1-5 stars',
  `feedback_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_weekly_menu_id` (`weekly_menu_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `fk_feedback_menu` FOREIGN KEY (`weekly_menu_id`) REFERENCES `weekly_menus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- PART 2: INSERT DUMMY DATA
-- =====================================================

-- Clear existing data (optional - comment out if you want to keep existing data)
DELETE FROM customer_feedback WHERE id > 0;
DELETE FROM menu_share_links WHERE id > 0;
DELETE FROM weekly_menu_items WHERE id > 0;
DELETE FROM weekly_menus WHERE id > 0;
DELETE FROM canva_templates WHERE id > 0;
DELETE FROM recipe_images WHERE id > 0;
-- Note: Not deleting recipes as they might be used elsewhere

-- Insert Recipes (27 total)
INSERT INTO `recipes` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Dal Tadka', 'Spiced lentil curry', '2025-11-05 14:12:02', '2025-11-05 14:12:02'),
(2, 'Jeera Rice', 'Cumin flavored rice', '2025-11-05 14:12:02', '2025-11-05 14:12:02'),
(3, 'Kadhi', 'Yogurt-based curry', '2025-11-05 14:12:02', '2025-11-05 14:12:02'),
(4, 'Aloo Sabzi', 'Simple potato curry', '2025-11-05 14:36:30', '2025-11-05 14:36:30'),
(5, 'Dal Tadka', 'Yellow lentils with tempering', '2025-11-05 14:36:37', '2025-11-05 14:36:37'),
(6, 'Jeera Rice', 'Cumin flavored rice', '2025-11-05 14:36:37', '2025-11-05 14:36:37'),
(7, 'Roti', 'Whole wheat flatbread', '2025-11-05 14:36:37', '2025-11-05 14:36:37'),
(8, 'Paneer Butter Masala', 'Rich and creamy paneer curry', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(9, 'Chole Masala', 'Spicy chickpea curry', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(10, 'Mix Veg Curry', 'Seasonal vegetables in curry', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(11, 'Palak Paneer', 'Spinach and cottage cheese curry', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(12, 'Bhindi Masala', 'Okra stir fry with spices', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(13, 'Baingan Bharta', 'Roasted eggplant curry', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(14, 'Moong Dal', 'Yellow lentil soup', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(15, 'Masoor Dal', 'Red lentil curry', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(16, 'Rajma', 'Kidney beans curry', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(17, 'Veg Pulao', 'Flavored rice with vegetables', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(18, 'Lemon Rice', 'Tangy rice with peanuts', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(19, 'Curd Rice', 'Yogurt rice with tempering', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(20, 'Chapati', 'Whole wheat flatbread', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(21, 'Paratha', 'Layered flatbread', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(22, 'Puri', 'Deep fried bread', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(23, 'Gulab Jamun', 'Sweet milk dumplings', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(24, 'Kheer', 'Rice pudding', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(25, 'Raita', 'Yogurt with vegetables', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(26, 'Papad', 'Crispy lentil wafers', '2025-11-05 16:01:40', '2025-11-05 16:01:40'),
(27, 'Pickle', 'Spicy mango pickle', '2025-11-05 16:01:40', '2025-11-05 16:01:40')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Recipe Images (6 total)
INSERT INTO `recipe_images` (`id`, `recipe_id`, `image_url`, `canva_asset_id`, `is_default`, `width`, `height`, `file_size`, `created_at`, `updated_at`) VALUES
(1, 8, '/uploads/recipe-images/paneer-butter-masala.jpg', NULL, 1, 1200, 800, 251000, '2025-11-05 16:02:36', '2025-11-05 16:02:36'),
(2, 9, '/uploads/recipe-images/chole-masala.jpg', NULL, 1, 1456, 2184, 631000, '2025-11-05 16:02:36', '2025-11-05 16:02:36'),
(3, 11, '/uploads/recipe-images/palak-paneer.jpg', NULL, 1, 660, 1000, 122000, '2025-11-05 16:02:36', '2025-11-05 16:02:36'),
(4, 1, '/uploads/recipe-images/dal-tadka.webp', NULL, 1, 800, 800, 82000, '2025-11-05 16:02:36', '2025-11-05 16:02:36'),
(5, 2, '/uploads/recipe-images/jeera-rice.jpg', NULL, 1, 800, 600, 130000, '2025-11-05 16:02:36', '2025-11-05 16:02:36'),
(6, 17, '/uploads/recipe-images/veg-pulao.jpg', NULL, 1, 1200, 1798, 152000, '2025-11-05 16:02:36', '2025-11-05 16:02:36')
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Insert Weekly Menu (1 total)
INSERT INTO `weekly_menus` (`id`, `user_id`, `week_start_date`, `name`, `description`, `total_cost`, `canva_design_id`, `export_url`, `is_published`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-11-04', 'Surti Fusion Weekly Menu', 'Authentic Gujarati and North Indian fusion tiffin menu', NULL, 'DAG32D4N-fo', '/canva_samples/surti-fusion-menu.png', 1, '2025-11-05 14:22:48', '2025-11-05 16:05:49')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Weekly Menu Items (30 total - 5 items per day × 6 days)
INSERT INTO `weekly_menu_items` (`id`, `weekly_menu_id`, `day_of_week`, `recipe_id`, `category`, `display_order`, `cost`, `created_at`) VALUES
-- Monday (day 1)
(22, 1, 1, 8, 'Sabzi', 0, NULL, '2025-11-05 16:03:11'),
(24, 1, 1, 14, 'Dal', 1, NULL, '2025-11-05 16:03:11'),
(25, 1, 1, 2, 'Rice', 2, NULL, '2025-11-05 16:03:11'),
(23, 1, 1, 20, 'Roti', 3, NULL, '2025-11-05 16:03:11'),
(27, 1, 1, 24, 'Special', 4, NULL, '2025-11-05 16:03:11'),
-- Tuesday (day 2)
(28, 1, 2, 11, 'Sabzi', 0, NULL, '2025-11-05 16:03:11'),
(29, 1, 2, 1, 'Dal', 1, NULL, '2025-11-05 16:03:11'),
(30, 1, 2, 17, 'Rice', 2, NULL, '2025-11-05 16:03:11'),
(26, 1, 2, 19, 'Roti', 3, NULL, '2025-11-05 16:03:11'),
(31, 1, 2, 25, 'Special', 4, NULL, '2025-11-05 16:03:11'),
-- Wednesday (day 3)
(32, 1, 3, 10, 'Sabzi', 0, NULL, '2025-11-05 16:03:11'),
(33, 1, 3, 15, 'Dal', 1, NULL, '2025-11-05 16:03:11'),
(34, 1, 3, 18, 'Rice', 2, NULL, '2025-11-05 16:03:11'),
(35, 1, 3, 7, 'Roti', 3, NULL, '2025-11-05 16:03:11'),
(36, 1, 3, 23, 'Special', 4, NULL, '2025-11-05 16:03:11'),
-- Thursday (day 4)
(37, 1, 4, 9, 'Sabzi', 0, NULL, '2025-11-05 16:03:11'),
(38, 1, 4, 16, 'Dal', 1, NULL, '2025-11-05 16:03:11'),
(39, 1, 4, 2, 'Rice', 2, NULL, '2025-11-05 16:03:11'),
(40, 1, 4, 21, 'Roti', 3, NULL, '2025-11-05 16:03:11'),
(41, 1, 4, 22, 'Special', 4, NULL, '2025-11-05 16:03:11'),
-- Friday (day 5)
(42, 1, 5, 12, 'Sabzi', 0, NULL, '2025-11-05 16:03:11'),
(43, 1, 5, 1, 'Dal', 1, NULL, '2025-11-05 16:03:11'),
(44, 1, 5, 17, 'Rice', 2, NULL, '2025-11-05 16:03:11'),
(45, 1, 5, 20, 'Roti', 3, NULL, '2025-11-05 16:03:11'),
(46, 1, 5, 23, 'Special', 4, NULL, '2025-11-05 16:03:11'),
-- Saturday (day 6)
(47, 1, 6, 13, 'Sabzi', 0, NULL, '2025-11-05 16:03:11'),
(48, 1, 6, 3, 'Dal', 1, NULL, '2025-11-05 16:03:11'),
(49, 1, 6, 19, 'Rice', 2, NULL, '2025-11-05 16:03:11'),
(50, 1, 6, 21, 'Roti', 3, NULL, '2025-11-05 16:03:11'),
(51, 1, 6, 22, 'Special', 4, NULL, '2025-11-05 16:03:11')
ON DUPLICATE KEY UPDATE recipe_id=VALUES(recipe_id);

-- Insert Canva Template (1 total)
INSERT INTO `canva_templates` (`id`, `user_id`, `template_name`, `canva_design_id`, `thumbnail_url`, `design_type`, `is_default`, `is_system_template`, `style`, `description`, `generation_prompt`, `page_count`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Weekly Menu Delight', 'DAG32D4N-fo', NULL, 'flyer', 1, 0, 'modern', NULL, 'Professional tiffin service weekly menu with food images, modern layout, warm colors, Indian cuisine', 1, '2025-11-05 16:04:54', '2025-11-05 16:04:54')
ON DUPLICATE KEY UPDATE template_name=VALUES(template_name);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data counts
SELECT 'Data Import Summary' as '';
SELECT '==================' as '';
SELECT CONCAT('Recipes: ', COUNT(*)) as 'Count' FROM recipes;
SELECT CONCAT('Recipe Images: ', COUNT(*)) as 'Count' FROM recipe_images;
SELECT CONCAT('Weekly Menus: ', COUNT(*)) as 'Count' FROM weekly_menus;
SELECT CONCAT('Menu Items: ', COUNT(*)) as 'Count' FROM weekly_menu_items;
SELECT CONCAT('Canva Templates: ', COUNT(*)) as 'Count' FROM canva_templates;

-- Show sample data
SELECT '' as '';
SELECT 'Sample Weekly Menu:' as '';
SELECT '==================' as '';
SELECT 
    wm.name as 'Menu Name',
    wm.week_start_date as 'Week Start',
    COUNT(DISTINCT wmi.day_of_week) as 'Days',
    COUNT(wmi.id) as 'Total Items'
FROM weekly_menus wm
LEFT JOIN weekly_menu_items wmi ON wm.id = wmi.weekly_menu_id
WHERE wm.id = 1
GROUP BY wm.id;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Extract images: unzip database/recipe-images.zip -d .
-- 2. Restart backend: node server/index.js
-- 3. Open browser: http://localhost:3000/weekly-menu
-- =====================================================
