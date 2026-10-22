const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('claudemate', {
  appInfo: () => ipcRenderer.invoke('app:info'),
  getPrefs: () => ipcRenderer.invoke('prefs:get'), setPrefs: p => ipcRenderer.invoke('prefs:set', p),
  keyStatus: () => ipcRenderer.invoke('key:status'), setKey: k => ipcRenderer.invoke('key:set', k), deleteKey: () => ipcRenderer.invoke('key:delete'),
  importHistory: () => ipcRenderer.invoke('history:import'), listHistory: q => ipcRenderer.invoke('history:list', q), deleteAllHistory: () => ipcRenderer.invoke('history:deleteAll'), historyCount: () => ipcRenderer.invoke('history:count'), searchContext: q => ipcRenderer.invoke('history:searchContext', q),
  askClaude: p => ipcRenderer.invoke('claude:ask', p), openExternal: u => ipcRenderer.invoke('external:open', u)
});
