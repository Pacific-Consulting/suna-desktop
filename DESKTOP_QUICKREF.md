# Suna Desktop - Quick Reference

## Development Commands

```bash
# Start development (automated)
./dev-desktop.sh

# Or manually:
cd frontend && npm run dev          # Terminal 1
cd electron && npm run dev          # Terminal 2

# Build for production
cd frontend && npm run build:static # Step 1
cd electron && npm run build:win    # Step 2
```

## Key Files

| File | Purpose |
|------|---------|
| `electron/src/main.ts` | Main Electron process |
| `electron/src/preload.ts` | IPC bridge (security boundary) |
| `frontend/src/lib/electron.ts` | Electron API wrapper |
| `frontend/src/lib/supabase/electron-client.ts` | OAuth handler |
| `frontend/.env.local` | Configuration |

## Environment Setup

```bash
# frontend/.env.local (Required)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000/api"
```

## Supabase Configuration

Add to redirect URLs:
- `suna://auth/callback` (desktop)
- `http://localhost:3000/auth/callback` (dev)

## Common Tasks

### Update Dependencies
```bash
cd electron && npm update
cd frontend && npm update
```

### Clean Build
```bash
cd electron
rm -rf dist dist-electron node_modules
npm install
npm run build:electron
```

### Test Static Export
```bash
cd frontend
npm run build:static
ls -la out/  # Should contain HTML files
```

### Code Signing
```bash
export CSC_LINK=/path/to/cert.pfx
export CSC_KEY_PASSWORD=your-password
npm run build:win
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to load dev server" | Start Next.js: `cd frontend && npm run dev` |
| "OAuth not working" | Add `suna://auth/callback` to Supabase |
| "Build fails" | Build frontend first: `npm run build:static` |
| TypeScript errors | Clean: `rm -rf dist && npm run build:electron` |

## Security Checklist

- [x] Context isolation enabled
- [x] Node integration disabled
- [x] Sandbox enabled
- [x] Only anon key in client
- [x] IPC whitelist minimal
- [x] External URLs validated
- [x] Encrypted local storage

## Documentation

- `ELECTRON.md` - Full technical docs
- `DESKTOP_SETUP.md` - Setup guide
- `DESKTOP_SUMMARY.md` - Implementation details
- `electron/README.md` - Electron specifics

## Support

- Logs: `%APPDATA%/Suna/logs/` (Windows)
- DevTools: View → Toggle DevTools
- GitHub Issues: [Create issue](https://github.com/kortix-ai/suna/issues)
