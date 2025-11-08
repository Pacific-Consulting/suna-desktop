import type { NextConfig } from 'next';

const nextConfig = (): NextConfig => {
  // Support static export for Electron build
  const isElectronBuild = process.env.ELECTRON_BUILD === 'true';
  
  const config: NextConfig = {
    output: isElectronBuild ? 'export' : (process.env.NEXT_OUTPUT as 'standalone') || undefined,
    skipTrailingSlashRedirect: true,
  };

  // Rewrites don't work with static export, only for web deployment
  if (!isElectronBuild) {
    config.rewrites = async () => [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
      {
        source: '/ingest/flags',
        destination: 'https://eu.i.posthog.com/flags',
      },
    ];
  }

  return config;
};

export default nextConfig;
