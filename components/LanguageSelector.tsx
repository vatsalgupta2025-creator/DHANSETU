'use client';
import React, { useState } from 'react';

export interface AppLanguage {
    code: string;
    name: string;
    nativeName: string;
    greeting: string;
    tagline: string;
    selectBtn: string;
    flag: string;
    region: string;
}

export const APP_LANGUAGES: AppLanguage[] = [
    {
        code: 'en-IN', name: 'English', nativeName: 'English',
        greeting: 'Welcome to DhanSetu', tagline: 'AI-powered debt recovery platform',
        selectBtn: 'Continue in English', flag: '🇮🇳', region: 'Pan India',
    },
    {
        code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी',
        greeting: 'धनसेतु में आपका स्वागत है', tagline: 'AI-संचालित ऋण वसूली मंच',
        selectBtn: 'हिन्दी में जारी रखें', flag: '🇮🇳', region: 'उत्तर भारत',
    },
    {
        code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা',
        greeting: 'ধনসেতুতে আপনাকে স্বাগতম', tagline: 'AI-চালিত ঋণ পুনরুদ্ধার প্ল্যাটফর্ম',
        selectBtn: 'বাংলায় চালিয়ে যান', flag: '🇮🇳', region: 'পশ্চিমবঙ্গ',
    },
    {
        code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు',
        greeting: 'ధన్‌సేతుకు స్వాగతం', tagline: 'AI-ఆధారిత రుణ వసూలు వేదిక',
        selectBtn: 'తెలుగులో కొనసాగించు', flag: '🇮🇳', region: 'ఆంధ్రప్రదేశ్',
    },
    {
        code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी',
        greeting: 'धनसेतूमध्ये आपले स्वागत आहे', tagline: 'AI-चालित कर्ज वसुली व्यासपीठ',
        selectBtn: 'मराठीत सुरू ठेवा', flag: '🇮🇳', region: 'महाराष्ट्र',
    },
    {
        code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்',
        greeting: 'தன்சேதுவிற்கு வரவேற்கிறோம்', tagline: 'AI-இயக்கப்படும் கடன் மீட்பு தளம்',
        selectBtn: 'தமிழில் தொடரவும்', flag: '🇮🇳', region: 'தமிழ்நாடு',
    },
    {
        code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી',
        greeting: 'ધનસેતુમાં આપનું સ્વાગત છે', tagline: 'AI-સંચાલિત ઋણ વસૂલ પ્લેટફોર્મ',
        selectBtn: 'ગુજરાતીમાં ચાલુ રાખો', flag: '🇮🇳', region: 'ગુજરાત',
    },
    {
        code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ',
        greeting: 'ಧನಸೇತುಗೆ ಸ್ವಾಗತ', tagline: 'AI-ಚಾಲಿತ ಸಾಲ ವಸೂಲಿ ವೇದಿಕೆ',
        selectBtn: 'ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ', flag: '🇮🇳', region: 'ಕರ್ನಾಟಕ',
    },
    {
        code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം',
        greeting: 'ധൻസേതുവിലേക്ക് സ്വാഗതം', tagline: 'AI-ഉദ്ദേശ്യ കടം വീണ്ടെടുക്കൽ പ്ലാറ്റ്ഫോം',
        selectBtn: 'മലയാളത്തിൽ തുടരുക', flag: '🇮🇳', region: 'കേരളം',
    },
    {
        code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ',
        greeting: 'ਧਨਸੇਤੂ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ', tagline: 'AI-ਸੰਚਾਲਿਤ ਕਰਜ਼ਾ ਵਸੂਲੀ ਪਲੇਟਫਾਰਮ',
        selectBtn: 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਾਰੀ ਰੱਖੋ', flag: '🇮🇳', region: 'ਪੰਜਾਬ',
    },
    {
        code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ',
        greeting: 'ଧନସେତୁକୁ ସ୍ୱାଗତ', tagline: 'AI-ଚାଳିତ ଋଣ ଉଦ୍ଧାର ମଞ୍ଚ',
        selectBtn: 'ଓଡ଼ିଆରେ ଜାରି ରଖନ୍ତୁ', flag: '🇮🇳', region: 'ଓଡ଼ିଶା',
    },
    {
        code: 'ur-IN', name: 'Urdu', nativeName: 'اردو',
        greeting: 'دھن سیتو میں خوش آمدید', tagline: 'AI سے چلنے والا قرض وصولی پلیٹ فارم',
        selectBtn: 'اردو میں جاری رکھیں', flag: '🇮🇳', region: 'اتر پردیش',
    },
    {
        code: 'ne-IN', name: 'Nepali', nativeName: 'नेपाली',
        greeting: 'धनसेतुमा स्वागत छ', tagline: 'AI-संचालित ऋण वसूली प्लेटफर्म',
        selectBtn: 'नेपालीमा जारी राख्नुहोस्', flag: '🇮🇳', region: 'नेपाल',
    },
    {
        code: 'bho-IN', name: 'Bhojpuri', nativeName: 'भोजपुरी',
        greeting: 'धनसेतु में आपका स्वागत बा', tagline: 'AI-संचालित ऋण वसूली मंच',
        selectBtn: 'भोजपुरी में जारी राखीं', flag: '🇮🇳', region: 'बिहार',
    },
];

interface LanguageSelectorProps {
    onSelect: (lang: AppLanguage) => void;
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);

    function handleSelect(lang: AppLanguage) {
        setSelected(lang.code);
        setTimeout(() => onSelect(lang), 350);
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'linear-gradient(135deg, #fdfbf7 0%, #f5f0e8 40%, #f0ebe0 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'flex-start',
            overflowY: 'auto',
            padding: '40px 20px 60px',
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeInDown 0.6s ease both' }}>
                {/* Coin icon */}
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(145deg, #f5c842, #e6a817, #c8860a)',
                    boxShadow: '0 0 30px rgba(245,200,66,0.4), 0 0 0 4px rgba(245,200,66,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', margin: '0 auto 20px',
                    animation: 'coinBounce 2s ease-in-out infinite',
                }}>
                    ₹
                </div>

                <div style={{
                    fontSize: '2.2rem', fontWeight: 900,
                    fontFamily: 'Space Grotesk, sans-serif',
                    background: 'linear-gradient(135deg, #0d9488, #16a34a, #f5c842)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text', marginBottom: 8,
                }}>
                    DhanSetu
                </div>

                <div style={{ color: '#8b7355', fontSize: '1rem', marginBottom: 6 }}>
                    Choose your preferred language
                </div>
                <div style={{ color: '#b3a08a', fontSize: '0.8rem' }}>
                    अपनी भाषा चुनें • ভাষা বেছে নিন • మీ భాషను ఎంచుకోండి
                </div>
            </div>

            {/* Language grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 14,
                width: '100%',
                maxWidth: 900,
            }}>
                {APP_LANGUAGES.map((lang, i) => {
                    const isHovered = hovered === lang.code;
                    const isSelected = selected === lang.code;
                    return (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang)}
                            onMouseEnter={() => setHovered(lang.code)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                background: isSelected
                                    ? 'linear-gradient(135deg, #0d9488, #16a34a)'
                                    : isHovered
                                        ? 'rgba(13,148,136,0.15)'
                                        : 'rgba(139, 90, 43, 0.04)',
                                border: `1.5px solid ${isSelected ? '#0d9488' : isHovered ? 'rgba(13,148,136,0.6)' : 'rgba(139, 90, 43, 0.12)'}`, borderRadius: 16,
                                padding: '18px 20px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                                transform: isSelected ? 'scale(0.97)' : isHovered ? 'translateY(-2px)' : 'none',
                                boxShadow: isHovered ? '0 8px 24px rgba(13,148,136,0.2)' : 'none',
                                animation: `fadeInUp 0.4s ease ${i * 0.04}s both`,
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(13,148,136,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.4rem', flexShrink: 0,
                                }}>
                                    {lang.flag}
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '1.1rem', fontWeight: 800,
                                        color: isSelected ? 'white' : '#3d2b1f',
                                        fontFamily: 'sans-serif',
                                        lineHeight: 1.2,
                                    }}>
                                        {lang.nativeName}
                                    </div>
                                    <div style={{
                                        fontSize: '0.72rem',
                                        color: isSelected ? 'rgba(255,255,255,0.7)' : '#8b7355',
                                        fontWeight: 500,
                                    }}>
                                        {lang.name} • {lang.region}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                fontSize: '0.78rem',
                                color: isSelected ? 'rgba(255,255,255,0.85)' : '#5a3e28',
                                lineHeight: 1.4,
                                marginBottom: 12,
                                fontFamily: 'sans-serif',
                            }}>
                                {lang.greeting}
                            </div>

                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '5px 12px',
                                borderRadius: 999,
                                background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(13,148,136,0.10)',
                                border: `1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(13,148,136,0.25)'}`, fontSize: '0.72rem',
                                fontWeight: 600,
                                color: isSelected ? 'white' : '#0d9488',
                                fontFamily: 'sans-serif',
                            }}>
                                {isSelected ? '✓ ' : ''}{lang.selectBtn}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer note */}
            <div style={{
                marginTop: 36, textAlign: 'center',
                color: '#b3a08a', fontSize: '0.72rem',
                animation: 'fadeInUp 0.6s ease 0.5s both',
            }}>
                You can change the language anytime from the settings • 23 languages supported
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
                @keyframes coinBounce {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25%      { transform: translateY(-6px) rotate(-5deg); }
                    75%      { transform: translateY(-3px) rotate(5deg); }
                }
            `}</style>
        </div>
    );
}
