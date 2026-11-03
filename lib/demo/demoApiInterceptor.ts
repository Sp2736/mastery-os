'use client';

/**
 * Demo Mode — Client-side API Interceptor
 *
 * Patches the global `fetch` to intercept mutating requests (POST/PATCH/DELETE)
 * to /api/user/* and apply the updates directly to sessionStorage instead of
 * letting them reach the server (which would be a no-op anyway in demo mode).
 *
 * Read requests (GET) are passed through to the Next.js API routes, which
 * serve data from the swayam template via the updated readJson.ts.
 *
 * The interceptor is installed once via <DemoBootstrap> in the app layout.
 */

import { sessionRead, sessionWrite, sessionWriteBatch, DEMO_USER_ID } from './sessionStore';
import type {
  UserProgress,
  UserJournal,
  UserRetrospectives,
  UserSessions,
  UserLeetCode,
  UserResources,
  UserProfile,
  UserSettings,
} from '@/lib/storage/readJson';

// ─── Lazy loaders — fetch template from server on first mutation ────────────

async function getOrSeedData<T>(filename: string, fallbackFetch: () => Promise<T>): Promise<T> {
  const cached = sessionRead<T>(`users/${DEMO_USER_ID}/${filename}`);
  if (cached) return cached;

  try {
    // Fetch the template from the server (reads swayam data via readJson fallback)
    const data = await fallbackFetch();
    sessionWrite(`users/${DEMO_USER_ID}/${filename}`, data);
    return data;
  } catch {
    throw new Error(`[demo] Failed to seed ${filename}`);
  }
}

// ─── Route handlers ─────────────────────────────────────────────────────────

async function handleProgressPatch(body: any): Promise<Response> {
  const progress = await getOrSeedData<UserProgress>('progress.json', async () => {
    const r = await originalFetch('/api/user/progress');
    const d = await r.json();
    return d; // GET /api/user/progress returns the full aggregated object; we need raw progress
  });

  const { nodeId, status, timeSpentMinutes = 0, confidence = 3, notes = '' } = body;
  const now = new Date().toISOString();

  // XP calculation: we do a best-effort lookup from the current progress xp state
  const existing = (progress as any).nodes?.[nodeId];
  const isNew = status === 'completed' && existing?.status !== 'completed';
  const xpAwarded = isNew ? 40 : 0; // sensible demo default

  (progress as any).nodes = (progress as any).nodes || {};
  (progress as any).nodes[nodeId] = {
    status,
    completedAt: status === 'completed' ? now : (existing?.completedAt ?? ''),
    timeSpentMinutes,
    xpAwarded,
    confidence,
    notes,
  };

  if (isNew) {
    (progress as any).xp = (progress as any).xp || { total: 0, level: 1 };
    (progress as any).xp.total += xpAwarded;
  }

  (progress as any).lastUpdated = now;
  sessionWrite(`users/${DEMO_USER_ID}/progress.json`, progress);

  return new Response(
    JSON.stringify({ success: true, xpAwarded, progress: (progress as any).nodes[nodeId] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleJournalPost(body: any): Promise<Response> {
  const journal = await getOrSeedData<UserJournal>('journal.json', async () => {
    const r = await originalFetch('/api/user/journal');
    const d = await r.json();
    return { userId: DEMO_USER_ID, entries: d.entries || [] };
  });

  const now = new Date().toISOString();
  const entry = { ...body, createdAt: now, updatedAt: now };
  const idx = journal.entries.findIndex((e) => e.date === entry.date);
  if (idx >= 0) journal.entries[idx] = { ...journal.entries[idx], ...entry, updatedAt: now };
  else journal.entries.push(entry);

  sessionWrite(`users/${DEMO_USER_ID}/journal.json`, journal);
  return new Response(JSON.stringify({ success: true, entry }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleRetroPost(body: any): Promise<Response> {
  const retros = await getOrSeedData<UserRetrospectives>('retrospectives.json', async () => {
    const r = await originalFetch('/api/user/retrospectives');
    const d = await r.json();
    return { userId: DEMO_USER_ID, entries: d.entries || [] };
  });

  const entry = {
    ...body,
    computed: {
      nodesCompleted: 0,
      hoursStudied: 0,
      streakMaintained: true,
      weakestTrack: 'General',
      paceStatus: 'on-track',
      predictedFinish6Month: '',
      predictedFinishWebDev: '',
    },
    createdAt: new Date().toISOString(),
  };

  const idx = retros.entries.findIndex((e) => e.weekStartDate === entry.weekStartDate);
  if (idx >= 0) retros.entries[idx] = entry;
  else retros.entries.push(entry);

  sessionWrite(`users/${DEMO_USER_ID}/retrospectives.json`, retros);
  return new Response(JSON.stringify({ success: true, entry }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleSessionPost(body: any): Promise<Response> {
  const sessions = await getOrSeedData<UserSessions>('sessions.json', async () => {
    const r = await originalFetch('/api/user/sessions');
    const d = await r.json();
    return { userId: DEMO_USER_ID, sessions: d.sessions || [] };
  });

  const newSession = { id: crypto.randomUUID(), ...body };
  sessions.sessions.push(newSession);
  sessionWrite(`users/${DEMO_USER_ID}/sessions.json`, sessions);

  return new Response(JSON.stringify({ success: true, session: newSession }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleLeetcodePatch(body: any): Promise<Response> {
  const leetcode = await getOrSeedData<UserLeetCode>('leetcode.json', async () => {
    const r = await originalFetch('/api/user/leetcode');
    return r.json();
  });

  const { skillId, problemId, completed } = body;
  const skillIdx = leetcode.skills.findIndex((s) => s.id === skillId);
  if (skillIdx === -1)
    return new Response(JSON.stringify({ error: 'Skill not found' }), { status: 404 });

  const probIdx = leetcode.skills[skillIdx].problems.findIndex((p) => p.id === problemId);
  if (probIdx === -1)
    return new Response(JSON.stringify({ error: 'Problem not found' }), { status: 404 });

  leetcode.skills[skillIdx].problems[probIdx].completed = completed;
  if (completed) leetcode.skills[skillIdx].problems[probIdx].completedAt = new Date().toISOString();
  else delete leetcode.skills[skillIdx].problems[probIdx].completedAt;

  sessionWrite(`users/${DEMO_USER_ID}/leetcode.json`, leetcode);
  return new Response(JSON.stringify({ success: true, leetcode }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleProfilePatch(body: any): Promise<Response> {
  const profile = await getOrSeedData<UserProfile>('profile.json', async () => {
    const r = await originalFetch('/api/user/profile');
    const d = await r.json();
    return d.profile;
  });

  const updated = { ...profile, ...body };
  sessionWrite(`users/${DEMO_USER_ID}/profile.json`, updated);
  return new Response(JSON.stringify({ success: true, profile: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleSettingsPatch(body: any): Promise<Response> {
  const settings = await getOrSeedData<UserSettings>('settings.json', async () => {
    const r = await originalFetch('/api/user/settings');
    return r.json();
  });

  const updated = { ...settings, ...body };
  sessionWrite(`users/${DEMO_USER_ID}/settings.json`, updated);
  return new Response(JSON.stringify({ success: true, settings: updated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleResourcesPatch(body: any): Promise<Response> {
  const resources = await getOrSeedData<UserResources>('resources.json', async () => {
    const r = await originalFetch('/api/user/resources');
    return r.json();
  });

  // Upsert by id
  const idx = resources.resources.findIndex((r: any) => r.id === body.id);
  if (idx >= 0) resources.resources[idx] = { ...resources.resources[idx], ...body };
  else resources.resources.push(body);

  sessionWrite(`users/${DEMO_USER_ID}/resources.json`, resources);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Interceptor install ────────────────────────────────────────────────────

let installed = false;
let originalFetch: typeof fetch;

export function installDemoFetchInterceptor() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  originalFetch = window.fetch.bind(window);

  window.fetch = async function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

    // Only intercept mutating calls to /api/user/* routes
    if (url.startsWith('/api/user/') && method !== 'GET') {
      let body: any = {};
      try {
        body = init?.body ? JSON.parse(init.body as string) : {};
      } catch {
        body = {};
      }

      if (url.includes('/api/user/progress') && method === 'PATCH') return handleProgressPatch(body);
      if (url.includes('/api/user/journal') && method === 'POST') return handleJournalPost(body);
      if (url.includes('/api/user/retrospectives') && method === 'POST') return handleRetroPost(body);
      if (url.includes('/api/user/sessions') && method === 'POST') return handleSessionPost(body);
      if (url.includes('/api/user/leetcode') && method === 'PATCH') return handleLeetcodePatch(body);
      if (url.includes('/api/user/profile') && method === 'PATCH') return handleProfilePatch(body);
      if (url.includes('/api/user/settings') && method === 'PATCH') return handleSettingsPatch(body);
      if (url.includes('/api/user/resources') && (method === 'PATCH' || method === 'POST')) return handleResourcesPatch(body);
    }

    return originalFetch(input, init);
  };
}
