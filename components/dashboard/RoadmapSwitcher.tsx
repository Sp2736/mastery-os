'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/lib/store/uiStore';
import { easings } from '@/lib/motion/easings';

const OPTIONS = [
  { id: 'all', label: 'All Combined' },
  { id: '6month-mastery', label: '6-Month Mastery' },
  { id: 'webdev-8week', label: '8-Week Web Dev' },
] as const;

export default function RoadmapSwitcher() {
  const { selectedRoadmap, setSelectedRoadmap } = useUIStore();

  return (
    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setSelectedRoadmap(opt.id as any)}
          className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ color: selectedRoadmap === opt.id ? 'white' : 'rgba(255,255,255,0.5)' }}
        >
          {selectedRoadmap === opt.id && (
            <motion.div
              layoutId="roadmap-pill"
              className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
              transition={{ duration: 0.2, ease: easings.easeInOutCubic as any }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
