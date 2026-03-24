// ─────────────────────────────────────────────────────────────────────────────
// /api/auth/session — POST (set), DELETE (clear) session cookie
// ─────────────────────────────────────────────────────────────────────────────
// src/app/api/auth/session/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies }                   from 'next/headers';
import { adminAuth_ }                from '@/lib/firebase/admin';

const SESSION_COOKIE = 'session';
const COOKIE_OPTIONS = {
  httpOnly:  true,
  secure:    process.env.NODE_ENV === 'production',
  sameSite:  'lax' as const,
  path:      '/',
  maxAge:    60 * 60 * 24 * 14, // 14 days
};

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json() as { token: string };
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Verify the ID token
    await adminAuth_.verifyIdToken(token, true);

    // Create session cookie (5-day expiry for Firebase session cookies)
    const expiresIn  = 60 * 60 * 24 * 5 * 1000; // 5 days in ms
    const sessionCookie = await adminAuth_.createSessionCookie(token, { expiresIn });

    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE, sessionCookie, COOKIE_OPTIONS);

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('Session POST error:', err);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ status: 'ok' });
}

// GET — verify current session
export async function GET() {
  const cookieStore = cookies();
  const session     = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  try {
    const decoded = await adminAuth_.verifySessionCookie(session, true);
    return NextResponse.json({ authenticated: true, uid: decoded.uid, email: decoded.email });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
