import { contextBridge, ipcRenderer } from 'electron';

/**
 * Secure preload script - exposes only necessary APIs to renderer
 * 
 * This script runs in a privileged context but exposes a limited,
 * safe API to the renderer process through contextBridge.
 */

// Define the API interface for type safety
export interface ElectronAPI {
  // App info
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<{
    platform: string;
    arch: string;
    version: string;
  }>;

  // External links
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;

  // Store operations
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
  };

  // Auth
  getAuthCallbackUrl: () => Promise<string>;
  onAuthCallback: (callback: (data: any) => void) => void;
  removeAuthCallback: () => void;

  // Updates
  checkForUpdates: () => Promise<any>;

  // Environment
  isElectron: boolean;
}

// Expose protected methods in the render process through contextBridge
const api: ElectronAPI = {
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),

  // External links
  openExternal: (url: string) => ipcRenderer.invoke('app:openExternal', url),

  // Store operations (for settings, auth tokens, etc.)
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },

  // Auth callback URL for OAuth configuration
  getAuthCallbackUrl: () => ipcRenderer.invoke('app:getAuthCallbackUrl'),

  // Listen for auth callbacks from deep links
  onAuthCallback: (callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on('auth-callback', listener);
  },

  // Remove auth callback listener
  removeAuthCallback: () => {
    ipcRenderer.removeAllListeners('auth-callback');
  },

  // Update checker
  checkForUpdates: () => ipcRenderer.invoke('app:checkForUpdates'),

  // Environment flag
  isElectron: true,
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electron', api);

// Also expose a simpler check for Electron environment
contextBridge.exposeInMainWorld('isElectron', true);

// Log that preload has loaded (for debugging)
console.log('Electron preload script loaded');
