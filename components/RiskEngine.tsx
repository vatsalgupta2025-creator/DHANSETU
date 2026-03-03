'use client';
import React, { useMemo, useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { LoanRecord } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function RiskBadge({ tier }: { tier: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        Critical: { bg: '#fef2f2', color: '#dc2626' },
        High: { bg: '#fff7ed', color: '#ea580c' },
        Medium: { bg: '#fffbeb', color: '#d97706' },
        Low: { bg: '#f0fdf4', color: '#16a34a' },
    };
    const s = map[tier] || map.Low;
    return (
        <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${s.color}30` }}>
            {tier}
        </span>
    );
}

const TIERS = ['All', 'Critical', 'High', 'Medium', 'Low'];
const CHANNELS = ['All', 'whatsapp', 'sms', 'call', 'email'];
const PAGE_SIZE = 12;

export default function RiskEngine() {
    const { loanData, setSelectedRecord, setActivePage, appLanguage } = useApp();
    const lang: any = appLanguage?.code || 'en-IN';
    const [tierFilter, setTierFilter] = useState('All');
    const [channelFilter, setChannelFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'riskScore' | 'dpd' | 'overdue' | 'recovery' | 'priority'>('priority');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

    const filtered = useMemo(() => {
        let d = loanData;
        if (tierFilter !== 'All') d = d.filter(r => r.risk.riskTier === tierFilter);
        if (channelFilter !== 'All') d = d.filter(r => r.risk.bestChannel === channelFilter);
        if (search) d = d.filter(r =>
            r.customer.name.toLowerCase().includes(search.toLowerCase()) ||
            r.loan.loanId.toLowerCase().includes(search.toLowerCase()) ||
            r.customer.region.toLowerCase().includes(search.toLowerCase())
        );
        return [...d].sort((a, b) => {
            const getVal = (r: LoanRecord) => {
                if (sortBy === 'riskScore') return r.risk.riskScore;
                if (sortBy === 'dpd') return r.loan.currentDpd;
                if (sortBy === 'overdue') return r.loan.overdueAmount;
                if (sortBy === 'priority') return Math.round(r.risk.riskScore * (r.loan.overdueAmount / 10000));
                return r.risk.expectedRecovery;
            };
            return sortDir === 'desc' ? getVal(b) - getVal(a) : getVal(a) - getVal(b);
        });
    }, [loanData, tierFilter, channelFilter, search, sortBy, sortDir]);

    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    // Chart: risk score distribution
    const scoreHistogram = useMemo(() => {
        const bins: Record<string, number> = {};
        for (let i = 0; i <= 90; i += 10) bins[`${i}-${i + 9}`] = 0;
        loanData.forEach(r => {
            const bin = Math.floor(r.risk.riskScore / 10) * 10;
            const key = `${bin}-${bin + 9}`;
            if (bins[key] !== undefined) bins[key]++;
        });
        return Object.entries(bins).map(([range, count]) => ({
            range,
            count,
            color: parseInt(range) >= 80 ? '#dc2626' : parseInt(range) >= 60 ? '#ea580c' : parseInt(range) >= 40 ? '#d97706' : '#16a34a',
        }));
    }, [loanData]);

    function toggleSort(col: typeof sortBy) {
        if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortBy(col); setSortDir('desc'); }
    }

    function SortBtn({ col, label }: { col: typeof sortBy; label: string }) {
        return (
            <button onClick={() => toggleSort(col)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: sortBy === col ? '#0d9488' : '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {label}
                <span style={{ opacity: sortBy === col ? 1 : 0.3 }}>{sortDir === 'desc' ? '▼' : '▲'}</span>
            </button>
        );
    }

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {t('risk.title', lang)}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '6px 0 0' }}>
                        {t('risk.subtitle', lang)} • {loanData.length.toLocaleString()} accounts scored • AUC-ROC: 0.87
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {['Critical', 'High', 'Medium', 'Low'].map(tier => {
                        const counts: Record<string, number> = {
                            Critical: loanData.filter(d => d.risk.riskTier === 'Critical').length,
                            High: loanData.filter(d => d.risk.riskTier === 'High').length,
                            Medium: loanData.filter(d => d.risk.riskTier === 'Medium').length,
                            Low: loanData.filter(d => d.risk.riskTier === 'Low').length,
                        };
                        const colors: Record<string, string> = { Critical: '#fef2f2', High: '#fff7ed', Medium: '#fffbeb', Low: '#f0fdf4' };
                        const textColors: Record<string, string> = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#16a34a' };
                        return (
                            <button key={tier} onClick={() => { setTierFilter(tierFilter === tier ? 'All' : tier); setPage(0); }}
                                style={{
                                    background: tierFilter === tier ? textColors[tier] : colors[tier],
                                    color: tierFilter === tier ? 'white' : textColors[tier],
                                    border: `1.5px solid ${textColors[tier]}40`,
                                    borderRadius: 10, padding: '8px 12px', cursor: 'pointer', textAlign: 'center',
                                }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{counts[tier]}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: 1 }}>{tier}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Score distribution */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: '20px 22px', border: '1px solid var(--border)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t('risk.riskScore', lang)} Distribution</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 2 }}>
                            {t('risk.subtitle', lang)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[{ c: '#22c55e', l: 'Low (0-39)' }, { c: '#f59e0b', l: 'Medium (40-59)' }, { c: '#f97316', l: 'High (60-79)' }, { c: '#ef4444', l: 'Critical (80+)' }].map(l => (
                            <div key={l.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.c }} />
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{l.l}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={scoreHistogram} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 90, 43, 0.10)" vertical={false} />
                        <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#8b7355' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#8b7355' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-primary)' }} formatter={(v: any) => [`${v} accounts`, 'Count']} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {scoreHistogram.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Filters + Table */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Filter bar */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16 }}>
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                            placeholder="Search by name, loan ID, region..."
                            style={{ width: '100%', padding: '8px 10px 8px 34px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.82rem', outline: 'none', fontFamily: 'Inter', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {CHANNELS.map(c => (
                            <button key={c} onClick={() => { setChannelFilter(c); setPage(0); }}
                                style={{
                                    padding: '7px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                                    background: channelFilter === c ? '#0d9488' : 'var(--bg-elevated)',
                                    color: channelFilter === c ? 'white' : '#475569',
                                    border: `1.5px solid ${channelFilter === c ? '#0d9488' : '#e2e8f0'}`,
                                    cursor: 'pointer',
                                }}>
                                {c === 'All' ? 'All Channels' : c.charAt(0).toUpperCase() + c.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' }}>
                        Showing {paginated.length} of {filtered.length}
                    </div>
                </div>

                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Borrower</th>
                            <th>Product / Region</th>
                            <th style={{ cursor: 'pointer' }}><SortBtn col="dpd" label="DPD" /></th>
                            <th style={{ cursor: 'pointer' }}><SortBtn col="overdue" label="Overdue ₹" /></th>
                            <th style={{ cursor: 'pointer' }}><SortBtn col="riskScore" label="Risk Score" /></th>
                            <th>Tier</th>
                            <th style={{ cursor: 'pointer' }}><SortBtn col="recovery" label="Recov %" /></th>
                            <th style={{ cursor: 'pointer' }}><SortBtn col="priority" label="Priority 🎯" /></th>
                            <th>Best Channel</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(r => (
                            <React.Fragment key={r.customer.id}>
                                <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === r.customer.id ? null : r.customer.id)}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                                background: r.risk.riskScore >= 80 ? '#fef2f2' : r.risk.riskScore >= 60 ? '#fff7ed' : '#f0fdf4',
                                                border: `1.5px solid ${r.risk.riskScore >= 80 ? '#fecaca' : r.risk.riskScore >= 60 ? '#fed7aa' : '#bbf7d0'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.65rem', fontWeight: 700,
                                                color: r.risk.riskScore >= 80 ? '#dc2626' : r.risk.riskScore >= 60 ? '#ea580c' : '#16a34a',
                                            }}>
                                                {r.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{r.customer.name}</div>
                                                <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{r.customer.id} • {r.customer.languageName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.78rem', color: '#0f172a' }}>{r.loan.product}</div>
                                        <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{r.customer.region}</div>
                                    </td>
                                    <td>
                                        <span style={{
                                            background: r.loan.currentDpd > 60 ? '#fef2f2' : r.loan.currentDpd > 30 ? '#fff7ed' : '#fffbeb',
                                            color: r.loan.currentDpd > 60 ? '#dc2626' : r.loan.currentDpd > 30 ? '#ea580c' : '#d97706',
                                            borderRadius: 999, padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700,
                                        }}>
                                            {r.loan.currentDpd}d
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                                        ₹{r.loan.overdueAmount.toLocaleString('en-IN')}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%', borderRadius: 999,
                                                    width: `${r.risk.riskScore}%`,
                                                    background: r.risk.riskScore >= 80 ? '#dc2626' : r.risk.riskScore >= 60 ? '#ea580c' : r.risk.riskScore >= 40 ? '#d97706' : '#16a34a',
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', minWidth: 28, textAlign: 'right' }}>{r.risk.riskScore}</span>
                                        </div>
                                    </td>
                                    <td><RiskBadge tier={r.risk.riskTier} /></td>
                                    <td>
                                        <span style={{
                                            color: r.risk.expectedRecovery >= 60 ? '#16a34a' : r.risk.expectedRecovery >= 40 ? '#d97706' : '#dc2626',
                                            fontWeight: 700, fontSize: '0.82rem',
                                        }}>
                                            {Math.round(r.risk.expectedRecovery)}%
                                        </span>
                                    </td>
                                    <td>
                                        {(() => {
                                            const ps = Math.round(r.risk.riskScore * (r.loan.overdueAmount / 10000));
                                            const maxPs = 1000;
                                            const pct = Math.min(ps / maxPs * 100, 100);
                                            const col = ps > 600 ? '#dc2626' : ps > 350 ? '#ea580c' : '#d97706';
                                            return (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <div style={{ width: 40, height: 5, background: '#f1f5f9', borderRadius: 999 }}>
                                                        <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 999 }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: col, minWidth: 30 }}>{ps}</span>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td>
                                        <span style={{
                                            background: '#f0fdf4', color: '#16a34a', borderRadius: 999,
                                            padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600,
                                        }}>
                                            {r.risk.bestChannel === 'whatsapp' ? '📱 WhatsApp' : r.risk.bestChannel === 'sms' ? '💬 SMS' : r.risk.bestChannel === 'call' ? '📞 Call' : '✉️ Email'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button
                                                onClick={e => { e.stopPropagation(); setSelectedRecord(r); setActivePage('messages'); }}
                                                style={{ background: '#f0fdf4', color: '#0d9488', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 8px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                                                Message
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); setSelectedRecord(r); setActivePage('bot'); }}
                                                style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: 6, padding: '4px 8px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                                                Bot
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expanded === r.customer.id && (
                                    <tr>
                                        <td colSpan={10} style={{ padding: 0, background: '#f8fafc' }}>
                                            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Default Probability</div>
                                                    {[['30-day', r.risk.defaultProbability30d], ['60-day', r.risk.defaultProbability60d], ['90-day', r.risk.defaultProbability90d]].map(([label, val]) => (
                                                        <div key={label as string} style={{ marginBottom: 6 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 3 }}>
                                                                <span style={{ color: '#64748b' }}>{label}</span>
                                                                <span style={{ fontWeight: 700 }}>{Math.round(val as number)}%</span>
                                                            </div>
                                                            <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999 }}>
                                                                <div style={{ height: '100%', width: `${val}%`, background: '#dc2626', borderRadius: 999 }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Loan Details</div>
                                                    {[['Principal', `₹${r.loan.principal.toLocaleString('en-IN')}`], ['Outstanding', `₹${r.loan.outstandingAmount.toLocaleString('en-IN')}`], ['EMI', `₹${r.loan.emiAmount.toLocaleString('en-IN')}`], ['Rate', `${r.loan.interestRate}%`]].map(([k, v]) => (
                                                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                                                            <span style={{ color: '#64748b' }}>{k}</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Customer Profile</div>
                                                    {[['Age', r.customer.age], ['Occupation', r.customer.occupation.replace('_', ' ')], ['Credit Score', r.loan.creditScore], ['Bounces (6m)', r.loan.bounceCount6m], ['Avg Balance', `₹${r.loan.avgBalance3m.toLocaleString('en-IN')}`]].map(([k, v]) => (
                                                        <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                                                            <span style={{ color: '#64748b' }}>{k}</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Recovery Intel</div>
                                                    <div style={{ fontSize: '0.75rem', marginBottom: 4, color: '#64748b' }}>Uplift Score: <strong style={{ color: r.risk.upliftScore > 50 ? '#16a34a' : '#d97706' }}>{r.risk.upliftScore}/100</strong></div>
                                                    <div style={{ fontSize: '0.75rem', marginBottom: 4, color: '#64748b' }}>Best Time: <strong style={{ color: '#0f172a' }}>{r.risk.bestTime}</strong></div>
                                                    {r.risk.predictedDefaultDate && <div style={{ fontSize: '0.75rem', marginBottom: 4, color: '#64748b' }}>Predicted Default: <strong style={{ color: '#dc2626' }}>{r.risk.predictedDefaultDate}</strong></div>}
                                                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8 }}>Previous: {r.loan.previousResponses.join(', ')}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        Page {page + 1} of {totalPages} • {filtered.length} records
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[...Array(Math.min(totalPages, 8))].map((_, i) => (
                            <button key={i} onClick={() => setPage(i)}
                                style={{
                                    width: 30, height: 30, borderRadius: 7, border: 'none',
                                    background: page === i ? '#0d9488' : '#f1f5f9',
                                    color: page === i ? 'white' : '#475569',
                                    fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                                }}>
                                {i + 1}
                            </button>
                        ))}
                        {totalPages > 8 && <span style={{ alignSelf: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>... {totalPages}</span>}
                    </div>
                </div>
            </div>
        </div >
    );
}
