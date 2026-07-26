import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Compass, Edit3, RotateCcw, BarChart2, Network, Settings } from 'lucide-react';
import { verifySession } from '@/lib/auth';
import { getUserProgress } from '@/lib/storage/readJson';
import { redirect } from 'next/navigation';
import TopBarXP from '@/components/TopBarXP';
import SidebarNav from '@/components/SidebarNav';
import { getDailyQuote } from '@/lib/quotes/getDailyQuote';
import QuoteSplashScreen from '@/components/QuoteSplashScreen';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await verifySession();
  if (!session) redirect('/');

  const progress = getUserProgress(session.userId);
  const dailyQuote = getDailyQuote();

  return (
    <div className="flex h-screen bg-[#08090c] text-slate-300 font-sans">
      {/* Sidebar */}
      <SidebarNav userId={session.userId} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 bg-[#08090c]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            {/* Daily motivational quote splash screen and topbar morph */}
            <QuoteSplashScreen quote={dailyQuote} />
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
