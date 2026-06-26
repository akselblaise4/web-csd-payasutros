import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis/cloudflare';

// Initialize Upstash Redis client safely to handle missing env variables in development
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.error('[Middleware] Failed to initialize Upstash Redis:', error);
  }
} else {
  console.warn(
    '[Middleware] ⚠️ UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are missing. Rate limiting is running in bypass mode.'
  );
}

// CORS whitelist parsed from environment variables
const getAllowedOrigins = (): string[] => {
  const allowed = process.env.ALLOWED_ORIGINS;
  if (allowed) {
    return allowed.split(',').map((o) => o.trim().toLowerCase());
  }
  return ['http://localhost:3000'];
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // --- Capa 3: Distributed Rate Limiting ---
  if (pathname.startsWith('/api/') && redis) {
    let limitReached = false;
    const currentWindow = Math.floor(Date.now() / 60000); // 1 minute window

    try {
      if (pathname.startsWith('/api/auth')) {
        // Capa 3: 5 requests per minute for authentication paths
        const key = `ratelimit:auth:${ip}:${currentWindow}`;
        const count = await redis.incr(key);
        if (count === 1) {
          await redis.expire(key, 60);
        }
        if (count > 5) {
          limitReached = true;
        }
      } else {
        // Capa 3: 60 requests per minute for other API paths
        const key = `ratelimit:std:${ip}:${currentWindow}`;
        const count = await redis.incr(key);
        if (count === 1) {
          await redis.expire(key, 60);
        }
        if (count > 60) {
          limitReached = true;
        }
      }
    } catch (err) {
      // Fail-open strategy to prevent Redis downtime from locking out real users,
      // but log the incident immediately for CISO monitoring
      console.error('[Middleware] Rate limiting check failed:', err);
    }

    if (limitReached) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // --- Capa 2: Security Headers & CSP Nonce ---
  // Generate cryptographic nonce for scripts
  const nonce = crypto.randomUUID();

  // Strict CSP: script-src uses 'nonce-{nonce}' and 'strict-dynamic' to allow scripts added by verified scripts
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https://api.ligab.cl https://*.supabase.co https://liga-b.nyc3.digitaloceanspaces.com;
    connect-src 'self' https://api.ligab.cl https://*.supabase.co;
    frame-ancestors 'none';
    object-src 'none';
    base-uri 'self';
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Clone headers and inject dynamic CSP & nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', cspHeader);

  // Initialize response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Inject defensive headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // --- Capa 2: Restrictive CORS ---
  const origin = request.headers.get('origin');
  if (origin) {
    const allowedOrigins = getAllowedOrigins();
    if (allowedOrigins.includes(origin.toLowerCase())) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token, x-nonce');
    }
  }

  // Handle preflight OPTIONS requests early
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|logo.png|img/|.*\\..*).*)',
  ],
};
