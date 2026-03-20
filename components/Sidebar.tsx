'use client';
import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';

interface NavItem {
    id: string;
    labelKey: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    group?: string;
}

const Icon = ({ d }: { d: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">{d.split('|').map((path, i) => <path key={i} d={path} />)}</svg>
);
const RectIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);
const BotSvg = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
        <path d="M12 8V4H8" /><rect x="2" y="8" width="20" height="12" rx="2" />
        <path d="M6 12h.01M12 12h.01M18 12h.01" />
    </svg>
);
const MenuSvg = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
        <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);
const ChevronSvg = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', icon: <RectIcon />, group: 'CORE' },
    { id: 'risk', labelKey: 'nav.risk', icon: <Icon d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z|M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />, badge: 'LIVE', badgeColor: '#ef4444', group: 'CORE' },
    { id: 'insights', labelKey: 'nav.insights', icon: <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" />, badge: 'NEW', badgeColor: '#22c55e', group: 'CORE' },
    { id: 'geoheat', labelKey: 'nav.geoheat', icon: <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z|M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />, badge: 'HOT', badgeColor: '#ef4444', group: 'CORE' },
    { id: 'portfolio', labelKey: 'nav.portfolio', icon: <Icon d="M3 3h7v7H3z|M14 3h7v7h-7z|M14 14h7v7h-7z|M3 14h7v7H3z" />, badge: 'NEW', badgeColor: '#f59e0b', group: 'CORE' },
    { id: 'messages', labelKey: 'nav.messages', icon: <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, group: 'ENGAGE' },
    { id: 'bot', labelKey: 'nav.bot', icon: <BotSvg />, badge: 'AI', badgeColor: '#22c55e', group: 'ENGAGE' },
    { id: 'campaigns', labelKey: 'nav.campaigns', icon: <Icon d="m3 11 19-9-9 19-2-8-8-2z" />, group: 'ENGAGE' },
    { id: 'gandhigiri', labelKey: 'nav.gandhigiri', icon: <Icon d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />, badge: '🕊️', badgeColor: '#16a34a', group: 'ENGAGE' },
    { id: 'toolkit', labelKey: 'nav.toolkit', icon: <Icon d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />, badge: 'NEW', badgeColor: '#f59e0b', group: 'RECOVERY' },
    { id: 'analytics', labelKey: 'nav.analytics', icon: <Icon d="M3 3v18h18|M18 17V9|M13 17V5|M8 17v-3" />, group: 'RECOVERY' },
    { id: 'compliance', labelKey: 'nav.compliance', icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />, badge: 'RBI', badgeColor: '#0d9488', group: 'RECOVERY' },
    { id: 'escalation', labelKey: 'nav.escalation', icon: <Icon d="M13 17l5-5-5-5|M6 17l5-5-5-5" />, badge: 'NEW', badgeColor: '#ea580c', group: 'TOOLS' },
    { id: 'bulk', labelKey: 'nav.bulk', icon: <Icon d="M9 11l3 3L22 4|M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />, badge: 'NEW', badgeColor: '#6366f1', group: 'TOOLS' },
    { id: 'sentiment', labelKey: 'nav.sentiment', icon: <Icon d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z|M8 14s1.5 2 4 2 4-2 4-2|M9 9h.01|M15 9h.01" />, badge: 'AI', badgeColor: '#ec4899', group: 'TOOLS' },
    { id: 'mlmodel', labelKey: 'nav.mlmodel', icon: <Icon d="M12 2L2 7l10 5 10-5-10-5z|M2 17l10 5 10-5|M2 12l10 5 10-5" />, badge: 'LIVE', badgeColor: '#16a34a', group: 'TOOLS' },
    { id: 'cashflow', labelKey: 'nav.cashflow', icon: <Icon d="M8 2v4|M16 2v4|M3 10h18|M21 8v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1z" />, badge: 'NEW', badgeColor: '#2563eb', group: 'TOOLS' },
    { id: 'reports', labelKey: 'nav.reports', icon: <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|M16 13H8|M16 17H8|M10 9H8" />, group: 'TOOLS' },
];

const GROUPS: Record<string, string> = { CORE: 'AI ENGINE', ENGAGE: 'ENGAGE', RECOVERY: 'RECOVERY', TOOLS: 'TOOLS & REPORTS' };

export default function Sidebar() {
    const { activePage, setActivePage, loanData, selectedBank, appLanguage } = useApp();
    const lang = appLanguage?.code || 'en-IN';
    const [collapsed, setCollapsed] = useState(false);
    const criticalCount = loanData.filter(d => d.risk.riskTier === 'Critical').length;
    const earlyWarning = loanData.filter(d => d.loan.currentDpd === 0 && d.loan.creditScore < 650).length;

    const groupedItems = NAV_ITEMS.reduce((acc, item) => {
        const g = item.group || 'OTHER';
        if (!acc[g]) acc[g] = [];
        acc[g].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    const accentColor = selectedBank?.accent || '#0d9488';
    const accent2 = selectedBank?.accent2 || '#16a34a';

    return (
        <aside style={{
            width: collapsed ? 64 : 260,
            minHeight: '100vh',
            background: 'var(--bg-surface)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden',
            flexShrink: 0,
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            zIndex: 100,
        }}>
            {/* Logo */}
            <div style={{
                padding: collapsed ? '16px 14px' : '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between', gap: 10,
                background: `linear-gradient(135deg, ${accentColor}12, transparent)`,
            }}>
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        {/* Logo icon */}
                        <div style={{
                            width: 38, height: 38, borderRadius: 11,
                            background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            boxShadow: `0 4px 14px ${accentColor}40`,
                        }}>
                            <span style={{ fontSize: '1.1rem', color: 'white', lineHeight: 1 }}>₹</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                                DhanSetu
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                AI RECOVERY
                            </div>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 12px ${accentColor}40`,
                    }}>
                        <span style={{ fontSize: '1rem', color: 'white' }}>₹</span>
                    </div>
                )}
                <button onClick={() => setCollapsed(!collapsed)}
                    style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 0.2s', backgroundColor: 'var(--bg-base)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-glow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <MenuSvg />
                </button>
            </div>

            {/* Bank badge */}
            {!collapsed && selectedBank && (
                <div style={{
                    margin: '10px 12px 0',
                    background: `${selectedBank.accent}12`,
                    border: `1px solid ${selectedBank.accent}30`,
                    borderRadius: 10, padding: '8px 12px',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <span style={{ fontSize: '1.1rem' }}>{selectedBank.logo}</span>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: selectedBank.accent, fontFamily: 'Space Grotesk' }}>
                            {selectedBank.name}
                        </div>
                        <div style={{ fontSize: '0.58rem', color: '#8b7355' }}>
                            NPA: {selectedBank.portfolioNPA} · {selectedBank.branches} branches
                        </div>
                    </div>
                </div>
            )}

            {/* Alert strip */}
            {!collapsed && (
                <div style={{ padding: '8px 10px 0', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {criticalCount > 0 && (
                        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} className="pulse-glow" />
                            <span style={{ fontSize: '0.71rem', color: '#dc2626', fontWeight: 600 }}>{criticalCount} critical accounts</span>
                        </div>
                    )}
                    {earlyWarning > 0 && (
                        <div style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '0.65rem' }}>⚠️</span>
                            <span style={{ fontSize: '0.71rem', color: '#d97706', fontWeight: 600 }}>{earlyWarning} early warning signals</span>
                        </div>
                    )}
                </div>
            )}

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                {Object.entries(groupedItems).map(([group, items]) => (
                    <div key={group} style={{ marginBottom: 12 }}>
                        {!collapsed && (
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0px 10px 8px' }}>
                                {GROUPS[group] || group}
                            </div>
                        )}
                        {items.map(item => {
                            const isActive = activePage === item.id;
                            return (
                                <button key={item.id} onClick={() => setActivePage(item.id)}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    style={{
                                        width: '100%', border: 'none',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        ...(isActive ? { 
                                            color: accentColor, 
                                            background: `${accentColor}12`,
                                            boxShadow: `inset 4px 0 0 ${accentColor}, 0 4px 12px ${accentColor}15`
                                        } : { color: 'var(--text-secondary)' }),
                                    }}
                                    title={collapsed ? t(item.labelKey, lang as any) : undefined}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}>
                                        {item.icon}
                                    </div>
                                    {!collapsed && (
                                        <>
                                            <span style={{ 
                                                flex: 1, textAlign: 'left', 
                                                fontSize: '0.86rem', 
                                                fontWeight: isActive ? 700 : 500,
                                                letterSpacing: '-0.01em',
                                                transition: 'all 0.2s ease'
                                            }}>{t(item.labelKey, lang as any)}</span>
                                            {item.badge && (
                                                <span style={{
                                                    background: isActive ? `${item.badgeColor || accentColor}25` : `${item.badgeColor || accentColor}15`,
                                                    color: item.badgeColor || accentColor,
                                                    border: `1px solid ${item.badgeColor || accentColor}30`,
                                                    borderRadius: 999, padding: '2px 8px',
                                                    fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.04em',
                                                    boxShadow: isActive ? `0 0 8px ${item.badgeColor || accentColor}30` : 'none'
                                                }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {isActive && (
                                                <div style={{ color: accentColor, opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                                                    <ChevronSvg />
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {collapsed && item.badge && (
                                        <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: item.badgeColor || accentColor, boxShadow: `0 0 6px ${item.badgeColor || accentColor}` }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div style={{ padding: '16px 16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ background: `var(--bank-accent-light)`, border: `1px solid ${accentColor}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: accentColor, marginBottom: 4 }}>💡 AI Insight</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            Best window: <strong style={{ color: 'var(--text-primary)' }}>Mon–Wed, 2–4 PM</strong>
                        </div>
                    </div>
                    <div className="hover-lift" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, cursor: 'pointer', borderRadius: 12, border: '1px solid transparent', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-base)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: 800, color: 'white', flexShrink: 0,
                        }}>AM</div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Admin User</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Recovery Manager</div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
