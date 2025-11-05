/**
 * Recipe Images API Routes
 * Handles recipe image upload, management, and Canva integration
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const config = require('../config');
const { successResponse, errorResponse, executeCanvaMCP } = require('../utils');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', config.upload.directory, 'recipe_images');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `recipe-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${config.upload.allowedImageTypes.join(', ')}`));
    }
  }
});

/**
 * POST /api/recipe-images/upload
 * Upload image for a recipe
 */
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { recipeId, isDefault } = req.body;
    const pool = req.app.locals.pool;

    if (!recipeId) {
      return res.status(400).json(errorResponse('Recipe ID is required'));
    }

    if (!req.file) {
      return res.status(400).json(errorResponse('No image file uploaded'));
    }

    const imageUrl = `/uploads/recipe_images/${req.file.filename}`;
    const stats = await fs.stat(req.file.path);

    // If this is set as default, unset other defaults
    if (isDefault === 'true' || isDefault === true) {
      await pool.query(
        'UPDATE recipe_images SET is_default = 0 WHERE recipe_id = ?',
        [recipeId]
      );
    }

    // Insert image record
    const [result] = await pool.query(
      `INSERT INTO recipe_images 
       (recipe_id, image_url, is_default, file_size) 
       VALUES (?, ?, ?, ?)`,
      [recipeId, imageUrl, isDefault === 'true' || isDefault === true ? 1 : 0, stats.size]
    );

    // Get the created image
    const [images] = await pool.query(
      'SELECT * FROM recipe_images WHERE id = ?',
      [result.insertId]
    );

    res.json(successResponse(images[0], 'Image uploaded successfully'));
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * POST /api/recipe-images/upload-to-canva
 * Upload image to Canva and store asset ID
 */
router.post('/upload-to-canva', async (req, res) => {
  try {
    const { imageId } = req.body;
    const pool = req.app.locals.pool;

    if (!imageId) {
      return res.status(400).json(errorResponse('Image ID is required'));
    }

    // Get image details
    const [images] = await pool.query(
      'SELECT * FROM recipe_images WHERE id = ?',
      [imageId]
    );

    if (images.length === 0) {
      return res.status(404).json(errorResponse('Image not found'));
    }

    const image = images[0];

    // Check if already uploaded
    if (image.canva_asset_id) {
      return res.json(successResponse(
        { canva_asset_id: image.canva_asset_id },
        'Image already uploaded to Canva'
      ));
    }

    // Get recipe name
    const [recipes] = await pool.query(
      'SELECT name FROM recipes WHERE id = ?',
      [image.recipe_id]
    );

    const recipeName = recipes[0]?.name || 'Recipe Image';
    const imageUrl = `${config.server.corsOrigin}${image.image_url}`;

    // Upload to Canva
    const response = await executeCanvaMCP('upload-asset-from-url', {
      url: imageUrl,
      name: recipeName,
      user_intent: 'Upload recipe image for menu template'
    });

    const canvaAssetId = response.asset_id || response.id;

    if (!canvaAssetId) {
      throw new Error('Failed to get Canva asset ID');
    }

    // Update image record
    await pool.query(
      'UPDATE recipe_images SET canva_asset_id = ? WHERE id = ?',
      [canvaAssetId, imageId]
    );

    res.json(successResponse(
      { canva_asset_id: canvaAssetId },
      'Image uploaded to Canva successfully'
    ));
  } catch (error) {
    console.error('Canva upload error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * GET /api/recipe-images/:recipeId
 * Get all images for a recipe
 */
router.get('/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const pool = req.app.locals.pool;

    const [images] = await pool.query(
      'SELECT * FROM recipe_images WHERE recipe_id = ? ORDER BY is_default DESC, created_at DESC',
      [recipeId]
    );

    res.json(successResponse(images));
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * PUT /api/recipe-images/:id/set-default
 * Set image as default for recipe
 */
router.put('/:id/set-default', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.pool;

    // Get image to find recipe_id
    const [images] = await pool.query(
      'SELECT recipe_id FROM recipe_images WHERE id = ?',
      [id]
    );

    if (images.length === 0) {
      return res.status(404).json(errorResponse('Image not found'));
    }

    const recipeId = images[0].recipe_id;

    // Unset all defaults
    await pool.query(
      'UPDATE recipe_images SET is_default = 0 WHERE recipe_id = ?',
      [recipeId]
    );

    // Set this as default
    await pool.query(
      'UPDATE recipe_images SET is_default = 1 WHERE id = ?',
      [id]
    );

    res.json(successResponse(null, 'Default image updated successfully'));
  } catch (error) {
    console.error('Set default error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

/**
 * DELETE /api/recipe-images/:id
 * Delete an image
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.pool;

    // Get image details
    const [images] = await pool.query(
      'SELECT * FROM recipe_images WHERE id = ?',
      [id]
    );

    if (images.length === 0) {
      return res.status(404).json(errorResponse('Image not found'));
    }

    const image = images[0];

    // Delete file
    const filePath = path.join(__dirname, '..', '..', image.image_url);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Could not delete file:', error.message);
    }

    // Delete from database
    await pool.query('DELETE FROM recipe_images WHERE id = ?', [id]);

    res.json(successResponse(null, 'Image deleted successfully'));
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json(errorResponse(error.message));
  }
});

module.exports = router;
