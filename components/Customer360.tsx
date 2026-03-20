'use client';
import React, { useMemo } from 'react';
import { useApp } from '@/lib/context';
import { LoanRecord } from '@/lib/data';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
} from 'recharts';

function generatePaymentHistory(record: LoanRecord) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const history = [];
    const dpd = record.loan.currentDpd;
    const emi = record.loan.emiAmount;
    for (let i = 11; i >= 0; i--) {
        const mIdx = (new Date().getMonth() - i + 12) % 12;
        const missed = i < dpd / 30;
        const partial = !missed && Math.random() < 0.15;
        history.push({
            month: months[mIdx],
            amount: missed ? 0 : partial ? Math.round(emi * 0.5) : emi,
            status: missed ? 'Missed' : partial ? 'Partial' : 'Paid',
            due: emi,
        });
    }
    return history;
}

function generateRiskTrend(record: LoanRecord) {
    const score = record.risk.riskScore;
    const trend = [];
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    for (let i = 0; i < 9; i++) {
        const variation = (Math.sin(i * 0.8) * 15) + (i * (score > 50 ? 3 : -2));
        trend.push({
            month: months[i],
            score: Math.max(5, Math.min(100, Math.round(score - 20 + variation + i * 2))),
        });
    }
    return trend;
}

function generateCommLog(record: LoanRecord) {
    const channels = ['WhatsApp', 'SMS', 'Phone Call', 'Email', 'Voice Bot'];
    const statuses = ['Delivered', 'Read', 'Answered', 'No Response', 'Partial Response'];
    const log = [];
    const prevResponses = record.loan.previousResponses || [];
    for (let i = 0; i < 6; i++) {
        const daysAgo = (i + 1) * 5 + Math.floor(Math.random() * 3);
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        log.push({
            date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            channel: channels[i % channels.length],
            message: i === 0 ? 'Payment reminder sent' : i === 1 ? 'Follow-up call attempted' : i === 2 ? 'Restructuring offer shared' : i === 3 ? 'Automated voice reminder' : i === 4 ? 'Settlement proposal' : 'Initial outreach',
            status: prevResponses[i] || statuses[i % statuses.length],
        });
    }
    return log;
}

function getAISuggestion(record: LoanRecord) {
    const { riskTier, bestChannel, bestTime, expectedRecovery } = record.risk;
    const dpd = record.loan.currentDpd;

    if (riskTier === 'Critical') {
        return {
            action: 'Escalate to Legal Team',
            detail: `Account ${dpd} DPD with critical risk. Recommend immediate settlement offer at ${Math.round(expectedRecovery * 100)}% recovery rate via ${bestChannel} during ${bestTime}.`,
            urgency: 'high',
            steps: ['Send final notice via registered post', 'Offer one-time settlement at 70-80%', 'Prepare SARFAESI proceedings if no response in 7 days', 'Flag for NPA provisioning'],
        };
    }
    if (riskTier === 'High') {
        return {
            action: 'Intensive Follow-up Required',
            detail: `High risk borrower at ${dpd} DPD. Best channel: ${bestChannel} at ${bestTime}. Expected recovery: ${Math.round(expectedRecovery * 100)}%.`,
            urgency: 'medium',
            steps: ['Personal call from recovery manager', `Send restructuring options via ${bestChannel}`, 'Offer EMI moratorium of 2-3 months', 'Schedule field visit if no response'],
        };
    }
    if (riskTier === 'Medium') {
        return {
            action: 'Proactive Engagement',
            detail: `Medium risk. Engage via ${bestChannel} at ${bestTime} for early resolution. Strong ${Math.round(expectedRecovery * 100)}% recovery potential.`,
            urgency: 'low',
            steps: ['Automated reminder via preferred channel', 'Offer flexible repayment plan', 'Share payment link with one-click options', 'Monitor for 15 days before escalation'],
        };
    }
    return {
        action: 'Maintain & Monitor',
        detail: `Low risk account. Continue regular engagement on ${bestChannel}. Excellent ${Math.round(expectedRecovery * 100)}% recovery expected.`,
        urgency: 'none',
        steps: ['Standard automated reminders', 'Cross-sell insurance products', 'Positive engagement for retention', 'Annual review scheduled'],
    };
}

const tierColors: Record<string, string> = {
    Critical: '#dc2626', High: '#f59e0b', Medium: '#3b82f6', Low: '#22c55e',
};

export default function Customer360() {
    const { selectedBorrower, setSelectedBorrower, selectedBank } = useApp();
    const accent = selectedBank?.accent || '#0d9488';

    const paymentHistory = useMemo(() => selectedBorrower ? generatePaymentHistory(selectedBorrower) : [], [selectedBorrower]);
    const riskTrend = useMemo(() => selectedBorrower ? generateRiskTrend(selectedBorrower) : [], [selectedBorrower]);
    const commLog = useMemo(() => selectedBorrower ? generateCommLog(selectedBorrower) : [], [selectedBorrower]);
    const aiSuggestion = useMemo(() => selectedBorrower ? getAISuggestion(selectedBorrower) : null, [selectedBorrower]);

    if (!selectedBorrower) return null;

    const r = selectedBorrower;
    const tierColor = tierColors[r.risk.riskTier] || '#8b7355';

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
            {/* Backdrop */}
            <div onClick={() => setSelectedBorrower(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }} />

            {/* Panel */}
            <div style={{ width: '85%', maxWidth: 1200, height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', position: 'relative', zIndex: 1, animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                {/* Header */}
                <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem', boxShadow: `0 4px 12px ${accent}40` }}>
                            {r.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{r.customer.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.customer.phone} · {r.customer.region} · {r.customer.occupation}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ background: `${tierColor}18`, color: tierColor, border: `1px solid ${tierColor}30`, borderRadius: 999, padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {r.risk.riskTier} Risk
                        </span>
                        <button onClick={() => setSelectedBorrower(null)} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>✕</button>
                    </div>
                </div>

                {/* 2-Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 35%) 1fr', height: 'calc(100vh - 89px)', overflow: 'hidden' }}>
                    {/* Left Column (Core Details) */}
                    <div style={{ padding: '28px 32px', borderRight: '1px solid var(--border)', overflowY: 'auto', background: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* DPD Gauge */}
                            <div style={{ background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', padding: '24px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current DPD Status</div>
                                <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: `conic-gradient(${tierColor} ${Math.min(r.loan.currentDpd, 180) / 180 * 100}%, var(--border) 0%)` }}>
                                    <div style={{ width: 116, height: 116, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)' }}>
                                        <span style={{ fontSize: '2.4rem', fontWeight: 900, color: tierColor, fontFamily: 'Space Grotesk', lineHeight: 1 }}>{r.loan.currentDpd}</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, marginTop: 4 }}>DAYS OVERDUE</span>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
                                    <div style={{ background: 'var(--bg-base)', padding: '10px', borderRadius: 10, border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{r.loan.maxDpd12m}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Max DPD (12m)</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-base)', padding: '10px', borderRadius: 10, border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: r.risk.defaultProbability30d > 0.5 ? '#dc2626' : '#22c55e' }}>{Math.round(r.risk.defaultProbability30d * 100)}%</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Default Prob</div>
                                    </div>
                                </div>
                            </div>

                            {/* Loan Details Grid */}
                            <Section title="Loan Details" accent={accent}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {[
                                        { l: 'Product', v: r.loan.product },
                                        { l: 'Principal', v: `₹${(r.loan.principal / 100000).toFixed(1)}L` },
                                        { l: 'EMI Amount', v: `₹${r.loan.emiAmount.toLocaleString()}` },
                                        { l: 'Tenor', v: `${r.loan.tenorMonths} months` },
                                        { l: 'Outstanding', v: `₹${(r.loan.outstandingAmount / 100000).toFixed(1)}L`, color: 'var(--text-primary)' },
                                        { l: 'Overdue', v: `₹${r.loan.overdueAmount.toLocaleString()}`, color: r.loan.overdueAmount > 0 ? '#dc2626' : 'var(--text-primary)' },
                                        { l: 'CIBIL', v: r.loan.creditScore },
                                        { l: 'Bounces (6m)', v: r.loan.bounceCount6m, color: r.loan.bounceCount6m > 0 ? '#f59e0b' : 'var(--text-primary)' },
                                    ].map(item => (
                                        <div key={item.l} style={{ background: 'var(--bg-base)', borderRadius: 10, padding: '12px', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{item.l}</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: item.color || 'var(--text-primary)' }}>{item.v}</div>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        </div>
                    </div>

                    {/* Right Column (Timeline & Graphs) */}
                    <div style={{ padding: '28px 36px', overflowY: 'auto', background: 'var(--bg-base)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                            {/* AI Action */}
                            {aiSuggestion && (
                                <div style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)`, border: `1px solid ${accent}30`, borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '8rem', opacity: 0.05, transform: 'rotate(15deg)' }}>🧠</div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'white', boxShadow: `0 8px 16px ${accent}40`, flexShrink: 0 }}>⚡</div>
                                        <div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{aiSuggestion.action}</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: aiSuggestion.urgency === 'high' ? 'rgba(239, 68, 68, 0.15)' : aiSuggestion.urgency === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: aiSuggestion.urgency === 'high' ? '#dc2626' : aiSuggestion.urgency === 'medium' ? '#d97706' : '#16a34a', border: `1px solid ${aiSuggestion.urgency === 'high' ? '#fecaca' : aiSuggestion.urgency === 'medium' ? '#fde68a' : '#bbf7d0'}` }}>
                                                    {aiSuggestion.urgency === 'high' ? '🔴 Urgent' : aiSuggestion.urgency === 'medium' ? '🟡 Important' : '🟢 Routine'}
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>{aiSuggestion.detail}</p>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {aiSuggestion.steps.map((step, i) => (
                                                    <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>{i + 1}. {step}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Charts Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <Section title="Payment History (12m)" accent={accent}>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={paymentHistory} barSize={16}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-glow)', borderRadius: 12, fontSize: '0.8rem', boxShadow: 'var(--shadow-lg)' }} formatter={(v: any, n: any, p: any) => [`₹${v.toLocaleString()}`, p.payload.status]} />
                                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                                {paymentHistory.map((e, i) => <Cell key={i} fill={e.status === 'Paid' ? '#22c55e' : e.status === 'Partial' ? '#f59e0b' : '#dc2626'} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Section>
                                <Section title="Risk Score Trend" accent={accent}>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <LineChart data={riskTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-glow)', borderRadius: 12, fontSize: '0.8rem', boxShadow: 'var(--shadow-lg)' }} />
                                            <Line type="monotone" dataKey="score" stroke={accent} strokeWidth={3} dot={{ fill: accent, r: 4 }} activeDot={{ r: 6, fill: accent, stroke: 'var(--bg-base)', strokeWidth: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Section>
                            </div>

                            {/* Timeline */}
                            <Section title="Communication Timeline" accent={accent}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {commLog.map((entry, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 16, padding: '0 0 20px 0', position: 'relative' }}>
                                            <div style={{ width: 80, fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right', paddingTop: 2 }}>{entry.date}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ width: 14, height: 14, borderRadius: '50%', background: i === 0 ? accent : 'var(--bg-elevated)', border: `3px solid ${i === 0 ? 'var(--bg-surface)' : 'var(--border)'}`, boxShadow: i === 0 ? `0 0 0 2px ${accent}` : 'none', zIndex: 2 }} />
                                                {i < commLog.length - 1 && <div style={{ position: 'absolute', top: 14, bottom: 0, left: 103, width: 2, background: 'var(--border)', zIndex: 1 }} />}
                                            </div>
                                            <div style={{ flex: 1, background: 'var(--bg-surface)', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border)', marginTop: -6 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{entry.channel}</div>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: entry.status.includes('Answered') || entry.status.includes('Read') || entry.status.includes('Delivered') ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: entry.status.includes('Answered') || entry.status.includes('Read') || entry.status.includes('Delivered') ? '#16a34a' : '#d97706' }}>
                                                        {entry.status}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{entry.message}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Section>

                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `}</style>
        </div>
    );
}

// Section wrapper
function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: 'var(--bg-elevated)', borderRadius: 16,
            border: '1px solid var(--border)',
            padding: '24px',
        }}>
            <div style={{
                fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)',
                fontFamily: 'Space Grotesk', marginBottom: 16,
            }}>
                {title}
            </div>
            {children}
        </div>
    );
}
