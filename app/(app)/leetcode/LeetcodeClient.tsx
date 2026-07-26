'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, CheckCircle2, Circle, ChevronDown, ChevronRight, Code, Search, Filter, Layers, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { UserLeetCode, LeetCodeSkill } from '@/lib/storage/readJson';

interface LeetcodeClientProps {
  initialData: UserLeetCode;
}

export default function LeetcodeClient({ initialData }: LeetcodeClientProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>(() => {
    const acc: Record<string, boolean> = {};
    // By default, let's only expand the first few if we have a lot, or keep all expanded if not filtering.
    // For 41 skills, expanding all by default makes the page huge. Let's start with all collapsed except first.
    initialData.skills.forEach((s, i) => acc[s.id] = i === 0);
    return acc;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [groupBy, setGroupBy] = useState<'skill' | 'flat'>('skill');

  const toggleProblem = async (skillId: string, problemId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === skillId ? {
        ...s,
        problems: s.problems.map(p => p.id === problemId ? { ...p, completed: newStatus } : p)
      } : s)
    }));
    
    try {
      const res = await fetch('/api/user/leetcode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId, problemId, completed: newStatus })
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error('Failed to update leetcode progress', e);
      // Revert on failure
      setData(prev => ({
        ...prev,
        skills: prev.skills.map(s => s.id === skillId ? {
          ...s,
          problems: s.problems.map(p => p.id === problemId ? { ...p, completed: currentStatus } : p)
        } : s)
      }));
    }
  };

  const toggleExpand = (skillId: string) => {
    setExpandedSkills(prev => ({ ...prev, [skillId]: !prev[skillId] }));
  };

  const filteredSkills = data.skills.map(skill => {
    const filteredProblems = skill.problems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' ? true : (statusFilter === 'completed' ? p.completed : !p.completed);
      return matchesSearch && matchesStatus;
    });
    return { ...skill, problems: filteredProblems, originalTotal: skill.problems.length, originalCompleted: skill.problems.filter(p => p.completed).length };
  }).filter(skill => skill.problems.length > 0 || (searchQuery === '' && statusFilter === 'all'));

  const flatProblems = filteredSkills.flatMap(skill => 
    skill.problems.map(p => ({ ...p, skillTitle: skill.title, skillId: skill.id }))
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Code className="text-amber-500" /> LeetCode Mastery
        </h2>
        <p className="text-white/40 text-sm mt-1">Map your problem-solving progress to core computer science skills.</p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#101319]/80 backdrop-blur-md p-4 rounded-[20px] border border-white/5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Search problems or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Filter size={14} className="text-white/40" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-sm text-white/80 focus:outline-none"
            >
              <option value="all" className="bg-[#101319]">All Status</option>
              <option value="completed" className="bg-[#101319]">Completed</option>
              <option value="incomplete" className="bg-[#101319]">Incomplete</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setGroupBy('skill')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 ${groupBy === 'skill' ? 'bg-amber-500/20 text-amber-500' : 'text-white/40 hover:text-white/80'}`}
              title="Group by Skill"
            >
              <Layers size={16} />
            </button>
            <button
              onClick={() => setGroupBy('flat')}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 ${groupBy === 'flat' ? 'bg-amber-500/20 text-amber-500' : 'text-white/40 hover:text-white/80'}`}
              title="Flat List"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {groupBy === 'skill' ? (
          filteredSkills.map(skill => {
            const completedCount = skill.originalCompleted;
            const totalCount = skill.originalTotal;
            const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
            
            // Auto expand if searching/filtering and results are found
            const isExpanded = (searchQuery !== '' || statusFilter !== 'all') ? true : expandedSkills[skill.id];

            return (
              <div key={skill.id} className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] border border-white/5 overflow-hidden">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => toggleExpand(skill.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      {isExpanded ? <ChevronDown size={16} className="text-white/60" /> : <ChevronRight size={16} className="text-white/60" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white/90">{skill.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                          {skill.track}
                        </span>
                        <span className="text-xs text-white/40">{completedCount} / {totalCount} completed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-24 sm:w-32 flex flex-col gap-2 shrink-0">
                    <div className="flex justify-end text-xs font-mono text-white/50">{progressPercent}%</div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-2 space-y-1">
                        {skill.problems.map(problem => (
                          <div 
                            key={`${skill.id}-${problem.id}`}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                              problem.completed ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleProblem(skill.id, problem.id, problem.completed); }}
                                className="focus:outline-none shrink-0"
                              >
                                {problem.completed ? (
                                  <CheckCircle2 className="text-emerald-500" size={20} />
                                ) : (
                                  <Circle className="text-white/20 hover:text-white/40" size={20} />
                                )}
                              </button>
                              <span className={`text-sm font-medium truncate ${problem.completed ? 'text-white/60 line-through' : 'text-white/90'}`}>
                                {problem.title}
                              </span>
                              <span className="text-xs font-mono text-white/30 px-2 bg-white/5 rounded-md border border-white/5 shrink-0">
                                #{problem.id}
                              </span>
                            </div>
                            
                            <a 
                              href={problem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/10 transition-colors shrink-0"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        ))}
                        {skill.problems.length === 0 && (
                          <div className="p-4 text-center text-sm text-white/40">No matching problems found.</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] border border-white/5 overflow-hidden p-2">
            {flatProblems.length > 0 ? flatProblems.map(problem => (
              <div 
                key={`${problem.skillId}-${problem.id}`}
                className={`flex items-center justify-between p-3 rounded-xl transition-all mb-1 ${
                  problem.completed ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleProblem(problem.skillId, problem.id, problem.completed); }}
                    className="focus:outline-none shrink-0"
                  >
                    {problem.completed ? (
                      <CheckCircle2 className="text-emerald-500" size={20} />
                    ) : (
                      <Circle className="text-white/20 hover:text-white/40" size={20} />
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium truncate ${problem.completed ? 'text-white/60 line-through' : 'text-white/90'}`}>
                      {problem.title}
                    </span>
                    <span className="text-xs text-white/40 truncate">{problem.skillTitle}</span>
                  </div>
                  <span className="text-xs font-mono text-white/30 px-2 bg-white/5 rounded-md border border-white/5 shrink-0 ml-2">
                    #{problem.id}
                  </span>
                </div>
                
                <a 
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/10 transition-colors shrink-0"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            )) : (
              <div className="p-8 text-center text-sm text-white/40">No problems found matching your criteria.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

