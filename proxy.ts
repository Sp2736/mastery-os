import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'fallback-secret-for-dev-only-please-change-it');

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exclude public static files and public API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/api/flex') ||
    pathname === '/api/auth/session' ||
    pathname.includes('.') // like favicon.ico, etc.
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get('mastery_session')?.value;

  if (!session) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (pathname === '/') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    const { payload } = await jwtVerify(session, SECRET);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.userId as string);

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.delete('mastery_session');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
