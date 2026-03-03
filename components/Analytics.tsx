'use client';
import React, { useMemo, useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { computeKPIs, getChannelPerformanceData, getRecoveryTrendData } from '@/lib/data';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line, Legend, Cell,
} from 'recharts';

const METRICS = [
    { id: 'recovery', label: 'Recovery Rate', baseline: 22, ai: 38, unit: '%', delta: '+16pp', positive: true, color: '#16a34a' },
    { id: 'days', label: 'Days to Recovery', baseline: 45, ai: 28, unit: 'd', delta: '-17d', positive: true, color: '#0d9488' },
    { id: 'cost', label: 'Cost/Rupee Recovered', baseline: '₹0.08', ai: '₹0.04', unit: '', delta: '-50%', positive: true, color: '#d97706' },
    { id: 'csat', label: 'Customer CSAT', baseline: '2.1/5', ai: '3.5/5', unit: '', delta: '+67%', positive: true, color: '#ea580c' },
    { id: 'agent', label: 'Agent Productivity', baseline: 45, ai: 120, unit: '/day', delta: '+2.7×', positive: true, color: '#0d9488' },
    { id: 'contact', label: 'Contact Rate', baseline: 35, ai: 68, unit: '%', delta: '+94%', positive: true, color: '#16a34a' },
];

const monthlyData = [
    { month: 'Sep', recovered: 18, attempted: 80, cost: 1640 },
    { month: 'Oct', recovered: 22, attempted: 85, cost: 1520 },
    { month: 'Nov', recovered: 25, attempted: 90, cost: 1380 },
    { month: 'Dec', recovered: 29, attempted: 88, cost: 1200 },
    { month: 'Jan', recovered: 34, attempted: 92, cost: 980 },
    { month: 'Feb', recovered: 38, attempted: 95, cost: 847 },
];

const radarData = [
    { subject: 'Speed', A: 85, B: 40 },
    { subject: 'Accuracy', A: 92, B: 55 },
    { subject: 'Scalability', A: 95, B: 30 },
    { subject: 'Cost Eff.', A: 88, B: 45 },
    { subject: 'Compliance', A: 97, B: 70 },
    { subject: 'CSAT', A: 70, B: 42 },
];

const intentData = [
    { intent: 'Pay Now', count: 142, color: '#16a34a' },
    { intent: 'Need Time', count: 98, color: '#0d9488' },
    { intent: 'Hardship', count: 74, color: '#d97706' },
    { intent: 'Dispute', count: 31, color: '#ea580c' },
    { intent: 'No Response', count: 155, color: '#94a3b8' },
];

function MetricCard({ metric }: { metric: typeof METRICS[0] }) {
    return (
        <div style={{ background: 'var(--bg-surface)', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>{metric.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 3 }}>Baseline</div>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#dc2626', fontFamily: 'Space Grotesk' }}>
                        {typeof metric.baseline === 'number' ? `${metric.baseline}${metric.unit}` : metric.baseline}
                    </div>
                </div>
                <div style={{ background: 'rgba(22, 163, 74, 0.15)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 3 }}>DhanSetu</div>
                    <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#16a34a', fontFamily: 'Space Grotesk' }}>
                        {typeof metric.ai === 'number' ? `${metric.ai}${metric.unit}` : metric.ai}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 999 }}>
                    <div style={{
                        height: '100%', borderRadius: 999,
                        width: typeof metric.ai === 'number' && typeof metric.baseline === 'number'
                            ? `${Math.min((metric.ai / Math.max(metric.ai, metric.baseline)) * 100, 100)}%`
                            : '75%',
                        background: metric.color,
                    }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: metric.color }}>{metric.delta}</span>
            </div>
        </div>
    );
}

export default function Analytics() {
    const { loanData } = useApp();
    const { appLanguage } = useApp();
    const lang: any = appLanguage?.code || 'en-IN';
    const kpis = useMemo(() => computeKPIs(loanData), [loanData]);
    const channelData = useMemo(() => getChannelPerformanceData(), []);
    const [activeTab, setActiveTab] = useState<string>('overview');

    // ROI Simulator state
    const [portfolioSize, setPortfolioSize] = useState(500);
    const [avgLoanSize, setAvgLoanSize] = useState(250000);
    const [baselineRecovery, setBaselineRecovery] = useState(22);
    const [aiRecovery, setAiRecovery] = useState(38);
    const totalPortfolio = portfolioSize * avgLoanSize;
    const baselineAmount = totalPortfolio * baselineRecovery / 100;
    const aiAmount = totalPortfolio * aiRecovery / 100;
    const incrementalRecovery = aiAmount - baselineAmount;
    const implementationCost = portfolioSize * 850;
    const roi = Math.round((incrementalRecovery - implementationCost) / implementationCost * 100);

    // A/B state
    const [abWinner, setAbWinner] = useState<'a' | 'b' | null>(null);
    const abData = [
        { variant: 'A - Empathetic', openRate: 78, clickRate: 34, conversionRate: 28, csat: 4.2, msgs: 250 },
        { variant: 'B - Urgent', openRate: 71, clickRate: 41, conversionRate: 22, csat: 3.1, msgs: 250 },
    ];

    const TABS_LIST = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'roi', label: '💰 ROI Simulator' },
        { id: 'npa', label: '📉 NPA Reduction' },
        { id: 'productivity', label: '👤 Collector Productivity' },
        { id: 'bot', label: '🤖 Bot Analytics' },
        { id: 'channels', label: '📡 Channels' },
        { id: 'ab', label: '🧪 A/B Testing' },
    ];

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{t('analytics.title', lang)}</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '6px 0 0' }}>
                    Performance metrics, ROI comparison, NPA reduction projections, and AI effectiveness
                </p>
            </div>
            <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20, flexWrap: 'wrap' }}>
                {TABS_LIST.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', background: activeTab === t.id ? '#fff' : 'transparent', color: activeTab === t.id ? '#0d9488' : '#64748b', boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ROI Simulator */}
            {activeTab === 'roi' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Simulation Parameters</div>
                        {[
                            { label: 'Portfolio Size (accounts)', val: portfolioSize, setter: setPortfolioSize, min: 100, max: 10000, step: 100 },
                            { label: 'Avg Loan Size (₹)', val: avgLoanSize, setter: setAvgLoanSize, min: 50000, max: 2000000, step: 50000 },
                            { label: 'Baseline Recovery Rate (%)', val: baselineRecovery, setter: setBaselineRecovery, min: 5, max: 60, step: 1 },
                            { label: 'Projected AI Recovery Rate (%)', val: aiRecovery, setter: setAiRecovery, min: 10, max: 80, step: 1 },
                        ].map(p => (
                            <div key={p.label} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{p.label}</label>
                                    <span style={{ fontWeight: 800, color: '#0d9488', fontSize: '0.82rem' }}>
                                        {p.label.includes('₹') ? `₹${p.val.toLocaleString('en-IN')}` : p.label.includes('%') ? `${p.val}%` : p.val.toLocaleString()}
                                    </span>
                                </div>
                                <input type="range" min={p.min} max={p.max} step={p.step} value={p.val} onChange={e => p.setter(Number(e.target.value))} style={{ width: '100%', accentColor: '#0d9488' }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ background: 'linear-gradient(135deg, #0d9488, #16a34a)', borderRadius: 16, padding: '24px', color: 'white' }}>
                            <div style={{ fontSize: '0.72rem', opacity: 0.8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Incremental Recovery</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Space Grotesk' }}>₹{Math.round(incrementalRecovery / 10000000).toFixed(1)} Cr</div>
                            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 4 }}>Additional recovery with DhanSetu vs baseline</div>
                        </div>
                        {[
                            { label: 'Total Portfolio', val: `₹${Math.round(totalPortfolio / 10000000).toFixed(1)} Cr`, color: '#0f172a', bg: '#f8fafc' },
                            { label: 'Baseline Recovery', val: `₹${Math.round(baselineAmount / 10000000).toFixed(1)} Cr`, color: '#dc2626', bg: '#fef2f2' },
                            { label: 'AI Recovery', val: `₹${Math.round(aiAmount / 10000000).toFixed(1)} Cr`, color: '#16a34a', bg: '#f0fdf4' },
                            { label: 'Implementation Cost', val: `₹${Math.round(implementationCost / 100000).toFixed(1)}L`, color: '#d97706', bg: '#fffbeb' },
                            { label: 'First-Year ROI', val: `${roi}%`, color: roi > 0 ? '#16a34a' : '#dc2626', bg: roi > 0 ? '#f0fdf4' : '#fef2f2' },
                        ].map(item => (
                            <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: '14px 18px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{item.label}</span>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* NPA Reduction */}
            {activeTab === 'npa' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>NPA Reduction Projection (12 months)</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={[
                                { month: 'M1', npa: 8.2, target: 7.5 }, { month: 'M2', npa: 7.8, target: 7.2 },
                                { month: 'M3', npa: 7.4, target: 6.9 }, { month: 'M4', npa: 7.1, target: 6.5 },
                                { month: 'M5', npa: 6.8, target: 6.1 }, { month: 'M6', npa: 6.4, target: 5.8 },
                                { month: 'M7', npa: 6.0, target: 5.5 }, { month: 'M8', npa: 5.7, target: 5.1 },
                                { month: 'M9', npa: 5.4, target: 4.8 }, { month: 'M10', npa: 5.2, target: 4.5 },
                                { month: 'M11', npa: 4.9, target: 4.2 }, { month: 'M12', npa: 4.7, target: 4.0 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                                <Line type="monotone" dataKey="npa" name="Actual NPA %" stroke="#0d9488" strokeWidth={2.5} dot={{ fill: '#0d9488', r: 3 }} />
                                <Line type="monotone" dataKey="target" name="Target NPA %" stroke="#16a34a" strokeWidth={2} strokeDasharray="5 3" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>NPA Impact Summary</div>
                        {[
                            { label: 'Starting NPA %', val: '8.2%', color: '#dc2626', change: '' },
                            { label: 'Projected End (Month 12)', val: '4.7%', color: '#16a34a', change: '-3.5pp' },
                            { label: 'Capital Released', val: '₹4.2 Cr', color: '#0d9488', change: '' },
                            { label: 'Provision Cost Saved', val: '₹1.8 Cr', color: '#16a34a', change: '' },
                            { label: 'NPA Reduction Rate', val: '42.7%', color: '#0d9488', change: '' },
                            { label: 'RBI NPA Threshold', val: '5.0%', color: '#d97706', change: 'Target by M9' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{item.label}</div>
                                    {item.change && <div style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700 }}>{item.change}</div>}
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '1rem', color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Collector Productivity */}
            {activeTab === 'productivity' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Agent Performance Dashboard</div>
                        {[
                            { name: 'Ravi Kumar', contacts: 142, ptps: 38, resolved: 24, target: 30 },
                            { name: 'Priya Singh', contacts: 128, ptps: 42, resolved: 28, target: 30 },
                            { name: 'Arjun Mehta', contacts: 167, ptps: 51, resolved: 32, target: 30 },
                            { name: 'Sunita Devi', contacts: 119, ptps: 29, resolved: 18, target: 30 },
                        ].map(agent => (
                            <div key={agent.name} style={{ padding: '14px', background: '#f8fafc', borderRadius: 10, marginBottom: 10, border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{agent.name}</div>
                                    <span style={{ background: agent.resolved >= agent.target ? '#f0fdf4' : '#fef2f2', color: agent.resolved >= agent.target ? '#16a34a' : '#dc2626', border: `1px solid ${agent.resolved >= agent.target ? '#bbf7d0' : '#fecaca'}`, borderRadius: 999, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 }}>
                                        {agent.resolved >= agent.target ? '✅ On Target' : '⚠️ Below Target'}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                                    {[['Contacts', agent.contacts], ['PTPs', agent.ptps], ['Resolved', agent.resolved]].map(([k, v]) => (
                                        <div key={k as string} style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0d9488', fontFamily: 'Space Grotesk' }}>{v}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{k}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>AI vs Human Productivity</div>
                        {[
                            { metric: 'Contacts/Day', human: 45, ai: 500, unit: '' },
                            { metric: 'Cost/Recovery', human: 820, ai: 95, unit: '₹' },
                            { metric: 'Avg Handle Time', human: 8.5, ai: 0.3, unit: 'min' },
                            { metric: 'PTPs Captured/Day', human: 12, ai: 140, unit: '' },
                            { metric: 'Multilingual', human: 1, ai: 10, unit: ' languages' },
                            { metric: 'Availability', human: 9, ai: 24, unit: 'hrs' },
                        ].map(item => (
                            <div key={item.metric} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                                    <span>{item.metric}</span>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <span style={{ color: '#dc2626' }}>👤 {item.human}{item.unit}</span>
                                        <span style={{ color: '#16a34a' }}>🤖 {item.ai}{item.unit}</span>
                                    </div>
                                </div>
                                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, position: 'relative' }}>
                                    <div style={{ height: '100%', width: `${Math.min(item.ai / (item.ai + item.human) * 100, 95)}%`, background: 'linear-gradient(90deg, #0d9488, #16a34a)', borderRadius: 999 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* A/B Testing */}
            {activeTab === 'ab' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        {abData.map((v, idx) => (
                            <div key={v.variant} style={{ background: '#fff', borderRadius: 16, padding: '24px', border: `2px solid ${abWinner !== null && abWinner === (['a', 'b'][idx] as 'a' | 'b') ? '#0d9488' : '#e2e8f0'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>Variant {idx === 0 ? 'A' : 'B'}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{v.variant}</div>
                                    </div>
                                    {abWinner === ['a', 'b'][idx] && (
                                        <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 999, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, height: 'fit-content' }}>🏆 WINNER</span>
                                    )}
                                </div>
                                {[
                                    { k: 'Messages Sent', v: v.msgs, unit: '' },
                                    { k: 'Open Rate', v: v.openRate, unit: '%' },
                                    { k: 'Click Rate', v: v.clickRate, unit: '%' },
                                    { k: 'Conversion Rate', v: v.conversionRate, unit: '%' },
                                    { k: 'Customer CSAT', v: v.csat, unit: '/5' },
                                ].map(item => (
                                    <div key={item.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.k}</span>
                                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0d9488', fontFamily: 'Space Grotesk' }}>{item.v}{item.unit}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Statistical Significance</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Variant A (Empathetic) shows 27% higher conversion. P-value: 0.023 (statistically significant at 95% confidence)
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setAbWinner('a')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0d9488, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                                🏆 Select Variant A
                            </button>
                            <button onClick={() => setAbWinner('b')} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                                Select Variant B
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {activeTab === 'overview' && (
                <>
                    {/* Top summary */}
                    <div style={{ background: 'linear-gradient(135deg, #0d9488, #16a34a)', borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: 'white', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                        {[
                            { label: 'Total Portfolio', val: `₹${Math.round(kpis.totalOutstanding / 10000000)} Cr` },
                            { label: 'Projected Recovery', val: `₹${Math.round(kpis.projectedRecovery / 10000000)} Cr` },
                            { label: 'Avg Risk Score', val: `${kpis.avgRiskScore}/100` },
                            { label: 'Recovery Rate', val: `${kpis.avgRecovery}%` },
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ fontSize: '0.72rem', opacity: 0.8, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.label}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{item.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Metrics grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                        {METRICS.map(m => <MetricCard key={m.id} metric={m} />)}
                    </div>

                    {/* Charts row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
                        <div style={{ background: '#fff', borderRadius: 16, padding: '22px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: 4 }}>Monthly Recovery Performance</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginBottom: 16 }}>Recovery rate (%) and cost per recovery (₹)</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="₹" />
                                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem', border: '1px solid #e2e8f0' }} />
                                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="recovered" name="Recovery %" stroke="#0d9488" strokeWidth={2.5} dot={{ fill: '#0d9488', r: 4 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost/Recovery ₹" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 3" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ background: '#fff', borderRadius: 16, padding: '22px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: 4 }}>AI vs Human: Capability Radar</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginBottom: 16 }}>DhanSetu (teal) vs Traditional (red)</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <Radar name="DhanSetu" dataKey="A" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
                                    <Radar name="Traditional" dataKey="B" stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} />
                                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'bot' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '22px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: 16 }}>Bot Intent Distribution</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={intentData} layout="vertical" barSize={18}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="intent" type="category" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={90} />
                                <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} />
                                <Bar dataKey="count" name="Conversations" radius={[0, 4, 4, 0]}>
                                    {intentData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '22px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: 16 }}>Bot Performance KPIs</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { label: 'Conversations Handled', val: '5,247', icon: '💬', color: '#0d9488' },
                                { label: 'Resolution Rate (Bot Only)', val: '64%', icon: '✅', color: '#16a34a' },
                                { label: 'Avg. Conversation Length', val: '4.2 min', icon: '⏱️', color: '#d97706' },
                                { label: 'Human Escalation Rate', val: '18%', icon: '🤝', color: '#ea580c' },
                                { label: 'Cost Savings vs. Calls', val: '₹23.7L/month', icon: '💰', color: '#16a34a' },
                                { label: 'Promise-to-Pay Captured', val: '1,847', icon: '🤞', color: '#0d9488' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>{item.label}</span>
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'channels' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: '22px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: 16 }}>Channel Performance Comparison</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={channelData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="channel" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.8rem' }} formatter={(v: any) => `${v}%`} />
                                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                                <Bar dataKey="contactRate" name="Contact Rate" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="responseRate" name="Response Rate" fill="#d97706" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="conversionRate" name="Conversion" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                        {channelData.map(ch => (
                            <div key={ch.channel} style={{ background: '#fff', borderRadius: 14, padding: '18px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: 12 }}>
                                    {ch.channel === 'WhatsApp' ? '📱' : ch.channel === 'SMS' ? '💬' : ch.channel === 'Call' ? '📞' : '✉️'} {ch.channel}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { k: 'Contact Rate', v: `${ch.contactRate}%` },
                                        { k: 'Response Rate', v: `${ch.responseRate}%` },
                                        { k: 'Conversion', v: `${ch.conversionRate}%` },
                                        { k: 'Cost/Contact', v: `₹${ch.costPerContact}` },
                                    ].map(item => (
                                        <div key={item.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                                            <span style={{ color: '#94a3b8' }}>{item.k}</span>
                                            <span style={{ fontWeight: 700, color: ch.color }}>{item.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

