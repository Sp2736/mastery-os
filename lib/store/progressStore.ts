'use client';
import { create } from 'zustand';
import type { NodeProgress } from '@/lib/storage/readJson';

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
        xp: { total: newTotal, level: newLevel },
        lastLevelUp: newLevel > prevLevel ? newLevel : state.lastLevelUp,
      };
    }),

  setLastLevelUp: (level) => set({ lastLevelUp: level }),
}));
