import { NextRequest, NextResponse } from 'next/server';
import { getUserProgress, getUserSettings, validateUserId } from '@/lib/storage/readJson';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try { validateUserId(userId); } catch { return new NextResponse('Not found', { status: 404 }); }

  const settings = getUserSettings(userId);
  if (!settings.publicProfile || !settings.publicWidgets?.heatmap) {
    return new NextResponse('Private', { status: 403 });
  }

  const progress = getUserProgress(userId);
  const counts: Record<string, number> = {};

  Object.values(progress.nodes).forEach(node => {
    if (node.status === 'completed' && node.completedAt) {
      const date = node.completedAt.split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    }
  });

  const weeks = 40;
  const days = weeks * 7;
  const today = new Date();
  
  let boxes = '';
  const boxSize = 10;
  const gap = 3;

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - (w * 7 + d) - 1));
      const dateStr = date.toISOString().split('T')[0];
      const count = counts[dateStr] || 0;
      
      let fill = '#161b22';
      if (count === 1) fill = '#0e4429';
      else if (count === 2) fill = '#006d32';
      else if (count === 3) fill = '#26a641';
      else if (count >= 4) fill = '#39d353';
      
      boxes += `<rect x="${w * (boxSize + gap)}" y="${d * (boxSize + gap)}" width="${boxSize}" height="${boxSize}" rx="2" fill="${fill}" />\n`;
    }
  }

  const svgWidth = weeks * (boxSize + gap) - gap;
  const svgHeight = 7 * (boxSize + gap) - gap;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth + 40}" height="${svgHeight + 40}" viewBox="-20 -20 ${svgWidth + 40} ${svgHeight + 40}">
  <style>rect { transition: 0.3s; } rect:hover { stroke: rgba(255,255,255,0.5); stroke-width: 1px; }</style>
  <rect x="-20" y="-20" width="${svgWidth + 40}" height="${svgHeight + 40}" rx="12" fill="#0b0d12" stroke="rgba(255,255,255,0.05)"/>
  ${boxes}
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=1800',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
