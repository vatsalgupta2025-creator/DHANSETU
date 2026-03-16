'use client';
import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface Agent {
    id: string; name: string; avatar: string; role: string;
    recoveries: number; callsMade: number; successRate: number;
    totalRecovered: number; rank: number; streak: number;
    badges: string[]; trend: number[];
    region: string; rating: number; xp: number; level: number;
    rankChange: number; // positive = moved up, negative = moved down
    achievements: { icon: string; name: string; desc: string; unlocked: boolean }[];
}

const AGENTS: Agent[] = [
    {
        id: 'A01', name: 'Arjun Mehta', avatar: 'AM', role: 'Senior Recovery Officer', recoveries: 142, callsMade: 890, successRate: 78, totalRecovered: 4250000, rank: 1, streak: 12, badges: ['🏆', '⭐', '🔥', '💎'], trend: [32, 45, 38, 52, 48, 55, 62, 58, 71, 68, 75, 82], region: 'Maharashtra', rating: 4.9, xp: 8450, level: 12, rankChange: 0, achievements: [
            { icon: '🏆', name: 'Recovery Champion', desc: 'Top performer for 3 months', unlocked: true },
            { icon: '💎', name: 'Diamond Collector', desc: 'Recovered ₹1Cr+ in a month', unlocked: true },
            { icon: '🔥', name: 'Streak Master', desc: '10+ day success streak', unlocked: true },
            { icon: '🎯', name: 'Sharpshooter', desc: '80%+ success rate for a quarter', unlocked: false },
            { icon: '🌟', name: 'Five Star Agent', desc: 'Maintain 5.0 rating for a month', unlocked: false },
        ]
    },
    {
        id: 'A02', name: 'Priya Nair', avatar: 'PN', role: 'Recovery Specialist', recoveries: 128, callsMade: 1020, successRate: 72, totalRecovered: 3800000, rank: 2, streak: 8, badges: ['⭐', '🔥', '🎯'], trend: [28, 35, 42, 38, 45, 50, 48, 55, 60, 58, 65, 70], region: 'Tamil Nadu', rating: 4.7, xp: 7200, level: 10, rankChange: 1, achievements: [
            { icon: '⭐', name: 'Star Performer', desc: 'Top 3 for 2 months', unlocked: true },
            { icon: '🔥', name: 'Streak Master', desc: '10+ day streak', unlocked: true },
            { icon: '📞', name: 'Call King', desc: '1000+ calls in a month', unlocked: true },
            { icon: '🎯', name: 'Sharpshooter', desc: '80%+ success rate', unlocked: false },
        ]
    },
    {
        id: 'A03', name: 'Vikram Singh', avatar: 'VS', role: 'Field Agent Lead', recoveries: 115, callsMade: 760, successRate: 68, totalRecovered: 3200000, rank: 3, streak: 15, badges: ['🔥', '🎯', '🏅'], trend: [22, 30, 28, 35, 40, 38, 45, 42, 50, 55, 52, 60], region: 'Uttar Pradesh', rating: 4.5, xp: 6350, level: 9, rankChange: -1, achievements: [
            { icon: '🔥', name: 'Streak Master', desc: '10+ day streak', unlocked: true },
            { icon: '🚗', name: 'Road Warrior', desc: '50+ field visits in a month', unlocked: true },
            { icon: '🏅', name: 'Consistent', desc: 'Above target for 6 months', unlocked: true },
        ]
    },
    {
        id: 'A04', name: 'Deepika Sharma', avatar: 'DS', role: 'AI-Assisted Agent', recoveries: 108, callsMade: 650, successRate: 82, totalRecovered: 2900000, rank: 4, streak: 6, badges: ['⭐', '🤖', '💎'], trend: [25, 28, 32, 30, 38, 42, 40, 48, 52, 50, 58, 62], region: 'Gujarat', rating: 4.8, xp: 5800, level: 8, rankChange: 2, achievements: [
            { icon: '🤖', name: 'AI Pioneer', desc: 'Best AI-assisted agent', unlocked: true },
            { icon: '🎯', name: 'Sharpshooter', desc: '80%+ success rate', unlocked: true },
            { icon: '💎', name: 'Diamond Collector', desc: 'Recovered ₹1Cr+', unlocked: false },
        ]
    },
    {
        id: 'A05', name: 'Rahul Patil', avatar: 'RP', role: 'Recovery Officer', recoveries: 95, callsMade: 820, successRate: 64, totalRecovered: 2500000, rank: 5, streak: 4, badges: ['🎯', '🏅'], trend: [18, 22, 25, 28, 30, 35, 32, 38, 40, 42, 45, 50], region: 'Karnataka', rating: 4.3, xp: 4600, level: 7, rankChange: 0, achievements: [
            { icon: '🎯', name: 'Focused', desc: 'Met target 3 months in row', unlocked: true },
        ]
    },
    {
        id: 'A06', name: 'Anjali Reddy', avatar: 'AR', role: 'Senior Negotiator', recoveries: 88, callsMade: 540, successRate: 75, totalRecovered: 2200000, rank: 6, streak: 10, badges: ['🔥', '💎'], trend: [20, 25, 22, 30, 28, 35, 38, 40, 45, 48, 50, 55], region: 'Telangana', rating: 4.6, xp: 4100, level: 6, rankChange: 1, achievements: [
            { icon: '🗣️', name: 'Negotiator', desc: 'Best settlement rate', unlocked: true },
            { icon: '🔥', name: 'Streak Master', desc: '10+ day streak', unlocked: true },
        ]
    },
    { id: 'A07', name: 'Sanjay Kumar', avatar: 'SK', role: 'Recovery Agent', recoveries: 76, callsMade: 680, successRate: 58, totalRecovered: 1800000, rank: 7, streak: 3, badges: ['🏅'], trend: [15, 18, 20, 22, 25, 28, 26, 30, 32, 35, 38, 40], region: 'Delhi NCR', rating: 4.1, xp: 3200, level: 5, rankChange: -2, achievements: [] },
    {
        id: 'A08', name: 'Meera Joshi', avatar: 'MJ', role: 'AI-Assisted Agent', recoveries: 72, callsMade: 420, successRate: 80, totalRecovered: 1650000, rank: 8, streak: 7, badges: ['🤖', '⭐'], trend: [12, 15, 18, 22, 25, 28, 30, 35, 38, 40, 42, 48], region: 'Rajasthan', rating: 4.4, xp: 2900, level: 5, rankChange: 1, achievements: [
            { icon: '🤖', name: 'AI Pioneer', desc: 'Best AI-assisted agent', unlocked: true },
        ]
    },
];

const teamData = [
    { month: 'Sep', recovered: 18.2, target: 20 },
    { month: 'Oct', recovered: 22.5, target: 22 },
    { month: 'Nov', recovered: 25.1, target: 24 },
    { month: 'Dec', recovered: 28.8, target: 26 },
    { month: 'Jan', recovered: 31.4, target: 28 },
    { month: 'Feb', recovered: 35.2, target: 30 },
];

const MOTIVATIONAL = [
    '💪 "Recovery is not just about numbers — it\'s about helping borrowers find their path."',
    '🎯 "Every resolved account is a step toward a healthier banking ecosystem."',
    '🔥 "Consistency beats intensity. Keep the streak alive!"',
    '🌟 "The best agents listen first, then act."',
];

const XP_PER_LEVEL = 1000;
const WEEKLY_CHALLENGE = { name: 'Recovery Sprint', desc: 'Resolve 20 accounts this week', progress: 14, target: 20, reward: '500 XP + 🏅 Sprint Badge', daysLeft: 3 };

export default function AgentLeaderboard() {
    const { selectedBank } = useApp();
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [view, setView] = useState<'leaderboard' | 'team' | 'achievements'>('leaderboard');
    const [compareAgents, setCompareAgents] = useState<[string | null, string | null]>([null, null]);
    const [compareMode, setCompareMode] = useState(false);
    const accent = selectedBank?.accent || '#0d9488';
    const [motivIndex] = useState(Math.floor(Math.random() * MOTIVATIONAL.length));

    const channelData = useMemo(() => [
        { channel: 'WhatsApp', success: 68, attempts: 2400 },
        { channel: 'Call', success: 55, attempts: 1800 },
        { channel: 'SMS', success: 32, attempts: 3200 },
        { channel: 'Email', success: 24, attempts: 1500 },
    ], []);

    const selectedAgentData = selectedAgent ? AGENTS.find(a => a.id === selectedAgent) : null;

    const handleCompareSelect = (id: string) => {
        if (compareAgents[0] === id) setCompareAgents([null, compareAgents[1]]);
        else if (compareAgents[1] === id) setCompareAgents([compareAgents[0], null]);
        else if (!compareAgents[0]) setCompareAgents([id, compareAgents[1]]);
        else if (!compareAgents[1]) setCompareAgents([compareAgents[0], id]);
        else setCompareAgents([id, null]);
    };

    const cmpA = compareAgents[0] ? AGENTS.find(a => a.id === compareAgents[0]) : null;
    const cmpB = compareAgents[1] ? AGENTS.find(a => a.id === compareAgents[1]) : null;

    const radarData = cmpA && cmpB ? [
        { stat: 'Recoveries', A: cmpA.recoveries, B: cmpB.recoveries },
        { stat: 'Success %', A: cmpA.successRate, B: cmpB.successRate },
        { stat: 'Calls', A: Math.round(cmpA.callsMade / 10), B: Math.round(cmpB.callsMade / 10) },
        { stat: 'Rating', A: cmpA.rating * 20, B: cmpB.rating * 20 },
        { stat: 'Streak', A: cmpA.streak * 5, B: cmpB.streak * 5 },
        { stat: 'Level', A: cmpA.level * 8, B: cmpB.level * 8 },
    ] : [];

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
            {/* Motivational Banner */}
            <div style={{ background: `linear-gradient(135deg, ${accent}08, transparent)`, borderRadius: 14, padding: '12px 20px', marginBottom: 20, border: `1px solid ${accent}15`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic', flex: 1 }}>{MOTIVATIONAL[motivIndex]}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>🏆 Agent Leaderboard</h1>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 6 }}>Track performance, celebrate top performers, and unlock achievements</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => { setCompareMode(!compareMode); setCompareAgents([null, null]); }}
                        style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${compareMode ? accent : '#e2e8f0'}`, background: compareMode ? `${accent}10` : 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: compareMode ? accent : '#64748b' }}>
                        {compareMode ? '✓ Compare Mode' : '⚖️ Compare'}
                    </button>
                    <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
                        {(['leaderboard', 'team', 'achievements'] as const).map(v => (
                            <button key={v} onClick={() => setView(v)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, background: view === v ? 'white' : 'transparent', color: view === v ? accent : '#64748b', boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                                {v === 'leaderboard' ? '🏅 Rankings' : v === 'team' ? '📊 Team' : '🎖️ Badges'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly Challenge */}
            <div style={{ background: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid #e2e8f0', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🎯</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{WEEKLY_CHALLENGE.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{WEEKLY_CHALLENGE.desc}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 160 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 600, marginBottom: 4 }}>
                            <span style={{ color: '#64748b' }}>{WEEKLY_CHALLENGE.progress}/{WEEKLY_CHALLENGE.target}</span>
                            <span style={{ color: accent }}>{Math.round(WEEKLY_CHALLENGE.progress / WEEKLY_CHALLENGE.target * 100)}%</span>
                        </div>
                        <div style={{ width: '100%', height: 8, borderRadius: 4, background: '#f1f5f9' }}>
                            <div style={{ width: `${(WEEKLY_CHALLENGE.progress / WEEKLY_CHALLENGE.target) * 100}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${accent}, ${accent}cc)`, transition: 'width 0.5s' }} />
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{WEEKLY_CHALLENGE.daysLeft}d left</div>
                        <div style={{ fontSize: '0.65rem', color: accent, fontWeight: 600 }}>{WEEKLY_CHALLENGE.reward}</div>
                    </div>
                </div>
            </div>

            {/* Top 3 Podium */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
                {AGENTS.slice(0, 3).map((a, i) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const xpInLevel = a.xp % XP_PER_LEVEL;
                    const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;
                    return (
                        <div key={a.id} onClick={() => compareMode ? handleCompareSelect(a.id) : setSelectedAgent(a.id)}
                            style={{
                                background: 'white', borderRadius: 16, padding: '24px 20px',
                                border: compareMode && (compareAgents[0] === a.id || compareAgents[1] === a.id) ? `2px solid ${accent}` : `2px solid ${i === 0 ? '#f5c842' : i === 1 ? '#c0c0c0' : '#cd7f32'}20`,
                                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: i === 0 ? '0 4px 20px rgba(245,200,66,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
                            }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>{medals[i]}</div>
                            {/* Avatar with status ring */}
                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
                                <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: 'white', border: '3px solid white', boxShadow: `0 0 0 2px ${accent}40` }}>{a.avatar}</div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: '#16a34a', border: '2px solid white', animation: 'pulseDot 2s infinite' }} />
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', fontFamily: 'Space Grotesk' }}>{a.name}</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 4 }}>{a.role}</div>
                            {/* XP Bar */}
                            <div style={{ margin: '8px 0', padding: '0 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontWeight: 600, marginBottom: 2 }}>
                                    <span style={{ color: '#94a3b8' }}>Lv.{a.level}</span>
                                    <span style={{ color: accent }}>{xpInLevel}/{XP_PER_LEVEL} XP</span>
                                </div>
                                <div style={{ width: '100%', height: 5, borderRadius: 3, background: '#f1f5f9' }}>
                                    <div style={{ width: `${xpPct}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${accent}, #16a34a)`, transition: 'width 0.5s' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 10 }}>{a.badges.map((b, bi) => <span key={bi} style={{ fontSize: '1rem' }}>{b}</span>)}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 6px' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a', fontFamily: 'Space Grotesk' }}>{a.recoveries}</div>
                                    <div style={{ fontSize: '0.58rem', color: '#64748b' }}>Recoveries</div>
                                </div>
                                <div style={{ background: `${accent}10`, borderRadius: 8, padding: '8px 6px' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: accent, fontFamily: 'Space Grotesk' }}>{a.successRate}%</div>
                                    <div style={{ fontSize: '0.58rem', color: '#64748b' }}>Success Rate</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Compare Panel or Main Content */}
            {compareMode && cmpA && cmpB ? (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, marginBottom: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 16, textAlign: 'center' }}>⚖️ {cmpA.name} vs {cmpB.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center' }}>
                        {/* Agent A stats */}
                        <div style={{ textAlign: 'right' }}>
                            {[
                                { label: 'Recoveries', val: cmpA.recoveries, better: cmpA.recoveries > cmpB.recoveries },
                                { label: 'Success Rate', val: `${cmpA.successRate}%`, better: cmpA.successRate > cmpB.successRate },
                                { label: 'Calls Made', val: cmpA.callsMade, better: cmpA.callsMade > cmpB.callsMade },
                                { label: 'Recovered', val: `₹${(cmpA.totalRecovered / 100000).toFixed(1)}L`, better: cmpA.totalRecovered > cmpB.totalRecovered },
                                { label: 'Rating', val: `⭐ ${cmpA.rating}`, better: cmpA.rating > cmpB.rating },
                                { label: 'Level', val: `Lv.${cmpA.level}`, better: cmpA.level > cmpB.level },
                            ].map(s => (
                                <div key={s.label} style={{ marginBottom: 10, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 800, color: s.better ? '#16a34a' : '#64748b', fontFamily: 'Space Grotesk' }}>{s.val}</span>
                                    {s.better && <span style={{ color: '#16a34a', fontSize: '0.75rem' }}>✓</span>}
                                </div>
                            ))}
                        </div>
                        {/* Labels */}
                        <div>
                            {['Recoveries', 'Success Rate', 'Calls Made', 'Recovered', 'Rating', 'Level'].map(l => (
                                <div key={l} style={{ marginBottom: 10, textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', lineHeight: '28px' }}>{l}</div>
                            ))}
                        </div>
                        {/* Agent B stats */}
                        <div>
                            {[
                                { val: cmpB.recoveries, better: cmpB.recoveries > cmpA.recoveries },
                                { val: `${cmpB.successRate}%`, better: cmpB.successRate > cmpA.successRate },
                                { val: cmpB.callsMade, better: cmpB.callsMade > cmpA.callsMade },
                                { val: `₹${(cmpB.totalRecovered / 100000).toFixed(1)}L`, better: cmpB.totalRecovered > cmpA.totalRecovered },
                                { val: `⭐ ${cmpB.rating}`, better: cmpB.rating > cmpA.rating },
                                { val: `Lv.${cmpB.level}`, better: cmpB.level > cmpA.level },
                            ].map((s, i) => (
                                <div key={i} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {s.better && <span style={{ color: '#16a34a', fontSize: '0.75rem' }}>✓</span>}
                                    <span style={{ fontSize: '1rem', fontWeight: 800, color: s.better ? '#16a34a' : '#64748b', fontFamily: 'Space Grotesk' }}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : compareMode ? (
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: '20px', textAlign: 'center', marginBottom: 24, border: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⚖️</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>Select 2 agents to compare</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>{compareAgents[0] ? `1 selected — pick one more` : 'Click on agents to select'}</div>
                </div>
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: selectedAgentData && !compareMode ? '1fr 380px' : '1fr', gap: 24 }}>
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        {view === 'leaderboard' ? '📋 Full Rankings' : view === 'team' ? '📊 Team Performance' : '🎖️ Achievement Gallery'}
                    </div>
                    {view === 'leaderboard' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                <thead><tr style={{ background: '#f8fafc' }}>
                                    {['Rank', 'Agent', 'Level', 'Region', 'Recoveries', 'Success %', 'Recovered', 'Streak', 'Rating'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    {AGENTS.map(a => {
                                        const xpInLevel = a.xp % XP_PER_LEVEL;
                                        return (
                                            <tr key={a.id} onClick={() => compareMode ? handleCompareSelect(a.id) : setSelectedAgent(a.id)}
                                                style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: (compareMode && (compareAgents[0] === a.id || compareAgents[1] === a.id)) || selectedAgent === a.id ? `${accent}08` : 'transparent', transition: 'background 0.15s' }}>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <span style={{ fontWeight: 800, color: a.rank <= 3 ? '#f59e0b' : '#64748b' }}>#{a.rank}</span>
                                                        {a.rankChange !== 0 && (
                                                            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: a.rankChange > 0 ? '#16a34a' : '#dc2626' }}>
                                                                {a.rankChange > 0 ? `▲${a.rankChange}` : `▼${Math.abs(a.rankChange)}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ position: 'relative' }}>
                                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 700, color: 'white' }}>{a.avatar}</div>
                                                            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#16a34a', border: '1.5px solid white' }} />
                                                        </div>
                                                        <div><div style={{ fontWeight: 700, color: '#0f172a' }}>{a.name}</div><div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{a.role}</div></div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: accent }}>Lv.{a.level}</span>
                                                        <div style={{ width: 32, height: 4, borderRadius: 2, background: '#f1f5f9' }}>
                                                            <div style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%`, height: '100%', borderRadius: 2, background: accent }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 14px', color: '#64748b' }}>{a.region}</td>
                                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#16a34a' }}>{a.recoveries}</td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <div style={{ width: 48, height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                                                            <div style={{ width: `${a.successRate}%`, height: '100%', borderRadius: 3, background: a.successRate >= 70 ? '#16a34a' : a.successRate >= 50 ? '#f59e0b' : '#ef4444' }} />
                                                        </div>
                                                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{a.successRate}%</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontFamily: 'Space Grotesk' }}>₹{(a.totalRecovered / 100000).toFixed(1)}L</td>
                                                <td style={{ padding: '12px 14px' }}>🔥 {a.streak}d</td>
                                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f59e0b' }}>⭐ {a.rating}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {view === 'team' && (
                        <div style={{ padding: 20 }}>
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Monthly Recovery vs Target (₹ Lakhs)</div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={teamData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="target" stroke="#e2e8f0" fill="#f8fafc" name="Target" />
                                        <Area type="monotone" dataKey="recovered" stroke={accent} fill={`${accent}20`} name="Recovered" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Channel Success Rates</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={channelData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="success" fill={accent} radius={[6, 6, 0, 0]} name="Success %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {view === 'achievements' && (
                        <div style={{ padding: 20 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>All Available Achievements</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                {[
                                    { icon: '🏆', name: 'Recovery Champion', desc: 'Top performer for 3 months', rarity: 'Legendary' },
                                    { icon: '💎', name: 'Diamond Collector', desc: 'Recovered ₹1Cr+ in a month', rarity: 'Epic' },
                                    { icon: '🔥', name: 'Streak Master', desc: '10+ day success streak', rarity: 'Rare' },
                                    { icon: '🎯', name: 'Sharpshooter', desc: '80%+ success rate for a quarter', rarity: 'Epic' },
                                    { icon: '🌟', name: 'Five Star Agent', desc: 'Maintain 5.0 rating for a month', rarity: 'Legendary' },
                                    { icon: '📞', name: 'Call King', desc: '1000+ calls in a month', rarity: 'Rare' },
                                    { icon: '🤖', name: 'AI Pioneer', desc: 'Best AI-assisted agent', rarity: 'Epic' },
                                    { icon: '🚗', name: 'Road Warrior', desc: '50+ field visits in a month', rarity: 'Rare' },
                                    { icon: '🗣️', name: 'Negotiator', desc: 'Best settlement rate', rarity: 'Epic' },
                                ].map(ach => {
                                    const rarityColor = ach.rarity === 'Legendary' ? '#f59e0b' : ach.rarity === 'Epic' ? '#8b5cf6' : '#3b82f6';
                                    const unlockedBy = AGENTS.filter(a => a.achievements.some(x => x.icon === ach.icon && x.unlocked)).length;
                                    return (
                                        <div key={ach.name} style={{ background: '#f8fafc', borderRadius: 14, padding: '16px', textAlign: 'center', border: '1px solid #e2e8f0', transition: 'all 0.15s' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: 6 }}>{ach.icon}</div>
                                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{ach.name}</div>
                                            <span style={{ fontSize: '0.58rem', fontWeight: 700, color: rarityColor, background: `${rarityColor}12`, padding: '2px 8px', borderRadius: 4, display: 'inline-block', margin: '4px 0' }}>{ach.rarity}</span>
                                            <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.3, marginTop: 4 }}>{ach.desc}</div>
                                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 6 }}>{unlockedBy} agent{unlockedBy !== 1 ? 's' : ''} unlocked</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Agent Detail Panel */}
                {selectedAgentData && !compareMode && (
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideIn 0.25s ease' }}>
                        <div style={{ padding: '20px', textAlign: 'center', background: `linear-gradient(135deg, ${accent}10, ${accent}05)`, borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, color: 'white', border: '3px solid white', boxShadow: `0 0 0 2px ${accent}40` }}>{selectedAgentData.avatar}</div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: '50%', background: '#16a34a', border: '2px solid white' }} />
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', fontFamily: 'Space Grotesk', marginTop: 8 }}>{selectedAgentData.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{selectedAgentData.role} · {selectedAgentData.region}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8 }}>{selectedAgentData.badges.map((b, i) => <span key={i} style={{ fontSize: '1.2rem' }}>{b}</span>)}</div>
                            {/* XP Bar */}
                            <div style={{ margin: '10px 20px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 600, marginBottom: 3 }}>
                                    <span style={{ color: '#94a3b8' }}>Level {selectedAgentData.level}</span>
                                    <span style={{ color: accent }}>{selectedAgentData.xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP</span>
                                </div>
                                <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#f1f5f9' }}>
                                    <div style={{ width: `${(selectedAgentData.xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100}%`, height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${accent}, #16a34a)` }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                {[
                                    { label: 'Recoveries', value: selectedAgentData.recoveries, color: '#16a34a' },
                                    { label: 'Success Rate', value: `${selectedAgentData.successRate}%`, color: accent },
                                    { label: 'Total Recovered', value: `₹${(selectedAgentData.totalRecovered / 100000).toFixed(1)}L`, color: '#6366f1' },
                                    { label: 'Active Streak', value: `${selectedAgentData.streak} days`, color: '#f59e0b' },
                                ].map((s, i) => (
                                    <div key={i} style={{ background: `${s.color}08`, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: s.color, fontFamily: 'Space Grotesk' }}>{s.value}</div>
                                        <div style={{ fontSize: '0.58rem', color: '#64748b', marginTop: 2 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Achievements */}
                            {selectedAgentData.achievements.length > 0 && (
                                <>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Achievements</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                                        {selectedAgentData.achievements.map((ach, i) => (
                                            <div key={i} title={`${ach.name}: ${ach.desc}`}
                                                style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: ach.unlocked ? '#f8fafc' : '#f1f5f9', border: `1px solid ${ach.unlocked ? '#e2e8f0' : '#f1f5f9'}`, opacity: ach.unlocked ? 1 : 0.35, cursor: 'default' }}>
                                                {ach.icon}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Performance Trend</div>
                            <ResponsiveContainer width="100%" height={100}>
                                <AreaChart data={selectedAgentData.trend.map((v, i) => ({ m: i + 1, v }))}>
                                    <Area type="monotone" dataKey="v" stroke={accent} fill={`${accent}20`} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
                @keyframes pulseDot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
            `}</style>
        </div>
    );
}
