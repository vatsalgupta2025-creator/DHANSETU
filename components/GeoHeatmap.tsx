'use client';
import React, { useMemo, useState } from 'react';
import { useApp } from '@/lib/context';
import { LoanRecord } from '@/lib/data';

// India state grid layout (approx geographic positions)
const STATE_GRID: Array<{ name: string; short: string; row: number; col: number }> = [
    { name: 'Jammu & Kashmir', short: 'JK', row: 0, col: 2 },
    { name: 'Punjab', short: 'PB', row: 1, col: 1 },
    { name: 'Himachal Pradesh', short: 'HP', row: 1, col: 2 },
    { name: 'Uttarakhand', short: 'UK', row: 1, col: 3 },
    { name: 'Rajasthan', short: 'RJ', row: 2, col: 0 },
    { name: 'Uttar Pradesh', short: 'UP', row: 2, col: 2 },
    { name: 'Bihar', short: 'BR', row: 2, col: 3 },
    { name: 'Gujarat', short: 'GJ', row: 3, col: 0 },
    { name: 'Madhya Pradesh', short: 'MP', row: 3, col: 1 },
    { name: 'Maharashtra', short: 'MH', row: 4, col: 0 },
    { name: 'Telangana', short: 'TS', row: 4, col: 1 },
    { name: 'West Bengal', short: 'WB', row: 3, col: 3 },
    { name: 'Karnataka', short: 'KA', row: 5, col: 0 },
    { name: 'Tamil Nadu', short: 'TN', row: 6, col: 1 },
    { name: 'Kerala', short: 'KL', row: 6, col: 0 },
    { name: 'Assam', short: 'AS', row: 1, col: 5 },
    { name: 'Odisha', short: 'OD', row: 4, col: 2 },
    { name: 'Andhra Pradesh', short: 'AP', row: 5, col: 1 },
    { name: 'Goa', short: 'GA', row: 5, col: -1 },
    { name: 'Jharkhand', short: 'JH', row: 3, col: 2 },
];

function getRegionStats(data: LoanRecord[]) {
    const stats: Record<string, { count: number; critical: number; totalOverdue: number; totalOutstanding: number; avgRecovery: number }> = {};
    const regionMap: Record<string, string> = {
        'Maharashtra': 'MH', 'Tamil Nadu': 'TN', 'Uttar Pradesh': 'UP',
        'Karnataka': 'KA', 'West Bengal': 'WB', 'Telangana': 'TS',
        'Gujarat': 'GJ', 'Punjab': 'PB', 'Rajasthan': 'RJ', 'Kerala': 'KL',
    };

    data.forEach(r => {
        const code = regionMap[r.customer.region] || 'OT';
        if (!stats[code]) stats[code] = { count: 0, critical: 0, totalOverdue: 0, totalOutstanding: 0, avgRecovery: 0 };
        stats[code].count++;
        if (r.risk.riskTier === 'Critical') stats[code].critical++;
        stats[code].totalOverdue += r.loan.overdueAmount;
        stats[code].totalOutstanding += r.loan.outstandingAmount;
        stats[code].avgRecovery += r.risk.expectedRecovery;
    });

    // Avg recovery
    Object.values(stats).forEach(s => { if (s.count > 0) s.avgRecovery /= s.count; });

    // Fill missing states with synthetic data
    STATE_GRID.forEach(st => {
        if (!stats[st.short]) {
            stats[st.short] = {
                count: Math.floor(5 + Math.random() * 30),
                critical: Math.floor(Math.random() * 10),
                totalOverdue: Math.round((50000 + Math.random() * 500000)),
                totalOutstanding: Math.round((200000 + Math.random() * 2000000)),
                avgRecovery: 40 + Math.random() * 40,
            };
        }
    });

    return stats;
}

function getHeatColor(value: number, metric: string): string {
    // Higher recovery = green, lower = red
    if (metric === 'recovery') {
        if (value >= 70) return 'rgba(34, 197, 94, 0.8)';
        if (value >= 55) return 'rgba(132, 204, 22, 0.7)';
        if (value >= 45) return 'rgba(245, 158, 11, 0.7)';
        if (value >= 30) return 'rgba(249, 115, 22, 0.7)';
        return 'rgba(220, 38, 38, 0.7)';
    }
    // Higher NPA = red, lower = green
    if (metric === 'npa') {
        if (value >= 50) return 'rgba(220, 38, 38, 0.8)';
        if (value >= 35) return 'rgba(249, 115, 22, 0.7)';
        if (value >= 20) return 'rgba(245, 158, 11, 0.7)';
        if (value >= 10) return 'rgba(132, 204, 22, 0.7)';
        return 'rgba(34, 197, 94, 0.7)';
    }
    return 'rgba(139,90,43,0.1)';
}

type MetricType = 'recovery' | 'npa' | 'overdue';

export default function GeoHeatmap() {
    const { loanData } = useApp();
    const [metric, setMetric] = useState<MetricType>('recovery');
    const [hovered, setHovered] = useState<string | null>(null);
    const regionStats = useMemo(() => getRegionStats(loanData), [loanData]);

    const getValue = (code: string): number => {
        const s = regionStats[code];
        if (!s) return 0;
        if (metric === 'recovery') return Math.round(s.avgRecovery);
        if (metric === 'npa') return Math.round((s.critical / s.count) * 100);
        return Math.round(s.totalOverdue / 100000);
    };

    const getLabel = (code: string): string => {
        const v = getValue(code);
        if (metric === 'recovery') return `${v}%`;
        if (metric === 'npa') return `${v}%`;
        return `₹${v}L`;
    };

    const totalRecovery = useMemo(() => {
        const vals = Object.values(regionStats);
        return Math.round(vals.reduce((s, v) => s + v.avgRecovery, 0) / vals.length);
    }, [regionStats]);

    const totalAccounts = useMemo(() => Object.values(regionStats).reduce((s, v) => s + v.count, 0), [regionStats]);

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', margin: 0, marginBottom: 4 }}>
                        🗺️ Regional Performance Heatmap
                    </h2>
                    <p style={{ color: '#8b7355', fontSize: '0.85rem', margin: 0 }}>
                        State-wise portfolio analysis across {totalAccounts} accounts
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {([['recovery', '📈 Recovery'], ['npa', '⚠️ NPA Rate'], ['overdue', '💰 Overdue']] as const).map(([id, label]) => (
                        <button
                            key={id}
                            onClick={() => setMetric(id as MetricType)}
                            style={{
                                padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                                border: metric === id ? '1px solid var(--bank-accent)' : '1px solid rgba(139,90,43,0.12)',
                                background: metric === id ? 'var(--bank-accent)' : 'rgba(139,90,43,0.04)',
                                color: metric === id ? 'white' : '#5a3e28',
                                fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.15s',
                            }}
                        >{label}</button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
                {/* Heatmap Grid */}
                <div style={{
                    background: '#fefcf8', borderRadius: 16, padding: 24,
                    border: '1px solid rgba(139,90,43,0.10)',
                }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
                        gridTemplateRows: 'repeat(7, 1fr)', gap: 6,
                        minHeight: 400,
                    }}>
                        {STATE_GRID.map(st => {
                            const val = getValue(st.short);
                            const color = getHeatColor(val, metric === 'overdue' ? 'recovery' : metric);
                            const isHovered = hovered === st.short;
                            const stats = regionStats[st.short];

                            return (
                                <div
                                    key={st.short}
                                    onMouseEnter={() => setHovered(st.short)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{
                                        gridRow: st.row + 1,
                                        gridColumn: st.col + 1,
                                        background: color,
                                        borderRadius: 10,
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        padding: 6, cursor: 'pointer',
                                        transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                                        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
                                        transition: 'all 0.2s ease',
                                        position: 'relative', zIndex: isHovered ? 10 : 1,
                                        border: isHovered ? '2px solid #3d2b1f' : '1px solid rgba(255,255,255,0.3)',
                                    }}
                                >
                                    <div style={{ fontWeight: 800, fontSize: '0.7rem', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                                        {st.short}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.65rem', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                        {getLabel(st.short)}
                                    </div>

                                    {/* Tooltip */}
                                    {isHovered && stats && (
                                        <div style={{
                                            position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                                            background: '#fdfbf7', border: '1px solid rgba(139,90,43,0.15)',
                                            borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                            whiteSpace: 'nowrap', zIndex: 100, minWidth: 160,
                                        }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#3d2b1f', marginBottom: 6 }}>{st.name}</div>
                                            <div style={{ fontSize: '0.68rem', color: '#5a3e28', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                <span>📊 Accounts: <strong>{stats.count}</strong></span>
                                                <span>⚠️ Critical: <strong style={{ color: '#dc2626' }}>{stats.critical}</strong></span>
                                                <span>💰 Overdue: <strong>₹{(stats.totalOverdue / 100000).toFixed(1)}L</strong></span>
                                                <span>📈 Recovery: <strong style={{ color: '#16a34a' }}>{Math.round(stats.avgRecovery)}%</strong></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                        {(metric === 'npa'
                            ? [{ label: 'Low', color: 'rgba(34,197,94,0.7)' }, { label: 'Medium', color: 'rgba(245,158,11,0.7)' }, { label: 'High', color: 'rgba(249,115,22,0.7)' }, { label: 'Critical', color: 'rgba(220,38,38,0.8)' }]
                            : [{ label: 'Low', color: 'rgba(220,38,38,0.7)' }, { label: 'Medium', color: 'rgba(245,158,11,0.7)' }, { label: 'Good', color: 'rgba(132,204,22,0.7)' }, { label: 'Excellent', color: 'rgba(34,197,94,0.8)' }]
                        ).map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color }} />
                                <span style={{ fontSize: '0.68rem', color: '#8b7355' }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Summary card */}
                    <div style={{
                        background: '#fefcf8', borderRadius: 16, padding: '18px 20px',
                        border: '1px solid rgba(139,90,43,0.10)',
                    }}>
                        <div style={{ fontSize: '0.68rem', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                            National Average
                        </div>
                        <div style={{ fontWeight: 900, fontSize: '2rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                            {totalRecovery}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                            ↑ 4.2% vs last quarter
                        </div>
                    </div>

                    {/* Top region rankings */}
                    <div style={{
                        background: '#fefcf8', borderRadius: 16, padding: '18px 20px',
                        border: '1px solid rgba(139,90,43,0.10)', flex: 1,
                    }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#3d2b1f', marginBottom: 12, fontFamily: 'Space Grotesk' }}>
                            🏆 Top Performing States
                        </div>
                        {STATE_GRID
                            .map(st => ({ ...st, recovery: regionStats[st.short]?.avgRecovery || 0 }))
                            .sort((a, b) => b.recovery - a.recovery)
                            .slice(0, 8)
                            .map((st, i) => (
                                <div key={st.short} style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '8px 0',
                                    borderBottom: i < 7 ? '1px solid rgba(139,90,43,0.06)' : 'none',
                                }}>
                                    <span style={{
                                        width: 20, height: 20, borderRadius: 6,
                                        background: i < 3 ? 'rgba(34,197,94,0.12)' : 'rgba(139,90,43,0.06)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.6rem', fontWeight: 800,
                                        color: i < 3 ? '#16a34a' : '#8b7355',
                                    }}>#{i + 1}</span>
                                    <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: '#3d2b1f' }}>{st.name}</span>
                                    <span style={{
                                        fontSize: '0.72rem', fontWeight: 700,
                                        color: st.recovery >= 60 ? '#16a34a' : st.recovery >= 45 ? '#d97706' : '#dc2626',
                                    }}>{Math.round(st.recovery)}%</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
