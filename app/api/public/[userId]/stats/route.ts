import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProgress,
  getUserSettings,
  getUserLeetCode,
  validateUserId,
} from '@/lib/storage/readJson';

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

  // --- LeetCode skills ---
  let allSkills: {
    id: string;
    title: string;
    track: string;
    totalProblems: number;
    completedProblems: number;
    previewProblems: { id: string; title: string; url: string; completed: boolean }[];
    othersCount: number;
  }[] = [];

  try {
    const lc = getUserLeetCode(userId);
    allSkills = lc.skills.map((skill) => {
      const total = skill.problems.length;
      const completed = skill.problems.filter((p) => p.completed).length;
      const preview = skill.problems.slice(0, 3).map((p) => ({
        id: p.id,
        title: p.title,
        url: p.url,
        completed: p.completed,
      }));
      return {
        id: skill.id,
        title: skill.title,
        track: skill.track,
        totalProblems: total,
        completedProblems: completed,
        previewProblems: preview,
        othersCount: Math.max(0, total - 3),
      };
    });
  } catch { /* no leetcode data yet */ }

  const SHOWCASE_LIMIT = 5;
  const showcasedSkills = allSkills.slice(0, SHOWCASE_LIMIT);
  const andMoreCount = Math.max(0, allSkills.length - SHOWCASE_LIMIT);

  return NextResponse.json({
    streak: {
      current: progress.streak.current,
      longest: progress.streak.longest,
    },
    leetcode: {
      skills: showcasedSkills,
      andMoreCount,
      totalSkills: allSkills.length,
    },
    lastUpdated: progress.lastUpdated,
  }, {
    headers: {
      'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
