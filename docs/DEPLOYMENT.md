# Deployment Guide for Kortix/Suna

This guide explains how to deploy the Kortix/Suna platform to Vercel and Netlify.

## Overview

Kortix/Suna consists of:
- **Frontend**: Next.js application (in `/frontend` directory)
- **Backend**: Python/FastAPI application (in `/backend` directory)
- **Database**: Supabase

Both Vercel and Netlify deployment configurations are provided for the **frontend only**. The backend API should be deployed separately (e.g., using Docker, cloud VMs, or platform-specific solutions).

## Deploying to Vercel

Vercel is the recommended platform for deploying Next.js applications.

### Prerequisites
- Vercel account ([sign up here](https://vercel.com/signup))
- GitHub repository connected to Vercel

### Deployment Steps

1. **Import your repository** to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure the project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Select `frontend` as the root directory
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Set Environment Variables**:
   Add the following environment variables in Vercel's project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=your_backend_api_url
   ```
   Add any other required environment variables from `frontend/.env.example`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - Future commits to your main branch will trigger automatic deployments

### Configuration Files

The frontend includes a `vercel.json` configuration file that:
- Configures Next.js framework detection
- Sets up rewrites for PostHog analytics endpoints
- Adds security headers

## Deploying to Netlify

Netlify is another excellent option for deploying Next.js applications.

### Prerequisites
- Netlify account ([sign up here](https://app.netlify.com/signup))
- GitHub repository connected to Netlify

### Deployment Steps

1. **Import your repository** to Netlify:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure the build settings**:
   - **Base directory**: Leave empty or set to root `/`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/.next`
   - **Functions directory**: (leave empty)

3. **Install Next.js Plugin**:
   Netlify will automatically detect and install the `@netlify/plugin-nextjs` plugin (specified in `netlify.toml`)

4. **Set Environment Variables**:
   Add the following environment variables in Netlify's site settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=your_backend_api_url
   NODE_VERSION=22
   ```
   Add any other required environment variables from `frontend/.env.example`

5. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your application
   - Future commits will trigger automatic deployments

### Configuration Files

The root directory includes a `netlify.toml` configuration file that:
- Sets the build command and publish directory
- Configures Node.js version (v22)
- Sets up redirects for PostHog analytics endpoints
- Adds security headers
- Configures the Next.js plugin

## Backend Deployment

The backend API (Python/FastAPI) needs to be deployed separately. Options include:

### Option 1: Docker Deployment
Use the provided `backend/Dockerfile`:
```bash
cd backend
docker build -t suna-backend .
docker run -p 8000:8000 suna-backend
```

### Option 2: Cloud Platforms
- **Railway**: Deploy using Docker or Python buildpack
- **Render**: Deploy as a Web Service
- **DigitalOcean App Platform**: Deploy using Docker
- **AWS ECS/Fargate**: Deploy containerized application
- **Google Cloud Run**: Deploy containerized application

### Option 3: Traditional VPS
Deploy to a VPS (DigitalOcean, Linode, Vultr, etc.):
1. Set up Python environment
2. Install dependencies with `uv` or `pip`
3. Run Redis for caching
4. Run Dramatiq workers for background tasks
5. Run the API with `uv run api.py`

Refer to `backend/README.md` for detailed backend deployment instructions.

## Database Setup

Both deployment options require a Supabase instance:

1. **Cloud Supabase** (Recommended for production):
   - Sign up at [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key
   - Run migrations from `backend/supabase/migrations/`

2. **Self-hosted Supabase**:
   - Follow the [Supabase self-hosting guide](https://supabase.com/docs/guides/self-hosting)
   - Run migrations from `backend/supabase/migrations/`

## Post-Deployment Configuration

After deploying both frontend and backend:

1. Update the `NEXT_PUBLIC_API_URL` environment variable in your frontend deployment to point to your backend API
2. Update CORS settings in your backend to allow requests from your frontend domain
3. Configure any additional API keys needed (OpenAI, Anthropic, etc.) as environment variables
4. Test the full application flow

## Continuous Deployment

Both Vercel and Netlify support continuous deployment:
- Commits to your main branch automatically trigger new deployments
- Pull requests create preview deployments
- You can configure branch-specific deployments

## Monitoring and Analytics

The application includes:
- **PostHog Analytics**: Configured with proxy endpoints for privacy
- **Vercel Analytics**: Available when deployed to Vercel
- **Vercel Speed Insights**: Available when deployed to Vercel

Make sure to configure your analytics keys in the environment variables.

## Troubleshooting

### Common Issues

**Build Failures**:
- Check that all environment variables are set correctly
- Verify Node.js version is v22
- Check build logs for specific errors

**Runtime Errors**:
- Verify backend API URL is correct and accessible
- Check Supabase credentials
- Review browser console for errors

**Performance Issues**:
- Enable caching headers
- Optimize images
- Use edge functions for dynamic content

For more help:
- Check the [QUICKSTART.md](../QUICKSTART.md) guide
- Join the [Discord community](https://discord.gg/Py6pCBUUPw)
- Review [GitHub Issues](https://github.com/kortix-ai/suna/issues)

## Security Considerations

1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Enable HTTPS**: Both Vercel and Netlify provide automatic SSL certificates
3. **Configure CORS**: Properly configure CORS in your backend
4. **Security Headers**: Both configuration files include security headers
5. **Rate Limiting**: Implement rate limiting on your backend API
6. **Authentication**: Ensure Supabase authentication is properly configured

## Cost Estimates

### Vercel
- **Hobby Plan**: Free for personal projects (includes hobby usage limits)
- **Pro Plan**: $20/month per user (for production use)

### Netlify
- **Starter Plan**: Free (includes 100GB bandwidth, 300 build minutes/month)
- **Pro Plan**: $19/month per member (for production use)

### Supabase
- **Free Tier**: Free with limits (good for development)
- **Pro Plan**: $25/month per project (for production use)

### Backend Hosting
- Varies by platform (typically $5-50/month depending on scale)

## Next Steps

1. Complete the deployment following the steps above
2. Configure your custom domain (optional)
3. Set up monitoring and error tracking
4. Review and optimize performance
5. Plan for scaling as your usage grows

For detailed setup instructions, see [QUICKSTART.md](../QUICKSTART.md).
