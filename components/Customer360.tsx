'use client';
import React, { useMemo } from 'react';
import { useApp } from '@/lib/context';
import { LoanRecord } from '@/lib/data';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
} from 'recharts';

// Generate synthetic payment history for a borrower
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

// Generate synthetic risk trend
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

// Generate synthetic communication log
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

// AI suggested action based on risk profile
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
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', justifyContent: 'flex-end',
        }}>
            {/* Backdrop */}
            <div
                onClick={() => setSelectedBorrower(null)}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease',
                }}
            />

            {/* Panel */}
            <div style={{
                width: '58%', maxWidth: 820, minWidth: 500,
                height: '100vh', overflowY: 'auto',
                background: '#fdfbf7',
                borderLeft: '1px solid rgba(139,90,43,0.12)',
                boxShadow: '-8px 0 40px rgba(139,90,43,0.12)',
                position: 'relative', zIndex: 1,
                animation: 'slideInRight 0.3s ease',
                padding: '0 0 40px',
            }}>
                {/* Header */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: 'rgba(253,251,247,0.95)', backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(139,90,43,0.10)',
                    padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 800, fontSize: '0.9rem',
                        }}>
                            {r.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#3d2b1f', fontFamily: 'Space Grotesk' }}>
                                {r.customer.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#8b7355' }}>
                                {r.customer.phone} · {r.customer.region} · {r.customer.occupation}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                            background: `${tierColor}18`, color: tierColor, border: `1px solid ${tierColor}30`,
                            borderRadius: 999, padding: '3px 12px', fontSize: '0.7rem', fontWeight: 700,
                        }}>
                            {r.risk.riskTier} Risk
                        </span>
                        <button
                            onClick={() => setSelectedBorrower(null)}
                            style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'rgba(139,90,43,0.06)', border: '1px solid rgba(139,90,43,0.12)',
                                cursor: 'pointer', color: '#3d2b1f', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >✕</button>
                    </div>
                </div>

                <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* ── 1. Loan Details ─────────────────────────── */}
                    <Section title="📋 Loan Details" accent={accent}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {[
                                { label: 'Loan ID', value: r.loan.loanId },
                                { label: 'Product', value: r.loan.product },
                                { label: 'Principal', value: `₹${(r.loan.principal / 100000).toFixed(1)}L` },
                                { label: 'EMI Amount', value: `₹${r.loan.emiAmount.toLocaleString()}` },
                                { label: 'Tenor', value: `${r.loan.tenorMonths} months` },
                                { label: 'Interest Rate', value: `${r.loan.interestRate}%` },
                                { label: 'Outstanding', value: `₹${(r.loan.outstandingAmount / 100000).toFixed(1)}L` },
                                { label: 'Overdue', value: `₹${r.loan.overdueAmount.toLocaleString()}`, highlight: r.loan.overdueAmount > 0 },
                                { label: 'Disbursal Date', value: r.loan.disbursalDate },
                                { label: 'Credit Score', value: r.loan.creditScore.toString() },
                                { label: 'Bounces (6m)', value: r.loan.bounceCount6m.toString() },
                                { label: 'Avg Balance (3m)', value: `₹${(r.loan.avgBalance3m / 1000).toFixed(0)}K` },
                            ].map(item => (
                                <div key={item.label} style={{
                                    background: '#fefcf8', borderRadius: 10, padding: '10px 14px',
                                    border: '1px solid rgba(139,90,43,0.08)',
                                }}>
                                    <div style={{ fontSize: '0.6rem', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{item.label}</div>
                                    <div style={{
                                        fontSize: '0.88rem', fontWeight: 700,
                                        color: (item as any).highlight ? '#dc2626' : '#3d2b1f',
                                    }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ── 2. DPD Status ────────────────────────────── */}
                    <Section title="📊 DPD Status" accent={accent}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: `conic-gradient(${tierColor} ${Math.min(r.loan.currentDpd, 180) / 180 * 100}%, rgba(139,90,43,0.08) 0%)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <div style={{
                                    width: 62, height: 62, borderRadius: '50%', background: '#fdfbf7',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexDirection: 'column',
                                }}>
                                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: tierColor, fontFamily: 'Space Grotesk' }}>{r.loan.currentDpd}</span>
                                    <span style={{ fontSize: '0.55rem', color: '#8b7355', fontWeight: 600 }}>DPD</span>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                                    <MiniStat label="Current DPD" value={`${r.loan.currentDpd} days`} color={tierColor} />
                                    <MiniStat label="Max DPD (12m)" value={`${r.loan.maxDpd12m} days`} color='#8b7355' />
                                    <MiniStat label="Default Prob (30d)" value={`${(r.risk.defaultProbability30d * 100).toFixed(1)}%`} color={r.risk.defaultProbability30d > 0.5 ? '#dc2626' : '#22c55e'} />
                                </div>
                                {/* DPD bar */}
                                <div style={{ height: 8, background: 'rgba(139,90,43,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 999,
                                        width: `${Math.min(100, (r.loan.currentDpd / 180) * 100)}%`,
                                        background: `linear-gradient(90deg, #22c55e, #f59e0b, #dc2626)`,
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#b3a08a', marginTop: 3 }}>
                                    <span>0</span><span>30</span><span>60</span><span>90</span><span>120</span><span>180+</span>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ── 3. Payment History ──────────────────────── */}
                    <Section title="💰 Payment History (12 Months)" accent={accent}>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={paymentHistory} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.08)" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8b7355' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#8b7355' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#fdfbf7', border: '1px solid rgba(139,90,43,0.15)', borderRadius: 10, fontSize: '0.78rem', color: '#3d2b1f' }}
                                    formatter={(v: any, name: any, props: any) => [`₹${v.toLocaleString()}`, props.payload.status]}
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                    {paymentHistory.map((entry, i) => (
                                        <Cell key={i} fill={entry.status === 'Paid' ? '#22c55e' : entry.status === 'Partial' ? '#f59e0b' : '#dc2626'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
                            {[{ label: 'Paid', color: '#22c55e' }, { label: 'Partial', color: '#f59e0b' }, { label: 'Missed', color: '#dc2626' }].map(l => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: '#8b7355' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                                    {l.label}
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ── 4. Risk Trend Graph ─────────────────────── */}
                    <Section title="📈 Risk Score Trend" accent={accent}>
                        <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={riskTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.08)" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8b7355' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8b7355' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#fdfbf7', border: '1px solid rgba(139,90,43,0.15)', borderRadius: 10, fontSize: '0.78rem', color: '#3d2b1f' }}
                                    formatter={(v: any) => [`${v}`, 'Risk Score']}
                                />
                                <Line type="monotone" dataKey="score" stroke={accent} strokeWidth={2.5} dot={{ fill: accent, r: 3 }} activeDot={{ r: 5, fill: accent }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Section>

                    {/* ── 5. Communication Log ────────────────────── */}
                    <Section title="📞 Past Communication Log" accent={accent}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {commLog.map((entry, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 12,
                                    padding: '12px 0',
                                    borderBottom: i < commLog.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none',
                                }}>
                                    {/* Timeline dot */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 2 }}>
                                        <div style={{
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: i === 0 ? accent : 'rgba(139,90,43,0.15)',
                                            border: `2px solid ${i === 0 ? accent : 'rgba(139,90,43,0.2)'}`,
                                        }} />
                                        {i < commLog.length - 1 && <div style={{ width: 1, height: 28, background: 'rgba(139,90,43,0.10)' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#3d2b1f' }}>{entry.channel}</div>
                                            <div style={{ fontSize: '0.68rem', color: '#b3a08a' }}>{entry.date}</div>
                                        </div>
                                        <div style={{ fontSize: '0.76rem', color: '#5a3e28', marginBottom: 4 }}>{entry.message}</div>
                                        <span style={{
                                            fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                            background: entry.status.includes('Answered') || entry.status.includes('Read') || entry.status.includes('Delivered') ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                                            color: entry.status.includes('Answered') || entry.status.includes('Read') || entry.status.includes('Delivered') ? '#16a34a' : '#d97706',
                                        }}>
                                            {entry.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ── 6. AI Suggested Action ───────────────────── */}
                    {aiSuggestion && (
                        <Section title="🤖 AI Suggested Action" accent={accent}>
                            <div style={{
                                background: `${accent}08`, border: `1px solid ${accent}25`,
                                borderRadius: 14, padding: '18px 20px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem', color: 'white',
                                    }}>🎯</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#3d2b1f', fontFamily: 'Space Grotesk' }}>
                                            {aiSuggestion.action}
                                        </div>
                                        <div style={{
                                            fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
                                            color: aiSuggestion.urgency === 'high' ? '#dc2626' : aiSuggestion.urgency === 'medium' ? '#f59e0b' : '#22c55e',
                                        }}>
                                            {aiSuggestion.urgency === 'high' ? '🔴 Urgent' : aiSuggestion.urgency === 'medium' ? '🟡 Important' : '🟢 Routine'}
                                        </div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#5a3e28', lineHeight: 1.5, marginBottom: 14 }}>
                                    {aiSuggestion.detail}
                                </p>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3d2b1f', marginBottom: 8 }}>Recommended Steps:</div>
                                <ol style={{ margin: 0, paddingLeft: 18 }}>
                                    {aiSuggestion.steps.map((step, i) => (
                                        <li key={i} style={{ fontSize: '0.78rem', color: '#5a3e28', marginBottom: 6, lineHeight: 1.4 }}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </Section>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// Section wrapper
function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: '#fefcf8', borderRadius: 14,
            border: '1px solid rgba(139,90,43,0.10)',
            padding: '18px 20px',
        }}>
            <div style={{
                fontSize: '0.88rem', fontWeight: 800, color: '#3d2b1f',
                fontFamily: 'Space Grotesk', marginBottom: 14,
                paddingBottom: 10, borderBottom: '1px solid rgba(139,90,43,0.08)',
            }}>
                {title}
            </div>
            {children}
        </div>
    );
}

// Mini stat badge
function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.58rem', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color, fontFamily: 'Space Grotesk' }}>{value}</div>
        </div>
    );
}
