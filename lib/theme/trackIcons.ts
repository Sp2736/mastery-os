/**
 * Maps track names to Lucide icon names for consistent iconography.
 * Defined centrally so icon meaning never drifts per component.
 */

export const TRACK_ICONS: Record<string, string> = {
  'DSA': 'cpu',
  'CP': 'terminal',
  'General': 'book-open',
  'Business': 'briefcase',
  'Finance': 'trending-up',
  'Entrepreneurship': 'rocket',
  'Critical Thinking': 'brain',
  'Reading': 'book',
  'Contests': 'trophy',
  'Weekly Reviews': 'rotate-ccw',
  'Retrospectives': 'calendar',
  'JS Fundamentals': 'code-2',
  'React Core': 'layers',
  'Next.js Fundamentals': 'triangle',
  'Next.js Data & Routes': 'database',
  'NestJS Core': 'server',
  'NestJS Advanced': 'shield',
  'Integration': 'link',
  'Solo Build': 'star',
};

export function getTrackIcon(trackName: string): string {
  return TRACK_ICONS[trackName] ?? 'circle';
}
