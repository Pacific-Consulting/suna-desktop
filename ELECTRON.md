# Suna Desktop - Windows Application Guide

This guide covers building, distributing, and using Suna as a native Windows desktop application.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Development Setup](#development-setup)
4. [Building for Production](#building-for-production)
5. [Configuration](#configuration)
6. [Authentication](#authentication)
7. [Distribution](#distribution)
8. [Troubleshooting](#troubleshooting)

## Overview

Suna Desktop is an Electron-based wrapper around the Suna web application that provides:

- Native Windows application experience
- OAuth authentication via custom protocol handlers
- Secure credential storage
- Auto-update capability
- Offline-capable architecture
- Full Supabase cloud backend integration

### Architecture

```
┌─────────────────────────────────────────┐
│         Suna Desktop (Electron)         │
├─────────────────────────────────────────┤
│  Main Process (Node.js)                 │
│  - Window management                    │
│  - Deep link handling (suna://)         │
│  - Secure IPC bridge                    │
│  - Auto-updater                         │
├─────────────────────────────────────────┤
│  Renderer Process (Next.js + React)     │
│  - UI/UX (same as web app)              │
│  - Supabase client (anon key only)      │
│  - Context isolation enabled            │
└─────────────────────────────────────────┘
           ↓ HTTPS
┌─────────────────────────────────────────┐
│      Supabase Cloud Backend             │
│  - Authentication                       │
│  - Database                             │
│  - Storage                              │
│  - Multi-tenant logic                   │
└─────────────────────────────────────────┘
```

### Security Model

- **Context Isolation**: Renderer process cannot access Node.js APIs directly
- **No Node Integration**: Renderer runs in sandboxed environment
- **IPC Bridge**: Only whitelisted APIs exposed via secure preload script
- **Anon Key Only**: Client uses Supabase anon key (same as web)
- **Encrypted Storage**: User tokens stored in electron-store with encryption

## Quick Start

### For End Users

1. Download `Suna-Setup-1.0.0.exe` from releases
2. Run the installer
3. Launch Suna from desktop or Start Menu
4. Sign in with your Supabase account
5. Start using Suna!

### For Developers

See [Development Setup](#development-setup) below.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Windows (for Windows builds)

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/kortix-ai/suna.git
cd suna

# Install frontend dependencies
cd frontend
npm install

# Install electron dependencies
cd ../electron
npm install
```

### Environment Configuration

Create `frontend/.env.local`:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_BACKEND_URL="https://your-backend-url.com/api"
NEXT_PUBLIC_URL="http://localhost:3000"

# Optional
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
```

### Run in Development Mode

**Terminal 1 - Start Next.js dev server:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Start Electron:**
```bash
cd electron
npm run dev
```

The Electron app will load from `http://localhost:3000` in development mode with hot reload support.

### Development Features

- Hot reload from Next.js dev server
- DevTools automatically opened
- Detailed logging to console
- Source maps for debugging

## Building for Production

### Step 1: Build Frontend

The frontend must be built as a static export for Electron:

```bash
cd frontend
npm run build:static
```

This creates a static build in `frontend/out/` that Electron will bundle.

### Step 2: Build Electron App

```bash
cd electron
npm run build:win
```

This will:
1. Compile TypeScript to JavaScript
2. Bundle the frontend static files
3. Create a Windows installer in `electron/dist-electron/`

### Build Outputs

- `Suna-Setup-1.0.0.exe` - NSIS installer
- `Suna-1.0.0-win.zip` - Portable version
- Unpacked app in `dist-electron/win-unpacked/`

### Build Options

```bash
# Windows only
npm run build:win

# All platforms (requires macOS for Mac builds)
npm run build:all

# Quick test build (no installer)
npm run pack
```

## Configuration

### Supabase Setup

#### 1. Configure Redirect URLs

Add to your Supabase project (Authentication → URL Configuration):

**Redirect URLs:**
```
suna://auth/callback
http://localhost:3000/auth/callback  # For development
```

**Site URL:**
```
suna://
```

#### 2. Enable OAuth Providers

Enable Google and/or GitHub OAuth in Supabase:

1. Go to Authentication → Providers
2. Enable Google and/or GitHub
3. Configure with your OAuth app credentials

### Environment Variables

The Electron app reads environment variables from the frontend's `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (safe for client) |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_URL` | No | Frontend URL (default: http://localhost:3000) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | For Google OAuth |
| `DEV_SERVER_URL` | No | Dev server URL for Electron (default: http://localhost:3000) |

**Important**: Never include the Supabase `service_role` key in client applications!

## Authentication

### OAuth Flow in Desktop App

1. **User clicks "Sign in with Google/GitHub"**
2. **System browser opens** with OAuth provider
3. **User authenticates** on provider's website
4. **Provider redirects** to `suna://auth/callback?code=...`
5. **Electron intercepts** the deep link
6. **Main process sends** callback to renderer via IPC
7. **Frontend exchanges** code for session with Supabase
8. **User is redirected** to dashboard

### Supported Methods

- ✅ Email/Password
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Magic Links (email-based)
- ⚠️ Other providers (need testing)

### How It Works

The desktop app uses a **custom protocol handler** (`suna://`) to intercept OAuth callbacks:

```typescript
// When user clicks OAuth button
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'suna://auth/callback'  // Custom protocol
  }
});

// Electron intercepts the redirect
app.on('open-url', (event, url) => {
  // Extract code from URL
  // Send to renderer
  mainWindow.webContents.send('auth-callback', { code });
});

// Frontend exchanges code for session
await supabase.auth.exchangeCodeForSession(code);
```

## Distribution

### Signing the Application

For production releases, sign your application to avoid Windows SmartScreen warnings:

#### Option 1: Using Certificate File

```bash
cd electron

# Set environment variables
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your-password

# Build
npm run build:win
```

#### Option 2: Configure in package.json

```json
{
  "build": {
    "win": {
      "certificateFile": "./certs/certificate.pfx",
      "certificatePassword": "your-password"
    }
  }
}
```

**Getting a Certificate:**
- EV certificates: DigiCert, Sectigo, GlobalSign (~$300-500/year)
- Standard certificates: Various CAs (~$100-300/year)
- EV certificates avoid SmartScreen warnings immediately

### Auto-Updates

The app includes electron-updater for automatic updates:

#### 1. Configure Update Server

**Using GitHub Releases (Recommended):**

Add to `electron/package.json`:
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

**Using S3:**
```json
{
  "build": {
    "publish": {
      "provider": "s3",
      "bucket": "your-bucket",
      "region": "us-east-1"
    }
  }
}
```

#### 2. Publish Release

```bash
# Set GitHub token
export GH_TOKEN=your-github-token

# Build and publish
cd electron
npm run build:win
```

This uploads the installer and auto-update files to GitHub Releases.

#### 3. Update Process

When users launch the app:
1. App checks for updates on startup
2. If update available, downloads in background
3. Notifies user when ready
4. Installs on next restart

### Manual Distribution

1. Upload `Suna-Setup-1.0.0.exe` to your website
2. Create download page
3. Provide installation instructions
4. Link to documentation

## Troubleshooting

### Development Issues

#### "Failed to load dev server"

**Symptoms**: Electron shows error page

**Solutions**:
- Ensure Next.js dev server is running: `cd frontend && npm run dev`
- Check port 3000 is not in use
- Verify `DEV_SERVER_URL` environment variable
- Check console logs for connection errors

#### "DevTools not opening"

**Solutions**:
- Ensure `NODE_ENV=development` is set
- Try opening manually: View → Toggle DevTools
- Check Electron version compatibility

#### "OAuth redirect not working"

**Solutions**:
- Verify `suna://auth/callback` is in Supabase redirect URLs
- Check Windows protocol registration: Run as admin first time
- Look for deep link errors in Electron logs
- Test with email/password first

### Build Issues

#### "Frontend build not found"

**Symptoms**: Build fails with "frontend/out not found"

**Solutions**:
```bash
# Build frontend first
cd frontend
npm run build:static

# Then build Electron
cd ../electron
npm run build:win
```

#### "TypeScript errors"

**Solutions**:
```bash
cd electron
npm install
npm run build:electron
```

#### "Installer not created"

**Solutions**:
- Check `electron/dist-electron/` for error logs
- Ensure all dependencies installed
- Try clean build: `rm -rf dist dist-electron && npm run build:win`

### Runtime Issues

#### "App won't start after installation"

**Solutions**:
- Check Windows Event Viewer (Application logs)
- Run from command line to see errors: `"C:\Program Files\Suna\Suna.exe"`
- Try reinstalling
- Check antivirus isn't blocking

#### "Authentication fails"

**Solutions**:
- Verify Supabase URL and keys in build
- Check redirect URLs in Supabase
- Test with web version first
- Check logs: `%APPDATA%/Suna/logs`

#### "Updates not working"

**Solutions**:
- Verify update server configuration
- Check network connectivity
- Review logs: `%APPDATA%/Suna/logs/main.log`
- Test update URL manually

### Log Locations

**Windows**: `%APPDATA%\Suna\logs\`
- `main.log` - Main process logs
- `renderer.log` - Renderer logs

**To view logs:**
```bash
# PowerShell
notepad $env:APPDATA\Suna\logs\main.log

# Command Prompt
notepad %APPDATA%\Suna\logs\main.log
```

## Advanced Topics

### Custom Protocols

The app registers `suna://` protocol for:
- OAuth callbacks
- Deep linking to specific pages
- Inter-process communication

### IPC Bridge

Limited APIs exposed to renderer:
- `app:getVersion` - Get app version
- `app:getPlatform` - Get platform info
- `app:openExternal` - Open URLs in browser
- `store:get/set/delete` - Secure storage
- `app:getAuthCallbackUrl` - Get OAuth callback URL

### Security Hardening

Current security features:
- Context isolation: ✅
- Node integration: ❌ Disabled
- Sandbox: ✅ Enabled
- Web security: ✅ Enabled
- Remote module: ❌ Disabled
- Navigation protection: ✅ Enabled
- External link validation: ✅ Enabled

### Multi-Tenant Support

The desktop app fully supports Supabase's multi-tenant features:
- Users isolated by Row Level Security (RLS)
- Account/workspace switching works normally
- All tenant logic handled by Supabase backend
- No changes needed to data model

## Support

For issues or questions:

1. Check this documentation
2. Review logs for errors
3. Check GitHub Issues
4. Join Discord community
5. Contact support

## License

Apache 2.0 - See LICENSE file
