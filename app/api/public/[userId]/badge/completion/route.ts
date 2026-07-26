import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress, getUserSettings, getAllRoadmaps, validateUserId } from '@/lib/storage/readJson';
import { roadmapCompletion } from '@/lib/scoring/masteryScore';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try { validateUserId(userId); } catch { return new NextResponse('Not found', { status: 404 }); }

  const settings = getUserSettings(userId);
  if (!settings.publicProfile || !settings.publicWidgets?.completion) {
    return new NextResponse('Private', { status: 403 });
  }

  const progress = getUserProgress(userId);
  const roadmaps = getAllRoadmaps();
  const blended = roadmaps.reduce((acc, r) => {
    const pct = roadmapCompletion(progress, r);
    return acc + pct * r.totalNodes;
  }, 0) / Math.max(roadmaps.reduce((s, r) => s + r.totalNodes, 0), 1);

  const pct = Math.round(blended * 10) / 10;
  const color = pct > 75 ? '#10b981' : pct > 40 ? '#f59e0b' : '#6366f1';
  const barW = Math.round((pct / 100) * 148);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="64" viewBox="0 0 200 64">
  <defs>
    <linearGradient id="bg"><stop offset="0%" stop-color="#0b0d12"/><stop offset="100%" stop-color="#101319"/></linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${color}80"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="200" height="64" rx="12" fill="url(#bg)" stroke="${color}20" stroke-width="1"/>
  <text x="14" y="20" font-family="monospace" font-size="10" fill="${color}80" letter-spacing="2" font-weight="600">COMPLETION</text>
  <text x="14" y="42" font-family="monospace" font-size="22" fill="${color}" font-weight="700" filter="url(#glow)">${pct}%</text>
  <rect x="14" y="50" width="148" height="4" rx="2" fill="rgba(255,255,255,0.05)"/>
  <rect x="14" y="50" width="${barW}" height="4" rx="2" fill="url(#bar)"/>
</svg>`;

  return new NextResponse(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=1800', 'Access-Control-Allow-Origin': '*' },
  });
}
