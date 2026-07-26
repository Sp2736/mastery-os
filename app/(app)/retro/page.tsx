'use server';

import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserRetrospectives, getUserProgress, getAllRoadmaps, getUserProfile, getUserSessions } from '@/lib/storage/readJson';
import { roadmapCompletion, predictFinishDate } from '@/lib/scoring/masteryScore';
import RetroClient from './RetroClient';

export default async function RetroPage() {
  const session = await verifySession();
  if (!session) redirect('/');

  const { userId } = session;
  const retros = getUserRetrospectives(userId);
  const progress = getUserProgress(userId);
  const profile = getUserProfile(userId);
  const roadmaps = getAllRoadmaps();
  const sessions = getUserSessions(userId);

  const startDate = profile.roadmapStartDates?.['6month-mastery'] || '2026-07-26';
  const weekNum = Math.floor(Math.max(0, (Date.now() - new Date(startDate).getTime()) / (7 * 86_400_000))) + 1;
  const weekSessions = sessions.sessions.slice(-7);

  const trackCompletion: Record<string, { done: number; total: number }> = {};
  for (const roadmap of roadmaps) {
    for (const phase of roadmap.phases) {
      for (const week of phase.weeks) {
        for (const node of week.nodes) {
          if (!trackCompletion[node.track]) trackCompletion[node.track] = { done: 0, total: 0 };
          trackCompletion[node.track].total++;
          if (progress.nodes[node.id]?.status === 'completed') trackCompletion[node.track].done++;
        }
      }
    }
  }

  const weakestTrack = Object.entries(trackCompletion)
    .filter(([, s]) => s.total > 0)
    .sort(([, a], [, b]) => (a.done / a.total) - (b.done / b.total))[0]?.[0] || 'General';

  const sixMonthRoadmap = roadmaps.find(r => r.id === '6month-mastery');
  const webdevRoadmap = roadmaps.find(r => r.id === 'webdev-8week');
  const daysSinceStart = Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / 86_400_000));
  const expectedCompletion = daysSinceStart / (24 * 7);
  const actualCompletion = sixMonthRoadmap ? roadmapCompletion(progress, sixMonthRoadmap) / 100 : 0;
  const paceStatus: 'ahead' | 'on-track' | 'behind' = actualCompletion >= expectedCompletion * 1.05 ? 'ahead'
    : actualCompletion >= expectedCompletion * 0.9 ? 'on-track' : 'behind';

  const prePopulated = {
    weekNumber: weekNum,
    weekStartDate: new Date(Date.now() - (new Date().getDay() * 86_400_000)).toISOString().split('T')[0],
    nodesCompletedThisWeek: weekSessions.flatMap(s => s.nodeIds).length,
    hoursStudied: Math.round(weekSessions.reduce((s, sess) => s + sess.durationMinutes / 60, 0) * 10) / 10,
    streakMaintained: progress.streak.current > 0,
    weakestTrack,
    paceStatus,
    predictedFinish6Month: sixMonthRoadmap ? predictFinishDate(progress, sixMonthRoadmap, startDate) : '',
    predictedFinishWebDev: webdevRoadmap ? predictFinishDate(progress, webdevRoadmap, profile.roadmapStartDates?.['webdev-8week'] || startDate) : '',
    trackCompletion: Object.fromEntries(
      Object.entries(trackCompletion).map(([k, v]) => [k, Math.round((v.done / Math.max(v.total, 1)) * 100)])
    ),
  };

  return <RetroClient entries={retros.entries} prePopulated={prePopulated} />;
}
