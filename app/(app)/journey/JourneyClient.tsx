'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Zap, Flame, Crown, Shield, Rocket } from 'lucide-react';

const LUCIDE_ICONS: Record<string, React.ReactNode> = {
  'trophy': <Trophy className="w-5 h-5" />, 'star': <Star className="w-5 h-5" />,
  'zap': <Zap className="w-5 h-5" />, 'flame': <Flame className="w-5 h-5" />,
  'crown': <Crown className="w-5 h-5" />, 'shield': <Shield className="w-5 h-5" />,
  'rocket': <Rocket className="w-5 h-5" />,
};

const RARITY_STYLES = {
  common: { border: 'border-white/10', bg: 'bg-white/5', text: 'text-white/60', badge: 'text-white/50', glow: 'rgba(255,255,255,0.05)' },
  rare: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-300', badge: 'text-blue-400', glow: 'rgba(59,130,246,0.15)' },
  epic: { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-300', badge: 'text-purple-400', glow: 'rgba(139,92,246,0.2)' },
  legendary: { border: 'border-amber-500/40', bg: 'bg-amber-500/5', text: 'text-amber-300', badge: 'text-amber-400', glow: 'rgba(245,158,11,0.25)' },
};

function xpForLevel(n: number) { return Math.floor(100 * Math.pow(n, 1.5)); }

interface AchievementItem {
  id: string; title: string; description: string; category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  roadmapScope: string; icon: string; xpReward: number;
  hidden: boolean; unlocked: boolean; unlockedAt: string | null;
  criteria: Record<string, unknown>;
}

interface JourneyClientProps {
  xp: { total: number; level: number };
  streak: { current: number; longest: number; lastActiveDate: string | null };
  achievements: AchievementItem[];
  displayName: string;
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

export default function JourneyClient({ xp, streak, achievements, displayName }: JourneyClientProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'legendary' | 'epic'>('all');
  const [hovered, setHovered] = useState<string | null>(null);

  const nextLevelXP = xpForLevel(xp.level + 1);
  const currentLevelXP = xpForLevel(xp.level);
  const progress = ((xp.total - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const unlocked = achievements.filter(a => a.unlocked).length;
  const total = achievements.filter(a => !a.hidden || a.unlocked).length;

  const filtered = achievements
    .filter(a => !a.hidden || a.unlocked)
    .filter(a => {
      if (filter === 'unlocked') return a.unlocked;
      if (filter === 'locked') return !a.unlocked;
      if (filter === 'legendary') return a.rarity === 'legendary';
      if (filter === 'epic') return a.rarity === 'epic';
      return true;
    })
    .sort((a, b) => {
      // Unlocked first, then by rarity
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Journey</h2>
        <p className="text-white/40 text-sm mt-1">XP, levels, and your achievement hall of fame</p>
      </div>

      {/* Level card */}
      <div className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-8 border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-500/8 pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* XP Level display */}
          <div className="flex-shrink-0 text-center">
            <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-amber-500/40 mb-3"
              style={{ boxShadow: '0 0 30px rgba(245,158,11,0.2)' }}>
              <div className="text-4xl font-mono font-bold text-amber-400">{xp.level}</div>
            </div>
            <p className="text-xs text-white/40 uppercase tracking-widest">Level</p>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white/80">
                {displayName}
              </span>
              <span className="font-mono font-bold text-amber-400">{xp.total.toLocaleString()} XP</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 mb-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                style={{ boxShadow: '0 0 8px rgba(245,158,11,0.5)' }}
              />
            </div>
            <p className="text-xs text-white/30">
              {(xp.total - currentLevelXP).toLocaleString()} / {(nextLevelXP - currentLevelXP).toLocaleString()} XP to Level {xp.level + 1}
            </p>

            {/* Level milestones */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {[5, 10, 20, 30, 50].map(lvl => (
                <div
                  key={lvl}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    xp.level >= lvl
                      ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                      : 'bg-white/5 border border-white/5 text-white/30'
                  }`}
                >
                  {xp.level >= lvl ? <Star className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  Lv.{lvl}
                </div>
              ))}
            </div>
          </div>

          {/* Streak */}
          <div className="flex-shrink-0 text-center">
            <div className="text-4xl font-mono font-bold text-orange-400">{streak.current}</div>
            <p className="text-xs text-white/40 mt-1">Day streak</p>
            <p className="text-xs text-white/25 mt-0.5">Best: {streak.longest}</p>
          </div>
        </div>
      </div>

      {/* Achievement section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">Achievements</h3>
            <p className="text-sm text-white/40">{unlocked} / {total} unlocked</p>
          </div>
          <div className="flex gap-1">
            {(['all', 'unlocked', 'locked', 'epic', 'legendary'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                  filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-white/40 hover:text-white/60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          key={filter}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(ach => {
            const styles = RARITY_STYLES[ach.rarity];
            const isHidden = ach.hidden && !ach.unlocked;

            return (
              <motion.div
                key={ach.id}
                variants={item}
                className={`relative p-4 rounded-[16px] border transition-all group ${styles.border} ${styles.bg} ${!ach.unlocked ? 'opacity-60 hover:opacity-80' : ''}`}
                style={{ boxShadow: ach.unlocked ? `0 0 20px ${styles.glow}` : 'none' }}
                onMouseEnter={() => setHovered(ach.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {ach.unlocked && ach.rarity === 'legendary' && (
                  <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                )}
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${styles.border} ${styles.bg}`}>
                    {isHidden
                      ? <Lock className="w-5 h-5 text-white/20" />
                      : <span style={{ color: ach.unlocked ? (styles.text.replace('text-', '') === 'white/60' ? 'rgba(255,255,255,0.6)' : undefined) : 'rgba(255,255,255,0.3)' }} className={ach.unlocked ? styles.text : 'text-white/30'}>
                          {LUCIDE_ICONS[ach.icon] || <Trophy className="w-5 h-5" />}
                        </span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${ach.unlocked ? 'text-white' : 'text-white/50'}`}>
                        {isHidden ? '???' : ach.title}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium border ${styles.border} ${styles.badge} uppercase tracking-wide`}>
                        {ach.rarity.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                      {isHidden ? 'Keep going to discover this achievement.' : ach.description}
                    </p>
                    {!isHidden && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-amber-500 font-mono">+{ach.xpReward} XP</span>
                        {ach.unlocked && ach.unlockedAt && (
                          <span className="text-xs text-white/30">
                            · {new Date(ach.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
