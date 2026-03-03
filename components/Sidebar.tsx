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
    { id: 'toolkit', labelKey: 'nav.toolkit', icon: <Icon d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />, badge: 'NEW', badgeColor: '#f59e0b', group: 'RECOVERY' },
    { id: 'analytics', labelKey: 'nav.analytics', icon: <Icon d="M3 3v18h18|M18 17V9|M13 17V5|M8 17v-3" />, group: 'RECOVERY' },
    { id: 'compliance', labelKey: 'nav.compliance', icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />, badge: 'RBI', badgeColor: '#0d9488', group: 'RECOVERY' },
];

const GROUPS: Record<string, string> = { CORE: 'AI ENGINE', ENGAGE: 'ENGAGE', RECOVERY: 'RECOVERY' };

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
            width: collapsed ? 64 : 252,
            minHeight: '100vh',
            background: 'rgba(253, 251, 247, 0.98)',
            borderRight: '1px solid rgba(139, 90, 43, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
            overflow: 'hidden',
            flexShrink: 0,
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            zIndex: 100,
        }}>
            {/* Logo */}
            <div style={{
                padding: collapsed ? '16px 14px' : '16px 16px',
                borderBottom: '1px solid rgba(139, 90, 43, 0.12)',
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
                            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.05rem', color: '#3d2b1f', lineHeight: 1.1 }}>
                                DhanSetu
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#8b7355', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b7355', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#5a3e28')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#8b7355')}>
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
            <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto' }}>
                {Object.entries(groupedItems).map(([group, items]) => (
                    <div key={group}>
                        {!collapsed && (
                            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#8b7355', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 8px 4px' }}>
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
                                        ...(isActive ? { color: accentColor, background: `${accentColor}18` } : {}),
                                    }}
                                    title={collapsed ? t(item.labelKey, lang as any) : undefined}>
                                    {item.icon}
                                    {!collapsed && (
                                        <>
                                            <span style={{ flex: 1, textAlign: 'left', fontSize: '0.83rem' }}>{t(item.labelKey, lang as any)}</span>
                                            {item.badge && (
                                                <span style={{
                                                    background: `${item.badgeColor || accentColor}20`,
                                                    color: item.badgeColor || accentColor,
                                                    border: `1px solid ${(item.badgeColor || accentColor)}30`,
                                                    borderRadius: 999, padding: '1px 7px',
                                                    fontSize: '0.57rem', fontWeight: 700, letterSpacing: '0.04em',
                                                }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {isActive && <ChevronSvg />}
                                        </>
                                    )}
                                    {collapsed && item.badge && (
                                        <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: item.badgeColor || accentColor }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(139, 90, 43, 0.12)' }}>
                    <div style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25`, borderRadius: 10, padding: '8px 10px', marginBottom: 10 }}>
                        <div style={{ fontSize: '0.67rem', fontWeight: 700, color: accentColor, marginBottom: 2 }}>💡 AI Insight</div>
                        <div style={{ fontSize: '0.63rem', color: '#8b7355', lineHeight: 1.4 }}>
                            Best window: <strong style={{ color: '#3d2b1f' }}>Mon–Wed, 2–4 PM</strong>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.72rem', fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>AM</div>
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3d2b1f' }}>Admin User</div>
                            <div style={{ fontSize: '0.63rem', color: '#8b7355' }}>Recovery Manager</div>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
