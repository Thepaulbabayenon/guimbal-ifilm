const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL('http://localhost:3000'); // Loads Next.js
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
