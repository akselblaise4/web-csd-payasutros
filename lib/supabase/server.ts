import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Aislado, sin NEXT_PUBLIC_

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Supabase Server] Credentials missing. Running in mock/unconfigured mode.');
  }

  return createServerClient(
    supabaseUrl || 'https://mock.supabase.co',
    supabaseKey || 'mock-service-role-key',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              // Capa 4: Flags de cookies innegociables para mitigación de XSS y CSRF
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          } catch (error) {
            // Next.js throws error if cookies are written in Server Components before layout renders.
            // Ignored here as session refresh is handled inside Server Actions or Middleware.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: -1, // Expire cookie immediately
            });
          } catch (error) {
            // Ignored
          }
        },
      },
    }
  );
}
