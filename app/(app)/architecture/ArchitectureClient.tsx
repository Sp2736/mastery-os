'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  GitCommit,
  Database,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileCode,
  HardDrive,
  Lock,
  ExternalLink,
  Sparkles,
  Terminal,
  Server,
  Zap,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';

interface ArchitectureClientProps {
  userId: string;
}

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Client Action & Dispatch',
    desc: 'User completes a roadmap node, solves a LeetCode problem, or submits a retrospective.',
    code: 'PATCH /api/user/progress { nodeId, status: "completed" }',
    icon: Terminal,
    color: 'amber',
  },
  {
    step: '02',
    title: 'HMAC Session Gate',
    desc: 'Route Handler verifies signed session cookie via SHA-256 HMAC. Path traversal check validates identity.',
    code: 'validateUserId(userId); // asserts userId === "swayam"',
    icon: Shield,
    color: 'emerald',
  },
  {
    step: '03',
    title: 'Fetch Current Branch Head',
    desc: 'Queries the GitHub REST Git Database API to get the latest commit SHA on the target branch (main).',
    code: 'octokit.rest.git.getRef({ owner, repo, ref: "heads/main" })',
    icon: GitBranch,
    color: 'blue',
  },
  {
    step: '04',
    title: 'Retrieve Base Git Tree',
    desc: 'Retrieves the root tree SHA of the current commit to establish immutable base ancestry.',
    code: 'octokit.rest.git.getCommit({ commit_sha: latestCommitSha })',
    icon: Layers,
    color: 'indigo',
  },
  {
    step: '05',
    title: 'Construct Git Tree with JSON Blobs',
    desc: 'Builds a tree array representing updated JSON files. Multiple files are bundled together for atomic batching.',
    code: 'octokit.rest.git.createTree({ base_tree, tree: [{ path, content }] })',
    icon: FileCode,
    color: 'purple',
  },
  {
    step: '06',
    title: 'Create Atomic Commit Object',
    desc: 'Creates a single commit pointing to the new tree, with the previous commit as parent and an automated changelog message.',
    code: 'octokit.rest.git.createCommit({ message, tree: newTree.sha, parents })',
    icon: GitCommit,
    color: 'pink',
  },
  {
    step: '07',
    title: 'Fast-Forward Branch Pointer',
    desc: 'Updates the ref pointer (heads/main) to the new commit. The commit is now permanently written and audit-trailed.',
    code: 'octokit.rest.git.updateRef({ ref: "heads/main", sha: newCommit.sha })',
    icon: CheckCircle2,
    color: 'emerald',
  },
];

export default function ArchitectureClient({ userId }: ArchitectureClientProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  return (
    <article className="max-w-4xl mx-auto space-y-12 pb-24 text-white">
      {/* ─── Hero Blog Header ─────────────────────────────────────────────── */}
      <header className="space-y-4 border-b border-white/10 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5" />
            ENGINEERING BLOG · SYSTEM DESIGN
          </span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-white/40 text-xs font-mono">6 MIN READ</span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-white/40 text-xs font-mono">ZERO-DATABASE ARCHITECTURE</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          How Mastery OS Persists Data Without Databases:
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 mt-1">
            The Git-As-A-Datastore Architecture
          </span>
        </h1>

        <p className="text-lg text-white/60 leading-relaxed max-w-3xl">
          A technical deep-dive into running a personal operating system entirely on flat JSON,
          atomic Git Trees via the GitHub REST API, and zero cloud database subscriptions.
        </p>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs text-white/40 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-bold font-sans text-xs">
              M
            </div>
            <div>
              <p className="text-white/80 font-sans font-medium">Mastery OS Core Team</p>
              <p className="text-[11px] text-white/40">Architectural Reference & Implementation Guide</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Next.js 15</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Octokit</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">Git Trees</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">SHA-256 HMAC</span>
          </div>
        </div>
      </header>

      {/* ─── Architectural Diagram (Embedded Image) ───────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-amber-400 w-5 h-5" />
            1. High-Level Architecture Overview
          </h2>
          <span className="text-xs text-white/40 font-mono">FIGURE 1.0</span>
        </div>

        <div className="relative group rounded-2xl overflow-hidden border border-amber-500/20 bg-[#0e1018] shadow-[0_0_50px_rgba(245,158,11,0.06)]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-transparent to-transparent opacity-60 z-10 pointer-events-none" />

          {/* Architecture diagram image from the provided URL */}
          <div className="p-4 sm:p-6 flex justify-center bg-[#090b10]">
            <img
              src="https://swayam-patel-v1.vercel.app/mastery-os.png"
              alt="Mastery OS System Architecture"
              className="rounded-xl w-full max-h-[500px] object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.01]"
              onClick={() => setIsZoomed(true)}
            />
          </div>

          <div className="p-4 bg-[#101319]/90 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white/50">
            <p>
              <strong className="text-white/80">Figure 1.0:</strong> Complete system dataflow across
              client interaction, HMAC gate, Edge handlers, and Octokit atomic commits to GitHub.
            </p>
            <a
              href="https://swayam-patel-v1.vercel.app/mastery-os.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 shrink-0 font-mono"
            >
              Open Full Resolution <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── The Philosophy: Why No Databases? ─────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="text-amber-400 w-6 h-6" />
          2. The Philosophy: Why Zero Databases?
        </h2>

        <div className="text-white/70 leading-relaxed space-y-4">
          <p>
            Modern web development assumes by default that any dynamic data application must be wired
            to a relational database (PostgreSQL, Supabase) or document store (MongoDB). While suitable
            for multi-tenant SaaS products with millions of concurrent writes, this pattern creates
            needless operational friction for personal productivity and learning operating systems:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/20 space-y-3">
              <h3 className="font-semibold text-red-400 flex items-center gap-2 text-sm">
                <span>✕</span> The Problem with Traditional DBs
              </h3>
              <ul className="text-xs text-white/50 space-y-2 list-disc pl-4 leading-relaxed font-mono">
                <li>Recurring monthly cloud infrastructure bills ($25+/mo tiers).</li>
                <li>Connection pool exhaustion during Vercel serverless cold starts.</li>
                <li>Breaking schema migrations requiring rollback scripts.</li>
                <li>Vendor lock-in and opaque proprietary backup snapshots.</li>
                <li>Inability to simply `git diff` or `git checkout` your personal history.</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-3">
              <h3 className="font-semibold text-emerald-400 flex items-center gap-2 text-sm">
                <span>✓</span> The Mastery OS Git Store Solution
              </h3>
              <ul className="text-xs text-white/50 space-y-2 list-disc pl-4 leading-relaxed font-mono">
                <li>Zero cloud costs — runs entirely on free private GitHub repositories.</li>
                <li>Every state mutation is a cryptographically signed Git commit.</li>
                <li>100% human-readable JSON files version-controlled with visual diffs.</li>
                <li>Instant local development with standard Node.js `fs` filesystem reads.</li>
                <li>Built-in disaster recovery — clone the repo anywhere and you have 100% of your data.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Git Tree Pipeline Flowchart ────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="text-amber-400 w-6 h-6" />
              3. The 6-Step Atomic Git Commit Pipeline
            </h2>
            <p className="text-sm text-white/50 mt-1">
              How `writeJson.ts` and `writeBatchJson.ts` commit directly to GitHub via the REST Git Database API.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400/80 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Interactive Flowchart
          </span>
        </div>

        {/* Visual Pipeline Navigator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl bg-[#0e1018] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {/* Step Selector */}
          <div className="lg:col-span-5 space-y-2">
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">
              Execution Sequence
            </p>
            {FLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;

              return (
                <button
                  key={step.step}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 border ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <span className={`font-mono text-xs font-bold ${isActive ? 'text-amber-400' : 'text-white/30'}`}>
                    {step.step}
                  </span>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-white/40'}`} />
                  <span className="text-xs font-medium truncate flex-1">{step.title}</span>
                  {isActive && <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Step Details & Code Inspection */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-xl bg-[#090b10] border border-white/5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Stage {FLOW_STEPS[activeStep].step} of 07
                </span>
                <span className="text-xs text-white/30 font-mono">writeBatchJson()</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {FLOW_STEPS[activeStep].title}
              </h3>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                {FLOW_STEPS[activeStep].desc}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-white/40 font-mono">
                <span>Code implementation snippet</span>
                <span>lib/storage/writeJson.ts</span>
              </div>
              <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-amber-300 font-mono text-xs overflow-x-auto leading-relaxed">
                <code>{FLOW_STEPS[activeStep].code}</code>
              </pre>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-white/40 border-t border-white/5">
              <span>Navigate pipeline stages above to inspect the full Git Tree lifecycle</span>
              <button
                onClick={() => setActiveStep((prev) => (prev + 1) % FLOW_STEPS.length)}
                className="text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 font-semibold"
              >
                Next Step <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Atomic Batch Commit Problem ──────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitCommit className="text-amber-400 w-6 h-6" />
          4. The Multi-File Race Condition Problem
        </h2>

        <div className="text-white/70 leading-relaxed space-y-4 text-sm">
          <p>
            The simplest way to update a file on GitHub is calling `createOrUpdateFileContents` via Octokit.
            However, complex user actions frequently require updating <strong>multiple JSON files at the exact same moment</strong>:
          </p>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs text-white/80 space-y-1">
            <p className="text-amber-400 font-bold">// Example: Solving a LeetCode problem</p>
            <p>1. Update <code className="text-white">users/swayam/leetcode.json</code> (mark problem completedAt)</p>
            <p>2. Update <code className="text-white">users/swayam/progress.json</code> (award +40 XP, advance streak)</p>
            <p>3. Update <code className="text-white">users/swayam/sessions.json</code> (record study duration)</p>
          </div>

          <p>
            If these 3 files are committed via 3 separate HTTP calls, a transient network error halfway through
            leaves user progress permanently desynchronized from solved problems. Furthermore, each individual commit
            triggers a separate GitHub webhook and Vercel build trigger!
          </p>

          <p>
            <strong>The Solution:</strong> `writeBatchJson()` uses the low-level <strong>Git Trees API</strong>.
            All modified JSON payloads are bundled into a single Git Tree payload. A single commit SHA is created,
            and the branch reference is updated once. It is <strong>100% atomic</strong> — either all 3 files update,
            or none do.
          </p>
        </div>
      </section>

      {/* ─── Three Execution Modes ─────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Server className="text-amber-400 w-6 h-6" />
          5. Three Execution Modes: Dev, Prod, and Demo
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse border border-white/10 rounded-xl overflow-hidden">
            <thead className="bg-[#101319] text-white/50 border-b border-white/10">
              <tr>
                <th className="p-3.5">Environment</th>
                <th className="p-3.5">Target Datastore</th>
                <th className="p-3.5">Write Latency</th>
                <th className="p-3.5">Auth Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3.5 font-bold text-amber-400">Development (Local)</td>
                <td className="p-3.5">Node.js `fs` on `/data/*`</td>
                <td className="p-3.5 text-emerald-400">&lt; 1ms (Instant disk write)</td>
                <td className="p-3.5">Console `window.getAccess`</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-3.5 font-bold text-purple-400">Production (Vercel)</td>
                <td className="p-3.5">GitHub REST Git Tree API</td>
                <td className="p-3.5 text-white/60">~400–700ms (Atomic commit)</td>
                <td className="p-3.5">SHA-256 HMAC Cookie</td>
              </tr>
              <tr className="hover:bg-white/[0.02] bg-amber-500/[0.04]">
                <td className="p-3.5 font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Demo Mode (Current)
                </td>
                <td className="p-3.5">Browser `sessionStorage`</td>
                <td className="p-3.5 text-emerald-400">&lt; 1ms (In-memory storage)</td>
                <td className="p-3.5 text-amber-400 font-bold">Auto-Granted DEMO</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 text-xs text-amber-200/80 leading-relaxed flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">How you are testing this right now:</strong> In this demo branch,
            all mutations are intercepted client-side by `demoApiInterceptor.ts` and written directly to your browser's
            `sessionStorage`. You can complete roadmap tasks, check LeetCode problems, and write daily reviews without needing
            a GitHub token or server writes!
          </div>
        </div>
      </section>

      {/* ─── Security & Isolation ─────────────────────────────────────────── */}
      <section className="space-y-4 border-t border-white/10 pt-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="text-amber-400 w-5 h-5" />
          6. Path Traversal & Integrity Invariants
        </h2>
        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
          Because file paths in `lib/storage/` construct disk paths dynamically, rigorous assert guards prevent
          directory traversal attacks (`../../etc/passwd`). Every reader and writer executes `validateUserId(userId)`
          to ensure all file access strictly resolves under the authorized user namespace.
        </p>
      </section>
    </article>
  );
}

