'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Moon, Zap, Target, BookOpen, MessageSquare, TrendingUp } from 'lucide-react';
import type { JournalEntry } from '@/lib/storage/readJson';
import type { CorrelationInsights } from '@/lib/insights/correlations';

const today = new Date().toISOString().split('T')[0];

const RATING_LABELS: Record<number, string> = {
  1: '😞 Low', 2: '😐 Meh', 3: '😊 OK', 4: '😄 Good', 5: '🚀 Great',
};

function RatingSlider({ label, icon, value, onChange }: {
  label: string; icon: React.ReactNode; value: number; onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white/60">{icon}</span>
        <span className="text-sm font-medium text-white/80">{label}</span>
        <span className="ml-auto text-sm text-white/50">{RATING_LABELS[value] ?? value}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all ${
              value === n
                ? 'bg-amber-500 text-white'
                : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (s: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-white/5 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-amber-500/40 transition-colors"
      />
    </div>
  );
}

interface ReviewClientProps {
  recent: JournalEntry[];
  insights: CorrelationInsights;
}

export default function ReviewClient({ recent, insights }: ReviewClientProps) {
  const [form, setForm] = useState({
    date: today,
    learned: '',
    blocked: '',
    difficult: '',
    confidence: 3,
    mood: 3,
    energy: 3,
    focus: 3,
    sleepHours: 7,
    studyHours: 1,
    journal: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/user/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Daily Review</h2>
        <p className="text-white/40 text-sm mt-1">Log your day, track your growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Main form */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-6 border border-white/5 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Reflection</h3>
            </div>
            <TextArea
              label="What did you learn today?"
              value={form.learned}
              onChange={v => set('learned', v)}
              placeholder="Key concepts, patterns, insights..."
            />
            <TextArea
              label="What blocked you?"
              value={form.blocked}
              onChange={v => set('blocked', v)}
              placeholder="Distractions, unclear concepts, fatigue..."
            />
            <TextArea
              label="What was most difficult?"
              value={form.difficult}
              onChange={v => set('difficult', v)}
              placeholder="Specific problems or skills..."
            />
          </div>

          <div className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-6 border border-white/5 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Wellbeing</h3>
            </div>
            <RatingSlider label="Mood" icon={<span>😊</span>} value={form.mood} onChange={v => set('mood', v)} />
            <RatingSlider label="Energy" icon={<Zap className="w-4 h-4 text-amber-400" />} value={form.energy} onChange={v => set('energy', v)} />
            <RatingSlider label="Focus" icon={<Target className="w-4 h-4 text-blue-400" />} value={form.focus} onChange={v => set('focus', v)} />
            <RatingSlider label="Confidence" icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} value={form.confidence} onChange={v => set('confidence', v)} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-blue-400" /> Sleep Hours
                </label>
                <input
                  type="number" min={0} max={24} step={0.5}
                  value={form.sleepHours}
                  onChange={e => set('sleepHours', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-amber-500/40 font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Study Hours
                </label>
                <input
                  type="number" min={0} max={24} step={0.5}
                  value={form.studyHours}
                  onChange={e => set('studyHours', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-amber-500/40 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Free Journal</h3>
            </div>
            <textarea
              value={form.journal}
              onChange={e => set('journal', e.target.value)}
              placeholder="Anything on your mind — plans, thoughts, reflections, venting..."
              rows={5}
              className="w-full bg-white/5 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-amber-500/40 transition-colors"
            />
          </div>

          <motion.button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-[14px] font-bold text-sm tracking-wide transition-all ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
            } disabled:opacity-50`}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Review'}
          </motion.button>
        </div>

        {/* Sidebar: insights + history */}
        <div className="space-y-4">
          {/* Insights */}
          <div className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-5 border border-white/5">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Insights</h3>
            {insights.summary.map((s, i) => (
              <p key={i} className="text-xs text-white/60 leading-relaxed mb-2 last:mb-0">{s}</p>
            ))}
          </div>

          {/* Recent entries */}
          {recent.length > 0 && (
            <div className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-5 border border-white/5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Last 7 Days</h3>
              <div className="space-y-3">
                {recent.map(entry => (
                  <div key={entry.date} className="border-b border-white/5 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white/60">{entry.date}</span>
                      <div className="flex gap-1">
                        {[entry.mood, entry.energy, entry.focus].map((v, i) => (
                          <span key={i} className="text-xs px-1 py-0.5 rounded bg-white/5 text-white/40">{v}/5</span>
                        ))}
                      </div>
                    </div>
                    {entry.learned && (
                      <p className="text-xs text-white/40 line-clamp-2">{entry.learned}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
