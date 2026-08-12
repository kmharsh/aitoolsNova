import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('novaAPI', {
  sendIntent: (intent: string) => ipcRenderer.invoke('nova:intent', intent),
  onAgentState: (callback: (state: string) => void) => ipcRenderer.on('nova:state', (_event: any, value: any) => callback(value)),
  onAgentProgress: (callback: (task: any) => void) => ipcRenderer.on('nova:progress', (_event: any, value: any) => callback(value)),
  onAgentResponse: (callback: (response: any) => void) => ipcRenderer.on('nova:response', (_event: any, value: any) => callback(value))
});

contextBridge.exposeInMainWorld('ipc', {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, func: (data: any) => void) => {
    const subscription = (_event: any, ...args: any[]) => func(args[0]);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  }
});
