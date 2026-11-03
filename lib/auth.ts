import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'fallback-secret-for-dev-only-please-change-it');

export interface SessionPayload {
  userId: string;
}

// ─── Demo mode ─────────────────────────────────────────────────────────────
// When NEXT_PUBLIC_DEMO_MODE=true all session operations are short-circuited:
// verifySession() always resolves to the demo user, and write operations in
// the API routes are intercepted client-side via the sessionStore layer.
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
export const DEMO_SESSION: SessionPayload = { userId: 'demo_user' };

export async function createSession(userId: string) {
  if (IS_DEMO) return; // no-op in demo
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set('mastery_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession(): Promise<SessionPayload | null> {
  // Demo mode — always return the demo user without touching cookies
  if (IS_DEMO) return DEMO_SESSION;

  const cookieStore = await cookies();
  const session = cookieStore.get('mastery_session')?.value;

  if (!session) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(session, SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function clearSession() {
  if (IS_DEMO) return; // no-op in demo
  const cookieStore = await cookies();
  cookieStore.delete('mastery_session');
}
