import { app, BrowserWindow, protocol, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import log from 'electron-log';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Initialize secure store for settings
const store = new Store<Record<string, any>>({
  name: 'suna-config',
  encryptionKey: 'suna-desktop-encryption-key-v1'
});

// Track main window
let mainWindow: BrowserWindow | null = null;

// Development mode check
const isDev = process.env.NODE_ENV === 'development';
const devServerUrl = process.env.DEV_SERVER_URL || 'http://localhost:3000';

// Handle deep links for OAuth callbacks
let deeplinkingUrl: string | null = null;

// Protocol scheme for auth callbacks
const PROTOCOL_SCHEME = 'suna';

// Set app user model id for Windows
if (process.platform === 'win32') {
  app.setAppUserModelId('com.kortix.suna');
}

/**
 * Create the main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Suna',
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      sandbox: true,
      // Allow OAuth flows to work
      allowRunningInsecureContent: false,
      webviewTag: false,
      devTools: isDev
    },
    show: false, // Don't show until ready
    autoHideMenuBar: true,
  });

  // Load the app
  if (isDev) {
    // Development mode: load from Next.js dev server
    mainWindow.loadURL(devServerUrl).catch((err) => {
      log.error('Failed to load dev server:', err);
      // Show error page
      mainWindow?.loadFile(path.join(__dirname, '../build/error.html'));
    });
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Production mode: load static build
    const indexPath = path.join(__dirname, '../frontend/out/index.html');
    
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath).catch((err) => {
        log.error('Failed to load app:', err);
      });
    } else {
      log.error('Frontend build not found at:', indexPath);
      // Try loading from a fallback location
      const fallbackPath = path.join(process.resourcesPath, 'app', 'frontend', 'out', 'index.html');
      if (fs.existsSync(fallbackPath)) {
        mainWindow.loadFile(fallbackPath);
      }
    }
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Handle OAuth callback if app was opened with deep link
    if (deeplinkingUrl) {
      handleDeepLink(deeplinkingUrl);
      deeplinkingUrl = null;
    }
  });

  // Prevent new windows from opening (security)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow OAuth flows
    if (url.includes('supabase.co') || url.includes('github.com/login') || url.includes('accounts.google.com')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    
    // Block everything else
    log.warn('Blocked new window:', url);
    return { action: 'deny' };
  });

  // Handle navigation attempts (security)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowedOrigins = [
      devServerUrl,
      'file://',
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    ].filter(Boolean);

    const isAllowed = allowedOrigins.some((origin) => url.startsWith(origin));
    
    if (!isAllowed && !isDev) {
      event.preventDefault();
      log.warn('Blocked navigation to:', url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Handle deep link URLs (for OAuth callbacks)
 */
function handleDeepLink(url: string): void {
  log.info('Deep link received:', url);
  
  if (!mainWindow) {
    // Store for later when window is created
    deeplinkingUrl = url;
    return;
  }

  // Parse the URL and send to renderer
  try {
    const parsedUrl = new URL(url);
    
    // Check if it's an auth callback
    if (parsedUrl.protocol === `${PROTOCOL_SCHEME}:` && parsedUrl.pathname === '//auth/callback') {
      // Extract code and other params
      const code = parsedUrl.searchParams.get('code');
      const error = parsedUrl.searchParams.get('error');
      const errorDescription = parsedUrl.searchParams.get('error_description');
      
      log.info('Auth callback received:', { code: !!code, error });
      
      // Send to renderer process
      mainWindow.webContents.send('auth-callback', {
        code,
        error,
        errorDescription,
        url: url,
      });
    }
  } catch (err) {
    log.error('Failed to parse deep link:', err);
  }
}

/**
 * Register protocol handler for deep links
 */
function registerProtocolHandler(): void {
  // Set as default protocol client
  if (!app.isDefaultProtocolClient(PROTOCOL_SCHEME)) {
    app.setAsDefaultProtocolClient(PROTOCOL_SCHEME);
    log.info('Registered as default protocol handler for:', PROTOCOL_SCHEME);
  }
}

/**
 * Setup IPC handlers for secure communication with renderer
 */
function setupIpcHandlers(): void {
  // Get app version
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  // Get platform info
  ipcMain.handle('app:getPlatform', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion(),
    };
  });

  // Open external links safely
  ipcMain.handle('app:openExternal', async (_event, url: string) => {
    try {
      // Validate URL
      const parsed = new URL(url);
      const allowedProtocols = ['http:', 'https:', 'mailto:'];
      
      if (allowedProtocols.includes(parsed.protocol)) {
        await shell.openExternal(url);
        return { success: true };
      } else {
        log.warn('Blocked external URL with invalid protocol:', url);
        return { success: false, error: 'Invalid protocol' };
      }
    } catch (err) {
      log.error('Failed to open external URL:', err);
      return { success: false, error: String(err) };
    }
  });

  // Store operations (for settings)
  ipcMain.handle('store:get', (_event, key: string) => {
    return (store as any).get(key);
  });

  ipcMain.handle('store:set', (_event, key: string, value: any) => {
    (store as any).set(key, value);
    return true;
  });

  ipcMain.handle('store:delete', (_event, key: string) => {
    (store as any).delete(key);
    return true;
  });

  // Get auth callback URL for OAuth configuration
  ipcMain.handle('app:getAuthCallbackUrl', () => {
    return `${PROTOCOL_SCHEME}://auth/callback`;
  });

  // Auto-updater events (for future use)
  ipcMain.handle('app:checkForUpdates', async () => {
    if (!isDev) {
      try {
        const result = await autoUpdater.checkForUpdates();
        return { available: true, info: result?.updateInfo };
      } catch (err) {
        log.error('Update check failed:', err);
        return { available: false, error: String(err) };
      }
    }
    return { available: false, reason: 'Development mode' };
  });
}

/**
 * App lifecycle management
 */
app.whenReady().then(() => {
  log.info('App is ready');
  log.info('Version:', app.getVersion());
  log.info('Electron:', process.versions.electron);
  log.info('Node:', process.versions.node);
  log.info('Platform:', process.platform);
  log.info('Development mode:', isDev);

  // Register protocol handler
  registerProtocolHandler();

  // Setup IPC handlers
  setupIpcHandlers();

  // Create main window
  createWindow();

  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Check for updates in production
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle OAuth callbacks on macOS/Linux
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Handle OAuth callbacks on Windows
if (process.platform === 'win32') {
  // Windows handles protocol via command line args
  const args = process.argv.slice(1);
  const deeplinkArg = args.find((arg) => arg.startsWith(`${PROTOCOL_SCHEME}://`));
  
  if (deeplinkArg) {
    handleDeepLink(deeplinkArg);
  }
}

// Handle second instance (Windows)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    // Handle deep link from second instance
    const deeplinkArg = commandLine.find((arg) => arg.startsWith(`${PROTOCOL_SCHEME}://`));
    
    if (deeplinkArg) {
      handleDeepLink(deeplinkArg);
    }

    // Focus the main window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, closing app');
  app.quit();
});

process.on('SIGINT', () => {
  log.info('SIGINT received, closing app');
  app.quit();
});
