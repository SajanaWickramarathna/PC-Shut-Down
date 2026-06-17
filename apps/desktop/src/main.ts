import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } from 'electron';
import express from 'express';
import cors from 'cors';
import { shutdownPC, restartPC, lockPC, sleepPC } from './controllers';
import { getConfig, resetApiKey } from './config';
import path from 'path';
import os from 'os';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// EXPRESS SERVER SETUP
const expressApp = express();
const PORT = process.env.PORT || 3000;
let API_KEY = getConfig().apiKey;

expressApp.use(cors());
expressApp.use(express.json());

const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
};

expressApp.get('/status', authenticate, (req, res) => {
  res.json({ status: 'online', message: 'PC is online and reachable.' });
});

expressApp.post('/shutdown', authenticate, async (req, res) => {
  try {
    await shutdownPC();
    res.json({ message: 'Shutting down PC...' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to shutdown PC', details: error.message });
  }
});

expressApp.post('/restart', authenticate, async (req, res) => {
  try {
    await restartPC();
    res.json({ message: 'Restarting PC...' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to restart PC', details: error.message });
  }
});

expressApp.post('/lock', authenticate, async (req, res) => {
  try {
    await lockPC();
    res.json({ message: 'Locking PC...' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to lock PC', details: error.message });
  }
});

expressApp.post('/sleep', authenticate, async (req, res) => {
  try {
    await sleepPC();
    res.json({ message: 'Putting PC to sleep...' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sleep PC', details: error.message });
  }
});

expressApp.listen(PORT, () => {
  console.log(`Desktop Service running on port ${PORT}`);
});

// GET LOCAL IP
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (iface) {
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if ((alias.family === 'IPv4' || (alias.family as any) === 4) && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  return 'Unknown';
}

// ELECTRON SETUP
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
    
    // IPC Handlers
    ipcMain.handle('get-info', () => ({
      apiKey: API_KEY,
      ip: getLocalIP(),
      port: PORT
    }));

    ipcMain.handle('reset-api-key', () => {
      API_KEY = resetApiKey().apiKey;
      return API_KEY;
    });

    // Auto-start on system boot
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true
    });

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 450,
    show: true,
    resizable: true,
    maximizable: true,
    autoHideMenuBar: true,
    title: 'PowerTap Dashboard',
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  mainWindow.on('close', (event) => {
    // Prevent closing to keep running in tray
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/icon.ico');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Dashboard', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit PowerTap', click: () => {
      isQuitting = true;
      mainWindow?.destroy();
      app.quit();
    }}
  ]);

  tray.setToolTip('PowerTap PC Service');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow?.show();
  });
}

app.on('window-all-closed', () => {
  // Ignore, let the tray icon keep it alive
});
