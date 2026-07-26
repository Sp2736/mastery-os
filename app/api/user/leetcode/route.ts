import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getUserLeetCode } from '@/lib/storage/readJson';
import { writeUserJson } from '@/lib/storage/writeJson';
import { z } from 'zod';

const patchSchema = z.object({
  skillId: z.string(),
  problemId: z.string(),
  completed: z.boolean(),
});

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const leetcode = getUserLeetCode(session.userId);
  return NextResponse.json(leetcode);
}

export async function PATCH(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { skillId, problemId, completed } = parsed.data;
  
  const leetcode = getUserLeetCode(session.userId);
  const skillIndex = leetcode.skills.findIndex(s => s.id === skillId);
  if (skillIndex === -1) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  
  const problemIndex = leetcode.skills[skillIndex].problems.findIndex(p => p.id === problemId);
  if (problemIndex === -1) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });

  const wasCompleted = leetcode.skills[skillIndex].problems[problemIndex].completed;
  
  // Update the completion status
  leetcode.skills[skillIndex].problems[problemIndex].completed = completed;
  await writeUserJson(session.userId, 'leetcode.json', leetcode);

  if (completed && !wasCompleted) {
    const { getUserProgress, getUserSettings } = await import('@/lib/storage/readJson');
    const progress = getUserProgress(session.userId);
    const settings = getUserSettings(session.userId);
    
    // Defaulting to medium multiplier for leetcode
    const xpAwarded = Math.floor(settings.baseXP * (settings.xpMultipliers.medium || 1));
    progress.xp.total += xpAwarded;
    
    const { levelFromXP } = await import('@/lib/storage/readJson');
    progress.xp.level = levelFromXP(progress.xp.total);

    // Update streak
    const todayDate = new Date();
    const today = todayDate.toISOString().split('T')[0];
    const lastActive = progress.streak.lastActiveDate;
    
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (lastActive === today) {
      // Already counted today
    } else if (lastActive === yesterday) {
      // Yesterday — extend streak
      progress.streak.current++;
      progress.streak.longest = Math.max(progress.streak.longest, progress.streak.current);
    } else {
      // Gap — reset streak
      progress.streak.current = 1;
    }
    progress.streak.lastActiveDate = today;

    progress.lastUpdated = new Date().toISOString();
    await writeUserJson(session.userId, 'progress.json', progress);
  }

  return NextResponse.json({ success: true, leetcode });
}
