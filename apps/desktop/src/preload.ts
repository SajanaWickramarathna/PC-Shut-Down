import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getInfo: () => ipcRenderer.invoke('get-info'),
  resetApiKey: () => ipcRenderer.invoke('reset-api-key')
});
