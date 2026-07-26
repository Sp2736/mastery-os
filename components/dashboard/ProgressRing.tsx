'use client';

import { useEffect, useRef, useState } from 'react';
import { useProgressStore } from '@/lib/store/progressStore';
import { motion, AnimatePresence } from 'framer-motion';
import { easings } from '@/lib/motion/easings';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  percentage,
  size = 192,
  strokeWidth = 12,
  color = '#f59e0b',
  label,
  sublabel,
}: ProgressRingProps) {
  const [displayedPct, setDisplayedPct] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayedPct / 100) * circumference;

  // Count-up animation
  useEffect(() => {
    const target = Math.min(percentage, 100);
    const steps = 60;
    const duration = 1200;
    const stepTime = duration / steps;
    let step = 0;
    const id = setInterval(() => {
      step++;
      setDisplayedPct(Math.round(target * (step / steps)));
      if (step >= steps) clearInterval(id);
    }, stepTime);
    return () => clearInterval(id);
  }, [percentage]);

  // Parse color to derive glow rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const glowColor = `rgba(${r},${g},${b},0.35)`;
  const glowIntensity = 10 + (displayedPct / 100) * 20;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-700"
        style={{ boxShadow: `0 0 ${glowIntensity}px ${glowColor}` }}
      />
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`ring-grad-${color.slice(1)}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Progress arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#ring-grad-${color.slice(1)})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: easings.easeOutExpo }}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-bold tabular-nums"
          style={{ fontSize: size / 5, color }}
        >
          {displayedPct}%
        </span>
        {label && <span className="text-white/50 text-xs font-medium tracking-wider uppercase mt-1">{label}</span>}
        {sublabel && <span className="text-white/30 text-xs mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
