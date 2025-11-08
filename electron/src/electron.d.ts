/**
 * TypeScript declarations for Electron API exposed via preload script
 * 
 * This file should be copied to the frontend to enable type-safe
 * access to the Electron APIs.
 */

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

declare global {
  interface Window {
    electron?: ElectronAPI;
    isElectron?: boolean;
  }
}

export {};
