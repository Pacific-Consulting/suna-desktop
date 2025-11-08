#!/bin/bash

# Suna Desktop Development Launcher
# This script helps start both the Next.js dev server and Electron

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Suna Desktop Development Launcher${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "electron" ]; then
    echo -e "${RED}❌ Error: Must be run from the repository root${NC}"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"

# Check if dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

if [ ! -d "electron/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Electron dependencies...${NC}"
    cd electron
    npm install
    cd ..
fi

# Check if .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env.local not found${NC}"
    echo "Creating from .env.example..."
    cp frontend/.env.example frontend/.env.local
    echo -e "${RED}⚠️  Please edit frontend/.env.local with your Supabase credentials${NC}"
    echo "Press Enter to continue when ready..."
    read
fi

# Build Electron TypeScript
echo -e "${YELLOW}🔨 Building Electron...${NC}"
cd electron
npm run build:electron
cd ..

echo ""
echo -e "${GREEN}✓ All checks passed!${NC}"
echo ""
echo -e "${YELLOW}Starting development servers...${NC}"
echo ""
echo "This will start:"
echo "  1. Next.js dev server on http://localhost:3000"
echo "  2. Electron app (will open automatically)"
echo ""
echo -e "${RED}Press Ctrl+C to stop all servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"
    kill 0
}

trap cleanup EXIT

# Start Next.js dev server in background
echo -e "${GREEN}Starting Next.js dev server...${NC}"
cd frontend
npm run dev &
NEXTJS_PID=$!
cd ..

# Wait for Next.js to be ready
echo -e "${YELLOW}Waiting for Next.js dev server...${NC}"
sleep 5

# Check if Next.js is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Next.js dev server failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Next.js dev server is ready${NC}"

# Start Electron
echo -e "${GREEN}Starting Electron...${NC}"
cd electron
NODE_ENV=development npm run dev:electron

# Wait for both processes
wait
