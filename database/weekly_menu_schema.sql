-- ============================================================================
-- Weekly Menu Creation Feature - Database Schema
-- ============================================================================
-- Created: November 5, 2025
-- Description: Database schema for weekly menu creation with Canva integration
-- ============================================================================

-- Table: recipe_images
-- Purpose: Store multiple images for each recipe with default selection
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL COMMENT 'Local path to the uploaded image',
    canva_asset_id VARCHAR(255) DEFAULT NULL COMMENT 'Canva asset ID after upload',
    is_default BOOLEAN NOT NULL DEFAULT 0 COMMENT 'Whether this is the default image for menus',
    width INT DEFAULT NULL COMMENT 'Image width in pixels',
    height INT DEFAULT NULL COMMENT 'Image height in pixels',
    file_size INT DEFAULT NULL COMMENT 'File size in bytes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint (user_id removed - no users table yet)
    
    -- Indexes for performance
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_is_default (is_default),
    INDEX idx_canva_asset_id (canva_asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores multiple images for each recipe with Canva integration';

-- ============================================================================
-- Table: weekly_menus
-- Purpose: Store weekly menu metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS weekly_menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1 COMMENT 'User ID - set to 1 for single-user mode',
    week_start_date DATE NOT NULL COMMENT 'The Monday of the menu week',
    name VARCHAR(255) DEFAULT NULL COMMENT 'Optional name for the menu (e.g., "Diwali Special Week")',
    description TEXT DEFAULT NULL COMMENT 'Optional description of the menu',
    total_cost DECIMAL(10, 2) DEFAULT NULL COMMENT 'Total cost for the entire week',
    canva_design_id VARCHAR(255) DEFAULT NULL COMMENT 'Canva design ID for the generated menu',
    export_url VARCHAR(500) DEFAULT NULL COMMENT 'URL to the exported menu image',
    is_published BOOLEAN NOT NULL DEFAULT 0 COMMENT 'Whether the menu is published/shared',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint (user_id removed - no users table yet)
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_week_start_date (week_start_date),
    INDEX idx_is_published (is_published),
    INDEX idx_canva_design_id (canva_design_id),
    
    -- Unique constraint: one menu per user per week
    UNIQUE KEY unique_user_week (user_id, week_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores weekly menu metadata and Canva design information';

-- ============================================================================
-- Table: weekly_menu_items
-- Purpose: Store individual items for each day of the week
-- ============================================================================
CREATE TABLE IF NOT EXISTS weekly_menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    weekly_menu_id INT NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT 'Day of the week (1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)',
    recipe_id INT NOT NULL,
    category VARCHAR(50) NOT NULL COMMENT 'Category: Sabzi, Dal, Rice, Roti, Special',
    display_order TINYINT NOT NULL DEFAULT 0 COMMENT 'Order in which items are displayed',
    cost DECIMAL(10, 2) DEFAULT NULL COMMENT 'Cost of this item',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (weekly_menu_id) REFERENCES weekly_menus(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_weekly_menu_id (weekly_menu_id),
    INDEX idx_day_of_week (day_of_week),
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_category (category),
    
    -- Constraint: day_of_week must be between 1 and 6
    CHECK (day_of_week >= 1 AND day_of_week <= 6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores individual recipe items for each day of the weekly menu';

-- ============================================================================
-- Table: canva_templates
-- Purpose: Store Canva template information for menu generation
-- ============================================================================
CREATE TABLE IF NOT EXISTS canva_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL COMMENT 'NULL for system templates, user_id for custom imports',
    template_name VARCHAR(255) NOT NULL,
    canva_design_id VARCHAR(255) NOT NULL COMMENT 'The design ID from Canva',
    thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT 'URL for the template thumbnail',
    design_type VARCHAR(50) NOT NULL DEFAULT 'flyer' COMMENT 'Canva design type: flyer, poster, etc.',
    is_default BOOLEAN NOT NULL DEFAULT 0 COMMENT 'Whether this is the user\'s default template',
    is_system_template BOOLEAN NOT NULL DEFAULT 0 COMMENT 'Whether this is a pre-generated system template',
    style VARCHAR(50) DEFAULT NULL COMMENT 'Style: Modern, Traditional, Colorful, Minimalist',
    description TEXT DEFAULT NULL COMMENT 'Description of the template',
    generation_prompt TEXT DEFAULT NULL COMMENT 'AI prompt used to generate this template',
    page_count INT DEFAULT 1 COMMENT 'Number of pages in the template',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint (user_id removed - no users table yet)
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_canva_design_id (canva_design_id),
    INDEX idx_is_default (is_default),
    INDEX idx_is_system_template (is_system_template),
    INDEX idx_style (style),
    
    -- Unique constraint: Canva design ID must be unique
    UNIQUE KEY unique_canva_design_id (canva_design_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores Canva template information for menu generation';

-- ============================================================================
-- Table: menu_shares
-- Purpose: Track shared menus and generate shareable links
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    weekly_menu_id INT NOT NULL,
    share_token VARCHAR(64) NOT NULL COMMENT 'Unique token for shareable URL',
    share_url VARCHAR(500) DEFAULT NULL COMMENT 'Full shareable URL',
    qr_code_url VARCHAR(500) DEFAULT NULL COMMENT 'URL to the generated QR code image',
    view_count INT NOT NULL DEFAULT 0 COMMENT 'Number of times the menu was viewed',
    is_active BOOLEAN NOT NULL DEFAULT 1 COMMENT 'Whether the share link is active',
    expires_at TIMESTAMP DEFAULT NULL COMMENT 'Optional expiration date for the share link',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_viewed_at TIMESTAMP DEFAULT NULL COMMENT 'Last time the menu was viewed',
    
    -- Foreign key constraint
    FOREIGN KEY (weekly_menu_id) REFERENCES weekly_menus(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_weekly_menu_id (weekly_menu_id),
    INDEX idx_share_token (share_token),
    INDEX idx_is_active (is_active),
    
    -- Unique constraint: share token must be unique
    UNIQUE KEY unique_share_token (share_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks shared menus with shareable links and QR codes';

-- ============================================================================
-- Table: menu_feedback
-- Purpose: Store customer feedback on shared menus
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_share_id INT NOT NULL,
    customer_name VARCHAR(100) DEFAULT NULL COMMENT 'Optional customer name',
    customer_email VARCHAR(255) DEFAULT NULL COMMENT 'Optional customer email',
    rating TINYINT DEFAULT NULL COMMENT 'Rating from 1 to 5 stars',
    comment TEXT DEFAULT NULL COMMENT 'Customer comment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (menu_share_id) REFERENCES menu_shares(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_menu_share_id (menu_share_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    
    -- Constraint: rating must be between 1 and 5
    CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores customer feedback on shared menus';

-- ============================================================================
-- Insert sample system templates (to be populated after generation)
-- ============================================================================
-- These will be populated after we generate a curated collection of templates
-- using Canva's AI generation feature

-- ============================================================================
-- Useful Views for Common Queries
-- ============================================================================

-- View: weekly_menu_summary
-- Purpose: Get a complete summary of a weekly menu with all items
CREATE OR REPLACE VIEW weekly_menu_summary AS
SELECT 
    wm.id AS menu_id,
    wm.user_id,
    wm.week_start_date,
    wm.name AS menu_name,
    wm.total_cost,
    wm.canva_design_id,
    wm.export_url,
    wm.is_published,
    COUNT(DISTINCT wmi.day_of_week) AS days_count,
    COUNT(wmi.id) AS total_items,
    GROUP_CONCAT(DISTINCT wmi.category ORDER BY wmi.category) AS categories
FROM weekly_menus wm
LEFT JOIN weekly_menu_items wmi ON wm.id = wmi.weekly_menu_id
GROUP BY wm.id;

-- View: recipe_with_default_image
-- Purpose: Get recipes with their default image
CREATE OR REPLACE VIEW recipe_with_default_image AS
SELECT 
    r.id AS recipe_id,
    r.name AS recipe_name,
    ri.id AS image_id,
    ri.image_url,
    ri.canva_asset_id,
    ri.width,
    ri.height
FROM recipes r
LEFT JOIN recipe_images ri ON r.id = ri.recipe_id AND ri.is_default = 1;

-- ============================================================================
-- Stored Procedures
-- ============================================================================

-- Procedure: get_weekly_menu_details
-- Purpose: Get complete details of a weekly menu including all items
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_weekly_menu_details(IN menu_id INT)
BEGIN
    -- Get menu metadata
    SELECT * FROM weekly_menus WHERE id = menu_id;
    
    -- Get all menu items with recipe details
    SELECT 
        wmi.id,
        wmi.day_of_week,
        wmi.category,
        wmi.display_order,
        wmi.cost,
        r.id AS recipe_id,
        r.name AS recipe_name,
        ri.image_url,
        ri.canva_asset_id
    FROM weekly_menu_items wmi
    JOIN recipes r ON wmi.recipe_id = r.id
    LEFT JOIN recipe_images ri ON r.id = ri.recipe_id AND ri.is_default = 1
    WHERE wmi.weekly_menu_id = menu_id
    ORDER BY wmi.day_of_week, wmi.display_order;
END //
DELIMITER ;

-- ============================================================================
-- End of Schema
-- ============================================================================
