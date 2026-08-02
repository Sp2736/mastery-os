import {
  getUserProgress,
  getUserProfile,
  getAllRoadmaps,
  Roadmap,
  UserProfile,
  UserProgress,
} from './readJson';
import { writeMultipleUserJson } from './writeJson';

export interface CalculatedTodayTask {
  id: string;
  title: string;
  track: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  roadmapId: string;
  dependencies?: string[];
  dayNumber?: number;
  targetDate?: string;
  originalDate?: string;
  isRolledOver?: boolean;
  daysOverdue?: number;
  status?: 'incomplete' | 'completed' | 'in-progress';
}

export interface DateShiftResult {
  todayTasks: CalculatedTodayTask[];
  hasShifts: boolean;
  shiftedCount: number;
}

/**
 * Computes today's tasks dynamically from roadmaps with overdue rollover and date cascading.
 */
export function calculateTodayTasks(
  profile: UserProfile,
  progress: UserProgress,
  roadmaps: Roadmap[],
  currentDateStr: string = new Date().toISOString().split('T')[0]
): DateShiftResult {
  const defaultStartDate = profile.roadmapStartDates?.['6month-mastery'] || '2026-07-26';
  const todayTasks: CalculatedTodayTask[] = [];
  let totalShifted = 0;

  for (const roadmap of roadmaps) {
    const roadmapStartDate = profile.roadmapStartDates?.[roadmap.id] || defaultStartDate;
    const startMs = new Date(roadmapStartDate).getTime();
    const todayOffset = Math.max(0, Math.floor((Date.now() - startMs) / 86_400_000));

    // Flatten all nodes in roadmap sequence
    const allNodes = roadmap.phases.flatMap((p) => p.weeks.flatMap((w) => w.nodes));

    let overdueCount = 0;
    const overdueTasks: CalculatedTodayTask[] = [];
    let currentTask: CalculatedTodayTask | null = null;

    allNodes.forEach((node, nodeIdx) => {
      const isCompleted = progress.nodes[node.id]?.status === 'completed';
      const originalDateObj = new Date(startMs + nodeIdx * 86_400_000);
      const originalDate = originalDateObj.toISOString().split('T')[0];

      if (nodeIdx < todayOffset) {
        if (!isCompleted) {
          overdueCount++;
          totalShifted++;
          const daysOverdue = todayOffset - nodeIdx;
          overdueTasks.push({
            ...node,
            roadmapId: roadmap.id,
            originalDate,
            targetDate: currentDateStr,
            isRolledOver: true,
            daysOverdue,
            status: 'incomplete',
          });
        }
      } else if (nodeIdx === todayOffset) {
        if (!isCompleted) {
          currentTask = {
            ...node,
            roadmapId: roadmap.id,
            originalDate,
            targetDate: currentDateStr,
            isRolledOver: false,
            daysOverdue: 0,
            status: 'incomplete',
          };
        }
      } else {
        // Cascade Effect: Future tasks target dates are offset by overdueCount days
        const cascadedDateObj = new Date(startMs + (nodeIdx + overdueCount) * 86_400_000);
        node.targetDate = cascadedDateObj.toISOString().split('T')[0];
      }
    });

    // Rolled-over tasks are placed first, followed by today's task
    todayTasks.push(...overdueTasks);
    if (currentTask) {
      todayTasks.push(currentTask);
    }
  }

  return {
    todayTasks,
    hasShifts: totalShifted > 0,
    shiftedCount: totalShifted,
  };
}

/**
 * Calculates date shifts and persists any shifted schedules or metadata in a SINGLE atomic commit.
 */
export async function syncAndPersistDateShifts(
  userId: string,
  currentDateStr: string = new Date().toISOString().split('T')[0]
): Promise<DateShiftResult> {
  const profile = getUserProfile(userId);
  const progress = getUserProgress(userId);
  const roadmaps = getAllRoadmaps();

  const result = calculateTodayTasks(profile, progress, roadmaps, currentDateStr);

  // If dates shifted and need persistence to progress or profile metadata
  if (result.hasShifts) {
    const now = new Date().toISOString();
    progress.lastUpdated = now;

    // Persist all shifted files atomically in a single commit
    await writeMultipleUserJson(
      userId,
      [
        { filename: 'progress.json', data: progress },
      ],
      `chore(schedule): dynamic date shift (${result.shiftedCount} tasks cascaded) — ${now}`
    );
  }

  return result;
}
