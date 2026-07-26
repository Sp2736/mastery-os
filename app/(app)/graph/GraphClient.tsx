'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, addEdge,
  type NodeTypes, Handle, Position, type NodeProps,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getTrackColor } from '@/lib/theme/trackPalette';
import { Filter, Eye, Zap, Layers } from 'lucide-react';

function CustomNode({ data }: NodeProps) {
  const color = getTrackColor(data.track as string);
  const isCompleted = data.status === 'completed';
  const isInProgress = data.status === 'in-progress';

  return (
    <div
      className="relative px-4 py-3 rounded-xl border max-w-[220px] cursor-pointer transition-all"
      style={{
        borderColor: isCompleted ? color : isInProgress ? `${color}80` : 'rgba(255,255,255,0.1)',
        background: isCompleted ? `${color}15` : 'rgba(16,19,25,0.95)',
        boxShadow: isCompleted ? `0 0 12px ${color}30` : isInProgress ? `0 0 20px ${color}20` : 'none',
        opacity: data.status === 'pending' ? 0.6 : 1,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color, border: 'none', width: 8, height: 8 }} />
      <div className="flex items-center justify-between mb-2">
        <span className="uppercase tracking-widest font-bold text-white/50 truncate" style={{ fontSize: '10px' }}>{String(data.track)}</span>
        {isCompleted && <span className="text-[12px] ml-auto text-emerald-400 flex-shrink-0">✓</span>}
        {isInProgress && <span className="text-[10px] ml-auto text-amber-500 font-mono flex-shrink-0 animate-pulse">ACTIVE</span>}
      </div>
      <p
        className="leading-snug font-medium line-clamp-3"
        style={{ color: isCompleted ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)', fontSize: '12px' }}
      >
        {String(data.label)}
      </p>
      <Handle type="source" position={Position.Right} style={{ background: color, border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { custom: CustomNode };

interface GraphClientProps {
  initialNodes: Array<{
    id: string; data: { label: string; track: string; status: string; difficulty: string; roadmapId: string; dependencies: string[] };
    position: { x: number; y: number }; type: string;
  }>;
  initialEdges: Array<{ id: string; source: string; target: string; animated: boolean }>;
}


export default function GraphClient({ initialNodes, initialEdges }: GraphClientProps) {
  const [trackFilter, setTrackFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [nodes, setNodes, onNodesChange] = useNodesState<any>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(initialEdges);

  const tracks = useMemo(() => Array.from(new Set(initialNodes.map(n => n.data.track))), [initialNodes]);

  useEffect(() => {
    let filteredNodes = initialNodes;

    if (trackFilter !== 'All') {
      filteredNodes = filteredNodes.filter(n => n.data.track === trackFilter);
    }
    if (statusFilter !== 'All') {
      filteredNodes = filteredNodes.filter(n => {
        if (statusFilter === 'Completed') return n.data.status === 'completed';
        if (statusFilter === 'In-Progress') return n.data.status === 'in-progress';
        if (statusFilter === 'Pending') return n.data.status === 'pending';
        return true;
      });
    }

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    
    // Filter edges to only those connecting visible nodes
    const filteredEdges = initialEdges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)).map(e => ({
      ...e,
      type: 'smoothstep',
      style: { stroke: e.animated ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.08)', strokeWidth: 1.5 },
    }));

    setNodes(filteredNodes);
    setEdges(filteredEdges);

  }, [trackFilter, statusFilter, initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback((params: any) => setEdges(e => addEdge(params, e)), [setEdges]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Knowledge Graph</h2>
        <p className="text-white/40 text-sm mt-1">Visualize your week-by-week roadmap progress.</p>
      </div>

      <div className="rounded-[20px] overflow-hidden border border-white/5 relative" style={{ height: 'calc(100vh - 200px)', background: '#08090c' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="rgba(255,255,255,0.03)" gap={20} />
          <Controls className="[&>button]:bg-[#101319] [&>button]:border-white/10 [&>button]:text-white/60 [&>button:hover]:bg-white/10" />
          <MiniMap
            nodeColor={(n) => {
              const trackStr = typeof n.data?.track === 'string' ? n.data.track : '';
              const color = getTrackColor(trackStr);
              return n.data?.status === 'completed' ? color : 'rgba(255,255,255,0.1)';
            }}
            style={{ background: '#08090c', border: '1px solid rgba(255,255,255,0.05)' }}
          />

          <Panel position="top-left" className="m-4">
            <div className="flex flex-col gap-3 bg-[#101319]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                  <Filter size={14} className="text-white/40" />
                  <select 
                    value={trackFilter} 
                    onChange={e => setTrackFilter(e.target.value)}
                    className="bg-transparent text-xs text-white/80 focus:outline-none"
                  >
                    <option value="All" className="bg-[#101319]">All Tracks</option>
                    {tracks.map(t => <option key={t} value={t} className="bg-[#101319]">{t}</option>)}
                  </select>
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                  <Layers size={14} className="text-white/40" />
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-transparent text-xs text-white/80 focus:outline-none"
                  >
                    <option value="All" className="bg-[#101319]">All Status</option>
                    <option value="Completed" className="bg-[#101319]">Completed</option>
                    <option value="In-Progress" className="bg-[#101319]">In-Progress</option>
                    <option value="Pending" className="bg-[#101319]">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
