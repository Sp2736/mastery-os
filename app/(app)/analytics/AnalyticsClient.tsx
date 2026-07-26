'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PolarRadiusAxis,
} from 'recharts';
import { getTrackColor } from '@/lib/theme/trackPalette';

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1117] border border-white/10 rounded-xl px-3 py-2 text-xs space-y-1">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill || p.stroke }} />
          <span className="text-white/80">{p.name || p.dataKey}: </span>
          <span className="font-mono font-bold text-white">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// GitHub-style heatmap
function Heatmap({ data }: { data: Record<string, number> }) {
  const today = new Date();
  const days: Array<{ date: string; count: number; col: number; row: number }> = [];

  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const col = Math.floor((90 - i) / 7);
    const row = d.getDay();
    days.push({ date: dateStr, count: data[dateStr] || 0, col, row });
  }

  const maxCount = Math.max(...Object.values(data), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1.5" style={{ width: 'fit-content' }}>
        {Array.from({ length: Math.max(...days.map(d => d.col)) + 1 }, (_, col) => (
          <div key={col} className="flex flex-col gap-1.5">
            {Array.from({ length: 7 }, (_, row) => {
              const day = days.find(d => d.col === col && d.row === row);
              if (!day) return <div key={row} className="w-3.5 h-3.5" />;
              const intensity = day.count > 0 ? Math.min(0.9, 0.2 + (day.count / maxCount) * 0.7) : 0;
              return (
                <div
                  key={row}
                  className="w-3.5 h-3.5 rounded-sm transition-all cursor-default"
                  title={`${day.date}: ${day.count} nodes`}
                  style={{
                    backgroundColor: day.count > 0 ? `rgba(245, 158, 11, ${intensity})` : 'rgba(255,255,255,0.05)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-white/30">
        <span>Less</span>
        {[0.05, 0.3, 0.55, 0.75, 0.9].map((opacity, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: `rgba(245,158,11,${opacity})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

interface AnalyticsClientProps {
  heatmapData: Record<string, number>;
  velocityData: Record<string, number>;
  wellbeingTrend: Array<{ date: string; mood: number; energy: number; focus: number; sleep: number; nodes: number }>;
  cumulativeData: Array<{ date: string; count: number; cumulative: number }>;
  radarData: Array<{ track: string; completed: number; total: number; percentage: number }>;
  totalNodes: number;
  totalHours: number;
}

export default function AnalyticsClient({
  heatmapData, velocityData, wellbeingTrend, cumulativeData, radarData, totalNodes, totalHours,
}: AnalyticsClientProps) {
  const velocityChartData = Object.entries(velocityData)
    .sort(([a], [b]) => {
      const aN = parseInt(a.replace('W', ''));
      const bN = parseInt(b.replace('W', ''));
      return aN - bN;
    })
    .map(([week, nodes]) => ({ week, nodes }));

  const radarChartData = radarData.slice(0, 8).map(d => ({
    subject: d.track.split(' ')[0],
    completion: d.percentage,
    fullMark: 100,
  }));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-white/40 text-sm mt-1">90 days of progress, patterns, and performance.</p>
      </div>

      {/* Summary chips */}
      <motion.div variants={cardVariant} className="flex gap-4 flex-wrap">
        {[
          { label: 'Total Nodes', value: totalNodes },
          { label: 'Total Hours', value: `${totalHours.toFixed(1)}h` },
          { label: 'Active Days', value: Object.keys(heatmapData).length },
          { label: 'Peak Day', value: `${Math.max(...Object.values(heatmapData), 0)} nodes` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#101319]/80 rounded-[14px] px-5 py-3 border border-white/5">
            <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
            <p className="font-mono font-bold text-white text-xl mt-0.5">{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Heatmap */}
      <motion.div variants={cardVariant} className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-6 border border-white/5">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">Activity Heatmap (90 days)</h3>
        <Heatmap data={heatmapData} />
      </motion.div>

      {/* 2-col charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cumulative growth */}
        <motion.div variants={cardVariant} className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-6 border border-white/5">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Cumulative Nodes</h3>
          {cumulativeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cumulative" stroke="#f59e0b" strokeWidth={2} fill="url(#cumGrad)" name="Total Nodes" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">Complete tasks to see your growth curve</div>
          )}
        </motion.div>

        {/* Weekly velocity */}
        <motion.div variants={cardVariant} className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-6 border border-white/5">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Weekly Velocity</h3>
          {velocityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={velocityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="nodes" fill="#6366f1" radius={[4, 4, 0, 0]} name="Nodes / Week" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">Start completing nodes to see velocity</div>
          )}
        </motion.div>

        {/* Wellbeing trend */}
        <motion.div variants={cardVariant} className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-6 border border-white/5">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Wellbeing (30 days)</h3>
          {wellbeingTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={wellbeingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis domain={[1, 5]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} dot={false} name="Mood" />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={false} name="Energy" />
                <Line type="monotone" dataKey="focus" stroke="#6366f1" strokeWidth={2} dot={false} name="Focus" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">Log daily reviews to see wellbeing trends</div>
          )}
        </motion.div>

        {/* Radar — track completion */}
        <motion.div variants={cardVariant} className="bg-[#101319]/80 backdrop-blur-md rounded-[20px] p-6 border border-white/5">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Track Radar</h3>
          {radarChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Completion %" dataKey="completion" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">Track completion data will appear here</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
