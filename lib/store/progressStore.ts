'use client';
import { create } from 'zustand';
import type { NodeProgress } from '@/lib/storage/readJson';

export interface TaskItem {
  id: string;
  title: string;
  track: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  roadmapId: string;
  dependencies?: string[];
  dayNumber?: number;
  targetDate?: string;
  originalDate?: string;
  isRolledOver?: boolean;
  daysOverdue?: number;
}

interface ProgressState {
  nodes: Record<string, NodeProgress>;
  streak: { current: number; longest: number; lastActiveDate: string | null };
  xp: { total: number; level: number };
  masteryScore: number;
  completionByRoadmap: Array<{
    id: string; title: string; color: string; completion: number;
    completedNodes: number; totalNodes: number; predictedFinish: string;
  }>;
  isLoading: boolean;
  lastLevelUp: number | null; // level number if level-up just happened
  hydrate: (data: Partial<ProgressState>) => void;
  markNodeComplete: (nodeId: string, roadmapId: string, xpAwarded: number) => void;
  setLastLevelUp: (level: number | null) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  nodes: {},
  streak: { current: 0, longest: 0, lastActiveDate: null },
  xp: { total: 0, level: 1 },
  masteryScore: 0,
  completionByRoadmap: [],
  isLoading: true,
  lastLevelUp: null,

  hydrate: (data) => set((state) => ({ ...state, ...data, isLoading: false })),

  markNodeComplete: (nodeId, _roadmapId, xpAwarded) =>
    set((state) => {
      const prevLevel = state.xp.level;
      const newTotal = state.xp.total + xpAwarded;
      // Compute new level — mirrored from readJson.levelFromXP
      let newLevel = 1;
      while (Math.floor(100 * Math.pow(newLevel + 1, 1.5)) <= newTotal) newLevel++;

      // Compute streak update
      const today = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      let newStreak = { ...state.streak };
      if (state.streak.lastActiveDate !== today) {
        if (state.streak.lastActiveDate === yesterday) {
          const current = state.streak.current + 1;
          newStreak = {
            current,
            longest: Math.max(state.streak.longest, current),
            lastActiveDate: today,
          };
        } else {
          newStreak = {
            current: 1,
            longest: Math.max(state.streak.longest, 1),
            lastActiveDate: today,
          };
        }
      }

      return {
        nodes: {
          ...state.nodes,
          [nodeId]: {
            ...(state.nodes[nodeId] ?? {}),
            status: 'completed',
            completedAt: new Date().toISOString(),
            xpAwarded,
          } as NodeProgress,
        },
        streak: newStreak,
        xp: { total: newTotal, level: newLevel },
        lastLevelUp: newLevel > prevLevel ? newLevel : state.lastLevelUp,
      };
    }),

  setLastLevelUp: (level) => set({ lastLevelUp: level }),
}));

