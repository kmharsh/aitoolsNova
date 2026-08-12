const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('novaAPI', {
  sendIntent: (intent) => ipcRenderer.invoke('nova:intent', intent),
  onAgentResponse: (callback) => ipcRenderer.on('nova:response', (_event, value) => callback(value))
});
