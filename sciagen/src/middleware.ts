// ─────────────────────────────────────────────────────────────────────────────
// NEXT.JS MIDDLEWARE — Auth protection + security
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_PATHS = ['/dashboard', '/admin'];
// Routes only accessible when NOT authenticated
const AUTH_ONLY_PATHS = ['/auth/login', '/auth/signup', '/auth/reset'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session      = req.cookies.get('session')?.value;

  // ── Redirect authenticated users away from auth pages ──────────────────────
  if (AUTH_ONLY_PATHS.some(p => pathname.startsWith(p)) && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // ── Protect dashboard and admin routes ─────────────────────────────────────
  if (PROTECTED_PATHS.some(p => pathname.startsWith(p)) && !session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin-only protection ──────────────────────────────────────────────────
  // Full role check happens in the page via Firebase Admin SDK
  // Middleware just ensures a session exists

  // ── Security headers ───────────────────────────────────────────────────────
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag',        'index, follow');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options',     'SAMEORIGIN');
  res.headers.set('Referrer-Policy',     'strict-origin-when-cross-origin');

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
