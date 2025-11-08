/**
 * Electron-aware Supabase client wrapper
 * 
 * This enhances the standard Supabase client to work with Electron's
 * custom protocol for OAuth callbacks.
 */

import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { isElectron, electronAPI } from './electron';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client that works in both web and Electron
 */
export function createClient(): SupabaseClient {
  const client = createSupabaseClient();

  // If we're in Electron, set up OAuth callback handling
  if (isElectron()) {
    setupElectronAuthCallback(client);
  }

  return client;
}

/**
 * Setup OAuth callback handling for Electron
 */
function setupElectronAuthCallback(client: SupabaseClient): void {
  electronAPI.onAuthCallback(async (data: any) => {
    console.log('Electron auth callback received:', data);

    if (data.error) {
      console.error('Auth error:', data.error, data.errorDescription);
      // Could emit an event or show notification
      return;
    }

    if (data.code) {
      try {
        // Exchange the code for a session
        const { data: session, error } = await client.auth.exchangeCodeForSession(data.code);

        if (error) {
          console.error('Failed to exchange code for session:', error);
          return;
        }

        console.log('Successfully authenticated in Electron');
        
        // Redirect to dashboard or appropriate page
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
      } catch (err) {
        console.error('Error handling auth callback:', err);
      }
    }
  });

  // Cleanup on unmount (if used in a component)
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      electronAPI.removeAuthCallback();
    });
  }
}

/**
 * Enhanced OAuth sign-in that works with Electron
 */
export async function signInWithOAuth(
  client: SupabaseClient,
  provider: 'google' | 'github',
  options?: { redirectTo?: string }
): Promise<{ data: any; error: any }> {
  // Get the appropriate redirect URL
  const redirectTo = isElectron()
    ? await electronAPI.getAuthCallbackUrl()
    : `${window.location.origin}/auth/callback`;

  console.log('OAuth redirect URL:', redirectTo);

  // Add returnUrl if provided
  const finalRedirectTo = options?.redirectTo
    ? `${redirectTo}?returnUrl=${encodeURIComponent(options.redirectTo)}`
    : redirectTo;

  return client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: finalRedirectTo,
    },
  });
}
