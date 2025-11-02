# Recipe Costing Application

A professional desktop application for managing ingredient pricing from multiple vendors and calculating recipe costs automatically.

## Features

- ✅ **Multi-Vendor Pricing**: Track prices from up to 3 vendors per product
- ✅ **Default Price Selection**: Choose which vendor price to use for calculations
- ✅ **Recipe Cost Calculator**: Automatically calculate total recipe costs
- ✅ **Editable Data Tables**: Update product information and prices easily
- ✅ **Material UI Dashboard**: Modern, professional interface
- ✅ **MySQL Database**: Reliable data storage with automatic schema creation
- ✅ **Windows Desktop App**: Runs as a native Windows application using Electron

## Technology Stack

- **Frontend**: React 19, Next.js 16, Material UI 7
- **Backend**: Express.js, MySQL 2
- **Desktop**: Electron 39
- **Styling**: Material UI with custom theme

## Prerequisites

- **Node.js** 20+ (npm comes with Node.js)
- **MySQL Server** 8.0+
- **Windows** 10 or later

## Installation

### 1. Install MySQL Server

Download and install MySQL from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)

Set a root password during installation and remember it.

### 2. Clone or Extract the Application

```bash
cd recipe-costing-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Database

Set your MySQL password as an environment variable (Windows):

```bash
set DB_PASSWORD=your_mysql_password
```

Or create a `.env` file in the project root:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=recipe_costing_db
```

## Running the Application

### Development Mode

**Option 1: Run as Web Application**

```bash
# Terminal 1: Start the Express server
npm run dev:server

# Terminal 2: Start the Next.js frontend
npm run dev:next
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

**Option 2: Run as Electron Desktop App**

```bash
npm run electron:dev
```

This will start both the server and frontend, then launch the Electron window.

### Production Build

Build the Next.js application:

```bash
npm run build
```

Package as Windows executable:

```bash
npm run package
```

The installer will be created in the `dist` folder.

## Project Structure

```
recipe-costing-app/
├── app/                          # Next.js app directory
│   ├── components/               # React components
│   │   └── DashboardLayout.tsx   # Main layout with sidebar
│   ├── product-entry/            # Product entry page
│   ├── product-management/       # Product management page
│   ├── recipe-creation/          # Recipe creation page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects)
│   └── theme.ts                  # Material UI theme
├── server/                       # Express backend
│   └── index.js                  # API routes and database
├── electron/                     # Electron main process
│   └── main.js                   # Electron configuration
├── public/                       # Static assets
├── DATABASE_SETUP.md             # Database setup guide
├── USER_GUIDE.md                 # User documentation
└── package.json                  # Dependencies and scripts
```

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Recipes

- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe details with ingredients
- `POST /api/recipes` - Create a new recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe

## Database Schema

### Products Table

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(255) | Product name |
| description | TEXT | Product description |
| purchase_quantity | DECIMAL(10,2) | Quantity purchased |
| purchase_unit | VARCHAR(50) | Unit of measurement |
| vendor1_name | VARCHAR(255) | First vendor name |
| vendor1_price | DECIMAL(10,2) | First vendor price |
| vendor2_name | VARCHAR(255) | Second vendor name |
| vendor2_price | DECIMAL(10,2) | Second vendor price |
| vendor3_name | VARCHAR(255) | Third vendor name |
| vendor3_price | DECIMAL(10,2) | Third vendor price |
| default_vendor_index | INT | Default vendor (0, 1, or 2) |

### Recipes Table

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(255) | Recipe name |
| description | TEXT | Recipe description |

### Recipe Ingredients Table

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| recipe_id | INT | Foreign key to recipes |
| product_id | INT | Foreign key to products |
| quantity | DECIMAL(10,2) | Ingredient quantity |
| unit | VARCHAR(50) | Unit of measurement |

## Usage

### 1. Product Entry

Add new products with vendor pricing:

1. Navigate to "Product Entry" from the sidebar
2. Enter product name, description, and purchase details
3. Add prices from up to 3 vendors
4. Select which vendor's price to use as default
5. Click "Add Product"

### 2. Product Management

View and edit existing products:

1. Navigate to "Product Management"
2. Click the edit icon to modify product details
3. Update vendor prices or change the default vendor
4. Click save to apply changes

### 3. Recipe Creation

Create recipes and calculate costs:

1. Navigate to "Recipe Creation"
2. Enter recipe name and description
3. Add ingredients by selecting products and entering quantities
4. View the automatically calculated total cost
5. Click "Create Recipe" to save

## Documentation

- **USER_GUIDE.md**: Comprehensive user documentation
- **DATABASE_SETUP.md**: Detailed database setup instructions

## Troubleshooting

### Database Connection Issues

- Ensure MySQL Server is running
- Verify your password is correct
- Check that port 3306 is not blocked

### Application Won't Start

- Check that all dependencies are installed (`npm install`)
- Verify MySQL is running
- Check the console for error messages

## Building for Production

To create a Windows installer:

```bash
# Build the Next.js app
npm run build

# Create Windows installer
npm run package
```

The installer will be in the `dist` folder.

## License

MIT

## Author

Developed by **Manus AI**

## Version

1.0.0
