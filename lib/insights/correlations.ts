import type { JournalEntry } from '@/lib/storage/readJson';

/**
 * Pearson correlation coefficient between two same-length arrays.
 * Returns a value in [-1, 1]. Returns 0 if not enough data.
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 3) return 0;
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((s, xi, i) => s + (xi - meanX) * (y[i] - meanY), 0);
  const denX = Math.sqrt(x.reduce((s, xi) => s + Math.pow(xi - meanX, 2), 0));
  const denY = Math.sqrt(y.reduce((s, yi) => s + Math.pow(yi - meanY, 2), 0));
  const den = denX * denY;
  return den === 0 ? 0 : Math.round((num / den) * 100) / 100;
}

export interface CorrelationInsights {
  moodProductivity: number;     // mood ↔ focus
  sleepEfficiency: number;      // sleep ↔ nodesCompleted
  energyFocus: number;          // energy ↔ focus
  consistencyVelocity: number;  // days active ↔ nodes per day
  summary: string[];            // human-readable insight strings
}

/**
 * Computes correlations from journal entries.
 * All stats are local — no external LLM calls. Every insight is data-backed.
 */
export function computeCorrelations(entries: JournalEntry[]): CorrelationInsights {
  if (entries.length < 3) {
    return {
      moodProductivity: 0,
      sleepEfficiency: 0,
      energyFocus: 0,
      consistencyVelocity: 0,
      summary: ['Log at least 3 daily reviews to see correlation insights.'],
    };
  }

  const mood = entries.map(e => e.mood ?? 3);
  const focus = entries.map(e => e.focus ?? 3);
  const sleep = entries.map(e => e.sleepHours ?? 7);
  const nodesPerDay = entries.map(e => (e.nodesCompletedToday ?? []).length);
  const energy = entries.map(e => e.energy ?? 3);

  const moodProductivity = pearsonCorrelation(mood, focus);
  const sleepEfficiency = pearsonCorrelation(sleep, nodesPerDay);
  const energyFocus = pearsonCorrelation(energy, focus);
  const consistencyVelocity = pearsonCorrelation(
    entries.map((_, i) => i + 1),
    nodesPerDay.reduce((acc, v, i) => { acc.push((acc[i - 1] ?? 0) + v); return acc; }, [] as number[]),
  );

  const summary: string[] = [];

  if (Math.abs(moodProductivity) > 0.4) {
    summary.push(moodProductivity > 0
      ? `Higher mood is correlated with better focus (r=${moodProductivity}). Protect your mental state.`
      : `Interestingly, lower mood days show higher focus (r=${moodProductivity}). You may work best under pressure.`
    );
  }

  if (Math.abs(sleepEfficiency) > 0.3) {
    summary.push(sleepEfficiency > 0
      ? `More sleep → more nodes completed (r=${sleepEfficiency}). Sleep is a performance lever.`
      : `Sleep duration doesn't strongly predict your daily output (r=${sleepEfficiency}).`
    );
  }

  if (Math.abs(energyFocus) > 0.4) {
    summary.push(energyFocus > 0
      ? `Your energy level is a strong predictor of focus (r=${energyFocus}). Log energy to plan study slots.`
      : `Energy and focus aren't closely linked for you (r=${energyFocus}). Focus may be more volitional than physical.`
    );
  }

  if (summary.length === 0) {
    summary.push('No strong correlations detected yet. Keep logging daily reviews for richer insights.');
  }

  return { moodProductivity, sleepEfficiency, energyFocus, consistencyVelocity, summary };
}

/** Moving average over a window */
export function movingAverage(data: number[], window: number): number[] {
  return data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}
