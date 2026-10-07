import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProgress,
  getUserSettings,
  getUserProfile,
  getUserAchievements,
  getAchievementDefinitions,
  getAllRoadmaps,
  validateUserId,
} from '@/lib/storage/readJson';
import { roadmapCompletion } from '@/lib/scoring/masteryScore';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  try {
    validateUserId(userId);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const settings = getUserSettings(userId);
  if (!settings.publicProfile) {
    return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
  }

  const progress = getUserProgress(userId);
  const profile = getUserProfile(userId);
  const roadmaps = getAllRoadmaps();

  const roadmapStats = roadmaps.map((r) => {
    const done = r.phases
      .flatMap((p) => p.weeks.flatMap((w) => w.nodes))
      .filter((n) => progress.nodes[n.id]?.status === 'completed').length;
    return {
      id: r.id,
      title: r.title,
      color: r.color,
      totalNodes: r.totalNodes,
      completedNodes: done,
      pct: Math.round(roadmapCompletion(progress, r) * 10) / 10,
    };
  });

  const totalNodes = roadmaps.reduce((s, r) => s + r.totalNodes, 0);
  const blendedPct =
    totalNodes > 0
      ? Math.round(
          (roadmaps.reduce((acc, r) => acc + roadmapCompletion(progress, r) * r.totalNodes, 0) / totalNodes) * 10
        ) / 10
      : 0;

  let recentAchievements: { id: string; title: string; rarity: string; xpReward: number; unlockedAt: string }[] = [];
  try {
    const achData = getUserAchievements(userId);
    const defs = getAchievementDefinitions().achievements;
    recentAchievements = achData.unlocked
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 5)
      .map((u) => {
        const def = defs.find((d) => d.id === u.id);
        return def
          ? { id: u.id, title: def.title, rarity: def.rarity, xpReward: def.xpReward, unlockedAt: u.unlockedAt }
          : null;
      })
      .filter(Boolean) as { id: string; title: string; rarity: string; xpReward: number; unlockedAt: string }[];
  } catch { /* no achievements yet */ }

  const totalCompleted = Object.values(progress.nodes).filter((n) => n.status === 'completed').length;

  const activityMap: Record<string, number> = {};
  Object.values(progress.nodes).forEach((node) => {
    if (node.status === 'completed' && node.completedAt) {
      const date = node.completedAt.split('T')[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    }
  });

  return NextResponse.json({
    userId,
    displayName: profile.displayName,
    level: progress.xp.level,
    totalXp: progress.xp.total,
    streak: { current: progress.streak.current, longest: progress.streak.longest },
    totalCompleted,
    blendedCompletion: blendedPct,
    roadmaps: roadmapStats,
    recentAchievements,
    activityMap,
    lastUpdated: progress.lastUpdated,
  }, {
    headers: {
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
