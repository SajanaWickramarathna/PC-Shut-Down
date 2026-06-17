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

import { ref, onValue, set, onDisconnect } from "firebase/database";
import { database } from "./firebaseConfig";

// FIREBASE SETUP
let API_KEY = getConfig().apiKey;

function setupFirebaseListener() {
  const pcStatusRef = ref(database, `pcs/${API_KEY}/status`);
  const pcCommandRef = ref(database, `pcs/${API_KEY}/command`);

  // Set status to online and handle disconnect
  set(pcStatusRef, 'online');
  onDisconnect(pcStatusRef).set('offline');

  // Listen for commands
  onValue(pcCommandRef, async (snapshot) => {
    const data = snapshot.val();
    if (data && data.action) {
      console.log(`Received command from Firebase: ${data.action}`);
      try {
        switch (data.action) {
          case 'shutdown': await shutdownPC(); break;
          case 'restart': await restartPC(); break;
          case 'lock': await lockPC(); break;
          case 'sleep': await sleepPC(); break;
        }
        // Clear the command after executing
        await set(pcCommandRef, null);
      } catch (error) {
        console.error(`Failed to execute ${data.action}:`, error);
      }
    }
  });
}

setupFirebaseListener();

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
      port: 0
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
