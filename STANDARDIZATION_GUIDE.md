# Recipe Costing Application - Standardization Guide

**Date:** November 5, 2025  
**Purpose:** Maintain consistency across the entire application

---

## 1. API Response Format

### Success Response
```javascript
{
  success: true,
  data: <object | array>,
  message: "Optional success message" // Only for create/update/delete operations
}
```

### Error Response
```javascript
{
  success: false,
  error: "Error message"
}
```

### Paginated Response
```javascript
{
  success: true,
  data: <array>,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 100,
    totalPages: 5
  }
}
```

### Status Codes
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## 2. Database Naming Conventions

### Tables
- Use **snake_case**: `weekly_menus`, `recipe_images`
- Plural names for entity tables: `products`, `recipes`
- Junction tables: `recipe_ingredients`, `weekly_menu_items`

### Columns
- Use **snake_case**: `created_at`, `is_default`, `canva_asset_id`
- Boolean columns: prefix with `is_` or `has_`
- Timestamps: `created_at`, `updated_at`
- Foreign keys: `<table>_id` (e.g., `recipe_id`, `user_id`)

### Indexes
- Prefix with `idx_`: `idx_recipe_id`, `idx_is_default`
- Unique constraints: `unique_<description>`: `unique_user_week`

---

## 3. Backend Code Standards

### File Structure
```
server/
├── index.js              # Main server file
├── config.js             # Configuration module
└── routes/
    ├── products.js       # Product routes
    ├── recipes.js        # Recipe routes
    ├── recipeImages.js   # Recipe images routes
    ├── weeklyMenus.js    # Weekly menu routes
    └── canvaTemplates.js # Canva template routes
```

### Configuration Usage
```javascript
const config = require('../config');

// ✅ CORRECT - Use config
const port = config.server.port;
const uploadDir = config.upload.directory;

// ❌ WRONG - Don't hardcode
const port = 3001;
const uploadDir = './uploads';
```

### Route Structure
```javascript
const express = require('express');
const router = express.Router();
const config = require('../config');

// GET /api/resource
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    // ... logic
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error description:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Error Handling
```javascript
try {
  // ... logic
} catch (error) {
  console.error('Descriptive error message:', error);
  res.status(500).json({ success: false, error: error.message });
}
```

### Database Queries
```javascript
// Use parameterized queries
const [results] = await pool.query(
  'SELECT * FROM table WHERE id = ?',
  [id]
);

// Use transactions for multiple operations
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  // ... multiple queries
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

---

## 4. Frontend Code Standards

### File Structure
```
app/
├── product-entry/
│   ├── page.tsx
│   └── ProductEntryContent.tsx
├── recipe-creation/
│   ├── page.tsx
│   └── RecipeCreationContent.tsx
└── weekly-menu/
    ├── page.tsx
    ├── WeeklyMenuBuilderContent.tsx
    ├── RecipeImageManagementContent.tsx
    └── TemplateLibraryContent.tsx
```

### Component Structure
```typescript
'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Button, Card, ... } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';

interface DataType {
  // Define interface
}

export default function ComponentName() {
  // State declarations
  const [data, setData] = useState<DataType[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Event handlers
  const handleAction = async () => {
    // ...
  };

  // Render
  return (
    <DashboardLayout>
      {/* Content */}
    </DashboardLayout>
  );
}
```

### API Calls
```typescript
// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fetch data
const fetchData = async () => {
  try {
    const response = await fetch(`${API_URL}/api/resource`);
    const result = await response.json();
    
    if (result.success) {
      setData(result.data);
    } else {
      showSnackbar(result.error, 'error');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    showSnackbar('Failed to fetch data', 'error');
  }
};

// Post data
const saveData = async () => {
  try {
    const response = await fetch(`${API_URL}/api/resource`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (result.success) {
      showSnackbar(result.message || 'Saved successfully', 'success');
    } else {
      showSnackbar(result.error, 'error');
    }
  } catch (error) {
    console.error('Error saving data:', error);
    showSnackbar('Failed to save data', 'error');
  }
};
```

### Snackbar Pattern
```typescript
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' as 'success' | 'error',
});

const showSnackbar = (message: string, severity: 'success' | 'error') => {
  setSnackbar({ open: true, message, severity });
};

const handleCloseSnackbar = () => {
  setSnackbar({ ...snackbar, open: false });
};

// In JSX
<Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
    {snackbar.message}
  </Alert>
</Snackbar>
```

---

## 5. UI/UX Standards

### Layout Structure
```typescript
<DashboardLayout>
  {/* Fixed Navigation Buttons at Top */}
  <Box sx={{ 
    position: 'sticky', 
    top: 0, 
    zIndex: 10, 
    bgcolor: 'background.default', 
    py: 2 
  }}>
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
      <Button startIcon={<ArrowBackIcon />}>Back</Button>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained" startIcon={<SaveIcon />}>Save</Button>
      </Box>
    </Box>
  </Box>

  {/* Main Content */}
  <Box sx={{ mt: 3 }}>
    {/* Content here */}
  </Box>
</DashboardLayout>
```

### Spacing Standards
- **Container padding**: `p: 3` (24px)
- **Section spacing**: `mb: 3` (24px)
- **Card spacing**: `mb: 2` (16px)
- **Element spacing**: `gap: 2` (16px)
- **Small spacing**: `gap: 1` (8px)

### Card Pattern
```typescript
<Card sx={{ mb: 3 }}>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Section Title
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {/* Content */}
  </CardContent>
</Card>
```

### Form Pattern (Inline with Table)
```typescript
{/* Add Form */}
<Card sx={{ mb: 2 }}>
  <CardContent>
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 12, sm: 3 }}>
        <TextField fullWidth label="Field 1" />
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <TextField fullWidth label="Field 2" />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} fullWidth>
          Add
        </Button>
      </Grid>
    </Grid>
  </CardContent>
</Card>

{/* Display Table */}
<Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Added Items
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {/* Table or list */}
  </CardContent>
</Card>
```

### Button Standards
- **Primary action**: `variant="contained"` with icon
- **Secondary action**: `variant="outlined"`
- **Destructive action**: `color="error"`
- **Always use icons** for better UX

### Color Scheme
- **Primary**: Default MUI blue
- **Success**: Green (`success`)
- **Error**: Red (`error`)
- **Warning**: Orange (`warning`)
- **Info**: Blue (`info`)

---

## 6. TypeScript Standards

### Interface Naming
```typescript
// Use PascalCase for interfaces
interface ProductData {
  id: number;
  name: string;
  description: string;
}

interface VendorData {
  vendor_name: string;
  price: string;
  is_default: boolean;
}
```

### Type Safety
```typescript
// Always type state
const [products, setProducts] = useState<ProductData[]>([]);

// Type function parameters
const handleSave = async (data: ProductData): Promise<void> => {
  // ...
};
```

---

## 7. Environment Variables

### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Mysql
DB_NAME=recipe_costing_db

# Server
PORT=3001
NODE_ENV=development

# Features
CANVA_ENABLED=true
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Usage
```typescript
// Frontend
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Backend
const port = process.env.PORT || 3001;
```

---

## 8. Git Commit Standards

### Format
```
<type>: <subject>

<body>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Example
```
feat: Add weekly menu creation feature

- Created database schema with 6 tables
- Implemented API endpoints for menu management
- Added Canva integration for template generation
```

---

## 9. Documentation Standards

### Code Comments
```javascript
/**
 * Function description
 * 
 * @param {type} paramName - Parameter description
 * @returns {type} Return description
 */
function functionName(paramName) {
  // Implementation
}
```

### API Documentation
```javascript
/**
 * POST /api/resource
 * Description of what this endpoint does
 * 
 * Request Body:
 * {
 *   field1: string,
 *   field2: number
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {...}
 * }
 */
```

---

## 10. Testing Standards

### Manual Testing Checklist
- [ ] API endpoint returns correct response format
- [ ] Error handling works correctly
- [ ] Database transactions commit/rollback properly
- [ ] UI displays data correctly
- [ ] Form validation works
- [ ] Snackbar messages appear
- [ ] Navigation works
- [ ] Responsive design works on mobile

---

This guide should be followed for all new code and used to refactor existing code for consistency.
