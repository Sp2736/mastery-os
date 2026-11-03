'use client';

/**
 * Demo Mode — SessionStorage abstraction layer
 *
 * Replaces GitHub-commit writes with in-browser sessionStorage mutations.
 * Keys mirror the production filesystem paths so the data shape is identical.
 *
 * Key format: `demo:<relativePath>` e.g. `demo:users/demo_user/progress.json`
 */

export const DEMO_USER_ID = 'demo_user';

// ─── Low-level helpers ─────────────────────────────────────────────────────

function key(relativePath: string): string {
  return `demo:${relativePath}`;
}

export function sessionRead<T>(relativePath: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(key(relativePath));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function sessionWrite<T>(relativePath: string, data: T): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key(relativePath), JSON.stringify(data, null, 2));
  // Dispatch a custom event so any listener can react (e.g. Zustand stores)
  window.dispatchEvent(
    new CustomEvent('demo:storage-update', { detail: { path: relativePath } })
  );
}

export function sessionWriteBatch(files: Array<{ relativePath: string; data: unknown }>): void {
  if (typeof window === 'undefined') return;
  for (const f of files) {
    sessionStorage.setItem(key(f.relativePath), JSON.stringify(f.data, null, 2));
  }
  window.dispatchEvent(new CustomEvent('demo:storage-update', { detail: { batch: true } }));
}

// ─── Seed helper ───────────────────────────────────────────────────────────

/**
 * Seeds sessionStorage with the template data fetched from the static
 * /demo-seed/*.json files (served from /public/demo-seed/).
 * Only seeds keys that are not already present (idempotent).
 */
export async function seedDemoSession(): Promise<void> {
  if (typeof window === 'undefined') return;

  const FILES = [
    'profile',
    'progress',
    'journal',
    'retrospectives',
    'achievements',
    'settings',
    'sessions',
    'resources',
    'leetcode',
  ];

  await Promise.all(
    FILES.map(async (name) => {
      const path = `users/${DEMO_USER_ID}/${name}.json`;
      if (sessionStorage.getItem(key(path)) !== null) return; // already seeded

      try {
        const res = await fetch(`/demo-seed/${name}.json`);
        if (!res.ok) return;
        const data = await res.json();
        sessionStorage.setItem(key(path), JSON.stringify(data, null, 2));
      } catch {
        // silently skip — the API route will return a safe default
      }
    })
  );
}
