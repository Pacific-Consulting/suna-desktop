# Desktop Setup Guide

Complete setup guide for building and running Suna as a Windows desktop application.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **Git** for version control
- **Windows** (for Windows builds) or macOS/Linux (for testing)
- **Supabase account** (free tier is fine)
- **At least one LLM API key** (Anthropic, OpenAI, Groq, etc.)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/kortix-ai/suna.git
cd suna

# Install dependencies
cd frontend
npm install
cd ../electron
npm install
cd ..
```

### 2. Configure Supabase

#### Option A: Use Cloud Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Project Settings → API**
4. Copy your:
   - Project URL (e.g., `https://abcdefgh.supabase.co`)
   - `anon` / `public` key (safe for client use)

#### Option B: Use Local Supabase

```bash
cd backend
npx supabase start
# Save the output URLs and keys
cd ..
```

### 3. Configure Environment

Create `frontend/.env.local`:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Backend API (if using hosted backend)
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000/api"

# Base URL
NEXT_PUBLIC_URL="http://localhost:3000"

# OAuth (Optional - for Google/GitHub sign-in)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
```

⚠️ **Important**: Never include `SUPABASE_SERVICE_ROLE_KEY` in the client - only use the `anon` key!

### 4. Configure Supabase for Desktop OAuth

For OAuth to work in the desktop app, you need to add the custom protocol:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   suna://auth/callback
   http://localhost:3000/auth/callback
   ```
3. Set **Site URL** to:
   ```
   suna://
   ```

### 5. Run in Development Mode

#### Option 1: Use the helper script (Linux/macOS)

```bash
./dev-desktop.sh
```

#### Option 2: Manual start (All platforms)

**Terminal 1 - Start Next.js:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Start Electron:**
```bash
cd electron
npm run dev
```

The Electron window will open automatically and connect to `http://localhost:3000`.

### 6. Build for Production

When ready to create a distributable installer:

```bash
# Step 1: Build frontend as static export
cd frontend
npm run build:static

# Step 2: Build Electron app
cd ../electron
npm run build:win

# Output will be in electron/dist-electron/
```

## Development Workflow

### Hot Reload

In development mode:
1. Changes to frontend code reload automatically (Next.js)
2. Changes to Electron main/preload require restart
3. DevTools are automatically opened

### Testing OAuth

To test OAuth authentication:
1. Click "Sign in with Google" or "Sign in with GitHub"
2. System browser opens
3. Complete authentication
4. Browser redirects to `suna://auth/callback`
5. Electron intercepts and logs you in

### Debugging

**Frontend issues:**
- Open DevTools in Electron window (View → Toggle DevTools)
- Check browser console for errors

**Electron issues:**
- Check terminal running Electron for main process logs
- Check `%APPDATA%/Suna/logs/main.log` (Windows)

## Building for Distribution

### Windows Installer

```bash
cd electron
npm run build:win
```

Creates:
- `Suna-Setup-1.0.0.exe` - NSIS installer
- Portable zip file
- Unpacked app directory

### Code Signing (Optional but Recommended)

For production releases, sign your app to avoid SmartScreen warnings:

```bash
# Set environment variables
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your-password

# Build with signing
npm run build:win
```

To get a certificate:
- **EV Certificate** (~$300-500/year): Immediately trusted, recommended
- **Standard Certificate** (~$100-300/year): May show warnings initially
- Providers: DigiCert, Sectigo, GlobalSign

### Auto-Updates Setup

To enable automatic updates:

1. Configure GitHub Releases in `electron/package.json`:
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

2. Build and publish:
```bash
export GH_TOKEN=your-github-token
npm run build:win
```

The app will automatically check for updates on startup.

## Common Issues

### "Failed to load dev server"

**Cause**: Next.js dev server not running

**Solution**:
```bash
# In frontend directory
npm run dev
```

### "OAuth redirect not working"

**Cause**: Missing redirect URL in Supabase

**Solution**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add `suna://auth/callback` to Redirect URLs
3. Restart Electron app

### "Build fails - frontend not found"

**Cause**: Frontend not built as static export

**Solution**:
```bash
cd frontend
npm run build:static
```

### TypeScript errors in Electron

**Solution**:
```bash
cd electron
rm -rf node_modules dist
npm install
npm run build:electron
```

## Architecture Overview

```
┌─────────────────────────────────────┐
│      Electron Main Process          │
│                                     │
│  • Window management                │
│  • Deep link handling (suna://)     │
│  • IPC bridge                       │
│  • Auto-updater                     │
└─────────────────────────────────────┘
              ↕ IPC
┌─────────────────────────────────────┐
│    Electron Renderer (Sandboxed)    │
│                                     │
│  • Next.js React App                │
│  • Supabase Client (anon key)       │
│  • Context isolation enabled        │
└─────────────────────────────────────┘
              ↓ HTTPS
┌─────────────────────────────────────┐
│      Supabase Cloud Backend         │
│                                     │
│  • Authentication                   │
│  • Database (PostgreSQL + RLS)      │
│  • Storage                          │
│  • Multi-tenant via RLS             │
└─────────────────────────────────────┘
```

### Security Features

✅ **Context Isolation**: Renderer cannot access Node.js
✅ **No Node Integration**: Renderer is fully sandboxed
✅ **IPC Whitelist**: Only specific APIs exposed
✅ **Anon Key Only**: No service_role key in client
✅ **Encrypted Storage**: User data encrypted locally

## File Structure

```
suna/
├── electron/              # Electron app
│   ├── src/
│   │   ├── main.ts       # Main process
│   │   ├── preload.ts    # IPC bridge
│   │   └── electron.d.ts # Type definitions
│   ├── build/            # Build resources (icons, etc.)
│   ├── dist/             # Compiled TypeScript
│   └── dist-electron/    # Built installers
│
├── frontend/             # Next.js app
│   ├── src/              # Source code
│   ├── out/              # Static export (for Electron)
│   └── .env.local        # Environment config
│
├── ELECTRON.md           # Detailed Electron docs
└── dev-desktop.sh        # Development helper script
```

## Next Steps

After setup:

1. ✅ Run in development mode
2. ✅ Test authentication (email/password, OAuth)
3. ✅ Test core features
4. ✅ Build production version
5. ✅ Test installer
6. 📦 Distribute to users

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [electron-builder](https://www.electron.build/)

## Support

Need help?
- Check [ELECTRON.md](./ELECTRON.md) for detailed documentation
- Open an issue on GitHub
- Join our Discord community

## License

Apache 2.0 - See LICENSE file
