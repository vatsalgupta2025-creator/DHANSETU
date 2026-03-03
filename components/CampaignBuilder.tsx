'use client';
import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { computeKPIs } from '@/lib/data';

const SEGMENTS = [
    { id: 'critical', label: 'Critical Accounts', desc: 'DPD > 60, score > 80', icon: '🚨', filter: (r: any) => r.risk.riskTier === 'Critical' },
    { id: 'high', label: 'High Risk', desc: 'DPD 30-60, score 60-80', icon: '⚠️', filter: (r: any) => r.risk.riskTier === 'High' },
    { id: 'medium', label: 'Medium Risk', desc: 'DPD 15-30, score 40-60', icon: '🟡', filter: (r: any) => r.risk.riskTier === 'Medium' },
    { id: 'persuadable', label: 'High Uplift (Persuadable)', desc: 'Uplift score > 65', icon: '🎯', filter: (r: any) => r.risk.upliftScore > 65 },
    { id: 'early', label: 'Early Warning (DPD < 10)', desc: 'Just missed EMI', icon: '⏰', filter: (r: any) => r.loan.currentDpd < 10 && r.loan.currentDpd > 0 },
    { id: 'all', label: 'All Overdue', desc: 'Full portfolio', icon: '📋', filter: (r: any) => r.loan.currentDpd > 0 },
];

const CHANNELS = [
    { id: 'whatsapp', label: 'WhatsApp', icon: '📱', avgResponse: '42%', costPer: '₹2' },
    { id: 'sms', label: 'SMS', icon: '💬', avgResponse: '18%', costPer: '₹1' },
    { id: 'email', label: 'Email', icon: '✉️', avgResponse: '8%', costPer: '₹0.5' },
    { id: 'ivr', label: 'IVR Call', icon: '📞', avgResponse: '30%', costPer: '₹45' },
];

const TONES = [
    { id: 'empathetic', label: 'Empathetic', emoji: '🤝' },
    { id: 'urgent', label: 'Urgent', emoji: '⚠️' },
    { id: 'firm', label: 'Firm Notice', emoji: '🚨' },
];

const TIMES = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '06:00 PM',
];

export default function CampaignBuilder() {
    const { loanData } = useApp();
    const { appLanguage } = useApp();
    const lang: any = appLanguage?.code || 'en-IN';
    const [step, setStep] = useState(1);
    const [selectedSegment, setSelectedSegment] = useState('critical');
    const [selectedChannels, setSelectedChannels] = useState<string[]>(['whatsapp']);
    const [selectedTone, setSelectedTone] = useState('empathetic');
    const [scheduleTime, setScheduleTime] = useState('10:00 AM');
    const [campaignName, setCampaignName] = useState('');
    const [launched, setLaunched] = useState(false);

    const segment = SEGMENTS.find(s => s.id === selectedSegment)!;
    const targetAccounts = useMemo(() => loanData.filter(segment.filter), [loanData, segment]);
    const kpis = useMemo(() => computeKPIs(targetAccounts), [targetAccounts]);

    const totalCost = useMemo(() => {
        const costs: Record<string, number> = { whatsapp: 2, sms: 1, email: 0.5, ivr: 45 };
        return selectedChannels.reduce((s, ch) => s + (costs[ch] || 0) * targetAccounts.length, 0);
    }, [selectedChannels, targetAccounts.length]);

    const projectedRecovery = kpis.projectedRecovery;
    const roi = totalCost > 0 ? Math.round((projectedRecovery - totalCost) / totalCost * 100) : 0;

    function toggleChannel(id: string) {
        setSelectedChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    }

    const steps = [
        { n: 1, label: 'Segment' },
        { n: 2, label: 'Channels' },
        { n: 3, label: 'Message' },
        { n: 4, label: 'Schedule' },
        { n: 5, label: 'Review' },
    ];

    if (launched) {
        return (
            <div style={{ padding: '28px 32px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                <div style={{
                    background: 'var(--bg-surface)', borderRadius: 20, padding: '60px 40px', border: '1px solid var(--border)',
                    boxShadow: '0 8px 32px rgba(13,148,136,0.1)',
                }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🚀</div>
                    <h2 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Campaign Launched!</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 32 }}>
                        "{campaignName || 'Recovery Campaign'}" is now live and sending messages
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 32 }}>
                        {[
                            { label: 'Accounts Targeted', val: targetAccounts.length.toLocaleString(), color: '#0d9488' },
                            { label: 'Messages Scheduled', val: `${(targetAccounts.length * selectedChannels.length).toLocaleString()}`, color: '#16a34a' },
                            { label: 'Projected Recovery', val: `₹${Math.round(projectedRecovery / 100000)}L`, color: '#16a34a' },
                        ].map(item => (
                            <div key={item.label} style={{ background: 'rgba(22, 163, 74, 0.15)', borderRadius: 12, padding: '16px', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 4 }}>{item.label}</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '16px', textAlign: 'left', marginBottom: 28 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 10, fontSize: '0.9rem' }}>Live Progress</div>
                        {['Segmentation complete', 'Messages generated in regional languages', 'Queue dispatched to delivery engines', 'Tracking enabled'].map((s, i, arr) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < arr.length - 1 ? 8 : 0 }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="10" height="10"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <span style={{ fontSize: '0.82rem', color: '#475569' }}>{s}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setLaunched(false); setStep(1); setCampaignName(''); }}
                        style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #0d9488, #16a34a)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                        Create Another Campaign
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1100 }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{t('camp.title', lang)}</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '6px 0 0' }}>Build, schedule, and launch targeted recovery campaigns in minutes</p>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
                {steps.map((s, i) => (
                    <React.Fragment key={s.n}>
                        <div
                            onClick={() => s.n < step && setStep(s.n)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: s.n < step ? 'pointer' : 'default' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.82rem',
                                background: step > s.n ? '#0d9488' : step === s.n ? 'linear-gradient(135deg, #0d9488, #16a34a)' : '#f1f5f9',
                                color: step >= s.n ? 'white' : '#94a3b8',
                                boxShadow: step === s.n ? '0 2px 8px rgba(13,148,136,0.3)' : 'none',
                            }}>
                                {step > s.n ? '✓' : s.n}
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: step === s.n ? 700 : 500, color: step === s.n ? '#0d9488' : step > s.n ? '#16a34a' : '#94a3b8' }}>
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: step > s.n ? '#0d9488' : '#e2e8f0', margin: '0 8px', minWidth: 40, transition: 'background 0.3s' }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
                <div>
                    {/* Step 1: Segment */}
                    {step === 1 && (
                        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>1. Select Target Segment</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {SEGMENTS.map(seg => (
                                    <button key={seg.id} onClick={() => setSelectedSegment(seg.id)}
                                        style={{
                                            padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                                            background: selectedSegment === seg.id ? 'linear-gradient(135deg, #f0fdf4, #ccfbf1)' : '#f8fafc',
                                            border: `2px solid ${selectedSegment === seg.id ? '#0d9488' : '#e2e8f0'}`,
                                            transition: 'all 0.15s ease',
                                        }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{seg.icon}</div>
                                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', marginBottom: 2 }}>{seg.label}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{seg.desc}</div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', marginTop: 6 }}>
                                            {loanData.filter(seg.filter).length} accounts
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Channels */}
                    {step === 2 && (
                        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>2. Channel Mix</h3>
                            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 18px' }}>Select one or more channels (AI will personalize per customer)</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {CHANNELS.map(ch => (
                                    <button key={ch.id} onClick={() => toggleChannel(ch.id)}
                                        style={{
                                            padding: '16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                                            background: selectedChannels.includes(ch.id) ? '#f0fdf4' : '#f8fafc',
                                            border: `2px solid ${selectedChannels.includes(ch.id) ? '#0d9488' : '#e2e8f0'}`,
                                        }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: '1.4rem' }}>{ch.icon}</span>
                                            {selectedChannels.includes(ch.id) && <span style={{ background: '#0d9488', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>✓</span>}
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{ch.label}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>Avg response: {ch.avgResponse} • {ch.costPer}/msg</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Tone */}
                    {step === 3 && (
                        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>3. Message Tone</h3>
                            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 18px' }}>AI will generate messages in borrower's regional language</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {TONES.map(t => (
                                    <button key={t.id} onClick={() => setSelectedTone(t.id)}
                                        style={{
                                            padding: '16px 20px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                                            background: selectedTone === t.id ? '#f0fdf4' : '#f8fafc',
                                            border: `2px solid ${selectedTone === t.id ? '#0d9488' : '#e2e8f0'}`,
                                            display: 'flex', alignItems: 'center', gap: 12,
                                        }}>
                                        <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, color: selectedTone === t.id ? '#0d9488' : '#0f172a', fontSize: '0.9rem' }}>{t.label}</div>
                                        </div>
                                        {selectedTone === t.id && <span style={{ marginLeft: 'auto', color: '#0d9488', fontWeight: 700 }}>✓</span>}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', marginBottom: 6 }}>🌐 Languages Supported</div>
                                <div style={{ fontSize: '0.75rem', color: '#475569' }}>Hindi, Tamil, Telugu, Marathi, Bengali, Kannada, Gujarati, Punjabi, Malayalam, English</div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Schedule */}
                    {step === 4 && (
                        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>4. Schedule Campaign</h3>
                            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 18px' }}>RBI regulations: No contact before 8 AM or after 7 PM</p>
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>Campaign Name</label>
                                <input value={campaignName} onChange={e => setCampaignName(e.target.value)}
                                    placeholder={`${segment.label} — ${new Date().toLocaleDateString('en-IN')}`}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', fontFamily: 'Inter', outline: 'none' }}
                                />
                            </div>
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>Send Time</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {TIMES.map(t => (
                                        <button key={t} onClick={() => setScheduleTime(t)}
                                            style={{
                                                padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter', fontSize: '0.82rem', fontWeight: 600,
                                                background: scheduleTime === t ? '#0d9488' : '#f8fafc',
                                                color: scheduleTime === t ? 'white' : '#475569',
                                                border: `1.5px solid ${scheduleTime === t ? '#0d9488' : '#e2e8f0'}`,
                                            }}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: '#fffbeb', borderRadius: 10, padding: '12px 14px', border: '1px solid #fde68a' }}>
                                <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600, marginBottom: 4 }}>⚠️ Compliance Guard Active</div>
                                <div style={{ fontSize: '0.72rem', color: '#92400e' }}>Auto-blocked: Sunday, public holidays, cooling-off period (7 days after last contact). Harassment language filter active.</div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {step === 5 && (
                        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 18px' }}>5. Review & Launch</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                                {[
                                    { k: 'Segment', v: segment.label + ` (${targetAccounts.length} accounts)` },
                                    { k: 'Channels', v: selectedChannels.map(c => CHANNELS.find(ch => ch.id === c)!.label).join(', ') },
                                    { k: 'Tone', v: TONES.find(t => t.id === selectedTone)!.label },
                                    { k: 'Schedule', v: `${scheduleTime} today` },
                                    { k: 'Total Messages', v: (targetAccounts.length * selectedChannels.length).toLocaleString() },
                                    { k: 'Est. Cost', v: `₹${totalCost.toLocaleString('en-IN')}` },
                                ].map(item => (
                                    <div key={item.k} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 3 }}>{item.k}</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{item.v}</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setLaunched(true)}
                                style={{
                                    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0d9488, #16a34a)',
                                    color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(13,148,136,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}>
                                🚀 Launch Campaign Now — {targetAccounts.length.toLocaleString()} Accounts
                            </button>
                        </div>
                    )}

                    {/* Step navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                        <button onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1}
                            style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, fontWeight: 600, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.5 : 1 }}>
                            ← Back
                        </button>
                        {step < 5 && (
                            <button onClick={() => setStep(s => Math.min(5, s + 1))}
                                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0d9488, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                                Next →
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '18px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: 14 }}>Campaign Preview</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { k: 'Target Accounts', v: targetAccounts.length.toLocaleString(), icon: '👥', color: '#0d9488' },
                                { k: 'Total Overdue', v: `₹${Math.round(kpis.totalOverdue / 100000)}L`, icon: '💰', color: '#dc2626' },
                                { k: 'Proj. Recovery', v: `₹${Math.round(projectedRecovery / 100000)}L`, icon: '📈', color: '#16a34a' },
                                { k: 'Est. Cost', v: `₹${totalCost.toLocaleString()}`, icon: '💳', color: '#d97706' },
                                { k: 'Expected ROI', v: `${roi}%`, icon: '🎯', color: '#0d9488' },
                            ].map(item => (
                                <div key={item.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.icon} {item.k}</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: item.color }}>{item.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)', borderRadius: 14, padding: '14px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', marginBottom: 8 }}>🛡️ Compliance Checks</div>
                        {['Time window (8AM-7PM) ✓', 'Cooling-off period ✓', 'RBI message guidelines ✓', 'No harassment language ✓', 'Opt-out honoured ✓'].map(c => (
                            <div key={c} style={{ fontSize: '0.72rem', color: '#065f46', marginBottom: 4 }}>• {c}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
