'use client';
import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CalEvent { date: number; type: 'emi' | 'ptp' | 'recovery' | 'legal'; amount: number; count: number; confidence: number; }
const ECOL: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    emi: { bg: '#dbeafe', text: '#2563eb', label: 'EMI Collection', icon: '💳' },
    ptp: { bg: '#fef3c7', text: '#d97706', label: 'PTP Due', icon: '🤝' },
    recovery: { bg: '#dcfce7', text: '#16a34a', label: 'Expected Recovery', icon: '💰' },
    legal: { bg: '#fce7f3', text: '#db2777', label: 'Legal Action', icon: '⚖️' },
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function RadialGauge({ value, size = 80, color }: { value: number; size?: number; color: string }) {
    const r = (size - 8) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.min(value, 1);
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={6} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
                strokeDasharray={`${c * pct} ${c * (1 - pct)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease' }} />
            <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
                style={{ fontSize: size * 0.22, fontWeight: 800, fill: color, fontFamily: 'Space Grotesk', transform: 'rotate(90deg)', transformOrigin: 'center' }}>
                {(pct * 100).toFixed(0)}%
            </text>
        </svg>
    );
}

export default function CashFlowCalendar() {
    const { loanData, selectedBank } = useApp();
    const accent = selectedBank?.accent || '#0d9488';
    const now = new Date();
    const [cMonth, setCMonth] = useState(now.getMonth());
    const [cYear, setCYear] = useState(now.getFullYear());
    const [selDay, setSelDay] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'weekly'>('calendar');

    const events = useMemo(() => {
        const evts: CalEvent[] = [];
        const dim = new Date(cYear, cMonth + 1, 0).getDate();
        for (let d = 1; d <= dim; d++) {
            if (new Date(cYear, cMonth, d).getDay() === 0) continue;
            const bc = Math.floor(loanData.length * (0.02 + Math.random() * 0.04));
            if (d <= 7) evts.push({ date: d, type: 'emi', amount: bc * 12000 + Math.random() * 500000, count: bc + Math.floor(Math.random() * 10), confidence: 0.85 + Math.random() * 0.12 });
            if (d % 3 === 0 || d % 7 === 0) evts.push({ date: d, type: 'ptp', amount: Math.random() * 800000 + 200000, count: Math.floor(Math.random() * 15) + 3, confidence: 0.6 + Math.random() * 0.25 });
            if (d % 2 === 0) evts.push({ date: d, type: 'recovery', amount: Math.random() * 1200000 + 300000, count: Math.floor(Math.random() * 20) + 5, confidence: 0.5 + Math.random() * 0.35 });
            if (d === 15 || d === 22 || d === 28) evts.push({ date: d, type: 'legal', amount: Math.random() * 2000000 + 500000, count: Math.floor(Math.random() * 5) + 1, confidence: 0.9 });
        }
        return evts;
    }, [cMonth, cYear, loanData.length]);

    const mTotals = useMemo(() => {
        const t = { emi: 0, ptp: 0, recovery: 0, legal: 0 };
        events.forEach(e => { t[e.type] += e.amount; }); return t;
    }, [events]);

    const grandTotal = Object.values(mTotals).reduce((s, v) => s + v, 0);
    const avgConfidence = events.length ? events.reduce((s, e) => s + e.confidence, 0) / events.length : 0;

    // Weekly aggregation for bar chart
    const weeklyData = useMemo(() => {
        const dim = new Date(cYear, cMonth + 1, 0).getDate();
        const weeks: { week: string; emi: number; ptp: number; recovery: number; legal: number }[] = [];
        for (let w = 0; w < Math.ceil(dim / 7); w++) {
            const lo = w * 7 + 1, hi = Math.min((w + 1) * 7, dim);
            const wEvts = events.filter(e => e.date >= lo && e.date <= hi);
            weeks.push({
                week: `W${w + 1}`,
                emi: wEvts.filter(e => e.type === 'emi').reduce((s, e) => s + e.amount, 0) / 100000,
                ptp: wEvts.filter(e => e.type === 'ptp').reduce((s, e) => s + e.amount, 0) / 100000,
                recovery: wEvts.filter(e => e.type === 'recovery').reduce((s, e) => s + e.amount, 0) / 100000,
                legal: wEvts.filter(e => e.type === 'legal').reduce((s, e) => s + e.amount, 0) / 100000,
            });
        }
        return weeks;
    }, [events, cMonth, cYear]);

    // Day amount max for heatmap
    const dayAmounts = useMemo(() => {
        const map: Record<number, number> = {};
        events.forEach(e => { map[e.date] = (map[e.date] || 0) + e.amount; });
        return map;
    }, [events]);
    const maxDayAmount = Math.max(...Object.values(dayAmounts), 1);

    const dim = new Date(cYear, cMonth + 1, 0).getDate();
    const fdow = new Date(cYear, cMonth, 1).getDay();
    const cells: (number | null)[] = [...Array(fdow).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
    const selEvts = selDay ? events.filter(e => e.date === selDay) : [];
    const selTotal = selEvts.reduce((s, e) => s + e.amount, 0);

    const prevMonth = () => { if (cMonth === 0) { setCMonth(11); setCYear(y => y - 1); } else setCMonth(m => m - 1); setSelDay(null); };
    const nextMonth = () => { if (cMonth === 11) { setCMonth(0); setCYear(y => y + 1); } else setCMonth(m => m + 1); setSelDay(null); };

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>📅 Cash Flow Calendar</h1>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 6 }}>Predicted recovery dates, PTP dues, and expected inflows</p>
                </div>
                <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
                    {(['calendar', 'weekly'] as const).map(v => (
                        <button key={v} onClick={() => setViewMode(v)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: viewMode === v ? 'white' : 'transparent', color: viewMode === v ? accent : '#64748b', boxShadow: viewMode === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                            {v === 'calendar' ? '📅 Calendar' : '📊 Weekly'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards with sparklines */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 14, marginBottom: 24 }}>
                {Object.entries(ECOL).map(([type, cfg]) => {
                    const total = mTotals[type as keyof typeof mTotals];
                    const evtCount = events.filter(e => e.type === type).length;
                    const dayValues = Array.from({ length: 7 }, (_, i) => {
                        const weekEvts = events.filter(e => e.type === type && e.date >= i * 4 + 1 && e.date <= (i + 1) * 4);
                        return weekEvts.reduce((s, e) => s + e.amount, 0);
                    });
                    const maxV = Math.max(...dayValues, 1);
                    return (
                        <div key={type} style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0', borderLeft: `4px solid ${cfg.text}`, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{cfg.icon} {cfg.label}</div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: cfg.text, fontFamily: 'Space Grotesk' }}>₹{(total / 100000).toFixed(1)}L</div>
                                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>{evtCount} events</div>
                                </div>
                                {/* Mini sparkline */}
                                <svg width={56} height={28} style={{ marginTop: 4 }}>
                                    {dayValues.map((v, i) => (
                                        <rect key={i} x={i * 8} y={28 - (v / maxV) * 24} width={5} height={(v / maxV) * 24} rx={1.5} fill={`${cfg.text}40`} />
                                    ))}
                                </svg>
                            </div>
                        </div>
                    );
                })}
                {/* AI Confidence Gauge */}
                <div style={{ background: 'white', borderRadius: 14, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 120 }}>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>AI Forecast</div>
                    <RadialGauge value={avgConfidence} size={70} color={avgConfidence > 0.75 ? '#16a34a' : '#f59e0b'} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selDay ? '1fr 340px' : '1fr', gap: 24 }}>
                <div>
                    {viewMode === 'calendar' ? (
                        /* Calendar */
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            {/* Month/Year Nav */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => setCYear(y => y - 1)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>«</button>
                                    <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>← Prev</button>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', fontFamily: 'Space Grotesk' }}>{MONTHS[cMonth]} {cYear}</div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={nextMonth} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>Next →</button>
                                    <button onClick={() => setCYear(y => y + 1)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>»</button>
                                </div>
                            </div>
                            {/* Weekday header */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f1f5f9' }}>
                                {WDAYS.map(d => <div key={d} style={{ padding: 8, textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>{d}</div>)}
                            </div>
                            {/* Calendar grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                                {cells.map((day, i) => {
                                    if (!day) return <div key={`e${i}`} style={{ minHeight: 92, background: '#fafafa', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }} />;
                                    const de = events.filter(e => e.date === day);
                                    const isSel = selDay === day;
                                    const today = now.getDate();
                                    const isToday = day === today && cMonth === now.getMonth() && cYear === now.getFullYear();
                                    const dt = dayAmounts[day] || 0;
                                    const heatIntensity = dt / maxDayAmount;
                                    const heatBg = dt > 0 ? `rgba(13,148,136,${0.03 + heatIntensity * 0.12})` : 'white';

                                    return (
                                        <div key={day} onClick={() => setSelDay(isSel ? null : day)} style={{
                                            minHeight: 92, padding: '5px 6px', cursor: 'pointer',
                                            borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9',
                                            background: isSel ? `${accent}10` : isToday ? '#fffbeb' : heatBg,
                                            outline: isSel ? `2px solid ${accent}` : isToday ? '2px solid #fbbf24' : 'none',
                                            transition: 'all 0.18s',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: isToday ? 800 : 600,
                                                    color: isToday ? 'white' : '#0f172a',
                                                    background: isToday ? '#f59e0b' : 'transparent',
                                                    borderRadius: '50%', width: isToday ? 22 : 'auto', height: isToday ? 22 : 'auto',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>{day}</span>
                                                {dt > 0 && <span style={{ fontSize: '0.52rem', fontWeight: 700, color: '#16a34a' }}>₹{(dt / 100000).toFixed(0)}L</span>}
                                            </div>
                                            {de.slice(0, 3).map((e, ei) => (
                                                <div key={ei} style={{ background: ECOL[e.type].bg, borderRadius: 3, padding: '1px 4px', fontSize: '0.52rem', fontWeight: 600, color: ECOL[e.type].text, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {e.count} {ECOL[e.type].label.split(' ')[0]}
                                                </div>
                                            ))}
                                            {de.length > 3 && <div style={{ fontSize: '0.48rem', color: '#94a3b8', textAlign: 'center' }}>+{de.length - 3}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Weekly Stacked Bar Chart */
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Weekly Cash Flow Breakdown (₹ Lakhs)</div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: accent, fontFamily: 'Space Grotesk' }}>
                                    Total: ₹{(grandTotal / 10000000).toFixed(2)}Cr
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={340}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="week" tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <YAxis tick={{ fontSize: 11 }} label={{ value: '₹ Lakhs', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }} />
                                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                    <Bar dataKey="emi" stackId="a" fill="#2563eb" name="EMI Collection" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="ptp" stackId="a" fill="#d97706" name="PTP Due" />
                                    <Bar dataKey="recovery" stackId="a" fill="#16a34a" name="Expected Recovery" />
                                    <Bar dataKey="legal" stackId="a" fill="#db2777" name="Legal Action" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                {selDay && (
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideInRight 0.25s ease' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: `${accent}05` }}>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', fontFamily: 'Space Grotesk' }}>
                                {MONTHS[cMonth]} {selDay}, {cYear}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                                Expected: <strong style={{ color: '#16a34a', fontSize: '1rem' }}>₹{(selTotal / 100000).toFixed(1)}L</strong>
                            </div>
                            {/* Mini breakdown bar */}
                            <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 10, background: '#f1f5f9' }}>
                                {selEvts.map((e, i) => (
                                    <div key={i} style={{ width: `${(e.amount / selTotal) * 100}%`, height: '100%', background: ECOL[e.type].text }} />
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
                            {selEvts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>
                                    <div style={{ fontSize: '2rem' }}>📭</div>
                                    <div style={{ fontSize: '0.82rem' }}>No events</div>
                                </div>
                            ) : selEvts.map((e, i) => {
                                const c = ECOL[e.type];
                                return (
                                    <div key={i} style={{ background: `${c.bg}80`, borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${c.text}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: c.text }}>{c.icon} {c.label}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', background: 'white', padding: '2px 8px', borderRadius: 6 }}>{e.count} accts</span>
                                        </div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Space Grotesk' }}>₹{(e.amount / 100000).toFixed(1)}L</div>
                                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                                            <span>AI Confidence</span>
                                            <span style={{ fontWeight: 700, color: e.confidence > 0.8 ? '#16a34a' : e.confidence > 0.6 ? '#f59e0b' : '#dc2626' }}>{(e.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: 5, borderRadius: 3, background: '#e2e8f0', marginTop: 4 }}>
                                            <div style={{ width: `${e.confidence * 100}%`, height: '100%', borderRadius: 3, background: e.confidence > 0.8 ? '#16a34a' : e.confidence > 0.6 ? '#f59e0b' : '#dc2626', transition: 'width 0.5s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20 }}>
                {Object.entries(ECOL).map(([t, c]) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: c.text }} />
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{c.icon} {c.label}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 30, height: 10, borderRadius: 3, background: `linear-gradient(90deg, rgba(13,148,136,0.05), rgba(13,148,136,0.15))` }} />
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Amount Heatmap</span>
                </div>
            </div>

            <style>{`
                @keyframes slideInRight { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
            `}</style>
        </div>
    );
}
