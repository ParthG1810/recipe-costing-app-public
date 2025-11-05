# Recipe Costing Application - Desktop App Guide

## Complete Guide to Running and Building Your Standalone Desktop Application

This guide will walk you through everything you need to know about running and building your Recipe Costing Application as a standalone desktop application using Electron.

---

## Table of Contents

1. [What You Already Have](#what-you-already-have)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Running in Development Mode](#running-in-development-mode)
5. [Building for Production](#building-for-production)
6. [Troubleshooting](#troubleshooting)
7. [Distribution](#distribution)

---

## What You Already Have

Your project is already configured with Electron! Here's what's set up:

### ✅ Electron Configuration Files
- **`electron/main.js`** - Main Electron process (window management, server startup)
- **`package.json`** - Contains all Electron scripts and build configuration

### ✅ Package.json Scripts
```json
{
  "electron": "cross-env NODE_ENV=development electron .",
  "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && cross-env NODE_ENV=development electron .\"",
  "electron:build": "next build && electron-builder",
  "package": "electron-builder --win"
}
```

### ✅ Build Configuration
```json
{
  "build": {
    "appId": "com.recipecostingapp",
    "productName": "Recipe Costing App",
    "directories": {
      "output": "dist"
    },
    "files": [
      ".next/**/*",
      "electron/**/*",
      "server/**/*",
      "public/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "public/icon.ico"
    }
  }
}
```

---

## Prerequisites

Before you start, make sure you have:

1. **Node.js** (v18 or higher) installed
2. **MySQL** database running (if using MySQL)
3. **Git** installed
4. **All dependencies** installed

---

## Step-by-Step Setup

### Step 1: Clone and Navigate to Your Project

```bash
git clone https://github.com/ParthG1810/recipe-costing-app-public.git
cd recipe-costing-app-public
```

### Step 2: Install Dependencies

```bash
npm install
```

If you encounter Electron installation issues, reinstall it:

```bash
rm -rf node_modules/.pnpm/electron*
npm install electron --save-dev
```

### Step 3: Configure Database

Make sure your MySQL database is running and configured in `server/database.js`.

**Update database credentials if needed:**
```javascript
// server/database.js
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'recipe_costing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Step 4: Create an Icon (Optional)

Place your app icon at:
- **Windows**: `public/icon.ico` (256x256 px)
- **macOS**: `public/icon.icns`
- **Linux**: `public/icon.png` (512x512 px)

---

## Running in Development Mode

### Method 1: Run Electron with Hot Reload

This starts both the Next.js dev server, backend server, and Electron app:

```bash
npm run electron:dev
```

**What happens:**
1. Next.js dev server starts on `http://localhost:3000`
2. Backend API server starts on `http://localhost:3001`
3. Electron window opens and loads the app
4. Hot reload enabled - changes reflect immediately

### Method 2: Run Components Separately

**Terminal 1 - Start Next.js:**
```bash
npm run dev:next
```

**Terminal 2 - Start Backend:**
```bash
npm run dev:server
```

**Terminal 3 - Start Electron:**
```bash
npm run electron
```

---

## Building for Production

### Step 1: Build the Next.js App

```bash
npm run build
```

This creates an optimized production build in the `.next` folder.

### Step 2: Build the Electron App

#### For Windows:
```bash
npm run package
```
or
```bash
npm run electron:build
```

This creates:
- **Installer**: `dist/Recipe Costing App Setup 1.0.0.exe`
- **Unpacked**: `dist/win-unpacked/`

#### For macOS:
```bash
electron-builder --mac
```

#### For Linux:
```bash
electron-builder --linux
```

#### For All Platforms:
```bash
electron-builder -mwl
```

### Step 3: Find Your Built App

After building, your distributable files will be in the `dist/` folder:

```
dist/
├── Recipe Costing App Setup 1.0.0.exe  (Windows Installer)
├── win-unpacked/                        (Windows Portable)
│   └── Recipe Costing App.exe
├── mac/                                 (macOS)
│   └── Recipe Costing App.app
└── linux-unpacked/                      (Linux)
    └── recipe-costing-app
```

---

## Troubleshooting

### Issue 1: Electron Installation Failed

**Error:**
```
Error: Electron failed to install correctly
```

**Solution:**
```bash
rm -rf node_modules/.pnpm/electron*
npm install electron@latest --save-dev
```

### Issue 2: Database Connection Error

**Error:**
```
Database initialization error
```

**Solution:**
1. Make sure MySQL is running
2. Check database credentials in `server/database.js`
3. Create the database if it doesn't exist:
```sql
CREATE DATABASE recipe_costing;
```

### Issue 3: Port Already in Use

**Error:**
```
Port 3000 is already in use
```

**Solution:**
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev:next
```

### Issue 4: Electron Window Not Opening

**Solution:**
1. Make sure Next.js server is running first
2. Wait for "Ready in Xms" message
3. Then start Electron

### Issue 5: Build Fails

**Error:**
```
Cannot find module '.next/server/app/index.html'
```

**Solution:**
Update `electron/main.js` to use correct path:
```javascript
// For production, use the correct Next.js output
mainWindow.loadURL(`file://${path.join(__dirname, '../out/index.html')}`);
```

Then add to `package.json`:
```json
"scripts": {
  "electron:build": "next build && next export && electron-builder"
}
```

---

## Distribution

### Windows Distribution

The `.exe` installer can be distributed directly. Users just need to:
1. Download the installer
2. Run it
3. The app installs and creates a desktop shortcut

### macOS Distribution

For macOS, you'll need to:
1. Sign the app with an Apple Developer certificate
2. Notarize the app
3. Create a `.dmg` installer

### Linux Distribution

Distribute as:
- **AppImage** (portable)
- **deb** package (Debian/Ubuntu)
- **rpm** package (Fedora/Red Hat)

---

## Advanced Configuration

### Custom Window Size

Edit `electron/main.js`:
```javascript
const mainWindow = new BrowserWindow({
  width: 1600,  // Change width
  height: 1000, // Change height
  minWidth: 1200,
  minHeight: 800,
  // ... other options
});
```

### Auto-Update Support

Add to `package.json`:
```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "your-repo"
  }
}
```

### Custom Menu

Create `electron/menu.js`:
```javascript
const { Menu } = require('electron');

const template = [
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
```

---

## Summary

Your Recipe Costing Application is now a fully functional desktop app! 

**Quick Commands:**
- **Development**: `npm run electron:dev`
- **Build**: `npm run electron:build`
- **Package Windows**: `npm run package`

**What You Get:**
- ✅ Native desktop application
- ✅ Works offline (after initial setup)
- ✅ Professional installer
- ✅ Desktop icon and shortcuts
- ✅ Bundled backend server
- ✅ Cross-platform support

For any issues or questions, refer to the Troubleshooting section or check the [Electron documentation](https://www.electronjs.org/docs/latest/).

---

**Created by:** Manus AI  
**Last Updated:** November 5, 2025
