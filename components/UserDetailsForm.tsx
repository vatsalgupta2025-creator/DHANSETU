'use client';
import React, { useState } from 'react';
import type { BankConfig } from './BankSelector';

interface Props {
    bank: BankConfig | null;
    onSubmit: (details: { name: string; phone: string }) => void;
}

export default function UserDetailsForm({ bank, onSubmit }: Props) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

    const validate = () => {
        const newErrors: { name?: string; phone?: string } = {};
        if (!name.trim() || name.length < 3) {
            newErrors.name = 'Please enter your full name (min 3 characters)';
        }
        if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone)) {
            newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({ name: name.trim(), phone: phone.trim() });
        }
    };

    const accentColor = bank?.accent || '#0d9488';
    const accent2 = bank?.accent2 || '#16a34a';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        }}>
            <div className="scale-in" style={{
                width: '100%', maxWidth: 480,
                background: 'linear-gradient(135deg, #fdfbf7, #f5f0e8)',
                border: '1px solid rgba(139, 90, 43, 0.15)',
                borderRadius: 24,
                padding: '40px',
                boxShadow: '0 32px 80px rgba(139, 90, 43, 0.15)',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', fontSize: '1.8rem'
                    }}>
                        {bank?.logo || '🏦'}
                    </div>
                    <h2 style={{
                        fontFamily: 'Space Grotesk',
                        fontSize: '1.5rem', fontWeight: 800,
                        color: '#3d2b1f', marginBottom: 8,
                    }}>
                        Welcome to {bank?.shortName || 'DhanSetu'}
                    </h2>
                    <p style={{ color: '#8b7355', fontSize: '0.88rem' }}>
                        {bank?.tagline || 'AI-powered debt recovery platform'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 600,
                            color: '#3d2b1f', marginBottom: 6
                        }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            style={{
                                width: '100%', padding: '14px 16px',
                                border: `1.5px solid ${errors.name ? '#dc2626' : 'rgba(139, 90, 43, 0.2)'}`,
                                borderRadius: 12, fontSize: '0.95rem',
                                background: 'white', color: '#3d2b1f',
                                outline: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = accentColor; }}
                            onBlur={(e) => { e.target.style.borderColor = errors.name ? '#dc2626' : 'rgba(139, 90, 43, 0.2)'; }}
                        />
                        {errors.name && (
                            <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 6 }}>
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 600,
                            color: '#3d2b1f', marginBottom: 6
                        }}>
                            Mobile Number *
                        </label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{
                                padding: '14px 16px', background: 'rgba(139, 90, 43, 0.08)',
                                borderRadius: 12, fontSize: '0.95rem', color: '#3d2b1f',
                                fontWeight: 600, border: '1.5px solid rgba(139, 90, 43, 0.2)',
                            }}>
                                🇮🇳 +91
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="9876543210"
                                style={{
                                    flex: 1, padding: '14px 16px',
                                    border: `1.5px solid ${errors.phone ? '#dc2626' : 'rgba(139, 90, 43, 0.2)'}`,
                                    borderRadius: 12, fontSize: '0.95rem',
                                    background: 'white', color: '#3d2b1f',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => { e.target.style.borderColor = accentColor; }}
                                onBlur={(e) => { e.target.style.borderColor = errors.phone ? '#dc2626' : 'rgba(139, 90, 43, 0.2)'; }}
                            />
                        </div>
                        {errors.phone && (
                            <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 6 }}>
                                {errors.phone}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%', padding: '16px',
                            background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
                            color: 'white', border: 'none', borderRadius: 12,
                            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                            fontFamily: 'Space Grotesk',
                            boxShadow: `0 6px 20px ${accentColor}40`,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                    >
                        Continue →
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <p style={{ fontSize: '0.75rem', color: '#8b7355' }}>
                        🔒 Your information is secure and will only be used for {bank?.shortName || 'bank'} recovery operations
                    </p>
                </div>
            </div>
        </div>
    );
}
