/**
 * Canva Templates API Routes
 * Handles template generation, management, and menu export
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const { 
  successResponse, 
  errorResponse, 
  generateToken,
  executeCanvaMCP 
} = require('../utils');

/**
 * POST /api/canva/generate-template
 * Generate template using Canva AI
 */
router.post('/generate-template', async (req, res) => {
  try {
    const { style, customPrompt } = req.body;
    const pool = req.app.locals.pool;

    if (!style && !customPrompt) {
      return res.status(400).json(errorResponse('Style or custom prompt is required'));
    }

    // Template style prompts
    const stylePrompts = {
      modern: 'Create a modern weekly tiffin menu for Monday to Saturday with clean layout, sans-serif fonts, and space for 4 food images per day. Use neutral colors with accent colors. Include sections for Sabzi, Dal, Rice, and Roti.',
      traditional: 'Create a traditional Indian tiffin menu with decorative borders, traditional patterns, and ornate fonts. Use warm colors like orange, red, and gold. Include space for food images and daily items.',
      colorful: 'Create a vibrant, colorful weekly tiffin menu with bold colors, playful fonts, and space for food photography. Use Indian food theme with spices and traditional elements.',
      minimalist: 'Create a minimalist weekly tiffin menu with simple layout, lots of white space, and clean typography. Use one or two accent colors. Focus on readability and elegance.'
    };

    const prompt = customPrompt || stylePrompts[style] || stylePrompts.modern;

    // Generate design with Canva AI
    const response = await executeCanvaMCP('generate-design', {
      query: prompt,
      design_type: 'flyer'
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No templates generated');
    }

    res.json(successResponse({
      candidates: response.candidates,
      style: style || 'custom',
      prompt: prompt
    }, 'Templates generated successfully'));
  } catch (error) {
    console.error('Generate template error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * POST /api/canva/convert-candidate
 * Convert AI candidate to editable design
 */
router.post('/convert-candidate', async (req, res) => {
  try {
    const { candidateId, name, style } = req.body;
    const pool = req.app.locals.pool;

    if (!candidateId) {
      return res.status(400).json(errorResponse('Candidate ID is required'));
    }

    // Convert candidate to design
    const response = await executeCanvaMCP('create-design-from-candidate', {
      candidate_id: candidateId
    });

    const designId = response.design_id || response.id;

    if (!designId) {
      throw new Error('Failed to get design ID');
    }

    // Get design details
    const designDetails = await executeCanvaMCP('get-design', {
      design_id: designId
    });

    // Save template to database
    const [result] = await pool.query(
      `INSERT INTO canva_templates 
       (user_id, canva_design_id, name, style, thumbnail_url, page_count) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        1,
        designId,
        name || `Menu Template - ${style || 'Custom'}`,
        style || 'custom',
        designDetails.thumbnail_url || null,
        designDetails.page_count || 1
      ]
    );

    // Get saved template
    const [templates] = await pool.query(
      'SELECT * FROM canva_templates WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(successResponse(templates[0], 'Template created successfully'));
  } catch (error) {
    console.error('Convert candidate error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * GET /api/canva/templates
 * Get all saved templates
 */
router.get('/templates', async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    const [templates] = await pool.query(
      `SELECT * FROM canva_templates 
       WHERE user_id = 1 OR is_system_template = 1
       ORDER BY is_default DESC, created_at DESC`
    );

    res.json(successResponse(templates));
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * POST /api/canva/templates
 * Save a template
 */
router.post('/templates', async (req, res) => {
  try {
    const { canvaDesignId, name, style, thumbnailUrl } = req.body;
    const pool = req.app.locals.pool;

    if (!canvaDesignId) {
      return res.status(400).json(errorResponse('Canva design ID is required'));
    }

    // Check if already exists
    const [existing] = await pool.query(
      'SELECT id FROM canva_templates WHERE canva_design_id = ?',
      [canvaDesignId]
    );

    if (existing.length > 0) {
      return res.status(400).json(errorResponse('Template already saved'));
    }

    // Save template
    const [result] = await pool.query(
      `INSERT INTO canva_templates 
       (user_id, canva_design_id, name, style, thumbnail_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [1, canvaDesignId, name, style, thumbnailUrl]
    );

    // Get saved template
    const [templates] = await pool.query(
      'SELECT * FROM canva_templates WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(successResponse(templates[0], 'Template saved successfully'));
  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * PUT /api/canva/templates/:id/default
 * Set template as default
 */
router.put('/templates/:id/default', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.pool;

    // Unset all defaults
    await pool.query(
      'UPDATE canva_templates SET is_default = 0 WHERE user_id = 1'
    );

    // Set this as default
    await pool.query(
      'UPDATE canva_templates SET is_default = 1 WHERE id = ?',
      [id]
    );

    res.json(successResponse(null, 'Default template updated successfully'));
  } catch (error) {
    console.error('Set default template error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * DELETE /api/canva/templates/:id
 * Delete a template
 */
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.pool;

    // Check if exists
    const [templates] = await pool.query(
      'SELECT * FROM canva_templates WHERE id = ?',
      [id]
    );

    if (templates.length === 0) {
      return res.status(404).json(errorResponse('Template not found'));
    }

    // Don't allow deleting system templates
    if (templates[0].is_system_template) {
      return res.status(400).json(errorResponse('Cannot delete system template'));
    }

    // Delete
    await pool.query('DELETE FROM canva_templates WHERE id = ?', [id]);

    res.json(successResponse(null, 'Template deleted successfully'));
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * POST /api/canva/export-menu
 * Export menu design
 */
router.post('/export-menu', async (req, res) => {
  try {
    const { menuId, format, quality } = req.body;
    const pool = req.app.locals.pool;

    if (!menuId) {
      return res.status(400).json(errorResponse('Menu ID is required'));
    }

    // Get menu with design ID
    const [menus] = await pool.query(
      'SELECT * FROM weekly_menus WHERE id = ?',
      [menuId]
    );

    if (menus.length === 0) {
      return res.status(404).json(errorResponse('Menu not found'));
    }

    const menu = menus[0];

    if (!menu.canva_design_id) {
      return res.status(400).json(errorResponse('Menu does not have a Canva design'));
    }

    // Export design
    const exportFormat = format || config.menuExport.format;
    const exportQuality = quality || config.menuExport.quality;

    const response = await executeCanvaMCP('export-design', {
      design_id: menu.canva_design_id,
      format: exportFormat,
      quality: exportQuality
    });

    const exportUrl = response.export_url || response.url;

    if (!exportUrl) {
      throw new Error('Failed to get export URL');
    }

    // Update menu with export URL
    await pool.query(
      'UPDATE weekly_menus SET export_url = ? WHERE id = ?',
      [exportUrl, menuId]
    );

    res.json(successResponse({
      export_url: exportUrl,
      format: exportFormat,
      quality: exportQuality
    }, 'Menu exported successfully'));
  } catch (error) {
    console.error('Export menu error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * POST /api/canva/share-menu
 * Create shareable link for menu
 */
router.post('/share-menu', async (req, res) => {
  try {
    const { menuId, expiresAt } = req.body;
    const pool = req.app.locals.pool;

    if (!menuId) {
      return res.status(400).json(errorResponse('Menu ID is required'));
    }

    // Check if menu exists
    const [menus] = await pool.query(
      'SELECT * FROM weekly_menus WHERE id = ?',
      [menuId]
    );

    if (menus.length === 0) {
      return res.status(404).json(errorResponse('Menu not found'));
    }

    // Generate unique token
    const shareToken = generateToken();
    const shareUrl = `${config.share.baseUrl}/${shareToken}`;

    // Create share record
    const [result] = await pool.query(
      `INSERT INTO menu_shares 
       (weekly_menu_id, share_token, share_url, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [menuId, shareToken, shareUrl, expiresAt || null]
    );

    // Get share record
    const [shares] = await pool.query(
      'SELECT * FROM menu_shares WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(successResponse(shares[0], 'Share link created successfully'));
  } catch (error) {
    console.error('Share menu error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * GET /api/canva/share/:token
 * Get shared menu (public endpoint)
 */
router.get('/share/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const pool = req.app.locals.pool;

    // Get share record
    const [shares] = await pool.query(
      `SELECT ms.*, wm.* 
       FROM menu_shares ms
       JOIN weekly_menus wm ON ms.weekly_menu_id = wm.id
       WHERE ms.share_token = ? AND ms.is_active = 1`,
      [token]
    );

    if (shares.length === 0) {
      return res.status(404).json(errorResponse('Shared menu not found or expired'));
    }

    const share = shares[0];

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json(errorResponse('Share link has expired'));
    }

    // Increment view count
    await pool.query(
      'UPDATE menu_shares SET view_count = view_count + 1 WHERE id = ?',
      [share.id]
    );

    // Get menu items
    const [items] = await pool.query(
      `SELECT 
        wmi.*,
        r.name as recipe_name,
        ri.image_url
       FROM weekly_menu_items wmi
       JOIN recipes r ON wmi.recipe_id = r.id
       LEFT JOIN recipe_images ri ON r.id = ri.recipe_id AND ri.is_default = 1
       WHERE wmi.weekly_menu_id = ?
       ORDER BY wmi.day_of_week, wmi.display_order`,
      [share.weekly_menu_id]
    );

    share.items = items;

    res.json(successResponse(share));
  } catch (error) {
    console.error('Get shared menu error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

module.exports = router;
