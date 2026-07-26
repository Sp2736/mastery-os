import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getUserJournal } from '@/lib/storage/readJson';
import { writeUserJson } from '@/lib/storage/writeJson';
import { computeCorrelations } from '@/lib/insights/correlations';
import { z } from 'zod';

const journalEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  learned: z.string().max(2000).optional().default(''),
  blocked: z.string().max(1000).optional().default(''),
  difficult: z.string().max(1000).optional().default(''),
  confidence: z.number().min(1).max(5).optional().default(3),
  mood: z.number().min(1).max(5).optional().default(3),
  energy: z.number().min(1).max(5).optional().default(3),
  focus: z.number().min(1).max(5).optional().default(3),
  sleepHours: z.number().min(0).max(24).optional().default(7),
  studyHours: z.number().min(0).max(24).optional().default(1),
  journal: z.string().max(5000).optional().default(''),
  nodesCompletedToday: z.array(z.string()).optional().default([]),
});

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const journal = getUserJournal(session.userId);
  const insights = computeCorrelations(journal.entries);

  return NextResponse.json({ entries: journal.entries.slice(-30), insights });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = journalEntrySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const journal = getUserJournal(session.userId);
  const now = new Date().toISOString();
  const entry = {
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  };

  // Upsert: replace existing entry for the same date, or append
  const idx = journal.entries.findIndex(e => e.date === entry.date);
  if (idx >= 0) {
    journal.entries[idx] = { ...journal.entries[idx], ...entry, updatedAt: now };
  } else {
    journal.entries.push(entry);
  }

  await writeUserJson(session.userId, 'journal.json', journal);
  return NextResponse.json({ success: true, entry });
}
