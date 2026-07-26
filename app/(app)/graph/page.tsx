'use server';

import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllRoadmaps, getUserProgress } from '@/lib/storage/readJson';
import GraphClient from './GraphClient';

export default async function GraphPage() {
  const session = await verifySession();
  if (!session) redirect('/');

  const roadmaps = getAllRoadmaps();
  const progress = getUserProgress(session.userId);

  const rawNodes: Array<{
    id: string; data: { label: string; track: string; status: string; difficulty: string; roadmapId: string; dependencies: string[] };
    position: { x: number; y: number }; type: string;
  }> = [];

  const rawEdges: Array<{ id: string; source: string; target: string; animated: boolean }> = [];

  let currentRoadmapY = 0;

  for (const roadmap of roadmaps) {
    let globalWeekIndex = 0;
    let prevWeekId: string | null = null;
    let prevStatus = 'completed'; // for animation

    for (const phase of roadmap.phases) {
      for (const week of phase.weeks) {
        
        // determine week status
        let completedCount = 0;
        let inProgressCount = 0;
        
        for (const node of week.nodes) {
          const status = progress.nodes[node.id]?.status ?? 'pending';
          if (status === 'completed') completedCount++;
          if (status === 'in-progress') inProgressCount++;
        }
        
        let weekStatus = 'pending';
        if (week.nodes.length > 0 && completedCount === week.nodes.length) {
          weekStatus = 'completed';
        } else if (completedCount > 0 || inProgressCount > 0) {
          weekStatus = 'in-progress';
        }

        const weekId = `${roadmap.id}-${phase.id}-${week.id}`;
        
        const x = globalWeekIndex * 350;
        const y = currentRoadmapY;
        
        rawNodes.push({
          id: weekId,
          data: { 
            label: week.title,
            track: roadmap.title, // Use roadmap title as the track category
            status: weekStatus, 
            difficulty: 'medium', 
            roadmapId: roadmap.id,
            dependencies: prevWeekId ? [prevWeekId] : []
          },
          position: { x, y },
          type: 'custom',
        });

        if (prevWeekId) {
          rawEdges.push({
            id: `${prevWeekId}-${weekId}`,
            source: prevWeekId,
            target: weekId,
            animated: weekStatus === 'in-progress' || weekStatus === 'completed',
          });
        }

        prevWeekId = weekId;
        prevStatus = weekStatus;
        globalWeekIndex++;
      }
    }
    currentRoadmapY += 250; // Spacing between roadmaps
  }

  return <GraphClient initialNodes={rawNodes} initialEdges={rawEdges} />;
}

