'use client';
import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';

interface Stage { id: string; name: string; icon: string; dpdRange: string; channels: string[]; action: string; color: string; count: number; slaAvgDays: number; slaPct: number; }

const PIPELINE: Stage[] = [
    { id: 'soft', name: 'Soft Reminder', icon: '💬', dpdRange: '1-15 DPD', channels: ['WhatsApp', 'SMS'], action: 'Auto-send friendly payment reminder', color: '#16a34a', count: 0, slaAvgDays: 2.1, slaPct: 96 },
    { id: 'firm', name: 'Firm Follow-up', icon: '📞', dpdRange: '16-30 DPD', channels: ['Call', 'WhatsApp', 'Email'], action: 'Agent call + automated follow-up', color: '#f59e0b', count: 0, slaAvgDays: 3.5, slaPct: 88 },
    { id: 'escalated', name: 'Escalated Collection', icon: '⚠️', dpdRange: '31-60 DPD', channels: ['Call', 'Field Visit', 'Email'], action: 'Senior agent + field visit scheduling', color: '#ea580c', count: 0, slaAvgDays: 5.2, slaPct: 78 },
    { id: 'legal', name: 'Legal Notice', icon: '⚖️', dpdRange: '61-90 DPD', channels: ['Registered Mail', 'Email', 'Call'], action: 'Issue legal notice + demand letter', color: '#dc2626', count: 0, slaAvgDays: 7.8, slaPct: 85 },
    { id: 'enforcement', name: 'Legal Action', icon: '🏛️', dpdRange: '90+ DPD', channels: ['Legal', 'SARFAESI', 'DRT'], action: 'Initiate SARFAESI/DRT proceedings', color: '#7c2d12', count: 0, slaAvgDays: 14.3, slaPct: 92 },
];

interface WfRule { id: string; trigger: string; condition: string; action: string; enabled: boolean; priority: number; }

const DEFAULT_RULES: WfRule[] = [
    { id: 'R01', trigger: 'DPD reaches 1', condition: 'Outstanding > ₹10,000', action: 'Send WhatsApp reminder in borrower language', enabled: true, priority: 1 },
    { id: 'R02', trigger: 'DPD reaches 7', condition: 'No response to initial reminder', action: 'Send SMS + Email reminder', enabled: true, priority: 2 },
    { id: 'R03', trigger: 'DPD reaches 15', condition: 'Risk Score > 60', action: 'Assign to recovery agent for call', enabled: true, priority: 3 },
    { id: 'R04', trigger: 'DPD reaches 30', condition: 'No PTP obtained', action: 'Escalate to senior negotiator', enabled: true, priority: 4 },
    { id: 'R05', trigger: 'PTP broken', condition: 'PTP missed by 3+ days', action: 'Immediate call + field visit scheduling', enabled: true, priority: 5 },
    { id: 'R06', trigger: 'DPD reaches 60', condition: 'Outstanding > ₹5L', action: 'Generate legal notice draft', enabled: true, priority: 6 },
    { id: 'R07', trigger: 'DPD reaches 90', condition: 'No settlement agreement', action: 'Initiate SARFAESI proceedings', enabled: false, priority: 7 },
    { id: 'R08', trigger: 'Sentiment = Distressed', condition: 'AI detects genuine hardship', action: 'Offer restructuring plan + human review', enabled: true, priority: 8 },
];

interface AuditEntry { id: string; time: string; borrower: string; from: string; to: string; reason: string; agent: string; }

const AUDIT_LOG: AuditEntry[] = [
    { id: 'AU01', time: '14:32', borrower: 'Rajesh Kumar', from: 'Soft Reminder', to: 'Firm Follow-up', reason: 'DPD crossed 16 · No response', agent: 'System (Auto)' },
    { id: 'AU02', time: '13:15', borrower: 'Sunita Devi', from: 'Firm Follow-up', to: 'Escalated Collection', reason: 'PTP broken 3x · High risk score 82', agent: 'Arjun Mehta' },
    { id: 'AU03', time: '12:48', borrower: 'Anil Patel', from: 'Escalated Collection', to: 'Legal Notice', reason: 'DPD 67 · Outstanding ₹8.2L · No engagement', agent: 'System (Auto)' },
    { id: 'AU04', time: '11:20', borrower: 'Mohan Das', from: 'Firm Follow-up', to: 'Soft Reminder', reason: 'Hardship case · Restructuring approved', agent: 'Priya Nair' },
    { id: 'AU05', time: '10:05', borrower: 'Kavitha R.', from: 'Legal Notice', to: 'Resolved', reason: 'Full settlement paid · ₹4.5L recovered', agent: 'System (Auto)' },
    { id: 'AU06', time: '09:30', borrower: 'Fatima Sheikh', from: 'Soft Reminder', to: 'Compliance Hold', reason: 'DNC flag · RBI compliance triggered', agent: 'Compliance Bot' },
];

const TRIGGERS = ['DPD reaches', 'PTP broken', 'Sentiment =', 'No response for', 'Bounce detected', 'Risk Score changes to'];
const CONDITIONS = ['Outstanding > ₹10,000', 'Outstanding > ₹5L', 'Risk Score > 60', 'Risk Score > 80', 'No PTP obtained', 'AI detects hardship', 'Region = Rural', '3+ missed calls'];
const RULE_ACTIONS = ['Send WhatsApp reminder', 'Send SMS + Email', 'Assign recovery agent', 'Schedule field visit', 'Escalate to senior team', 'Generate legal notice', 'Offer restructuring', 'Mark for human review', 'Initiate SARFAESI'];

export default function EscalationWorkflow() {
    const { loanData, selectedBank } = useApp();
    const accent = selectedBank?.accent || '#0d9488';
    const [rules, setRules] = useState(DEFAULT_RULES);
    const [selStage, setSelStage] = useState<string | null>(null);
    const [view, setView] = useState<'pipeline' | 'rules' | 'audit'>('pipeline');
    const [showAddRule, setShowAddRule] = useState(false);
    const [newRule, setNewRule] = useState({ trigger: '', condition: '', action: '' });

    const pipeline = useMemo(() => PIPELINE.map(s => {
        const [lo, hi] = s.dpdRange.replace(' DPD', '').replace('+', '-9999').split('-').map(Number);
        return { ...s, count: loanData.filter(d => d.loan.currentDpd >= lo && d.loan.currentDpd <= (hi || 9999)).length };
    }), [loanData]);

    const totalInPipeline = pipeline.reduce((s, p) => s + p.count, 0);
    const slaBreaches = pipeline.filter(p => p.slaPct < 85).length;
    const avgResolution = (pipeline.reduce((s, p) => s + p.slaAvgDays, 0) / pipeline.length).toFixed(1);

    // Stage drawer borrowers
    const stageBorrowers = useMemo(() => {
        if (!selStage) return [];
        const s = PIPELINE.find(p => p.id === selStage);
        if (!s) return [];
        const [lo, hi] = s.dpdRange.replace(' DPD', '').replace('+', '-9999').split('-').map(Number);
        return loanData.filter(d => d.loan.currentDpd >= lo && d.loan.currentDpd <= (hi || 9999)).slice(0, 10);
    }, [selStage, loanData]);

    const addNewRule = () => {
        if (!newRule.trigger || !newRule.condition || !newRule.action) return;
        const id = `R${String(rules.length + 1).padStart(2, '0')}`;
        setRules(prev => [...prev, { id, trigger: newRule.trigger, condition: newRule.condition, action: newRule.action, enabled: true, priority: prev.length + 1 }]);
        setNewRule({ trigger: '', condition: '', action: '' });
        setShowAddRule(false);
    };

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>⚡ Escalation Workflow</h1>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 6 }}>Automated escalation pipeline with rule-based triggers and SLA monitoring</p>
                </div>
                <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
                    {(['pipeline', 'rules', 'audit'] as const).map(v => (
                        <button key={v} onClick={() => setView(v)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: view === v ? 'white' : 'transparent', color: view === v ? accent : '#64748b', boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                            {v === 'pipeline' ? '🔄 Pipeline' : v === 'rules' ? '📋 Rules' : '📜 Audit Trail'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Total in Pipeline</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: accent, fontFamily: 'Space Grotesk' }}>{totalInPipeline}</div>
                </div>
                <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Active Rules</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', fontFamily: 'Space Grotesk' }}>{rules.filter(r => r.enabled).length}/{rules.length}</div>
                </div>
                <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Avg Resolution</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', fontFamily: 'Space Grotesk' }}>{avgResolution} days</div>
                </div>
                <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>SLA Breaches</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: slaBreaches > 0 ? '#dc2626' : '#16a34a', fontFamily: 'Space Grotesk' }}>{slaBreaches} stages</div>
                </div>
            </div>

            {/* Stage Cards with SLA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
                {pipeline.map(s => (
                    <div key={s.id} onClick={() => setSelStage(selStage === s.id ? null : s.id)} style={{
                        background: 'white', borderRadius: 14, padding: '16px', position: 'relative', overflow: 'hidden',
                        border: selStage === s.id ? `2px solid ${s.color}` : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {/* Pulse for active */}
                        {s.count > 0 && (
                            <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: s.color, animation: 'pulseDot 2s infinite' }} />
                        )}
                        <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'Space Grotesk', margin: '4px 0' }}>{s.count}</div>
                        <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginBottom: 8 }}>{s.dpdRange}</div>
                        {/* SLA Indicator */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6rem', marginBottom: 3 }}>
                            <span style={{ color: '#94a3b8', fontWeight: 600 }}>SLA</span>
                            <span style={{ fontWeight: 700, color: s.slaPct >= 90 ? '#16a34a' : s.slaPct >= 80 ? '#f59e0b' : '#dc2626' }}>{s.slaPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#f1f5f9' }}>
                            <div style={{ width: `${s.slaPct}%`, height: '100%', borderRadius: 2, background: s.slaPct >= 90 ? '#16a34a' : s.slaPct >= 80 ? '#f59e0b' : '#dc2626', transition: 'width 0.5s' }} />
                        </div>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: 4 }}>Avg: {s.slaAvgDays}d</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selStage ? '1fr 360px' : '1fr', gap: 24 }}>
                <div>
                    {view === 'pipeline' && (
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
                                Escalation Pipeline — {totalInPipeline} Active Accounts
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                {pipeline.map((s, i) => (
                                    <React.Fragment key={s.id}>
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <div style={{
                                                width: 68, height: 68, borderRadius: '50%', background: `${s.color}15`, border: `3px solid ${s.color}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.6rem',
                                                position: 'relative', animation: s.count > 0 ? 'pulseRing 2.5s infinite' : 'none',
                                                boxShadow: s.count > 0 ? `0 0 0 0 ${s.color}30` : 'none',
                                            }}>
                                                {s.icon}
                                                <div style={{ position: 'absolute', top: -6, right: -6, background: s.color, color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800, minWidth: 22, textAlign: 'center' }}>{s.count}</div>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: s.color }}>{s.name}</div>
                                            <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: 2 }}>{s.dpdRange}</div>
                                            <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.3, padding: '0 4px' }}>{s.action}</div>
                                            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                                                {s.channels.map(ch => <span key={ch} style={{ fontSize: '0.52rem', background: `${s.color}12`, color: s.color, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{ch}</span>)}
                                            </div>
                                        </div>
                                        {i < pipeline.length - 1 && (
                                            <div style={{ position: 'relative', width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, ${pipeline[i].color}, ${pipeline[i + 1].color})` }} />
                                                <div style={{
                                                    position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: accent,
                                                    animation: 'flowDot 2s infinite',
                                                }} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'rules' && (
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Automation Rules ({rules.filter(r => r.enabled).length} active)</div>
                                <button onClick={() => setShowAddRule(true)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: accent, color: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>+ Add Rule</button>
                            </div>
                            {rules.map((r, idx) => (
                                <div key={r.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16, opacity: r.enabled ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', width: 20, textAlign: 'center' }}>{idx + 1}</div>
                                    <button onClick={() => setRules(prev => prev.map(x => x.id === r.id ? { ...x, enabled: !x.enabled } : x))} style={{ width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: r.enabled ? accent : '#cbd5e1', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: r.enabled ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                    </button>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', marginBottom: 3 }}>
                                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600, color: '#6366f1', marginRight: 6 }}>WHEN</span>
                                            {r.trigger}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                            <span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600, color: '#92400e', marginRight: 6 }}>IF</span>
                                            {r.condition}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: accent, fontWeight: 600, marginTop: 3 }}>
                                            <span style={{ background: '#dcfce7', padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600, color: '#166534', marginRight: 6 }}>THEN</span>
                                            {r.action}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: r.enabled ? '#16a34a' : '#94a3b8', background: r.enabled ? '#f0fdf4' : '#f8fafc', padding: '3px 10px', borderRadius: 6, flexShrink: 0 }}>{r.enabled ? 'ACTIVE' : 'OFF'}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {view === 'audit' && (
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                                📜 Recent Escalation History
                            </div>
                            <div style={{ position: 'relative', padding: '20px 20px 20px 48px' }}>
                                {/* Timeline line */}
                                <div style={{ position: 'absolute', left: 36, top: 20, bottom: 20, width: 2, background: '#e2e8f0' }} />
                                {AUDIT_LOG.map((entry, i) => {
                                    const isUp = entry.to !== 'Resolved' && entry.to !== 'Soft Reminder' && entry.to !== 'Compliance Hold';
                                    const dotColor = entry.to === 'Resolved' ? '#16a34a' : entry.to === 'Compliance Hold' ? '#dc2626' : isUp ? '#f59e0b' : '#0d9488';
                                    return (
                                        <div key={entry.id} style={{ position: 'relative', marginBottom: 20, animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both` }}>
                                            {/* Dot */}
                                            <div style={{ position: 'absolute', left: -20, top: 4, width: 12, height: 12, borderRadius: '50%', background: dotColor, border: '2px solid white', boxShadow: `0 0 0 2px ${dotColor}30` }} />
                                            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{entry.borrower}</div>
                                                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>Today, {entry.time}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                    <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>{entry.from}</span>
                                                    <span style={{ color: isUp ? '#f59e0b' : '#16a34a', fontWeight: 800 }}>{isUp ? '→' : '←'}</span>
                                                    <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 700, background: `${dotColor}12`, color: dotColor }}>{entry.to}</span>
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>{entry.reason}</div>
                                                <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 4 }}>By: {entry.agent}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stage Detail Drawer */}
                {selStage && (
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideInRight 0.25s ease' }}>
                        {(() => {
                            const stage = pipeline.find(p => p.id === selStage)!;
                            return (
                                <>
                                    <div style={{ padding: '16px 20px', background: `${stage.color}08`, borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 800, fontSize: '1rem', color: stage.color, fontFamily: 'Space Grotesk' }}>{stage.icon} {stage.name}</div>
                                            <button onClick={() => setSelStage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#94a3b8' }}>✕</button>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>{stage.dpdRange} · {stage.count} accounts</div>
                                    </div>
                                    <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: stage.slaPct >= 90 ? '#16a34a' : '#f59e0b', fontFamily: 'Space Grotesk' }}>{stage.slaPct}%</div>
                                            <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>SLA Compliance</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#6366f1', fontFamily: 'Space Grotesk' }}>{stage.slaAvgDays}d</div>
                                            <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Avg Stay</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '12px 20px', maxHeight: 340, overflowY: 'auto' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Accounts in this stage</div>
                                        {stageBorrowers.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: '0.82rem' }}>No accounts in this stage</div>
                                        ) : stageBorrowers.map(d => (
                                            <div key={d.loan.loanId} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 10, marginBottom: 6, border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>{d.customer.name}</span>
                                                    <span style={{ fontWeight: 700, fontSize: '0.72rem', color: stage.color }}>{d.loan.currentDpd} DPD</span>
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>₹{(d.loan.outstandingAmount / 100000).toFixed(1)}L · {d.customer.region} · Score: {d.risk.riskScore}</div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Add Rule Modal */}
            {showAddRule && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ background: 'white', borderRadius: 20, width: 500, padding: '28px 32px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', animation: 'scaleIn 0.25s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', fontFamily: 'Space Grotesk' }}>📋 Create Automation Rule</div>
                            <button onClick={() => setShowAddRule(false)} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                                    <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600, color: '#6366f1', marginRight: 6 }}>WHEN</span> Trigger
                                </label>
                                <select value={newRule.trigger} onChange={e => setNewRule(p => ({ ...p, trigger: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 500, outline: 'none' }}>
                                    <option value="">Select trigger...</option>
                                    {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                                    <span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600, color: '#92400e', marginRight: 6 }}>IF</span> Condition
                                </label>
                                <select value={newRule.condition} onChange={e => setNewRule(p => ({ ...p, condition: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 500, outline: 'none' }}>
                                    <option value="">Select condition...</option>
                                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                                    <span style={{ background: '#dcfce7', padding: '2px 8px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600, color: '#166534', marginRight: 6 }}>THEN</span> Action
                                </label>
                                <select value={newRule.action} onChange={e => setNewRule(p => ({ ...p, action: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 500, outline: 'none' }}>
                                    <option value="">Select action...</option>
                                    {RULE_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Preview */}
                        {newRule.trigger && newRule.condition && newRule.action && (
                            <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>PREVIEW</div>
                                <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#334155' }}>
                                    When <strong style={{ color: '#6366f1' }}>{newRule.trigger}</strong> and <strong style={{ color: '#92400e' }}>{newRule.condition}</strong>, then <strong style={{ color: '#166534' }}>{newRule.action}</strong>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button onClick={() => setShowAddRule(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#64748b' }}>Cancel</button>
                            <button onClick={addNewRule} disabled={!newRule.trigger || !newRule.condition || !newRule.action}
                                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: accent, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', opacity: newRule.trigger && newRule.condition && newRule.action ? 1 : 0.5 }}>
                                Create Rule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.8); } }
                @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 currentColor; } 70% { box-shadow: 0 0 0 8px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
                @keyframes flowDot { 0% { left:0; opacity:0; } 20% { opacity:1; } 80% { opacity:1; } 100% { left:calc(100% - 6px); opacity:0; } }
                @keyframes slideInRight { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
            `}</style>
        </div>
    );
}
