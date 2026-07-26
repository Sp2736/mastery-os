import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getUserProfile, getAllRoadmaps } from '@/lib/storage/readJson';
import { writeUserJson } from '@/lib/storage/writeJson';
import { z } from 'zod';

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const profile = getUserProfile(session.userId);
  const roadmaps = getAllRoadmaps().map(r => ({ id: r.id, title: r.title, color: r.color, durationWeeks: r.durationWeeks }));
  return NextResponse.json({ profile, roadmaps });
}

const profileSchema = z.object({
  themeAccent: z.object({ h: z.number(), s: z.number(), l: z.number() }).optional(),
  workingHours: z.object({ start: z.string(), end: z.string() }).optional(),
  preferredStudyDuration: z.number().min(15).max(480).optional(),
  roadmapStartDates: z.record(z.string(), z.string()).optional(),
  activeRoadmaps: z.array(z.string()).optional(),
});

export async function PATCH(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const profile = getUserProfile(session.userId);
  const updated = { ...profile, ...parsed.data };
  await writeUserJson(session.userId, 'profile.json', updated);
  return NextResponse.json({ success: true, profile: updated });
}
