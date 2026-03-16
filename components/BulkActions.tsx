'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '@/lib/context';

const PAGE_SIZE = 12;

type SortKey = 'name' | 'outstanding' | 'dpd' | 'riskScore' | 'region';
type SortDir = 'asc' | 'desc';

const ACTIONS = [
    { id: 'message', label: '📨 Send Message', desc: 'Send recovery message via best channel to selected accounts', color: '#0d9488', steps: ['Select Template', 'Preview', 'Confirm'] },
    { id: 'assign', label: '👤 Assign Agent', desc: 'Assign selected accounts to a recovery agent', color: '#6366f1', steps: ['Select Agent', 'Set Priority', 'Confirm'] },
    { id: 'campaign', label: '📣 Add to Campaign', desc: 'Add selected accounts to an active recovery campaign', color: '#ec4899', steps: ['Choose Campaign', 'Map Segments', 'Confirm'] },
    { id: 'tag', label: '🏷️ Update Risk Tag', desc: 'Re-classify risk tier for selected accounts', color: '#f59e0b', steps: ['New Tier', 'Review Changes', 'Confirm'] },
    { id: 'escalate', label: '⚡ Escalate', desc: 'Escalate selected accounts to senior recovery team', color: '#dc2626', steps: ['Escalation Level', 'Add Notes', 'Confirm'] },
    { id: 'export', label: '📥 Export CSV', desc: 'Download selected records as a CSV file', color: '#16a34a', steps: ['Select Fields', 'Preview', 'Download'] },
];

const TEMPLATES = ['Friendly EMI Reminder', 'Urgent Payment Notice', 'Settlement Offer', 'Legal Warning – Final', 'Festive Season Benefit'];
const AGENTS_LIST = ['Arjun Mehta', 'Priya Nair', 'Vikram Singh', 'Deepika Sharma', 'Rahul Patil'];
const CAMPAIGNS_LIST = ['Q1 NPA Drive', 'Festive Recovery Push', 'SARFAESI Pre-Action', 'Digital Nudge', 'Settlement Sprint'];

export default function BulkActions() {
    const { loanData, selectedBank } = useApp();
    const accent = selectedBank?.accent || '#0d9488';
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [tierFilter, setTierFilter] = useState('All');
    const [channelFilter, setChannelFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('dpd');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [page, setPage] = useState(0);

    // Wizard state
    const [wizardAction, setWizardAction] = useState<string | null>(null);
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardConfig, setWizardConfig] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [progressPct, setProgressPct] = useState(0);
    const [actionDone, setActionDone] = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);

    // Filter + Search + Sort
    const filtered = useMemo(() => {
        let data = loanData;
        if (tierFilter !== 'All') data = data.filter(d => d.risk.riskTier === tierFilter);
        if (channelFilter !== 'All') data = data.filter(d => d.risk.bestChannel === channelFilter.toLowerCase());
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter(d => d.customer.name.toLowerCase().includes(q) || d.loan.loanId.toLowerCase().includes(q));
        }
        // Sort
        data = [...data].sort((a, b) => {
            let va: number | string, vb: number | string;
            switch (sortKey) {
                case 'name': va = a.customer.name; vb = b.customer.name; break;
                case 'outstanding': va = a.loan.outstandingAmount; vb = b.loan.outstandingAmount; break;
                case 'dpd': va = a.loan.currentDpd; vb = b.loan.currentDpd; break;
                case 'riskScore': va = a.risk.riskScore; vb = b.risk.riskScore; break;
                case 'region': va = a.customer.region; vb = b.customer.region; break;
                default: va = 0; vb = 0;
            }
            if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
            return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
        });
        return data;
    }, [loanData, tierFilter, channelFilter, searchQuery, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const toggleSelect = useCallback((id: string) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
    const selectAll = () => setSelectedIds(new Set(filtered.map(d => d.loan.loanId)));
    const selectPage = () => setSelectedIds(prev => { const n = new Set(prev); paged.forEach(d => n.add(d.loan.loanId)); return n; });
    const deselectAll = () => setSelectedIds(new Set());

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

    // Wizard
    const openWizard = (actionId: string) => { setWizardAction(actionId); setWizardStep(0); setWizardConfig({}); setProcessing(false); setProgressPct(0); };
    const closeWizard = () => { setWizardAction(null); setWizardStep(0); };

    const executeAction = () => {
        setProcessing(true);
        setProgressPct(0);
        const interval = setInterval(() => {
            setProgressPct(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setProcessing(false);
                        closeWizard();
                        setActionDone(wizardAction);
                        setToastVisible(true);
                        setSelectedIds(new Set());
                        setTimeout(() => setToastVisible(false), 4000);
                    }, 400);
                    return 100;
                }
                return prev + Math.random() * 18 + 5;
            });
        }, 200);
    };

    // Stats for selected
    const selStats = useMemo(() => {
        const sel = loanData.filter(d => selectedIds.has(d.loan.loanId));
        const total = sel.reduce((s, d) => s + d.loan.outstandingAmount, 0);
        const avgDpd = sel.length ? Math.round(sel.reduce((s, d) => s + d.loan.currentDpd, 0) / sel.length) : 0;
        const tiers: Record<string, number> = {};
        sel.forEach(d => { tiers[d.risk.riskTier] = (tiers[d.risk.riskTier] || 0) + 1; });
        return { count: sel.length, total, avgDpd, tiers };
    }, [selectedIds, loanData]);

    const activeAction = ACTIONS.find(a => a.id === wizardAction);

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>⚡ Bulk Actions</h1>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 6 }}>Select multiple borrowers and perform batch operations with intelligent workflows</p>
            </div>

            {/* Search + Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text" placeholder="🔍 Search borrower / loan ID..."
                            value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
                            style={{ padding: '7px 14px 7px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.78rem', width: 240, outline: 'none', fontWeight: 500, transition: 'border 0.15s' }}
                            onFocus={e => e.currentTarget.style.borderColor = accent}
                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        />
                        {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: '#94a3b8' }}>✕</button>}
                    </div>
                    {/* Tier filter */}
                    <div style={{ display: 'flex', gap: 3 }}>
                        {['All', 'Critical', 'High', 'Medium', 'Low'].map(t => (
                            <button key={t} onClick={() => { setTierFilter(t); setPage(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, background: tierFilter === t ? accent : '#f1f5f9', color: tierFilter === t ? 'white' : '#64748b', transition: 'all 0.15s' }}>{t}</button>
                        ))}
                    </div>
                    <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />
                    {/* Channel filter */}
                    <div style={{ display: 'flex', gap: 3 }}>
                        {['All', 'WhatsApp', 'SMS', 'Call', 'Email'].map(c => (
                            <button key={c} onClick={() => { setChannelFilter(c); setPage(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, background: channelFilter === c ? accent : '#f1f5f9', color: channelFilter === c ? 'white' : '#64748b', transition: 'all 0.15s' }}>{c}</button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{filtered.length} results · {selectedIds.size} selected</span>
                    <button onClick={selectPage} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>Select Page</button>
                    <button onClick={selectedIds.size > 0 ? deselectAll : selectAll} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>
                        {selectedIds.size > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
            </div>

            {/* Selection Summary Stats */}
            {selectedIds.size > 0 && (
                <div style={{ background: `linear-gradient(135deg, ${accent}08, ${accent}04)`, borderRadius: 14, padding: '14px 20px', marginBottom: 16, border: `1px solid ${accent}20`, animation: 'fadeSlideIn 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Selected</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: accent, fontFamily: 'Space Grotesk' }}>{selStats.count}</div>
                            </div>
                            <div style={{ width: 1, height: 32, background: '#e2e8f0' }} />
                            <div>
                                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Outstanding</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Space Grotesk' }}>₹{(selStats.total / 10000000).toFixed(2)}Cr</div>
                            </div>
                            <div style={{ width: 1, height: 32, background: '#e2e8f0' }} />
                            <div>
                                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Avg DPD</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selStats.avgDpd > 60 ? '#dc2626' : '#f59e0b', fontFamily: 'Space Grotesk' }}>{selStats.avgDpd}</div>
                            </div>
                            <div style={{ width: 1, height: 32, background: '#e2e8f0' }} />
                            <div>
                                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Risk Mix</div>
                                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                                    {Object.entries(selStats.tiers).map(([tier, count]) => {
                                        const tc = tier === 'Critical' ? '#dc2626' : tier === 'High' ? '#f59e0b' : tier === 'Medium' ? '#2563eb' : '#16a34a';
                                        return <span key={tier} style={{ padding: '1px 7px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 700, background: `${tc}12`, color: tc }}>{tier}: {count}</span>;
                                    })}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {ACTIONS.map(a => (
                                <button key={a.id} onClick={() => openWizard(a.id)}
                                    style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: a.color, color: 'white', fontSize: '0.72rem', fontWeight: 700, transition: 'transform 0.1s, box-shadow 0.15s', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)'; }}
                                >{a.label}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {actionDone && (
                <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 20px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 10,
                    animation: 'fadeSlideIn 0.35s ease',
                    opacity: toastVisible ? 1 : 0, transition: 'opacity 0.4s ease',
                }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, color: 'white' }}>✓</div>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>Action Completed Successfully</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>"{ACTIONS.find(a => a.id === actionDone)?.label}" processed for {selStats.count || 'all selected'} accounts</div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead><tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '11px 14px', width: 40 }}>
                            <input type="checkbox" checked={paged.every(d => selectedIds.has(d.loan.loanId)) && paged.length > 0} onChange={() => paged.every(d => selectedIds.has(d.loan.loanId)) ? paged.forEach(d => toggleSelect(d.loan.loanId)) : selectPage()} style={{ cursor: 'pointer', accentColor: accent }} />
                        </th>
                        <th onClick={() => handleSort('name')} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', userSelect: 'none' }}>Borrower{sortIcon('name')}</th>
                        <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Loan ID</th>
                        <th onClick={() => handleSort('outstanding')} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', userSelect: 'none' }}>Outstanding{sortIcon('outstanding')}</th>
                        <th onClick={() => handleSort('dpd')} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', userSelect: 'none' }}>DPD{sortIcon('dpd')}</th>
                        <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Risk</th>
                        <th onClick={() => handleSort('riskScore')} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', userSelect: 'none' }}>Score{sortIcon('riskScore')}</th>
                        <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Channel</th>
                        <th onClick={() => handleSort('region')} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', userSelect: 'none' }}>Region{sortIcon('region')}</th>
                    </tr></thead>
                    <tbody>
                        {paged.length === 0 && (
                            <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>No matching records</div>
                                <div style={{ fontSize: '0.75rem', marginTop: 4 }}>Try adjusting your filters or search query</div>
                            </td></tr>
                        )}
                        {paged.map(d => {
                            const sel = selectedIds.has(d.loan.loanId);
                            const tierCol = d.risk.riskTier === 'Critical' ? '#dc2626' : d.risk.riskTier === 'High' ? '#f59e0b' : d.risk.riskTier === 'Medium' ? '#2563eb' : '#16a34a';
                            return (
                                <tr key={d.loan.loanId} onClick={() => toggleSelect(d.loan.loanId)}
                                    style={{ borderBottom: '1px solid #f1f5f9', background: sel ? `${accent}06` : 'white', cursor: 'pointer', transition: 'background 0.15s' }}
                                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#fafafa'; }}
                                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'white'; }}
                                >
                                    <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" checked={sel} onChange={() => toggleSelect(d.loan.loanId)} style={{ cursor: 'pointer', accentColor: accent }} />
                                    </td>
                                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: accent, flexShrink: 0 }}>
                                                {d.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            {d.customer.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 14px', color: '#64748b', fontFamily: 'monospace', fontSize: '0.72rem' }}>{d.loan.loanId}</td>
                                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a', fontFamily: 'Space Grotesk' }}>₹{(d.loan.outstandingAmount / 100000).toFixed(1)}L</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <span style={{ fontWeight: 700, color: d.loan.currentDpd > 60 ? '#dc2626' : d.loan.currentDpd > 30 ? '#f59e0b' : '#16a34a' }}>{d.loan.currentDpd}</span>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}><span style={{ padding: '2px 9px', borderRadius: 6, fontWeight: 700, fontSize: '0.7rem', background: `${tierCol}12`, color: tierCol }}>{d.risk.riskTier}</span></td>
                                    <td style={{ padding: '10px 14px', fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 36, height: 5, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                                                <div style={{ width: `${d.risk.riskScore}%`, height: '100%', borderRadius: 3, background: d.risk.riskScore > 75 ? '#dc2626' : d.risk.riskScore > 50 ? '#f59e0b' : '#16a34a' }} />
                                            </div>
                                            {d.risk.riskScore}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 14px', fontSize: '0.72rem', color: '#64748b' }}>{d.risk.bestChannel}</td>
                                    <td style={{ padding: '10px 14px', fontSize: '0.72rem', color: '#64748b' }}>{d.customer.region}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <button onClick={() => setPage(0)} disabled={page === 0} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: page === 0 ? 'default' : 'pointer', fontSize: '0.72rem', fontWeight: 600, color: page === 0 ? '#cbd5e1' : '#64748b', opacity: page === 0 ? 0.5 : 1 }}>«</button>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: page === 0 ? 'default' : 'pointer', fontSize: '0.72rem', fontWeight: 600, color: page === 0 ? '#cbd5e1' : '#64748b', opacity: page === 0 ? 0.5 : 1 }}>‹ Prev</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const p = totalPages <= 5 ? i : Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                        return (
                            <button key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: page === p ? 800 : 600, background: page === p ? accent : '#f1f5f9', color: page === p ? 'white' : '#64748b' }}>{p + 1}</button>
                        );
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontSize: '0.72rem', fontWeight: 600, color: page >= totalPages - 1 ? '#cbd5e1' : '#64748b', opacity: page >= totalPages - 1 ? 0.5 : 1 }}>Next ›</button>
                    <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontSize: '0.72rem', fontWeight: 600, color: page >= totalPages - 1 ? '#cbd5e1' : '#64748b', opacity: page >= totalPages - 1 ? 0.5 : 1 }}>»</button>
                </div>
            </div>

            {/* ─── Multi-Step Action Wizard Modal ─────────────────────── */}
            {wizardAction && activeAction && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ background: 'white', borderRadius: 20, width: 520, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', animation: 'scaleIn 0.25s ease' }}>
                        {/* Wizard Header */}
                        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: activeAction.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{activeAction.label.split(' ')[0]}</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', fontFamily: 'Space Grotesk' }}>{activeAction.label.slice(2).trim()}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{selectedIds.size} accounts selected</div>
                                    </div>
                                </div>
                                <button onClick={closeWizard} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            </div>
                            {/* Step indicator */}
                            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                {activeAction.steps.map((step, i) => (
                                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
                                            <div style={{
                                                width: 22, height: 22, borderRadius: '50%', fontSize: '0.62rem', fontWeight: 800,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: i < wizardStep ? '#16a34a' : i === wizardStep ? activeAction.color : '#f1f5f9',
                                                color: i <= wizardStep ? 'white' : '#94a3b8',
                                                transition: 'all 0.3s',
                                            }}>{i < wizardStep ? '✓' : i + 1}</div>
                                        </div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: i === wizardStep ? 700 : 500, color: i === wizardStep ? '#0f172a' : '#94a3b8', transition: 'all 0.3s' }}>{step}</div>
                                        <div style={{ height: 3, borderRadius: 2, background: i < wizardStep ? '#16a34a' : i === wizardStep ? `${activeAction.color}40` : '#f1f5f9', marginTop: 6, transition: 'all 0.3s' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wizard Body */}
                        <div style={{ padding: '20px 28px' }}>
                            {processing ? (
                                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }}>⚙️</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 12 }}>Processing {selectedIds.size} accounts...</div>
                                    <div style={{ width: '100%', height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden', marginBottom: 8 }}>
                                        <div style={{ width: `${Math.min(progressPct, 100)}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${activeAction.color}, ${activeAction.color}cc)`, transition: 'width 0.3s ease' }} />
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{Math.min(Math.round(progressPct), 100)}% complete</div>
                                </div>
                            ) : (
                                <>
                                    {/* Step 0: Configure */}
                                    {wizardStep === 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{activeAction.steps[0]}</div>
                                            {wizardAction === 'message' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {TEMPLATES.map(t => (
                                                        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${wizardConfig.template === t ? accent : '#e2e8f0'}`, cursor: 'pointer', background: wizardConfig.template === t ? `${accent}08` : 'white', transition: 'all 0.15s' }}>
                                                            <input type="radio" name="template" checked={wizardConfig.template === t} onChange={() => setWizardConfig(p => ({ ...p, template: t }))} style={{ accentColor: accent }} />
                                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{t}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                            {wizardAction === 'assign' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {AGENTS_LIST.map(a => (
                                                        <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${wizardConfig.agent === a ? accent : '#e2e8f0'}`, cursor: 'pointer', background: wizardConfig.agent === a ? `${accent}08` : 'white' }}>
                                                            <input type="radio" name="agent" checked={wizardConfig.agent === a} onChange={() => setWizardConfig(p => ({ ...p, agent: a }))} style={{ accentColor: accent }} />
                                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: accent }}>{a.split(' ').map(n => n[0]).join('')}</div>
                                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{a}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                            {wizardAction === 'campaign' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {CAMPAIGNS_LIST.map(c => (
                                                        <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${wizardConfig.campaign === c ? accent : '#e2e8f0'}`, cursor: 'pointer', background: wizardConfig.campaign === c ? `${accent}08` : 'white' }}>
                                                            <input type="radio" name="campaign" checked={wizardConfig.campaign === c} onChange={() => setWizardConfig(p => ({ ...p, campaign: c }))} style={{ accentColor: accent }} />
                                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{c}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                            {wizardAction === 'tag' && (
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    {['Critical', 'High', 'Medium', 'Low'].map(t => {
                                                        const tc = t === 'Critical' ? '#dc2626' : t === 'High' ? '#f59e0b' : t === 'Medium' ? '#2563eb' : '#16a34a';
                                                        return (
                                                            <button key={t} onClick={() => setWizardConfig(p => ({ ...p, tier: t }))}
                                                                style={{ flex: 1, padding: '16px 10px', borderRadius: 12, border: `2px solid ${wizardConfig.tier === t ? tc : '#e2e8f0'}`, background: wizardConfig.tier === t ? `${tc}10` : 'white', cursor: 'pointer', textAlign: 'center' }}>
                                                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: tc, fontFamily: 'Space Grotesk' }}>{t}</div>
                                                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4 }}>Set to {t}</div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {wizardAction === 'escalate' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {['Level 1 – Senior Agent', 'Level 2 – Team Lead', 'Level 3 – Manager', 'Level 4 – Legal / SARFAESI'].map(l => (
                                                        <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, border: `1px solid ${wizardConfig.level === l ? '#dc2626' : '#e2e8f0'}`, cursor: 'pointer', background: wizardConfig.level === l ? '#fef2f218' : 'white' }}>
                                                            <input type="radio" name="level" checked={wizardConfig.level === l} onChange={() => setWizardConfig(p => ({ ...p, level: l }))} style={{ accentColor: '#dc2626' }} />
                                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{l}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                            {wizardAction === 'export' && (
                                                <div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 8 }}>Select fields to export:</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                        {['Borrower Name', 'Loan ID', 'Outstanding', 'DPD', 'Risk Tier', 'Risk Score', 'Best Channel', 'Region', 'Phone', 'Email'].map(f => (
                                                            <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                                                                <input type="checkbox" defaultChecked style={{ accentColor: accent }} /> {f}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Step 1: Preview */}
                                    {wizardStep === 1 && (
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{activeAction.steps[1]}</div>
                                            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                    <div><span style={{ fontSize: '0.68rem', color: '#64748b' }}>Action</span><div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{activeAction.label}</div></div>
                                                    <div><span style={{ fontSize: '0.68rem', color: '#64748b' }}>Accounts</span><div style={{ fontWeight: 700, fontSize: '0.85rem', color: accent }}>{selectedIds.size}</div></div>
                                                    <div><span style={{ fontSize: '0.68rem', color: '#64748b' }}>Total Outstanding</span><div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>₹{(selStats.total / 10000000).toFixed(2)}Cr</div></div>
                                                    <div><span style={{ fontSize: '0.68rem', color: '#64748b' }}>Configuration</span><div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{Object.values(wizardConfig).join(', ') || 'Default'}</div></div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 14, background: '#fffbeb', borderRadius: 10, padding: '10px 14px', border: '1px solid #fef3c7', fontSize: '0.75rem', color: '#92400e', display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <span>⚠️</span> This action will affect {selectedIds.size} accounts. It cannot be undone.
                                            </div>
                                        </div>
                                    )}
                                    {/* Step 2: Confirm */}
                                    {wizardStep === 2 && (
                                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: 8 }}>{activeAction.label.split(' ')[0]}</div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', fontFamily: 'Space Grotesk', marginBottom: 8 }}>Ready to Execute</div>
                                            <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                                                {activeAction.desc} for <strong>{selectedIds.size} accounts</strong>.
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Wizard Footer */}
                        {!processing && (
                            <div style={{ padding: '16px 28px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                <button onClick={() => wizardStep === 0 ? closeWizard() : setWizardStep(s => s - 1)}
                                    style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#64748b' }}>
                                    {wizardStep === 0 ? 'Cancel' : '← Back'}
                                </button>
                                <button
                                    onClick={() => wizardStep < 2 ? setWizardStep(s => s + 1) : executeAction()}
                                    style={{ padding: '9px 24px', borderRadius: 10, border: 'none', background: wizardStep === 2 ? activeAction.color : accent, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                                    {wizardStep === 2 ? '🚀 Execute Action' : 'Next →'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
                @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.1); } }
            `}</style>
        </div>
    );
}
