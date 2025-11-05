# Deployment Guide - Weekly Menu Creation Feature

**Version:** 1.0  
**Last Updated:** November 5, 2025  
**Application:** Recipe Costing Application

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Canva Integration](#canva-integration)
7. [Testing Deployment](#testing-deployment)
8. [Production Checklist](#production-checklist)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying the application, ensure you have the following installed and configured on your system.

### System Requirements

**Operating System:**
- Ubuntu 20.04+ (recommended)
- macOS 10.15+
- Windows 10+ with WSL2

**Software:**
- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or yarn package manager
- Git for version control

### Hardware Requirements

**Minimum:**
- 2 CPU cores
- 4GB RAM
- 20GB disk space

**Recommended:**
- 4 CPU cores
- 8GB RAM
- 50GB disk space

---

## Environment Setup

The application uses environment variables for configuration. All settings are centralized in the `.env` file.

### Creating the .env File

Copy the example environment file and customize it for your environment:

```bash
cp .env.example .env
```

### Environment Variables

Edit the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=recipe_costing_db

# Server Configuration
PORT=3001
NODE_ENV=production

# Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Canva Integration
CANVA_ENABLED=true
CANVA_SERVER_NAME=canva

# Share Link Configuration
SHARE_TOKEN_LENGTH=16
SHARE_BASE_URL=http://yourdomain.com/share

# Pagination Configuration
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

### Platform-Specific Configuration

**Windows:**
```env
UPLOAD_DIR=C:/recipe-costing-app/uploads
```

**macOS/Linux:**
```env
UPLOAD_DIR=/var/www/recipe-costing-app/uploads
```

**Docker:**
```env
DB_HOST=mysql
UPLOAD_DIR=/app/uploads
```

---

## Database Setup

The application requires a MySQL database with specific tables and schemas.

### Step 1: Create Database

Connect to MySQL and create the database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE recipe_costing_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Run Base Schema

Execute the base schema to create existing tables:

```bash
mysql -u root -p recipe_costing_db < database/schema.sql
```

### Step 3: Run Weekly Menu Schema

Execute the weekly menu schema to create new tables:

```bash
mysql -u root -p recipe_costing_db < database/weekly_menu_schema.sql
```

### Step 4: Verify Tables

Check that all tables were created:

```sql
USE recipe_costing_db;
SHOW TABLES;
```

Expected tables:
- `products`
- `recipes`
- `recipe_images`
- `weekly_menus`
- `weekly_menu_items`
- `canva_templates`
- `menu_exports`
- `share_links`
- `customer_feedback`

### Alternative: Using Migration Script

For Node.js-based migration:

```bash
node database/migrate_weekly_menu.js
```

This script will:
- Connect to the database using `.env` credentials
- Execute all SQL statements
- Report success or errors
- Create necessary indexes

---

## Backend Deployment

The backend is a Node.js Express application that serves the API.

### Step 1: Install Dependencies

Navigate to the project directory and install packages:

```bash
npm install
```

This installs all dependencies including:
- express
- mysql2
- multer
- dotenv
- cors

### Step 2: Create Upload Directory

Ensure the upload directory exists and has proper permissions:

```bash
mkdir -p uploads/recipe-images
chmod 755 uploads
chmod 755 uploads/recipe-images
```

### Step 3: Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
NODE_ENV=production node server/index.js
```

### Step 4: Verify Server is Running

Test the health check endpoint:

```bash
curl http://localhost:3001/
```

Expected response:
```json
{
  "message": "Recipe Costing API V2 is running",
  "version": "2.0.0"
}
```

### Using Process Manager (Recommended)

For production deployments, use PM2 to manage the Node.js process:

**Install PM2:**
```bash
npm install -g pm2
```

**Start with PM2:**
```bash
pm2 start server/index.js --name recipe-costing-api
```

**Configure Auto-Restart:**
```bash
pm2 startup
pm2 save
```

**Monitor Logs:**
```bash
pm2 logs recipe-costing-api
```

---

## Frontend Deployment

The frontend is a Next.js application that serves the user interface.

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure API URL

Update the `.env.local` file (or `.env.production` for production):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production, use your domain:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Step 3: Build the Application

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Step 4: Start the Production Server

```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Using PM2 for Frontend

```bash
pm2 start npm --name recipe-costing-frontend -- start
pm2 save
```

### Static Export (Optional)

For static hosting (e.g., Netlify, Vercel):

```bash
npm run export
```

This creates a static version in the `out` directory.

---

## Canva Integration

The application integrates with Canva via the Model Context Protocol (MCP).

### Step 1: Verify MCP CLI

Ensure the `manus-mcp-cli` utility is available:

```bash
which manus-mcp-cli
```

If not found, install it according to your platform's instructions.

### Step 2: Configure Canva Server

The Canva MCP server should be pre-configured. Verify it's accessible:

```bash
manus-mcp-cli tool list --server canva
```

Expected output: List of 17 available Canva tools.

### Step 3: Test Canva Integration

Test a simple Canva operation:

```bash
curl -X POST http://localhost:3001/api/canva/templates
```

If you see templates or an empty array, the integration is working.

### Troubleshooting Canva

**Issue:** Canva tools not found  
**Solution:** Verify MCP server configuration and OAuth authentication.

**Issue:** OAuth authentication required  
**Solution:** Run `manus-mcp-cli` interactively to complete OAuth flow.

---

## Testing Deployment

After deployment, run through this checklist to ensure everything works.

### Backend Tests

**1. Health Check:**
```bash
curl http://localhost:3001/
```

**2. Recipe Images API:**
```bash
curl http://localhost:3001/api/recipe-images/1
```

**3. Weekly Menus API:**
```bash
curl http://localhost:3001/api/weekly-menus
```

**4. Canva Templates API:**
```bash
curl http://localhost:3001/api/canva/templates
```

### Frontend Tests

**1. Open Application:**
Navigate to `http://localhost:3000` in your browser.

**2. Test Navigation:**
- Click on "Recipe Images" in the sidebar
- Click on "Menu Builder"
- Click on "Templates"
- Click on "Export & Share"

**3. Test Image Upload:**
- Select a recipe
- Upload an image
- Verify it appears in the gallery

**4. Test Menu Creation:**
- Create a new menu
- Add items for Monday
- Save the menu
- Verify it appears in the list

**5. Test Template Generation:**
- Click "Generate with AI"
- Select a style
- Wait for candidates
- Save a template

**6. Test Export:**
- Select a menu
- Choose PNG format
- Click "Export Menu"
- Verify the file downloads

---

## Production Checklist

Before going live, complete this checklist to ensure your deployment is production-ready.

### Security

- [ ] Change default database password
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set secure environment variables
- [ ] Disable debug logging
- [ ] Enable rate limiting
- [ ] Configure firewall rules

### Performance

- [ ] Enable database connection pooling
- [ ] Configure caching (Redis recommended)
- [ ] Optimize image uploads (compression)
- [ ] Enable CDN for static assets
- [ ] Configure load balancer (if needed)
- [ ] Set up database indexes
- [ ] Monitor memory usage

### Monitoring

- [ ] Set up application logs
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Enable uptime monitoring
- [ ] Set up database backups
- [ ] Configure alerts for errors
- [ ] Monitor disk space
- [ ] Track API response times

### Backup

- [ ] Schedule daily database backups
- [ ] Back up uploaded images
- [ ] Store backups off-site
- [ ] Test backup restoration
- [ ] Document backup procedures

### Documentation

- [ ] Update API documentation
- [ ] Create user guide
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document environment variables

---

## Troubleshooting

Common deployment issues and their solutions.

### Database Connection Issues

**Problem:** Cannot connect to MySQL  
**Solutions:**
- Verify MySQL is running: `sudo service mysql status`
- Check credentials in `.env` file
- Ensure database exists: `SHOW DATABASES;`
- Check firewall rules
- Verify MySQL user permissions

**Problem:** Tables not found  
**Solutions:**
- Run schema migrations
- Check database name in `.env`
- Verify table creation: `SHOW TABLES;`

### Server Issues

**Problem:** Port already in use  
**Solutions:**
- Change PORT in `.env` file
- Kill existing process: `lsof -ti:3001 | xargs kill`
- Use a different port

**Problem:** Module not found errors  
**Solutions:**
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check Node.js version compatibility

### Upload Issues

**Problem:** Image uploads fail  
**Solutions:**
- Verify upload directory exists
- Check directory permissions: `chmod 755 uploads`
- Ensure disk space is available
- Check MAX_FILE_SIZE in `.env`

**Problem:** Images not accessible  
**Solutions:**
- Configure static file serving in Express
- Check file paths in database
- Verify web server configuration

### Canva Integration Issues

**Problem:** Canva MCP not found  
**Solutions:**
- Install `manus-mcp-cli` utility
- Verify PATH includes MCP CLI
- Check MCP server configuration

**Problem:** OAuth authentication fails  
**Solutions:**
- Run MCP CLI interactively
- Complete OAuth flow in browser
- Verify Canva API credentials

### Frontend Issues

**Problem:** API calls fail  
**Solutions:**
- Check NEXT_PUBLIC_API_URL in `.env.local`
- Verify CORS configuration on backend
- Check browser console for errors
- Test API endpoints directly with curl

**Problem:** Build fails  
**Solutions:**
- Clear `.next` directory
- Run `npm install` again
- Check for TypeScript errors
- Verify all dependencies are installed

---

## Deployment Platforms

### Deploying to VPS (Ubuntu)

**1. Install Prerequisites:**
```bash
sudo apt update
sudo apt install nodejs npm mysql-server nginx
```

**2. Clone Repository:**
```bash
git clone https://github.com/yourusername/recipe-costing-app.git
cd recipe-costing-app
```

**3. Follow Setup Steps Above**

**4. Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Deploying to Docker

**1. Create Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000 3001
CMD ["npm", "start"]
```

**2. Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: recipe_costing_db
    volumes:
      - mysql-data:/var/lib/mysql
  
  app:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      DB_HOST: mysql
      DB_PASSWORD: password
    depends_on:
      - mysql

volumes:
  mysql-data:
```

**3. Deploy:**
```bash
docker-compose up -d
```

---

## Support

For deployment issues not covered in this guide, contact support at https://help.manus.im or refer to the application logs for detailed error messages.

---

**Deployment Complete! 🚀**

*This guide is regularly updated with new deployment strategies and troubleshooting tips.*
