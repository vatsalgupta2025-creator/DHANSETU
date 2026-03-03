'use client';
import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';

// ======================== PROMISE-TO-PAY TRACKER ========================
interface PTP {
    id: string;
    borrower: string;
    amount: number;
    promiseDate: string;
    channel: string;
    status: 'pending' | 'fulfilled' | 'broken' | 'partial';
    createdAt: string;
}

function PTPTracker() {
    const { loanData } = useApp();
    const [ptps, setPtps] = useState<PTP[]>(() => {
        const today = new Date();
        return loanData.slice(0, 12).map((r, i) => {
            const daysAhead = [1, 3, 5, 7, 10, 14, 2, 4, 6, 8, 12, 15][i % 12];
            const date = new Date(today);
            date.setDate(date.getDate() + daysAhead - 5);
            const statuses: PTP['status'][] = ['pending', 'fulfilled', 'broken', 'pending', 'fulfilled', 'partial', 'pending', 'fulfilled', 'broken', 'pending', 'fulfilled', 'pending'];
            return {
                id: `PTP-${String(i + 1).padStart(3, '0')}`,
                borrower: r.customer.name,
                amount: Math.round(r.loan.overdueAmount * 0.6),
                promiseDate: date.toLocaleDateString('en-IN'),
                channel: ['WhatsApp', 'Call', 'SMS', 'Bot'][i % 4],
                status: statuses[i % 12],
                createdAt: new Date(today.getTime() - (i * 86400000)).toLocaleDateString('en-IN'),
            };
        });
    });

    const [showAdd, setShowAdd] = useState(false);
    const [newPTP, setNewPTP] = useState({ borrower: '', amount: '', promiseDate: '', channel: 'WhatsApp' });

    const statusConfig: Record<PTP['status'], { bg: string; color: string; label: string }> = {
        pending: { bg: '#fffbeb', color: '#d97706', label: '⏳ Pending' },
        fulfilled: { bg: '#f0fdf4', color: '#16a34a', label: '✅ Fulfilled' },
        broken: { bg: '#fef2f2', color: '#dc2626', label: '❌ Broken' },
        partial: { bg: '#fff7ed', color: '#ea580c', label: '🔶 Partial' },
    };

    const stats = {
        total: ptps.length,
        fulfilled: ptps.filter(p => p.status === 'fulfilled').length,
        pending: ptps.filter(p => p.status === 'pending').length,
        broken: ptps.filter(p => p.status === 'broken').length,
        totalAmount: ptps.reduce((s, p) => s + p.amount, 0),
    };

    function addPTP() {
        if (!newPTP.borrower || !newPTP.amount) return;
        setPtps(prev => [...prev, {
            id: `PTP-${String(prev.length + 1).padStart(3, '0')}`,
            borrower: newPTP.borrower,
            amount: parseInt(newPTP.amount),
            promiseDate: newPTP.promiseDate || new Date().toLocaleDateString('en-IN'),
            channel: newPTP.channel,
            status: 'pending',
            createdAt: new Date().toLocaleDateString('en-IN'),
        }]);
        setNewPTP({ borrower: '', amount: '', promiseDate: '', channel: 'WhatsApp' });
        setShowAdd(false);
    }

    function updateStatus(id: string, status: PTP['status']) {
        setPtps(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    }

    return (
        <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 18 }}>
                {[
                    { label: 'Total PTPs', val: stats.total, color: '#0d9488', bg: '#f0fdfa' },
                    { label: 'Fulfilled', val: stats.fulfilled, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'Pending', val: stats.pending, color: '#d97706', bg: '#fffbeb' },
                    { label: 'Broken', val: stats.broken, color: '#dc2626', bg: '#fef2f2' },
                    { label: 'Amount Committed', val: `₹${Math.round(stats.totalAmount / 100000)}L`, color: '#0d9488', bg: '#f0fdfa' },
                ].map(item => (
                    <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: '14px', border: `1px solid ${item.color}20` }}>
                        <div style={{ fontWeight: 800, fontSize: '1.4rem', color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 3 }}>{item.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Promise-to-Pay Registry</div>
                    <button onClick={() => setShowAdd(!showAdd)}
                        style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #0d9488, #16a34a)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                        + Add PTP
                    </button>
                </div>
                {showAdd && (
                    <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        {[
                            { placeholder: 'Borrower name', key: 'borrower', type: 'text' },
                            { placeholder: 'Amount ₹', key: 'amount', type: 'number' },
                            { placeholder: 'Promise date', key: 'promiseDate', type: 'date' },
                        ].map(field => (
                            <input key={field.key} type={field.type} placeholder={field.placeholder}
                                value={(newPTP as any)[field.key]}
                                onChange={e => setNewPTP(prev => ({ ...prev, [field.key]: e.target.value }))}
                                style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.8rem', fontFamily: 'Inter', outline: 'none', minWidth: 150 }} />
                        ))}
                        <select value={newPTP.channel} onChange={e => setNewPTP(prev => ({ ...prev, channel: e.target.value }))}
                            style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.8rem', fontFamily: 'Inter', outline: 'none' }}>
                            {['WhatsApp', 'Call', 'SMS', 'Bot'].map(c => <option key={c}>{c}</option>)}
                        </select>
                        <button onClick={addPTP} style={{ padding: '8px 14px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setShowAdd(false)} style={{ padding: '8px 12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Cancel</button>
                    </div>
                )}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            {['PTP ID', 'Borrower', 'Amount', 'Promise Date', 'Channel', 'Status', 'Created', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '9px 14px', fontSize: '0.63rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ptps.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '10px 14px', fontSize: '0.75rem', fontWeight: 600, color: '#0d9488' }}>{p.id}</td>
                                <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{p.borrower}</td>
                                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: '#475569' }}>{p.promiseDate}</td>
                                <td style={{ padding: '10px 14px', fontSize: '0.72rem', color: '#64748b' }}>{p.channel}</td>
                                <td style={{ padding: '10px 14px' }}>
                                    <span style={{ background: statusConfig[p.status].bg, color: statusConfig[p.status].color, border: `1px solid ${statusConfig[p.status].color}25`, borderRadius: 999, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700 }}>
                                        {statusConfig[p.status].label}
                                    </span>
                                </td>
                                <td style={{ padding: '10px 14px', fontSize: '0.72rem', color: '#94a3b8' }}>{p.createdAt}</td>
                                <td style={{ padding: '10px 14px' }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {p.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateStatus(p.id, 'fulfilled')} style={{ padding: '3px 8px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>✓ Paid</button>
                                                <button onClick={() => updateStatus(p.id, 'broken')} style={{ padding: '3px 8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>✗ Broken</button>
                                            </>
                                        )}
                                        {p.status === 'fulfilled' && <span style={{ fontSize: '0.7rem', color: '#16a34a' }}>✅ Complete</span>}
                                        {p.status === 'broken' && <button onClick={() => updateStatus(p.id, 'pending')} style={{ padding: '3px 8px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>🔄 Re-open</button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ======================== DYNAMIC EMI RESTRUCTURING CALCULATOR ========================
function EMICalculator() {
    const [principal, setPrincipal] = useState(250000);
    const [currentRate, setCurrentRate] = useState(12);
    const [remainingMonths, setRemainingMonths] = useState(24);
    const [overdueAmount, setOverdueAmount] = useState(42000);
    const [waiverPct, setWaiverPct] = useState(15);
    const [moratoriumMonths, setMoratoriumMonths] = useState(3);

    const currentEMI = useMemo(() => {
        const r = currentRate / 100 / 12;
        return Math.round(principal * r * Math.pow(1 + r, remainingMonths) / (Math.pow(1 + r, remainingMonths) - 1));
    }, [principal, currentRate, remainingMonths]);

    const newOutstanding = principal + overdueAmount * (1 - waiverPct / 100);
    const newMonths = remainingMonths + moratoriumMonths;
    const newEMI = useMemo(() => {
        const r = currentRate / 100 / 12;
        return Math.round(newOutstanding * r * Math.pow(1 + r, newMonths) / (Math.pow(1 + r, newMonths) - 1));
    }, [newOutstanding, newMonths, currentRate]);

    const savings = overdueAmount * (waiverPct / 100);
    const totalPayable = newEMI * newMonths;

    const options = [
        { label: 'Partial Waiver Only', desc: `${waiverPct}% waiver on overdue`, newEMI: currentEMI, saving: savings, icon: '💰' },
        { label: 'Moratorium + Waiver', desc: `${moratoriumMonths}m pause + ${waiverPct}% waiver`, newEMI, saving: savings, icon: '🔄' },
        { label: 'Reduced EMI (6m)', desc: 'Pay 50% now, step-up later', newEMI: Math.round(currentEMI * 0.5), saving: 0, icon: '📉' },
        { label: 'One-Time Settlement', desc: '25% waiver on total outstanding', newEMI: 0, saving: Math.round(principal * 0.25), icon: '🤝', lumpsum: Math.round(principal * 0.75) },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 20, fontSize: '0.95rem' }}>Loan Parameters</div>
                {[
                    { label: 'Principal Outstanding (₹)', val: principal, setter: setPrincipal, min: 10000, max: 2000000, step: 10000 },
                    { label: 'Interest Rate (%)', val: currentRate, setter: setCurrentRate, min: 6, max: 24, step: 0.5 },
                    { label: 'Remaining Months', val: remainingMonths, setter: setRemainingMonths, min: 3, max: 60, step: 1 },
                    { label: 'Overdue Amount (₹)', val: overdueAmount, setter: setOverdueAmount, min: 0, max: 500000, step: 1000 },
                    { label: 'Waiver Offered (%)', val: waiverPct, setter: setWaiverPct, min: 0, max: 50, step: 5 },
                    { label: 'Moratorium Period (months)', val: moratoriumMonths, setter: setMoratoriumMonths, min: 0, max: 12, step: 1 },
                ].map(p => (
                    <div key={p.label} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{p.label}</label>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0d9488' }}>
                                {p.label.includes('₹') ? `₹${p.val.toLocaleString('en-IN')}` : `${p.val}${p.label.includes('%') ? '%' : ''}`}
                            </span>
                        </div>
                        <input type="range" min={p.min} max={p.max} step={p.step} value={p.val}
                            onChange={e => p.setter(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#0d9488' }} />
                    </div>
                ))}
                <div style={{ marginTop: 16, background: '#f0fdf4', borderRadius: 10, padding: '12px 14px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#065f46', marginBottom: 4 }}>Current EMI</div>
                    <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.4rem', fontFamily: 'Space Grotesk' }}>₹{currentEMI.toLocaleString('en-IN')}/month</div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Restructuring Options</div>
                {options.map(opt => (
                    <div key={opt.label} style={{ background: '#fff', borderRadius: 14, padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{opt.icon} {opt.label}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{opt.desc}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {opt.lumpsum ? (
                                    <div style={{ fontWeight: 800, color: '#0d9488', fontSize: '1.1rem', fontFamily: 'Space Grotesk' }}>₹{opt.lumpsum.toLocaleString('en-IN')}</div>
                                ) : (
                                    <div style={{ fontWeight: 800, color: opt.newEMI < currentEMI ? '#16a34a' : '#0d9488', fontSize: '1.1rem', fontFamily: 'Space Grotesk' }}>₹{opt.newEMI.toLocaleString('en-IN')}/mo</div>
                                )}
                                {opt.saving > 0 && <div style={{ fontSize: '0.68rem', color: '#16a34a' }}>Saves ₹{opt.saving.toLocaleString('en-IN')}</div>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg, #0d9488, #16a34a)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                                Apply to Account
                            </button>
                            <button style={{ padding: '8px 12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                                Simulate
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ======================== CREDIT SCORE IMPROVEMENT ESTIMATOR ========================
function CreditScoreEstimator() {
    const [currentScore, setCurrentScore] = useState(580);
    const [overdueCleared, setOverdueCleared] = useState(true);
    const [noNewBounce, setNoNewBounce] = useState(true);
    const [regularPayments, setRegularPayments] = useState(6);

    const projected = useMemo(() => {
        let gain = 0;
        if (overdueCleared) gain += 45;
        if (noNewBounce) gain += 20;
        gain += regularPayments * 5;
        return Math.min(currentScore + gain, 900);
    }, [currentScore, overdueCleared, noNewBounce, regularPayments]);

    const getScoreLabel = (s: number) => s >= 750 ? 'Excellent' : s >= 700 ? 'Good' : s >= 650 ? 'Fair' : 'Poor';
    const getScoreColor = (s: number) => s >= 750 ? '#16a34a' : s >= 700 ? '#0d9488' : s >= 650 ? '#d97706' : '#dc2626';

    const benefits = [
        { threshold: 650, label: 'Eligible for top-up loan', unlocked: projected >= 650 },
        { threshold: 700, label: 'Lower interest rate (2% reduction)', unlocked: projected >= 700 },
        { threshold: 750, label: 'Instant pre-approved credit card', unlocked: projected >= 750 },
        { threshold: 800, label: 'Premium banking tier access', unlocked: projected >= 800 },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Simulation Parameters</div>
                <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Current Credit Score</label>
                        <span style={{ fontWeight: 800, color: getScoreColor(currentScore) }}>{currentScore}</span>
                    </div>
                    <input type="range" min={300} max={850} value={currentScore} onChange={e => setCurrentScore(Number(e.target.value))} style={{ width: '100%', accentColor: '#0d9488' }} />
                </div>
                {[
                    { label: '✅ Clear all overdue amounts', val: overdueCleared, setter: setOverdueCleared, gain: '+45 pts' },
                    { label: '✅ No new EMI bounces', val: noNewBounce, setter: setNoNewBounce, gain: '+20 pts' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{item.label}</div>
                            <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>{item.gain}</div>
                        </div>
                        <button onClick={() => item.setter(!item.val)}
                            style={{ width: 42, height: 24, borderRadius: 999, border: 'none', background: item.val ? '#0d9488' : '#e2e8f0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: item.val ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                    </div>
                ))}
                <div style={{ padding: '14px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Consecutive on-time payments</label>
                        <span style={{ fontWeight: 800, color: '#0d9488' }}>{regularPayments} months (+{regularPayments * 5} pts)</span>
                    </div>
                    <input type="range" min={1} max={12} value={regularPayments} onChange={e => setRegularPayments(Number(e.target.value))} style={{ width: '100%', accentColor: '#0d9488' }} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Projected Score</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: getScoreColor(projected), fontFamily: 'Space Grotesk', lineHeight: 1 }}>{projected}</div>
                    <div style={{ fontSize: '0.85rem', color: getScoreColor(projected), fontWeight: 700, marginBottom: 12 }}>{getScoreLabel(projected)}</div>
                    <div style={{ height: 12, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ height: '100%', width: `${(projected - 300) / 600 * 100}%`, background: `linear-gradient(90deg, #dc2626, #d97706, #16a34a)`, borderRadius: 999, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>300 (Poor) → 900 (Excellent)</div>
                    <div style={{ marginTop: 14, padding: '10px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                        <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.9rem' }}>+{projected - currentScore} points improvement</span>
                    </div>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 14, fontSize: '0.88rem' }}>Benefits Unlocked</div>
                    {benefits.map(b => (
                        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: b.unlocked ? '#f0fdf4' : '#f8fafc', border: `1.5px solid ${b.unlocked ? '#16a34a' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>
                                {b.unlocked ? '✓' : ''}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.78rem', color: b.unlocked ? '#0f172a' : '#94a3b8', fontWeight: b.unlocked ? 600 : 400 }}>{b.label}</div>
                                <div style={{ fontSize: '0.65rem', color: b.unlocked ? '#16a34a' : '#94a3b8' }}>Score ≥ {b.threshold}</div>
                            </div>
                            {b.unlocked && <span style={{ fontSize: '0.7rem', background: '#f0fdf4', color: '#16a34a', borderRadius: 6, padding: '2px 6px', fontWeight: 700 }}>UNLOCKED</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ======================== GAMIFIED REPAYMENT ========================
function GamifiedRepayment() {
    const [selected, setSelected] = useState<string | null>(null);
    const rewards = [
        { id: 'cashback', title: '5% Cashback on EMI', desc: 'Pay 3 consecutive EMIs on time', reward: '₹2,500 cashback credited to account', icon: '💳', tier: 'Bronze', condition: '3 months', color: '#d97706', difficulty: 'Easy' },
        { id: 'interestwaiver', title: 'Interest Waiver', desc: 'Clear overdue within 7 days', reward: '1 month interest completely waived', icon: '✨', tier: 'Silver', condition: '7 days', color: '#64748b', difficulty: 'Medium' },
        { id: 'creditscore', title: 'Credit Score Boost', desc: 'Clear overdue + 6 on-time EMIs', reward: 'Priority credit score update + certificate', icon: '⭐', tier: 'Gold', condition: '6+ months', color: '#d97706', difficulty: 'Hard' },
        { id: 'toploancredit', title: 'Pre-approved Top-up', desc: 'Restructure + 90% fulfillment rate', reward: '₹1 lakh instant top-up credit line', icon: '🚀', tier: 'Platinum', condition: '12 months', color: '#0d9488', difficulty: 'Expert' },
    ];

    const milestones = [
        { label: '1st On-Time EMI', icon: '🥉', pts: 100, unlocked: true },
        { label: '3 Consecutive', icon: '🥈', pts: 300, unlocked: true },
        { label: '6 Consecutive', icon: '🥇', pts: 600, unlocked: false },
        { label: 'Full Settlement', icon: '🏆', pts: 1200, unlocked: false },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
            <div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Reward Schemes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {rewards.map(r => (
                        <div key={r.id}
                            onClick={() => setSelected(selected === r.id ? null : r.id)}
                            style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: `1.5px solid ${selected === r.id ? '#0d9488' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                <span style={{ fontSize: '1.8rem' }}>{r.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{r.title}</div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <span style={{ background: r.color + '18', color: r.color, borderRadius: 999, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 }}>{r.tier}</span>
                                            <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: 999, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600 }}>{r.difficulty}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 5 }}>{r.desc}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>🎁 {r.reward}</div>
                                </div>
                            </div>
                            {selected === r.id && (
                                <div style={{ marginTop: 14, padding: '12px 14px', background: '#f0fdfa', borderRadius: 10, border: '1px solid #ccfbf1' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600, marginBottom: 4 }}>Send borrower this incentive offer:</div>
                                    <div style={{ fontSize: '0.72rem', color: '#065f46' }}>
                                        "Pay within {r.condition} to unlock {r.reward}. This offer expires in 48 hours. Reply YES to confirm."
                                    </div>
                                    <button style={{ marginTop: 10, padding: '7px 14px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                                        📱 Send via WhatsApp
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Milestone Tracker</div>
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0', marginBottom: 16 }}>
                    {milestones.map((m, i) => (
                        <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < milestones.length - 1 ? 16 : 0 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.unlocked ? 'linear-gradient(135deg, #0d9488, #16a34a)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                                {m.unlocked ? m.icon : '🔒'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: m.unlocked ? '#0f172a' : '#94a3b8' }}>{m.label}</div>
                                <div style={{ fontSize: '0.68rem', color: m.unlocked ? '#0d9488' : '#94a3b8', fontWeight: 700 }}>+{m.pts} DhanPoints</div>
                            </div>
                            {m.unlocked && <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 999, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 }}>EARNED</span>}
                        </div>
                    ))}
                </div>
                <div style={{ background: 'linear-gradient(135deg, #0d9488, #16a34a)', borderRadius: 14, padding: '18px 20px', color: 'white' }}>
                    <div style={{ fontSize: '0.72rem', opacity: 0.8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DhanPoints Balance</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Space Grotesk' }}>400</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.8, marginBottom: 12 }}>Next milestone: 600 points</div>
                    <div style={{ height: 8, background: 'rgba(139, 90, 43, 0.12)', borderRadius: 999 }}>
                        <div style={{ height: '100%', width: '66%', background: 'white', borderRadius: 999 }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ======================== MAIN PAGE ========================
const TABS = [
    { id: 'ptp', label: '🤝 Promise-to-Pay Tracker' },
    { id: 'emi', label: '🔄 EMI Restructuring Calculator' },
    { id: 'credit', label: '📈 Credit Score Estimator' },
    { id: 'gamify', label: '🎮 Repayment Incentives' },
];

export default function RecoveryToolkit() {
    const { appLanguage } = useApp();
    const lang: any = appLanguage?.code || 'en-IN';
    const [tab, setTab] = useState('ptp');

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{t('nav.toolkit', lang)}</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '6px 0 0' }}>
                    Promise-to-Pay tracking, EMI restructuring, credit score estimation, and gamified repayment incentives
                </p>
            </div>
            <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20, flexWrap: 'wrap' }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        style={{
                            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                            background: tab === t.id ? '#fff' : 'transparent',
                            color: tab === t.id ? '#0d9488' : '#64748b',
                            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>
            {tab === 'ptp' && <PTPTracker />}
            {tab === 'emi' && <EMICalculator />}
            {tab === 'credit' && <CreditScoreEstimator />}
            {tab === 'gamify' && <GamifiedRepayment />}
        </div>
    );
}
