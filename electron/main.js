const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/icon.png')
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../.next/server/app/index.html')}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // In development, the server is started separately
    console.log('Development mode: Server should be running separately');
  } else {
    // In production, start the server process
    serverProcess = spawn('node', [path.join(__dirname, '../server/index.js')], {
      stdio: 'inherit'
    });
  }
}

app.whenReady().then(() => {
  startServer();
  
  // Give server time to start
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
