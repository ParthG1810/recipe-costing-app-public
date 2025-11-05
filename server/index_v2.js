const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mysql',
  database: process.env.DB_NAME || 'recipe_costing_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Initialize database
async function initDatabase() {
  try {
    // Create connection pool without database first
    const tempPool = mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create database if it doesn't exist
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempPool.end();

    // Create pool with database
    pool = mysql.createPool(dbConfig);

    console.log('✓ Database connection pool created');
    console.log('✓ Run database_schema_v2.sql to create tables');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    process.exit(1);
  }
}

// API Routes

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Recipe Costing API V2 is running' });
});

// ============================================
// PRODUCTS API
// ============================================

// Get all products with their vendors
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    
    // Get vendors for each product
    for (let product of products) {
      const [vendors] = await pool.query(
        'SELECT * FROM product_vendors WHERE product_id = ? ORDER BY is_default DESC, id ASC',
        [product.id]
      );
      product.vendors = vendors;
    }
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single product with vendors
app.get('/api/products/:id', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = products[0];
    const [vendors] = await pool.query(
      'SELECT * FROM product_vendors WHERE product_id = ? ORDER BY is_default DESC, id ASC',
      [product.id]
    );
    product.vendors = vendors;
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product with vendors
app.post('/api/products', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { name, description, vendors } = req.body;
    
    // Insert product
    const [result] = await connection.query(
      'INSERT INTO products (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    const productId = result.insertId;
    
    // Insert vendors
    if (vendors && vendors.length > 0) {
      for (let i = 0; i < vendors.length; i++) {
        const vendor = vendors[i];
        await connection.query(
          `INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            productId,
            vendor.vendor_name,
            vendor.price,
            vendor.weight,
            vendor.package_size || 'g',
            vendor.is_default || false
          ]
        );
      }
    }
    
    await connection.commit();
    res.status(201).json({ success: true, id: productId, message: 'Product created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Update product with vendors
app.put('/api/products/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { name, description, vendors } = req.body;
    
    // Update product
    await connection.query(
      'UPDATE products SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    
    // Delete existing vendors
    await connection.query('DELETE FROM product_vendors WHERE product_id = ?', [req.params.id]);
    
    // Insert new vendors
    if (vendors && vendors.length > 0) {
      for (let vendor of vendors) {
        await connection.query(
          `INSERT INTO product_vendors (product_id, vendor_name, price, weight, package_size, is_default) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            req.params.id,
            vendor.vendor_name,
            vendor.price,
            vendor.weight,
            vendor.package_size || 'g',
            vendor.is_default || false
          ]
        );
      }
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Delete product (vendors will be deleted automatically due to CASCADE)
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RECIPES API
// ============================================

// Get all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const [recipes] = await pool.query('SELECT * FROM recipes ORDER BY created_at DESC');
    
    // Add ingredient count to each recipe
    for (let recipe of recipes) {
      const [ingredients] = await pool.query(
        'SELECT COUNT(*) as count FROM recipe_ingredients WHERE recipe_id = ?',
        [recipe.id]
      );
      recipe.ingredients = [];
      recipe.ingredients.length = ingredients[0].count;
    }
    
    res.json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single recipe with ingredients
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const [recipes] = await pool.query('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    if (recipes.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const recipe = recipes[0];
    const [ingredients] = await pool.query(
      `SELECT ri.*, p.name as product_name, p.description as product_description
       FROM recipe_ingredients ri
       JOIN products p ON ri.product_id = p.id
       WHERE ri.recipe_id = ?`,
      [recipe.id]
    );
    
    // Get vendors for each ingredient
    for (let ingredient of ingredients) {
      const [vendors] = await pool.query(
        'SELECT * FROM product_vendors WHERE product_id = ? ORDER BY is_default DESC, id ASC',
        [ingredient.product_id]
      );
      ingredient.vendors = vendors;
    }
    
    recipe.ingredients = ingredients;
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create recipe
app.post('/api/recipes', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { name, description, ingredients } = req.body;
    
    // Insert recipe
    const [result] = await connection.query(
      'INSERT INTO recipes (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    const recipeId = result.insertId;
    
    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      for (let ingredient of ingredients) {
        await connection.query(
          'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES (?, ?, ?, ?)',
          [recipeId, ingredient.product_id, ingredient.quantity, ingredient.unit]
        );
      }
    }
    
    await connection.commit();
    res.status(201).json({ success: true, id: recipeId, message: 'Recipe created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Update recipe
app.put('/api/recipes/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { name, description, ingredients } = req.body;
    
    // Update recipe
    await connection.query(
      'UPDATE recipes SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    
    // Delete existing ingredients
    await connection.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [req.params.id]);
    
    // Insert new ingredients
    if (ingredients && ingredients.length > 0) {
      for (let ingredient of ingredients) {
        await connection.query(
          'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES (?, ?, ?, ?)',
          [req.params.id, ingredient.product_id, ingredient.quantity, ingredient.unit]
        );
      }
    }
    
    await connection.commit();
    res.json({ success: true, message: 'Recipe updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Delete recipe
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM recipes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
});
