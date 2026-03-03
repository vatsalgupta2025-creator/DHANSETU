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
            background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f0e8 40%, #f0ebe0 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: 24,
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeInDown 0.6s ease both' }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    boxShadow: `0 8px 32px ${accent}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', margin: '0 auto 20px', color: 'white',
                }}>₹</div>
                <div style={{
                    fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif',
                    background: `linear-gradient(135deg, ${accent}, #16a34a, #f5c842)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text', marginBottom: 8,
                }}>
                    {bankName ? `${bankName} · DhanSetu` : 'DhanSetu'}
                </div>
                <div style={{ color: '#8b7355', fontSize: '1rem' }}>
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
                                    ? `linear-gradient(135deg, ${accent}18, ${accent}08)`
                                    : isHovered ? 'rgba(139, 90, 43, 0.04)' : '#fefcf8',
                                border: `2px solid ${isSelected ? accent : isHovered ? `${accent}60` : 'rgba(139, 90, 43, 0.12)'}`,
                                borderRadius: 20, padding: '32px 28px',
                                cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.25s ease',
                                transform: isSelected ? 'scale(0.97)' : isHovered ? 'translateY(-4px)' : 'none',
                                boxShadow: isHovered ? `0 12px 36px ${accent}20` : '0 2px 12px rgba(139,90,43,0.06)',
                                animation: `fadeInUp 0.5s ease ${i * 0.15}s both`,
                                position: 'relative', overflow: 'hidden',
                            }}
                        >
                            {isSelected && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                    background: `linear-gradient(90deg, ${accent}, #16a34a)`,
                                }} />
                            )}

                            {/* Icon */}
                            <div style={{
                                width: 56, height: 56, borderRadius: 16,
                                background: `${accent}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.8rem', marginBottom: 20,
                            }}>
                                {role.icon}
                            </div>

                            {/* Title */}
                            <div style={{
                                fontSize: '1.25rem', fontWeight: 800, color: '#3d2b1f',
                                fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4,
                            }}>
                                {role.title}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#8b7355', marginBottom: 20 }}>
                                {role.subtitle}
                            </div>

                            {/* Features list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {role.features.map(f => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#5a3e28' }}>
                                        <div style={{
                                            width: 18, height: 18, borderRadius: 6,
                                            background: `${accent}15`, color: accent,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.62rem', fontWeight: 800, flexShrink: 0,
                                        }}>✓</div>
                                        {f}
                                    </div>
                                ))}
                            </div>

                            {/* Select indicator */}
                            {isSelected && (
                                <div style={{
                                    position: 'absolute', top: 16, right: 16,
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: accent, color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 800,
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
