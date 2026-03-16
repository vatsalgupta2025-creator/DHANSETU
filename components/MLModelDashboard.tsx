'use client';
import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';

const METRICS = {
    accuracy: 94.2, precision: 91.8, recall: 89.5, f1Score: 90.6,
    auc: 0.967, gini: 0.934, ks: 42.8, logLoss: 0.148,
};

const V31_METRICS = {
    accuracy: 91.5, precision: 88.2, recall: 86.1, f1Score: 87.1,
    auc: 0.942, gini: 0.884, ks: 38.2, logLoss: 0.192,
};

const featureImportance = [
    { feature: 'DPD (Days Past Due)', importance: 0.28, prev: 0.26 },
    { feature: 'Credit Score', importance: 0.22, prev: 0.24 },
    { feature: 'Bounce Count (6m)', importance: 0.18, prev: 0.16 },
    { feature: 'Avg Balance (3m)', importance: 0.12, prev: 0.10 },
    { feature: 'EMI/Income Ratio', importance: 0.08, prev: 0.09 },
    { feature: 'Loan Tenure', importance: 0.05, prev: 0.06 },
    { feature: 'Previous Responses', importance: 0.04, prev: 0.05 },
    { feature: 'Region Factor', importance: 0.03, prev: 0.04 },
];

const confusion = { tp: 4210, fp: 380, fn: 520, tn: 4890 };

const driftData = [
    { week: 'W1', psi: 0.02, accuracy: 94.8 },
    { week: 'W2', psi: 0.03, accuracy: 94.5 },
    { week: 'W3', psi: 0.02, accuracy: 94.2 },
    { week: 'W4', psi: 0.04, accuracy: 93.8 },
    { week: 'W5', psi: 0.03, accuracy: 94.0 },
    { week: 'W6', psi: 0.05, accuracy: 93.5 },
    { week: 'W7', psi: 0.04, accuracy: 93.7 },
    { week: 'W8', psi: 0.03, accuracy: 94.1 },
];

const tierAccuracy = [
    { tier: 'Critical', predicted: 285, actual: 268, accuracy: 94, color: '#dc2626' },
    { tier: 'High', predicted: 420, actual: 388, accuracy: 92, color: '#f59e0b' },
    { tier: 'Medium', predicted: 680, actual: 645, accuracy: 95, color: '#2563eb' },
    { tier: 'Low', predicted: 615, actual: 598, accuracy: 97, color: '#16a34a' },
];

// ROC curve data
const rocData = Array.from({ length: 20 }, (_, i) => {
    const fpr = i / 19;
    const tpr = 1 - Math.pow(1 - fpr, 2.8);
    return { fpr: +(fpr * 100).toFixed(1), tpr: +(tpr * 100).toFixed(1), random: +(fpr * 100).toFixed(1) };
});

// Retraining pipeline stages
const RETRAIN_STAGES = [
    { name: 'Data Collection', icon: '📊', status: 'done' },
    { name: 'Preprocessing', icon: '🔧', status: 'done' },
    { name: 'Feature Engineering', icon: '⚙️', status: 'done' },
    { name: 'Training', icon: '🧠', status: 'active' },
    { name: 'Validation', icon: '✅', status: 'pending' },
    { name: 'Deploy', icon: '🚀', status: 'pending' },
];

const TABS = ['📊 Overview', '🔍 Features', '📈 Drift Monitor', '🎯 Tier Analysis', '📉 ROC Curve', '🎮 Scoring Simulator'];

export default function MLModelDashboard() {
    const { selectedBank } = useApp();
    const accent = selectedBank?.accent || '#0d9488';
    const [tab, setTab] = useState(0);
    const [showComparison, setShowComparison] = useState(false);

    // Scoring simulator state
    const [simDpd, setSimDpd] = useState(30);
    const [simCredit, setSimCredit] = useState(650);
    const [simBounce, setSimBounce] = useState(3);
    const [simBalance, setSimBalance] = useState(50000);
    const [simScoring, setSimScoring] = useState(false);
    const [simResult, setSimResult] = useState<{ score: number; tier: string; prob30: number; prob60: number; prob90: number } | null>(null);

    const runScoring = () => {
        setSimScoring(true);
        setSimResult(null);
        setTimeout(() => {
            const dpdFactor = Math.min(simDpd / 90, 1) * 0.35;
            const creditFactor = (1 - Math.min(simCredit - 300, 550) / 550) * 0.25;
            const bounceFactor = Math.min(simBounce / 10, 1) * 0.2;
            const balanceFactor = (1 - Math.min(simBalance, 200000) / 200000) * 0.15;
            const raw = (dpdFactor + creditFactor + bounceFactor + balanceFactor + 0.05) * 100;
            const score = Math.min(Math.max(Math.round(raw), 5), 98);
            const tier = score >= 80 ? 'Critical' : score >= 60 ? 'High' : score >= 35 ? 'Medium' : 'Low';
            const prob30 = Math.min(score * 0.85, 95);
            const prob60 = Math.min(score * 0.72, 88);
            const prob90 = Math.min(score * 0.58, 78);
            setSimResult({ score, tier, prob30, prob60, prob90 });
            setSimScoring(false);
        }, 1500);
    };

    const healthChecks = [
        { label: 'Accuracy', value: METRICS.accuracy, threshold: 90, unit: '%' },
        { label: 'Drift (PSI)', value: driftData[driftData.length - 1].psi, threshold: 0.1, unit: '', invert: true },
        { label: 'Latency', value: 45, threshold: 100, unit: 'ms', invert: true },
        { label: 'Coverage', value: 99.2, threshold: 95, unit: '%' },
    ];

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>🧠 ML Model Dashboard</h1>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 6 }}>XGBoost risk model performance, monitoring, and live scoring</p>
                </div>
                <button onClick={() => setShowComparison(!showComparison)}
                    style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${showComparison ? accent : '#e2e8f0'}`, background: showComparison ? `${accent}10` : 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: showComparison ? accent : '#64748b' }}>
                    {showComparison ? '✓ Comparing v3.1' : '⚖️ Compare v3.1'}
                </button>
            </div>

            {/* Model Info + Health */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 24 }}>
                <div style={{ background: `linear-gradient(135deg, ${accent}10, ${accent}05)`, borderRadius: 14, padding: '16px 20px', border: `1px solid ${accent}25`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div><span style={{ fontSize: '0.65rem', color: '#64748b' }}>Model</span><div style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Space Grotesk' }}>XGBoost v3.2</div></div>
                        <div><span style={{ fontSize: '0.65rem', color: '#64748b' }}>Training Data</span><div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>125,000 records</div></div>
                        <div><span style={{ fontSize: '0.65rem', color: '#64748b' }}>Last Trained</span><div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Feb 28, 2025</div></div>
                        <div><span style={{ fontSize: '0.65rem', color: '#64748b' }}>Features</span><div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>24 features</div></div>
                    </div>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', animation: 'pulseDot 2s infinite' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>Production</span>
                    </div>
                </div>
                {/* Health indicators */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {healthChecks.map(h => {
                        const ok = h.invert ? h.value < h.threshold : h.value >= h.threshold;
                        return (
                            <div key={h.label} style={{ background: 'white', borderRadius: 12, padding: '10px 14px', border: '1px solid #e2e8f0', textAlign: 'center', minWidth: 80 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ok ? '#16a34a' : '#dc2626', margin: '0 auto 4px', animation: ok ? 'none' : 'pulseDot 1.5s infinite' }} />
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: ok ? '#16a34a' : '#dc2626', fontFamily: 'Space Grotesk' }}>{typeof h.value === 'number' && h.value < 1 ? h.value.toFixed(3) : h.value}{h.unit}</div>
                                <div style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 600 }}>{h.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Retraining Pipeline */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 0 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginRight: 16, flexShrink: 0 }}>Retrain Pipeline:</div>
                {RETRAIN_STAGES.map((s, i) => (
                    <React.Fragment key={s.name}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                                background: s.status === 'done' ? '#dcfce7' : s.status === 'active' ? `${accent}15` : '#f8fafc',
                                border: s.status === 'active' ? `2px solid ${accent}` : '1px solid #e2e8f0',
                                animation: s.status === 'active' ? 'pulseRing 2s infinite' : 'none',
                            }}>{s.status === 'done' ? '✓' : s.icon}</div>
                            <div style={{ fontSize: '0.62rem', fontWeight: s.status === 'active' ? 700 : 500, color: s.status === 'pending' ? '#94a3b8' : '#0f172a' }}>{s.name}</div>
                        </div>
                        {i < RETRAIN_STAGES.length - 1 && (
                            <div style={{ width: 24, height: 2, background: s.status === 'done' ? '#16a34a' : '#e2e8f0', flexShrink: 0 }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
                {TABS.map((t, i) => (
                    <button key={i} onClick={() => setTab(i)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, background: tab === i ? accent : '#f1f5f9', color: tab === i ? 'white' : '#64748b', transition: 'all 0.15s' }}>{t}</button>
                ))}
            </div>

            {tab === 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Metrics */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>Performance Metrics {showComparison && '(v3.2 vs v3.1)'}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {Object.entries(METRICS).map(([k, v]) => {
                                const prev = V31_METRICS[k as keyof typeof V31_METRICS];
                                const improved = typeof v === 'number' && typeof prev === 'number' && (k === 'logLoss' ? v < prev : v > prev);
                                return (
                                    <div key={k} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{k.replace(/([A-Z])/g, ' $1')}</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                                            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: v > 90 || (typeof v === 'number' && v < 1 && v > 0.9) ? '#16a34a' : v > 80 ? accent : '#f59e0b', fontFamily: 'Space Grotesk' }}>
                                                {typeof v === 'number' && v < 1 ? v.toFixed(3) : `${v}%`}
                                            </span>
                                            {showComparison && (
                                                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: improved ? '#16a34a' : '#dc2626' }}>
                                                    {improved ? '↑' : '↓'} {typeof prev === 'number' && prev < 1 ? prev.toFixed(3) : `${prev}%`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Confusion Matrix */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>Confusion Matrix</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gridTemplateRows: '30px 1fr 1fr', gap: 6 }}>
                            <div /><div style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>Pred Positive</div><div style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>Pred Negative</div>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>Act Positive</div>
                            <div style={{ background: '#dcfce7', borderRadius: 12, padding: 18, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', fontFamily: 'Space Grotesk' }}>{confusion.tp}</div>
                                <div style={{ fontSize: '0.58rem', color: '#64748b' }}>True Positive</div>
                            </div>
                            <div style={{ background: '#fef2f2', borderRadius: 12, padding: 18, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626', fontFamily: 'Space Grotesk' }}>{confusion.fn}</div>
                                <div style={{ fontSize: '0.58rem', color: '#64748b' }}>False Negative</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>Act Negative</div>
                            <div style={{ background: '#fef2f2', borderRadius: 12, padding: 18, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626', fontFamily: 'Space Grotesk' }}>{confusion.fp}</div>
                                <div style={{ fontSize: '0.58rem', color: '#64748b' }}>False Positive</div>
                            </div>
                            <div style={{ background: '#dcfce7', borderRadius: 12, padding: 18, textAlign: 'center' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', fontFamily: 'Space Grotesk' }}>{confusion.tn}</div>
                                <div style={{ fontSize: '0.58rem', color: '#64748b' }}>True Negative</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 1 && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>Feature Importance (SHAP Values) {showComparison && '— v3.2 vs v3.1'}</div>
                    <ResponsiveContainer width="100%" height={380}>
                        <BarChart data={featureImportance} layout="vertical" margin={{ left: 140 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} width={130} />
                            <Tooltip />
                            <Bar dataKey="importance" fill={accent} radius={[0, 6, 6, 0]} name="v3.2" />
                            {showComparison && <Bar dataKey="prev" fill="#94a3b8" radius={[0, 6, 6, 0]} name="v3.1" />}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {tab === 2 && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>Model Drift Monitoring (PSI & Accuracy)</div>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={driftData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[90, 96]} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 0.1]} />
                            <Tooltip />
                            <Area yAxisId="left" type="monotone" dataKey="accuracy" stroke={accent} fill={`${accent}20`} strokeWidth={2} name="Accuracy %" />
                            <Area yAxisId="right" type="monotone" dataKey="psi" stroke="#f59e0b" fill="#fef3c720" strokeWidth={2} name="PSI" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                        <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>PSI &lt; 0.1 — No significant drift detected. Model is stable.</span>
                    </div>
                </div>
            )}

            {tab === 3 && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>Prediction Accuracy by Risk Tier</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead><tr style={{ background: '#f8fafc' }}>
                            {['Risk Tier', 'Predicted', 'Actual', 'Accuracy', 'Performance'].map(h => <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>{tierAccuracy.map(t => (
                            <tr key={t.tier} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '14px 20px' }}><span style={{ padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontSize: '0.75rem', background: `${t.color}12`, color: t.color }}>{t.tier}</span></td>
                                <td style={{ padding: '14px 20px', fontWeight: 600 }}>{t.predicted}</td>
                                <td style={{ padding: '14px 20px', fontWeight: 600 }}>{t.actual}</td>
                                <td style={{ padding: '14px 20px', fontWeight: 800, color: t.accuracy >= 95 ? '#16a34a' : '#f59e0b', fontFamily: 'Space Grotesk' }}>{t.accuracy}%</td>
                                <td style={{ padding: '14px 20px' }}><div style={{ width: 120, height: 7, borderRadius: 4, background: '#f1f5f9' }}><div style={{ width: `${t.accuracy}%`, height: '100%', borderRadius: 4, background: t.accuracy >= 95 ? '#16a34a' : '#f59e0b', transition: 'width 0.5s' }} /></div></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {tab === 4 && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>ROC Curve — Receiver Operating Characteristic</div>
                        <div style={{ background: `${accent}10`, border: `1px solid ${accent}30`, borderRadius: 8, padding: '6px 14px', fontWeight: 800, fontSize: '0.85rem', color: accent, fontFamily: 'Space Grotesk' }}>
                            AUC = {METRICS.auc}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={360}>
                        <AreaChart data={rocData} margin={{ bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="fpr" tick={{ fontSize: 11 }} label={{ value: 'False Positive Rate (%)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#94a3b8' } }} />
                            <YAxis tick={{ fontSize: 11 }} label={{ value: 'True Positive Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }} domain={[0, 100]} />
                            <Tooltip />
                            <Area type="monotone" dataKey="tpr" stroke={accent} fill={`${accent}18`} strokeWidth={3} name="Model (AUC=0.967)" dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="random" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="8 4" name="Random (AUC=0.5)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {tab === 5 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* Input */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 4 }}>🎮 Live Scoring Simulator</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 20 }}>Adjust borrower parameters to see predicted risk score in real-time</div>
                        {[
                            { label: 'Days Past Due (DPD)', value: simDpd, set: setSimDpd, min: 0, max: 180, color: simDpd > 60 ? '#dc2626' : simDpd > 30 ? '#f59e0b' : '#16a34a' },
                            { label: 'Credit Score (CIBIL)', value: simCredit, set: setSimCredit, min: 300, max: 850, color: simCredit > 700 ? '#16a34a' : simCredit > 550 ? '#f59e0b' : '#dc2626' },
                            { label: 'Bounce Count (6 months)', value: simBounce, set: setSimBounce, min: 0, max: 12, color: simBounce > 5 ? '#dc2626' : simBounce > 2 ? '#f59e0b' : '#16a34a' },
                            { label: 'Avg Bank Balance (₹)', value: simBalance, set: setSimBalance, min: 0, max: 500000, color: simBalance > 100000 ? '#16a34a' : simBalance > 30000 ? '#f59e0b' : '#dc2626' },
                        ].map(p => (
                            <div key={p.label} style={{ marginBottom: 18 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{p.label}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: p.color, fontFamily: 'Space Grotesk' }}>
                                        {p.label.includes('₹') ? `₹${p.value.toLocaleString()}` : p.value}
                                    </span>
                                </div>
                                <input type="range" min={p.min} max={p.max} value={p.value} onChange={e => p.set(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: p.color, height: 6 }} />
                            </div>
                        ))}
                        <button onClick={runScoring} disabled={simScoring}
                            style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: simScoring ? '#94a3b8' : accent, color: 'white', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                            {simScoring ? '⏳ Scoring...' : '🧠 Run XGBoost Prediction'}
                        </button>
                    </div>
                    {/* Result */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                        {!simResult && !simScoring ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Adjust parameters and run prediction</div>
                                <div style={{ fontSize: '0.78rem', marginTop: 6 }}>The XGBoost model will calculate a risk score based on the input features</div>
                            </div>
                        ) : simScoring ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'pulse 1s infinite' }}>🧠</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Running XGBoost Model...</div>
                                <div style={{ width: '60%', height: 6, borderRadius: 3, background: '#f1f5f9', margin: '16px auto', overflow: 'hidden' }}>
                                    <div style={{ width: '100%', height: '100%', background: accent, animation: 'shimmer 1.2s infinite' }} />
                                </div>
                            </div>
                        ) : simResult && (
                            <div style={{ animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: simResult.score >= 80 ? '#dc2626' : simResult.score >= 60 ? '#f59e0b' : simResult.score >= 35 ? '#2563eb' : '#16a34a', fontFamily: 'Space Grotesk' }}>{simResult.score}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Risk Score</div>
                                    <span style={{
                                        display: 'inline-block', marginTop: 8, padding: '4px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem',
                                        background: simResult.tier === 'Critical' ? '#fef2f2' : simResult.tier === 'High' ? '#fef3c7' : simResult.tier === 'Medium' ? '#dbeafe' : '#dcfce7',
                                        color: simResult.tier === 'Critical' ? '#dc2626' : simResult.tier === 'High' ? '#d97706' : simResult.tier === 'Medium' ? '#2563eb' : '#16a34a',
                                    }}>{simResult.tier} Risk</span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', marginBottom: 12 }}>Default Probability Forecast</div>
                                {[
                                    { label: '30-Day Default', prob: simResult.prob30 },
                                    { label: '60-Day Default', prob: simResult.prob60 },
                                    { label: '90-Day Default', prob: simResult.prob90 },
                                ].map(f => (
                                    <div key={f.label} style={{ marginBottom: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                                            <span style={{ color: '#64748b', fontWeight: 600 }}>{f.label}</span>
                                            <span style={{ fontWeight: 800, color: f.prob > 70 ? '#dc2626' : f.prob > 40 ? '#f59e0b' : '#16a34a', fontFamily: 'Space Grotesk' }}>{f.prob.toFixed(1)}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: 8, borderRadius: 4, background: '#f1f5f9' }}>
                                            <div style={{ width: `${f.prob}%`, height: '100%', borderRadius: 4, background: f.prob > 70 ? '#dc2626' : f.prob > 40 ? '#f59e0b' : '#16a34a', transition: 'width 0.6s ease' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulseDot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
                @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 currentColor; } 70% { box-shadow: 0 0 0 6px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.15); } }
                @keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
            `}</style>
        </div>
    );
}
