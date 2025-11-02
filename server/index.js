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
  password: process.env.DB_PASSWORD || '',
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

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        purchase_quantity DECIMAL(10, 2) NOT NULL,
        purchase_unit VARCHAR(50) NOT NULL,
        vendor1_name VARCHAR(255),
        vendor1_price DECIMAL(10, 2),
        vendor2_name VARCHAR(255),
        vendor2_price DECIMAL(10, 2),
        vendor3_name VARCHAR(255),
        vendor3_price DECIMAL(10, 2),
        default_vendor_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipe_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    process.exit(1);
  }
}

// API Routes

// Products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = req.body;
    const [result] = await pool.query(
      `INSERT INTO products (name, description, purchase_quantity, purchase_unit, 
       vendor1_name, vendor1_price, vendor2_name, vendor2_price, 
       vendor3_name, vendor3_price, default_vendor_index) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.name, product.description, product.purchase_quantity, product.purchase_unit,
        product.vendor1_name, product.vendor1_price, product.vendor2_name, product.vendor2_price,
        product.vendor3_name, product.vendor3_price, product.default_vendor_index
      ]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = req.body;
    await pool.query(
      `UPDATE products SET name = ?, description = ?, purchase_quantity = ?, purchase_unit = ?,
       vendor1_name = ?, vendor1_price = ?, vendor2_name = ?, vendor2_price = ?,
       vendor3_name = ?, vendor3_price = ?, default_vendor_index = ?
       WHERE id = ?`,
      [
        product.name, product.description, product.purchase_quantity, product.purchase_unit,
        product.vendor1_name, product.vendor1_price, product.vendor2_name, product.vendor2_price,
        product.vendor3_name, product.vendor3_price, product.default_vendor_index, req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recipes ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const [recipe] = await pool.query('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    const [ingredients] = await pool.query(
      `SELECT ri.*, p.name as product_name, p.vendor1_price, p.vendor2_price, p.vendor3_price, 
       p.default_vendor_index, p.purchase_quantity, p.purchase_unit
       FROM recipe_ingredients ri
       JOIN products p ON ri.product_id = p.id
       WHERE ri.recipe_id = ?`,
      [req.params.id]
    );
    res.json({ success: true, data: { recipe: recipe[0], ingredients } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const recipe = req.body;
    const [result] = await pool.query(
      'INSERT INTO recipes (name, description) VALUES (?, ?)',
      [recipe.name, recipe.description]
    );
    
    const recipeId = result.insertId;
    
    // Add ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      for (const ingredient of recipe.ingredients) {
        await pool.query(
          'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES (?, ?, ?, ?)',
          [recipeId, ingredient.product_id, ingredient.quantity, ingredient.unit]
        );
      }
    }
    
    res.json({ success: true, id: recipeId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = req.body;
    await pool.query(
      'UPDATE recipes SET name = ?, description = ? WHERE id = ?',
      [recipe.name, recipe.description, req.params.id]
    );
    
    // Delete existing ingredients
    await pool.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [req.params.id]);
    
    // Add new ingredients
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      for (const ingredient of recipe.ingredients) {
        await pool.query(
          'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES (?, ?, ?, ?)',
          [req.params.id, ingredient.product_id, ingredient.quantity, ingredient.unit]
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM recipes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
