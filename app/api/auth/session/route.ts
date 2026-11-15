import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSession, clearSession } from '@/lib/auth';
import { z } from 'zod';

// Sessions are only issued to someone who knows OWNER_ACCESS_KEY (set as an
// environment variable on the server — never committed to the repository).
const sessionSchema = z.object({
  userId: z.enum(['swayam']),
  accessKey: z.string().min(1).max(256),
});

const DENIED = { error: 'ACCESS DENIED' };

// Minimal per-instance throttle: 5 failed attempts per 15 minutes per client.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function clientKey(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function isThrottled(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry || Date.now() > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

function sha256(value: string): Buffer {
  return crypto.createHash('sha256').update(value).digest();
}

function accessKeyMatches(provided: string): boolean {
  const expected = process.env.OWNER_ACCESS_KEY;
  // Fail closed if the key is missing or weak.
  if (!expected || expected.length < 16) return false;
  // Hash both sides so lengths are equal, then compare in constant time.
  return crypto.timingSafeEqual(sha256(provided), sha256(expected));
}

export async function POST(req: Request) {
  const key = clientKey(req);
  if (isThrottled(key)) {
    return NextResponse.json(DENIED, { status: 429 });
  }

  try {
    const body = await req.json();
    const { userId, accessKey } = sessionSchema.parse(body);

    if (!accessKeyMatches(accessKey)) {
      recordFailure(key);
      return NextResponse.json(DENIED, { status: 401 });
    }

    attempts.delete(key);
    await createSession(userId);
    return NextResponse.json({ success: true, userId });
  } catch {
    recordFailure(key);
    return NextResponse.json(DENIED, { status: 401 });
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
