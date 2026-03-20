'use client';
import React, { useState } from 'react';

interface Props {
    onSelect: (role: 'admin' | 'user') => void;
    bankName?: string;
    bankAccent?: string;
}

export default function RoleSelector({ onSelect, bankName, bankAccent }: Props) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const accent = bankAccent || '#0d9488';

    const roles = [
        {
            id: 'admin',
            icon: '🏦',
            title: 'Bank Admin',
            subtitle: 'Recovery Team & Management',
            features: ['Dashboard & Analytics', 'AI Risk Engine', 'Customer 360° View', 'Campaign Builder', 'Compliance Center'],
        },
        {
            id: 'user',
            icon: '👤',
            title: 'Customer Login',
            subtitle: 'Borrower Self-Service Portal',
            features: ['My Loans & EMIs', 'Payment History', 'Repayment Options', 'AI Support Bot', 'Download Statements'],
        },
    ];

    function handleSelect(roleId: string) {
        setSelected(roleId);
        setTimeout(() => onSelect(roleId as 'admin' | 'user'), 400);
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'var(--bg-base)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: 24,
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeInDown 0.6s ease both' }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${accent}, var(--bank-accent-2))`,
                    boxShadow: `0 8px 32px rgba(var(--bank-accent-rgb), 0.4)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', margin: '0 auto 20px', color: 'white',
                }}>₹</div>
                <div style={{
                    fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif',
                    background: `linear-gradient(135deg, ${accent}, var(--bank-accent-2))`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text', marginBottom: 8, letterSpacing: '-0.03em',
                }}>
                    {bankName ? `${bankName} · DhanSetu` : 'DhanSetu'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 500 }}>
                    Select your login type to continue
                </div>
            </div>

            {/* Role cards */}
            <div style={{ display: 'flex', gap: 24, maxWidth: 720, width: '100%', justifyContent: 'center' }}>
                {roles.map((role, i) => {
                    const isHovered = hovered === role.id;
                    const isSelected = selected === role.id;
                    return (
                        <button
                            key={role.id}
                            onClick={() => handleSelect(role.id)}
                            onMouseEnter={() => setHovered(role.id)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                flex: 1, maxWidth: 320,
                                background: isSelected
                                    ? `linear-gradient(135deg, var(--bank-accent-light) 0%, transparent 100%)`
                                    : 'var(--bg-surface)',
                                border: `2px solid ${isSelected ? accent : isHovered ? accent : 'var(--border)'}`,
                                borderRadius: 24, padding: '32px 28px',
                                cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                transform: isSelected ? 'scale(0.97)' : isHovered ? 'translateY(-6px) scale(1.02)' : 'none',
                                boxShadow: isHovered ? `var(--shadow-lg), var(--shadow-glow)` : 'var(--shadow-md)',
                                animation: `fadeInUp 0.5s ease ${i * 0.15}s both`,
                                position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)',
                            }}
                        >
                            {isSelected && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                                    background: `linear-gradient(90deg, ${accent}, var(--bank-accent-2))`,
                                }} />
                            )}

                            {/* Icon */}
                            <div style={{
                                width: 56, height: 56, borderRadius: 16,
                                background: `var(--bank-accent-light)`,
                                border: `1px solid ${accent}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.8rem', marginBottom: 20,
                                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'none',
                            }}>
                                {role.icon}
                            </div>

                            {/* Title */}
                            <div style={{
                                fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)',
                                fontFamily: 'Space Grotesk, sans-serif', marginBottom: 6, letterSpacing: '-0.02em',
                            }}>
                                {role.title}
                            </div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 24, fontWeight: 500 }}>
                                {role.subtitle}
                            </div>

                            {/* Features list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {role.features.map(f => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%',
                                            background: `var(--bank-accent-light)`, color: accent,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.65rem', fontWeight: 800, flexShrink: 0,
                                        }}>✓</div>
                                        {f}
                                    </div>
                                ))}
                            </div>

                            {/* Select indicator */}
                            {isSelected && (
                                <div style={{
                                    position: 'absolute', top: 20, right: 20,
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: accent, color: 'white', border: '3px solid white', boxShadow: 'var(--shadow-sm)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 900,
                                }}>✓</div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 36, color: '#b3a08a', fontSize: '0.72rem', textAlign: 'center' }}>
                🔐 Secured by DhanSetu AI · Demo Mode
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
