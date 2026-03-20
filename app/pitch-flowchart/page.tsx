'use client';

import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls, Handle, Position, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Brain, ArrowRight, ShieldCheck, Languages, Smartphone, Target, HandHeart, CreditCard, Play } from 'lucide-react';

const GlassNode = ({ data }: any) => {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md" style={{ 
      background: data.glow ? `rgba(${data.rgb}, 0.15)` : `rgba(10, 10, 10, 0.7)`,
      borderColor: data.glow ? `rgba(${data.rgb}, 0.5)` : 'rgba(255, 255, 255, 0.1)',
      minWidth: '220px',
      color: '#fff'
    }}>
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
      <div className="p-3 rounded-lg" style={{ background: `rgba(${data.rgb}, 0.2)`, color: `rgb(${data.rgb})` }}>
        {data.icon}
      </div>
      <div>
        <h3 className="font-bold text-sm tracking-wide">{data.label}</h3>
        {data.subtext && <p className="text-xs text-gray-400 mt-1">{data.subtext}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = { glass: GlassNode };

const initialNodes = [
  { id: '1', type: 'glass', position: { x: 400, y: 50 }, data: { label: 'Bank CRM Data', subtext: 'Defaulting NPAs', rgb: '59, 130, 246', icon: <Database size={20} /> } },
  { id: '2', type: 'glass', position: { x: 400, y: 200 }, data: { label: 'AI Risk Engine', subtext: 'XGBoost Scoring', rgb: '168, 85, 247', icon: <Brain size={20} />, glow: true } },
  { id: '3', type: 'glass', position: { x: 150, y: 350 }, data: { label: 'High Risk', subtext: 'Immediate Action', rgb: '239, 68, 68', icon: <Target size={20} /> } },
  { id: '4', type: 'glass', position: { x: 650, y: 350 }, data: { label: 'Med/Low Risk', subtext: 'AI Orchestration', rgb: '34, 197, 94', icon: <ArrowRight size={20} /> } },
  { id: '5', type: 'glass', position: { x: 500, y: 500 }, data: { label: 'Language Sync', subtext: '12 Native Dialects', rgb: '56, 189, 248', icon: <Languages size={20} /> } },
  { id: '6', type: 'glass', position: { x: 800, y: 500 }, data: { label: 'Gandhigiri AI', subtext: 'Empathy Mode', rgb: '234, 179, 8', icon: <HandHeart size={20} />, glow: true } },
  { id: '7', type: 'glass', position: { x: 650, y: 650 }, data: { label: 'Twilio Outreach', subtext: 'WhatsApp / SMS', rgb: '244, 63, 94', icon: <Smartphone size={20} /> } },
  { id: '8', type: 'glass', position: { x: 650, y: 800 }, data: { label: 'Negotiation Bot', subtext: 'GPT-4 Powered', rgb: '236, 72, 153', icon: <Play size={20} />, glow: true } },
  { id: '9', type: 'glass', position: { x: 400, y: 950 }, data: { label: 'Payment Gateway', subtext: 'Frictionless Docs', rgb: '16, 185, 129', icon: <CreditCard size={20} /> } },
  { id: '10', type: 'glass', position: { x: 400, y: 1100 }, data: { label: 'Compliant Close', subtext: 'RBI Logged', rgb: '99, 102, 241', icon: <ShieldCheck size={20} />, glow: true } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', label: 'Score > 80', style: { stroke: '#ef4444', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, label: 'Score < 80', style: { stroke: '#22c55e', strokeWidth: 2 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
  { id: 'e4-6', source: '4', target: '6', animated: true, style: { stroke: '#eab308', strokeWidth: 2 } },
  { id: 'e5-7', source: '5', target: '7', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
  { id: 'e6-7', source: '6', target: '7', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
  { id: 'e7-8', source: '7', target: '8', animated: true, style: { stroke: '#ec4899', strokeWidth: 3 } },
  { id: 'e3-9', source: '3', target: '9', style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' } },
  { id: 'e8-9', source: '8', target: '9', animated: true, label: 'Promise to Pay', style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e9-10', source: '9', target: '10', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
];

export default function PitchFlowchart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-black"
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' }
        }}
      >
        <Background color="#333" gap={20} />
      </ReactFlow>
    </div>
  );
}
