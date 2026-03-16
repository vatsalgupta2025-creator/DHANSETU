'use client';
import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { computeKPIs, getRiskDistributionData, getRecoveryTrendData, getChannelPerformanceData } from '@/lib/data';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar,
} from 'recharts';
type LangCode = any;

function StatCard({ title, value, subtitle, icon, color, delta }: {
    title: string; value: string; subtitle?: string;
    icon: React.ReactNode; color: string; delta?: { val: string; positive: boolean };
}) {
    const [displayed, setDisplayed] = useState('0');

    useEffect(() => {
        const numStr = value.replace(/[^0-9.]/g, '');
        const num = parseFloat(numStr);
        if (isNaN(num)) { setDisplayed(value); return; }
        const duration = 1200;
        const steps = 40;
        const increment = num / steps;
        let current = 0;
        const timer = setInterval(() => {
            current = Math.min(current + increment, num);
            const prefix = value.replace(/[\d,.]+/, '').split('').filter(c => isNaN(parseInt(c)) && c !== '.').join('');
            const formatted = value.startsWith('₹')
                ? '₹' + Math.floor(current).toLocaleString('en-IN')
                : value.includes('%')
                    ? Math.round(current) + '%'
                    : Math.floor(current).toLocaleString();
            setDisplayed(formatted);
            if (current >= num) clearInterval(timer);
        }, duration / steps);
        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="hover-lift" style={{
            background: 'var(--bg-surface)',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = ''; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                        {title}
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                        {displayed}
                    </div>
                    {subtitle && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</div>
                    )}
                    {delta && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8,
                            background: delta.positive ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: delta.positive ? '#16a34a' : '#dc2626',
                            borderRadius: 999, padding: '2px 8px', fontSize: '0.72rem', fontWeight: 600,
                        }}>
                            {delta.positive ? '↑' : '↓'} {delta.val} vs last month
                        </div>
                    )}
                </div>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: color + '18',
                    border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function RiskBadge({ tier }: { tier: string }) {
    const classes: Record<string, string> = {
        Critical: 'badge-critical', High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low',
    };
    return (
        <span className={classes[tier] || 'badge-low'} style={{ borderRadius: 999, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>
            {tier}
        </span>
    );
}

const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{payload[0].name}</div>
                <div style={{ color: payload[0].payload.color, fontWeight: 700, fontSize: '0.9rem' }}>
                    {payload[0].value}
                </div>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const { loanData, setActivePage, setSelectedRecord, appLanguage, setSelectedBorrower } = useApp();
    const lang: LangCode = appLanguage?.code || 'en-IN';
    const kpis = useMemo(() => computeKPIs(loanData), [loanData]);
    const riskDist = useMemo(() => getRiskDistributionData(loanData), [loanData]);
    const trendData = useMemo(() => getRecoveryTrendData(), []);
    const channelData = useMemo(() => getChannelPerformanceData(), []);
    const topRisk = loanData.slice(0, 8);
    const [now, setNow] = useState('');

    useEffect(() => {
        const d = new Date();
        setNow(d.toLocaleString(lang, { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
    }, []);

    const accent = 'var(--bank-accent)';
    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                        {t('dash.title', lang)}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '6px 0 0' }}>
                        {now} • Auto-refresh every 4 hours
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => setActivePage('risk')}
                        className="btn-accent"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                        </svg>
                        ⚡ {t('risk.title', lang).replace('AI ', '')} Scan
                    </button>
                    <button
                        onClick={() => setActivePage('campaigns')}
                        className="btn-secondary">
                        + {t('camp.title', lang).replace(' Builder', '')}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
                <StatCard
                    title={t('sidebar.totalLoans', lang)}
                    value={kpis.total.toLocaleString()}
                    subtitle={t('dash.subtitle', lang)}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--bank-accent)" strokeWidth="2" style={{ width: 20, height: 20 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                    color="var(--bank-accent)"
                    delta={{ val: '12.4%', positive: true }}
                />
                <StatCard
                    title={t('dash.criticalAccounts', lang)}
                    value={kpis.criticalCount.toLocaleString()}
                    subtitle={`${Math.round(kpis.criticalCount / kpis.total * 100)}% of portfolio`}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--critical)" strokeWidth="2" style={{ width: 20, height: 20 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                    color="#ef4444"
                />
                <StatCard
                    title={t('dash.overdueAmount', lang)}
                    value={`₹${Math.round(kpis.totalOutstanding / 10000000).toLocaleString('en-IN')} Cr`}
                    subtitle={t('dash.totalPortfolio', lang)}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" style={{ width: 20, height: 20 }}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                    color="#f97316"
                />
                <StatCard
                    title={t('dash.recoveryRate', lang)}
                    value={`₹${Math.round(kpis.projectedRecovery / 10000000).toLocaleString('en-IN')} Cr`}
                    subtitle={`${kpis.avgRecovery}% avg recovery rate`}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" style={{ width: 20, height: 20 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>}
                    color="#22c55e"
                    delta={{ val: '18.2%', positive: true }}
                />
                <StatCard
                    title={t('dash.highRiskAccounts', lang)}
                    value={kpis.highCount.toLocaleString()}
                    subtitle={`${Math.round(kpis.highCount / kpis.total * 100)}% of portfolio`}
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" style={{ width: 20, height: 20 }}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    color="#f97316"
                />
            </div>

            {/* Row 2: Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 16, marginBottom: 28 }}>
                {/* Donut chart */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: '22px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 4 }}>{t('dash.riskDistribution', lang)}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 16 }}>{t('dash.subtitle', lang)}</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={riskDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                {riskDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                        {riskDist.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                                <span style={{ fontSize: '0.72rem', color: '#475569' }}>{d.name}: <strong>{d.value}</strong></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recovery trend */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: '22px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 4 }}>{t('dash.recoveryRate', lang)} — Trend</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 16 }}>AI-powered vs baseline (last 6 months)</div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                            <Tooltip formatter={(v: any) => `${Math.round(v * 10) / 10}%`} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.8rem' }} />
                            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                            <Area type="monotone" dataKey="withAI" name="DhanSetu" stroke="#0d9488" fill="url(#gradAI)" strokeWidth={2.5} dot={false} />
                            <Area type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" fill="url(#gradBase)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 3: Priority Queue + Channel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
                {/* Priority queue */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)' }}>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{t('dash.topRisk', lang)}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 2 }}>{t('risk.subtitle', lang)}</div>
                        </div>
                        <button
                            onClick={() => setActivePage('risk')}
                            className="btn-secondary"
                            style={{ padding: '5px 11px', fontSize: '0.73rem' }}>
                            {t('dash.viewAll', lang)} →
                        </button>
                    </div>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>{t('dash.name', lang)}</th>
                                <th>{t('risk.product', lang)}</th>
                                <th>{t('dash.dpd', lang)}</th>
                                <th>{t('dash.overdue', lang)}</th>
                                <th>{t('dash.risk', lang)}</th>
                                <th>{t('dash.action', lang)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topRisk.map((r, i) => (
                                <tr key={r.customer.id} style={{ cursor: 'pointer' }}
                                    onClick={() => { setSelectedBorrower(r); }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                                background: i < 3 ? 'rgba(239, 68, 68, 0.15)' : i < 6 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(22, 163, 74, 0.15)',
                                                border: `1.5px solid ${i < 3 ? 'rgba(239, 68, 68, 0.4)' : i < 6 ? 'rgba(249, 115, 22, 0.4)' : 'rgba(22, 163, 74, 0.4)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.65rem', fontWeight: 700,
                                                color: i < 3 ? '#dc2626' : i < 6 ? '#ea580c' : '#16a34a',
                                            }}>
                                                {r.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{r.customer.name}</div>
                                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{r.customer.region}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.78rem', color: '#475569' }}>{r.loan.product}</td>
                                    <td>
                                        <span style={{
                                            background: r.loan.currentDpd > 60 ? 'rgba(239, 68, 68, 0.15)' : r.loan.currentDpd > 30 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                            color: r.loan.currentDpd > 60 ? '#dc2626' : r.loan.currentDpd > 30 ? '#ea580c' : '#d97706',
                                            borderRadius: 999, padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700,
                                        }}>
                                            {r.loan.currentDpd}d
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                                        ₹{r.loan.overdueAmount.toLocaleString('en-IN')}
                                    </td>
                                    <td><RiskBadge tier={r.risk.riskTier} /></td>
                                    <td>
                                        <button
                                            onClick={e => { e.stopPropagation(); setSelectedRecord(r); setActivePage('messages'); }}
                                            style={{
                                                background: 'var(--teal-light)', border: '1px solid rgba(13,148,136,0.25)',
                                                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                                                fontSize: '0.7rem', color: 'var(--bank-accent)', fontWeight: 700,
                                            }}>
                                            {t('dash.sendMessage', lang)}
                                        </button>
                                        <button
                                            onClick={e => { e.stopPropagation(); setSelectedBorrower(r); }}
                                            style={{
                                                background: 'rgba(139,90,43,0.06)', border: '1px solid rgba(139,90,43,0.15)',
                                                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                                                fontSize: '0.7rem', color: '#5a3e28', fontWeight: 700, marginLeft: 4,
                                            }}>
                                            360°
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Channel performance */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: '22px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 4 }}>{t('dash.aiActions', lang)}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 16 }}>Contact & conversion rates</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {channelData.map(ch => (
                            <div key={ch.channel}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{ch.channel}</span>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Contact: <strong style={{ color: '#475569' }}>{ch.contactRate}%</strong></span>
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Conv: <strong style={{ color: ch.color }}>{ch.conversionRate}%</strong></span>
                                    </div>
                                </div>
                                <div className="progress-bar-track" style={{ height: 7 }}>
                                    <div className="progress-bar-fill" style={{ width: `${ch.contactRate}%`, background: ch.color, height: '100%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 20, padding: '14px', background: 'var(--bank-accent-light)', borderRadius: 10, border: '1px solid rgba(var(--bank-accent-rgb),0.2)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--bank-accent)', marginBottom: 6 }}>💡 AI Recommendation</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <strong style={{ color: 'var(--text-primary)' }}>WhatsApp</strong> delivers 2.3× better ROI than voice calls. Shift <strong style={{ color: 'var(--bank-accent)' }}>60% of budget</strong> to WhatsApp campaigns this week.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

