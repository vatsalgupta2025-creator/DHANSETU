'use client';
import React, { useState } from 'react';
import type { BankConfig } from './BankSelector';

interface Props {
    bank: BankConfig | null;
    role: 'admin' | 'user' | null;
    userName: string;
    onLogin: (credentials: { userId: string; password: string }) => void;
    onBack: () => void;
}

// Bank-specific credentials hints
const BANK_CREDENTIALS: Record<string, { adminHint: string; userHint: string }> = {
    sbi: { adminHint: 'SBI Admin Portal - Use your CBS credentials', userHint: 'SBI Employee ID required' },
    hdfc: { adminHint: 'HDFC NetBanking Admin - Use your LDAP ID', userHint: 'HDFC Employee Code required' },
    icici: { adminHint: 'ICICI Infinity Admin - Use corporate login', userHint: 'ICICI Staff ID required' },
    kotak: { adminHint: 'Kotak Admin Console - Use SSO login', userHint: 'Kotak Employee Number required' },
    axis: { adminHint: 'Axis Bank Admin - Use Active Directory', userHint: 'Axis Staff ID required' },
    pnb: { adminHint: 'PNB Admin Portal - Use CBS credentials', userHint: 'PNB Employee Code required' },
    bob: { adminHint: 'BoB Admin Console - Use SSO login', userHint: 'BoB Staff ID required' },
    canara: { adminHint: 'Canara Admin Portal - Use corporate login', userHint: 'Canara Employee ID required' },
    union: { adminHint: 'Union Bank Admin - Use LDAP credentials', userHint: 'Union Staff Number required' },
    indian: { adminHint: 'Indian Bank Admin - Use your IndPay corporate ID', userHint: 'Indian Bank Staff Number required' },
    all: { adminHint: 'Multi-Bank Admin - Use super admin credentials', userHint: 'Regional Manager ID required' },
};

export default function BankLogin({ bank, role, userName, onLogin, onBack }: Props) {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    // Forgot password flow
    const [forgotStep, setForgotStep] = useState<0 | 1 | 2 | 3>(0); // 0=login, 1=enter email, 2=otp, 3=new password
    const [fpEmail, setFpEmail] = useState('');
    const [fpOtp, setFpOtp] = useState('');
    const [fpNewPass, setFpNewPass] = useState('');
    const [fpConfirmPass, setFpConfirmPass] = useState('');
    const [fpMsg, setFpMsg] = useState('');
    const [fpError, setFpError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [demoOtp, setDemoOtp] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId.trim() || !password.trim()) {
            setError('Please enter both User ID and Password');
            return;
        }
        if (password.length < 6) {
            setError('Invalid credentials. Please try again.');
            return;
        }
        onLogin({ userId: userId.trim(), password });
    };

    const accentColor = bank?.accent || '#0d9488';
    const accent2 = bank?.accent2 || '#16a34a';
    const creds = bank ? BANK_CREDENTIALS[bank.id] : { adminHint: 'Use your bank credentials', userHint: 'Use your employee ID' };
    const hint = role === 'admin' ? creds?.adminHint : creds?.userHint;

    // Send OTP handler — calls /api/otp
    const handleSendOtp = async () => {
        if (!fpEmail.trim() || (!fpEmail.includes('@') && fpEmail.length < 10)) {
            setFpError('Please enter a valid email or phone number');
            return;
        }
        setFpError('');
        setIsSending(true);
        try {
            const res = await fetch('/api/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send',
                    contact: fpEmail.trim(),
                    country: 'IN',
                }),
            });
            const data = await res.json();
            if (data.success) {
                setOtpSent(true);
                setOtpTimer(30);
                setFpMsg(`OTP sent to ${data.masked || fpEmail}`);
                // Store demo OTP for auto-fill hint
                if (data.demo_otp) setDemoOtp(data.demo_otp);
                // Countdown timer
                const interval = setInterval(() => {
                    setOtpTimer(prev => {
                        if (prev <= 1) { clearInterval(interval); return 0; }
                        return prev - 1;
                    });
                }, 1000);
                // Move to OTP step
                setTimeout(() => setForgotStep(2), 800);
            } else {
                setFpError(data.error || 'Failed to send OTP');
            }
        } catch {
            setFpError('Network error. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    // Verify OTP handler — calls /api/otp
    const handleVerifyOtp = async () => {
        if (fpOtp.length < 4) {
            setFpError('Please enter a valid OTP');
            return;
        }
        setFpError('');
        setIsVerifying(true);
        try {
            const res = await fetch('/api/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify',
                    contact: fpEmail.trim(),
                    otp: fpOtp.trim(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setFpMsg('OTP verified successfully! ✅');
                setTimeout(() => { setForgotStep(3); setFpMsg(''); setDemoOtp(''); }, 600);
            } else {
                setFpError(data.error || 'Invalid OTP');
            }
        } catch {
            setFpError('Network error. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    // Reset password handler
    const handleResetPassword = () => {
        if (fpNewPass.length < 6) {
            setFpError('Password must be at least 6 characters');
            return;
        }
        if (fpNewPass !== fpConfirmPass) {
            setFpError('Passwords do not match');
            return;
        }
        setFpError('');
        setFpMsg('Password reset successfully! 🎉 Redirecting to login...');
        setTimeout(() => {
            setForgotStep(0);
            setFpEmail(''); setFpOtp(''); setFpNewPass(''); setFpConfirmPass('');
            setFpMsg(''); setOtpSent(false); setDemoOtp('');
        }, 1500);
    };

    // Shared input style
    const inputStyle = (hasError: boolean) => ({
        width: '100%' as const, padding: '14px 16px',
        border: `1.5px solid ${hasError ? '#dc2626' : 'rgba(139, 90, 43, 0.2)'}`,
        borderRadius: 12, fontSize: '0.95rem',
        background: 'white', color: '#3d2b1f',
        outline: 'none' as const, transition: 'all 0.2s',
    });

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
                width: '100%', maxWidth: 440,
                background: 'linear-gradient(135deg, #fdfbf7, #f5f0e8)',
                border: '1px solid rgba(139, 90, 43, 0.15)',
                borderRadius: 24,
                padding: '40px',
                boxShadow: '0 32px 80px rgba(139, 90, 43, 0.15)',
            }}>
                {/* Back button */}
                <button
                    onClick={forgotStep > 0 ? () => { setForgotStep(prev => Math.max(0, prev - 1) as any); setFpError(''); setFpMsg(''); } : onBack}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#8b7355', fontSize: '0.85rem', marginBottom: 16,
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}
                >
                    ← {forgotStep > 0 ? 'Back' : 'Back'}
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', padding: '12px',
                        overflow: 'hidden',
                    }}>
                        {forgotStep === 0 ? (bank?.logo || <span style={{ fontSize: '1.8rem' }}>🏦</span>) :
                            forgotStep === 1 ? <span style={{ fontSize: '1.8rem' }}>📧</span> :
                                forgotStep === 2 ? <span style={{ fontSize: '1.8rem' }}>🔢</span> :
                                    <span style={{ fontSize: '1.8rem' }}>🔐</span>}
                    </div>
                    <h2 style={{
                        fontFamily: 'Space Grotesk',
                        fontSize: '1.4rem', fontWeight: 800,
                        color: '#3d2b1f', marginBottom: 6,
                    }}>
                        {forgotStep === 0 ? `${bank?.shortName || 'Bank'} ${role === 'admin' ? 'Admin' : 'User'} Login`
                            : forgotStep === 1 ? 'Forgot Password'
                                : forgotStep === 2 ? 'Verify OTP'
                                    : 'Reset Password'}
                    </h2>
                    <p style={{ color: '#8b7355', fontSize: '0.85rem' }}>
                        {forgotStep === 0 ? `Welcome, ${userName}`
                            : forgotStep === 1 ? 'Enter your registered email or phone'
                                : forgotStep === 2 ? `Enter the OTP sent to your ${fpEmail.includes('@') ? 'email' : 'phone'}`
                                    : 'Create a new secure password'}
                    </p>
                </div>

                {/* === LOGIN FORM === */}
                {forgotStep === 0 && (
                    <>
                        <div style={{
                            background: `${accentColor}12`, border: `1px solid ${accentColor}25`,
                            borderRadius: 10, padding: '12px 16px', marginBottom: 24,
                        }}>
                            <div style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 600, marginBottom: 2 }}>
                                💡 Login Hint
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6b5344' }}>{hint}</div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d2b1f', marginBottom: 6 }}>
                                    User ID / Employee ID *
                                </label>
                                <input type="text" value={userId}
                                    onChange={(e) => { setUserId(e.target.value); setError(''); }}
                                    placeholder={role === 'admin' ? "admin@bank.in" : "EMP123456"}
                                    style={inputStyle(!!error)}
                                    onFocus={(e) => { e.target.style.borderColor = accentColor; }}
                                    onBlur={(e) => { e.target.style.borderColor = error ? '#dc2626' : 'rgba(139, 90, 43, 0.2)'; }}
                                />
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d2b1f', marginBottom: 6 }}>
                                    Password *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? "text" : "password"} value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        placeholder="Enter your password"
                                        style={{ ...inputStyle(!!error), paddingRight: 48 }}
                                        onFocus={(e) => { e.target.style.borderColor = accentColor; }}
                                        onBlur={(e) => { e.target.style.borderColor = error ? '#dc2626' : 'rgba(139, 90, 43, 0.2)'; }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#8b7355' }}>
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: 16, textAlign: 'center', padding: '10px', background: '#fef2f2', borderRadius: 8 }}>
                                    {error}
                                </div>
                            )}

                            <button type="submit" style={{
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
                                Login to {bank?.shortName || 'Portal'} →
                            </button>
                        </form>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(139, 90, 43, 0.1)' }}>
                            <span style={{ fontSize: '0.75rem', color: '#8b7355' }}>🔒 Secure SSL Connection</span>
                            <button onClick={() => { setForgotStep(1); setFpError(''); setFpMsg(''); }}
                                style={{ fontSize: '0.75rem', color: accentColor, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                Forgot Password?
                            </button>
                        </div>
                    </>
                )}

                {/* === FORGOT PASSWORD STEP 1: Enter Email/Phone === */}
                {forgotStep === 1 && (
                    <div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d2b1f', marginBottom: 6 }}>
                                Registered Email or Phone *
                            </label>
                            <input type="text" value={fpEmail}
                                onChange={(e) => { setFpEmail(e.target.value); setFpError(''); }}
                                placeholder="email@bank.com or +91-XXXXX-XXXXX"
                                style={inputStyle(!!fpError)}
                                onFocus={(e) => { e.target.style.borderColor = accentColor; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(139, 90, 43, 0.2)'; }}
                            />
                        </div>

                        {fpError && (
                            <div style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: 14, padding: '10px', background: '#fef2f2', borderRadius: 8, textAlign: 'center' }}>
                                {fpError}
                            </div>
                        )}
                        {fpMsg && (
                            <div style={{ color: '#16a34a', fontSize: '0.82rem', marginBottom: 14, padding: '10px', background: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                                {fpMsg}
                            </div>
                        )}

                        <button onClick={handleSendOtp} disabled={isSending} style={{
                            width: '100%', padding: '16px',
                            background: isSending ? 'rgba(139,90,43,0.2)' : `linear-gradient(135deg, ${accentColor}, ${accent2})`,
                            color: isSending ? '#b3a08a' : 'white', border: 'none', borderRadius: 12,
                            fontWeight: 700, fontSize: '1rem', cursor: isSending ? 'wait' : 'pointer',
                            fontFamily: 'Space Grotesk', transition: 'all 0.2s',
                        }}>
                            {isSending ? '⏳ Sending OTP...' : '📩 Send OTP'}
                        </button>

                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.72rem', color: '#8b7355' }}>
                                We&apos;ll send a 6-digit verification code to your registered {fpEmail.includes('@') ? 'email' : 'phone number'}
                            </div>
                        </div>
                    </div>
                )}

                {/* === FORGOT PASSWORD STEP 2: Enter OTP === */}
                {forgotStep === 2 && (
                    <div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d2b1f', marginBottom: 6 }}>
                                Enter 6-Digit OTP *
                            </label>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                {[0, 1, 2, 3, 4, 5].map(i => (
                                    <input key={i} type="text" maxLength={1}
                                        value={fpOtp[i] || ''}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            const newOtp = fpOtp.split('');
                                            newOtp[i] = val;
                                            setFpOtp(newOtp.join(''));
                                            setFpError('');
                                            // Auto-focus next
                                            if (val && i < 5) {
                                                const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                                                next?.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !fpOtp[i] && i > 0) {
                                                const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement;
                                                prev?.focus();
                                            }
                                        }}
                                        style={{
                                            width: 48, height: 56, textAlign: 'center',
                                            border: `2px solid ${fpOtp[i] ? accentColor : 'rgba(139, 90, 43, 0.2)'}`,
                                            borderRadius: 12, fontSize: '1.4rem', fontWeight: 800,
                                            color: '#3d2b1f', background: 'white', outline: 'none',
                                            fontFamily: 'Space Grotesk',
                                            transition: 'all 0.15s',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Demo OTP hint */}
                        {demoOtp && (
                            <div style={{ marginBottom: 14, padding: '10px 14px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 10, textAlign: 'center', border: '1px solid #f59e0b' }}>
                                <div style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 600, marginBottom: 2 }}>🔑 Demo Mode OTP</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#92400e', fontFamily: 'Space Grotesk', letterSpacing: 6 }}>{demoOtp}</div>
                                <button onClick={() => { setFpOtp(demoOtp); }} style={{ marginTop: 4, fontSize: '0.68rem', color: '#d97706', background: 'none', border: '1px solid #d97706', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}>
                                    Auto-fill OTP
                                </button>
                            </div>
                        )}

                        {fpError && (
                            <div style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: 14, padding: '10px', background: '#fef2f2', borderRadius: 8, textAlign: 'center' }}>
                                {fpError}
                            </div>
                        )}
                        {fpMsg && (
                            <div style={{ color: '#16a34a', fontSize: '0.82rem', marginBottom: 14, padding: '10px', background: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                                {fpMsg}
                            </div>
                        )}

                        <button onClick={handleVerifyOtp} disabled={fpOtp.length < 6 || isVerifying} style={{
                            width: '100%', padding: '16px',
                            background: (fpOtp.length >= 6 && !isVerifying) ? `linear-gradient(135deg, ${accentColor}, ${accent2})` : 'rgba(139,90,43,0.1)',
                            color: (fpOtp.length >= 6 && !isVerifying) ? 'white' : '#b3a08a', border: 'none', borderRadius: 12,
                            fontWeight: 700, fontSize: '1rem', cursor: (fpOtp.length >= 6 && !isVerifying) ? 'pointer' : 'not-allowed',
                            fontFamily: 'Space Grotesk', transition: 'all 0.2s',
                        }}>
                            {isVerifying ? '⏳ Verifying...' : '✅ Verify OTP'}
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 8 }}>
                            <span style={{ fontSize: '0.72rem', color: '#8b7355' }}>
                                Didn&apos;t receive the code?
                            </span>
                            <button onClick={handleSendOtp} disabled={otpTimer > 0 || isSending}
                                style={{ fontSize: '0.72rem', color: otpTimer > 0 ? '#b3a08a' : accentColor, background: 'none', border: 'none', cursor: otpTimer > 0 ? 'default' : 'pointer', fontWeight: 700 }}>
                                {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </div>
                )}

                {/* === FORGOT PASSWORD STEP 3: New Password === */}
                {forgotStep === 3 && (
                    <div>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d2b1f', marginBottom: 6 }}>
                                New Password *
                            </label>
                            <input type="password" value={fpNewPass}
                                onChange={(e) => { setFpNewPass(e.target.value); setFpError(''); }}
                                placeholder="Min 6 characters"
                                style={inputStyle(!!fpError)}
                            />
                            {/* Password strength */}
                            {fpNewPass.length > 0 && (
                                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                                    {[1, 2, 3, 4].map(level => (
                                        <div key={level} style={{
                                            flex: 1, height: 4, borderRadius: 2,
                                            background: fpNewPass.length >= level * 3
                                                ? level <= 1 ? '#dc2626' : level <= 2 ? '#f59e0b' : level <= 3 ? '#84cc16' : '#22c55e'
                                                : 'rgba(139,90,43,0.1)',
                                            transition: 'background 0.2s',
                                        }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3d2b1f', marginBottom: 6 }}>
                                Confirm Password *
                            </label>
                            <input type="password" value={fpConfirmPass}
                                onChange={(e) => { setFpConfirmPass(e.target.value); setFpError(''); }}
                                placeholder="Re-enter your password"
                                style={inputStyle(fpConfirmPass.length > 0 && fpNewPass !== fpConfirmPass)}
                            />
                            {fpConfirmPass.length > 0 && fpNewPass === fpConfirmPass && (
                                <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: 4 }}>✅ Passwords match</div>
                            )}
                        </div>

                        {fpError && (
                            <div style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: 14, padding: '10px', background: '#fef2f2', borderRadius: 8, textAlign: 'center' }}>
                                {fpError}
                            </div>
                        )}
                        {fpMsg && (
                            <div style={{ color: '#16a34a', fontSize: '0.82rem', marginBottom: 14, padding: '10px', background: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                                {fpMsg}
                            </div>
                        )}

                        <button onClick={handleResetPassword} style={{
                            width: '100%', padding: '16px',
                            background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
                            color: 'white', border: 'none', borderRadius: 12,
                            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                            fontFamily: 'Space Grotesk', transition: 'all 0.2s',
                        }}>
                            🔐 Reset Password
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
