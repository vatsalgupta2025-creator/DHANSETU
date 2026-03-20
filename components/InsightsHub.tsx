'use client';
import React, { useMemo, useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { LoanRecord } from '@/lib/data';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend } from 'recharts';

// ======================== EARLY WARNING SIGNALS ========================
function EarlyWarning({ data }: { data: LoanRecord[] }) {
    const earlyWarning = useMemo(() => data.filter(r =>
        r.loan.currentDpd === 0 && (r.loan.creditScore < 660 || r.loan.bounceCount6m >= 2 || r.loan.avgBalance3m < r.loan.emiAmount * 1.3)
    ), [data]);

    const signals = [
        { label: 'Credit Score Declining', count: earlyWarning.filter(r => r.loan.creditScore < 640).length, icon: '📉', color: '#dc2626', desc: 'Score < 640' },
        { label: 'EMI Bounce History', count: earlyWarning.filter(r => r.loan.bounceCount6m >= 2).length, icon: '🔴', color: '#ea580c', desc: '2+ bounces in 6m' },
        { label: 'Low Account Balance', count: earlyWarning.filter(r => r.loan.avgBalance3m < r.loan.emiAmount * 1.5).length, icon: '💸', color: '#d97706', desc: 'Balance < 1.5× EMI' },
        { label: 'Frequent Transactions', count: Math.round(earlyWarning.length * 0.3), icon: '🔄', color: '#0d9488', desc: 'Unusual withdrawals' },
    ];

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
                {signals.map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'Space Grotesk' }}>{s.count}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{s.desc}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#fffbeb', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.85rem' }}>⚠️</span>
                    <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.82rem' }}>Early Warning List — {earlyWarning.length} at-risk accounts (DPD = 0 but signals present)</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            {['Borrower', 'Product', 'Credit Score', 'Bounces (6m)', 'Balance/EMI Ratio', 'Warning Level', 'Recommended Action'].map(h => (
                                <th key={h} style={{ padding: '9px 14px', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {earlyWarning.slice(0, 8).map(r => {
                            const ratio = r.loan.avgBalance3m / r.loan.emiAmount;
                            const level = r.loan.creditScore < 600 ? 'SEVERE' : r.loan.bounceCount6m >= 3 ? 'HIGH' : 'MODERATE';
                            const levelColors: Record<string, string> = { SEVERE: '#dc2626', HIGH: '#ea580c', MODERATE: '#d97706' };
                            return (
                                <tr key={r.customer.id} style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{r.customer.name}</div>
                                        <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{r.customer.id}</div>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: '#475569' }}>{r.loan.product}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ fontWeight: 700, color: r.loan.creditScore < 640 ? '#dc2626' : '#d97706', fontSize: '0.82rem' }}>{r.loan.creditScore}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: r.loan.bounceCount6m >= 2 ? '#ea580c' : '#475569' }}>{r.loan.bounceCount6m}</td>
                                    <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: ratio < 1.5 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{ratio.toFixed(1)}×</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ background: levelColors[level] + '18', color: levelColors[level], border: `1px solid ${levelColors[level]}30`, borderRadius: 999, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 }}>{level}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>
                                        {level === 'SEVERE' ? '📞 Proactive call' : level === 'HIGH' ? '📱 WhatsApp nudge' : '💬 SMS reminder'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ======================== UPLIFT MODELING ========================
function UpliftModel({ data }: { data: LoanRecord[] }) {
    const scatterData = useMemo(() => data.slice(0, 200).map(r => ({
        uplift: r.risk.upliftScore,
        risk: r.risk.riskScore,
        tier: r.risk.riskTier,
        name: r.customer.name,
        segment: r.risk.upliftScore > 60 && r.risk.riskScore < 70 ? 'Persuadable' :
            r.risk.upliftScore < 30 ? 'Hopeless' :
                r.risk.riskScore > 80 ? 'High-Risk Willing' : 'Undecided',
    })), [data]);

    const segments = [
        { name: 'Persuadable', desc: 'High uplift + moderate risk → prioritize', color: '#16a34a', count: scatterData.filter(d => d.segment === 'Persuadable').length, action: 'Send personalized WhatsApp offer' },
        { name: 'Undecided', desc: 'Needs right message at right time', color: '#d97706', count: scatterData.filter(d => d.segment === 'Undecided').length, action: 'A/B test tone; try empathetic' },
        { name: 'High-Risk Willing', desc: 'Critical risk but shows intent', color: '#ea580c', count: scatterData.filter(d => d.segment === 'High-Risk Willing').length, action: 'Urgent bot + restructure offer' },
        { name: 'Hopeless', desc: 'Low uplift → legal escalation', color: '#94a3b8', count: scatterData.filter(d => d.segment === 'Hopeless').length, action: 'Escalate to collections agent' },
    ];

    const colorMap: Record<string, string> = { 'Persuadable': '#16a34a', 'Undecided': '#d97706', 'High-Risk Willing': '#ea580c', 'Hopeless': '#94a3b8' };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Uplift vs Risk Score Matrix</div>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginBottom: 14 }}>Each dot = 1 borrower. Focus resources on top-left (high uplift, lower risk)</div>
                <ResponsiveContainer width="100%" height={260}>
                    <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="risk" name="Risk Score" type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} label={{ value: 'Risk Score →', position: 'insideBottom', offset: -12, style: { fontSize: 10, fill: '#94a3b8' } }} />
                        <YAxis dataKey="uplift" name="Uplift Score" type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} label={{ value: 'Uplift ↑', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#94a3b8' } }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 8, fontSize: '0.75rem', border: '1px solid #e2e8f0' }}
                            formatter={(v, name) => [v, name]}
                            labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''} />
                        <Scatter data={scatterData} fill="#0d9488">
                            {scatterData.map((entry, i) => (
                                <Cell key={i} fill={colorMap[entry.segment]} opacity={0.7} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {segments.map(seg => (
                    <div key={seg.name} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: `1px solid ${seg.color}30` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div>
                                <div style={{ fontWeight: 700, color: seg.color, fontSize: '0.88rem' }}>{seg.name}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 1 }}>{seg.desc}</div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: seg.color, fontFamily: 'Space Grotesk' }}>{seg.count}</div>
                        </div>
                        <div style={{ fontSize: '0.7rem', background: seg.color + '10', color: seg.color, borderRadius: 6, padding: '4px 8px', fontWeight: 600 }}>
                            → {seg.action}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ======================== NEXT-BEST-ACTION ENGINE ========================
function NextBestAction({ data }: { data: LoanRecord[] }) {
    const actions = useMemo(() => {
        const actionMap: Record<string, { color: string; icon: string; reason: string }> = {
            'Immediate Call': { color: '#dc2626', icon: '📞', reason: 'Critical risk + phone-responsive profile' },
            'WhatsApp Offer': { color: '#16a34a', icon: '📱', reason: 'High uplift + digital engagement profile' },
            'EMI Restructure': { color: '#d97706', icon: '🔄', reason: 'Hardship signals + willing to cooperate' },
            'Legal Notice': { color: '#475569', icon: '⚖️', reason: 'Low uplift + repeat non-responder' },
            'Early Outreach': { color: '#0d9488', icon: '⏰', reason: 'Pre-DPD warning signals detected' },
            'SMS Nudge': { color: '#ea580c', icon: '💬', reason: 'Short overdue + SMS-responsive history' },
        };
        return data.slice(0, 10).map(r => {
            let action = 'SMS Nudge';
            if (r.risk.riskTier === 'Critical' && r.risk.upliftScore < 30) action = 'Legal Notice';
            else if (r.risk.riskTier === 'Critical') action = 'Immediate Call';
            else if (r.risk.upliftScore > 65) action = 'WhatsApp Offer';
            else if (r.loan.currentDpd > 30 && r.risk.riskScore > 60) action = 'EMI Restructure';
            else if (r.loan.currentDpd === 0) action = 'Early Outreach';
            return { ...r, nextAction: action, ...actionMap[action] };
        });
    }, [data]);

    const summary = ['Immediate Call', 'WhatsApp Offer', 'EMI Restructure', 'SMS Nudge', 'Early Outreach', 'Legal Notice'].map(a => ({
        action: a,
        count: data.filter(r => {
            if (a === 'Legal Notice') return r.risk.riskTier === 'Critical' && r.risk.upliftScore < 30;
            if (a === 'Immediate Call') return r.risk.riskTier === 'Critical' && r.risk.upliftScore >= 30;
            if (a === 'WhatsApp Offer') return r.risk.upliftScore > 65 && r.risk.riskTier !== 'Critical';
            if (a === 'EMI Restructure') return r.loan.currentDpd > 30 && r.risk.riskScore > 60 && r.risk.upliftScore <= 65;
            if (a === 'Early Outreach') return r.loan.currentDpd === 0;
            return r.loan.currentDpd <= 15;
        }).length,
        color: ['#dc2626', '#16a34a', '#d97706', '#ea580c', '#0d9488', '#475569'][['Immediate Call', 'WhatsApp Offer', 'EMI Restructure', 'SMS Nudge', 'Early Outreach', 'Legal Notice'].indexOf(a)],
    }));

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Action Distribution (All 500)</div>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={summary} layout="vertical" barSize={16}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="action" type="category" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={110} />
                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.78rem' }} />
                        <Bar dataKey="count" name="Accounts" radius={[0, 4, 4, 0]}>
                            {summary.map((s, i) => <Cell key={i} fill={s.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    Per-Account NBA Queue
                </div>
                <div style={{ overflowY: 'auto', maxHeight: 280 }}>
                    {actions.map((r, i) => (
                        <div key={r.customer.id} style={{ padding: '11px 18px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{r.customer.name}</div>
                                <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{r.reason}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: '0.9rem' }}>{r.icon}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: r.color, background: r.color + '15', borderRadius: 6, padding: '3px 7px', border: `1px solid ${r.color}25` }}>{r.nextAction}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ======================== BEHAVIORAL SEGMENTATION ========================
function BehavioralSegmentation({ data }: { data: LoanRecord[] }) {
    const segments = useMemo(() => {
        const struggling = data.filter(r => r.loan.bounceCount6m >= 2 && r.loan.creditScore < 650 && r.loan.avgBalance3m < r.loan.emiAmount * 2);
        const seasonal = data.filter(r => r.customer.occupation === 'farmer' || r.customer.occupation === 'self_employed');
        const strategic = data.filter(r => r.loan.creditScore > 700 && r.loan.currentDpd > 15);
        const fraudulent = data.filter(r => r.risk.riskScore > 85 && r.risk.upliftScore < 20 && r.loan.bounceCount6m >= 3);
        const regular = data.filter(r => !struggling.includes(r) && !seasonal.includes(r) && !strategic.includes(r) && !fraudulent.includes(r));
        return [
            { name: 'Genuinely Struggling', count: struggling.length, color: '#d97706', icon: '😔', desc: 'Financial difficulty — soft approach needed', strategy: 'Hardship mode + EMI restructure' },
            { name: 'Seasonal Defaulter', count: seasonal.length, color: '#0d9488', icon: '🌾', desc: 'Occupation-driven cash flow gaps', strategy: 'Flexible repayment windows' },
            { name: 'Strategic Defaulter', count: strategic.length, color: '#dc2626', icon: '🎯', desc: 'High credit but willfully delaying', strategy: 'Legal notice + credit score warning' },
            { name: 'Fraud Intent Detected', count: fraudulent.length, color: '#7c3aed', icon: '🚨', desc: 'Intentional non-payment pattern', strategy: 'Escalate + block fresh disbursals' },
            { name: 'Standard Recovery', count: regular.length, color: '#16a34a', icon: '✅', desc: 'Normal recovery workflow applies', strategy: 'Automated campaign flow' },
        ];
    }, [data]);

    const radarData = [
        { metric: 'Engagement', struggling: 55, strategic: 20, seasonal: 75, fraudulent: 10 },
        { metric: 'Pay Intent', struggling: 70, strategic: 30, seasonal: 65, fraudulent: 5 },
        { metric: 'Risk Score', struggling: 65, strategic: 80, seasonal: 55, fraudulent: 95 },
        { metric: 'Uplift', struggling: 60, strategic: 25, seasonal: 70, fraudulent: 8 },
        { metric: 'CSAT', struggling: 50, strategic: 40, seasonal: 60, fraudulent: 15 },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {segments.map(seg => (
                    <div key={seg.name} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{seg.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: seg.color }}>{seg.name}</div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: seg.color, fontFamily: 'Space Grotesk' }}>{seg.count}</div>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 5 }}>{seg.desc}</div>
                            <div style={{ fontSize: '0.68rem', background: seg.color + '12', color: seg.color, borderRadius: 5, padding: '3px 7px', fontWeight: 600, display: 'inline-block' }}>
                                Strategy: {seg.strategy}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Segment Behavior Radar</div>
                <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginBottom: 14 }}>Comparing 4 key segments across 5 dimensions</div>
                <ResponsiveContainer width="100%" height={270}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Radar name="Struggling" dataKey="struggling" stroke="#d97706" fill="#d97706" fillOpacity={0.15} />
                        <Radar name="Strategic" dataKey="strategic" stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} />
                        <Radar name="Seasonal" dataKey="seasonal" stroke="#0d9488" fill="#0d9488" fillOpacity={0.15} />
                        <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.75rem' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ======================== FRAUD & INTENT DETECTION ========================
function FraudDetection({ data }: { data: LoanRecord[] }) {
    const flagged = useMemo(() => data.filter(r =>
        r.risk.riskScore > 80 && r.risk.upliftScore < 25 && r.loan.bounceCount6m >= 3
    ).slice(0, 8), [data]);

    const indicators = [
        { label: 'Multiple Bounce Clusters', count: data.filter(r => r.loan.bounceCount6m >= 4).length, color: '#dc2626' },
        { label: 'Credit Score vs Overdue Mismatch', count: data.filter(r => r.loan.creditScore > 680 && r.risk.riskScore > 75).length, color: '#ea580c' },
        { label: 'Low Uplift Despite Outreach', count: data.filter(r => r.risk.upliftScore < 15 && r.loan.currentDpd > 30).length, color: '#d97706' },
        { label: 'Rapid Asset Withdrawal Pattern', count: data.filter(r => r.loan.avgBalance3m < r.loan.emiAmount * 0.5).length, color: '#7c3aed' },
    ];

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
                {indicators.map(ind => (
                    <div key={ind.label} style={{ background: '#fff', borderRadius: 12, padding: '14px', border: `1px solid ${ind.color}25` }}>
                        <div style={{ fontWeight: 800, fontSize: '1.6rem', color: ind.color, fontFamily: 'Space Grotesk' }}>{ind.count}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4, fontWeight: 500 }}>{ind.label}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg, #fef2f2, #fff7ed)', borderBottom: '1px solid #fecaca' }}>
                    <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.88rem' }}>🚨 Fraud Intent Flagged Accounts</div>
                    <div style={{ fontSize: '0.7rem', color: '#92400e', marginTop: 2 }}>Accounts showing intentional default pattern — escalate to legal team</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            {['Borrower', 'Overdue', 'Credit Score', 'Bounces', 'Uplift', 'Intent Score', 'Fraud Signals', 'Status'].map(h => (
                                <th key={h} style={{ padding: '8px 12px', fontSize: '0.63rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {flagged.map(r => {
                            const intentScore = Math.max(0, 100 - r.risk.upliftScore - (r.loan.creditScore > 680 ? 10 : 0) + r.loan.bounceCount6m * 5);
                            return (
                                <tr key={r.customer.id} style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '10px 12px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>{r.customer.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{r.customer.region}</div>
                                    </td>
                                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#dc2626', fontSize: '0.8rem' }}>₹{r.loan.overdueAmount.toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#475569' }}>{r.loan.creditScore}</td>
                                    <td style={{ padding: '10px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#ea580c' }}>{r.loan.bounceCount6m}</td>
                                    <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#dc2626', fontWeight: 700 }}>{r.risk.upliftScore}/100</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 999 }}>
                                                <div style={{ height: '100%', width: `${Math.min(intentScore, 100)}%`, background: '#dc2626', borderRadius: 999 }} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626' }}>{intentScore}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 12px', fontSize: '0.68rem', color: '#475569' }}>High bounce + Low uplift</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 999, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 }}>Escalated</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ======================== CHANNEL OPTIMIZATION ========================
function ChannelOptimization({ data }: { data: LoanRecord[] }) {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Deterministic heatmap seeded by day/hour
    const heatmap = days.map((day, di) =>
        hours.map((hr, hi) => {
            const val = ((di * 7 + hi * 3 + 42) % 60) + 20;
            return { day, hour: hr, value: val };
        })
    );
    const peak = { day: 'Tue', hour: 14, value: 78 };

    const channelStats = [
        { channel: 'WhatsApp', openRate: 82, convRate: 34, avgTime: '10:30 AM', icon: '📱', color: '#16a34a' },
        { channel: 'IVR Call', openRate: 61, convRate: 22, avgTime: '11:00 AM', icon: '📞', color: '#0d9488' },
        { channel: 'SMS', openRate: 45, convRate: 14, avgTime: '9:00 AM', icon: '💬', color: '#d97706' },
        { channel: 'Email', openRate: 28, convRate: 8, avgTime: '2:00 PM', icon: '📧', color: '#475569' },
    ];

    const topAccounts = data.slice(0, 8).map((r, i) => ({
        name: r.customer.name,
        channel: r.risk.bestChannel,
        time: ['9:30 AM', '10:00 AM', '11:30 AM', '2:00 PM', '3:30 PM', '9:00 AM', '11:00 AM', '4:00 PM'][i % 8],
        day: days[i % 7],
        score: 65 + (i * 4 % 30),
    }));

    const getHeatColor = (val: number) => {
        if (val > 65) return '#16a34a';
        if (val > 50) return '#0d9488';
        if (val > 35) return '#d97706';
        return '#e2e8f0';
    };

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Contact Time Heatmap */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Optimal Contact Time Heatmap</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 14 }}>Green = highest response rate. Peak: <strong style={{ color: '#16a34a' }}>{peak.day} {peak.hour}:00</strong></div>
                    <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${hours.length}, 1fr)`, gap: 3 }}>
                        <div style={{ fontSize: '0.6rem', color: '#94a3b8' }} />
                        {hours.map(h => <div key={h} style={{ fontSize: '0.58rem', color: '#94a3b8', textAlign: 'center' }}>{h}h</div>)}
                        {heatmap.map((dayRow) => (
                            <React.Fragment key={dayRow[0].day}>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center' }}>{dayRow[0].day}</div>
                                {dayRow.map((cell) => (
                                    <div key={cell.hour} title={`${cell.value}% response`}
                                        style={{ height: 22, borderRadius: 4, background: getHeatColor(cell.value), opacity: 0.85, cursor: 'default' }} />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: '0.62rem', color: '#94a3b8', alignItems: 'center' }}>
                        {[['#e2e8f0', 'Low (<35%)'], ['#d97706', 'Mid (35-50%)'], ['#0d9488', 'Good (50-65%)'], ['#16a34a', 'Peak (>65%)']].map(([c, l]) => (
                            <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: c as string }} />
                                {l}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Channel Performance */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Channel Performance</div>
                    {channelStats.map(c => (
                        <div key={c.channel} style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <span>{c.icon}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{c.channel}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 10, fontSize: '0.7rem' }}>
                                    <span style={{ color: '#0d9488', fontWeight: 700 }}>Open: {c.openRate}%</span>
                                    <span style={{ color: '#16a34a', fontWeight: 700 }}>Conv: {c.convRate}%</span>
                                </div>
                            </div>
                            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999 }}>
                                <div style={{ height: '100%', width: `${c.openRate}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}cc)`, borderRadius: 999 }} />
                            </div>
                            <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 3 }}>Best time: {c.avgTime}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Per-account schedule */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>AI-Recommended Contact Schedule</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            {['Borrower', 'Best Channel', 'Best Day', 'Best Time', 'Engagement Score', 'Action'].map(h => (
                                <th key={h} style={{ padding: '8px 14px', fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {topAccounts.map(acc => (
                            <tr key={acc.name} style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '9px 14px', fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{acc.name}</td>
                                <td style={{ padding: '9px 14px', fontSize: '0.75rem', color: '#0d9488', fontWeight: 700, textTransform: 'capitalize' }}>{acc.channel === 'whatsapp' ? '📱 WhatsApp' : acc.channel === 'call' ? '📞 Call' : acc.channel === 'sms' ? '💬 SMS' : '📧 Email'}</td>
                                <td style={{ padding: '9px 14px', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{acc.day}</td>
                                <td style={{ padding: '9px 14px', fontSize: '0.78rem', color: '#475569' }}>{acc.time}</td>
                                <td style={{ padding: '9px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 999 }}>
                                            <div style={{ height: '100%', width: `${acc.score}%`, background: '#0d9488', borderRadius: 999 }} />
                                        </div>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488' }}>{acc.score}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '9px 14px' }}>
                                    <button style={{ padding: '4px 10px', background: 'linear-gradient(135deg, #0d9488, #16a34a)', color: 'white', border: 'none', borderRadius: 7, fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>📅 Schedule</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ======================== MAIN PAGE ========================
const TABS = [
    { id: 'early', label: '⏰ Early Warning' },
    { id: 'uplift', label: '🎯 Uplift Model' },
    { id: 'nba', label: '⚡ Next-Best-Action' },
    { id: 'segments', label: '👥 Behavioral Segments' },
    { id: 'fraud', label: '🚨 Fraud Detection' },
    { id: 'channel', label: '📡 Channel Optimization' },
];

export default function InsightsHub() {
    const { loanData } = useApp();
    const { appLanguage } = useApp();
    const lang: any = appLanguage?.code || 'en-IN';
    const [tab, setTab] = useState<string>('early');

    const earlyWarningCount = loanData.filter(r =>
        r.loan.currentDpd === 0 && (r.loan.creditScore < 660 || r.loan.bounceCount6m >= 2)
    ).length;

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{t('analytics.title', lang)}</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '6px 0 0' }}>
                    AI-powered intelligence layer — early warnings, uplift models, next-best-actions, behavioral segments, fraud detection
                </p>
            </div>

            {/* Summary strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
                {[
                    { label: 'Early Warnings', val: earlyWarningCount, color: '#d97706', bg: '#fffbeb' },
                    { label: 'Persuadable Accounts', val: loanData.filter(r => r.risk.upliftScore > 65).length, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'NBA Queued', val: loanData.length, color: '#0d9488', bg: '#f0fdfa' },
                    { label: 'Behavioral Clusters', val: 5, color: '#ea580c', bg: '#fff7ed' },
                    { label: 'Fraud Flagged', val: loanData.filter(r => r.risk.riskScore > 80 && r.risk.upliftScore < 25 && r.loan.bounceCount6m >= 3).length, color: '#dc2626', bg: '#fef2f2' },
                ].map(item => (
                    <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: '12px 14px', border: `1px solid ${item.color}20` }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500, marginTop: 2 }}>{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20, flexWrap: 'wrap' }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        style={{
                            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                            background: tab === t.id ? '#fff' : 'transparent',
                            color: tab === t.id ? '#0d9488' : '#64748b',
                            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                            transition: 'all 0.15s',
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === 'early' && <EarlyWarning data={loanData} />}
            {tab === 'uplift' && <UpliftModel data={loanData} />}
            {tab === 'nba' && <NextBestAction data={loanData} />}
            {tab === 'segments' && <BehavioralSegmentation data={loanData} />}
            {tab === 'fraud' && <FraudDetection data={loanData} />}
            {tab === 'channel' && <ChannelOptimization data={loanData} />}
        </div>
    );
}
