// ─────────────────────────────────────────────────────────────────────────────
// /api/news — Proxy to Cloudflare Worker with caching
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL ?? '';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const domain = searchParams.get('domain') ?? 'ai';
  const page   = searchParams.get('page')   ?? '1';

  try {
    const res  = await fetch(`${WORKER_URL}/news?domain=${domain}&page=${page}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch {
    return NextResponse.json({ items: [], error: 'Failed to fetch news' }, { status: 502 });
  }
}
