import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress, getUserSettings, getAllRoadmaps, validateUserId, getUserProfile } from '@/lib/storage/readJson';
import { roadmapCompletion } from '@/lib/scoring/masteryScore';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try { validateUserId(userId); } catch { return new NextResponse('Not found', { status: 404 }); }

  const settings = getUserSettings(userId);
  if (!settings.publicProfile || !settings.publicWidgets?.showcase) {
    return new NextResponse('Private', { status: 403 });
  }

  const progress = getUserProgress(userId);
  const profile = getUserProfile(userId);
  const roadmaps = getAllRoadmaps();

  const completions = roadmaps.map(r => ({
    label: r.title.split(' ').slice(0, 2).join(' '),
    pct: roadmapCompletion(progress, r),
    color: r.color,
    total: r.totalNodes,
    done: r.phases.flatMap(p => p.weeks.flatMap(w => w.nodes)).filter(n => progress.nodes[n.id]?.status === 'completed').length,
  }));

  const barRows = completions.map((c, i) => {
    const y = 52 + i * 32;
    const barW = Math.round((c.pct / 100) * 240);
    return `
    <text x="16" y="${y}" font-family="system-ui" font-size="10" fill="rgba(255,255,255,0.55)">${c.label}</text>
    <text x="370" y="${y}" font-family="monospace" font-size="10" fill="${c.color}" text-anchor="end" font-weight="700">${c.pct.toFixed(0)}%</text>
    <rect x="16" y="${y + 5}" width="240" height="5" rx="2.5" fill="rgba(255,255,255,0.06)"/>
    <rect x="16" y="${y + 5}" width="${barW}" height="5" rx="2.5" fill="${c.color}"/>`;
  }).join('');

  const height = 36 + completions.length * 32 + 24;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="${height}" viewBox="0 0 400 ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0b0d12"/><stop offset="100%" stop-color="#0f1117"/></linearGradient>
  </defs>
  <rect width="400" height="${height}" rx="16" fill="url(#bg)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <text x="16" y="24" font-family="system-ui" font-size="14" fill="rgba(255,255,255,0.9)" font-weight="700">${profile.displayName} · Mastery OS</text>
  <text x="16" y="38" font-family="monospace" font-size="9" fill="rgba(255,255,255,0.3)" letter-spacing="1">🔥 ${progress.streak.current}d streak · Lvl ${progress.xp.level} · ${progress.xp.total.toLocaleString()} XP</text>
  ${barRows}
</svg>`;

  return new NextResponse(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=1800', 'Access-Control-Allow-Origin': '*' },
  });
}
