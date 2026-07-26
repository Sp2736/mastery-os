'use server';

import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  getUserProgress, getUserProfile, getAllRoadmaps, getUserSessions,
} from '@/lib/storage/readJson';
import { roadmapCompletion, predictFinishDate, computeMasteryScore } from '@/lib/scoring/masteryScore';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await verifySession();
  if (!session) redirect('/');

  const { userId } = session;
  const progress = getUserProgress(userId);
  const profile = getUserProfile(userId);
  const roadmaps = getAllRoadmaps();
  const sessions = getUserSessions(userId);

  // Build today's tasks from roadmap position
  const startDate = profile.roadmapStartDates?.['6month-mastery'] || '2026-07-26';
  const startDateWebDev = profile.roadmapStartDates?.['webdev-8week'] || '2026-07-26';
  const todayOffset6 = Math.floor((Date.now() - new Date(startDate).getTime()) / 86_400_000);
  const todayOffsetW = Math.floor((Date.now() - new Date(startDateWebDev).getTime()) / 86_400_000);

  const todayTasks: Array<{
    id: string; title: string; track: string; estimatedMinutes: number;
    difficulty: 'easy' | 'medium' | 'hard'; roadmapId: string; dependencies: string[];
  }> = [];

  for (const roadmap of roadmaps) {
    const offset = roadmap.id === '6month-mastery' ? todayOffset6 : todayOffsetW;
    const weekIdx = Math.floor(offset / 7);
    const dayIdx = offset % 7;

    let nodeIdx = 0;
    outer: for (const phase of roadmap.phases) {
      for (const week of phase.weeks) {
        for (const node of week.nodes) {
          if (nodeIdx === weekIdx * 7 + dayIdx) {
            if (progress.nodes[node.id]?.status !== 'completed') {
              todayTasks.push({ ...node, roadmapId: roadmap.id });
            }
            break outer;
          }
          nodeIdx++;
        }
      }
    }
  }

  // Stats
  const daysActive = new Set(sessions.sessions.map(s => s.date.split('T')[0])).size;
  const daysSinceStart = Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / 86_400_000));
  const masteryScore = computeMasteryScore(progress, roadmaps, daysSinceStart, daysActive);

  const completionByRoadmap = roadmaps.map(r => ({
    id: r.id,
    title: r.title,
    color: r.color,
    completion: roadmapCompletion(progress, r),
    completedNodes: r.phases.flatMap(p => p.weeks.flatMap(w => w.nodes)).filter(n => progress.nodes[n.id]?.status === 'completed').length,
    totalNodes: r.totalNodes,
    predictedFinish: predictFinishDate(progress, r, profile.roadmapStartDates?.[r.id] || startDate),
  }));

  // Track breakdown
  const trackStats: Record<string, { done: number; total: number; color: string; roadmapId: string }> = {};
  for (const roadmap of roadmaps) {
    for (const phase of roadmap.phases) {
      for (const week of phase.weeks) {
        for (const node of week.nodes) {
          if (!trackStats[node.track]) trackStats[node.track] = { done: 0, total: 0, color: '#f59e0b', roadmapId: roadmap.id };
          trackStats[node.track].total++;
          if (progress.nodes[node.id]?.status === 'completed') trackStats[node.track].done++;
        }
      }
    }
  }

  const blendedCompletion = completionByRoadmap.reduce((acc, r) => acc + r.completion * r.totalNodes, 0) /
    Math.max(completionByRoadmap.reduce((acc, r) => acc + r.totalNodes, 0), 1);

  return (
    <DashboardClient
      initialData={{
        userId,
        profile,
        progress: {
          nodes: progress.nodes,
          streak: progress.streak,
          xp: progress.xp,
        },
        masteryScore: masteryScore.total,
        completionByRoadmap,
        blendedCompletion,
        trackStats,
        todayTasks,
        completedNodeIds: new Set(Object.entries(progress.nodes).filter(([, v]) => v.status === 'completed').map(([k]) => k)),
      }}
    />
  );
}
