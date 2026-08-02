import { Quote as QuoteIcon } from 'lucide-react';
import type { Quote } from '@/lib/quotes/getDailyQuote';

interface TopBarQuoteProps {
  quote: Quote;
}

export default function TopBarQuote({ quote }: TopBarQuoteProps) {
  return (
    <div
      className="hidden md:flex items-center gap-2.5 max-w-lg lg:max-w-xl truncate text-xs text-white/50 italic group cursor-default select-none"
      title={`"${quote.text}" — ${quote.author}`}
    >
      <QuoteIcon className="w-3.5 h-3.5 text-amber-500/70 shrink-0 not-italic" />
      <span className="truncate">&quot;{quote.text}&quot;</span>
      <span className="text-white/30 not-italic shrink-0 font-mono text-[11px]">— {quote.author}</span>
    </div>
  );
}
