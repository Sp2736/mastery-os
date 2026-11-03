'use client';

import { useEffect } from 'react';
import { seedDemoSession } from '@/lib/demo/sessionStore';
import { installDemoFetchInterceptor } from '@/lib/demo/demoApiInterceptor';

/**
 * Invisible component that:
 * 1. Seeds sessionStorage with the demo user data on first mount.
 * 2. Installs the client-side fetch interceptor that routes mutations to sessionStorage.
 *
 * Rendered only when NEXT_PUBLIC_DEMO_MODE=true.
 */
export default function DemoBootstrap() {
  useEffect(() => {
    installDemoFetchInterceptor();
    seedDemoSession();
  }, []);

  return null;
}
