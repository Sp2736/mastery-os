import AccessGate from '@/components/AccessGate';
import { getDailyQuote } from '@/lib/quotes/getDailyQuote';

export default function Home() {
  const dailyQuote = getDailyQuote();

  return (
    <main className="min-h-screen bg-[#08090c]">
      <AccessGate quote={dailyQuote} />
    </main>
  );
}
