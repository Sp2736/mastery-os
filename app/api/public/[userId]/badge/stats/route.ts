import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress, getUserSettings, validateUserId } from '@/lib/storage/readJson';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try { validateUserId(userId); } catch { return new NextResponse('Not found', { status: 404 }); }

  const settings = getUserSettings(userId);
  if (!settings.publicProfile || settings.publicWidgets?.stats === false) {
    return new NextResponse('Private', { status: 403 });
  }

  const progress = getUserProgress(userId);
  const totalCompleted = Object.values(progress.nodes).filter(n => n.status === 'completed').length;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0d12"/>
      <stop offset="100%" stop-color="#101319"/>
    </linearGradient>
  </defs>
  <rect width="300" height="120" rx="12" fill="url(#bg)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  
  <text x="20" y="30" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.5)" font-weight="600" letter-spacing="1">MASTERY STATS</text>
  
  <text x="20" y="60" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.7)">LEVEL</text>
  <text x="85" y="60" font-family="monospace" font-size="14" fill="#38bdf8" font-weight="bold">${progress.xp.level}</text>

  <text x="20" y="85" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.7)">TOTAL XP</text>
  <text x="85" y="85" font-family="monospace" font-size="14" fill="#f59e0b" font-weight="bold">${progress.xp.total.toLocaleString()}</text>

  <text x="20" y="110" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.7)">TASKS</text>
  <text x="85" y="110" font-family="monospace" font-size="14" fill="#10b981" font-weight="bold">${totalCompleted}</text>

  <text x="280" y="110" font-family="monospace" font-size="9" fill="rgba(255,255,255,0.2)" text-anchor="end">mastery-os</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=1800',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
