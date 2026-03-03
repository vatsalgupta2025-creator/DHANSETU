'use client';
import React, { useMemo, useState } from 'react';
import { useApp } from '@/lib/context';
import { LoanRecord } from '@/lib/data';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    Treemap,
} from 'recharts';

// DPD buckets
const DPD_BUCKETS = ['0-15', '16-30', '31-60', '61-90', '90+'];
const PRODUCTS = ['Personal Loan', 'Home Loan', 'Vehicle Loan', 'Business Loan', 'Agricultural Loan'];

function getDpdBucket(dpd: number): string {
    if (dpd <= 15) return '0-15';
    if (dpd <= 30) return '16-30';
    if (dpd <= 60) return '31-60';
    if (dpd <= 90) return '61-90';
    return '90+';
}

function buildHeatmapData(data: LoanRecord[]) {
    const matrix: Record<string, Record<string, { count: number; amount: number }>> = {};
    PRODUCTS.forEach(p => {
        matrix[p] = {};
        DPD_BUCKETS.forEach(b => { matrix[p][b] = { count: 0, amount: 0 }; });
    });

    data.forEach(r => {
        const bucket = getDpdBucket(r.loan.currentDpd);
        if (matrix[r.loan.product]) {
            matrix[r.loan.product][bucket].count++;
            matrix[r.loan.product][bucket].amount += r.loan.overdueAmount;
        }
    });
    return matrix;
}

function getIntensity(count: number, maxCount: number): string {
    const ratio = count / Math.max(maxCount, 1);
    if (ratio >= 0.7) return '#dc2626';
    if (ratio >= 0.5) return '#ea580c';
    if (ratio >= 0.3) return '#f59e0b';
    if (ratio >= 0.15) return '#facc15';
    if (ratio > 0) return '#a3e635';
    return 'rgba(139,90,43,0.04)';
}

function buildTreemapData(data: LoanRecord[]) {
    const byProduct: Record<string, { outstanding: number; critical: number; total: number }> = {};
    data.forEach(r => {
        if (!byProduct[r.loan.product]) byProduct[r.loan.product] = { outstanding: 0, critical: 0, total: 0 };
        byProduct[r.loan.product].outstanding += r.loan.outstandingAmount;
        byProduct[r.loan.product].total++;
        if (r.risk.riskTier === 'Critical') byProduct[r.loan.product].critical++;
    });
    return Object.entries(byProduct).map(([name, v]) => ({
        name,
        size: v.outstanding,
        critical: v.critical,
        total: v.total,
        fill: v.critical / v.total > 0.5 ? '#dc2626' : v.critical / v.total > 0.3 ? '#ea580c' : v.critical / v.total > 0.15 ? '#f59e0b' : '#22c55e',
    }));
}

function buildDpdTrend(data: LoanRecord[]) {
    return DPD_BUCKETS.map(bucket => {
        const items = data.filter(r => getDpdBucket(r.loan.currentDpd) === bucket);
        return {
            bucket,
            count: items.length,
            overdue: Math.round(items.reduce((s, r) => s + r.loan.overdueAmount, 0) / 100000),
            avgRisk: items.length > 0 ? Math.round(items.reduce((s, r) => s + r.risk.riskScore, 0) / items.length) : 0,
        };
    });
}

const CustomTreeContent = (props: any) => {
    const { x, y, width, height, name, fill } = props;
    if (width < 40 || height < 30) return null;
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={fill} rx={6}
                stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
            <text x={x + width / 2} y={y + height / 2 - 4} textAnchor="middle"
                fill="white" fontSize={width > 100 ? 11 : 9} fontWeight={800}
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                {name?.replace(' Loan', '')}
            </text>
            <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle"
                fill="rgba(255,255,255,0.8)" fontSize={9} fontWeight={600}>
                ₹{(props.size / 10000000).toFixed(1)}Cr
            </text>
        </g>
    );
};

export default function PortfolioHeatmap() {
    const { loanData } = useApp();
    const [view, setView] = useState<'heatmap' | 'treemap' | 'dpd'>('heatmap');
    const heatData = useMemo(() => buildHeatmapData(loanData), [loanData]);
    const treemapData = useMemo(() => buildTreemapData(loanData), [loanData]);
    const dpdTrend = useMemo(() => buildDpdTrend(loanData), [loanData]);

    // Find max for color scaling
    const maxCount = useMemo(() => {
        let max = 0;
        PRODUCTS.forEach(p => DPD_BUCKETS.forEach(b => { if (heatData[p]?.[b]?.count > max) max = heatData[p][b].count; }));
        return max;
    }, [heatData]);

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', margin: 0, marginBottom: 4 }}>
                        🔥 Portfolio Heatmap & Analysis
                    </h2>
                    <p style={{ color: '#8b7355', fontSize: '0.85rem', margin: 0 }}>
                        DPD × Product risk concentration matrix
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {([['heatmap', '🗂️ Matrix'], ['treemap', '📦 Treemap'], ['dpd', '📊 DPD Analysis']] as const).map(([id, label]) => (
                        <button
                            key={id}
                            onClick={() => setView(id as any)}
                            style={{
                                padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                                border: view === id ? '1px solid var(--bank-accent)' : '1px solid rgba(139,90,43,0.12)',
                                background: view === id ? 'var(--bank-accent)' : 'rgba(139,90,43,0.04)',
                                color: view === id ? 'white' : '#5a3e28',
                                fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.15s',
                            }}
                        >{label}</button>
                    ))}
                </div>
            </div>

            {/* Heatmap Matrix View */}
            {view === 'heatmap' && (
                <div style={{
                    background: '#fefcf8', borderRadius: 16, padding: 24,
                    border: '1px solid rgba(139,90,43,0.10)',
                }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 6 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', fontSize: '0.72rem', color: '#8b7355', fontWeight: 700, padding: '6px 10px' }}>
                                    PRODUCT ↓ / DPD →
                                </th>
                                {DPD_BUCKETS.map(b => (
                                    <th key={b} style={{ fontSize: '0.72rem', color: '#8b7355', fontWeight: 700, padding: '6px 10px', textAlign: 'center' }}>
                                        {b} days
                                    </th>
                                ))}
                                <th style={{ fontSize: '0.72rem', color: '#8b7355', fontWeight: 700, padding: '6px 10px', textAlign: 'center' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PRODUCTS.map(prod => {
                                const rowTotal = DPD_BUCKETS.reduce((s, b) => s + (heatData[prod]?.[b]?.count || 0), 0);
                                return (
                                    <tr key={prod}>
                                        <td style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3d2b1f', padding: '6px 10px' }}>
                                            {prod.replace(' Loan', '')}
                                        </td>
                                        {DPD_BUCKETS.map(bucket => {
                                            const cell = heatData[prod]?.[bucket] || { count: 0, amount: 0 };
                                            return (
                                                <td key={bucket} style={{
                                                    padding: '12px 10px', textAlign: 'center',
                                                    background: getIntensity(cell.count, maxCount),
                                                    borderRadius: 8, transition: 'all 0.2s',
                                                    cursor: 'default',
                                                }}>
                                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: cell.count > maxCount * 0.3 ? 'white' : '#3d2b1f', textShadow: cell.count > maxCount * 0.3 ? '0 1px 3px rgba(0,0,0,0.2)' : 'none' }}>
                                                        {cell.count}
                                                    </div>
                                                    <div style={{ fontSize: '0.6rem', color: cell.count > maxCount * 0.3 ? 'rgba(255,255,255,0.8)' : '#8b7355', marginTop: 2 }}>
                                                        ₹{(cell.amount / 100000).toFixed(1)}L
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td style={{
                                            padding: '12px 10px', textAlign: 'center',
                                            background: 'rgba(139,90,43,0.04)', borderRadius: 8,
                                            fontWeight: 800, fontSize: '0.9rem', color: '#3d2b1f',
                                        }}>
                                            {rowTotal}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                        {[{ label: 'Low', color: '#a3e635' }, { label: 'Medium', color: '#facc15' }, { label: 'High', color: '#f59e0b' }, { label: 'Very High', color: '#ea580c' }, { label: 'Critical', color: '#dc2626' }].map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color }} />
                                <span style={{ fontSize: '0.68rem', color: '#8b7355' }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Treemap View */}
            {view === 'treemap' && (
                <div style={{
                    background: '#fefcf8', borderRadius: 16, padding: 24,
                    border: '1px solid rgba(139,90,43,0.10)',
                }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3d2b1f', marginBottom: 12, fontFamily: 'Space Grotesk' }}>
                        Portfolio Composition by Outstanding Amount
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <Treemap
                            data={treemapData}
                            dataKey="size"
                            nameKey="name"
                            content={<CustomTreeContent />}
                        />
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                        {[{ label: 'Healthy (<15% critical)', color: '#22c55e' }, { label: 'Warning (15-30%)', color: '#f59e0b' }, { label: 'At Risk (30-50%)', color: '#ea580c' }, { label: 'Critical (>50%)', color: '#dc2626' }].map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
                                <span style={{ fontSize: '0.65rem', color: '#8b7355' }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DPD Analysis View */}
            {view === 'dpd' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{
                        background: '#fefcf8', borderRadius: 16, padding: '22px',
                        border: '1px solid rgba(139,90,43,0.10)',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3d2b1f', marginBottom: 12, fontFamily: 'Space Grotesk' }}>
                            📊 Account Distribution by DPD
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dpdTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.06)" />
                                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#8b7355' }} axisLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#8b7355' }} axisLine={false} />
                                <Tooltip contentStyle={{ background: '#fdfbf7', border: '1px solid rgba(139,90,43,0.15)', borderRadius: 10, fontSize: '0.78rem' }} />
                                <Bar dataKey="count" fill="var(--bank-accent)" radius={[6, 6, 0, 0]} name="Accounts" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{
                        background: '#fefcf8', borderRadius: 16, padding: '22px',
                        border: '1px solid rgba(139,90,43,0.10)',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3d2b1f', marginBottom: 12, fontFamily: 'Space Grotesk' }}>
                            💰 Overdue Amount by DPD (₹L)
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dpdTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.06)" />
                                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#8b7355' }} axisLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#8b7355' }} axisLine={false} />
                                <Tooltip contentStyle={{ background: '#fdfbf7', border: '1px solid rgba(139,90,43,0.15)', borderRadius: 10, fontSize: '0.78rem' }} />
                                <Bar dataKey="overdue" fill="#ea580c" radius={[6, 6, 0, 0]} name="Overdue (₹L)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Risk score summary cards */}
                    <div style={{
                        gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10,
                    }}>
                        {dpdTrend.map(d => (
                            <div key={d.bucket} style={{
                                background: '#fefcf8', borderRadius: 12, padding: '14px 16px',
                                border: '1px solid rgba(139,90,43,0.10)', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '0.62rem', color: '#8b7355', textTransform: 'uppercase', marginBottom: 4 }}>{d.bucket} DPD</div>
                                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#3d2b1f', fontFamily: 'Space Grotesk' }}>{d.count}</div>
                                <div style={{ fontSize: '0.65rem', color: '#8b7355' }}>Avg Risk: <strong style={{ color: d.avgRisk >= 60 ? '#dc2626' : d.avgRisk >= 40 ? '#d97706' : '#16a34a' }}>{d.avgRisk}</strong></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
