'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/motion/easings';
import { UserResources, ResourceEntry } from '@/lib/storage/readJson';
import { BookOpen, ExternalLink, Search, CheckCircle2, Bookmark, Star, Lock, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function ResourcesClient({ initialData }: { initialData: UserResources }) {
  const isSafe = !usePrefersReducedMotion();
  const [resources, setResources] = useState<ResourceEntry[]>(initialData.resources);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'video' | 'course' | 'tool'>('all');

  // Handle patch mutation (persists to sessionStorage via interceptor in demo)
  const updateResource = async (id: string, updates: Partial<ResourceEntry>) => {
    // Optimistic update
    setResources(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );

    try {
      await fetch('/api/user/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (e) {
      console.error('Failed to update resource', e);
    }
  };

  const filtered = resources.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (searchTerm && !r.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Resources Library</h1>
            {IS_DEMO && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-3 h-3" /> DEMO PREVIEW
              </span>
            )}
          </div>
          <p className="text-white/50 text-sm">
            {IS_DEMO
              ? "Exploring 3 interactive curated resources. Additional items are locked to protect proprietary curriculum."
              : "Manage and revisit your curated learning materials."}
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-colors w-full md:w-64"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 bg-[#101319] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="video">Videos</option>
            <option value="course">Courses</option>
            <option value="tool">Tools</option>
          </select>
        </div>
      </div>

      {/* Grid of cards */}
      <motion.div
        variants={isSafe ? container : {}}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-white/40 border border-dashed border-white/10 rounded-2xl">
            <BookOpen className="w-8 h-8 mx-auto mb-4 opacity-50" />
            <p>No resources found.</p>
          </div>
        ) : (
          filtered.map((resource, index) => {
            // In demo mode, keep only the first 3 items unlocked; remaining are locked glimpses
            const isLocked = IS_DEMO && index >= 3;

            if (isLocked) {
              return (
                <motion.div
                  key={resource.id}
                  variants={isSafe ? item : {}}
                  className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-sm select-none"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/5 text-white/30 uppercase font-mono">
                      {resource.type}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Lock className="w-3 h-3" /> LOCKED
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white/40 mb-2 leading-snug">
                    {resource.title}
                  </h3>

                  <div className="my-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/30 font-mono leading-relaxed">
                    Detailed annotations, bookmarks & direct links are locked in this public demo to protect curriculum data.
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5 text-white/20 text-xs font-mono">
                    <span>★ ★ ★ ★ ★</span>
                    <span className="flex items-center gap-1 text-white/30">
                      <Lock className="w-3 h-3" /> Full OS
                    </span>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={resource.id}
                variants={isSafe ? item : {}}
                className="relative p-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group hover:bg-white/8 hover:border-white/20 transition-all flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={clsx(
                        'text-xs font-semibold px-2 py-0.5 rounded-md font-mono',
                        resource.type === 'video'
                          ? 'text-blue-400 bg-blue-500/10'
                          : resource.type === 'course'
                          ? 'text-purple-400 bg-purple-500/10'
                          : resource.type === 'tool'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      )}
                    >
                      {resource.type.toUpperCase()}
                    </span>

                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => updateResource(resource.id, { bookmarked: !resource.bookmarked })}
                        className={clsx(
                          'p-1.5 rounded-lg border transition-all',
                          resource.bookmarked
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                            : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'
                        )}
                        title={resource.bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                      >
                        <Bookmark className={clsx('w-3.5 h-3.5', resource.bookmarked && 'fill-amber-400')} />
                      </button>

                      <button
                        type="button"
                        onClick={() => updateResource(resource.id, { completed: !resource.completed })}
                        className={clsx(
                          'p-1.5 rounded-lg border transition-all',
                          resource.completed
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'
                        )}
                        title={resource.completed ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        <CheckCircle2 className={clsx('w-3.5 h-3.5', resource.completed && 'fill-emerald-400/20')} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-2 leading-snug group-hover:text-amber-300 transition-colors">
                    {resource.title}
                  </h3>

                  {resource.notes && (
                    <p className="text-xs text-white/60 mb-4 line-clamp-3 leading-relaxed">
                      {resource.notes}
                    </p>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/10">
                    {/* Star rating buttons */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateResource(resource.id, { rating: star })}
                          className="p-0.5 hover:scale-125 transition-transform"
                          title={`Rate ${star} stars`}
                        >
                          <Star
                            className={clsx(
                              'w-3.5 h-3.5 transition-colors',
                              resource.rating && star <= resource.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-white/20 hover:text-amber-400/60'
                            )}
                          />
                        </button>
                      ))}
                    </div>

                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-300 transition-colors font-mono"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
