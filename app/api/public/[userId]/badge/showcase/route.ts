import { NextRequest, NextResponse } from 'next/server';
import { getUserAchievements, getAchievementDefinitions, getUserSettings, validateUserId } from '@/lib/storage/readJson';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try { validateUserId(userId); } catch { return new NextResponse('Not found', { status: 404 }); }

  const settings = getUserSettings(userId);
  if (!settings.publicProfile || !settings.publicWidgets?.showcase) {
    return new NextResponse('Private', { status: 403 });
  }

  let unlocked: { id: string; unlockedAt: string }[] = [];
  try {
    const achData = getUserAchievements(userId);
    unlocked = achData.unlocked || [];
  } catch {
    // If achievements don't exist yet for the user
  }

  const defs = getAchievementDefinitions().achievements;
  
  // Get top 3 most recent achievements
  const recent = unlocked
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3)
    .map(u => defs.find(d => d.id === u.id))
    .filter(Boolean);

  let showcaseHTML = '';
  
  if (recent.length === 0) {
    showcaseHTML = `<text x="150" y="60" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.4)" text-anchor="middle">No achievements yet</text>`;
  } else {
    recent.forEach((ach, i) => {
      if (!ach) return;
      const y = 50 + (i * 35);
      // rarity colors
      let rarityColor = '#a8a29e'; // common
      if (ach.rarity === 'rare') rarityColor = '#3b82f6';
      else if (ach.rarity === 'epic') rarityColor = '#a855f7';
      else if (ach.rarity === 'legendary') rarityColor = '#f59e0b';

      showcaseHTML += `
        <rect x="20" y="${y - 15}" width="260" height="28" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)"/>
        <text x="30" y="${y + 4}" font-family="monospace" font-size="12" fill="${rarityColor}" font-weight="bold">✦</text>
        <text x="50" y="${y + 4}" font-family="monospace" font-size="12" fill="rgba(255,255,255,0.9)" font-weight="600">${ach.title}</text>
        <text x="270" y="${y + 4}" font-family="monospace" font-size="10" fill="rgba(255,255,255,0.3)" text-anchor="end">+${ach.xpReward} XP</text>
      `;
    });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0d12"/>
      <stop offset="100%" stop-color="#101319"/>
    </linearGradient>
  </defs>
  <rect width="300" height="160" rx="12" fill="url(#bg)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  
  <text x="20" y="24" font-family="monospace" font-size="10" fill="rgba(255,255,255,0.5)" font-weight="600" letter-spacing="1">TROPHY SHOWCASE</text>
  ${showcaseHTML}
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=1800',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
