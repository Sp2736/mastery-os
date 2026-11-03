'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Database,
  LayoutDashboard,
  Compass,
  Edit3,
  RotateCcw,
  BarChart2,
  Network,
  BookOpen,
  Code,
  GitBranch,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  { icon: LayoutDashboard, label: 'Dashboard', desc: 'XP, streak, mastery score & completion charts' },
  { icon: Compass,         label: 'Journey',   desc: 'Interactive roadmap with node-level progress tracking' },
  { icon: Edit3,           label: 'Daily Review', desc: 'Journal entries, mood/energy logging & insights' },
  { icon: RotateCcw,       label: 'Retrospective', desc: 'Weekly reflection with pace predictions' },
  { icon: BarChart2,       label: 'Analytics', desc: 'Heat maps, correlations & study trend analysis' },
  { icon: Network,         label: 'Knowledge Graph', desc: 'Visual dependency graph of all learning nodes' },
  { icon: BookOpen,        label: 'Resources', desc: 'Curated bookmarks, ratings & preview locks' },
  { icon: Code,            label: 'LeetCode Tracker', desc: 'Skill-grouped problem completion with XP rewards' },
  { icon: GitBranch,       label: 'Architecture', desc: 'Deep dive into GitHub REST atomic commit pipeline' },
];

const SESSION_KEY = 'mastery-demo-notice-dismissed';

export default function DemoNotice() {
  const [visible, setVisible]     = useState(false);
  const [expanded, setExpanded]   = useState(false);

  // Restore dismissed state from sessionStorage
  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="demo-notice"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none"
        >
          <div
            className="pointer-events-auto mt-3 mx-4 max-w-3xl w-full rounded-2xl overflow-hidden
              border border-amber-500/20 bg-[#0e1018]/90 backdrop-blur-xl
              shadow-[0_0_40px_rgba(245,158,11,0.08),0_4px_24px_rgba(0,0,0,0.6)]"
          >
            {/* Top row */}
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono text-xs tracking-widest text-amber-300 uppercase font-semibold">
                  Demo Mode
                </span>
                <span className="text-white/30 text-xs mx-1">·</span>
                <span className="text-white/50 text-xs truncate">
                  Logged in as <span className="text-amber-400 font-mono font-bold">DEMO</span> — data resets on tab close
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setExpanded((p) => !p)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/40
                    hover:text-white/70 hover:bg-white/5 transition-colors font-mono"
                  aria-label="Toggle details"
                >
                  {expanded ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> Hide</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> Details</>
                  )}
                </button>
                <button
                  onClick={dismiss}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable details */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="expanded"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/5 px-5 py-4 space-y-4">
                    {/* Welcome copy */}
                    <div>
                      <h2 className="text-white/90 font-semibold text-sm mb-1">
                        Welcome to the Mastery OS Demo
                      </h2>
                      <p className="text-white/45 text-xs leading-relaxed">
                        This is an interactive portfolio preview. Modules display 2–3 active glimpses
                        while full collections remain protected.
                      </p>
                    </div>

                    {/* Two-column info cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Auth card */}
                      <div className="rounded-xl bg-white/[0.03] border border-white/6 p-3.5 flex gap-3">
                        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/80 text-xs font-medium mb-0.5">Authentication Bypass</p>
                          <p className="text-white/40 text-[11px] leading-relaxed">
                            You are logged in as guest <strong className="text-amber-400 font-mono">DEMO</strong> to explore the platform seamlessly without requiring console authentication.
                          </p>
                        </div>
                      </div>

                      {/* Storage card */}
                      <div className="rounded-xl bg-white/[0.03] border border-white/6 p-3.5 flex gap-3">
                        <Database className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/80 text-xs font-medium mb-0.5">Local Data Simulation</p>
                          <p className="text-white/40 text-[11px] leading-relaxed">
                            In production, this app persists user data by programmatically committing JSON updates directly to a private GitHub repository. For this demo, that methodology is replaced with local browser <strong className="text-white/60">sessionStorage</strong>. Your data will reset upon closing the tab.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Blog / Architecture Deep Dive CTA */}
                    <Link
                      href="/architecture"
                      onClick={() => setExpanded(false)}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/40 text-amber-300 text-xs font-medium group transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Read Architecture Blog: How Git Commits Replace Databases</span>
                      </div>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-amber-400 group-hover:translate-x-1 transition-transform">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>

                    {/* Feature list */}
                    <div>
                      <p className="text-white/40 text-[11px] uppercase tracking-widest font-mono mb-2">
                        Features to explore
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {FEATURES.map(({ icon: Icon, label, desc }) => (
                          <div
                            key={label}
                            title={desc}
                            className="flex items-center gap-2 rounded-lg bg-white/[0.025] border border-white/5
                              px-2.5 py-2 hover:bg-white/5 transition-colors cursor-default"
                          >
                            <Icon className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                            <span className="text-white/65 text-[11px] font-medium truncate">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
