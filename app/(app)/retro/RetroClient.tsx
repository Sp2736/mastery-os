'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface PrePopulated {
  weekNumber: number;
  weekStartDate: string;
  nodesCompletedThisWeek: number;
  hoursStudied: number;
  streakMaintained: boolean;
  weakestTrack: string;
  paceStatus: 'ahead' | 'on-track' | 'behind';
  predictedFinish6Month: string;
  predictedFinishWebDev: string;
  trackCompletion: Record<string, number>;
}

interface RetroEntry {
  weekNumber: number;
  weekStartDate: string;
  answers: { wins: string; struggles: string; keyLearning: string; nextWeekFocus: string };
  computed: {
    nodesCompleted: number; hoursStudied: number; streakMaintained: boolean;
    weakestTrack: string; paceStatus: 'ahead' | 'on-track' | 'behind';
    predictedFinish6Month: string; predictedFinishWebDev: string;
  };
  createdAt: string;
}

const PACE_STYLES = {
  ahead: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle className="w-4 h-4" /> },
  'on-track': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <TrendingUp className="w-4 h-4" /> },
  behind: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: <AlertTriangle className="w-4 h-4" /> },
};

export default function RetroClient({ entries, prePopulated }: { entries: RetroEntry[]; prePopulated: PrePopulated }) {
  const [form, setForm] = useState({ wins: '', struggles: '', keyLearning: '', nextWeekFocus: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'write' | 'history'>('write');

  const setField = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/user/retrospectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber: prePopulated.weekNumber,
          weekStartDate: prePopulated.weekStartDate,
          answers: form,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const paceStyle = PACE_STYLES[prePopulated.paceStatus];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Weekly Retrospective</h2>
          <p className="text-white/40 text-sm mt-1">Week {prePopulated.weekNumber} · {prePopulated.weekStartDate}</p>
        </div>
        <div className="flex gap-2">
          {(['write', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >{t}</button>
          ))}
        </div>
      </div>

      {tab === 'write' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left: Stats snapshot */}
          <div className="space-y-4">
            <div className="bg-[#101319]/80 rounded-[20px] p-5 border border-white/5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Week at a Glance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Nodes done</span>
                  <span className="font-mono font-bold text-white">{prePopulated.nodesCompletedThisWeek}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Hours studied</span>
                  <span className="font-mono font-bold text-white">{prePopulated.hoursStudied}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Streak</span>
                  <span className={`font-bold text-sm ${prePopulated.streakMaintained ? 'text-emerald-400' : 'text-red-400'}`}>
                    {prePopulated.streakMaintained ? '✓ Maintained' : '✗ Broken'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Weakest track</span>
                  <span className="font-medium text-amber-400 text-sm">{prePopulated.weakestTrack}</span>
                </div>
              </div>
            </div>

            <div className={`bg-[#101319]/80 rounded-[20px] p-5 border ${paceStyle.border}`}>
              <div className={`flex items-center gap-2 mb-2 ${paceStyle.color}`}>
                {paceStyle.icon}
                <span className="font-semibold capitalize">{prePopulated.paceStatus}</span>
              </div>
              <p className="text-xs text-white/50 mb-3">Pace vs scheduled</p>
              {prePopulated.predictedFinish6Month && (
                <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                  <Clock className="w-3 h-3" />
                  6-Month: {prePopulated.predictedFinish6Month}
                </div>
              )}
              {prePopulated.predictedFinishWebDev && (
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <Clock className="w-3 h-3" />
                  WebDev: {prePopulated.predictedFinishWebDev}
                </div>
              )}
            </div>

            {/* Track breakdown */}
            <div className="bg-[#101319]/80 rounded-[20px] p-5 border border-white/5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Track %</h3>
              {Object.entries(prePopulated.trackCompletion).slice(0, 8).map(([track, pct]) => (
                <div key={track} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60 truncate">{track}</span>
                    <span className="font-mono text-white/50">{pct}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="md:col-span-2 space-y-4">
            {([
              { key: 'wins', label: '🏆 Wins this week', placeholder: 'What went well? What are you proud of?' },
              { key: 'struggles', label: '💪 Struggles & lessons', placeholder: 'What was hard? What did you learn from it?' },
              { key: 'keyLearning', label: '🧠 Key learning', placeholder: 'The most important thing you learned this week...' },
              { key: 'nextWeekFocus', label: '🎯 Next week focus', placeholder: 'The one thing you want to prioritize...' },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key} className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-5 border border-white/5">
                <label className="block text-sm font-semibold text-white/70 mb-3">{label}</label>
                <textarea
                  value={form[key]}
                  onChange={e => setField(key, e.target.value)}
                  placeholder={placeholder}
                  rows={4}
                  className="w-full bg-white/5 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-amber-500/40 transition-colors"
                />
              </div>
            ))}

            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-[14px] font-bold text-sm tracking-wide transition-all ${
                saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
              } disabled:opacity-50`}
            >
              {saving ? 'Saving...' : saved ? '✓ Retrospective Saved' : 'Save Retrospective'}
            </motion.button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No retrospectives yet. Complete your first one!</p>
            </div>
          ) : (
            entries.slice().reverse().map(entry => (
              <div key={entry.weekStartDate} className="bg-[#101319]/80 rounded-[20px] p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-bold text-white">Week {entry.weekNumber}</span>
                    <span className="text-white/40 text-sm ml-2">· {entry.weekStartDate}</span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${PACE_STYLES[entry.computed.paceStatus].color} ${PACE_STYLES[entry.computed.paceStatus].bg} border ${PACE_STYLES[entry.computed.paceStatus].border}`}>
                    {entry.computed.paceStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { l: 'Nodes', v: entry.computed.nodesCompleted },
                    { l: 'Hours', v: `${entry.computed.hoursStudied}h` },
                    { l: 'Streak', v: entry.computed.streakMaintained ? '✓' : '✗' },
                    { l: 'Weak track', v: entry.computed.weakestTrack },
                  ].map(({ l, v }) => (
                    <div key={l} className="text-center bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-white/40 mb-1">{l}</p>
                      <p className="font-mono font-bold text-white text-sm">{v}</p>
                    </div>
                  ))}
                </div>
                {entry.answers.keyLearning && (
                  <p className="text-sm text-white/60 italic">"{entry.answers.keyLearning}"</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
