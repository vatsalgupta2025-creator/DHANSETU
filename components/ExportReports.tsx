'use client';
import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { computeKPIs } from '@/lib/data';

type ReportType = 'portfolio' | 'campaign' | 'compliance' | 'risk' | 'recovery';

interface ReportConfig {
    id: ReportType;
    title: string;
    description: string;
    icon: string;
    color: string;
    fields: string[];
}

const REPORTS: ReportConfig[] = [
    { id: 'portfolio', title: 'Portfolio Summary', description: 'Complete loan portfolio overview with risk distribution and recovery metrics', icon: '📊', color: '#0d9488', fields: ['Loan ID', 'Borrower', 'Product', 'Outstanding', 'Overdue', 'DPD', 'Risk Tier', 'Risk Score', 'Region'] },
    { id: 'risk', title: 'Risk Assessment', description: 'Detailed risk scoring with default probability and recommended actions', icon: '⚠️', color: '#f59e0b', fields: ['Loan ID', 'Borrower', 'Risk Score', 'Risk Tier', 'Default Prob 30d', 'Default Prob 60d', 'Default Prob 90d', 'Best Channel', 'Best Time'] },
    { id: 'recovery', title: 'Recovery Performance', description: 'Month-over-month recovery trends and channel effectiveness', icon: '💰', color: '#16a34a', fields: ['Month', 'Recovery Amount', 'Recovery Rate', 'Contacts Made', 'Promises Obtained', 'Channel Breakdown'] },
    { id: 'compliance', title: 'Compliance Audit', description: 'RBI compliance status, violations log, and escalation records', icon: '🛡️', color: '#6366f1', fields: ['Log ID', 'Timestamp', 'Borrower', 'Agent', 'Channel', 'Outcome', 'Compliance Status', 'Rule Violations'] },
    { id: 'campaign', title: 'Campaign Performance', description: 'Campaign ROI, response rates, and A/B test results', icon: '📣', color: '#ec4899', fields: ['Campaign ID', 'Name', 'Segment', 'Channel', 'Sent', 'Delivered', 'Responded', 'Recovered Amount', 'ROI'] },
];

function generateCSV(headers: string[], rows: string[][]): string {
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    return [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
}

function downloadCSV(filename: string, csv: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

export default function ExportReports() {
    const { loanData, selectedBank } = useApp();
    const [selectedReport, setSelectedReport] = useState<ReportType>('portfolio');
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState<string | null>(null);

    const kpis = useMemo(() => computeKPIs(loanData), [loanData]);
    const report = REPORTS.find(r => r.id === selectedReport)!;

    const previewRows = useMemo(() => {
        const data = loanData.slice(0, 8);
        switch (selectedReport) {
            case 'portfolio': return data.map(d => [d.loan.loanId, d.customer.name, d.loan.product, `₹${(d.loan.outstandingAmount / 100000).toFixed(1)}L`, `₹${(d.loan.overdueAmount / 100000).toFixed(1)}L`, String(d.loan.currentDpd), d.risk.riskTier, String(d.risk.riskScore), d.customer.region]);
            case 'risk': return data.map(d => [d.loan.loanId, d.customer.name, String(d.risk.riskScore), d.risk.riskTier, `${(d.risk.defaultProbability30d * 100).toFixed(1)}%`, `${(d.risk.defaultProbability60d * 100).toFixed(1)}%`, `${(d.risk.defaultProbability90d * 100).toFixed(1)}%`, d.risk.bestChannel, d.risk.bestTime]);
            case 'recovery': return [['Sep 2024', '₹18.2L', '32%', '1,240', '380', 'WA:45% SMS:30% Call:25%'], ['Oct 2024', '₹22.5L', '36%', '1,450', '420', 'WA:48% SMS:28% Call:24%'], ['Nov 2024', '₹25.1L', '38%', '1,580', '480', 'WA:50% SMS:27% Call:23%'], ['Dec 2024', '₹28.8L', '41%', '1,720', '540', 'WA:52% SMS:25% Call:23%'], ['Jan 2025', '₹31.4L', '44%', '1,890', '620', 'WA:54% SMS:24% Call:22%'], ['Feb 2025', '₹35.2L', '47%', '2,050', '710', 'WA:55% SMS:23% Call:22%']];
            case 'compliance': return [['AUD-001', '2025-02-28 09:15', 'Rajesh K.', 'AI Bot', 'WhatsApp', 'Message Delivered', '✓ Compliant', 'None'], ['AUD-002', '2025-02-28 10:30', 'Priya S.', 'Agent #4', 'Call', 'PTP Obtained', '✓ Compliant', 'None'], ['AUD-003', '2025-02-28 11:45', 'Mohan D.', 'AI Bot', 'SMS', 'No Response', '✓ Compliant', 'None'], ['AUD-004', '2025-02-28 14:20', 'Kavitha R.', 'AI Bot', 'Email', 'Link Clicked', '✓ Compliant', 'None']];
            case 'campaign': return [['CMP-01', 'Festive Recovery', 'High Risk', 'WhatsApp', '2,400', '2,280', '840', '₹45.2L', '312%'], ['CMP-02', 'EMI Reminder', 'All', 'SMS', '5,000', '4,750', '1,200', '₹28.5L', '245%'], ['CMP-03', 'Settlement Offer', 'Critical', 'Call', '850', '680', '310', '₹62.8L', '428%']];
            default: return [];
        }
    }, [selectedReport, loanData]);

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            const allRows = selectedReport === 'portfolio'
                ? loanData.map(d => [d.loan.loanId, d.customer.name, d.loan.product, String(d.loan.outstandingAmount), String(d.loan.overdueAmount), String(d.loan.currentDpd), d.risk.riskTier, String(d.risk.riskScore), d.customer.region])
                : previewRows;
            const csv = generateCSV(report.fields, allRows);
            setGenerated(csv);
            setGenerating(false);
        }, 1200);
    };

    const handleDownload = () => {
        if (!generated) return;
        const bankName = selectedBank?.shortName || 'DhanSetu';
        downloadCSV(`${bankName}_${report.title.replace(/ /g, '_')}_${dateRange}.csv`, generated);
    };

    const accent = selectedBank?.accent || '#0d9488';

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1300, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    📋 Export & Reports
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 6 }}>
                    Generate and download detailed reports in CSV format
                </p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Records', value: loanData.length.toLocaleString(), icon: '📂', color: '#0d9488' },
                    { label: 'Portfolio Value', value: `₹${(kpis.totalOutstanding / 10000000).toFixed(1)}Cr`, icon: '💰', color: '#16a34a' },
                    { label: 'Reports Generated', value: '47', icon: '📊', color: '#6366f1' },
                    { label: 'Last Export', value: '2 hrs ago', icon: '⏱️', color: '#f59e0b' },
                ].map((s, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Space Grotesk' }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                {/* Report Selector */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Select Report Type</div>
                    {REPORTS.map(r => (
                        <button key={r.id} onClick={() => { setSelectedReport(r.id); setGenerated(null); }}
                            style={{
                                width: '100%', border: 'none', background: selectedReport === r.id ? `${r.color}10` : 'transparent',
                                padding: '14px 20px', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'flex-start',
                                borderLeft: selectedReport === r.id ? `3px solid ${r.color}` : '3px solid transparent',
                                transition: 'all 0.15s',
                            }}>
                            <span style={{ fontSize: '1.3rem' }}>{r.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: selectedReport === r.id ? r.color : '#0f172a' }}>{r.title}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.4, marginTop: 2 }}>{r.description}</div>
                            </div>
                        </button>
                    ))}

                    {/* Date Range */}
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>DATE RANGE</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {(['7d', '30d', '90d', 'all'] as const).map(d => (
                                <button key={d} onClick={() => setDateRange(d)}
                                    style={{
                                        padding: '5px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                        background: dateRange === d ? accent : 'white',
                                        color: dateRange === d ? 'white' : '#64748b',
                                        border: dateRange === d ? 'none' : '1px solid #e2e8f0',
                                    }}>
                                    {d === 'all' ? 'All Time' : `Last ${d.replace('d', ' days')}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview & Actions */}
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{report.icon} {report.title} Preview</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>Showing first {previewRows.length} rows</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleGenerate} disabled={generating}
                                style={{
                                    padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                    background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                                    color: 'white', fontWeight: 700, fontSize: '0.78rem',
                                    opacity: generating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                {generating ? '⏳ Generating...' : '✨ Generate Report'}
                            </button>
                            {generated && (
                                <button onClick={handleDownload}
                                    style={{
                                        padding: '8px 18px', borderRadius: 10, border: '1px solid #16a34a',
                                        background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}>
                                    ⬇ Download CSV
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Preview */}
                    <div style={{ overflowX: 'auto', maxHeight: 440 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                                    {report.fields.map((f, i) => (
                                        <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{f}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewRows.map((row, ri) => (
                                    <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        {row.map((cell, ci) => (
                                            <td key={ci} style={{ padding: '10px 14px', color: '#334155', whiteSpace: 'nowrap' }}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Generated success message */}
                    {generated && (
                        <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', background: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
                                Report generated successfully — {selectedReport === 'portfolio' ? loanData.length : previewRows.length} rows ready for download
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
