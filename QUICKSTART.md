# Quick Start Guide

Get Suna running in **under 5 minutes** with minimal configuration!

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (for Redis and optional local Supabase)
- [Node.js 18+](https://nodejs.org/) and npm
- [Python 3.11+](https://www.python.org/downloads/)
- [uv](https://github.com/astral-sh/uv#installation) (Python package manager)

## Quick Start (Minimal Setup)

### Step 1: Clone the Repository

```bash
git clone https://github.com/kortix-ai/suna.git
cd suna
```

### Step 2: Set Up Supabase

**Option A: Local Supabase (Recommended for development)**

```bash
cd backend
npx supabase start
# Save the output - you'll need the API URL and keys
cd ..
```

**Option B: Cloud Supabase**

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and keys from Project Settings → API

### Step 3: Configure Environment

**Backend Configuration:**

```bash
cd backend
cp .env.defaults .env
# Edit .env and add:
# - Your Supabase URL, anon key, and service role key
# - At least one LLM API key (Anthropic, OpenAI, Groq, etc.)
cd ..
```

**Frontend Configuration:**

```bash
cd frontend  
cp .env.defaults .env.local
# Edit .env.local and add:
# - Your Supabase URL and anon key
cd ..
```

### Step 4: Start Suna

**Start Redis:**
```bash
docker compose up redis -d
```

**Start Backend (in a new terminal):**
```bash
cd backend
uv run api.py
```

**Start Worker (in a new terminal):**
```bash
cd backend
uv run dramatiq run_agent_background
```

**Start Frontend (in a new terminal):**
```bash
cd frontend
npm install
npm run dev
```

### Step 5: Access Suna

Open your browser to [http://localhost:3000](http://localhost:3000)

🎉 **You're done!** You can now start using Suna.

## What's Included in Minimal Setup?

With just Supabase + 1 LLM key, you get:

✅ **Core AI Agent Functionality**
- Natural language conversation
- File management and editing
- Code execution
- Data analysis

❌ **Optional Features Not Included** (can be added later):

- Web search (requires Tavily API key)
- Web scraping (requires Firecrawl API key)  
- Isolated sandboxes (requires Daytona account)
- Additional data providers (requires RapidAPI key)

## Adding Optional Features

To enable additional features, add the corresponding API keys to your `.env` file:

### Web Search
```bash
TAVILY_API_KEY=your_key_here
```
Get a key at [tavily.com](https://tavily.com)

### Web Scraping
```bash
FIRECRAWL_API_KEY=your_key_here
```
Get a key at [firecrawl.dev](https://firecrawl.dev)

### Sandboxed Execution
```bash
DAYTONA_API_KEY=your_key_here
DAYTONA_SERVER_URL=https://app.daytona.io/api
DAYTONA_TARGET=us
```
Sign up at [daytona.io](https://www.daytona.io)

## Full Setup Wizard

If you prefer an interactive setup with all features:

```bash
python setup.py
```

This wizard will guide you through configuring all available services.

## Troubleshooting

**Redis connection error:**
- Make sure Docker is running
- Verify Redis is running: `docker compose ps`

**Supabase connection error:**
- Verify your keys are correct in `.env`
- For local Supabase, make sure it's running: `cd backend && npx supabase status`

**Frontend can't connect to backend:**
- Make sure backend is running on port 8000
- Check `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local`

## Next Steps

- Read the [full documentation](./README.md)
- Learn about [agent configuration](./docs/AGENT_CONFIG.md)
- Join our [Discord community](https://discord.gg/Py6pCBUUPw)
