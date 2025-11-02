# Recipe Costing Application - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Features Overview](#features-overview)
5. [Product Entry](#product-entry)
6. [Product Management](#product-management)
7. [Recipe Creation](#recipe-creation)
8. [Tips and Best Practices](#tips-and-best-practices)
9. [Troubleshooting](#troubleshooting)

## Introduction

The **Recipe Costing Application** is a comprehensive desktop tool designed to help you manage ingredient pricing from multiple vendors and calculate accurate recipe costs. The application features a modern, intuitive interface built with Material UI and provides real-time cost calculations based on your selected default vendor prices.

### Key Features

- **Multi-Vendor Pricing**: Track prices from up to three different vendors for each product
- **Default Price Selection**: Choose which vendor's price to use for calculations
- **Recipe Cost Calculation**: Automatically calculate total recipe costs based on ingredient quantities
- **Editable Data Tables**: Easily update product information and vendor prices
- **Professional Dashboard**: Clean, modern interface for efficient workflow

## Installation

### Prerequisites

Before installing the application, ensure you have:

1. **Windows 10 or later**
2. **MySQL Server** installed and running (see DATABASE_SETUP.md for detailed instructions)

### Installation Steps

1. **Install MySQL Server**
   - Download from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
   - Follow the installation wizard
   - Set a root password (remember this for later)

2. **Install the Application**
   - Download the installer (`.exe` file)
   - Run the installer
   - Follow the on-screen instructions
   - The application will be installed in `C:\Program Files\Recipe Costing App`

3. **Configure Database Connection**
   - On first launch, you may need to configure your MySQL password
   - Set the environment variable `DB_PASSWORD` to your MySQL root password
   - Restart the application

## Getting Started

### First Launch

When you first launch the application:

1. The application will automatically create the required database (`recipe_costing_db`)
2. All necessary tables will be created automatically
3. You'll be redirected to the **Product Entry** page

### Navigation

The application has three main sections accessible from the left sidebar:

- **Product Entry**: Add new products with vendor pricing
- **Product Management**: View and edit existing products
- **Recipe Creation**: Create recipes and calculate costs

## Product Entry

### Adding a New Product

The Product Entry page allows you to add new ingredients/products to your database.

**Step 1: Enter Product Information**

- **Product Name** (required): Enter the name of the ingredient (e.g., "Toor Dal", "Rice")
- **Description** (optional): Add any additional details about the product
- **Purchase Quantity** (required): Enter the quantity you purchase (e.g., 1000)
- **Purchase Unit** (required): Select the unit of measurement:
  - Grams
  - Kilograms
  - Liters
  - Milliliters
  - Pieces

**Step 2: Enter Vendor Pricing**

For each of the three vendors:

- **Vendor Name**: Enter the vendor's name (e.g., "Walmart", "Costco")
- **Vendor Price**: Enter the price for the purchase quantity

**Example:**
- Product: Rice
- Purchase Quantity: 5000 grams
- Vendor 1: Walmart - $15.99
- Vendor 2: Costco - $14.50
- Vendor 3: Local Store - $16.25

**Step 3: Select Default Vendor**

- Choose which vendor's price should be used for recipe calculations
- This can be changed later in the Product Management page

**Step 4: Submit**

- Click the **"Add Product"** button
- You'll see a success message if the product was added successfully

## Product Management

The Product Management page displays all your products in an editable table.

### Viewing Products

The table shows:

- Product name and description
- Purchase quantity and unit
- All three vendor names and prices
- Current default vendor and price (highlighted in blue)

### Editing Products

**To edit a product:**

1. Click the **Edit** icon (pencil) next to the product
2. The row becomes editable with text fields
3. Modify any of the following:
   - Product name
   - Description
   - Vendor names
   - Vendor prices
   - Default vendor selection (dropdown)
4. Click the **Save** icon (checkmark) to save changes
5. Click the **Cancel** icon (X) to discard changes

### Changing Default Vendor

You can quickly change which vendor's price is used for calculations:

1. Click the **Edit** icon for the product
2. Use the **Default** dropdown to select a different vendor (Vendor 1, 2, or 3)
3. Click **Save**
4. The new default price will be used in all recipe calculations

### Deleting Products

**To delete a product:**

1. Click the **Delete** icon (trash can) next to the product
2. Confirm the deletion in the dialog box
3. **Warning**: This will also remove the product from any recipes using it

## Recipe Creation

The Recipe Creation page allows you to create recipes and automatically calculate their costs.

### Creating a New Recipe

**Step 1: Enter Recipe Information**

- **Recipe Name** (required): Enter the name (e.g., "Dal Tadka", "Khichdi")
- **Description** (optional): Add cooking notes or serving information

**Step 2: Add Ingredients**

1. **Select Product**: Choose an ingredient from the dropdown
2. **Enter Quantity**: Specify how much you need
3. **Select Unit**: Choose grams or kilograms
4. Click the **+** button to add the ingredient

**The application will:**
- Automatically convert units if needed (kg ↔ grams)
- Calculate the cost based on the default vendor price
- Display the cost per ingredient

**Step 3: Review Total Cost**

- The table shows all added ingredients
- The total recipe cost is calculated automatically
- You can remove ingredients by clicking the delete icon

**Step 4: Save Recipe**

- Click **"Create Recipe"** to save
- The recipe will appear in the "Saved Recipes" list

### Viewing Recipe Details

**To view a saved recipe:**

1. Find the recipe in the "Saved Recipes" table
2. Click the **View** icon (eye)
3. A dialog will show:
   - Recipe name and description
   - All ingredients with quantities
   - Individual ingredient costs
   - Total recipe cost

### Cost Calculation Example

**Example Recipe: Dal (10 servings)**

| Ingredient | Quantity | Unit Price | Cost |
|-----------|----------|------------|------|
| Toor Dal | 300g | $0.00322/g | $0.97 |
| Masala | 80g | $0.0218/g | $1.74 |
| Oil | 30g | $0.0032/g | $0.10 |
| **Total** | | | **$2.81** |

The application automatically:
- Uses the default vendor price for each ingredient
- Converts units as needed
- Sums up all ingredient costs

## Tips and Best Practices

### Product Management

1. **Keep Vendor Names Consistent**: Use the same vendor names across products for easier tracking
2. **Update Prices Regularly**: Vendor prices change; update them in Product Management
3. **Use Descriptive Names**: Make product names clear and searchable
4. **Add Descriptions**: Include package sizes or quality notes in descriptions

### Recipe Creation

1. **Start with Common Recipes**: Begin with frequently made recipes
2. **Double-Check Quantities**: Ensure quantities match your actual recipe
3. **Use Consistent Units**: Stick to grams or kilograms for easier calculations
4. **Review Costs Regularly**: Recipe costs change when vendor prices are updated

### Vendor Selection

1. **Compare Prices**: Use the Product Management table to compare vendor prices
2. **Consider Quality**: The cheapest vendor isn't always the best choice
3. **Update Defaults**: Change default vendors when you find better prices
4. **Track Multiple Vendors**: Even if you don't use all three, track prices for comparison

## Troubleshooting

### Application Won't Start

**Problem**: Application closes immediately after opening

**Solution**:
- Ensure MySQL Server is running
- Check that your MySQL password is correct
- Verify the database was created (see DATABASE_SETUP.md)

### Can't Add Products

**Problem**: Error message when adding products

**Solution**:
- Ensure all required fields are filled
- Check that vendor prices are valid numbers
- Verify database connection

### Recipe Costs Seem Wrong

**Problem**: Recipe costs don't match expectations

**Solution**:
- Verify the default vendor is selected correctly
- Check that product prices are entered correctly
- Ensure quantity units match (grams vs. kilograms)
- Review the cost calculation in the recipe details dialog

### Products Not Appearing

**Problem**: Products don't show in Product Management or Recipe Creation

**Solution**:
- Refresh the page
- Check that products were saved successfully
- Verify database connection

### Database Connection Errors

**Problem**: "Can't connect to database" errors

**Solution**:
- Ensure MySQL Server is running (check Windows Services)
- Verify your MySQL password is correct
- Check that port 3306 is not blocked by firewall
- See DATABASE_SETUP.md for detailed troubleshooting

## Getting Help

If you encounter issues not covered in this guide:

1. Check the **DATABASE_SETUP.md** file for database-specific issues
2. Verify all prerequisites are installed correctly
3. Ensure you're using the latest version of the application

## Version Information

- **Application Version**: 1.0.0
- **Database**: MySQL 8.0+
- **Platform**: Windows 10/11

---

**Developed by Manus AI**
