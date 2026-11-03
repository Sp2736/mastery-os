import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getUserResources, type UserResources } from '@/lib/storage/readJson';
import { writeUserJson } from '@/lib/storage/writeJson';
import { z } from 'zod';

const patchResourceSchema = z.object({
  id: z.string(),
  completed: z.boolean().optional(),
  bookmarked: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
});

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resources = getUserResources(session.userId);
  return NextResponse.json(resources);
}

export async function PATCH(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = patchResourceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const data: UserResources = getUserResources(session.userId);
  const index = data.resources.findIndex((r) => r.id === parsed.data.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  data.resources[index] = {
    ...data.resources[index],
    ...parsed.data,
  };

  await writeUserJson(session.userId, 'resources.json', data);
  return NextResponse.json({ success: true, resource: data.resources[index] });
}

