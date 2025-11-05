# Converting Your Next.js App to a Standalone Desktop Application with Electron

This guide provides a comprehensive walkthrough on how to convert your Next.js Recipe Costing Application into a standalone desktop application using Electron. This will allow you to distribute your application as a native app for Windows, macOS, and Linux.

## 1. Introduction to Electron

Electron is a framework for creating native applications with web technologies like JavaScript, HTML, and CSS. It takes care of the hard parts so you can focus on the core of your application. By using Electron, you can wrap your existing Next.js application into a desktop app that can be installed and run on users' computers.

## 2. Setting Up the Electron Environment

First, you need to add Electron and other necessary packages to your project.

### 2.1. Install Electron and Dependencies

Run the following command to install Electron, `electron-builder` (for packaging the app), and `concurrently` (to run multiple commands at once):

```bash
npm install --save-dev electron electron-builder concurrently
```

### 2.2. Create the Main Electron File

Create a new file named `main.js` in the root of your project. This will be the main entry point for your Electron application.

```javascript
const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### 2.3. Create a Separate Server Entry Point

Create a file named `server.js` in the root of your project. This will be the entry point for your backend server when running in the desktop app.

```javascript
const express = require("express");
const { join } = require("path");
const { createTables, seedData } = require("./server/database");

const app = express();
const port = 3001;

app.use(express.json());

// Serve API routes
app.use("/api", require("./server/routes"));

// Initialize database and start server
(async () => {
  try {
    await createTables();
    await seedData();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Database initialization error: ", error);
  }
})();
```

## 3. Configure `package.json` for Electron

Now, you need to update your `package.json` file to include scripts for running and building the Electron application.

### 3.1. Add Main Entry Point

Add the following line to your `package.json` to specify the main Electron file:

```json
"main": "main.js",
```

### 3.2. Add Build Configuration

Add the following build configuration to your `package.json` to configure `electron-builder`:

```json
"build": {
  "appId": "com.example.recipe-costing-app",
  "productName": "Recipe Costing App",
  "files": [
    "build/**/*",
    "main.js",
    "server.js",
    "server/**/*"
  ],
  "directories": {
    "buildResources": "assets"
  }
},
```

### 3.3. Add Scripts

Add the following scripts to your `package.json`:

```json
"scripts": {
  "dev:next": "next dev --turbopack",
  "dev:server": "node server/index.js",
  "dev": "concurrently \"npm run dev:next\" \"npm run dev:server\"",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "electron:dev": "concurrently \"npm run dev\" \"electron .\"",
  "electron:build": "npm run build && electron-builder"
},
```

## 4. Running and Building the Desktop App

Now you're ready to run and build your desktop application.

### 4.1. Running in Development Mode

To run your application in development mode with Electron, use the following command:

```bash
npm run electron:dev
```

This will start the Next.js development server, the backend server, and the Electron application simultaneously.

### 4.2. Building for Production

To build a distributable package for your application, use the following command:

```bash
npm run electron:build
```

This will create a `dist` folder with the packaged application for your current operating system.

## 5. Conclusion

By following these steps, you have successfully converted your Next.js web application into a standalone desktop application using Electron. You can now distribute your application to users as a native app.
