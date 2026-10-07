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
    lastCompletedIndex: number; // for sorting
  }[] = [];

  try {
    const lc = getUserLeetCode(userId);
    allSkills = lc.skills.map((skill, skillIndex) => {
      const total = skill.problems.length;
      const completed = skill.problems.filter((p) => p.completed);
      
      // We want the most recent 3 completed problems, or if none, the first 3 uncompleted.
      // Assuming they are done in order, the last ones in the completed list are recent.
      const recentCompleted = completed.slice(-3).reverse(); 
      let preview = recentCompleted.map((p) => ({
        id: p.id,
        title: p.title,
        url: p.url,
        completed: p.completed,
      }));

      // If we don't have 3 completed, fill with uncompleted
      if (preview.length < 3) {
        const uncompleted = skill.problems.filter((p) => !p.completed);
        const needed = 3 - preview.length;
        preview = [
          ...preview,
          ...uncompleted.slice(0, needed).map(p => ({
            id: p.id, title: p.title, url: p.url, completed: p.completed
          }))
        ];
      }

      return {
        id: skill.id,
        title: skill.title,
        track: skill.track,
        totalProblems: total,
        completedProblems: completed.length,
        previewProblems: preview,
        othersCount: Math.max(0, total - 3),
        lastCompletedIndex: skillIndex, 
      };
    });
  } catch { /* no leetcode data yet */ }

  // We want to showcase the topics the user is currently working on.
  // We can filter those with completedProblems > 0, and sort them descending by their index 
  // (so Part 3 comes before Part 0, as it's more recent).
  let activeSkills = allSkills.filter(s => s.completedProblems > 0);
  activeSkills.sort((a, b) => b.lastCompletedIndex - a.lastCompletedIndex);

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
