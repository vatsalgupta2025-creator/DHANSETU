'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';

interface SentimentRecord { id: string; borrower: string; channel: string; message: string; sentiment: 'positive' | 'neutral' | 'negative' | 'distressed'; score: number; keywords: string[]; recommendation: string; time: string; language: string; }

const SAMPLE_DATA: SentimentRecord[] = [
    { id: 'S01', borrower: 'Rajesh Kumar', channel: 'WhatsApp', message: 'I understand the payment is due. Will transfer by Friday.', sentiment: 'positive', score: 0.82, keywords: ['understand', 'will transfer', 'Friday'], recommendation: 'Send confirmation and payment link', time: '10:30 AM', language: 'English' },
    { id: 'S02', borrower: 'Priya Sharma', channel: 'Call', message: 'I lost my job last month. Cannot pay right now. Need some time.', sentiment: 'distressed', score: 0.91, keywords: ['lost job', 'cannot pay', 'need time'], recommendation: 'Offer restructuring plan + human agent review', time: '11:15 AM', language: 'Hindi' },
    { id: 'S03', borrower: 'Anil Patel', channel: 'SMS', message: 'OK noted', sentiment: 'neutral', score: 0.65, keywords: ['noted'], recommendation: 'Follow up in 3 days with payment options', time: '11:45 AM', language: 'English' },
    { id: 'S04', borrower: 'Sunita Devi', channel: 'WhatsApp', message: 'Stop sending messages! I already told you I will not pay this fraud amount!', sentiment: 'negative', score: 0.88, keywords: ['stop', 'fraud', 'will not pay'], recommendation: 'Escalate to compliance — potential dispute case', time: '12:00 PM', language: 'Hindi' },
    { id: 'S05', borrower: 'Mohan Das', channel: 'Call', message: 'My wife is in hospital. Medical expenses are too high. Please reduce the EMI.', sentiment: 'distressed', score: 0.95, keywords: ['hospital', 'medical expenses', 'reduce EMI'], recommendation: 'Immediate human escalation — hardship case', time: '02:30 PM', language: 'English' },
    { id: 'S06', borrower: 'Kavitha R.', channel: 'Email', message: 'Thank you for the settlement offer. I accept the terms and will pay tomorrow.', sentiment: 'positive', score: 0.94, keywords: ['thank you', 'accept', 'pay tomorrow'], recommendation: 'Send payment confirmation link immediately', time: '03:00 PM', language: 'Tamil' },
    { id: 'S07', borrower: 'Suresh Nair', channel: 'WhatsApp', message: 'What is the total outstanding? Can you send the statement?', sentiment: 'neutral', score: 0.58, keywords: ['outstanding', 'statement'], recommendation: 'Send account statement and payment options', time: '03:45 PM', language: 'Malayalam' },
    { id: 'S08', borrower: 'Fatima Sheikh', channel: 'Call', message: 'This is harassment. I will complaint to RBI if you call again.', sentiment: 'negative', score: 0.92, keywords: ['harassment', 'RBI', 'complaint'], recommendation: 'Immediate halt — mark DNC, compliance review', time: '04:15 PM', language: 'Urdu' },
    { id: 'S09', borrower: 'Deepak Verma', channel: 'WhatsApp', message: 'I will pay next week. Can you give me 5 more days?', sentiment: 'positive', score: 0.72, keywords: ['will pay', 'next week', '5 days'], recommendation: 'Set PTP reminder for 5 days, confirm via WhatsApp', time: '04:45 PM', language: 'Hindi' },
    { id: 'S10', borrower: 'Lakshmi Iyer', channel: 'Email', message: 'I have already paid this EMI on March 1. Please check again and stop these notices.', sentiment: 'negative', score: 0.78, keywords: ['already paid', 'check again', 'stop notices'], recommendation: 'Cross-verify payment records, pause communication', time: '05:10 PM', language: 'Tamil' },
];

const SCOL: Record<string, { bg: string; text: string; icon: string }> = {
    positive: { bg: '#dcfce7', text: '#16a34a', icon: '😊' },
    neutral: { bg: '#f1f5f9', text: '#64748b', icon: '😐' },
    negative: { bg: '#fef2f2', text: '#dc2626', icon: '😠' },
    distressed: { bg: '#fef3c7', text: '#d97706', icon: '😰' },
};

const TREND_DATA = [
    { day: 'Mon', positive: 12, neutral: 8, negative: 4, distressed: 2 },
    { day: 'Tue', positive: 15, neutral: 10, negative: 3, distressed: 3 },
    { day: 'Wed', positive: 10, neutral: 12, negative: 6, distressed: 4 },
    { day: 'Thu', positive: 18, neutral: 7, negative: 5, distressed: 1 },
    { day: 'Fri', positive: 14, neutral: 9, negative: 8, distressed: 5 },
    { day: 'Sat', positive: 8, neutral: 6, negative: 2, distressed: 1 },
    { day: 'Sun', positive: 4, neutral: 3, negative: 1, distressed: 0 },
];

function analyzeSentiment(text: string): { sentiment: 'positive' | 'neutral' | 'negative' | 'distressed'; score: number; keywords: string[]; recommendation: string; language: string } {
    const lower = text.toLowerCase();
    const negativeWords = ['stop', 'fraud', 'harassment', 'complaint', 'rbi', 'cheat', 'illegal', 'refuse', 'never', 'scam', 'police'];
    const positiveWords = ['pay', 'transfer', 'agree', 'accept', 'thank', 'settle', 'understand', 'will', 'tomorrow', 'friday', 'ok'];
    const distressedWords = ['hospital', 'lost job', 'medical', 'death', 'accident', 'cannot', 'emergency', 'help', 'beg', 'please', 'reduce'];

    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const distCount = distressedWords.filter(w => lower.includes(w)).length;

    const allFound = [...negativeWords, ...positiveWords, ...distressedWords].filter(w => lower.includes(w));

    let sentiment: 'positive' | 'neutral' | 'negative' | 'distressed' = 'neutral';
    let score = 0.5;
    let recommendation = 'Monitor — continue standard follow-up';

    if (distCount > 0 && distCount >= negCount) {
        sentiment = 'distressed'; score = 0.7 + distCount * 0.08;
        recommendation = 'Escalate to human agent — potential hardship case. Offer restructuring.';
    } else if (negCount > posCount) {
        sentiment = 'negative'; score = 0.65 + negCount * 0.1;
        recommendation = 'Pause communication. Escalate to compliance for review.';
    } else if (posCount > 0) {
        sentiment = 'positive'; score = 0.6 + posCount * 0.08;
        recommendation = 'Send payment link. Set PTP reminder. Track commitment.';
    } else {
        score = 0.5 + Math.random() * 0.15;
        recommendation = 'Follow up in 2-3 days with additional context.';
    }

    return { sentiment, score: Math.min(score, 0.98), keywords: allFound.slice(0, 5), recommendation, language: 'Auto-Detected' };
}

function ArcGauge({ value, size = 90, color }: { value: number; size?: number; color: string }) {
    const r = (size - 10) / 2;
    const c = Math.PI * r;
    const pct = Math.min(value, 1);
    return (
        <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
            <path d={`M 5 ${size / 2 + 2} A ${r} ${r} 0 0 1 ${size - 5} ${size / 2 + 2}`} fill="none" stroke="#f1f5f9" strokeWidth={8} strokeLinecap="round" />
            <path d={`M 5 ${size / 2 + 2} A ${r} ${r} 0 0 1 ${size - 5} ${size / 2 + 2}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={`${c * pct} ${c * (1 - pct)}`} style={{ transition: 'stroke-dasharray 0.6s ease' }} />
            <text x={size / 2} y={size / 2 - 2} textAnchor="middle" style={{ fontSize: size * 0.22, fontWeight: 800, fill: color, fontFamily: 'Space Grotesk' }}>
                {(pct * 100).toFixed(0)}%
            </text>
            <text x={size / 2} y={size / 2 + 10} textAnchor="middle" style={{ fontSize: size * 0.1, fill: '#94a3b8' }}>confidence</text>
        </svg>
    );
}

export default function SentimentAnalyzer() {
    const { selectedBank } = useApp();
    const accent = selectedBank?.accent || '#0d9488';
    const [selRecord, setSelRecord] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [tab, setTab] = useState<'records' | 'live' | 'trends'>('records');

    // Live analysis state
    const [liveInput, setLiveInput] = useState('');
    const [liveResult, setLiveResult] = useState<ReturnType<typeof analyzeSentiment> | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [typingText, setTypingText] = useState('');
    const typingRef = useRef<NodeJS.Timeout | null>(null);

    const handleLiveAnalyze = () => {
        if (!liveInput.trim()) return;
        setAnalyzing(true);
        setLiveResult(null);
        setTypingText('');
        setTimeout(() => {
            const result = analyzeSentiment(liveInput);
            setLiveResult(result);
            setAnalyzing(false);
            // Typing animation for recommendation
            const rec = result.recommendation;
            let i = 0;
            typingRef.current && clearInterval(typingRef.current);
            typingRef.current = setInterval(() => {
                if (i <= rec.length) { setTypingText(rec.slice(0, i)); i++; }
                else typingRef.current && clearInterval(typingRef.current);
            }, 18);
        }, 1200);
    };

    useEffect(() => () => { typingRef.current && clearInterval(typingRef.current); }, []);

    const pieData = useMemo(() => [
        { name: 'Positive', value: SAMPLE_DATA.filter(d => d.sentiment === 'positive').length, color: '#16a34a' },
        { name: 'Neutral', value: SAMPLE_DATA.filter(d => d.sentiment === 'neutral').length, color: '#94a3b8' },
        { name: 'Negative', value: SAMPLE_DATA.filter(d => d.sentiment === 'negative').length, color: '#dc2626' },
        { name: 'Distressed', value: SAMPLE_DATA.filter(d => d.sentiment === 'distressed').length, color: '#d97706' },
    ], []);

    const channelSent = useMemo(() => [
        { channel: 'WhatsApp', positive: 2, neutral: 1, negative: 1, distressed: 0 },
        { channel: 'Call', positive: 0, neutral: 0, negative: 1, distressed: 2 },
        { channel: 'SMS', positive: 0, neutral: 1, negative: 0, distressed: 0 },
        { channel: 'Email', positive: 1, neutral: 0, negative: 1, distressed: 0 },
    ], []);

    // Word cloud data
    const wordCloud = useMemo(() => {
        const freq: Record<string, number> = {};
        SAMPLE_DATA.forEach(d => d.keywords.forEach(k => { freq[k] = (freq[k] || 0) + 1; }));
        return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 18);
    }, []);
    const maxFreq = Math.max(...wordCloud.map(w => w[1]), 1);

    const filtered = filter === 'all' ? SAMPLE_DATA : SAMPLE_DATA.filter(d => d.sentiment === filter);
    const selected = selRecord ? SAMPLE_DATA.find(d => d.id === selRecord) : null;

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>💭 Sentiment Analyzer</h1>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 6 }}>AI-powered borrower response analysis with real-time scoring and recommended actions</p>
                </div>
                <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
                    {(['records', 'live', 'trends'] as const).map(v => (
                        <button key={v} onClick={() => setTab(v)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: tab === v ? 'white' : 'transparent', color: tab === v ? accent : '#64748b', boxShadow: tab === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                            {v === 'records' ? '📋 Records' : v === 'live' ? '🔬 Live Analysis' : '📈 Trends'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                {Object.entries(SCOL).map(([sent, cfg]) => {
                    const count = SAMPLE_DATA.filter(d => d.sentiment === sent).length;
                    const avgScore = count > 0 ? SAMPLE_DATA.filter(d => d.sentiment === sent).reduce((s, d) => s + d.score, 0) / count : 0;
                    return (
                        <div key={sent} onClick={() => setFilter(filter === sent ? 'all' : sent)} style={{
                            background: 'white', borderRadius: 14, padding: '16px 18px',
                            border: filter === sent ? `2px solid ${cfg.text}` : '1px solid #e2e8f0',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '1.5rem' }}>{cfg.icon}</span>
                                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a', marginTop: 4, textTransform: 'capitalize' }}>{sent}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: cfg.text, fontFamily: 'Space Grotesk' }}>{count}</div>
                                    <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Avg: {(avgScore * 100).toFixed(0)}%</div>
                                </div>
                            </div>
                            <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#f1f5f9', marginTop: 8 }}>
                                <div style={{ width: `${(count / SAMPLE_DATA.length) * 100}%`, height: '100%', borderRadius: 2, background: cfg.text, transition: 'width 0.4s' }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {tab === 'records' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                        {/* Pie Chart */}
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>Sentiment Distribution</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie><Tooltip /></PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Channel Breakdown + Word Cloud */}
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>Keyword Cloud</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', padding: '10px 0', minHeight: 100 }}>
                                {wordCloud.map(([word, freq]) => {
                                    const size = 0.65 + (freq / maxFreq) * 0.7;
                                    const isNeg = ['stop', 'fraud', 'harassment', 'complaint', 'rbi', 'will not pay', 'stop notices'].includes(word);
                                    const isDist = ['lost job', 'cannot pay', 'need time', 'hospital', 'medical expenses', 'reduce EMI'].includes(word);
                                    const color = isNeg ? '#dc2626' : isDist ? '#d97706' : '#16a34a';
                                    return (
                                        <span key={word} style={{
                                            fontSize: `${size}rem`, fontWeight: 600 + freq * 100, color,
                                            padding: '3px 10px', borderRadius: 6, background: `${color}08`,
                                            display: 'inline-block', transition: 'transform 0.15s',
                                            cursor: 'default',
                                        }}
                                            title={`Frequency: ${freq}`}
                                        >{word}</span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Records List */}
                    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>Recent Responses ({filtered.length})</div>
                            {filtered.map(r => {
                                const c = SCOL[r.sentiment];
                                return (
                                    <div key={r.id} onClick={() => setSelRecord(selRecord === r.id ? null : r.id)} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: selRecord === r.id ? `${accent}05` : 'white', transition: 'background 0.15s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span>{c.icon}</span>
                                                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{r.borrower}</span>
                                                <span style={{ fontSize: '0.6rem', color: '#94a3b8', background: '#f8fafc', padding: '1px 6px', borderRadius: 4 }}>{r.channel}</span>
                                                <span style={{ fontSize: '0.55rem', color: '#94a3b8', background: '#f8fafc', padding: '1px 6px', borderRadius: 4 }}>🌐 {r.language}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{r.time}</span>
                                                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 6, fontWeight: 700, background: c.bg, color: c.text, textTransform: 'capitalize' }}>{r.sentiment}</span>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.4 }}>"{r.message}"</div>
                                    </div>
                                );
                            })}
                        </div>

                        {selected && (
                            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'slideIn 0.25s ease' }}>
                                <div style={{ padding: '20px', background: SCOL[selected.sentiment].bg, textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>{SCOL[selected.sentiment].icon}</div>
                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: SCOL[selected.sentiment].text, textTransform: 'capitalize' }}>{selected.sentiment}</div>
                                    <ArcGauge value={selected.score} size={100} color={SCOL[selected.sentiment].text} />
                                </div>
                                <div style={{ padding: '16px 20px' }}>
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                                            <span>LANGUAGE</span>
                                            <span style={{ color: accent }}>{selected.language}</span>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>KEYWORDS DETECTED</div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{selected.keywords.map(k => <span key={k} style={{ padding: '3px 10px', borderRadius: 6, background: '#f1f5f9', fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>{k}</span>)}</div>
                                    </div>
                                    <div style={{ background: `${accent}08`, borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${accent}` }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: accent, marginBottom: 4 }}>🤖 AI RECOMMENDATION</div>
                                        <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>{selected.recommendation}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {tab === 'live' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* Input */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 4 }}>🔬 Real-Time Sentiment Analysis</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 16 }}>Paste or type a borrower response to analyze sentiment instantly</div>
                        <textarea
                            value={liveInput} onChange={e => setLiveInput(e.target.value)}
                            placeholder="e.g. &quot;I lost my job and cannot pay the EMI this month. Please give me some time...&quot;"
                            style={{
                                width: '100%', minHeight: 160, borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 16px',
                                fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none',
                                lineHeight: 1.5, transition: 'border 0.15s',
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = accent}
                            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{liveInput.length} characters</span>
                            <button onClick={handleLiveAnalyze} disabled={!liveInput.trim() || analyzing}
                                style={{
                                    padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                    background: analyzing ? '#94a3b8' : accent, color: 'white', fontWeight: 700, fontSize: '0.85rem',
                                    opacity: liveInput.trim() ? 1 : 0.5, transition: 'all 0.15s',
                                }}>
                                {analyzing ? '⏳ Analyzing...' : '🧠 Analyze Sentiment'}
                            </button>
                        </div>
                    </div>

                    {/* Result */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                        {!liveResult && !analyzing ? (
                            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>💭</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Enter text to analyze</div>
                                <div style={{ fontSize: '0.78rem', marginTop: 6 }}>Results will appear here with sentiment scoring, keywords, and AI recommendations</div>
                            </div>
                        ) : analyzing ? (
                            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'pulse 1s infinite' }}>🧠</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Processing with NLP Engine...</div>
                                <div style={{ width: '60%', height: 6, borderRadius: 3, background: '#f1f5f9', margin: '16px auto', overflow: 'hidden' }}>
                                    <div style={{ width: '100%', height: '100%', background: accent, animation: 'shimmer 1.2s infinite' }} />
                                </div>
                            </div>
                        ) : liveResult && (
                            <div style={{ animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>{SCOL[liveResult.sentiment].icon}</div>
                                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: SCOL[liveResult.sentiment].text, textTransform: 'capitalize', fontFamily: 'Space Grotesk' }}>{liveResult.sentiment}</div>
                                    <ArcGauge value={liveResult.score} size={110} color={SCOL[liveResult.sentiment].text} />
                                </div>
                                {liveResult.keywords.length > 0 && (
                                    <div style={{ marginBottom: 14 }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>DETECTED KEYWORDS</div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {liveResult.keywords.map(k => <span key={k} style={{ padding: '4px 10px', borderRadius: 6, background: `${SCOL[liveResult.sentiment].bg}`, fontSize: '0.75rem', fontWeight: 600, color: SCOL[liveResult.sentiment].text }}>{k}</span>)}
                                        </div>
                                    </div>
                                )}
                                <div style={{ background: `${accent}08`, borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${accent}` }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: accent, marginBottom: 4 }}>🤖 AI RECOMMENDATION</div>
                                    <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>{typingText}<span style={{ opacity: typingText.length < (liveResult.recommendation?.length || 0) ? 1 : 0 }}>|</span></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'trends' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Daily Trend */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>Sentiment Trend (This Week)</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={TREND_DATA}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="positive" stackId="1" stroke="#16a34a" fill="#dcfce7" name="Positive" />
                                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#94a3b8" fill="#f1f5f9" name="Neutral" />
                                <Area type="monotone" dataKey="negative" stackId="1" stroke="#dc2626" fill="#fef2f2" name="Negative" />
                                <Area type="monotone" dataKey="distressed" stackId="1" stroke="#d97706" fill="#fef3c7" name="Distressed" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Channel Breakdown */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 20 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>Sentiment by Channel</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={channelSent}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="positive" fill="#16a34a" stackId="a" name="Positive" />
                                <Bar dataKey="neutral" fill="#94a3b8" stackId="a" name="Neutral" />
                                <Bar dataKey="negative" fill="#dc2626" stackId="a" name="Negative" />
                                <Bar dataKey="distressed" fill="#d97706" stackId="a" name="Distressed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.15); } }
                @keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
            `}</style>
        </div>
    );
}
