import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getUserSessions } from '@/lib/storage/readJson';
import { writeUserJson } from '@/lib/storage/writeJson';
import { z } from 'zod';
import crypto from 'crypto';

const sessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  durationMinutes: z.number().min(1).max(600),
  nodeIds: z.array(z.string()).max(50),
  roadmapId: z.string(),
  mood: z.number().min(1).max(5).optional().default(3),
  energy: z.number().min(1).max(5).optional().default(3),
  notes: z.string().max(500).optional().default(''),
});

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = getUserSessions(session.userId);
  return NextResponse.json({ sessions: data.sessions.slice(-90) }); // last 90 days
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const data = getUserSessions(session.userId);
  const newSession = {
    id: crypto.randomUUID(),
    ...parsed.data,
  };

  data.sessions.push(newSession);
  await writeUserJson(session.userId, 'sessions.json', data);
  return NextResponse.json({ success: true, session: newSession });
}
