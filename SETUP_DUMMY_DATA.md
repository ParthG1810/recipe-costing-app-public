# Setup Dummy Data - Quick Start Guide

This guide will help you populate your local database with all the dummy data for testing the Weekly Menu Creation feature.

---

## 📦 What's Included

- **27 Recipes** - Complete tiffin menu items
- **6 Recipe Images** - High-quality food photography (1.4 MB)
- **1 Weekly Menu** - "Surti Fusion Weekly Menu" with 30 items
- **1 Canva Template** - "Weekly Menu Delight" (modern style)

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Load SQL Data

```bash
# Navigate to your project directory
cd recipe-costing-app

# Import the dummy data
mysql -u root -pMysql recipe_costing_db < database/dummy_data.sql
```

### Step 2: Extract Images

```bash
# Extract recipe images to the uploads folder
unzip database/recipe-images.zip -d .

# Verify images are extracted
ls -la uploads/recipe-images/
```

### Step 3: Restart Backend Server

```bash
# Stop the current server (if running)
# Then start it again
node server/index.js
```

### Step 4: Verify Data

Open your browser and navigate to:
- http://localhost:3000/weekly-menu - Should show 27 recipes
- http://localhost:3000/weekly-menu/builder - Should show "Surti Fusion Weekly Menu"
- http://localhost:3000/weekly-menu/templates - Should show "Weekly Menu Delight"

---

## 📋 Detailed Instructions

### Prerequisites

- MySQL server running
- Database `recipe_costing_db` created
- Schema tables created (run `database/weekly_menu_schema.sql` if not done)
- Backend server configured with correct credentials

### Step-by-Step Setup

#### 1. Verify Database Schema

First, ensure all tables exist:

```bash
mysql -u root -pMysql recipe_costing_db -e "SHOW TABLES;"
```

You should see:
- recipes
- recipe_images
- weekly_menus
- weekly_menu_items
- canva_templates
- (and other existing tables)

If any tables are missing, run:

```bash
mysql -u root -pMysql recipe_costing_db < database/weekly_menu_schema.sql
```

#### 2. Clear Existing Data (Optional)

If you want to start fresh:

```bash
mysql -u root -pMysql recipe_costing_db << 'EOF'
DELETE FROM weekly_menu_items;
DELETE FROM weekly_menus;
DELETE FROM canva_templates;
DELETE FROM recipe_images;
DELETE FROM recipes WHERE id > 0;
EOF
```

#### 3. Import Dummy Data

```bash
mysql -u root -pMysql recipe_costing_db < database/dummy_data.sql
```

This will insert:
- 27 recipes
- 6 recipe images
- 1 weekly menu
- 30 menu items
- 1 Canva template

#### 4. Extract Recipe Images

```bash
# From the project root directory
unzip database/recipe-images.zip -d .
```

This creates:
- `uploads/recipe-images/paneer-butter-masala.jpg`
- `uploads/recipe-images/chole-masala.jpg`
- `uploads/recipe-images/palak-paneer.jpg`
- `uploads/recipe-images/dal-tadka.webp`
- `uploads/recipe-images/jeera-rice.jpg`
- `uploads/recipe-images/veg-pulao.jpg`

#### 5. Verify Image Paths

Make sure the `uploads` directory is accessible to your backend server:

```bash
ls -la uploads/recipe-images/
```

You should see 6 image files totaling ~1.4 MB.

#### 6. Restart Services

```bash
# Stop backend server (Ctrl+C if running in terminal)
# Or kill the process:
# pkill -f "node server/index.js"

# Start backend server
node server/index.js

# In another terminal, start frontend (if not running)
npm run dev
```

#### 7. Verify Data in Application

Open your browser and test each page:

**Recipe Images** (`/weekly-menu`):
- [ ] Can see 27 recipes in the left panel
- [ ] 6 recipes have photo icons (Paneer Butter Masala, Chole Masala, Palak Paneer, Dal Tadka, Jeera Rice, Veg Pulao)
- [ ] Clicking on a recipe with images shows the gallery
- [ ] Images load correctly

**Menu Builder** (`/weekly-menu/builder`):
- [ ] "Surti Fusion Weekly Menu" appears in the list
- [ ] Can see 6 day cards (Monday-Saturday)
- [ ] Each day has 5 items
- [ ] Total of 30 items across the week
- [ ] Item names are visible

**Templates** (`/weekly-menu/templates`):
- [ ] "Weekly Menu Delight" appears in the library
- [ ] Template is marked as default (star icon)
- [ ] Style shows as "modern"
- [ ] Can preview the template

**Export & Share** (`/weekly-menu/finalize`):
- [ ] "Surti Fusion Weekly Menu" is available
- [ ] Canva design ID is linked
- [ ] Export options are available
- [ ] Can generate share links

---

## 🔍 Troubleshooting

### Images Not Loading

**Problem:** Recipe images show broken image icons

**Solution:**
1. Verify images are in the correct location:
   ```bash
   ls -la uploads/recipe-images/
   ```

2. Check file permissions:
   ```bash
   chmod 644 uploads/recipe-images/*
   ```

3. Verify backend can access the uploads folder:
   ```bash
   curl http://localhost:3001/uploads/recipe-images/paneer-butter-masala.jpg
   ```

### No Recipes Showing

**Problem:** Recipe list is empty

**Solution:**
1. Check if data was imported:
   ```bash
   mysql -u root -pMysql recipe_costing_db -e "SELECT COUNT(*) FROM recipes;"
   ```
   Should return 27.

2. If count is 0, reimport:
   ```bash
   mysql -u root -pMysql recipe_costing_db < database/dummy_data.sql
   ```

### Menu Items Not Showing

**Problem:** Menu builder shows empty days

**Solution:**
1. Check menu items:
   ```bash
   mysql -u root -pMysql recipe_costing_db -e "SELECT COUNT(*) FROM weekly_menu_items;"
   ```
   Should return 30.

2. Check if menu exists:
   ```bash
   mysql -u root -pMysql recipe_costing_db -e "SELECT * FROM weekly_menus;"
   ```

3. Verify backend is converting day numbers correctly (check server logs)

### Template Not Showing

**Problem:** Templates page is empty

**Solution:**
1. Check templates:
   ```bash
   mysql -u root -pMysql recipe_costing_db -e "SELECT * FROM canva_templates;"
   ```

2. Verify Canva design ID is present

### Database Connection Error

**Problem:** Backend can't connect to database

**Solution:**
1. Check `.env` file has correct credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=Mysql
   DB_NAME=recipe_costing_db
   ```

2. Test MySQL connection:
   ```bash
   mysql -u root -pMysql -e "SELECT 1;"
   ```

---

## 📊 Verify Data Counts

Run this query to verify all data loaded correctly:

```bash
mysql -u root -pMysql recipe_costing_db << 'EOF'
SELECT 'Recipes' as Table_Name, COUNT(*) as Count FROM recipes
UNION ALL
SELECT 'Recipe Images', COUNT(*) FROM recipe_images
UNION ALL
SELECT 'Weekly Menus', COUNT(*) FROM weekly_menus
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM weekly_menu_items
UNION ALL
SELECT 'Canva Templates', COUNT(*) FROM canva_templates;
EOF
```

Expected output:
```
+-----------------+-------+
| Table_Name      | Count |
+-----------------+-------+
| Recipes         |    27 |
| Recipe Images   |     6 |
| Weekly Menus    |     1 |
| Menu Items      |    30 |
| Canva Templates |     1 |
+-----------------+-------+
```

---

## 🎯 Testing Checklist

After setup, verify these features work:

### Recipe Images Page
- [ ] View all 27 recipes
- [ ] See 6 recipes with images
- [ ] Click on "Paneer Butter Masala" and see the image
- [ ] Image displays correctly (not broken)
- [ ] Can see image details (size, dimensions)

### Menu Builder Page
- [ ] See "Surti Fusion Weekly Menu" in the list
- [ ] View all 6 days (Monday-Saturday)
- [ ] Each day shows 5 items
- [ ] Item names are correct (Paneer Butter Masala, Moong Dal, etc.)
- [ ] Can add new items
- [ ] Can remove items

### Templates Page
- [ ] See "Weekly Menu Delight" template
- [ ] Template is marked as default
- [ ] Style shows as "modern"
- [ ] Can preview the template
- [ ] Can generate new AI templates

### Export & Share Page
- [ ] "Surti Fusion Weekly Menu" is available
- [ ] Canva design is linked
- [ ] Can select export format
- [ ] Can generate share links

---

## 🔄 Reset Data

To reset all dummy data and start over:

```bash
# Clear all data
mysql -u root -pMysql recipe_costing_db << 'EOF'
DELETE FROM weekly_menu_items;
DELETE FROM weekly_menus;
DELETE FROM canva_templates;
DELETE FROM recipe_images;
DELETE FROM recipes WHERE id > 0;
EOF

# Reimport
mysql -u root -pMysql recipe_costing_db < database/dummy_data.sql

# Re-extract images
rm -rf uploads/recipe-images/
unzip database/recipe-images.zip -d .
```

---

## 📝 Notes

### Image Paths

The SQL dump uses relative paths like `/uploads/recipe-images/paneer-butter-masala.jpg`. Make sure your backend serves static files from the `uploads` directory.

In `server/index.js`, you should have:

```javascript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### Canva Design ID

The template includes a Canva design ID (`DAG32D4N-fo`). This is a real design created during the demo, but it's associated with the demo Canva account. You can:

1. **Use it as-is** - The design is public and can be viewed
2. **Generate new templates** - Use the "Generate with AI" feature to create your own
3. **Update the ID** - If you create a design in your Canva account, update the database

### User ID

All data uses `user_id = 1`. If you implement authentication later, you may need to update this field.

---

## 🎉 Success!

Once all checks pass, you have successfully loaded the dummy data! You can now:

1. **Explore the feature** - Navigate through all 4 pages
2. **Test the workflow** - Create new menus, generate templates
3. **Generate AI templates** - Try different styles
4. **Export menus** - Test PNG, PDF, JPG exports
5. **Share menus** - Generate and copy share links

---

## 📚 Related Documentation

- **DUMMY_DATA_SUMMARY.md** - Complete overview of all dummy data
- **USER_GUIDE_WEEKLY_MENU.md** - User guide for the feature
- **API_DOCUMENTATION.md** - API endpoint documentation
- **DEMO_WALKTHROUGH.md** - Step-by-step demo guide

---

## 💡 Tips

- **Start with Recipe Images** - Upload more images to see the full gallery experience
- **Create New Menus** - Try creating a menu for next week
- **Try All AI Styles** - Generate templates with Modern, Traditional, Colorful, and Minimalist styles
- **Export Multiple Formats** - Compare PNG, PDF, and JPG outputs
- **Share on WhatsApp** - Test the share link on your phone

---

**Need help?** Check the troubleshooting section above or refer to the documentation files.

**Ready to customize?** Add your own recipes, upload your food photos, and create menus for your tiffin service!
