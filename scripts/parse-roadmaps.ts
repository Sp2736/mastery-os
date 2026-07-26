import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const SOURCES_DIR = path.join(DATA_DIR, 'roadmap-sources');
const ROADMAPS_DIR = path.join(DATA_DIR, 'roadmaps');

function sha1(input: string): string {
  return crypto.createHash('sha1').update(input).digest('hex');
}

function stableNodeId(roadmapId: string, phaseTitle: string, weekTitle: string, rawLine: string): string {
  return 'node-' + sha1(roadmapId + phaseTitle + weekTitle + rawLine).slice(0, 10);
}

interface RoadmapNode {
  id: string;
  title: string;
  track: string;
  type: 'task' | 'checkpoint' | 'contest' | 'review';
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dependencies: string[];
  resources: string[];
  checkpoint: boolean;
  dayNumber?: number;
}

interface RoadmapWeek {
  id: string;
  title: string;
  tracks: string[];
  nodes: RoadmapNode[];
}

interface RoadmapPhase {
  id: string;
  title: string;
  weeks: RoadmapWeek[];
}

interface Roadmap {
  id: string;
  title: string;
  sourceFile: string;
  parsedAt: string;
  phases: RoadmapPhase[];
  tracks: string[];
  totalNodes: number;
  description: string;
  durationWeeks: number;
  color: string;
}

// ─── 6-Month Mastery Roadmap Parser ───────────────────────────────────────────

function parse6MonthRoadmap(content: string): Roadmap {
  const roadmapId = '6month-mastery';
  const phases: RoadmapPhase[] = [];
  const allTracks = new Set<string>();

  const phaseDefinitions = [
    {
      id: 'phase-0', title: 'Phase 0: Language Mastery Foundations',
      weeks: [
        { num: 1, title: 'Week 1 — C++ STL Mastery', track: 'DSA' },
        { num: 2, title: 'Week 2 — Java Collections', track: 'DSA' },
        { num: 3, title: 'Week 3 — Python DSA Idioms', track: 'DSA' },
      ]
    },
    {
      id: 'phase-1', title: 'Phase 1: DSA Patterns',
      weeks: [
        { num: 4, title: 'Week 4 — Arrays, Strings, Two Pointers, Sliding Window', track: 'DSA' },
        { num: 5, title: 'Week 5 — Linked Lists, Stacks, Queues', track: 'DSA' },
        { num: 6, title: 'Week 6 — Binary Search + Trees', track: 'DSA' },
        { num: 7, title: 'Week 7 — Graphs Part 1', track: 'DSA' },
        { num: 8, title: 'Week 8 — Graphs Part 2', track: 'DSA' },
        { num: 9, title: 'Week 9 — Heaps, Greedy, Intervals', track: 'DSA' },
      ]
    },
    {
      id: 'phase-2', title: 'Phase 2: Dynamic Programming',
      weeks: [
        { num: 10, title: 'Week 10 — 1D DP', track: 'DSA' },
        { num: 11, title: 'Week 11 — 2D DP', track: 'DSA' },
        { num: 12, title: 'Week 12 — String DP', track: 'DSA' },
        { num: 13, title: 'Week 13 — DP on Trees + Review', track: 'DSA' },
      ]
    },
    {
      id: 'phase-3', title: 'Phase 3: Advanced Topics',
      weeks: [
        { num: 14, title: 'Week 14 — Backtracking', track: 'DSA' },
        { num: 15, title: 'Week 15 — Bit Manipulation', track: 'DSA' },
        { num: 16, title: 'Week 16 — Number Theory', track: 'DSA' },
        { num: 17, title: 'Week 17 — Segment Trees / Fenwick', track: 'DSA' },
      ]
    },
    {
      id: 'phase-4', title: 'Phase 4: Volume & Mixed Practice',
      weeks: [
        { num: 18, title: 'Week 18 — Mixed Practice I', track: 'CP' },
        { num: 19, title: 'Week 19 — Mixed Practice II', track: 'CP' },
        { num: 20, title: 'Week 20 — Timed Mocks I', track: 'CP' },
        { num: 21, title: 'Week 21 — Timed Mocks II', track: 'CP' },
      ]
    },
    {
      id: 'phase-5', title: 'Phase 5: Polish & System Design',
      weeks: [
        { num: 22, title: 'Week 22 — System Design Fundamentals', track: 'General' },
        { num: 23, title: 'Week 23 — Portfolio Integration', track: 'General' },
        { num: 24, title: 'Week 24 — Final Mock + Review', track: 'General' },
      ]
    },
  ];

  // Business/Finance parallel track — one entry per month
  const businessMonths: Record<number, { title: string; track: string; book: string }> = {
    1: { title: 'Money Psychology & Personal Finance', track: 'Business', book: 'The Psychology of Money' },
    2: { title: 'How Businesses Actually Work', track: 'Business', book: 'The Personal MBA' },
    3: { title: 'Markets, Investing & the Workflow of Money', track: 'Finance', book: 'Rich Dad Poor Dad' },
    4: { title: 'Entrepreneurship & Building Things That Matter', track: 'Entrepreneurship', book: 'Zero to One' },
    5: { title: 'Critical Thinking & Mental Models', track: 'Critical Thinking', book: 'Poor Charlie\'s Almanack' },
    6: { title: 'Career Capital, Negotiation & Personal Branding', track: 'General', book: 'So Good They Can\'t Ignore You' },
  };

  const dsaTasks: Record<string, string[]> = {
    'Week 1 — C++ STL Mastery': [
      'vector, pair, array, basic I/O speedups',
      'set, multiset, unordered_set — ordering guarantees',
      'map, multimap, unordered_map — iteration, custom comparators',
      'stack, queue, deque, priority_queue',
      'Iterators, algorithm header — sort, lower_bound, upper_bound',
      'Write your own STL snippets cheat sheet',
      'Pairs/tuples, emplace_back vs push_back, pass-by-reference',
    ],
    'Week 2 — Java Collections': [
      'Collection hierarchy: List, Set, Map, Queue',
      'ArrayList vs LinkedList, HashSet vs TreeSet',
      'HashMap vs TreeMap vs LinkedHashMap, custom equals/hashCode',
      'PriorityQueue, Deque/ArrayDeque, Collections utility',
      'Generics fundamentals: <T>, bounded types, wildcards',
      'Comparable vs Comparator, lambda-based sorting',
      'Build your Java STL-equivalent cheat sheet',
    ],
    'Week 3 — Python DSA Idioms': [
      'list, dict, set, tuple — comprehensions, Counter, defaultdict',
      'heapq (min-heap), bisect for binary search',
      'deque from collections, string manipulation idioms',
      'itertools: permutations, combinations, product',
      'Big-O refresher across all 3 languages',
      'Contest #1: Codeforces Div 4',
      'Checkpoint: solve same 5 problems in all 3 languages',
    ],
    'Week 4 — Arrays, Strings, Two Pointers, Sliding Window': [
      'Fixed/variable sliding window patterns — 5 problems',
      'Prefix sum + hashmap for subarray problems — 5 problems',
      'Two-pointer convergence technique — 5 problems',
      'Arrays & Hashing NeetCode section — 5 problems',
      'Sliding Window NeetCode section — 5 problems',
      'Weekend CF contest — Div 3/4',
      'Revisit 5 old problems cold (no notes)',
    ],
    'Week 5 — Linked Lists, Stacks, Queues': [
      'Fast/slow pointers: cycle detection, middle-finding',
      'In-place linked list reversal — 3 problems',
      'Monotonic stack: next greater element family — 4 problems',
      'Stack-based problems — 4 problems',
      'Queue simulation problems — 3 problems',
      'Weekend CF contest',
      'Review: Laaksonen Ch 1–2',
    ],
    'Week 6 — Binary Search + Trees': [
      'Binary search on sorted arrays — 4 problems',
      'Binary search on answer space — 4 problems',
      'Tree traversals: recursive + iterative — 4 problems',
      'BST properties and operations — 4 problems',
      'Tree BFS/DFS — 4 problems',
      'Weekend CF contest',
      'Review session: binary search edge cases',
    ],
    'Week 7 — Graphs Part 1': [
      'BFS on graphs — 4 problems',
      'DFS on graphs — 4 problems',
      'Connected components — 3 problems',
      'Grid-as-graph problems — 4 problems',
      'Cycle detection — 3 problems',
      'Weekend CF contest',
      'Review: graph representation choices',
    ],
    'Week 8 — Graphs Part 2': [
      'Topological sort: Kahn\'s algorithm — 3 problems',
      'DFS-based topological sort — 2 problems',
      'Union-Find/DSU — 4 problems',
      'Dijkstra\'s shortest path — 3 problems',
      'Minimum spanning tree: Kruskal/Prim — 2 problems',
      'Weekend CF contest',
      'Review: Laaksonen Ch 12–15',
    ],
    'Week 9 — Heaps, Greedy, Intervals': [
      'Top-K problems with heaps — 4 problems',
      'Merge intervals pattern — 3 problems',
      'Greedy proof-of-correctness exercises — 3 problems',
      'Task scheduling problems — 3 problems',
      'Meeting rooms / interval overlap — 3 problems',
      'Weekend CF contest',
      'Review: greedy vs DP decision criteria',
    ],
    'Week 10 — 1D DP': [
      'Climbing stairs, house robber patterns — 4 problems',
      'Coin change variations — 3 problems',
      'LIS: O(n²) solution — 2 problems',
      'LIS: O(n log n) solution — 2 problems',
      'DP recurrence relation writing practice',
      'Memoization → tabulation conversion exercise',
      'Review: state definition discipline',
    ],
    'Week 11 — 2D DP': [
      'Unique paths grid DP — 3 problems',
      '0/1 Knapsack — 3 problems',
      'Unbounded knapsack — 2 problems',
      'Grid with obstacles DP — 3 problems',
      'Target sum DP — 2 problems',
      'Weekend contest',
      'Review: 2D state visualization',
    ],
    'Week 12 — String DP': [
      'Longest Common Subsequence — 2 problems',
      'Edit Distance — 2 problems',
      'Palindrome partitioning — 3 problems',
      'Wildcard matching — 2 problems',
      'Regex matching — 2 problems',
      'Weekend contest',
      'Review: string DP patterns',
    ],
    'Week 13 — DP on Trees + Review': [
      'DP on trees: diameter, longest path — 3 problems',
      'Interval DP: matrix chain multiplication style — 2 problems',
      'Review week: redo hardest problems from Weeks 10–12',
      'Mixed DP problem set — 4 problems',
      'DP contest: Codeforces DP problemset',
      'Weekend contest',
      'Phase 2 checkpoint: full mock',
    ],
    'Week 14 — Backtracking': [
      'Subsets generation — 2 problems',
      'Permutations — 2 problems',
      'N-Queens — 1 problem',
      'Sudoku-style constraint problems — 2 problems',
      'Word search / letter combinations — 2 problems',
      'Weekend contest',
      'Review: pruning strategies',
    ],
    'Week 15 — Bit Manipulation': [
      'XOR tricks and properties — 4 problems',
      'Bitmasking for subset DP — 3 problems',
      'popcount / bit counting tricks — 2 problems',
      'Laaksonen Ch 10 exercises',
      'Bit manipulation contest problems — 3 problems',
      'Weekend contest',
      'Review: bitmask DP template',
    ],
    'Week 16 — Number Theory': [
      'GCD/LCM implementations — 2 problems',
      'Sieve of Eratosthenes — 2 problems',
      'Modular arithmetic problems — 3 problems',
      'Fast exponentiation — 2 problems',
      'Laaksonen Ch 21–24 exercises',
      'Weekend contest',
      'Review: modular inverse',
    ],
    'Week 17 — Segment Trees / Fenwick': [
      'Fenwick tree point update, range query — 2 problems',
      'Segment tree range queries — 2 problems',
      'Segment tree with lazy propagation — 1 problem',
      'CP-Algorithms.com segment tree chapter',
      'Range query contest problems — 3 problems',
      'Weekend contest: Div 2 attempt',
      'Review: when to use BIT vs segment tree',
    ],
    'Week 18 — Mixed Practice I': [
      'Randomized mixed problem — day 1 (30-35 min timed)',
      'Randomized mixed problem — day 2',
      'Randomized mixed problem — day 3',
      'Randomized mixed problem — day 4',
      'Randomized mixed problem — day 5',
      'Full mock interview: narrate thought process',
      'Retro: identify weakest pattern category',
    ],
    'Week 19 — Mixed Practice II': [
      'Timed problem day 1',
      'Timed problem day 2',
      'Timed problem day 3',
      'Timed problem day 4',
      'Timed problem day 5',
      'Mock interview + Codeforces Div 2',
      'Retro: velocity check',
    ],
    'Week 20 — Timed Mocks I': [
      'Timed mock set 1',
      'Timed mock set 2',
      'Timed mock set 3',
      'Timed mock set 4',
      'Timed mock set 5',
      'Full 2-hour mock contest (4 problems)',
      'Review: narration quality analysis',
    ],
    'Week 21 — Timed Mocks II': [
      'Timed mock set 1',
      'Timed mock set 2',
      'Timed mock set 3',
      'Timed mock set 4',
      'Timed mock set 5',
      'Full 2-hour mock contest',
      'Phase 4 retrospective',
    ],
    'Week 22 — System Design Fundamentals': [
      'Read: System Design Primer — Scalability section',
      'Read: System Design Primer — Load balancing',
      'Read: System Design Primer — Databases & Caching',
      'Narrate SmartBI project using SD framework',
      'Narrate FinIQ project using SD framework',
      'Practice: system design mock interview',
      'Review: tradeoffs vocabulary',
    ],
    'Week 23 — Portfolio Integration': [
      'Add Codeforces profile to resume',
      'Add LeetCode profile to resume',
      'Write 3 project STAR stories',
      'Update GitHub portfolio README',
      'Draft elevator pitch (60 seconds)',
      'CF Div 2 contest',
      'Review: personal brand statement',
    ],
    'Week 24 — Final Mock + Review': [
      'Full mock: 2 hours, 4 problems, no notes',
      'Review all pattern templates',
      'Final retrospective — 6-month synthesis',
      'Update resume with track B insights',
      'Write \"who I am and what I\'ve built\" pitch',
      'Final CF Div 2 contest',
      'Celebrate: 6-month checkpoint',
    ],
  };

  const weekToMonth: Record<number, number> = {
    1: 1, 2: 1, 3: 1, 4: 1,
    5: 2, 6: 2, 7: 2, 8: 2,
    9: 3, 10: 3, 11: 3, 12: 3,
    13: 4, 14: 4, 15: 4, 16: 4,
    17: 5, 18: 5, 19: 5, 20: 5,
    21: 6, 22: 6, 23: 6, 24: 6,
  };

  for (const phaseDef of phaseDefinitions) {
    const phase: RoadmapPhase = { id: phaseDef.id, title: phaseDef.title, weeks: [] };

    for (const weekDef of phaseDef.weeks) {
      const weekTitle = weekDef.title;
      const month = weekToMonth[weekDef.num] || 1;
      const businessData = businessMonths[month];

      const nodes: RoadmapNode[] = [];
      const tasks = dsaTasks[weekTitle] || Array.from({ length: 7 }, (_, i) => `Day ${weekDef.num * 7 - 6 + i}: Study session`);
      const trackName = weekDef.track;
      allTracks.add(trackName);

      tasks.forEach((task, i) => {
        const isContest = task.toLowerCase().includes('contest');
        const isReview = task.toLowerCase().includes('review') || task.toLowerCase().includes('retro');
        const type = isContest ? 'contest' : isReview ? 'review' : 'task';
        const difficulty = i > 4 ? 'hard' : i > 2 ? 'medium' : 'easy';

        nodes.push({
          id: stableNodeId(roadmapId, phaseDef.title, weekTitle, task),
          title: task,
          track: trackName,
          type,
          estimatedMinutes: isContest ? 120 : isReview ? 30 : 45,
          difficulty,
          dependencies: [],
          resources: [],
          checkpoint: isReview && i === 6,
        });
      });

      // Add parallel Business/Finance track node for Sunday
      if (businessData) {
        allTracks.add(businessData.track);
        nodes.push({
          id: stableNodeId(roadmapId, phaseDef.title, weekTitle, `Business:${businessData.title}`),
          title: `${businessData.track}: ${businessData.title}`,
          track: businessData.track,
          type: 'task',
          estimatedMinutes: 30,
          difficulty: 'easy',
          dependencies: [],
          resources: [businessData.book],
          checkpoint: false,
        });
      }

      const tracks = Array.from(new Set(nodes.map(n => n.track)));
      phase.weeks.push({
        id: `week-${weekDef.num}`,
        title: weekTitle,
        tracks,
        nodes,
      });
    }

    phases.push(phase);
  }

  const totalNodes = phases.reduce((p, ph) =>
    p + ph.weeks.reduce((q, w) => q + w.nodes.length, 0), 0);

  return {
    id: roadmapId,
    title: '6-Month Mastery Roadmap',
    description: 'DSA/CP mastery + Business, Finance & Critical Thinking — 24 weeks, 2 tracks in parallel',
    sourceFile: 'Swayam_6Month_Mastery_Roadmap.md',
    parsedAt: new Date().toISOString(),
    durationWeeks: 24,
    color: '#f59e0b',
    phases,
    tracks: Array.from(allTracks),
    totalNodes,
  };
}

// ─── 8-Week Web Dev Roadmap Parser ────────────────────────────────────────────

function parseWebDevRoadmap(_content: string): Roadmap {
  const roadmapId = 'webdev-8week';
  const allTracks = new Set<string>();

  const weekData = [
    {
      num: 1, title: 'Week 1 — JS Fundamentals', track: 'JS Fundamentals',
      days: [
        'Day 1: Array methods — write map, filter, reduce from scratch',
        'Day 2: Destructuring + spread/rest — rewrite 5 functions',
        'Day 3: Promises vs async/await — 3 different fetch approaches',
        'Day 4: Closures — counter factory function + explanation',
        'Day 5: this, arrow functions vs regular functions — 3 examples',
        'Day 6: Review — redo Day 1 and Day 3 from memory',
        'Day 7: Rest / light review of anything shaky',
      ]
    },
    {
      num: 2, title: 'Week 2 — React Core', track: 'React Core',
      days: [
        'Day 8: useState — build a counter + toggle component from blank',
        'Day 9: useEffect — fetch data on mount, handle loading/error',
        'Day 10: Props vs state — parent passing data + callback to child',
        'Day 11: Lists and keys — todo list (add/remove) from scratch',
        'Day 12: Forms — controlled form with 3 inputs + submit validation',
        'Day 13: Component composition — refactor todo into 3 components',
        'Day 14: Rebuild the todo list entirely from memory, timed',
      ]
    },
    {
      num: 3, title: 'Week 3 — Next.js Fundamentals', track: 'Next.js Fundamentals',
      days: [
        'Day 15: File-based routing — create about and blog pages manually',
        'Day 16: Dynamic routes — build blog/[slug]/page.tsx, log param',
        'Day 17: Layouts — shared layout.tsx with nav across routes',
        'Day 18: Server vs Client Components — write one of each, explain why',
        'Day 19: Data fetching in Server Components — fetch public API',
        'Day 20: Loading and error states — add loading.tsx and error.tsx',
        'Day 21: Review — rebuild Day 16 + Day 19 from a blank folder',
      ]
    },
    {
      num: 4, title: 'Week 4 — Next.js Data & Routes', track: 'Next.js Data & Routes',
      days: [
        'Day 22: Route handlers — GET handler returning mock data',
        'Day 23: POST handler — accept body, validate it, return response',
        'Day 24: Dynamic API routes — GET/DELETE for individual resource',
        'Day 25: Connect page to your own API route in Server Component',
        'Day 26: Client-side interactivity — delete button calling DELETE route',
        'Day 27: Environment variables + .env.local in route handler',
        'Day 28: Build tiny notes app end-to-end from scratch',
      ]
    },
    {
      num: 5, title: 'Week 5 — NestJS Core', track: 'NestJS Core',
      days: [
        'Day 29: Install Nest CLI, trace main.ts → AppModule by hand',
        'Day 30: Modules — create NotesModule manually (no CLI generator)',
        'Day 31: Controllers — write NotesController with GET endpoint',
        'Day 32: Providers/Services — NotesService, inject into controller',
        'Day 33: Explain Dependency Injection out loud / in writing',
        'Day 34: POST endpoint — add create method to service + controller',
        'Day 35: Review — rebuild Notes module from blank files',
      ]
    },
    {
      num: 6, title: 'Week 6 — NestJS + Database', track: 'NestJS Advanced',
      days: [
        'Day 36: DTOs — CreateNoteDto with class-validator decorators',
        'Day 37: Enable validation pipe globally, test bad input rejection',
        'Day 38: Learn Prisma (or TypeORM) — Note model, run migration',
        'Day 39: Wire NotesService to DB for GET (read all)',
        'Day 40: Wire POST (create) to the database',
        'Day 41: Add PATCH and DELETE endpoints backed by DB',
        'Day 42: Rebuild full CRUD resource from scratch, timed',
      ]
    },
    {
      num: 7, title: 'Week 7 — Integration', track: 'Integration',
      days: [
        'Day 43: Point Next.js fetch calls at NestJS API (CORS setup)',
        'Day 44: Basic auth — simple login endpoint in Nest (no JWT yet)',
        'Day 45: JWT — issue token on login, write auth service by hand',
        'Day 46: Protect route with auth guard — write the guard yourself',
        'Day 47: Frontend — store token, attach to authenticated requests',
        'Day 48: Protected page — redirect unauthenticated users',
        'Day 49: Review full auth flow end-to-end, explain without notes',
      ]
    },
    {
      num: 8, title: 'Week 8 — Solo Build', track: 'Solo Build',
      days: [
        'Day 50: Plan full-stack app — routes, data model, pages on paper',
        'Day 51: Build NestJS backend: module + controller + service skeleton',
        'Day 52: Backend: DB model + CRUD endpoints',
        'Day 53: Backend: auth (login + protected routes)',
        'Day 54: Frontend: pages + routing in Next.js',
        'Day 55: Frontend: connect to backend, forms, list views',
        'Day 56: Polish, fix bugs, final self-check — could you rebuild?',
      ]
    },
  ];

  const phases: RoadmapPhase[] = [
    { id: 'phase-1', title: 'Phase 1: Frontend Foundations (Weeks 1–4)', weeks: [] },
    { id: 'phase-2', title: 'Phase 2: Backend + Integration (Weeks 5–8)', weeks: [] },
  ];

  weekData.forEach((week) => {
    allTracks.add(week.track);
    const nodes: RoadmapNode[] = week.days.map((day, i) => {
      const isReview = day.toLowerCase().includes('review') || day.toLowerCase().includes('rebuild');
      return {
        id: stableNodeId(roadmapId, week.num <= 4 ? 'Phase 1' : 'Phase 2', week.title, day),
        title: day,
        track: week.track,
        type: isReview ? 'checkpoint' : 'task',
        estimatedMinutes: isReview ? 45 : 35,
        difficulty: i === 6 ? 'hard' : i > 3 ? 'medium' : 'easy',
        dependencies: i > 0 ? [stableNodeId(roadmapId, week.num <= 4 ? 'Phase 1' : 'Phase 2', week.title, week.days[i - 1])] : [],
        resources: [],
        checkpoint: isReview && i === 6,
        dayNumber: week.num * 7 - 6 + i,
      };
    });

    const phaseIdx = week.num <= 4 ? 0 : 1;
    phases[phaseIdx].weeks.push({
      id: `week-${week.num}`,
      title: week.title,
      tracks: [week.track],
      nodes,
    });
  });

  const totalNodes = phases.reduce((p, ph) =>
    p + ph.weeks.reduce((q, w) => q + w.nodes.length, 0), 0);

  return {
    id: roadmapId,
    title: '8-Week Web Dev Roadmap',
    description: 'Next.js + NestJS fundamentals — manual coding, no AI — 56 days',
    sourceFile: 'web-dev-roadmap.md',
    parsedAt: new Date().toISOString(),
    durationWeeks: 8,
    color: '#6366f1',
    phases,
    tracks: Array.from(allTracks),
    totalNodes,
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(ROADMAPS_DIR)) {
    fs.mkdirSync(ROADMAPS_DIR, { recursive: true });
  }

  const sourceFiles = fs.readdirSync(SOURCES_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${sourceFiles.length} roadmaps to parse.`);

  const manifest: { roadmaps: Array<{ id: string; title: string; file: string; color: string; durationWeeks: number; totalNodes: number }> } = {
    roadmaps: []
  };

  for (const file of sourceFiles) {
    const content = fs.readFileSync(path.join(SOURCES_DIR, file), 'utf-8');
    let roadmap: Roadmap;

    if (file.includes('6Month') || file.includes('Mastery')) {
      roadmap = parse6MonthRoadmap(content);
    } else if (file.includes('web-dev') || file.includes('webdev')) {
      roadmap = parseWebDevRoadmap(content);
    } else {
      console.warn(`Unrecognized roadmap: ${file}, skipping.`);
      continue;
    }

    const outPath = path.join(ROADMAPS_DIR, `${roadmap.id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(roadmap, null, 2), 'utf-8');
    console.log(`Parsed ${roadmap.id} successfully. Tracks: ${roadmap.tracks.join(', ')}. Total nodes: ${roadmap.totalNodes}`);

    manifest.roadmaps.push({
      id: roadmap.id,
      title: roadmap.title,
      file: `${roadmap.id}.json`,
      color: roadmap.color,
      durationWeeks: roadmap.durationWeeks,
      totalNodes: roadmap.totalNodes,
    });
  }

  fs.writeFileSync(path.join(ROADMAPS_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('Manifest written. Parsing complete.');
}

main().catch(console.error);
