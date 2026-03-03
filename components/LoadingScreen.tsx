'use client';
import React, { useEffect, useState } from 'react';

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'loading' | 'done'>('loading');

    useEffect(() => {
        // Animate progress bar over 3 seconds
        const start = Date.now();
        const duration = 3000;
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.min(100, Math.round((elapsed / duration) * 100));
            setProgress(pct);
            if (pct >= 100) {
                clearInterval(interval);
                setPhase('done');
                setTimeout(onDone, 400);
            }
        }, 30);
        return () => clearInterval(interval);
    }, [onDone]);

    const loadingTexts = [
        'Initializing AI Engine...',
        'Loading Risk Models...',
        'Connecting to Data Layer...',
        'Preparing Language Packs...',
        'Ready!',
    ];
    const textIndex = Math.min(4, Math.floor(progress / 20));

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #fdfbf7 0%, #f5efe6 40%, #f0ebe0 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            opacity: phase === 'done' ? 0 : 1,
            transition: 'opacity 0.4s ease',
        }}>
            {/* Animated background particles - using deterministic values to avoid hydration mismatch */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {Array.from({ length: 20 }).map((_, i) => {
                    // Pre-defined deterministic values based on index to avoid hydration mismatch
                    const sizes = [3.63, 2.68, 2.74, 1.17, 2.21, 4.43, 4.22, 3.16, 2.57, 1.09, 3.90, 1.50, 2.30, 3.58, 2.66, 2.78, 1.36, 2.25, 2.18, 1.97];
                    const heights = [4.62, 1.47, 3.06, 3.68, 1.13, 1.36, 3.59, 2.58, 1.07, 1.28, 2.05, 1.88, 2.25, 3.12, 1.20, 1.82, 2.56, 1.58, 2.36, 3.97];
                    const lefts = [0, 5.3, 10.6, 15.9, 21.2, 26.5, 31.8, 37.1, 42.4, 47.7, 53, 58.3, 63.6, 68.9, 74.2, 79.5, 84.8, 90.1, 95.4, 0.7];
                    const tops = [0, 7.1, 14.2, 21.3, 28.4, 35.5, 42.6, 49.7, 56.8, 63.9, 71, 78.1, 85.2, 92.3, 99.4, 6.5, 13.6, 20.7, 27.8, 34.9];
                    const durations = [3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6];
                    const delays = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 0.1, 0.4, 0.7, 1, 1.3, 1.6, 1.9, 0.2, 0.5, 0.8, 1.1, 1.4, 1.7];
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            width: sizes[i] || 2,
                            height: heights[i] || 2,
                            borderRadius: '50%',
                            background: i % 3 === 0 ? '#0d9488' : i % 3 === 1 ? '#16a34a' : '#d97706',
                            left: `${lefts[i]}%`,
                            top: `${tops[i]}%`,
                            opacity: 0.4,
                            animation: `floatParticle ${durations[i]}s ease-in-out ${delays[i]}s infinite alternate`,
                        }} />
                    );
                })}
            </div>

            {/* Glowing ring behind coin */}
            <div style={{
                position: 'relative',
                width: 200, height: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 40,
            }}>
                {/* Outer glow ring */}
                <div style={{
                    position: 'absolute',
                    width: 200, height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)',
                    animation: 'pulseRing 2s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    width: 160, height: 160,
                    borderRadius: '50%',
                    border: '1px solid rgba(13,148,136,0.3)',
                    animation: 'spinSlow 8s linear infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    width: 180, height: 180,
                    borderRadius: '50%',
                    border: '1px dashed rgba(22,163,74,0.2)',
                    animation: 'spinSlow 12s linear infinite reverse',
                }} />

                {/* 3D Rupee Coin */}
                <div style={{
                    width: 120, height: 120,
                    position: 'relative',
                    animation: 'coin3dSpin 2s linear infinite',
                    transformStyle: 'preserve-3d',
                    perspective: '400px',
                }}>
                    {/* Coin face */}
                    <div style={{
                        width: 120, height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #f5c842 0%, #e6a817 30%, #f0b429 50%, #c8860a 70%, #f5c842 100%)',
                        boxShadow: `
                            0 0 0 4px #c8860a,
                            0 0 0 6px #f5c842,
                            0 8px 32px rgba(245,200,66,0.5),
                            0 0 60px rgba(245,200,66,0.2),
                            inset 0 2px 8px rgba(255,255,255,0.4),
                            inset 0 -2px 8px rgba(0,0,0,0.2)
                        `,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Coin shine effect */}
                        <div style={{
                            position: 'absolute',
                            top: '10%', left: '15%',
                            width: '40%', height: '35%',
                            borderRadius: '50%',
                            background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
                            transform: 'rotate(-30deg)',
                        }} />
                        {/* Rupee symbol */}
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: 900,
                            color: '#7a4f00',
                            textShadow: '0 1px 2px rgba(255,255,255,0.3), 0 -1px 2px rgba(0,0,0,0.2)',
                            lineHeight: 1,
                            fontFamily: 'Arial, sans-serif',
                            zIndex: 1,
                        }}>₹</div>
                        {/* Coin edge lines */}
                        <div style={{
                            position: 'absolute',
                            inset: 4,
                            borderRadius: '50%',
                            border: '2px solid rgba(200,134,10,0.5)',
                        }} />
                    </div>
                </div>
            </div>

            {/* Brand name */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{
                    fontSize: '2.8rem',
                    fontWeight: 900,
                    fontFamily: 'Space Grotesk, sans-serif',
                    background: 'linear-gradient(135deg, #0d9488, #16a34a, #f5c842)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em',
                    marginBottom: 6,
                }}>
                    DhanSetu
                </div>
                <div style={{
                    fontSize: '0.9rem',
                    color: '#8b7355',
                    fontWeight: 400,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                }}>
                    AI Debt Recovery Platform
                </div>
            </div>

            {/* AI feature pills */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 480 }}>
                {['🤖 XGBoost AI', '🌐 23 Languages', '🔊 TTS + STT', '📊 Real-time Analytics', '🛡️ RBI Compliant'].map((pill, i) => (
                    <div key={pill} style={{
                        padding: '5px 14px',
                        borderRadius: 999,
                        border: '1px solid rgba(13,148,136,0.4)',
                        background: 'rgba(13,148,136,0.1)',
                        color: '#5a3e28',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        animation: `fadeInUp 0.5s ease ${0.1 + i * 0.1}s both`,
                    }}>
                        {pill}
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div style={{ width: 320, marginBottom: 16 }}>
                <div style={{
                    height: 4, borderRadius: 999,
                    background: 'rgba(139, 90, 43, 0.10)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #0d9488, #16a34a, #f5c842)',
                        transition: 'width 0.1s linear',
                        boxShadow: '0 0 10px rgba(13,148,136,0.6)',
                    }} />
                </div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: 8, fontSize: '0.72rem',
                    color: '#b3a08a',
                }}>
                    <span style={{ color: '#0d9488', fontWeight: 600 }}>{loadingTexts[textIndex]}</span>
                    <span>{progress}%</span>
                </div>
            </div>

            {/* Powered by */}
            <div style={{ fontSize: '0.65rem', color: '#b3a08a', marginTop: 8, letterSpacing: '0.1em' }}>
                POWERED BY GPT-4 · XGBOOST · RASA NLU
            </div>

            <style>{`
                @keyframes coin3dSpin {
                    0%   { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
                @keyframes pulseRing {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50%       { transform: scale(1.08); opacity: 1; }
                }
                @keyframes spinSlow {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes floatParticle {
                    from { transform: translateY(0px) scale(1); }
                    to   { transform: translateY(-20px) scale(1.3); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
