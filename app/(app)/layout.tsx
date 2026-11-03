import { ReactNode } from 'react';
import { verifySession } from '@/lib/auth';
import { getUserProgress } from '@/lib/storage/readJson';
import { redirect } from 'next/navigation';
import TopBarXP from '@/components/TopBarXP';
import SidebarNav from '@/components/SidebarNav';
import TopBarQuote from '@/components/TopBarQuote';
import { getDailyQuote } from '@/lib/quotes/getDailyQuote';

// Demo-only components — tree-shaken away in non-demo builds
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Lazy import: only evaluated in demo builds to keep the bundle clean
let DemoNotice: React.ComponentType | null = null;
let DemoBootstrap: React.ComponentType | null = null;
if (IS_DEMO) {
  // We use require() here to avoid Next.js static analysis hoisting the import
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DemoNotice = require('@/components/DemoNotice').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DemoBootstrap = require('@/components/DemoBootstrap').default;
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await verifySession();

  // In demo mode verifySession always returns the demo user, so this redirect
  // is never triggered. In production it guards all /(app) routes as before.
  if (!session || !session.userId) {
    redirect('/');
    return null;
  }

  const progress = getUserProgress(session.userId);
  const dailyQuote = getDailyQuote();

  return (
    <div className="flex h-screen bg-[#08090c] text-slate-300 font-sans">
      {/* Demo bootstrap (seeds sessionStorage + installs fetch interceptor) */}
      {IS_DEMO && DemoBootstrap && <DemoBootstrap />}

      {/* Demo notice banner */}
      {IS_DEMO && DemoNotice && <DemoNotice />}

      {/* Sidebar */}
      <SidebarNav userId={session.userId} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 bg-[#08090c]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0 gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <TopBarQuote quote={dailyQuote} />
          </div>
          <TopBarXP initialXP={progress.xp.total} initialLevel={progress.xp.level} />
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#08090c]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
