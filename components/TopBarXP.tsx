'use client';

import { useProgressStore } from '@/lib/store/progressStore';
import { Zap } from 'lucide-react';
import { useEffect } from 'react';
import LogoutButton from '@/components/LogoutButton';

interface TopBarXPProps {
  initialXP: number;
  initialLevel: number;
}

export default function TopBarXP({ initialXP, initialLevel }: TopBarXPProps) {
  const { xp, hydrate } = useProgressStore();

  // Sync initial values into store if not yet hydrated
  useEffect(() => {
    if (xp.total === 0 && initialXP > 0) {
      hydrate({ xp: { total: initialXP, level: initialLevel } });
    }
  }, []);

  const displayLevel = xp.level > 1 ? xp.level : initialLevel;
  const displayXP = xp.total > 0 ? xp.total : initialXP;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
        <Zap className="w-3.5 h-3.5" />
        <span className="text-sm font-bold font-mono">Lvl {displayLevel}</span>
        <span className="text-xs text-amber-500/60 font-mono">· {displayXP.toLocaleString()} XP</span>
      </div>
      <LogoutButton />
    </div>
  );
}
