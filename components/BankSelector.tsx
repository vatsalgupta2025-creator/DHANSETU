'use client';
import React, { useState, ReactNode } from 'react';

export interface BankConfig {
    id: string;
    name: string;
    shortName: string;
    tagline: string;
    type: 'Public' | 'Private';
    logo: ReactNode;
    accent: string;
    accentRgb: string;
    accent2: string;
    portfolioNPA: string;  // e.g. "₹1.2L Cr NPA"
    branches: string;
    founded: number;
    hq: string;
}

// Bank Logo Components
const BankLogos: Record<string, ReactNode> = {
    all: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <rect x="8" y="16" width="32" height="24" rx="2" fill="#0d9488" />
            <path d="M8 20L24 8L40 20" stroke="#0d9488" strokeWidth="3" fill="none" />
            <rect x="20" y="28" width="8" height="12" rx="1" fill="#fff" fillOpacity="0.3" />
            <circle cx="16" cy="26" r="2" fill="#fff" fillOpacity="0.5" />
            <circle cx="32" cy="26" r="2" fill="#fff" fillOpacity="0.5" />
        </svg>
    ),
    sbi: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <circle cx="24" cy="24" r="20" fill="#1a56db" />
            <circle cx="24" cy="24" r="14" fill="none" stroke="#fff" strokeWidth="2" />
            <circle cx="24" cy="24" r="8" fill="none" stroke="#fff" strokeWidth="2" />
            <path d="M24 10V14M24 34V38M10 24H14M34 24H38" stroke="#fff" strokeWidth="2" />
        </svg>
    ),
    hdfc: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <rect x="6" y="6" width="14" height="14" fill="#8B0000" />
            <rect x="28" y="6" width="14" height="14" fill="#8B0000" />
            <rect x="6" y="28" width="14" height="14" fill="#8B0000" />
            <rect x="28" y="28" width="14" height="14" fill="#8B0000" fillOpacity="0.3" />
        </svg>
    ),
    icici: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <rect width="48" height="48" rx="8" fill="#f97316" />
            <path d="M12 36V12M20 36V20M28 36V16M36 36V24" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
    ),
    kotak: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <rect width="48" height="48" rx="8" fill="#dc2626" />
            <rect x="10" y="16" width="28" height="16" rx="2" fill="#fff" />
            <text x="24" y="28" textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="bold" fontFamily="Arial">K</text>
        </svg>
    ),
    axis: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <circle cx="24" cy="24" r="20" fill="#7c3aed" />
            <path d="M14 34L24 14L34 34H14Z" fill="#fff" />
            <circle cx="24" cy="28" r="5" fill="#7c3aed" />
        </svg>
    ),
    pnb: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <rect width="48" height="48" rx="8" fill="#0369a1" />
            <circle cx="24" cy="24" r="14" fill="none" stroke="#fff" strokeWidth="2" />
            <text x="24" y="28" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" fontFamily="Arial">PNB</text>
        </svg>
    ),
    bob: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <circle cx="24" cy="24" r="20" fill="#d97706" />
            <circle cx="24" cy="24" r="15" fill="none" stroke="#fff" strokeWidth="2" />
            <path d="M24 9V15M24 33V39M9 24H15M33 24H39" stroke="#fff" strokeWidth="2" />
            <circle cx="24" cy="24" r="5" fill="#fff" />
        </svg>
    ),
    canara: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <rect width="48" height="48" rx="8" fill="#059669" />
            <path d="M24 8L28 20H40L30 28L34 40L24 32L14 40L18 28L8 20H20L24 8Z" fill="#fff" />
        </svg>
    ),
    union: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <rect width="48" height="48" rx="8" fill="#0f766e" />
            <path d="M12 36C12 24 20 16 24 12C28 16 36 24 36 36" stroke="#fff" strokeWidth="3" fill="none" />
            <circle cx="24" cy="28" r="5" fill="#fff" />
        </svg>
    ),
    indian: (
        <svg viewBox="0 0 48 48" fill="none" style={{ width: '100%', height: '100%' }}>
            <rect width="48" height="48" rx="8" fill="#1e3a8a" />
            <circle cx="24" cy="24" r="14" fill="#ff9932" />
            <circle cx="24" cy="24" r="10" fill="#fff" />
            <circle cx="24" cy="24" r="6" fill="#138808" />
            <path d="M24 18V30M18 24H30" stroke="#fff" strokeWidth="1" />
        </svg>
    ),
};

export const INDIAN_BANKS: BankConfig[] = [
    {
        id: 'all', name: 'All Indian Banks', shortName: 'All Banks',
        tagline: 'Unified Recovery Dashboard',
        type: 'Public', logo: BankLogos.all,
        accent: '#0d9488', accentRgb: '13,148,136', accent2: '#16a34a',
        portfolioNPA: '₹4.2L Cr', branches: '100,000+', founded: 2024, hq: 'India',
    },
    {
        id: 'sbi', name: 'State Bank of India', shortName: 'SBI',
        tagline: 'The Nation\'s Bank',
        type: 'Public', logo: BankLogos.sbi,
        accent: '#1a56db', accentRgb: '26,86,219', accent2: '#1e40af',
        portfolioNPA: '₹1.24L Cr', branches: '22,000+', founded: 1955, hq: 'Mumbai',
    },
    {
        id: 'hdfc', name: 'HDFC Bank', shortName: 'HDFC',
        tagline: 'We Understand Your World',
        type: 'Private', logo: BankLogos.hdfc,
        accent: '#8B0000', accentRgb: '139,0,0', accent2: '#991b1b',
        portfolioNPA: '₹18,226 Cr', branches: '8,300+', founded: 1994, hq: 'Mumbai',
    },
    {
        id: 'icici', name: 'ICICI Bank', shortName: 'ICICI',
        tagline: 'Hum Hain Na',
        type: 'Private', logo: BankLogos.icici,
        accent: '#f97316', accentRgb: '249,115,22', accent2: '#ea580c',
        portfolioNPA: '₹27,021 Cr', branches: '6,900+', founded: 1994, hq: 'Vadodara',
    },
    {
        id: 'kotak', name: 'Kotak Mahindra Bank', shortName: 'Kotak',
        tagline: 'Let\'s Make Money Simple',
        type: 'Private', logo: BankLogos.kotak,
        accent: '#dc2626', accentRgb: '220,38,38', accent2: '#b91c1c',
        portfolioNPA: '₹7,876 Cr', branches: '2,000+', founded: 2003, hq: 'Mumbai',
    },
    {
        id: 'axis', name: 'Axis Bank', shortName: 'Axis',
        tagline: 'Badhte Ka Naam Zindagi',
        type: 'Private', logo: BankLogos.axis,
        accent: '#7c3aed', accentRgb: '124,58,237', accent2: '#6d28d9',
        portfolioNPA: '₹17,498 Cr', branches: '4,900+', founded: 1993, hq: 'Mumbai',
    },
    {
        id: 'pnb', name: 'Punjab National Bank', shortName: 'PNB',
        tagline: 'The Name You Can Bank Upon',
        type: 'Public', logo: BankLogos.pnb,
        accent: '#0369a1', accentRgb: '3,105,161', accent2: '#0284c7',
        portfolioNPA: '₹51,604 Cr', branches: '10,000+', founded: 1894, hq: 'New Delhi',
    },
    {
        id: 'bob', name: 'Bank of Baroda', shortName: 'BoB',
        tagline: 'India\'s International Bank',
        type: 'Public', logo: BankLogos.bob,
        accent: '#d97706', accentRgb: '217,119,6', accent2: '#b45309',
        portfolioNPA: '₹30,823 Cr', branches: '8,200+', founded: 1908, hq: 'Vadodara',
    },
    {
        id: 'canara', name: 'Canara Bank', shortName: 'Canara',
        tagline: 'Together We Can',
        type: 'Public', logo: BankLogos.canara,
        accent: '#059669', accentRgb: '5,150,105', accent2: '#047857',
        portfolioNPA: '₹40,097 Cr', branches: '9,800+', founded: 1906, hq: 'Bengaluru',
    },
    {
        id: 'union', name: 'Union Bank of India', shortName: 'Union',
        tagline: 'Good People to Bank With',
        type: 'Public', logo: BankLogos.union,
        accent: '#0f766e', accentRgb: '15,118,110', accent2: '#0d9488',
        portfolioNPA: '₹44,013 Cr', branches: '8,500+', founded: 1919, hq: 'Mumbai',
    },
    {
        id: 'indian', name: 'Indian Bank', shortName: 'Indian',
        tagline: 'Your Own Bank',
        type: 'Public', logo: BankLogos.indian,
        accent: '#1e3a8a', accentRgb: '30,58,138', accent2: '#1e40af',
        portfolioNPA: '₹28,450 Cr', branches: '5,800+', founded: 1907, hq: 'Chennai',
    },
];

interface Props {
    onSelect: (bank: BankConfig) => void;
    currentBank?: BankConfig | null;
}

export default function BankSelector({ onSelect, currentBank }: Props) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(currentBank?.id || null);

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
                width: '100%', maxWidth: 900,
                background: 'linear-gradient(135deg, #fdfbf7, #f5f0e8)',
                border: '1px solid rgba(139, 90, 43, 0.15)',
                borderRadius: 24,
                padding: '36px 40px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 32px 80px rgba(139, 90, 43, 0.15)',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: '2rem', marginBottom: 10 }}>🏦</div>
                    <h2 style={{
                        fontFamily: 'Space Grotesk',
                        fontSize: '1.6rem', fontWeight: 800,
                        color: '#3d2b1f', marginBottom: 8,
                    }}>
                        Select Your Bank
                    </h2>
                    <p style={{ color: '#8b7355', fontSize: '0.88rem' }}>
                        DhanSetu will be configured with your bank's branding, portfolio, and compliance settings
                    </p>
                </div>

                {/* Bank grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: 14,
                    marginBottom: 28,
                }}>
                    {INDIAN_BANKS.map(bank => {
                        const isHovered = hovered === bank.id;
                        const isSelected = selected === bank.id;
                        return (
                            <div
                                key={bank.id}
                                onClick={() => setSelected(bank.id)}
                                onMouseEnter={() => setHovered(bank.id)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    background: isSelected
                                        ? `linear-gradient(135deg, ${bank.accent}20, ${bank.accent}08)`
                                        : isHovered ? 'rgba(139, 90, 43, 0.06)' : 'rgba(139, 90, 43, 0.03)',
                                    border: `1.5px solid ${isSelected ? bank.accent : isHovered ? 'rgba(139, 90, 43, 0.18)' : 'rgba(139, 90, 43, 0.10)'}`, borderRadius: 16,
                                    padding: '18px 20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.18s ease',
                                    transform: isSelected ? 'scale(1.02)' : isHovered ? 'scale(1.01)' : 'scale(1)',
                                    boxShadow: isSelected ? `0 8px 24px ${bank.accent}30` : 'none',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Selected indicator */}
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                                        background: `linear-gradient(90deg, ${bank.accent}, ${bank.accent2})`,
                                        borderRadius: '16px 16px 0 0',
                                    }} />
                                )}

                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 12,
                                            background: `${bank.accent}15`,
                                            border: `1px solid ${bank.accent}30`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '6px',
                                            overflow: 'hidden',
                                        }}>
                                            {bank.logo}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#3d2b1f', fontFamily: 'Space Grotesk' }}>
                                                {bank.shortName}
                                            </div>
                                            <div style={{
                                                fontSize: '0.6rem', fontWeight: 700,
                                                background: bank.type === 'Public'
                                                    ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)',
                                                color: bank.type === 'Public' ? '#22c55e' : '#a78bfa',
                                                borderRadius: 999, padding: '1px 7px',
                                                display: 'inline-block', marginTop: 2,
                                            }}>
                                                {bank.type}
                                            </div>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div style={{
                                            width: 22, height: 22, borderRadius: '50%',
                                            background: bank.accent,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.65rem', color: 'white', fontWeight: 800,
                                        }}>✓</div>
                                    )}
                                </div>

                                <div style={{ fontSize: '0.73rem', color: '#8b7355', marginBottom: 12, lineHeight: 1.4 }}>
                                    {bank.name}
                                </div>

                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
                                    paddingTop: 10, borderTop: '1px solid rgba(139, 90, 43, 0.10)',
                                }}>
                                    {[
                                        { label: 'NPA Portfolio', val: bank.portfolioNPA },
                                        { label: 'Branches', val: bank.branches },
                                        { label: 'Founded', val: bank.founded },
                                        { label: 'HQ', val: bank.hq },
                                    ].map(({ label, val }) => (
                                        <div key={label}>
                                            <div style={{ fontSize: '0.58rem', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>{label}</div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isSelected ? bank.accent : '#3d2b1f' }}>{val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.75rem', color: '#8b7355' }}>
                        🔐 Powered by DhanSetu AI · All data is simulated for demo purposes
                    </div>
                    <button
                        onClick={() => {
                            const bank = INDIAN_BANKS.find(b => b.id === selected);
                            if (bank) onSelect(bank);
                        }}
                        disabled={!selected}
                        style={{
                            background: selected
                                ? `linear-gradient(135deg, ${INDIAN_BANKS.find(b => b.id === selected)?.accent || '#0d9488'}, ${INDIAN_BANKS.find(b => b.id === selected)?.accent2 || '#16a34a'})`
                                : '#c8bfb0',
                            color: 'white',
                            border: 'none', borderRadius: 12,
                            padding: '11px 28px',
                            fontWeight: 700, fontSize: '0.9rem',
                            cursor: selected ? 'pointer' : 'not-allowed',
                            fontFamily: 'Space Grotesk',
                            transition: 'all 0.2s',
                            boxShadow: selected
                                ? `0 6px 20px ${INDIAN_BANKS.find(b => b.id === selected)?.accent || '#0d9488'}40`
                                : 'none',
                        }}
                    >
                        {selected ? `Launch ${INDIAN_BANKS.find(b => b.id === selected)?.shortName} Dashboard →` : 'Select a Bank'}
                    </button>
                </div>
            </div>
        </div>
    );
}
