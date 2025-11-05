# Complete Setup Guide - Weekly Menu Creation Feature

This guide will walk you through setting up the Weekly Menu Creation feature on your local machine from scratch.

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ Node.js (v14 or higher)
- ✅ MySQL (v8.0 or higher)
- ✅ Git
- ✅ A code editor (VS Code recommended)

---

## 🚀 Step-by-Step Setup

### Step 1: Pull Latest Code

```bash
# Navigate to your project directory
cd recipe-costing-app

# Pull the latest changes
git pull origin main

# You should see:
# - New files in database/ folder
# - New files in server/routes/ folder
# - New files in app/weekly-menu/ folder
```

---

### Step 2: Configure Environment Variables

#### Create/Update `.env` File

Open (or create) the `.env` file in your project root and add these variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Mysql
DB_NAME=recipe_costing_db

# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp

# Canva Configuration (Optional - for AI template generation)
# You can leave these empty for now and add later
CANVA_API_KEY=
CANVA_API_SECRET=

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Share Link Configuration
SHARE_LINK_BASE_URL=http://localhost:3000/share
SHARE_LINK_EXPIRY_DAYS=30
```

#### Important Notes:

1. **DB_PASSWORD**: Change `Mysql` to your actual MySQL root password
2. **DB_NAME**: Make sure this matches your database name
3. **PORT**: Backend runs on 3001, frontend on 3000
4. **CANVA_API_KEY**: Not required for basic functionality, only for AI template generation

---

### Step 3: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install multer for file uploads (if not already installed)
npm install multer

# Install dotenv (if not already installed)
npm install dotenv
```

---

### Step 4: Setup MySQL Database

#### Option A: Fresh Database Setup

```bash
# 1. Login to MySQL
mysql -u root -p
# Enter your password

# 2. Create database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS recipe_costing_db;

# 3. Exit MySQL
exit;

# 4. Run the complete setup SQL file
mysql -u root -p recipe_costing_db < database/complete_setup_with_data.sql
# Enter your password when prompted
```

#### Option B: If You Already Have the Database

```bash
# Just run the complete setup SQL file
mysql -u root -p recipe_costing_db < database/complete_setup_with_data.sql
# Enter your password when prompted
```

#### Verify Database Setup

```bash
mysql -u root -p recipe_costing_db -e "
SELECT 'Recipes' as Table_Name, COUNT(*) as Count FROM recipes
UNION ALL SELECT 'Recipe Images', COUNT(*) FROM recipe_images
UNION ALL SELECT 'Weekly Menus', COUNT(*) FROM weekly_menus
UNION ALL SELECT 'Menu Items', COUNT(*) FROM weekly_menu_items
UNION ALL SELECT 'Canva Templates', COUNT(*) FROM canva_templates;
"
```

**Expected Output:**
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

### Step 5: Extract Recipe Images

```bash
# From the project root directory
unzip database/recipe-images.zip -d .

# This will create: uploads/recipe-images/ with 6 image files

# Verify images extracted
ls -la uploads/recipe-images/
```

**You should see:**
- paneer-butter-masala.jpg
- chole-masala.jpg
- palak-paneer.jpg
- dal-tadka.webp
- jeera-rice.jpg
- veg-pulao.jpg

---

### Step 6: Verify File Structure

Make sure your project has this structure:

```
recipe-costing-app/
├── .env                          ← Your environment variables
├── server/
│   ├── index.js                  ← Updated with new routes
│   ├── config.js                 ← New: Centralized config
│   ├── utils.js                  ← New: Helper functions
│   └── routes/
│       ├── recipeImages.js       ← New: Recipe images API
│       ├── weeklyMenus.js        ← New: Weekly menus API
│       └── canvaTemplates.js     ← New: Canva templates API
├── app/
│   └── weekly-menu/
│       ├── page.tsx              ← New: Recipe images page
│       ├── RecipeImageManagementContent.tsx
│       ├── builder/
│       │   ├── page.tsx          ← New: Menu builder page
│       │   └── WeeklyMenuBuilderContent.tsx
│       ├── templates/
│       │   ├── page.tsx          ← New: Templates page
│       │   └── TemplateLibraryContent.tsx
│       └── finalize/
│           ├── page.tsx          ← New: Export & share page
│           └── MenuFinalizationContent.tsx
├── database/
│   ├── complete_setup_with_data.sql  ← Complete SQL file
│   ├── recipe-images.zip             ← Images to extract
│   └── weekly_menu_schema.sql        ← Schema only (backup)
└── uploads/
    └── recipe-images/                ← Extracted images go here
```

---

### Step 7: Start the Backend Server

```bash
# From the project root
node server/index.js
```

**Expected Output:**
```
Server running on port 3001
MySQL Connected!
```

**If you see errors:**

1. **MySQL Connection Error:**
   - Check your `.env` file has correct DB credentials
   - Make sure MySQL is running: `sudo service mysql status`
   - Test connection: `mysql -u root -p -e "SELECT 1;"`

2. **Port Already in Use:**
   - Kill existing process: `lsof -ti:3001 | xargs kill`
   - Or change PORT in `.env` to a different number

3. **Module Not Found:**
   - Run `npm install` again
   - Check if all dependencies are installed

---

### Step 8: Start the Frontend Server

**Open a new terminal window/tab:**

```bash
# From the project root
npm run dev
```

**Expected Output:**
```
> recipe-costing-app@0.1.0 dev
> next dev

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

### Step 9: Test the Application

Open your browser and navigate to:

#### 1. Recipe Images Page
**URL:** http://localhost:3000/weekly-menu

**What to check:**
- [ ] Left panel shows 27 recipes
- [ ] 6 recipes have photo icons (📷)
- [ ] Click "Paneer Butter Masala" → see image in right panel
- [ ] Image loads correctly (not broken)
- [ ] Can see image details (size, dimensions)

#### 2. Menu Builder Page
**URL:** http://localhost:3000/weekly-menu/builder

**What to check:**
- [ ] "Surti Fusion Weekly Menu" appears in the list
- [ ] Click on it to view details
- [ ] See 6 day cards (Monday-Saturday)
- [ ] Each day has 5 items
- [ ] Item names are visible (Paneer Butter Masala, Dal Tadka, etc.)
- [ ] Can click "Add Item" on any day

#### 3. Templates Page
**URL:** http://localhost:3000/weekly-menu/templates

**What to check:**
- [ ] "Weekly Menu Delight" appears in the library
- [ ] Template has a star icon (default)
- [ ] Style shows as "modern"
- [ ] Can click "Generate with AI" button

#### 4. Export & Share Page
**URL:** http://localhost:3000/weekly-menu/finalize

**What to check:**
- [ ] "Surti Fusion Weekly Menu" is available
- [ ] Canva design ID is shown
- [ ] Export format options visible (PNG, PDF, JPG)
- [ ] Can generate share link

---

### Step 10: Test API Endpoints (Optional)

Open a new terminal and test the backend APIs:

```bash
# Test health check
curl http://localhost:3001/

# Test recipes endpoint
curl http://localhost:3001/api/recipes | python3 -m json.tool

# Test weekly menus endpoint
curl http://localhost:3001/api/weekly-menus | python3 -m json.tool

# Test recipe images endpoint
curl http://localhost:3001/api/recipe-images | python3 -m json.tool

# Test canva templates endpoint
curl http://localhost:3001/api/canva/templates | python3 -m json.tool
```

---

## 🔧 Troubleshooting

### Problem: No recipes showing on Recipe Images page

**Solution:**
```bash
# Check if recipes exist in database
mysql -u root -p recipe_costing_db -e "SELECT COUNT(*) FROM recipes;"

# If 0, reimport data
mysql -u root -p recipe_costing_db < database/complete_setup_with_data.sql
```

---

### Problem: Images not loading (broken image icons)

**Solution:**
```bash
# 1. Check if images exist
ls -la uploads/recipe-images/

# 2. If empty, extract again
unzip database/recipe-images.zip -d .

# 3. Check file permissions
chmod 644 uploads/recipe-images/*

# 4. Verify backend serves static files
# In server/index.js, make sure you have:
# app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

---

### Problem: Menu items not showing

**Solution:**
```bash
# Check menu items in database
mysql -u root -p recipe_costing_db -e "SELECT COUNT(*) FROM weekly_menu_items;"

# Should return 30
# If 0, reimport data
mysql -u root -p recipe_costing_db < database/complete_setup_with_data.sql
```

---

### Problem: Backend won't start

**Solution:**
```bash
# 1. Check if port 3001 is in use
lsof -ti:3001

# 2. Kill existing process
lsof -ti:3001 | xargs kill

# 3. Check MySQL is running
sudo service mysql status

# 4. Test MySQL connection
mysql -u root -p -e "SELECT 1;"

# 5. Check .env file exists and has correct values
cat .env
```

---

### Problem: Frontend won't start

**Solution:**
```bash
# 1. Check if port 3000 is in use
lsof -ti:3000

# 2. Kill existing process
lsof -ti:3000 | xargs kill

# 3. Clear Next.js cache
rm -rf .next

# 4. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 5. Try again
npm run dev
```

---

### Problem: CORS errors in browser console

**Solution:**

In `server/index.js`, make sure CORS is configured:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

### Problem: "Cannot find module" errors

**Solution:**
```bash
# Install missing dependencies
npm install multer dotenv express mysql2 cors

# Or reinstall all
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Configuration Files

### .env File (Complete Example)

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YourMySQLPassword
DB_NAME=recipe_costing_db

# Server
PORT=3001
NODE_ENV=development

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp

# Frontend
FRONTEND_URL=http://localhost:3000

# Share Links
SHARE_LINK_BASE_URL=http://localhost:3000/share
SHARE_LINK_EXPIRY_DAYS=30

# Canva (Optional)
CANVA_API_KEY=
CANVA_API_SECRET=
```

### package.json (Verify Dependencies)

Make sure you have these in your `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mysql2": "^3.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

---

## ✅ Final Verification Checklist

Run through this checklist to ensure everything is working:

### Backend
- [ ] `.env` file exists with correct values
- [ ] MySQL is running
- [ ] Database has all tables
- [ ] Database has dummy data (27 recipes, 6 images, 1 menu, 30 items)
- [ ] Backend server starts without errors
- [ ] API endpoints respond correctly

### Frontend
- [ ] Frontend server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Navigation shows "Weekly Menu" section with 4 items
- [ ] All 4 pages load without errors

### Data
- [ ] Recipe Images page shows 27 recipes
- [ ] 6 recipes have images that load correctly
- [ ] Menu Builder shows "Surti Fusion Weekly Menu"
- [ ] Menu has 30 items across 6 days
- [ ] Templates page shows "Weekly Menu Delight"

### Functionality
- [ ] Can click on recipes and see images
- [ ] Can view menu details
- [ ] Can add items to menu
- [ ] Can view template details
- [ ] Can generate share links

---

## 🎉 Success!

If all checks pass, congratulations! Your Weekly Menu Creation feature is fully set up and working!

### What You Can Do Now:

1. **Explore the Feature**
   - Navigate through all 4 pages
   - View recipes and images
   - Explore the weekly menu
   - Check out the template

2. **Test the Workflow**
   - Upload a new recipe image
   - Create a new weekly menu
   - Add items to different days
   - Generate a new AI template (requires Canva API)
   - Export the menu
   - Generate and share a link

3. **Customize**
   - Add your own recipes
   - Upload your own food photos
   - Create menus for your tiffin service
   - Generate templates with different styles

---

## 📚 Next Steps

### To Enable Canva AI Template Generation:

1. Sign up for a Canva Developer account at https://www.canva.dev
2. Create an app and get your API credentials
3. Add them to your `.env` file:
   ```
   CANVA_API_KEY=your_api_key_here
   CANVA_API_SECRET=your_api_secret_here
   ```
4. Restart your backend server
5. Go to Templates page and click "Generate with AI"

### To Deploy to Production:

See `DEPLOYMENT_GUIDE.md` for detailed instructions on deploying to:
- Vercel (Frontend)
- Heroku/Railway (Backend)
- AWS/DigitalOcean (Full Stack)

---

## 💡 Pro Tips

1. **Keep Backend Running:** Use PM2 or nodemon for auto-restart
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name recipe-backend
   ```

2. **Use Environment-Specific .env Files:**
   - `.env.development` for local development
   - `.env.production` for production

3. **Backup Your Data:**
   ```bash
   mysqldump -u root -p recipe_costing_db > backup.sql
   ```

4. **Monitor Logs:**
   ```bash
   # Backend logs
   tail -f server.log

   # Frontend logs
   npm run dev | tee frontend.log
   ```

---

## 🆘 Need Help?

If you're still having issues:

1. Check the troubleshooting section above
2. Review the error messages in terminal
3. Check browser console for frontend errors
4. Verify all files are in the correct locations
5. Make sure all dependencies are installed
6. Restart both servers

---

## 📖 Documentation

- **USER_GUIDE_WEEKLY_MENU.md** - User guide for the feature
- **API_DOCUMENTATION.md** - All API endpoints
- **DEPLOYMENT_GUIDE.md** - Production deployment
- **DUMMY_DATA_SUMMARY.md** - Overview of dummy data
- **SETUP_DUMMY_DATA.md** - Detailed data setup

---

**You're all set! Enjoy your new Weekly Menu Creation feature! 🚀**
