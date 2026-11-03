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

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // In demo mode the store is pre-seeded with the demo user identity
      status: IS_DEMO ? 'granted' : 'denied',
      userId: IS_DEMO ? 'demo_user' : null,
      displayName: IS_DEMO ? 'Demo User' : null,
      setGranted: (userId, displayName) => set({ status: 'granted', userId, displayName }),
      setDenied: () => set({ status: 'denied', userId: null, displayName: null }),
    }),
    { name: IS_DEMO ? 'mastery-auth-demo' : 'mastery-auth' }
  )
);
