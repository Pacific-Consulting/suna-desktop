# Suna Desktop - Electron Application

This directory contains the Electron wrapper for the Suna web application, converting it into a native Windows desktop application.

## Architecture

The Suna desktop application uses Electron to wrap the Next.js frontend, maintaining full integration with the Supabase backend while providing a native desktop experience.

### Key Components

- **Main Process** (`src/main.ts`): Core Electron process that manages windows, handles deep links for OAuth, and provides IPC APIs
- **Preload Script** (`src/preload.ts`): Secure bridge between main and renderer processes with context isolation
- **Frontend**: Next.js application (in `../frontend`) that runs in the Electron renderer

### Security Features

- ✅ Context isolation enabled
- ✅ No Node.js integration in renderer
- ✅ Sandboxed renderer process
- ✅ Secure IPC with whitelisted APIs only
- ✅ Content Security Policy
- ✅ External link validation
- ✅ Navigation protection

### OAuth Authentication

The desktop app handles OAuth flows (Google, GitHub) using custom deep links:

1. User initiates OAuth flow
2. Browser opens OAuth provider
3. After authentication, redirects to `suna://auth/callback?code=...`
4. Electron intercepts the deep link
5. Main process sends callback data to renderer via IPC
6. Frontend exchanges code for session with Supabase

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- All frontend dependencies installed

### Setup

1. **Install Electron dependencies:**
   ```bash
   cd electron
   npm install
   ```

2. **Start the Next.js dev server (in another terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Start Electron in development mode:**
   ```bash
   cd electron
   npm run dev
   ```

The Electron app will connect to `http://localhost:3000` in development mode.

### Development Mode Features

- Hot reload (from Next.js dev server)
- DevTools automatically opened
- Detailed logging
- Source maps

## Building

### Prerequisites for Production Build

1. **Build the frontend as a static export:**
   ```bash
   cd frontend
   npm run build:static
   ```

2. **Build Electron app:**
   ```bash
   cd electron
   npm run build:win
   ```

This creates a Windows installer in `electron/dist-electron/`.

### Build Targets

- `npm run build:win` - Windows installer (NSIS)
- `npm run build:mac` - macOS DMG (requires macOS)
- `npm run build:linux` - Linux AppImage and DEB
- `npm run build:all` - All platforms

## Configuration

### Environment Variables

The Electron app respects these environment variables:

- `NODE_ENV` - Set to `development` or `production`
- `DEV_SERVER_URL` - Dev server URL (default: `http://localhost:3000`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

These should be configured in `frontend/.env.local` for development.

### Supabase Configuration

For OAuth to work in the desktop app, you need to add the custom protocol to your Supabase allowed redirect URLs:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to "Redirect URLs": `suna://auth/callback`
3. Add to "Site URL": `suna://`

## Code Signing (Windows)

For production releases, you should sign your application:

1. **Obtain a Code Signing Certificate:**
   - Get an EV or standard code signing certificate from a CA
   - Common providers: DigiCert, Sectigo, GlobalSign

2. **Configure signing in `package.json`:**
   ```json
   {
     "build": {
       "win": {
         "certificateFile": "path/to/certificate.pfx",
         "certificatePassword": "your-password",
         "signingHashAlgorithms": ["sha256"]
       }
     }
   }
   ```

3. **Or use environment variables:**
   ```bash
   export CSC_LINK=/path/to/certificate.pfx
   export CSC_KEY_PASSWORD=your-password
   npm run build:win
   ```

**Note:** For security, never commit certificates or passwords to version control.

## Auto-Updates

The app includes electron-updater for automatic updates. To enable:

1. Configure a release server (GitHub Releases, S3, or custom)
2. Update `package.json` with `publish` configuration:
   ```json
   {
     "build": {
       "publish": {
         "provider": "github",
         "owner": "your-org",
         "repo": "suna-desktop"
       }
     }
   }
   ```

3. Build and publish releases:
   ```bash
   npm run build:win
   ```

The app will automatically check for updates on startup.

## Distribution

### Windows Installation

The NSIS installer provides:
- User or per-machine installation
- Desktop and Start Menu shortcuts
- Automatic uninstaller
- Protocol handler registration
- Update support

### First-Time User Setup

Users only need to:
1. Download the installer
2. Run `Suna-Setup-1.0.0.exe`
3. Follow installation wizard
4. Launch Suna from desktop or Start Menu
5. Sign in with existing Supabase account

## Troubleshooting

### Development Issues

**Electron app shows error page:**
- Ensure Next.js dev server is running on port 3000
- Check `DEV_SERVER_URL` environment variable
- Check console logs for connection errors

**OAuth not working:**
- Verify `suna://auth/callback` is in Supabase redirect URLs
- Check Electron logs for deep link handling
- Ensure protocol is registered (should be automatic)

**Build fails:**
- Ensure frontend is built first: `cd frontend && npm run build:static`
- Check that `frontend/out` directory exists
- Verify all dependencies are installed

### Production Issues

**App won't start after installation:**
- Check Windows Event Viewer for error details
- Ensure all dependencies are bundled
- Verify code signing if used

**Updates not working:**
- Check auto-updater configuration
- Verify release server is accessible
- Check logs in `%APPDATA%/Suna/logs`

### Logs Location

- **Windows**: `%APPDATA%/Suna/logs`
- **macOS**: `~/Library/Logs/Suna`
- **Linux**: `~/.config/Suna/logs`

## File Structure

```
electron/
├── src/
│   ├── main.ts           # Main Electron process
│   ├── preload.ts        # Preload script (IPC bridge)
│   └── electron.d.ts     # TypeScript declarations
├── build/
│   ├── icon.ico          # Windows icon
│   ├── icon.icns         # macOS icon
│   ├── icon.png          # Linux icon
│   └── error.html        # Error page for dev mode
├── dist/                 # Compiled TypeScript
├── dist-electron/        # Built installers
├── package.json          # Electron config & dependencies
└── tsconfig.json         # TypeScript configuration
```

## Security Considerations

1. **No Sensitive Keys in Client**: The desktop app uses Supabase anon key only (same as web)
2. **Secure Storage**: User tokens stored in encrypted electron-store
3. **IPC Validation**: All IPC calls validated in main process
4. **Content Isolation**: Renderer cannot access Node.js APIs directly
5. **HTTPS Only**: All API calls use HTTPS to Supabase backend

## Contributing

When modifying the Electron wrapper:

1. Test both development and production modes
2. Verify OAuth flows still work
3. Check that auto-updates work (if configured)
4. Test on Windows (primary target)
5. Update this README if adding new features

## License

Apache 2.0 - See LICENSE file in root directory
