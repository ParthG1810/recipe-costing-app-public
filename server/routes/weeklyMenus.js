/**
 * Weekly Menus API Routes
 * Handles weekly menu creation, management, and menu items
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const { 
  successResponse, 
  errorResponse, 
  getPagination, 
  buildPaginationResponse 
} = require('../utils');

/**
 * POST /api/weekly-menus
 * Create a new weekly menu
 */
router.post('/', async (req, res) => {
  try {
    const { weekStartDate, name, description } = req.body;
    const pool = req.app.locals.pool;

    if (!weekStartDate) {
      return res.status(400).json(errorResponse('Week start date is required'));
    }

    // Check if menu exists for this week
    const [existing] = await pool.query(
      'SELECT id FROM weekly_menus WHERE week_start_date = ?',
      [weekStartDate]
    );

    if (existing.length > 0) {
      return res.status(400).json(errorResponse('Menu already exists for this week'));
    }

    // Create menu
    const [result] = await pool.query(
      `INSERT INTO weekly_menus (user_id, week_start_date, name, description) 
       VALUES (?, ?, ?, ?)`,
      [1, weekStartDate, name, description]
    );

    // Get created menu
    const [menus] = await pool.query(
      'SELECT * FROM weekly_menus WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(successResponse(menus[0], 'Weekly menu created successfully'));
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * GET /api/weekly-menus
 * Get all weekly menus with pagination
 */
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { page, pageSize, offset, limit } = getPagination(req.query.page, req.query.pageSize);

    // Get total count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM weekly_menus'
    );
    const total = countResult[0].total;

    // Get menus
    const [menus] = await pool.query(
      `SELECT 
        wm.*,
        COUNT(DISTINCT wmi.day_of_week) as days_count,
        COUNT(wmi.id) as total_items
       FROM weekly_menus wm
       LEFT JOIN weekly_menu_items wmi ON wm.id = wmi.weekly_menu_id
       GROUP BY wm.id
       ORDER BY wm.week_start_date DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      ...successResponse(menus),
      pagination: buildPaginationResponse(page, pageSize, total)
    });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * GET /api/weekly-menus/:id
 * Get specific weekly menu with all items
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.pool;

    // Get menu
    const [menus] = await pool.query(
      'SELECT * FROM weekly_menus WHERE id = ?',
      [id]
    );

    if (menus.length === 0) {
      return res.status(404).json(errorResponse('Menu not found'));
    }

    const menu = menus[0];

    // Get items with recipe details
    const [items] = await pool.query(
      `SELECT 
        wmi.*,
        r.name as recipe_name,

        ri.image_url,
        ri.canva_asset_id
       FROM weekly_menu_items wmi
       JOIN recipes r ON wmi.recipe_id = r.id
       LEFT JOIN recipe_images ri ON r.id = ri.recipe_id AND ri.is_default = 1
       WHERE wmi.weekly_menu_id = ?
       ORDER BY wmi.day_of_week, wmi.display_order`,
      [id]
    );

    // Group by day
    const itemsByDay = {};
    items.forEach(item => {
      if (!itemsByDay[item.day_of_week]) {
        itemsByDay[item.day_of_week] = [];
      }
      itemsByDay[item.day_of_week].push(item);
    });

    menu.items = items;
    menu.itemsByDay = itemsByDay;

    res.json(successResponse(menu));
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * GET /api/weekly-menus/week/:date
 * Get menu for specific week
 */
router.get('/week/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const pool = req.app.locals.pool;

    const [menus] = await pool.query(
      'SELECT * FROM weekly_menus WHERE week_start_date = ?',
      [date]
    );

    if (menus.length === 0) {
      return res.json(successResponse(null, 'No menu found for this week'));
    }

    const menu = menus[0];

    // Get items
    const [items] = await pool.query(
      `SELECT 
        wmi.*,
        r.name as recipe_name,

        ri.image_url,
        ri.canva_asset_id
       FROM weekly_menu_items wmi
       JOIN recipes r ON wmi.recipe_id = r.id
       LEFT JOIN recipe_images ri ON r.id = ri.recipe_id AND ri.is_default = 1
       WHERE wmi.weekly_menu_id = ?
       ORDER BY wmi.day_of_week, wmi.display_order`,
      [menu.id]
    );

    // Group by day
    const itemsByDay = {};
    items.forEach(item => {
      if (!itemsByDay[item.day_of_week]) {
        itemsByDay[item.day_of_week] = [];
      }
      itemsByDay[item.day_of_week].push(item);
    });

    menu.items = items;
    menu.itemsByDay = itemsByDay;

    res.json(successResponse(menu));
  } catch (error) {
    console.error('Get menu by week error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * PUT /api/weekly-menus/:id
 * Update menu metadata
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, totalCost, canvaDesignId, exportUrl, isPublished } = req.body;
    const pool = req.app.locals.pool;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (totalCost !== undefined) {
      updates.push('total_cost = ?');
      values.push(totalCost);
    }
    if (canvaDesignId !== undefined) {
      updates.push('canva_design_id = ?');
      values.push(canvaDesignId);
    }
    if (exportUrl !== undefined) {
      updates.push('export_url = ?');
      values.push(exportUrl);
    }
    if (isPublished !== undefined) {
      updates.push('is_published = ?');
      values.push(isPublished ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json(errorResponse('No fields to update'));
    }

    values.push(id);

    await pool.query(
      `UPDATE weekly_menus SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated menu
    const [menus] = await pool.query(
      'SELECT * FROM weekly_menus WHERE id = ?',
      [id]
    );

    res.json(successResponse(menus[0], 'Menu updated successfully'));
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * DELETE /api/weekly-menus/:id
 * Delete a weekly menu
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.pool;

    // Check if exists
    const [menus] = await pool.query(
      'SELECT * FROM weekly_menus WHERE id = ?',
      [id]
    );

    if (menus.length === 0) {
      return res.status(404).json(errorResponse('Menu not found'));
    }

    // Delete (cascade will delete items)
    await pool.query('DELETE FROM weekly_menus WHERE id = ?', [id]);

    res.json(successResponse(null, 'Menu deleted successfully'));
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * POST /api/weekly-menus/:id/items
 * Add items to weekly menu
 */
router.post('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    const pool = req.app.locals.pool;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json(errorResponse('Items array is required'));
    }

    // Validate
    for (const item of items) {
      if (!item.dayOfWeek || !item.recipeId || !item.category) {
        return res.status(400).json(
          errorResponse('Each item must have dayOfWeek, recipeId, and category')
        );
      }
    }

    // Insert items
    const insertPromises = items.map((item, index) => {
      return pool.query(
        `INSERT INTO weekly_menu_items 
         (weekly_menu_id, day_of_week, recipe_id, category, display_order, cost) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, item.dayOfWeek, item.recipeId, item.category, item.displayOrder || index, item.cost || null]
      );
    });

    await Promise.all(insertPromises);

    // Get all items
    const [allItems] = await pool.query(
      `SELECT 
        wmi.*,
        r.name as recipe_name
       FROM weekly_menu_items wmi
       JOIN recipes r ON wmi.recipe_id = r.id
       WHERE wmi.weekly_menu_id = ?
       ORDER BY wmi.day_of_week, wmi.display_order`,
      [id]
    );

    res.status(201).json(successResponse(allItems, 'Items added successfully'));
  } catch (error) {
    console.error('Add items error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * DELETE /api/weekly-menus/:menuId/items/:itemId
 * Remove item from weekly menu
 */
router.delete('/:menuId/items/:itemId', async (req, res) => {
  try {
    const { menuId, itemId } = req.params;
    const pool = req.app.locals.pool;

    // Verify item belongs to menu
    const [items] = await pool.query(
      'SELECT * FROM weekly_menu_items WHERE id = ? AND weekly_menu_id = ?',
      [itemId, menuId]
    );

    if (items.length === 0) {
      return res.status(404).json(errorResponse('Item not found'));
    }

    // Delete
    await pool.query('DELETE FROM weekly_menu_items WHERE id = ?', [itemId]);

    res.json(successResponse(null, 'Item removed successfully'));
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

module.exports = router;
