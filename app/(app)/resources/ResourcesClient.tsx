'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/motion/easings';
import { UserResources, ResourceEntry } from '@/lib/storage/readJson';
import { BookOpen, ExternalLink, Filter, Search, CheckCircle2, Bookmark, Star } from 'lucide-react';
import clsx from 'clsx';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

export default function ResourcesClient({ initialData }: { initialData: UserResources }) {
  const isSafe = !usePrefersReducedMotion();
  const [resources, setResources] = useState<ResourceEntry[]>(initialData.resources);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'video' | 'course'>('all');

  const filtered = resources.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (searchTerm && !r.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Resources Library</h1>
          <p className="text-white/50 mt-1">Manage and revisit your curated learning materials.</p>
        </div>
        
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
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 cursor-pointer appearance-none"
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="video">Videos</option>
            <option value="course">Courses</option>
          </select>
        </div>
      </div>

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
          filtered.map((resource) => (
            <motion.div
              key={resource.id}
              variants={isSafe ? item : {}}
              className="relative p-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group hover:bg-white/10 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={clsx(
                    "text-xs font-semibold px-2 py-1 rounded-md bg-white/10",
                    resource.type === 'video' ? 'text-blue-400' :
                    resource.type === 'course' ? 'text-purple-400' : 'text-amber-400'
                  )}>
                    {resource.type.toUpperCase()}
                  </span>
                  
                  <div className="flex gap-2">
                    {resource.bookmarked && <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />}
                    {resource.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 leading-snug">{resource.title}</h3>
                
                {resource.notes && (
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">{resource.notes}</p>
                )}
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/10">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={clsx(
                          "w-3 h-3",
                          resource.rating && star <= resource.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-white/20"
                        )}
                      />
                    ))}
                  </div>
                  
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
