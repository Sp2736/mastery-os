import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface RoadmapNode {
  id: string;
  title: string;
  track: string;
  type: string;
  estimatedMinutes: number;
  difficulty: string;
  dependencies: string[];
  resources: string[];
  checkpoint: boolean;
}

export interface RoadmapWeek {
  id: string;
  title: string;
  tracks: string[];
  nodes: RoadmapNode[];
}

export interface RoadmapPhase {
  id: string;
  title: string;
  weeks: RoadmapWeek[];
}

export interface Roadmap {
  id: string;
  title: string;
  sourceFile: string;
  parsedAt: string;
  phases: RoadmapPhase[];
  tracks: string[];
}

function generateStableId(roadmapId: string, phaseTitle: string, weekTitle: string, rawLineText: string) {
  const hash = crypto.createHash('sha1');
  hash.update(roadmapId + phaseTitle + weekTitle + rawLineText);
  return 'node-' + hash.digest('hex').substring(0, 10);
}

export function parseRoadmapMarkdown(filename: string, content: string): Roadmap {
  const lines = content.split('\n');
  const roadmapId = path.basename(filename, '.md').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  let roadmapTitle = roadmapId;
  const phases: RoadmapPhase[] = [];
  const globalTracks = new Set<string>();
  
  let currentPhase: RoadmapPhase | null = null;
  let currentWeek: RoadmapWeek | null = null;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    if (line.startsWith('# ')) {
      roadmapTitle = line.substring(2).trim();
    } else if (line.startsWith('## ')) {
      currentPhase = {
        id: `phase-${phases.length + 1}`,
        title: line.substring(3).trim(),
        weeks: []
      };
      phases.push(currentPhase);
      currentWeek = null;
    } else if (line.startsWith('### ')) {
      if (!currentPhase) {
        currentPhase = { id: 'phase-1', title: 'Phase 1', weeks: [] };
        phases.push(currentPhase);
      }
      currentWeek = {
        id: `week-${currentPhase.weeks.length + 1}`,
        title: line.substring(4).trim(),
        tracks: [],
        nodes: []
      };
      currentPhase.weeks.push(currentWeek);
    } else if (line.startsWith('- ')) {
      if (!currentPhase || !currentWeek) continue;
      
      const rawText = line.substring(2).trim();
      const stableId = generateStableId(roadmapId, currentPhase.title, currentWeek.title, rawText);
      
      // Basic inference for dummy data
      let track = 'General';
      if (rawText.toLowerCase().includes('array') || rawText.toLowerCase().includes('linked list')) track = 'DSA';
      if (rawText.toLowerCase().includes('competitive')) track = 'CP';
      
      globalTracks.add(track);
      if (!currentWeek.tracks.includes(track)) currentWeek.tracks.push(track);
      
      const node: RoadmapNode = {
        id: stableId,
        title: rawText,
        track,
        type: 'task',
        estimatedMinutes: 45,
        difficulty: 'medium',
        dependencies: [],
        resources: [],
        checkpoint: false
      };
      
      currentWeek.nodes.push(node);
    }
  }
  
  return {
    id: roadmapId,
    title: roadmapTitle,
    sourceFile: filename,
    parsedAt: new Date().toISOString(),
    phases,
    tracks: Array.from(globalTracks)
  };
}
