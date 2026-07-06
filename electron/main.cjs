const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

const GAME_CONTENT_WIDTH = 660;
const GAME_CONTENT_HEIGHT = 840;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: GAME_CONTENT_WIDTH,
    height: GAME_CONTENT_HEIGHT,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Tetris Clone',
    resizable: false
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
