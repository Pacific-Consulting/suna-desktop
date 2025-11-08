/**
 * Electron API integration for Suna frontend
 * 
 * This file provides a unified interface for interacting with Electron APIs
 * when running as a desktop app, with graceful fallbacks for web.
 */

export interface ElectronAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<{
    platform: string;
    arch: string;
    version: string;
  }>;
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
  };
  getAuthCallbackUrl: () => Promise<string>;
  onAuthCallback: (callback: (data: any) => void) => void;
  removeAuthCallback: () => void;
  checkForUpdates: () => Promise<any>;
  isElectron: boolean;
}

/**
 * Check if running in Electron environment
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.isElectron === true;
}

/**
 * Get the Electron API if available
 */
export function getElectronAPI(): ElectronAPI | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.electron || null;
}

/**
 * Safe wrapper for Electron API calls with web fallbacks
 */
export const electronAPI = {
  /**
   * Check if running in Electron
   */
  isElectron,

  /**
   * Get app version
   */
  async getVersion(): Promise<string> {
    const api = getElectronAPI();
    if (api) {
      return api.getVersion();
    }
    return '1.0.0-web';
  },

  /**
   * Get platform info
   */
  async getPlatform(): Promise<{ platform: string; arch: string; version: string }> {
    const api = getElectronAPI();
    if (api) {
      return api.getPlatform();
    }
    return {
      platform: 'web',
      arch: 'unknown',
      version: 'unknown',
    };
  },

  /**
   * Open external URL
   * In web, uses window.open
   * In Electron, uses shell.openExternal
   */
  async openExternal(url: string): Promise<{ success: boolean; error?: string }> {
    const api = getElectronAPI();
    if (api) {
      return api.openExternal(url);
    }
    // Web fallback
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  /**
   * Store operations (Electron-only)
   * In web, uses localStorage as fallback
   */
  store: {
    async get(key: string): Promise<any> {
      const api = getElectronAPI();
      if (api) {
        return api.store.get(key);
      }
      // Web fallback to localStorage
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    },

    async set(key: string, value: any): Promise<boolean> {
      const api = getElectronAPI();
      if (api) {
        return api.store.set(key, value);
      }
      // Web fallback to localStorage
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    async delete(key: string): Promise<boolean> {
      const api = getElectronAPI();
      if (api) {
        return api.store.delete(key);
      }
      // Web fallback to localStorage
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },
  },

  /**
   * Get auth callback URL for OAuth
   * Returns custom protocol URL for Electron, web URL for web
   */
  async getAuthCallbackUrl(): Promise<string> {
    const api = getElectronAPI();
    if (api) {
      return api.getAuthCallbackUrl();
    }
    // Web fallback
    return `${window.location.origin}/auth/callback`;
  },

  /**
   * Listen for auth callbacks (Electron-only)
   */
  onAuthCallback(callback: (data: any) => void): void {
    const api = getElectronAPI();
    if (api) {
      api.onAuthCallback(callback);
    }
  },

  /**
   * Remove auth callback listener (Electron-only)
   */
  removeAuthCallback(): void {
    const api = getElectronAPI();
    if (api) {
      api.removeAuthCallback();
    }
  },

  /**
   * Check for updates (Electron-only)
   */
  async checkForUpdates(): Promise<any> {
    const api = getElectronAPI();
    if (api) {
      return api.checkForUpdates();
    }
    return { available: false, reason: 'Not in Electron' };
  },
};

// Type augmentation for window object
declare global {
  interface Window {
    electron?: ElectronAPI;
    isElectron?: boolean;
  }
}
