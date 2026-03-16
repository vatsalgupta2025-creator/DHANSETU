// Celebrity Voice Configuration for Gandhigiri Mode
// These voices use REAL ElevenLabs pre-made voice IDs as defaults.
// For production, clone actual celebrity voices in your ElevenLabs dashboard and replace the IDs.
// Current setup: Uses ElevenLabs pre-made voices that approximate each celebrity's vocal style.
// Amitabh Bachchan = 'onwK4e9ZLuTAKqWW03F9' (Daniel - deep authoritative baritone)

export interface CelebrityVoice {
    id: string;
    name: string;
    displayName: string;
    language: string;
    languages?: string[]; // Array of supported languages (for backwards compatibility)
    region: string;
    style: string;
    avatar: string;
    sampleText: string;
    description: string;
    gender: 'male' | 'female';
    trustScore?: number; // Trust/recovery effectiveness score (0-100)
    elevenLabsVoiceId?: string; // The actual ElevenLabs voice ID
}

// Hindi Celebrity Voices
export const HINDI_VOICES: CelebrityVoice[] = [
    {
        id: 'amitabh-hindi',
        name: 'Amitabh Bachchan',
        displayName: 'अमिताभ बच्चन',
        language: 'hi-IN',
        languages: ['hi-IN', 'en-IN'],
        region: 'Bollywood',
        style: 'Authoritative, trustworthy, fatherly',
        avatar: '🎭',
        sampleText: 'नमस्ते, मैं अमिताभ बच्चन बोल रहा हूँ। आपका ऋण चुकाना आपके परिवार के लिए बहुत ज़रूरी है।',
        description: 'The legendary Bollywood superstar known for his commanding yet empathetic voice',
        gender: 'male',
        trustScore: 94,
        elevenLabsVoiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - deep authoritative baritone (closest to Amitabh)
    },
    {
        id: 'shahrukh-hindi',
        name: 'Shah Rukh Khan',
        displayName: 'शाहरुख़ खान',
        language: 'hi-IN',
        languages: ['hi-IN', 'en-IN'],
        region: 'Bollywood',
        style: 'Charming, romantic, persuasive',
        avatar: '✨',
        sampleText: 'नमस्ते दोस्तों, मैं शाहरुख़ खान। अपने ऋण को समय पर चुकाना वित्तीय जिम्मेदारी का प्रतीक है।',
        description: 'The King of Bollywood with a charismatic and persuasive voice',
        gender: 'male',
        trustScore: 92,
        elevenLabsVoiceId: 'N2lVS1w4EtoT3dr4eOWO', // Callum - charming, persuasive male
    },
    {
        id: 'aamir-hindi',
        name: 'Aamir Khan',
        displayName: 'आमिर खान',
        language: 'hi-IN',
        languages: ['hi-IN', 'en-IN'],
        region: 'Bollywood',
        style: 'Intellectual, sincere, educational',
        avatar: '🎬',
        sampleText: 'नमस्ते, मैं आमिर खान। वित्तीय समझदारी हमारे जीवन का महत्वपूर्ण हिस्सा है।',
        description: 'Perfectionist actor known for socially relevant films and thoughtful communication',
        gender: 'male',
        trustScore: 90,
        elevenLabsVoiceId: 'CYw3kZ02Hs0563khs1Fj', // Dave - thoughtful, sincere male
    },
    {
        id: 'farmer-hindi',
        name: 'Kisan Advisor',
        displayName: 'किसान सलाहकार',
        language: 'hi-IN',
        languages: ['hi-IN', 'pa-IN', 'mr-IN'],
        region: 'Rural India',
        style: 'Rural, friendly, down-to-earth',
        avatar: '🌾',
        sampleText: 'किसान भाइयों, आपका कर्ज चुकाना आपकी ज़मीन और इज्जत बचाने के लिए ज़रूरी है।',
        description: 'Authentic rural voice that resonates with farmers and rural borrowers',
        gender: 'male',
        trustScore: 95,
        elevenLabsVoiceId: 'ZQe5CZNOzWyzPSCn5a3c', // James - warm, friendly male
    },
];

// Tamil Celebrity Voices
export const TAMIL_VOICES: CelebrityVoice[] = [
    {
        id: 'rajinikanth-tamil',
        name: 'Rajinikanth',
        displayName: 'ரஜினிகாந்த்',
        language: 'ta-IN',
        languages: ['ta-IN', 'en-IN'],
        region: 'Kollywood',
        style: 'Humble, commanding, inspiring',
        avatar: '🕶️',
        sampleText: 'வணக்கம், நான் ரஜினிகாந்த். உங்கள் கடனை செலுத்துவது உங்கள் குடும்பத்திற்கு முக்கியம்.',
        description: 'Superstar known for his humility and powerful screen presence',
        gender: 'male',
        trustScore: 96,
        elevenLabsVoiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - commanding, powerful male
    },
    {
        id: 'vijay-tamil',
        name: 'Vijay',
        displayName: 'விஜய்',
        language: 'ta-IN',
        languages: ['ta-IN', 'en-IN'],
        region: 'Kollywood',
        style: 'Youthful, energetic, motivational',
        avatar: '🔥',
        sampleText: 'வணக்கம் நண்பர்களே, நான் விஜய். கடனை செலுத்துவது நமது கடமை.',
        description: 'Popular actor with massive youth following and motivational appeal',
        gender: 'male',
        trustScore: 93,
        elevenLabsVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni - youthful, energetic male
    },
];

// Telugu Celebrity Voices
export const TELUGU_VOICES: CelebrityVoice[] = [
    {
        id: 'nagarjuna-telugu',
        name: 'Nagarjuna',
        displayName: 'నాగార్జున',
        language: 'te-IN',
        languages: ['te-IN', 'en-IN'],
        region: 'Tollywood',
        style: 'Elegant, respectful, sophisticated',
        avatar: '👑',
        sampleText: 'నమస్కారం, నేను నాగార్జున. మీ అప్పు తీర్చడం మీ కుటుంబానికి చాలా ముఖ్యం.',
        description: 'Veteran actor known for his dignified and elegant persona',
        gender: 'male',
        trustScore: 91,
        elevenLabsVoiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - sophisticated male
    },
    {
        id: 'mahesh-telugu',
        name: 'Mahesh Babu',
        displayName: 'మహేష్ బాబు',
        language: 'te-IN',
        languages: ['te-IN', 'en-IN'],
        region: 'Tollywood',
        style: 'Charismatic, modern, trustworthy',
        avatar: '🌟',
        sampleText: 'నమస్కారం, నేను మహేష్ బాబు. ఆర్థిక బాధ్యత మన బాధ్యత.',
        description: 'Prince of Telugu cinema with a modern and trustworthy appeal',
        gender: 'male',
        trustScore: 92,
        elevenLabsVoiceId: 'N2lVS1w4EtoT3dr4eOWO', // Callum - modern, charismatic
    },
];

// Bengali Celebrity Voices
export const BENGALI_VOICES: CelebrityVoice[] = [
    {
        id: 'amitabh-bengali',
        name: 'Amitabh Bachchan',
        displayName: 'অমিতাভ বচ্চন',
        language: 'bn-IN',
        region: 'Bollywood/Bengali',
        style: 'Dignified, respectful, iconic',
        avatar: '🎭',
        sampleText: 'নমস্কার, আমি অমিতাভ বচ্চন। আপনার ঋণ পরিশোধ করা আপনার পরিবারের জন্য জরুরি।',
        description: 'The legendary actor with cross-cultural appeal',
        gender: 'male',
        elevenLabsVoiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - deep baritone (Amitabh)
    },
];

// Marathi Celebrity Voices
export const MARATHI_VOICES: CelebrityVoice[] = [
    {
        id: 'nana-marathi',
        name: 'Nana Patekar',
        displayName: 'नाना पाटेकर',
        language: 'mr-IN',
        region: 'Marathi Cinema',
        style: 'Intense, honest, direct',
        avatar: '💪',
        sampleText: 'नमस्कार, मी नाना पाटेकर. कर्ज फेडणं ही तुमची जबाबदारी आहे.',
        description: 'Intense actor known for his honest and straightforward communication',
        gender: 'male',
        elevenLabsVoiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - intense, direct male
    },
];

// Gujarati Celebrity Voices
export const GUJARATI_VOICES: CelebrityVoice[] = [
    {
        id: 'amitabh-gujarati',
        name: 'Amitabh Bachchan',
        displayName: 'અમિતાભ બચ્ચન',
        language: 'gu-IN',
        region: 'Bollywood/Gujarati',
        style: 'Respectful, iconic, trustworthy',
        avatar: '🎭',
        sampleText: 'નમસ્તે, હું અમિતાભ બચ્ચન. તમારું ઋણ ચૂકવવું તમારા પરિવાર માટે ખૂબ જરૂરી છે.',
        description: 'The legendary actor with universal appeal across languages',
        gender: 'male',
        elevenLabsVoiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - deep baritone (Amitabh)
    },
];

// Kannada Celebrity Voices
export const KANNADA_VOICES: CelebrityVoice[] = [
    {
        id: 'puneeth-kannada',
        name: 'Puneeth Rajkumar',
        displayName: 'ಪುನೀತ್ ರಾಜ್‌ಕುಮಾರ್',
        language: 'kn-IN',
        region: 'Sandalwood',
        style: 'Youthful, energetic, beloved',
        avatar: '⭐',
        sampleText: 'ನಮಸ್ಕಾರ, ನಾನು ಪುನೀತ್ ರಾಜ್‌ಕುಮಾರ್. ನಿಮ್ಮ ಸಾಲವನ್ನು ತೀರಿಸುವುದು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಮುಖ್ಯ.',
        description: 'Beloved Power Star known for his generosity and connection with masses',
        gender: 'male',
        elevenLabsVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni - energetic, beloved
    },
    {
        id: 'yash-kannada',
        name: 'Yash',
        displayName: 'ಯಶ್',
        language: 'kn-IN',
        region: 'Sandalwood',
        style: 'Powerful, inspiring, determined',
        avatar: '🔥',
        sampleText: 'ನಮಸ್ಕಾರ, ನಾನು ಯಶ್. ಸಾಲ ತೀರಿಸುವುದು ನಮ್ಮೆಲ್ಲರ ಕರ್ತವ್ಯ.',
        description: 'Rocking Star with massive pan-India appeal and inspiring journey',
        gender: 'male',
        elevenLabsVoiceId: 'VR6AewLTigWG4xSOukaG', // Arnold - powerful, determined
    },
];

// Malayalam Celebrity Voices
export const MALAYALAM_VOICES: CelebrityVoice[] = [
    {
        id: 'mohanlal-malayalam',
        name: 'Mohanlal',
        displayName: 'മോഹൻലാൽ',
        language: 'ml-IN',
        region: 'Mollywood',
        style: 'Versatile, natural, relatable',
        avatar: '👑',
        sampleText: 'നമസ്കാരം, ഞാൻ മോഹൻലാൽ. നിങ്ങളുടെ വായ്പ്പ തിരിച്ചടയ്ക്കുന്നത് നിങ്ങളുടെ കുടുംബത്തിന് വളരെ പ്രധാനമാണ്.',
        description: 'Complete actor with incredible versatility and natural appeal',
        gender: 'male',
        elevenLabsVoiceId: 'CYw3kZ02Hs0563khs1Fj', // Dave - versatile, natural male
    },
    {
        id: 'mammootty-malayalam',
        name: 'Mammootty',
        displayName: 'മമ്മൂട്ടി',
        language: 'ml-IN',
        region: 'Mollywood',
        style: 'Dignified, elegant, commanding',
        avatar: '🎩',
        sampleText: 'നമസ്കാരം, ഞാൻ മമ്മൂട്ടി. സാമ്പത്തിക ബാധ്യത നിറവേറ്റുന്നത് നമ്മുടെ കടമാണ്.',
        description: 'Megastar known for his dignified presence and commanding voice',
        gender: 'male',
        elevenLabsVoiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - dignified, commanding male
    },
];

// Punjabi Celebrity Voices
export const PUNJABI_VOICES: CelebrityVoice[] = [
    {
        id: 'diljit-punjabi',
        name: 'Diljit Dosanjh',
        displayName: 'ਦਿਲਜੀਤ ਦੋਸਾਂਝ',
        language: 'pa-IN',
        region: 'Punjabi Cinema',
        style: 'Cool, friendly, contemporary',
        avatar: '🎤',
        sampleText: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਦਿਲਜੀਤ ਦੋਸਾਂਝ। ਆਪਣੇ ਕਰਜ਼ੇ ਦਾ ਭੁਗਤਾਨ ਕਰਨਾ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਲਈ ਮਹੱਤਵਪੂਰਨ ਹੈ।',
        description: 'Popular singer and actor with massive youth appeal across India',
        gender: 'male',
        elevenLabsVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni - cool, friendly male
    },
];

// English Indian Accent Voices
export const ENGLISH_VOICES: CelebrityVoice[] = [
    {
        id: 'amitabh-english',
        name: 'Amitabh Bachchan',
        displayName: 'Amitabh Bachchan',
        language: 'en-IN',
        region: 'Bollywood/Global',
        style: 'Iconic, distinguished, fatherly',
        avatar: '🎭',
        sampleText: 'Namaste, this is Amitabh Bachchan. Repaying your loan on time is a matter of honor and responsibility.',
        description: 'The most iconic Indian voice with global recognition',
        gender: 'male',
        elevenLabsVoiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - deep baritone (Amitabh primary voice)
    },
    {
        id: 'irrfan-english',
        name: 'Irrfan Khan',
        displayName: 'Irrfan Khan',
        language: 'en-IN',
        region: 'Bollywood/Hollywood',
        style: 'Deep, thoughtful, artistic',
        avatar: '🎨',
        sampleText: 'Hello, this is Irrfan. Financial responsibility is the foundation of a secure future for your family.',
        description: 'Internationally acclaimed actor with a distinctive deep voice',
        gender: 'male',
        elevenLabsVoiceId: 'CYw3kZ02Hs0563khs1Fj', // Dave - deep, thoughtful male
    },
    {
        id: 'priyanka-english',
        name: 'Priyanka Chopra',
        displayName: 'Priyanka Chopra',
        language: 'en-IN',
        region: 'Bollywood/Hollywood',
        style: 'Confident, modern, empowering',
        avatar: '💫',
        sampleText: 'Hi, this is Priyanka Chopra. Taking charge of your finances empowers you and secures your family\'s future.',
        description: 'Global icon known for her confident and empowering persona',
        gender: 'female',
        elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - confident female
    },
];

// Generic fallback voices using ElevenLabs pre-made voices
export const GENERIC_VOICES: CelebrityVoice[] = [
    {
        id: 'generic-indian',
        name: 'Neerja (Indian Accent)',
        displayName: 'Neerja',
        language: 'en-IN',
        region: 'India',
        style: 'Professional, clear, warm',
        avatar: '👩',
        sampleText: 'Namaste, I am here to help you understand your loan repayment options.',
        description: 'Professional Indian female voice with neutral accent',
        gender: 'female',
        elevenLabsVoiceId: 'TX3AEvVoIzMeN6rKPMjZ', // ElevenLabs pre-made voice
    },
    {
        id: 'generic-male',
        name: 'Adam (Professional)',
        displayName: 'Adam',
        language: 'en-IN',
        region: 'International',
        style: 'Professional, clear, trustworthy',
        avatar: '👨',
        sampleText: 'Hello, I can help you understand your repayment options in detail.',
        description: 'Professional male voice for general purpose use',
        gender: 'male',
        elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB', // ElevenLabs pre-made voice
    },
    {
        id: 'generic-female',
        name: 'Bella (Professional)',
        displayName: 'Bella',
        language: 'en-IN',
        region: 'International',
        style: 'Professional, friendly, approachable',
        avatar: '👩‍💼',
        sampleText: 'Hello, I am here to assist you with your loan repayment journey.',
        description: 'Professional female voice for general purpose use',
        gender: 'female',
        elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL', // ElevenLabs pre-made voice
    },
];

// All voices combined
export const ALL_VOICES: CelebrityVoice[] = [
    ...HINDI_VOICES,
    ...TAMIL_VOICES,
    ...TELUGU_VOICES,
    ...BENGALI_VOICES,
    ...MARATHI_VOICES,
    ...GUJARATI_VOICES,
    ...KANNADA_VOICES,
    ...MALAYALAM_VOICES,
    ...PUNJABI_VOICES,
    ...ENGLISH_VOICES,
    ...GENERIC_VOICES,
];

// Get voices by language
export function getVoicesByLanguage(lang: string): CelebrityVoice[] {
    const voices = ALL_VOICES.filter(v => v.language === lang);
    // Always add generic voices as fallback
    const generics = GENERIC_VOICES.filter(v => !voices.some(voice => voice.id === v.id));
    return [...voices, ...generics];
}

// Get voice by ID
export function getVoiceById(id: string): CelebrityVoice | undefined {
    return ALL_VOICES.find(v => v.id === id);
}

// Default voice for each language
export function getDefaultVoice(lang: string): CelebrityVoice {
    const voices = getVoicesByLanguage(lang);
    return voices[0] || GENERIC_VOICES[0];
}

// Map language to voice list
export const LANGUAGE_VOICE_MAP: Record<string, CelebrityVoice[]> = {
    'hi-IN': HINDI_VOICES,
    'ta-IN': TAMIL_VOICES,
    'te-IN': TELUGU_VOICES,
    'bn-IN': BENGALI_VOICES,
    'mr-IN': MARATHI_VOICES,
    'gu-IN': GUJARATI_VOICES,
    'kn-IN': KANNADA_VOICES,
    'ml-IN': MALAYALAM_VOICES,
    'pa-IN': PUNJABI_VOICES,
    'en-IN': ENGLISH_VOICES,
};
