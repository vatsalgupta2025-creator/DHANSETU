'use client';
import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { t, getRBIRules } from '@/lib/i18n';

// Audit log generator
function generateAuditLogs(loanData: any[]) {
    const actions = ['WhatsApp sent', 'SMS sent', 'IVR attempted', 'Email sent', 'Bot session', 'Agent call', 'PTP recorded', 'Restructure offered'];
    const agents = ['AI Bot', 'AI Bot', 'AI System', 'AI System', 'AI Bot', 'Ravi Kumar', 'Priya Singh', 'AI System'];
    const outcomes = ['Delivered', 'Read', 'No answer', 'Opened', 'Responded', 'PTP captured', 'Agreed', 'No response'];
    const now = new Date();
    return loanData.slice(0, 20).map((r, i) => {
        const ts = new Date(now.getTime() - i * 3600000 * 2);
        const actionIdx = i % actions.length;
        return {
            id: `LOG-${String(1000 + i).padStart(4, '0')}`,
            timestamp: ts.toLocaleString('en-IN'),
            borrower: r.customer.name,
            loanId: r.loan.loanId,
            action: actions[actionIdx],
            agent: agents[actionIdx],
            channel: actionIdx <= 1 ? 'WhatsApp' : actionIdx === 2 ? 'IVR' : actionIdx === 3 ? 'Email' : actionIdx === 4 ? 'Bot' : 'Call',
            outcome: outcomes[actionIdx],
            compliant: actionIdx !== 2 || (ts.getHours() >= 8 && ts.getHours() < 19),
        };
    });
}

function Guardrails({ lang }: { lang: string }) {
    const rbiRules = getRBIRules(lang);
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
                {[
                    { labelKey: 'comp.rulesActive', val: '10/10', color: '#16a34a', bg: '#f0fdf4', icon: '🛡️' },
                    { labelKey: 'comp.compliantContacts', val: '99.2%', color: '#0d9488', bg: '#f0fdfa', icon: '✅' },
                    { labelKey: 'comp.violationsBlocked', val: '47', color: '#d97706', bg: '#fffbeb', icon: '🚫' },
                    { labelKey: 'comp.optoutsHonoured', val: '12', color: '#475569', bg: '#f8fafc', icon: '🔕' },
                ].map(item => (
                    <div key={item.labelKey} style={{ background: item.bg, borderRadius: 12, padding: '16px', border: `1px solid ${item.color}20` }}>
                        <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{item.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.5rem', color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>{t(item.labelKey, lang as any)}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #f0fdf4, #f0fdfa)', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🏛️</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{t('comp.rbiStatus', lang as any)}</span>
                    <span style={{ marginLeft: 'auto', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 999, padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {t('comp.fullyCompliant', lang as any)}
                    </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            {['#', t('comp.col.rule', lang as any), t('comp.col.status', lang as any), t('comp.col.enforcement', lang as any), t('comp.col.description', lang as any)].map(h => (
                                <th key={h} style={{ padding: '9px 14px', fontSize: '0.63rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rbiRules.map(rule => (
                            <tr key={rule.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '10px 14px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>{rule.id}</td>
                                <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#0f172a', fontWeight: 500, maxWidth: 300 }}>{rule.rule}</td>
                                <td style={{ padding: '10px 14px' }}>
                                    <span style={{
                                        background: rule.status === 'active' ? '#f0fdf4' : '#fffbeb',
                                        color: rule.status === 'active' ? '#16a34a' : '#d97706',
                                        border: `1px solid ${rule.status === 'active' ? '#bbf7d0' : '#fde68a'}`,
                                        borderRadius: 999, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700
                                    }}>
                                        {rule.status === 'active' ? t('comp.active', lang as any) : t('comp.monitoring', lang as any)}
                                    </span>
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                    {rule.enforced && <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>{t('comp.autoEnforced', lang as any)}</span>}
                                </td>
                                <td style={{ padding: '10px 14px', fontSize: '0.72rem', color: '#64748b' }}>{rule.desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AuditLog({ lang }: { lang: string }) {
    const { loanData } = useApp();
    const logs = useMemo(() => generateAuditLogs(loanData), [loanData]);
    const [filter, setFilter] = useState('All');

    const filtered = filter === 'All' ? logs : filter === t('comp.nonCompliant', lang as any) ? logs.filter(l => !l.compliant) : logs.filter(l => l.channel === filter);
    const filterLabels = ['All', 'WhatsApp', 'SMS', 'Email', 'Call', 'Bot', t('comp.nonCompliant', lang as any)];

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {filterLabels.map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{
                            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem',
                            background: filter === f ? (f === t('comp.nonCompliant', lang as any) ? '#fef2f2' : '#0d9488') : '#f1f5f9',
                            color: filter === f ? (f === t('comp.nonCompliant', lang as any) ? '#dc2626' : 'white') : '#475569',
                        }}>
                        {f} {f === 'All' ? `(${logs.length})` : f === t('comp.nonCompliant', lang as any) ? `(${logs.filter(l => !l.compliant).length})` : ''}
                    </button>
                ))}
                <button style={{ marginLeft: 'auto', padding: '6px 14px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                    {t('comp.exportCSV', lang as any)}
                </button>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            {[t('comp.logId', lang as any), t('comp.timestamp', lang as any), t('comp.borrower', lang as any), t('dash.action', lang as any), t('comp.agentAI', lang as any), t('comp.channel', lang as any), t('comp.outcome', lang as any), t('comp.compliance', lang as any)].map(h => (
                                <th key={h} style={{ padding: '9px 12px', fontSize: '0.63rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', background: !log.compliant ? '#fef9f9' : undefined }}>
                                <td style={{ padding: '9px 12px', fontSize: '0.68rem', fontWeight: 700, color: '#0d9488' }}>{log.id}</td>
                                <td style={{ padding: '9px 12px', fontSize: '0.7rem', color: '#64748b' }}>{log.timestamp}</td>
                                <td style={{ padding: '9px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{log.borrower}</td>
                                <td style={{ padding: '9px 12px', fontSize: '0.75rem', color: '#475569' }}>{log.action}</td>
                                <td style={{ padding: '9px 12px', fontSize: '0.72rem', color: log.agent === 'AI Bot' || log.agent === 'AI System' ? '#0d9488' : '#ea580c', fontWeight: 600 }}>{log.agent}</td>
                                <td style={{ padding: '9px 12px' }}>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', background: '#f8fafc', borderRadius: 6, padding: '2px 6px' }}>{log.channel}</span>
                                </td>
                                <td style={{ padding: '9px 12px', fontSize: '0.72rem', color: '#64748b' }}>{log.outcome}</td>
                                <td style={{ padding: '9px 12px' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: log.compliant ? '#16a34a' : '#dc2626', background: log.compliant ? '#f0fdf4' : '#fef2f2', borderRadius: 999, padding: '2px 8px', border: `1px solid ${log.compliant ? '#bbf7d0' : '#fecaca'}` }}>
                                        {log.compliant ? t('comp.compliant', lang as any) : t('comp.flagged', lang as any)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function HumanEscalation({ lang }: { lang: string }) {
    const { loanData } = useApp();
    const hvaAccounts = useMemo(() => loanData.filter(r => r.loan.outstandingAmount > 500000 && r.risk.riskTier !== 'Low').slice(0, 8), [loanData]);
    const [assigned, setAssigned] = useState<Record<string, string>>({});

    const agents = ['Ravi Kumar', 'Priya Singh', 'Arjun Mehta', 'Sunita Devi'];

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
                {[
                    { labelKey: 'comp.pendingEscalations', val: hvaAccounts.filter(r => !assigned[r.customer.id]).length, color: '#d97706', bg: '#fffbeb' },
                    { labelKey: 'comp.assignedHuman', val: Object.keys(assigned).length, color: '#0d9488', bg: '#f0fdfa' },
                    { labelKey: 'dash.totalPortfolio', val: `₹${Math.round(hvaAccounts.reduce((s, r) => s + r.loan.outstandingAmount, 0) / 10000000)}Cr`, color: '#dc2626', bg: '#fef2f2' },
                ].map(item => (
                    <div key={item.labelKey} style={{ background: item.bg, borderRadius: 12, padding: '16px', border: `1px solid ${item.color}20` }}>
                        <div style={{ fontWeight: 800, fontSize: '1.4rem', color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>{t(item.labelKey, lang as any)}</div>
                    </div>
                ))}
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>⚠️</span>
                <span style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 600 }}>{t('comp.hvaWarning', lang as any)}</span>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            {[t('comp.borrower', lang as any), t('comp.outstanding', lang as any), 'DPD', t('dash.risk', lang as any), t('comp.aiRecommendation', lang as any), t('comp.assignAgent', lang as any), t('comp.col.status', lang as any)].map(h => (
                                <th key={h} style={{ padding: '9px 14px', fontSize: '0.63rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {hvaAccounts.map(r => (
                            <tr key={r.customer.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '10px 14px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{r.customer.name}</div>
                                    <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{r.customer.region}</div>
                                </td>
                                <td style={{ padding: '10px 14px', fontWeight: 800, color: '#dc2626', fontSize: '0.85rem', fontFamily: 'Space Grotesk' }}>₹{(r.loan.outstandingAmount / 100000).toFixed(1)}L</td>
                                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ea580c', fontSize: '0.82rem' }}>{r.loan.currentDpd}d</td>
                                <td style={{ padding: '10px 14px' }}>
                                    <span style={{ background: r.risk.riskTier === 'Critical' ? '#fef2f2' : '#fff7ed', color: r.risk.riskTier === 'Critical' ? '#dc2626' : '#ea580c', borderRadius: 999, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 700 }}>{r.risk.riskTier}</span>
                                </td>
                                <td style={{ padding: '10px 14px', fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>{t('comp.seniorCall', lang as any)}</td>
                                <td style={{ padding: '10px 14px' }}>
                                    <select value={assigned[r.customer.id] || ''} onChange={e => setAssigned(prev => ({ ...prev, [r.customer.id]: e.target.value }))}
                                        style={{ padding: '5px 8px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: '0.75rem', fontFamily: 'Inter', outline: 'none', minWidth: 120 }}>
                                        <option value="">-- {t('comp.assignAgent', lang as any)} --</option>
                                        {agents.map(a => <option key={a}>{a}</option>)}
                                    </select>
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                    {assigned[r.customer.id]
                                        ? <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', borderRadius: 999, padding: '2px 8px' }}>{t('comp.assigned', lang as any)}</span>
                                        : <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fffbeb', borderRadius: 999, padding: '2px 8px' }}>{t('comp.pending', lang as any)}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BiasMonitor({ lang }: { lang: string }) {
    const { loanData } = useApp();

    const genderData = useMemo(() => {
        const male = loanData.filter(r => ['Rajesh', 'Suresh', 'Dilip', 'Ranjit', 'Satish', 'Arjun', 'Vikas'].some(n => r.customer.name.includes(n)));
        const female = loanData.filter(r => ['Priya', 'Anita', 'Sunita', 'Kavya', 'Meena'].some(n => r.customer.name.includes(n)));
        return [
            { group: 'Male', avgRisk: Math.round(male.reduce((s, r) => s + r.risk.riskScore, 0) / (male.length || 1)), contactRate: 68, successRate: 38 },
            { group: 'Female', avgRisk: Math.round(female.reduce((s, r) => s + r.risk.riskScore, 0) / (female.length || 1)), contactRate: 71, successRate: 42 },
        ];
    }, [loanData]);

    const regions = ['Maharashtra', 'Delhi', 'Tamil Nadu', 'Gujarat', 'West Bengal'];
    const regionData = regions.map(reg => ({
        region: reg,
        contactRate: 60 + Math.floor(Math.random() * 20),
        avgRisk: 55 + Math.floor(Math.random() * 25),
        recoveryRate: 30 + Math.floor(Math.random() * 20),
    }));

    const bias_checks = [
        { check: 'Gender parity in contact rates', result: 'PASS', detail: 'Female contact: 71% vs Male: 68% — within 5% threshold' },
        { check: 'Regional discrimination', result: 'PASS', detail: 'All regions within ±12% of national average contact rate' },
        { check: 'Occupation bias in risk scoring', result: 'WARN', detail: 'Farmers score 8pp higher — seasonal factor, reviewing' },
        { check: 'Consistent tone across demographics', result: 'PASS', detail: 'AI tone model blind to gender/religion/caste' },
        { check: 'Waiver offer parity', result: 'PASS', detail: 'Restructure offers based on DPD only, not demographics' },
    ];

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>{t('comp.genderFairness', lang as any)}</div>
                    {genderData.map(g => (
                        <div key={g.group} style={{ marginBottom: 14 }}>
                            <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem', marginBottom: 6 }}>{g.group}</div>
                            {[
                                { k: t('risk.riskScore', lang as any), v: g.avgRisk, max: 100, color: '#dc2626' },
                                { k: t('dash.recoveryRate', lang as any), v: g.contactRate, max: 100, color: '#0d9488' },
                                { k: t('dash.recoveryRate', lang as any), v: g.successRate, max: 100, color: '#16a34a' },
                            ].map((m, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                    <div style={{ width: 100, fontSize: '0.68rem', color: '#94a3b8' }}>{m.k}</div>
                                    <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 999 }}>
                                        <div style={{ height: '100%', width: `${m.v}%`, background: m.color, borderRadius: 999 }} />
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.72rem', color: m.color, width: 30 }}>{m.v}%</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>{t('comp.regionalEquity', lang as any)}</div>
                    {regionData.map(r => (
                        <div key={r.region} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 90, fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>{r.region}</div>
                            <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 999 }}>
                                <div style={{ height: '100%', width: `${r.contactRate}%`, background: '#0d9488', borderRadius: 999 }} />
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700, width: 35 }}>{r.contactRate}%</div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                    {t('comp.fairnessAudit', lang as any)}
                </div>
                {bias_checks.map(c => (
                    <div key={c.check} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #f8fafc' }}>
                        <div style={{
                            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                            background: c.result === 'PASS' ? '#f0fdf4' : '#fffbeb',
                            border: `1.5px solid ${c.result === 'PASS' ? '#bbf7d0' : '#fde68a'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', fontWeight: 800,
                            color: c.result === 'PASS' ? '#16a34a' : '#d97706',
                        }}>
                            {c.result === 'PASS' ? '✓' : '!'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{c.check}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.detail}</div>
                        </div>
                        <span style={{
                            background: c.result === 'PASS' ? '#f0fdf4' : '#fffbeb',
                            color: c.result === 'PASS' ? '#16a34a' : '#d97706',
                            border: `1px solid ${c.result === 'PASS' ? '#bbf7d0' : '#fde68a'}`,
                            borderRadius: 999, padding: '2px 10px', fontSize: '0.65rem', fontWeight: 700,
                        }}>
                            {c.result}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ComplianceCenter() {
    const { appLanguage } = useApp();
    const lang = appLanguage.code;
    const [tab, setTab] = useState('guardrails');

    const TABS = [
        { id: 'guardrails', label: t('comp.tab.guardrails', lang as any) },
        { id: 'audit', label: t('comp.tab.audit', lang as any) },
        { id: 'escalation', label: t('comp.tab.escalation', lang as any) },
        { id: 'bias', label: t('comp.tab.bias', lang as any) },
    ];

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{t('comp.title', lang as any)}</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '6px 0 0' }}>
                    {t('comp.subtitle', lang as any)}
                </p>
            </div>
            <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20, flexWrap: 'wrap' }}>
                {TABS.map(tb => (
                    <button key={tb.id} onClick={() => setTab(tb.id)}
                        style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: tab === tb.id ? '#fff' : 'transparent', color: tab === tb.id ? '#0d9488' : '#64748b', boxShadow: tab === tb.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                        {tb.label}
                    </button>
                ))}
            </div>
            {tab === 'guardrails' && <Guardrails lang={lang} />}
            {tab === 'audit' && <AuditLog lang={lang} />}
            {tab === 'escalation' && <HumanEscalation lang={lang} />}
            {tab === 'bias' && <BiasMonitor lang={lang} />}
        </div>
    );
}
