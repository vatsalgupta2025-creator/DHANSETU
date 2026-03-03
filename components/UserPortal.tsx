'use client';
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { LoanRecord } from '@/lib/data';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// Simulate the "logged in" user's loans (pick first 2-3 from data)
function getUserLoans(data: LoanRecord[]): LoanRecord[] {
    return data.slice(0, 3);
}

function generatePaymentSchedule(loan: LoanRecord) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const schedule = [];
    for (let i = 0; i < 6; i++) {
        const mIdx = (new Date().getMonth() + i) % 12;
        schedule.push({
            month: months[mIdx],
            emi: loan.loan.emiAmount,
            dueDate: `${15} ${months[mIdx]}`,
            status: i === 0 ? 'Due Today' : i < 0 ? 'Paid' : 'Upcoming',
        });
    }
    return schedule;
}

const USER_NAV = [
    { id: 'myloans', label: 'My Loans', icon: '💳' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'support', label: 'AI Support', icon: '🤖' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function UserPortal() {
    const { loanData, selectedBank, setUserRole } = useApp();
    const accent = selectedBank?.accent || '#0d9488';
    const [activePage, setActivePage] = useState('myloans');
    const userLoans = useMemo(() => getUserLoans(loanData), [loanData]);
    const mainLoan = userLoans[0];

    const paymentTrend = useMemo(() => {
        if (!mainLoan) return [];
        return Array.from({ length: 8 }, (_, i) => ({
            month: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][i],
            paid: Math.round(mainLoan.loan.emiAmount * (0.8 + Math.random() * 0.4)),
            due: mainLoan.loan.emiAmount,
        }));
    }, [mainLoan]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#fdfbf7' }}>
            {/* User Sidebar */}
            <aside style={{
                width: 220, minHeight: '100vh',
                background: 'rgba(253,251,247,0.98)',
                borderRight: '1px solid rgba(139,90,43,0.12)',
                display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
            }}>
                {/* Logo */}
                <div style={{
                    padding: '16px', borderBottom: '1px solid rgba(139,90,43,0.10)',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '0.9rem',
                    }}>₹</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#3d2b1f', fontFamily: 'Space Grotesk' }}>DhanSetu</div>
                        <div style={{ fontSize: '0.55rem', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Customer Portal</div>
                    </div>
                </div>

                {/* User info */}
                {mainLoan && (
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(139,90,43,0.08)' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, fontSize: '0.75rem',
                            }}>{mainLoan.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#3d2b1f' }}>{mainLoan.customer.name}</div>
                                <div style={{ fontSize: '0.65rem', color: '#8b7355' }}>{mainLoan.customer.phone}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 8px' }}>
                    {USER_NAV.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActivePage(item.id)}
                            style={{
                                width: '100%', border: 'none', borderRadius: 10,
                                padding: '10px 12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: activePage === item.id ? `${accent}15` : 'transparent',
                                color: activePage === item.id ? accent : '#5a3e28',
                                fontWeight: activePage === item.id ? 700 : 500,
                                fontSize: '0.84rem', marginBottom: 4,
                                transition: 'all 0.15s',
                            }}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Switch to Admin */}
                <div style={{ padding: '12px', borderTop: '1px solid rgba(139,90,43,0.10)' }}>
                    <button
                        onClick={() => setUserRole('admin')}
                        style={{
                            width: '100%', padding: '8px 12px', borderRadius: 10,
                            background: 'rgba(139,90,43,0.06)', border: '1px solid rgba(139,90,43,0.12)',
                            cursor: 'pointer', fontSize: '0.72rem', color: '#8b7355', fontWeight: 600,
                            transition: 'all 0.15s',
                        }}
                    >
                        🔄 Switch to Admin
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, marginLeft: 220, padding: '24px 32px', minHeight: '100vh' }}>
                {activePage === 'myloans' && mainLoan && <MyLoansPage loans={userLoans} accent={accent} paymentTrend={paymentTrend} />}
                {activePage === 'payments' && mainLoan && <PaymentsPage loan={mainLoan} accent={accent} />}
                {activePage === 'support' && <SupportPage accent={accent} loans={userLoans} />}
                {activePage === 'settings' && <SettingsPage accent={accent} />}
            </main>
        </div>
    );
}

/* ─── My Loans Page ─────────────────────────── */
function MyLoansPage({ loans, accent, paymentTrend }: { loans: LoanRecord[]; accent: string; paymentTrend: any[] }) {
    return (
        <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 4 }}>My Loans</h2>
            <p style={{ color: '#8b7355', fontSize: '0.85rem', marginBottom: 24 }}>Overview of your active loans and repayment status</p>

            {/* Loan cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                {loans.map((loan, i) => (
                    <div key={i} style={{
                        background: '#fefcf8', borderRadius: 16, padding: '20px 24px',
                        border: '1px solid rgba(139,90,43,0.10)',
                        boxShadow: '0 2px 10px rgba(139,90,43,0.04)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{loan.loan.product}</div>
                                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#3d2b1f', fontFamily: 'Space Grotesk' }}>
                                    ₹{(loan.loan.outstandingAmount / 100000).toFixed(1)}L
                                    <span style={{ fontSize: '0.72rem', color: '#8b7355', fontWeight: 500, marginLeft: 6 }}>outstanding</span>
                                </div>
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                                background: loan.loan.currentDpd === 0 ? 'rgba(34,197,94,0.12)' : loan.loan.currentDpd < 30 ? 'rgba(245,158,11,0.12)' : 'rgba(220,38,38,0.12)',
                                color: loan.loan.currentDpd === 0 ? '#16a34a' : loan.loan.currentDpd < 30 ? '#d97706' : '#dc2626',
                            }}>
                                {loan.loan.currentDpd === 0 ? 'On Track' : `${loan.loan.currentDpd} DPD`}
                            </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                            {[
                                { label: 'EMI', value: `₹${loan.loan.emiAmount.toLocaleString()}` },
                                { label: 'Interest', value: `${loan.loan.interestRate}%` },
                                { label: 'Tenor', value: `${loan.loan.tenorMonths}m` },
                                { label: 'Next Due', value: '15th' },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ fontSize: '0.58rem', color: '#b3a08a', textTransform: 'uppercase' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3d2b1f' }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Repayment Trend */}
            <div style={{
                background: '#fefcf8', borderRadius: 16, padding: '20px 24px',
                border: '1px solid rgba(139,90,43,0.10)',
            }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 14 }}>
                    📊 Repayment Trend
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={paymentTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.08)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8b7355' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#8b7355' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#fdfbf7', border: '1px solid rgba(139,90,43,0.15)', borderRadius: 10, fontSize: '0.78rem', color: '#3d2b1f' }} />
                        <Area type="monotone" dataKey="due" stroke="rgba(139,90,43,0.3)" fill="rgba(139,90,43,0.06)" strokeWidth={1.5} name="Due" />
                        <Area type="monotone" dataKey="paid" stroke={accent} fill={`${accent}20`} strokeWidth={2} name="Paid" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/* ─── Payments Page with Full Payment System ── */
function PaymentsPage({ loan, accent }: { loan: LoanRecord; accent: string }) {
    const schedule = useMemo(() => generatePaymentSchedule(loan), [loan]);
    const [payStep, setPayStep] = useState<'idle' | 'method' | 'upi' | 'card' | 'netbanking' | 'processing' | 'success'>('idle');
    const [payAmount, setPayAmount] = useState(loan.loan.emiAmount);
    const [txnId, setTxnId] = useState('');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [payHistory] = useState([
        { id: 'TXN-87234', date: '15 Feb 2026', amount: loan.loan.emiAmount, method: 'UPI', status: 'Success' },
        { id: 'TXN-85109', date: '15 Jan 2026', amount: loan.loan.emiAmount, method: 'Card', status: 'Success' },
        { id: 'TXN-82901', date: '15 Dec 2025', amount: Math.round(loan.loan.emiAmount * 0.5), method: 'UPI', status: 'Partial' },
        { id: 'TXN-80742', date: '15 Nov 2025', amount: loan.loan.emiAmount, method: 'Net Banking', status: 'Success' },
        { id: 'TXN-78533', date: '15 Oct 2025', amount: 0, method: '-', status: 'Missed' },
    ]);

    const handlePay = () => { setPayStep('processing'); setTxnId(`TXN-${Date.now().toString().slice(-8)}`); setTimeout(() => setPayStep('success'), 2500); };
    const resetPay = () => { setPayStep('idle'); setUpiId(''); setCardNumber(''); setCardExpiry(''); setCardCvv(''); setCardName(''); setSelectedBank(''); };

    const emi = loan.loan.emiAmount;
    const monthlyRate = loan.loan.interestRate / 12 / 100;
    const interestThisMonth = Math.round(loan.loan.outstandingAmount * monthlyRate);
    const principalThisMonth = emi - interestThisMonth;
    const lateFee = loan.loan.currentDpd > 0 ? Math.round(emi * 0.02 * Math.ceil(loan.loan.currentDpd / 30)) : 0;
    const cs = { background: '#fefcf8', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(139,90,43,0.10)' };
    const BANKS_LIST = [
        { id: 'sbi', name: 'SBI', icon: '🏦' }, { id: 'hdfc', name: 'HDFC', icon: '🏛️' },
        { id: 'icici', name: 'ICICI', icon: '🏢' }, { id: 'axis', name: 'Axis', icon: '🏗️' },
        { id: 'kotak', name: 'Kotak', icon: '🏘️' }, { id: 'pnb', name: 'PNB', icon: '🏫' },
    ];

    return (
        <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 4 }}>Payments</h2>
            <p style={{ color: '#8b7355', fontSize: '0.85rem', marginBottom: 24 }}>EMI schedule, payment options & transaction history</p>

            {/* Quick pay hero */}
            <div style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, borderRadius: 16, padding: '24px 28px', color: 'white', marginBottom: 20, boxShadow: `0 8px 32px ${accent}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '0.72rem', opacity: 0.8, marginBottom: 4 }}>Next EMI Due</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Space Grotesk', marginBottom: 4 }}>₹{emi.toLocaleString()}</div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginBottom: 16 }}>Due on 15th of this month</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Outstanding</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>₹{(loan.loan.outstandingAmount / 100000).toFixed(1)}L</div>
                        {loan.loan.currentDpd > 0 && <div style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 999, marginTop: 4 }}>{loan.loan.currentDpd}d overdue</div>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setPayAmount(emi); setPayStep('method'); }} style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '10px 24px', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}>💳 Pay Now</button>
                    <button onClick={() => { setPayAmount(Math.round(emi * 0.5)); setPayStep('method'); }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 20px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>Partial Pay</button>
                </div>
            </div>

            {/* Interest Breakdown */}
            <div style={{ ...cs, marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 14 }}>📊 EMI Breakdown (This Month)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                        { label: 'Principal', value: `₹${principalThisMonth.toLocaleString()}`, color: '#16a34a' },
                        { label: 'Interest', value: `₹${interestThisMonth.toLocaleString()}`, color: '#d97706' },
                        { label: 'Late Fee', value: `₹${lateFee.toLocaleString()}`, color: lateFee > 0 ? '#dc2626' : '#8b7355' },
                        { label: 'Total Due', value: `₹${(emi + lateFee).toLocaleString()}`, color: accent },
                    ].map(item => (
                        <div key={item.label} style={{ textAlign: 'center', padding: '12px', background: 'rgba(139,90,43,0.03)', borderRadius: 10 }}>
                            <div style={{ fontSize: '0.6rem', color: '#8b7355', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: item.color, fontFamily: 'Space Grotesk' }}>{item.value}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 12 }}>
                    <div style={{ width: `${Math.max(0, (principalThisMonth / emi) * 100)}%`, background: '#16a34a' }} />
                    <div style={{ width: `${Math.max(0, (interestThisMonth / emi) * 100)}%`, background: '#d97706' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.6rem', color: '#16a34a', fontWeight: 600 }}>Principal ({Math.round(Math.max(0, (principalThisMonth / emi) * 100))}%)</span>
                    <span style={{ fontSize: '0.6rem', color: '#d97706', fontWeight: 600 }}>Interest ({Math.round(Math.max(0, (interestThisMonth / emi) * 100))}%)</span>
                </div>
            </div>

            {/* Payment History */}
            <div style={{ ...cs, marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 14 }}>🕐 Payment History</div>
                {payHistory.map((tx, i) => (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < payHistory.length - 1 ? '1px solid rgba(139,90,43,0.06)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: tx.status === 'Success' ? 'rgba(34,197,94,0.1)' : tx.status === 'Partial' ? 'rgba(245,158,11,0.1)' : 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                                {tx.status === 'Success' ? '✅' : tx.status === 'Partial' ? '⚠️' : '❌'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#3d2b1f' }}>{tx.date}</div>
                                <div style={{ fontSize: '0.65rem', color: '#8b7355' }}>{tx.id} · {tx.method}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#3d2b1f' }}>{tx.amount > 0 ? `₹${tx.amount.toLocaleString()}` : '-'}</div>
                            <span style={{ fontSize: '0.58rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: tx.status === 'Success' ? 'rgba(34,197,94,0.1)' : tx.status === 'Partial' ? 'rgba(245,158,11,0.1)' : 'rgba(220,38,38,0.1)', color: tx.status === 'Success' ? '#16a34a' : tx.status === 'Partial' ? '#d97706' : '#dc2626' }}>{tx.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upcoming Schedule */}
            <div style={cs}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 14 }}>📅 Upcoming Schedule</div>
                {schedule.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < schedule.length - 1 ? '1px solid rgba(139,90,43,0.08)' : 'none' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#3d2b1f' }}>{item.dueDate}</div>
                            <div style={{ fontSize: '0.7rem', color: '#8b7355' }}>EMI #{i + 1}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#3d2b1f' }}>₹{item.emi.toLocaleString()}</div>
                            <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: item.status === 'Due Today' ? `${accent}15` : 'rgba(139,90,43,0.06)', color: item.status === 'Due Today' ? accent : '#8b7355' }}>{item.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ PAYMENT MODAL ═══ */}
            {payStep !== 'idle' && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                    onClick={(e) => { if (e.target === e.currentTarget && payStep !== 'processing') resetPay(); }}>
                    <div style={{ width: '100%', maxWidth: 480, background: 'linear-gradient(135deg, #fdfbf7, #f5f0e8)', borderRadius: 20, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', position: 'relative' }}>

                        {/* Method selection */}
                        {payStep === 'method' && (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>💰</div>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 4 }}>Pay ₹{payAmount.toLocaleString()}</h3>
                                    <p style={{ color: '#8b7355', fontSize: '0.82rem' }}>Choose your payment method</p>
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                                    {[{ l: 'Full EMI', a: emi }, { l: '50%', a: Math.round(emi * 0.5) }, { l: 'Overdue', a: loan.loan.overdueAmount }].map(o => (
                                        <button key={o.l} onClick={() => setPayAmount(o.a)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer', background: payAmount === o.a ? `${accent}15` : 'rgba(139,90,43,0.04)', border: payAmount === o.a ? `1.5px solid ${accent}` : '1px solid rgba(139,90,43,0.1)', color: payAmount === o.a ? accent : '#5a3e28', fontSize: '0.68rem', fontWeight: 700 }}>{o.l}</button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[
                                        { id: 'upi', label: 'UPI / Google Pay / PhonePe', icon: '📱', desc: 'Instant · Free' },
                                        { id: 'card', label: 'Debit / Credit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
                                        { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
                                    ].map(m => (
                                        <button key={m.id} onClick={() => setPayStep(m.id as any)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, cursor: 'pointer', background: 'white', border: '1px solid rgba(139,90,43,0.1)', textAlign: 'left' as const, transition: 'all 0.15s' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,90,43,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{m.icon}</div>
                                            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3d2b1f' }}>{m.label}</div><div style={{ fontSize: '0.7rem', color: '#8b7355' }}>{m.desc}</div></div>
                                            <span style={{ color: '#b3a08a', fontSize: '1.1rem' }}>→</span>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={resetPay} style={{ width: '100%', marginTop: 16, padding: '10px', background: 'none', border: '1px solid rgba(139,90,43,0.1)', borderRadius: 10, cursor: 'pointer', color: '#8b7355', fontSize: '0.8rem' }}>Cancel</button>
                            </div>
                        )}

                        {/* UPI */}
                        {payStep === 'upi' && (
                            <div>
                                <button onClick={() => setPayStep('method')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b7355', fontSize: '0.82rem', marginBottom: 16 }}>← Back</button>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#3d2b1f', fontFamily: 'Space Grotesk' }}>📱 UPI Payment</h3>
                                    <p style={{ color: '#8b7355', fontSize: '0.78rem' }}>Pay ₹{payAmount.toLocaleString()}</p>
                                </div>
                                <div style={{ background: 'white', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px solid rgba(139,90,43,0.1)', marginBottom: 20 }}>
                                    <div style={{ width: 140, height: 140, margin: '0 auto 12px', borderRadius: 12, background: `repeating-conic-gradient(#3d2b1f 0% 25%, #f5f0e8 0% 50%) 0 0 / 8px 8px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ background: 'white', borderRadius: 6, padding: '4px 8px', fontSize: '0.65rem', fontWeight: 700, color: accent }}>DhanSetu</div>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#8b7355' }}>Scan with any UPI app</div>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#8b7355', marginBottom: 16 }}>— OR enter UPI ID —</div>
                                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi / 9876543210@ybl"
                                    style={{ width: '100%', padding: '14px 16px', border: '1.5px solid rgba(139,90,43,0.15)', borderRadius: 12, fontSize: '0.95rem', background: 'white', color: '#3d2b1f', outline: 'none', marginBottom: 16 }} />
                                <button onClick={handlePay} disabled={!upiId.includes('@')} style={{ width: '100%', padding: 16, background: upiId.includes('@') ? `linear-gradient(135deg, ${accent}, ${accent}dd)` : 'rgba(139,90,43,0.1)', color: upiId.includes('@') ? 'white' : '#b3a08a', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: upiId.includes('@') ? 'pointer' : 'not-allowed', fontFamily: 'Space Grotesk' }}>
                                    Pay ₹{payAmount.toLocaleString()} via UPI
                                </button>
                            </div>
                        )}

                        {/* Card */}
                        {payStep === 'card' && (
                            <div>
                                <button onClick={() => setPayStep('method')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b7355', fontSize: '0.82rem', marginBottom: 16 }}>← Back</button>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#3d2b1f', fontFamily: 'Space Grotesk' }}>💳 Card Payment</h3>
                                    <p style={{ color: '#8b7355', fontSize: '0.78rem' }}>Pay ₹{payAmount.toLocaleString()}</p>
                                </div>
                                <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, color: 'white', minHeight: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Debit/Credit</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MC' : cardNumber.startsWith('6') ? 'Rupay' : '••••'}</span>
                                    </div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', letterSpacing: 3, fontWeight: 600 }}>{cardNumber ? cardNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.72rem' }}>{cardName || 'CARDHOLDER'}</span>
                                        <span style={{ fontSize: '0.72rem' }}>{cardExpiry || 'MM/YY'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                    <input type="text" value={cardNumber} maxLength={16} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))} placeholder="Card Number"
                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(139,90,43,0.15)', borderRadius: 10, fontSize: '0.9rem', background: 'white', color: '#3d2b1f', outline: 'none' }} />
                                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} placeholder="Name on Card"
                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(139,90,43,0.15)', borderRadius: 10, fontSize: '0.9rem', background: 'white', color: '#3d2b1f', outline: 'none' }} />
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <input type="text" value={cardExpiry} maxLength={5} onChange={(e) => { let v = e.target.value.replace(/\D/g, ''); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); setCardExpiry(v); }} placeholder="MM/YY"
                                            style={{ flex: 1, padding: '12px 14px', border: '1.5px solid rgba(139,90,43,0.15)', borderRadius: 10, fontSize: '0.9rem', background: 'white', color: '#3d2b1f', outline: 'none' }} />
                                        <input type="password" value={cardCvv} maxLength={3} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))} placeholder="CVV"
                                            style={{ width: 90, padding: '12px 14px', border: '1.5px solid rgba(139,90,43,0.15)', borderRadius: 10, fontSize: '0.9rem', background: 'white', color: '#3d2b1f', outline: 'none' }} />
                                    </div>
                                </div>
                                <button onClick={handlePay} disabled={cardNumber.length < 16 || !cardExpiry || cardCvv.length < 3} style={{ width: '100%', padding: 16, background: cardNumber.length >= 16 ? `linear-gradient(135deg, ${accent}, ${accent}dd)` : 'rgba(139,90,43,0.1)', color: cardNumber.length >= 16 ? 'white' : '#b3a08a', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: cardNumber.length >= 16 ? 'pointer' : 'not-allowed', fontFamily: 'Space Grotesk' }}>
                                    Pay ₹{payAmount.toLocaleString()} via Card
                                </button>
                            </div>
                        )}

                        {/* Net Banking */}
                        {payStep === 'netbanking' && (
                            <div>
                                <button onClick={() => setPayStep('method')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b7355', fontSize: '0.82rem', marginBottom: 16 }}>← Back</button>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#3d2b1f', fontFamily: 'Space Grotesk' }}>🏦 Net Banking</h3>
                                    <p style={{ color: '#8b7355', fontSize: '0.78rem' }}>Pay ₹{payAmount.toLocaleString()} · Select bank</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                                    {BANKS_LIST.map(b => (
                                        <button key={b.id} onClick={() => setSelectedBank(b.id)} style={{ padding: 14, borderRadius: 12, cursor: 'pointer', textAlign: 'center', background: selectedBank === b.id ? `${accent}10` : 'white', border: selectedBank === b.id ? `2px solid ${accent}` : '1px solid rgba(139,90,43,0.1)' }}>
                                            <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{b.icon}</div>
                                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3d2b1f' }}>{b.name}</div>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handlePay} disabled={!selectedBank} style={{ width: '100%', padding: 16, background: selectedBank ? `linear-gradient(135deg, ${accent}, ${accent}dd)` : 'rgba(139,90,43,0.1)', color: selectedBank ? 'white' : '#b3a08a', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: selectedBank ? 'pointer' : 'not-allowed', fontFamily: 'Space Grotesk' }}>
                                    Proceed to {selectedBank ? BANKS_LIST.find(b => b.id === selectedBank)?.name : 'Bank'} →
                                </button>
                            </div>
                        )}

                        {/* Processing */}
                        {payStep === 'processing' && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ width: 64, height: 64, margin: '0 auto 20px', border: '4px solid rgba(139,90,43,0.1)', borderTop: `4px solid ${accent}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 8 }}>Processing Payment</h3>
                                <p style={{ color: '#8b7355', fontSize: '0.82rem' }}>Connecting to payment gateway...</p>
                                <p style={{ color: '#8b7355', fontSize: '0.72rem', marginTop: 8 }}>🔒 256-bit SSL encrypted</p>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        )}

                        {/* Success */}
                        {payStep === 'success' && (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ width: 72, height: 72, margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✅</div>
                                <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#16a34a', fontFamily: 'Space Grotesk', marginBottom: 6 }}>Payment Successful!</h3>
                                <p style={{ color: '#8b7355', fontSize: '0.82rem', marginBottom: 20 }}>Your payment has been processed</p>
                                <div style={{ background: 'rgba(139,90,43,0.04)', borderRadius: 12, padding: 16, textAlign: 'left' as const, marginBottom: 20 }}>
                                    {[
                                        { l: 'Transaction ID', v: txnId }, { l: 'Amount Paid', v: `₹${payAmount.toLocaleString()}` },
                                        { l: 'Date & Time', v: new Date().toLocaleString('en-IN') }, { l: 'Status', v: 'Completed ✅' },
                                    ].map(t => (
                                        <div key={t.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                                            <span style={{ fontSize: '0.78rem', color: '#8b7355' }}>{t.l}</span>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3d2b1f' }}>{t.v}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={resetPay} style={{ flex: 1, padding: 14, background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Space Grotesk' }}>Done</button>
                                    <button style={{ flex: 1, padding: 14, background: 'rgba(139,90,43,0.06)', color: '#3d2b1f', border: '1px solid rgba(139,90,43,0.12)', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Space Grotesk' }}>📥 Receipt</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Support Page (AI Chat) ────────────────── */
interface ChatMsg {
    id: number;
    role: 'user' | 'bot';
    text: string;
    time: string;
}

const QUICK_REPLIES = [
    { label: '💳 Repayment Options', query: 'What are my repayment options?' },
    { label: '🤝 Settlement Offer', query: 'Can I get a settlement offer?' },
    { label: '📊 Account Status', query: 'Show me my account status' },
    { label: '🧮 EMI Calculator', query: 'Calculate my EMI breakdown' },
    { label: '📅 Extend Due Date', query: 'Can I extend my due date?' },
    { label: '📞 Talk to Agent', query: 'I want to talk to a human agent' },
];

function generateBotResponse(query: string, loans: LoanRecord[]): string {
    const q = query.toLowerCase();
    const main = loans[0];
    const emi = main?.loan.emiAmount || 0;
    const outstanding = main?.loan.outstandingAmount || 0;
    const dpd = main?.loan.currentDpd || 0;
    const product = main?.loan.product || 'Loan';
    const name = main?.customer.name || 'Customer';

    if (q.includes('repayment') || q.includes('pay option')) {
        return `Hi ${name}! Here are your repayment options for your ${product}:\n\n` +
            `1️⃣ **Full EMI Payment** — ₹${emi.toLocaleString()} (recommended)\n` +
            `2️⃣ **Partial Payment** — Pay any amount above ₹${Math.round(emi * 0.5).toLocaleString()} to avoid late fees\n` +
            `3️⃣ **EMI Restructuring** — Extend your tenor by 6-12 months to reduce EMI by up to 30%\n` +
            `4️⃣ **Moratorium** — Request a 2-3 month payment pause (interest accrues)\n\n` +
            `Your current outstanding is ₹${(outstanding / 100000).toFixed(1)}L. Would you like to proceed with any option?`;
    }

    if (q.includes('settlement') || q.includes('settle')) {
        const settlePct = dpd > 90 ? 65 : dpd > 60 ? 72 : dpd > 30 ? 80 : 90;
        const settleAmt = Math.round(outstanding * settlePct / 100);
        return `Based on your account profile, I can offer you a settlement:\n\n` +
            `📋 **Settlement Offer**\n` +
            `• Outstanding: ₹${(outstanding / 100000).toFixed(1)}L\n` +
            `• Settlement at: **${settlePct}%** = ₹${(settleAmt / 100000).toFixed(1)}L\n` +
            `• Savings: ₹${((outstanding - settleAmt) / 1000).toFixed(0)}K\n` +
            `• Valid for: 15 days\n\n` +
            `⚠️ Note: Settlement may impact your credit score. Would you like me to explain the implications?`;
    }

    if (q.includes('status') || q.includes('account')) {
        const statusEmoji = dpd === 0 ? '🟢' : dpd < 30 ? '🟡' : dpd < 90 ? '🟠' : '🔴';
        return `${statusEmoji} **Account Status for ${name}**\n\n` +
            `• Product: ${product}\n` +
            `• Outstanding: ₹${(outstanding / 100000).toFixed(1)}L\n` +
            `• Monthly EMI: ₹${emi.toLocaleString()}\n` +
            `• Days Past Due: ${dpd} days\n` +
            `• Credit Score: ${main?.loan.creditScore || 'N/A'}\n` +
            `• Risk Level: ${main?.risk.riskTier || 'N/A'}\n\n` +
            (dpd > 0 ? `⚠️ Your account is ${dpd} days overdue. I recommend making a payment soon to avoid additional charges.` : `✅ Your account is in good standing! Next EMI due on the 15th.`);
    }

    if (q.includes('emi') || q.includes('calculator') || q.includes('breakdown')) {
        const principal = main?.loan.principal || 0;
        const rate = main?.loan.interestRate || 0;
        const tenor = main?.loan.tenorMonths || 0;
        const totalPayable = emi * tenor;
        const totalInterest = totalPayable - principal;
        return `🧮 **EMI Breakdown for ${product}**\n\n` +
            `• Principal: ₹${(principal / 100000).toFixed(1)}L\n` +
            `• Interest Rate: ${rate}% p.a.\n` +
            `• Tenor: ${tenor} months\n` +
            `• Monthly EMI: ₹${emi.toLocaleString()}\n` +
            `• Total Payable: ₹${(totalPayable / 100000).toFixed(1)}L\n` +
            `• Total Interest: ₹${(totalInterest / 100000).toFixed(1)}L\n` +
            `• Remaining: ₹${(outstanding / 100000).toFixed(1)}L\n\n` +
            `💡 Tip: Making prepayments can significantly reduce your interest burden!`;
    }

    if (q.includes('extend') || q.includes('due date') || q.includes('postpone')) {
        return `📅 **Due Date Extension Request**\n\n` +
            `I can help you request a due date extension. Here are the options:\n\n` +
            `1️⃣ **7-day grace period** — No additional charge (one-time)\n` +
            `2️⃣ **15-day extension** — Small processing fee of ₹${Math.round(emi * 0.02).toLocaleString()}\n` +
            `3️⃣ **30-day extension** — Processing fee of ₹${Math.round(emi * 0.05).toLocaleString()} + interest accrual\n\n` +
            `Note: Extensions are subject to approval based on your payment history. Would you like to proceed?`;
    }

    if (q.includes('agent') || q.includes('human') || q.includes('talk')) {
        return `📞 **Connect to Human Agent**\n\n` +
            `I understand you'd like to speak with a representative. Here are your options:\n\n` +
            `• 📞 **Phone**: Call 1800-XXX-XXXX (toll-free, 9AM-6PM)\n` +
            `• 💬 **WhatsApp**: Message +91-XXXXX-XXXXX\n` +
            `• 📧 **Email**: support@dhansetu.com\n` +
            `• 🏦 **Branch Visit**: Visit your nearest branch\n\n` +
            `Average wait time: ~3 minutes. Is there anything else I can help with in the meantime?`;
    }

    // Generic response
    return `Thank you for your question, ${name}! I'm here to help.\n\n` +
        `I can assist you with:\n` +
        `• 💳 Repayment options & payment processing\n` +
        `• 🤝 Settlement offers & negotiations\n` +
        `• 📊 Account status & loan details\n` +
        `• 🧮 EMI calculations & breakdowns\n` +
        `• 📅 Due date extensions\n` +
        `• 📞 Connecting you with a human agent\n\n` +
        `Please select an option or type your question!`;
}

function formatBotText(text: string) {
    // Simple markdown-like formatting for bold
    const parts = text.split('\n');
    return parts.map((line, i) => {
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} style={{ marginBottom: line === '' ? 6 : 2 }} />;
    });
}

function SupportPage({ accent, loans }: { accent: string; loans: LoanRecord[] }) {
    const [messages, setMessages] = useState<ChatMsg[]>([
        {
            id: 0, role: 'bot',
            text: `Hello ${loans[0]?.customer.name || 'there'}! 👋 I'm your DhanSetu AI Recovery Assistant. How can I help you today?\n\nYou can ask me about repayment options, settlement offers, account status, or anything related to your loans.`,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

    const sendMessage = useCallback((text: string) => {
        if (!text.trim()) return;
        const userMsg: ChatMsg = {
            id: Date.now(), role: 'user', text: text.trim(),
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking delay
        const delay = 800 + Math.random() * 1200;
        setTimeout(() => {
            const botText = generateBotResponse(text, loans);
            const botMsg: ChatMsg = {
                id: Date.now() + 1, role: 'bot', text: botText,
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            };
            setIsTyping(false);
            setMessages(prev => [...prev, botMsg]);
        }, delay);
    }, [loans]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 4 }}>AI Support</h2>
                <p style={{ color: '#8b7355', fontSize: '0.85rem', margin: 0 }}>Chat with our AI assistant for instant help</p>
            </div>

            {/* Chat area */}
            <div style={{
                flex: 1, background: '#fefcf8', borderRadius: '16px 16px 0 0',
                border: '1px solid rgba(139,90,43,0.10)', borderBottom: 'none',
                padding: '20px 24px', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: 16,
            }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        animation: 'msgFadeIn 0.3s ease',
                    }}>
                        {msg.role === 'bot' && (
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginRight: 10,
                                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem', marginTop: 2,
                            }}>🤖</div>
                        )}
                        <div style={{
                            maxWidth: '75%', padding: '12px 16px', borderRadius: 14,
                            background: msg.role === 'user'
                                ? `linear-gradient(135deg, ${accent}, ${accent}dd)`
                                : 'rgba(139,90,43,0.05)',
                            color: msg.role === 'user' ? 'white' : '#3d2b1f',
                            border: msg.role === 'bot' ? '1px solid rgba(139,90,43,0.10)' : 'none',
                            fontSize: '0.84rem', lineHeight: 1.55,
                            borderTopLeftRadius: msg.role === 'bot' ? 4 : 14,
                            borderTopRightRadius: msg.role === 'user' ? 4 : 14,
                        }}>
                            {msg.role === 'bot' ? formatBotText(msg.text) : msg.text}
                            <div style={{
                                fontSize: '0.6rem', marginTop: 6, textAlign: 'right',
                                opacity: 0.6,
                            }}>{msg.time}</div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'msgFadeIn 0.3s ease' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem',
                        }}>🤖</div>
                        <div style={{
                            background: 'rgba(139,90,43,0.05)', border: '1px solid rgba(139,90,43,0.10)',
                            borderRadius: 14, borderTopLeftRadius: 4,
                            padding: '12px 18px', display: 'flex', gap: 5,
                        }}>
                            <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: accent, animation: 'typingBounce 1.2s ease-in-out infinite 0s' }} />
                            <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: accent, animation: 'typingBounce 1.2s ease-in-out infinite 0.2s' }} />
                            <span className="typing-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: accent, animation: 'typingBounce 1.2s ease-in-out infinite 0.4s' }} />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Quick replies */}
            <div style={{
                background: '#fefcf8', borderLeft: '1px solid rgba(139,90,43,0.10)',
                borderRight: '1px solid rgba(139,90,43,0.10)',
                padding: '10px 24px', display: 'flex', gap: 8, overflowX: 'auto',
            }}>
                {QUICK_REPLIES.map(qr => (
                    <button
                        key={qr.label}
                        onClick={() => sendMessage(qr.query)}
                        disabled={isTyping}
                        style={{
                            padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap',
                            background: `${accent}08`, border: `1px solid ${accent}25`,
                            color: accent, fontSize: '0.72rem', fontWeight: 600, cursor: isTyping ? 'not-allowed' : 'pointer',
                            opacity: isTyping ? 0.5 : 1, transition: 'all 0.15s',
                            flexShrink: 0,
                        }}
                    >
                        {qr.label}
                    </button>
                ))}
            </div>

            {/* Input bar */}
            <div style={{
                background: '#fefcf8', borderRadius: '0 0 16px 16px',
                border: '1px solid rgba(139,90,43,0.10)', borderTop: '1px solid rgba(139,90,43,0.08)',
                padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center',
            }}>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    style={{
                        flex: 1, border: '1px solid rgba(139,90,43,0.12)', borderRadius: 10,
                        padding: '10px 14px', fontSize: '0.85rem', color: '#3d2b1f',
                        background: 'white', outline: 'none',
                        fontFamily: 'Inter, sans-serif',
                    }}
                />
                <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    style={{
                        width: 40, height: 40, borderRadius: 10, border: 'none',
                        background: input.trim() && !isTyping
                            ? `linear-gradient(135deg, ${accent}, ${accent}dd)`
                            : 'rgba(139,90,43,0.08)',
                        color: input.trim() && !isTyping ? 'white' : '#b3a08a',
                        cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', transition: 'all 0.2s', flexShrink: 0,
                    }}
                >
                    ➤
                </button>
            </div>

            <style>{`
                @keyframes msgFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes typingBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-6px); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

/* ─── Settings Page ─────────────────────────── */
function SettingsPage({ accent }: { accent: string }) {
    return (
        <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#3d2b1f', fontFamily: 'Space Grotesk', marginBottom: 4 }}>Settings</h2>
            <p style={{ color: '#8b7355', fontSize: '0.85rem', marginBottom: 24 }}>Manage your preferences</p>
            <div style={{
                background: '#fefcf8', borderRadius: 16, padding: '20px 24px',
                border: '1px solid rgba(139,90,43,0.10)',
            }}>
                {[
                    { label: 'Communication Preference', value: 'WhatsApp', icon: '💬' },
                    { label: 'Language', value: 'English', icon: '🌐' },
                    { label: 'SMS Notifications', value: 'Enabled', icon: '📱' },
                    { label: 'Email Alerts', value: 'Enabled', icon: '📧' },
                    { label: 'Auto-Pay', value: 'Not Set', icon: '⚡' },
                ].map((item, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 0',
                        borderBottom: i < 4 ? '1px solid rgba(139,90,43,0.08)' : 'none',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                            <span style={{ fontSize: '0.85rem', color: '#3d2b1f', fontWeight: 600 }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#8b7355' }}>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
