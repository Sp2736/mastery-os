import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress, getUserSettings, validateUserId } from '@/lib/storage/readJson';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try { validateUserId(userId); } catch { return new NextResponse('Not found', { status: 404 }); }

  const settings = getUserSettings(userId);
  if (!settings.publicProfile || !settings.publicWidgets?.streak) {
    return new NextResponse('Private', { status: 403 });
  }

  const progress = getUserProgress(userId);
  const streak = progress.streak.current;
  const color = streak > 0 ? '#f97316' : '#6b7280';
  const label = streak === 1 ? '1 day' : `${streak} days`;
  const flame = streak > 0 ? '🔥 ' : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="56" viewBox="0 0 200 56">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0d12"/>
      <stop offset="100%" stop-color="#101319"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="200" height="56" rx="12" fill="url(#bg)" stroke="${color}30" stroke-width="1"/>
  <text x="14" y="20" font-family="monospace" font-size="10" fill="${color}80" letter-spacing="2" font-weight="600">STREAK</text>
  <text x="14" y="44" font-family="monospace" font-size="22" fill="${color}" font-weight="700" filter="url(#glow)">${flame}${label}</text>
  <text x="186" y="36" font-family="monospace" font-size="9" fill="${color}40" text-anchor="end">mastery-os</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=1800',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
