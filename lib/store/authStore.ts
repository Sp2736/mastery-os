'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  status: 'denied' | 'granted';
  userId: string | null;
  displayName: string | null;
  setGranted: (userId: string, displayName: string) => void;
  setDenied: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      status: 'denied',
      userId: null,
      displayName: null,
      setGranted: (userId, displayName) => set({ status: 'granted', userId, displayName }),
      setDenied: () => set({ status: 'denied', userId: null, displayName: null }),
    }),
    { name: 'mastery-auth' }
  )
);
