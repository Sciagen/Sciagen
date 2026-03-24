import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get('word');
  if (!word) return NextResponse.json({ error: 'word required' }, { status: 400 });

  try {
    const res  = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { next: { revalidate: 86400 } },
    );
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
