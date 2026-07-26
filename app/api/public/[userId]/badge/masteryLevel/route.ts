import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress, getUserSettings, validateUserId } from '@/lib/storage/readJson';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try { validateUserId(userId); } catch { return new NextResponse('Not found', { status: 404 }); }

  const settings = getUserSettings(userId);
  if (!settings.publicProfile || !settings.publicWidgets?.masteryLevel) {
    return new NextResponse('Private', { status: 403 });
  }

  const progress = getUserProgress(userId);
  const level = progress.xp.level;

  const color = '#38bdf8'; // light blue for mastery

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0d12"/>
      <stop offset="100%" stop-color="#101319"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100" height="100" rx="16" fill="url(#bg)" stroke="${color}30" stroke-width="1"/>
  <text x="50" y="30" font-family="monospace" font-size="10" fill="${color}80" letter-spacing="1" font-weight="600" text-anchor="middle">LEVEL</text>
  <text x="50" y="65" font-family="monospace" font-size="36" fill="${color}" font-weight="800" filter="url(#glow)" text-anchor="middle">${level}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=1800',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
