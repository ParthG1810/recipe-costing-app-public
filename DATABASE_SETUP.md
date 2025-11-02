# Database Setup Guide for Recipe Costing Application

## Overview

This document provides comprehensive instructions for setting up the MySQL database for the Recipe Costing Application. The application uses MySQL as its primary database to store products, recipes, and recipe ingredients.

## Prerequisites

### Windows Installation

**Download and Install MySQL Server:**

1. Visit the official MySQL website: [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Download **MySQL Installer for Windows**
3. Run the installer and select "Custom" installation
4. Select the following components:
   - MySQL Server (latest version)
   - MySQL Workbench (optional, for GUI management)
5. Configure MySQL Server:
   - **Config Type:** Development Computer
   - **Port:** 3306 (default)
   - **Root Password:** Set a strong password (you'll need this later)
   - **Windows Service:** Yes, start at system startup

### Verify Installation

Open Command Prompt and run:

```bash
mysql --version
```

This should display the MySQL version, confirming successful installation.

## Database Configuration

### Connection Settings

The application uses the following default connection settings (configurable via environment variables):

| Parameter | Default Value | Environment Variable |
|-----------|---------------|---------------------|
| Host | localhost | DB_HOST |
| User | root | DB_USER |
| Password | (empty) | DB_PASSWORD |
| Database | recipe_costing_db | DB_NAME |
| Port | 3306 | (default) |

### Setting Environment Variables (Windows)

1. Open **System Properties** → **Advanced** → **Environment Variables**
2. Under "User variables", click **New**
3. Add the following variables:
   - Variable name: `DB_PASSWORD`
   - Variable value: Your MySQL root password

## Database Schema

### Automatic Schema Creation

The application **automatically creates** the database and tables on first run. The Express server (`server/index.js`) includes an initialization function that:

1. Creates the database if it doesn't exist
2. Creates all required tables with proper relationships
3. Sets up foreign key constraints

### Manual Database Creation (Optional)

If you prefer to create the database manually, follow these steps:

**Step 1: Connect to MySQL**

```bash
mysql -u root -p
```

Enter your root password when prompted.

**Step 2: Create Database**

```sql
CREATE DATABASE IF NOT EXISTS recipe_costing_db;
USE recipe_costing_db;
```

**Step 3: Create Products Table**

```sql
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
);
```

**Field Descriptions:**

- `id`: Unique identifier for each product (auto-incremented)
- `name`: Product name (required)
- `description`: Product description (optional)
- `purchase_quantity`: Quantity purchased (required, decimal for precision)
- `purchase_unit`: Unit of measurement (required, e.g., "grams", "kg")
- `vendor1_name`, `vendor2_name`, `vendor3_name`: Names of three vendors
- `vendor1_price`, `vendor2_price`, `vendor3_price`: Prices from each vendor
- `default_vendor_index`: Index (0, 1, or 2) indicating which vendor is default
- `created_at`: Timestamp of record creation
- `updated_at`: Timestamp of last update (auto-updated)

**Step 4: Create Recipes Table**

```sql
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Field Descriptions:**

- `id`: Unique identifier for each recipe (auto-incremented)
- `name`: Recipe name (required)
- `description`: Recipe description (optional)
- `created_at`: Timestamp of record creation
- `updated_at`: Timestamp of last update (auto-updated)

**Step 5: Create Recipe Ingredients Table**

```sql
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

**Field Descriptions:**

- `id`: Unique identifier for each recipe ingredient entry
- `recipe_id`: Foreign key referencing recipes table
- `product_id`: Foreign key referencing products table
- `quantity`: Quantity of ingredient needed (decimal for precision)
- `unit`: Unit of measurement (e.g., "grams", "kg")

**Foreign Key Constraints:**

- `ON DELETE CASCADE`: When a recipe or product is deleted, related recipe_ingredients entries are automatically deleted

## Troubleshooting

### Common Issues

**Issue 1: "Access denied for user 'root'@'localhost'"**

**Solution:** Verify your password is correct. Update the `DB_PASSWORD` environment variable.

**Issue 2: "Can't connect to MySQL server on 'localhost'"**

**Solution:** 
- Ensure MySQL service is running
- Open Services (Windows + R → `services.msc`)
- Find "MySQL" service and ensure it's running
- If not, right-click and select "Start"

**Issue 3: "Unknown database 'recipe_costing_db'"**

**Solution:** The application should create this automatically. If it doesn't, create it manually using the steps above.

### Verifying Database Setup

To verify the database is set up correctly:

```sql
USE recipe_costing_db;
SHOW TABLES;
```

You should see three tables:
- products
- recipes
- recipe_ingredients

Check table structure:

```sql
DESCRIBE products;
DESCRIBE recipes;
DESCRIBE recipe_ingredients;
```

## Backup and Restore

### Creating a Backup

```bash
mysqldump -u root -p recipe_costing_db > backup.sql
```

### Restoring from Backup

```bash
mysql -u root -p recipe_costing_db < backup.sql
```

## Security Recommendations

1. **Never use empty passwords in production**
2. **Create a dedicated database user** instead of using root:

```sql
CREATE USER 'recipe_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON recipe_costing_db.* TO 'recipe_app'@'localhost';
FLUSH PRIVILEGES;
```

3. **Update environment variables** to use the new user:
   - `DB_USER=recipe_app`
   - `DB_PASSWORD=strong_password`

## Support

For additional help, consult:
- [MySQL Official Documentation](https://dev.mysql.com/doc/)
- [MySQL Workbench User Guide](https://dev.mysql.com/doc/workbench/en/)
