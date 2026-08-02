'use client';
import { create } from 'zustand';

interface UIState {
  selectedRoadmap: 'all' | '6month-mastery' | 'webdev-8week';
  sidebarCollapsed: boolean;
  hasSeenSplash: boolean;
  setSelectedRoadmap: (id: UIState['selectedRoadmap']) => void;
  toggleSidebar: () => void;
  setHasSeenSplash: (seen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedRoadmap: 'all',
  sidebarCollapsed: false,
  hasSeenSplash: false,
  setSelectedRoadmap: (id) => set({ selectedRoadmap: id }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setHasSeenSplash: (seen) => set({ hasSeenSplash: seen }),
}));

