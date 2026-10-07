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
    lastCompletedAt: number; // for sorting skills
  }[] = [];

  try {
    const lc = getUserLeetCode(userId);
    allSkills = lc.skills.map((skill) => {
      const total = skill.problems.length;
      
      // Sort problems by completedAt (most recent first)
      const sortedProblems = [...skill.problems].sort((a, b) => {
        if (a.completed && b.completed) {
          const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return timeB - timeA; // most recent first
        }
        if (a.completed) return -1;
        if (b.completed) return 1;
        return 0; // neither completed
      });

      const completed = skill.problems.filter((p) => p.completed);
      const mostRecentTime = completed.length > 0 
        ? Math.max(...completed.map(p => p.completedAt ? new Date(p.completedAt).getTime() : 0))
        : 0;
      
      const preview = sortedProblems.slice(0, 3).map((p) => ({
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
        completedProblems: completed.length,
        previewProblems: preview,
        othersCount: Math.max(0, total - 3),
        lastCompletedAt: mostRecentTime, 
      };
    });
  } catch { /* no leetcode data yet */ }

  // We want to showcase the topics the user is currently working on.
  // Sort them descending by their most recent completion timestamp.
  let activeSkills = allSkills.filter(s => s.completedProblems > 0);
  activeSkills.sort((a, b) => b.lastCompletedAt - a.lastCompletedAt);

  const SHOWCASE_LIMIT = 5;
  const showcasedSkills = activeSkills.slice(0, SHOWCASE_LIMIT);
  
  // If we don't have 5 active skills, fill with next uncompleted ones
  if (showcasedSkills.length < SHOWCASE_LIMIT) {
     const unstarted = allSkills.filter(s => s.completedProblems === 0);
     const needed = SHOWCASE_LIMIT - showcasedSkills.length;
     showcasedSkills.push(...unstarted.slice(0, needed));
  }

  const andMoreCount = Math.max(0, allSkills.length - showcasedSkills.length);

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
