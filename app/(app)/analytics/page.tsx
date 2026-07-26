'use server';

import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserProgress, getUserSessions, getUserJournal, getAllRoadmaps, getUserProfile } from '@/lib/storage/readJson';
import AnalyticsClient from './AnalyticsClient';

export default async function AnalyticsPage() {
  const session = await verifySession();
  if (!session) redirect('/');

  const { userId } = session;
  const progress = getUserProgress(userId);
  const sessions = getUserSessions(userId);
  const journal = getUserJournal(userId);
  const roadmaps = getAllRoadmaps();
  const profile = getUserProfile(userId);

  // Build 90-day heatmap
  const nodesByDate: Record<string, number> = {};
  for (const [, node] of Object.entries(progress.nodes)) {
    if (node.status === 'completed' && node.completedAt) {
      const date = node.completedAt.split('T')[0];
      nodesByDate[date] = (nodesByDate[date] || 0) + 1;
    }
  }

  // Build 30-day velocity (nodes per week)
  const weeklyVelocity: Record<string, number> = {};
  const startDate = profile.roadmapStartDates?.['6month-mastery'] || '2026-07-26';

  for (const [, node] of Object.entries(progress.nodes)) {
    if (node.status === 'completed' && node.completedAt) {
      const dayOffset = Math.floor((new Date(node.completedAt).getTime() - new Date(startDate).getTime()) / 86_400_000);
      const weekKey = `W${Math.floor(dayOffset / 7) + 1}`;
      weeklyVelocity[weekKey] = (weeklyVelocity[weekKey] || 0) + 1;
    }
  }

  // Track distribution
  const trackDist: Record<string, number> = {};
  const trackTotal: Record<string, number> = {};
  for (const roadmap of roadmaps) {
    for (const phase of roadmap.phases) {
      for (const week of phase.weeks) {
        for (const node of week.nodes) {
          trackTotal[node.track] = (trackTotal[node.track] || 0) + 1;
          if (progress.nodes[node.id]?.status === 'completed') {
            trackDist[node.track] = (trackDist[node.track] || 0) + 1;
          }
        }
      }
    }
  }

  // Journal mood/energy/focus over time
  const wellbeingTrend = journal.entries.slice(-30).map(e => ({
    date: e.date,
    mood: e.mood ?? 3,
    energy: e.energy ?? 3,
    focus: e.focus ?? 3,
    sleep: e.sleepHours ?? 7,
    nodes: (e.nodesCompletedToday ?? []).length,
  }));

  // Cumulative completion
  const sortedCompletions = Object.entries(nodesByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [date, count]) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      acc.push({ date, count, cumulative: prev + count });
      return acc;
    }, [] as Array<{ date: string; count: number; cumulative: number }>);

  const radarData = Object.entries(trackTotal).map(([track, total]) => ({
    track,
    completed: trackDist[track] || 0,
    total,
    percentage: Math.round(((trackDist[track] || 0) / total) * 100),
  }));

  return (
    <AnalyticsClient
      heatmapData={nodesByDate}
      velocityData={weeklyVelocity}
      wellbeingTrend={wellbeingTrend}
      cumulativeData={sortedCompletions}
      radarData={radarData}
      totalNodes={Object.keys(progress.nodes).length}
      totalHours={sessions.sessions.reduce((s, sess) => s + sess.durationMinutes / 60, 0)}
    />
  );
}
