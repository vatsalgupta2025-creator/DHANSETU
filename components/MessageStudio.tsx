'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { generateMessage, messageTemplates } from '@/lib/data';

const LANGUAGES = [
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🏳️' },
    { code: 'te', name: 'Telugu', flag: '🏳️' },
    { code: 'mr', name: 'Marathi', flag: '🏳️' },
    { code: 'bn', name: 'Bengali', flag: '🏳️' },
    { code: 'kn', name: 'Kannada', flag: '🏳️' },
    { code: 'gu', name: 'Gujarati', flag: '🏳️' },
    { code: 'pa', name: 'Punjabi', flag: '🏳️' },
    { code: 'ml', name: 'Malayalam', flag: '🏳️' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
];
const TONES = [
    { id: 'empathetic', label: 'Empathetic', desc: '1st miss / financial difficulty', color: '#16a34a', emoji: '🤝' },
    { id: 'urgent', label: 'Urgent', desc: 'Repeat offender / 30+ DPD', color: '#d97706', emoji: '⚠️' },
    { id: 'firm', label: 'Firm', desc: 'Final notice / 60+ DPD', color: '#dc2626', emoji: '🚨' },
];
const CHANNELS = [
    { id: 'whatsapp', label: 'WhatsApp', icon: '📱', limit: 400 },
    { id: 'sms', label: 'SMS', icon: '💬', limit: 160 },
    { id: 'email', label: 'Email', icon: '✉️', limit: 500 },
    { id: 'ivr', label: 'IVR Script', icon: '📞', limit: 300 },
];

function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        const timer = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) { clearInterval(timer); setDone(true); }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return (
        <span>
            {displayed}
            {!done && <span style={{ opacity: 0.6, animation: 'pulse 0.8s infinite' }}>|</span>}
        </span>
    );
}

export default function MessageStudio() {
    const { loanData, selectedRecord: preselected, setSelectedRecord, appLanguage } = useApp();
    const lang: any = appLanguage?.code || 'en-IN';
    const [selectedId, setSelectedId] = useState<string | null>(preselected?.customer.id || null);
    const [language, setLanguage] = useState(preselected?.customer.language || 'hi');
    const [tone, setTone] = useState<'empathetic' | 'urgent' | 'firm'>(
        preselected ? (preselected.loan.currentDpd > 60 ? 'firm' : preselected.loan.currentDpd > 30 ? 'urgent' : 'empathetic') : 'empathetic'
    );
    const [channel, setChannel] = useState('whatsapp');
    const [generating, setGenerating] = useState(false);
    const [messages, setMessages] = useState<{ tone: string; text: string; lang: string }[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const [searchQ, setSearchQ] = useState('');

    // When preselected changes externally
    useEffect(() => {
        if (preselected) {
            setSelectedId(preselected.customer.id);
            setLanguage(preselected.customer.language);
            setTone(preselected.loan.currentDpd > 60 ? 'firm' : preselected.loan.currentDpd > 30 ? 'urgent' : 'empathetic');
        }
    }, [preselected]);

    const record = useMemo(() => {
        if (selectedId) return loanData.find(r => r.customer.id === selectedId) || null;
        return null;
    }, [selectedId, loanData]);

    const filteredAccounts = useMemo(() => {
        return loanData.filter(r =>
            r.customer.name.toLowerCase().includes(searchQ.toLowerCase()) ||
            r.customer.id.toLowerCase().includes(searchQ.toLowerCase())
        ).slice(0, 30);
    }, [loanData, searchQ]);

    function handleGenerate() {
        if (!record) return;
        setGenerating(true);
        setMessages([]);
        setTimeout(() => {
            const tones: Array<'empathetic' | 'urgent' | 'firm'> = ['empathetic', 'urgent', 'firm'];
            const generated = tones.map(t => ({
                tone: t,
                text: generateMessage(record.customer.name, record.loan.overdueAmount, record.loan.currentDpd, language, t),
                lang: language,
            }));
            setMessages(generated);
            setGenerating(false);
        }, 1800);
    }

    function copyToClipboard(text: string, id: string) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        });
    }

    const selectedChannel = CHANNELS.find(c => c.id === channel)!;

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
            {/* LEFT: Customer Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>{t('msg.title', lang)}</h2>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>GenAI-powered multilingual recovery messages</p>
                </div>
                <div style={{ background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                            Select Borrower
                        </div>
                        <input
                            value={searchQ} onChange={e => setSearchQ(e.target.value)}
                            placeholder="Search accounts..."
                            style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.8rem', outline: 'none', fontFamily: 'Inter' }}
                        />
                    </div>
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                        {filteredAccounts.map(r => (
                            <button key={r.customer.id} onClick={() => { setSelectedId(r.customer.id); setSelectedRecord(r); setLanguage(r.customer.language); setMessages([]); }}
                                style={{
                                    width: '100%', border: 'none', background: selectedId === r.customer.id ? 'linear-gradient(135deg, #ccfbf1, #d1fae5)' : 'transparent',
                                    padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                                    borderLeft: selectedId === r.customer.id ? '3px solid #0d9488' : '3px solid transparent',
                                    borderBottom: '1px solid #f8fafc',
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{r.customer.name}</div>
                                        <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{r.customer.id} • {r.customer.languageName}</div>
                                    </div>
                                    <div style={{
                                        background: r.risk.riskTier === 'Critical' ? '#fef2f2' : r.risk.riskTier === 'High' ? '#fff7ed' : '#fffbeb',
                                        color: r.risk.riskTier === 'Critical' ? '#dc2626' : r.risk.riskTier === 'High' ? '#ea580c' : '#d97706',
                                        borderRadius: 999, padding: '1px 6px', fontSize: '0.62rem', fontWeight: 700,
                                    }}>
                                        {r.risk.riskTier}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 3 }}>
                                    DPD: {r.loan.currentDpd}d • ₹{r.loan.overdueAmount.toLocaleString('en-IN')} overdue
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Message Generator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Customer info card */}
                {record ? (
                    <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: 'linear-gradient(135deg, #ccfbf1, #d1fae5)',
                            border: '2px solid #0d9488', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', fontWeight: 800, color: '#0d9488',
                        }}>
                            {record.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{record.customer.name}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{record.loan.product} • {record.customer.region} • Age {record.customer.age}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626' }}>₹{record.loan.overdueAmount.toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>overdue • {record.loan.currentDpd} DPD</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                                {[
                                    { k: 'Credit Score', v: record.loan.creditScore, c: record.loan.creditScore >= 700 ? '#16a34a' : '#d97706' },
                                    { k: 'Outstanding', v: `₹${record.loan.outstandingAmount.toLocaleString('en-IN')}` },
                                    { k: 'Bounces (6m)', v: record.loan.bounceCount6m },
                                    { k: 'Risk Score', v: record.risk.riskScore, c: record.risk.riskScore >= 80 ? '#dc2626' : '#d97706' },
                                    { k: 'Recovery %', v: `${Math.round(record.risk.expectedRecovery)}%`, c: '#16a34a' },
                                ].map(item => (
                                    <div key={item.k} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '5px 10px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 1 }}>{item.k}</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: (item as any).c || '#0f172a' }}>{item.v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), var(--bg-surface))', borderRadius: 14, padding: '40px', border: '2px dashed #bbf7d0', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>👈</div>
                        <div style={{ fontWeight: 600, color: '#0d9488', marginBottom: 4 }}>Select a borrower</div>
                        <div style={{ color: '#64748b', fontSize: '0.82rem' }}>Choose from the list on the left to generate personalized messages</div>
                    </div>
                )}

                {/* Config row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    {/* Language */}
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Language</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {LANGUAGES.map(l => (
                                <button key={l.code} onClick={() => setLanguage(l.code)}
                                    style={{
                                        padding: '5px 9px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                        background: language === l.code ? '#0d9488' : '#f8fafc',
                                        color: language === l.code ? 'white' : '#475569',
                                        border: `1.5px solid ${language === l.code ? '#0d9488' : '#e2e8f0'}`,
                                    }}>
                                    {l.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Tone */}
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Tone</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {TONES.map(t => (
                                <button key={t.id} onClick={() => setTone(t.id as any)}
                                    style={{
                                        padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                                        background: tone === t.id ? t.color + '18' : '#f8fafc',
                                        border: `1.5px solid ${tone === t.id ? t.color + '60' : '#e2e8f0'}`,
                                        display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                    <span style={{ fontSize: '1rem' }}>{t.emoji}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: tone === t.id ? t.color : '#0f172a' }}>{t.label}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{t.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Channel */}
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Channel</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {CHANNELS.map(ch => (
                                <button key={ch.id} onClick={() => setChannel(ch.id)}
                                    style={{
                                        padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                                        background: channel === ch.id ? '#f0fdf4' : '#f8fafc',
                                        border: `1.5px solid ${channel === ch.id ? '#0d9488' : '#e2e8f0'}`,
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: channel === ch.id ? '#0d9488' : '#475569' }}>
                                        {ch.icon} {ch.label}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>≤{ch.limit}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Generate button */}
                <button
                    onClick={handleGenerate}
                    disabled={!record || generating}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                        background: !record ? '#e2e8f0' : generating ? '#ccfbf1' : 'linear-gradient(135deg, #0d9488, #16a34a)',
                        color: !record ? '#94a3b8' : generating ? '#0d9488' : 'white',
                        fontWeight: 700, fontSize: '1rem', cursor: !record || generating ? 'not-allowed' : 'pointer',
                        boxShadow: !record ? 'none' : '0 4px 14px rgba(13,148,136,0.3)',
                        transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                    {generating ? (
                        <>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: 6, height: 6, borderRadius: '50%', background: '#0d9488',
                                        animation: `bounceDot 1.4s ease-in-out ${i * 0.16}s infinite`,
                                    }} />
                                ))}
                            </div>
                            Generating 3 variants in {LANGUAGES.find(l => l.code === language)?.name}...
                        </>
                    ) : (
                        <>✨ Generate Messages ({LANGUAGES.find(l => l.code === language)?.name} • {TONES.find(t => t.id === tone)?.label} tone • {selectedChannel.label})</>
                    )}
                </button>

                {/* Generated Messages */}
                {messages.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>3 AI-Generated Message Variants</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Click "Use" to send, "Copy" to clipboard</span>
                        </div>
                        {messages.map((msg, idx) => {
                            const toneInfo = TONES.find(t => t.id === msg.tone)!;
                            const isFocused = msg.tone === tone;
                            const charCount = msg.text.length;
                            const overLimit = charCount > selectedChannel.limit;
                            return (
                                <div key={msg.tone}
                                    style={{
                                        background: isFocused ? `${toneInfo.color}08` : '#fff',
                                        borderRadius: 12, padding: '16px 18px',
                                        border: `2px solid ${isFocused ? toneInfo.color + '40' : '#e2e8f0'}`,
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '1.1rem' }}>{toneInfo.emoji}</span>
                                            <div>
                                                <span style={{ fontWeight: 700, color: toneInfo.color, fontSize: '0.85rem' }}>{toneInfo.label}</span>
                                                {isFocused && <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginLeft: 8 }}>Selected</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.68rem', color: overLimit ? '#dc2626' : '#94a3b8' }}>
                                                {charCount}/{selectedChannel.limit} chars
                                            </span>
                                            <button onClick={() => copyToClipboard(msg.text, msg.tone)}
                                                style={{ padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>
                                                {copied === msg.tone ? '✓ Copied!' : 'Copy'}
                                            </button>
                                            <button
                                                style={{ padding: '5px 12px', background: toneInfo.color, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                                                Use →
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#0f172a', fontFamily: 'Inter', background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                                        {idx === 0 ? <TypewriterText text={msg.text} speed={15} /> : msg.text}
                                    </div>
                                    {/* English translation for non-English */}
                                    {language !== 'en' && (
                                        <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px dashed #e2e8f0', paddingTop: 8 }}>
                                            <strong style={{ color: '#64748b' }}>🔤 English:</strong>{' '}
                                            {generateMessage(record!.customer.name, record!.loan.overdueAmount, record!.loan.currentDpd, 'en', msg.tone as any)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
