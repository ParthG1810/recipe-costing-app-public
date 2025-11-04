require('dotenv').config();
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
        vendor1_name VARCHAR(255),
        vendor1_price DECIMAL(10, 2),
        vendor1_package_size VARCHAR(10) DEFAULT 'g',
        vendor2_name VARCHAR(255),
        vendor2_price DECIMAL(10, 2),
        vendor2_package_size VARCHAR(10) DEFAULT 'g',
        vendor3_name VARCHAR(255),
        vendor3_price DECIMAL(10, 2),
        vendor3_package_size VARCHAR(10) DEFAULT 'g',
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

    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    process.exit(1);
  }
}

// API Routes

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Recipe Costing API is running' });
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const {
      name,
      description,
      vendor1_name,
      vendor1_price,
      vendor1_package_size,
      vendor2_name,
      vendor2_price,
      vendor2_package_size,
      vendor3_name,
      vendor3_price,
      vendor3_package_size,
      default_vendor_index
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO products (
        name, description,
        vendor1_name, vendor1_price, vendor1_package_size,
        vendor2_name, vendor2_price, vendor2_package_size,
        vendor3_name, vendor3_price, vendor3_package_size,
        default_vendor_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description,
        vendor1_name, vendor1_price, vendor1_package_size || 'g',
        vendor2_name, vendor2_price, vendor2_package_size || 'g',
        vendor3_name, vendor3_price, vendor3_package_size || 'g',
        default_vendor_index || 0
      ]
    );

    res.status(201).json({ success: true, id: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      vendor1_name,
      vendor1_price,
      vendor1_package_size,
      vendor2_name,
      vendor2_price,
      vendor2_package_size,
      vendor3_name,
      vendor3_price,
      vendor3_package_size,
      default_vendor_index
    } = req.body;

    await pool.query(
      `UPDATE products SET
        name = ?, description = ?,
        vendor1_name = ?, vendor1_price = ?, vendor1_package_size = ?,
        vendor2_name = ?, vendor2_price = ?, vendor2_package_size = ?,
        vendor3_name = ?, vendor3_price = ?, vendor3_package_size = ?,
        default_vendor_index = ?
      WHERE id = ?`,
      [
        name, description,
        vendor1_name, vendor1_price, vendor1_package_size || 'g',
        vendor2_name, vendor2_price, vendor2_package_size || 'g',
        vendor3_name, vendor3_price, vendor3_package_size || 'g',
        default_vendor_index,
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recipes ORDER BY created_at DESC');
    res.json(rows);
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

    const [ingredients] = await pool.query(
      `SELECT ri.*, p.name as product_name
       FROM recipe_ingredients ri
       JOIN products p ON ri.product_id = p.id
       WHERE ri.recipe_id = ?`,
      [req.params.id]
    );

    res.json({ ...recipes[0], ingredients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create recipe
app.post('/api/recipes', async (req, res) => {
  try {
    const { name, description, ingredients } = req.body;

    const [result] = await pool.query(
      'INSERT INTO recipes (name, description) VALUES (?, ?)',
      [name, description]
    );

    const recipeId = result.insertId;

    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        await pool.query(
          'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES (?, ?, ?, ?)',
          [recipeId, ingredient.product_id, ingredient.quantity, ingredient.unit]
        );
      }
    }

    res.status(201).json({ id: recipeId, message: 'Recipe created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update recipe
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { name, description, ingredients } = req.body;

    await pool.query(
      'UPDATE recipes SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );

    // Delete existing ingredients
    await pool.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [req.params.id]);

    // Insert new ingredients
    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        await pool.query(
          'INSERT INTO recipe_ingredients (recipe_id, product_id, quantity, unit) VALUES (?, ?, ?, ?)',
          [req.params.id, ingredient.product_id, ingredient.quantity, ingredient.unit]
        );
      }
    }

    res.json({ message: 'Recipe updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete recipe
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM recipes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
