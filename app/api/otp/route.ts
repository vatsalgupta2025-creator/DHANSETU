import { NextRequest, NextResponse } from 'next/server';

// ── In-memory OTP store (hackathon demo) ─────────────────────────
// In production, use Redis/DB + Twilio/AWS SNS for real SMS delivery
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/otp  → { action: 'send' | 'verify', contact, otp? }
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, contact, otp, country } = body;

        if (!contact) {
            return NextResponse.json({ success: false, error: 'Contact is required' }, { status: 400 });
        }

        // ── SEND OTP ──────────────────────────────────────────────────
        if (action === 'send') {
            const generatedOtp = generateOTP();
            const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

            otpStore.set(contact, { otp: generatedOtp, expiresAt, attempts: 0 });

            // Try external OTP API (shelex) for phone numbers
            let externalSent = false;
            if (!contact.includes('@') && country) {
                try {
                    // Attempt to use the shelex OTP API
                    const apiUrl = `https://otp-api.shelex.dev/api/${country}/${contact}`;
                    const extRes = await fetch(apiUrl, {
                        method: 'GET',
                        signal: AbortSignal.timeout(3000),
                    }).catch(() => null);

                    if (extRes?.ok) {
                        externalSent = true;
                    }
                } catch {
                    // External API failed, continue with simulated OTP
                }
            }

            // Clean up expired OTPs periodically
            for (const [key, val] of otpStore.entries()) {
                if (val.expiresAt < Date.now()) otpStore.delete(key);
            }

            const masked = contact.includes('@')
                ? contact.replace(/(.{2})(.*)(@.*)/, '$1***$3')
                : '******' + contact.slice(-4);

            return NextResponse.json({
                success: true,
                message: `OTP sent to ${masked}`,
                masked,
                expiresIn: 300,
                // In demo mode, return OTP so the UI can auto-fill it
                // Remove this in production!
                demo_otp: generatedOtp,
                external: externalSent,
            });
        }

        // ── VERIFY OTP ────────────────────────────────────────────────
        if (action === 'verify') {
            const stored = otpStore.get(contact);

            if (!stored) {
                return NextResponse.json({ success: false, error: 'No OTP found. Please request a new one.' }, { status: 400 });
            }

            if (stored.expiresAt < Date.now()) {
                otpStore.delete(contact);
                return NextResponse.json({ success: false, error: 'OTP has expired. Please request a new one.' }, { status: 400 });
            }

            if (stored.attempts >= 5) {
                otpStore.delete(contact);
                return NextResponse.json({ success: false, error: 'Too many attempts. Please request a new OTP.' }, { status: 429 });
            }

            stored.attempts += 1;

            if (stored.otp !== otp) {
                return NextResponse.json({
                    success: false,
                    error: `Invalid OTP. ${5 - stored.attempts} attempts remaining.`,
                    attemptsLeft: 5 - stored.attempts,
                }, { status: 400 });
            }

            // OTP verified successfully
            otpStore.delete(contact);
            return NextResponse.json({
                success: true,
                message: 'OTP verified successfully!',
                verified: true,
            });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
