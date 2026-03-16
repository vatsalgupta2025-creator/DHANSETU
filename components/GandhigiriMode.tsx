'use client';
import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { t, LangCode } from '@/lib/i18n';
import { LoanRecord } from '@/lib/data';
// Helper to cast lang to LangCode
type LanguageCode = LangCode;

// Gandhigiri principles from Gandhi's philosophy - translated names
const getGandhiPrinciples = (lang: LanguageCode) => [
    {
        id: 'satya',
        name: lang === 'hi-IN' ? 'सत्य (सच्चाई)' : lang === 'bn-IN' ? 'সত্য (সত্য)' : lang === 'te-IN' ? 'సత్యం (నిజం)' : lang === 'mr-IN' ? 'सत्य (सत्य)' : lang === 'ta-IN' ? 'சத்தியம் (உண்மை)' : lang === 'gu-IN' ? 'સત્ય (સત્ય)' : lang === 'kn-IN' ? 'ಸತ್ಯ (ಸತ್ಯ)' : lang === 'ml-IN' ? 'സത്യം (സത്യം)' : lang === 'pa-IN' ? 'ਸਤਿਆ (ਸੱਚ)' : lang === 'or-IN' ? 'ସତ୍ୟ (ସତ୍ୟ)' : lang === 'ur-IN' ? 'سچ (سچائی)' : 'Satya (Truth)',
        description: t('gandhi.satyaDesc', lang) || 'Honest, transparent communication about the situation',
        icon: '🕊️',
        color: '#16a34a',
        approach: t('gandhi.satyaApproach', lang) || 'Clear explanation of debt situation without threats or false claims',
    },
    {
        id: 'ahimsa',
        name: lang === 'hi-IN' ? 'अहिंसा (अहिंसा)' : lang === 'bn-IN' ? 'অহিংসা (অহিংসা)' : lang === 'te-IN' ? 'అహింస (అహింస)' : lang === 'mr-IN' ? 'अहिंसा (हिंसा न करणे)' : lang === 'ta-IN' ? 'அகிம்சை (கொல்லாமை)' : lang === 'gu-IN' ? 'અહિંસા (અહિંસા)' : lang === 'kn-IN' ? 'ಅಹಿಂಸೆ (ಅಹಿಂಸೆ)' : lang === 'ml-IN' ? 'അഹിംസ (അഹിംസ)' : lang === 'pa-IN' ? 'ਅਹਿੰਸਾ (ਹਿੰਸਾ ਤੋਂ ਬਿਨਾਂ)' : lang === 'or-IN' ? 'ଅହିଂସା (ଅହିଂସା)' : lang === 'ur-IN' ? 'عدم تشدد (تشدد کے بغیر)' : 'Ahimsa (Non-violence)',
        description: t('gandhi.ahimsaDesc', lang) || 'Respectful language that preserves borrower dignity',
        icon: '🤝',
        color: '#0d9488',
        approach: t('gandhi.ahimsaApproach', lang) || 'Polite, non-threatening tone that respects the borrower as a person',
    },
    {
        id: 'swaraj',
        name: lang === 'hi-IN' ? 'स्वराज (स्वायत्तता)' : lang === 'bn-IN' ? 'স্বরাজ (স্বায়ত্তশাসন)' : lang === 'te-IN' ? 'స్వరాజ్ (స్వయం పరిపాలన)' : lang === 'mr-IN' ? 'स्वराज्य (स्वयंशासन)' : lang === 'ta-IN' ? 'சுயராஜ்யம் (சுயாட்சி)' : lang === 'gu-IN' ? 'સ્વરાજ (સ્વશાસન)' : lang === 'kn-IN' ? 'ಸ್ವರಾಜ್ (ಸ್ವಯಂ ಆಡಳಿತ)' : lang === 'ml-IN' ? 'സ്വരാജ് (സ്വയംഭരണം)' : lang === 'pa-IN' ? 'ਸਵਰਾਜ (ਆਤਮਨਿਰਭਰਤਾ)' : lang === 'or-IN' ? 'ସ୍ୱରାଜ୍ (ଆତ୍ମନିର୍ଭରତା)' : lang === 'ur-IN' ? 'سوaraj (خود مختاری)' : 'Swaraj (Self-rule)',
        description: t('gandhi.swaraDesc', lang) || 'Empower borrowers with payment options they control',
        icon: '💪',
        color: '#f59e0b',
        approach: t('gandhi.swaraApproach', lang) || 'Offer flexible payment plans that borrower can choose and manage',
    },
    {
        id: 'sarvodaya',
        name: lang === 'hi-IN' ? 'सर्वोदय (सबका uplift)' : lang === 'bn-IN' ? 'সর্বোদয় (সকলের কল্যাণ)' : lang === 'te-IN' ? 'సర్వోదయ్ (అందరి మేలు)' : lang === 'mr-IN' ? 'सर्वोदय (सर्वांच्या हिताचे)' : lang === 'ta-IN' ? 'சர்வோதயம் (எல்லோருக்கும் நலன்)' : lang === 'gu-IN' ? 'સર્વોદય (બધાનું કલ્યાણ)' : lang === 'kn-IN' ? 'ಸರ್ವೋದಯ (ಎಲ್ಲರ ಉನ್ಮೇಷ)' : lang === 'ml-IN' ? 'സർവോദയ (എല്ലാവരുടെയും നന്മ)' : lang === 'pa-IN' ? 'ਸਰਵੋਦਿਆ (ਸਭ ਦਾ ਭਲਾ)' : lang === 'or-IN' ? 'ସର୍ବୋଦୟ (ସର୍ବଙ୍ଗ ଉନ୍ନତି)' : lang === 'ur-IN' ? 'سروودے (سب کی فلاح)' : 'Sarvodaya (Welfare of All)',
        description: t('gandhi.sarvodayaDesc', lang) || 'Show how repayment helps family and community',
        icon: '🏘️',
        color: '#8b5cf6',
        approach: t('gandhi.sarvodayaApproach', lang) || 'Connect repayment to family welfare and community standing',
    },
    {
        id: 'tapasya',
        name: lang === 'hi-IN' ? 'तपस्या (अनुशासन)' : lang === 'bn-IN' ? 'তপস্যা (শৃঙ্খলা)' : lang === 'te-IN' ? 'తపస్య (శిస్తు)' : lang === 'mr-IN' ? 'तपश्चर्या (शिस्त)' : lang === 'ta-IN' ? 'தவச்செயல் (பணிவு)' : lang === 'gu-IN' ? 'તપસ્યા (અનુશાસન)' : lang === 'kn-IN' ? 'ತಪಸ್ಯೆ (ಶಿಸ್ತು)' : lang === 'ml-IN' ? 'തപസ്യ (അനുശാസനം)' : lang === 'pa-IN' ? 'ਤਪੱਸਿਆ (ਅਨੁਸ਼ਾਸਨ)' : lang === 'or-IN' ? 'ତପସ୍ୟା (ଅନୁଶାସନ)' : lang === 'ur-IN' ? 'تپسیہ (انضباط)' : 'Tapasya (Discipline)',
        description: t('gandhi.tapasyaDesc', lang) || 'Encourage small daily efforts leading to big results',
        icon: '🎯',
        color: '#ec4899',
        approach: t('gandhi.tapasyaApproach', lang) || 'Micro-payment options that build financial discipline',
    },
    {
        id: 'sadhana',
        name: lang === 'hi-IN' ? 'साधना (अभ्यास)' : lang === 'bn-IN' ? 'সাধনা (অনুশীলন)' : lang === 'te-IN' ? 'సాధన (అభ్యాసం)' : lang === 'mr-IN' ? 'साधना (सराव)' : lang === 'ta-IN' ? 'சாதனை (பயிற்சி)' : lang === 'gu-IN' ? 'સાધના (સાધના)' : lang === 'kn-IN' ? 'ಸಾಧನೆ (ಅಭ್ಯಾಸ)' : lang === 'ml-IN' ? 'സാധന (അഭ്യാസം)' : lang === 'pa-IN' ? 'ਸਾਧਨਾ (ਸਾਧਨਾ)' : lang === 'or-IN' ? 'ସାଧନା (ଅଭ୍ୟାସ)' : lang === 'ur-IN' ? 'سادھنا (مشق)' : 'Sadhana (Practice)',
        description: t('gandhi.sadhanaDesc', lang) || 'Regular reminders as gentle practice, not harassment',
        icon: '📿',
        color: '#6366f1',
        approach: t('gandhi.sadhanaApproach', lang) || 'Consistent, gentle follow-ups at appropriate intervals',
    },
];

// Message templates based on Gandhigiri principles - ALL 12 LANGUAGES
const GANDHI_MESSAGE_TEMPLATES: Record<string, Record<string, string[]>> = {
    'en-IN': {
        satya: [
            "Namaste {name}, we want to be transparent about your loan of ₹{amount}. Your current overdue is ₹{overdue}. Let's work together to find a solution that works for you.",
            "Dear {name}, honesty is the foundation of trust. Your account shows ₹{overdue} overdue. We believe in finding honest solutions together.",
        ],
        ahimsa: [
            "{name}, we respect you and your situation. There's ₹{overdue} on your account, but we want to discuss this respectfully and find a peaceful resolution.",
            "With full respect for you and your family, {name}, we'd like to discuss your loan of ₹{overdue}. No pressure, just a conversation.",
        ],
        swaraj: [
            "{name}, you have the power to resolve this. Your overdue is ₹{overdue}. Choose a payment plan that works for you - daily, weekly, or monthly options available.",
            "Empower yourself, {name}! Your ₹{overdue} can be managed your way. Pick what suits your situation - we're here to support your choice.",
        ],
        sarvodaya: [
            "{name}, repaying ₹{overdue} protects your family's financial future and maintains your standing in the community. Your children will be proud of your responsibility.",
            "Think of your family's welfare, {name}. Clearing ₹{overdue} ensures peace at home and respect in society. This is for everyone's benefit.",
        ],
        tapasya: [
            "Small steps lead to big victories, {name}. Start with just ₹50/day towards your ₹{overdue}. In {days} days, you'll be free of this burden.",
            "Discipline brings freedom, {name}. Pay ₹100/day and clear ₹{overdue} in {days} days. Daily effort creates lasting change.",
        ],
        sadhana: [
            "{name}, we're here to gently remind you about ₹{overdue}. No rush, no pressure - just checking if you're ready to take a step today.",
            "A gentle nudge, {name}, about your ₹{overdue} balance. When you're ready, we're here. Until then, we send you peaceful thoughts.",
        ],
    },
    'hi-IN': {
        satya: [
            "नमस्ते {name}, हम आपके ₹{amount} के ऋण के बारे में पारदर्शी होना चाहते हैं। आपका वर्तमान बकाया ₹{overdue} है। आइए मिलकर एक समाधान खोजें।",
            "प्रिय {name}, सच्चाई विश्वास की नींव है। आपके खाते में ₹{overdue} बकाया है। हम मिलकर ईमानदार समाधान खोजने में विश्वास करते हैं।",
        ],
        ahimsa: [
            "{name}, हम आपका और आपकी स्थिति का सम्मान करते हैं। आपके खाते पर ₹{overdue} है, लेकिन हम इसका सम्मानजनक तरीके से समाधान चाहते हैं।",
            "आपको और आपके परिवार को पूरा सम्मान, {name}, हम आपके ₹{overdue} ऋण पर चर्चा करना चाहते हैं। कोई दबाव नहीं, बस एक बातचीत।",
        ],
        swaraj: [
            "{name}, इसे सुलझाने की शक्ति आपके पास है। आपका बकाया ₹{overdue} है। अपने लिए काम करने वाली भुगतान योजना चुनें।",
            "खुद को सशक्त बनाएं, {name}! आपका ₹{overdue} आपके तरीके से प्रबंधित किया जा सकता है। वह चुनें जो आपकी स्थिति के अनुकूल हो।",
        ],
        sarvodaya: [
            "{name}, ₹{overdue} का भुगतान करने से आपके परिवार का वित्तीय भविष्य सुरक्षित होता है। आपके बच्चे आपकी जिम्मेदारी पर गर्व करेंगे।",
            "अपने परिवार की भलाई के बारे में सोचें, {name}। ₹{overdue} चुकता करने से घर में शांति और समाज में सम्मान मिलता है।",
        ],
        tapasya: [
            "छोटे कदम बड़ी जीत की ओर ले जाते हैं, {name}। अपने ₹{overdue} के लिए रोज़ाना सिर्फ ₹50 से शुरू करें। {days} दिनों में आप मुक्त हो जाएंगे।",
            "अनुशासन स्वतंत्रता लाता है, {name}। रोज़ाना ₹100 का भुगतान करें और {days} दिनों में ₹{overdue} चुकता करें।",
        ],
        sadhana: [
            "{name}, हम ₹{overdue} के बारे में धीरे से याद दिलाने के लिए यहाँ हैं। कोई जल्दी नहीं, कोई दबाव नहीं - बस जांच रहे हैं कि क्या आज आप कदम उठाने के लिए तैयार हैं।",
            "एक हल्का सा संकेत, {name}, आपके ₹{overdue} बैलेंस के बारे में। जब आप तैयार हों, हम यहाँ हैं।",
        ],
    },
    'bn-IN': {
        satya: [
            "নমস্কার {name}, আমরা আপনার ₹{amount} ঋণ সম্পর্কে স্বচ্ছ হতে চাই। আপনার বর্তমান বকেয়া ₹{overdue}। চলুন একসাথে একটি সমাধান খুঁজুন।",
            "প্রিয় {name}, সত্যই বিশ্বাসের ভিত্তি। আপনার অ্যাকাউন্টে ₹{overdue} বকেয়া রয়েছে। আমরা একসাথে সৎ সমাধান খুঁজতে বিশ্বাসী।",
        ],
        ahimsa: [
            "{name}, আমরা আপনাকে এবং আপনার পরিস্থিতিকে শ্রদ্ধা করি। আপনার অ্যাকাউন্টে ₹{overdue} রয়েছে, কিন্তু আমরা সম্মানজনকভাবে সমাধান চাই।",
            "আপনাকে এবং আপনার পরিবারকে পূর্ণ শ্রদ্ধা, {name}, আমরা আপনার ₹{overdue} ঋণ নিয়ে আলোচনা করতে চাই। কোনো চাপ নয়, শুধু একটি কথোপকথন।",
        ],
        swaraj: [
            "{name}, এটি সমাধান করার ক্ষমতা আপনার হাতে। আপনার বকেয়া ₹{overdue}। আপনার জন্য কাজ করে এমন একটি পরিশোধ পরিকল্পনা চয়ন করুন।",
            "নিজেকে ক্ষমতায়িত করুন, {name}! আপনার ₹{overdue} আপনার উপায়ে পরিচালনা করা যেতে পারে। আপনার পরিস্থিতির জন্য যা উপযুক্ত তা বেছে নিন।",
        ],
        sarvodaya: [
            "{name}, ₹{overdue} পরিশোধ করলে আপনার পরিবারের আর্থিক ভবিষ্যৎ সুরক্ষিত হয়। আপনার সন্তানরা আপনার দায়িত্ব নিয়ে গর্বিত হবে।",
            "আপনার পরিবারের কল্যাণের কথা ভাবুন, {name}। ₹{overdue} পরিশোধ করলে বাড়িতে শান্তি এবং সমাজে সম্মান নিশ্চিত হয়।",
        ],
        tapasya: [
            "ছোট পদক্ষেপ বড় বিজয়ের দিকে নিয়ে যায়, {name}। আপনার ₹{overdue} এর জন্য প্রতিদিন মাত্র ₹50 দিয়ে শুরু করুন। {days} দিনের মধ্যে আপনি মুক্ত হবেন।",
            "শৃঙ্খলা স্বাধীনতা আনে, {name}। প্রতিদিন ₹100 পরিশোধ করুন এবং {days} দিনের মধ্যে ₹{overdue} পরিশোধ করুন।",
        ],
        sadhana: [
            "{name}, আমরা ₹{overdue} সম্পর্কে আলতো করে মনে করিয়ে দিতে এখানে আছি। কোনো তাড়াহুড়া নয়, কোনো চাপ নয় - শুধু দেখছি আজ আপনি কি পদক্ষেপ নেওয়ার জন্য প্রস্তুত।",
            "একটি নরম অনুস্মারক, {name}, আপনার ₹{overdue} ব্যালেন্স সম্পর্কে। যখন আপনি প্রস্তুত, আমরা এখানে আছি।",
        ],
    },
    'te-IN': {
        satya: [
            "నమస్తే {name}, మేము మీ ₹{amount} రుణం గురించి పారదర్శకంగా ఉండాలనుకుంటున్నాము. మీ ప్రస్తుత బకాయి ₹{overdue}. పరిష్కారం కోసం కలిసి పనిచేద్దాం.",
            "ప్రియమైన {name}, నిజాయితీ విశ్వాసం యొక్క పునాది. మీ ఖాతాలో ₹{overdue} బకాయి ఉంది. మేము కలిసి నిజాయితీ పరిష్కారాలను కనుగొనడానికి విశ్వసిస్తాము.",
        ],
        ahimsa: [
            "{name}, మేము మిమ్మల్ని మరియు మీ పరిస్థితిని గౌరవిస్తాము. మీ ఖాతాలో ₹{overdue} ఉంది, కానీ మేము గౌరవప్రదంగా పరిష్కారం కోరుకుంటున్నాము.",
            "మీకు మరియు మీ కుటుంబానికి పూర్తి గౌరవం, {name}, మేము మీ ₹{overdue} రుణం గురించి చర్చించాలనుకుంటున్నాము. ఒత్తిడి లేదు, కేవలం సంభాషణ.",
        ],
        swaraj: [
            "{name}, దీన్ని పరిష్కరించే శక్తి మీ చేతుల్లో ఉంది. మీ బకాయి ₹{overdue}. మీకు సరిపోయే చెల్లింపు ప్రణాళికను ఎంచుకోండి.",
            "మిమ్మల్ని మీరు సాధికారత చేసుకోండి, {name}! మీ ₹{overdue} మీ మార్గంలో నిర్వహించవచ్చు. మీ పరిస్థితికి సరిపోయేది ఎంచుకోండి.",
        ],
        sarvodaya: [
            "{name}, ₹{overdue} చెల్లించడం మీ కుటుంబ ఆర్థిక భవిష్యత్తను కాపాడుతుంది. మీ పిల్లలు మీ బాధ్యతపై గర్విస్తారు.",
            "మీ కుటుంబ శ్రేయస్సు గురించి ఆలోచించండి, {name}. ₹{overdue} చెల్లించడం ఇంట్లో శాంతిని మరియు సమాజంలో గౌరవాన్ని నిర్ధారిస్తుంది.",
        ],
        tapasya: [
            "చిన్న అడుగులు పెద్ద విజయాలకు దారితీస్తాయి, {name}. మీ ₹{overdue} కోసం రోజుకు కేవలం ₹50 తో ప్రారంభించండి. {days} రోజుల్లో మీరు విడుదల అవుతారు.",
            "శిస్తు స్వేచ్ఛను తెస్తుంది, {name}. రోజుకు ₹100 చెల్లించండి మరియు {days} రోజుల్లో ₹{overdue} తీర్చండి.",
        ],
        sadhana: [
            "{name}, మేము ₹{overdue} గురించి మెల్లగా గుర్తు చేయడానికి ఇక్కడ ఉన్నాము. త్వర లేదు, ఒత్తిడి లేదు - ఈరోజు మీరు అడుగు వేయడానికి సిద్ధంగా ఉన్నారా అని తనిఖీ చేస్తున్నాము.",
            "ఒక మృదువైన గుర్తు, {name}, మీ ₹{overdue} బ్యాలెన్స్ గురించి. మీరు సిద్ధంగా ఉన్నప్పుడు, మేము ఇక్కడే ఉన్నాము.",
        ],
    },
    'ta-IN': {
        satya: [
            "வணக்கம் {name}, உங்கள் ₹{amount} கடன் பற்றி வெளிப்படையாக இருக்க விரும்புகிறோம். உங்கள் தற்போதைய நிலுவை ₹{overdue}. ஒரு தீர்வை ஒன்றாகக் கண்டறிய வேண்டும்.",
            "அன்புள்ள {name}, நேர்மை நம்பிக்கையின் அடிப்படை. உங்கள் கணக்கில் ₹{overdue} நிலுவை உள்ளது. நாங்கள் நேர்மையான தீர்வுகளை ஒன்றாகக் கண்டறிய நம்புகிறோம்.",
        ],
        ahimsa: [
            "{name}, உங்களையும் உங்கள் சூழலையும் மதிக்கிறோம். உங்கள் கணக்கில் ₹{overdue} உள்ளது, ஆனால் மரியாதையுடன் தீர்வு வேண்டும்.",
            "உங்களுக்கும் உங்கள் குடும்பத்திற்கும் முழு மரியாதை, {name}, உங்கள் ₹{overdue} கடன் பற்றி விவாதிக்க விரும்புகிறோம். அழுத்தம் இல்லை, வெறும் உரையாடல்.",
        ],
        swaraj: [
            "{name}, இதைத் தீர்க்கும் சக்தி உங்கள் கைகளில் உள்ளது. உங்கள் நிலுவை ₹{overdue}. உங்களுக்குப் பிடித்த கட்டணத் திட்டத்தைத் தேர்வு செய்க.",
            "உங்களை சக்திவாய்ந்தவராக்குங்கள், {name}! உங்கள் ₹{overdue} உங்கள் வழியில் நிர்வகிக்கலாம். உங்கள் சூழலுக்கு ஏற்றதைத் தேர்வு செய்க.",
        ],
        sarvodaya: [
            "{name}, ₹{overdue} செலுத்துவது உங்கள் குடும்பத்தின் நிதி எதிர்காலத்தைப் பாதுகாக்கிறது. உங்கள் குழந்தைகள் உங்கள் பொறுப்பில் பெருமைப்படுவார்கள்.",
            "உங்கள் குடும்பத்தின் நலனைப் பற்றி சிந்தியுங்கள், {name}. ₹{overdue} செலுத்துவது வீட்டில் அமைதியையும் சமூகத்தில் மரியாதையையும் உறுதி செய்கிறது.",
        ],
        tapasya: [
            "சிறிய அடிகள் பெரிய வெற்றிகளுக்கு வழிவகுக்கின்றன, {name}. உங்கள் ₹{overdue} க்கு தினமும் வெறும் ₹50 இல் தொடங்கவும். {days} நாட்களில் நீங்கள் விடுதலை அடைவீர்கள்.",
            "பணிவு சுதந்திரத்தைக் கொண்டுவருகிறது, {name}. தினமும் ₹100 செலுத்தி {days} நாட்களில் ₹{overdue} தீர்க்கவும்.",
        ],
        sadhana: [
            "{name}, ₹{overdue} பற்றி மெதுவாக நினைவூட்ட இங்கு இருக்கிறோம். அவசரம் இல்லை, அழுத்தம் இல்லை - இன்று நீங்கள் அடியெடுக்கத் தயாரா என்று சரிபார்க்கிறோம்.",
            "ஒரு மென்மையான நினைவூட்டல், {name}, உங்கள் ₹{overdue} இருப்பு பற்றி. நீங்கள் தயாராகும்போது, நாங்கள் இங்கு இருக்கிறோம்.",
        ],
    },
    // Add more languages as needed - using English as fallback
    'mr-IN': {
        satya: ["नमस्कार {name}, आम्ही तुमच्या ₹{amount} कर्जाबद्दल पारदर्शक असू इच्छितो. तुमचे वर्तमान थकीत ₹{overdue} आहे. चला एकत्र समाधान शोधूया."],
        ahimsa: ["{name}, आम्ही तुमचा आणि तुमच्या परिस्थितीचा आदर करतो. तुमच्या खात्यावर ₹{overdue} आहे, पण आम्हाला सन्मानाने निवारण हवे आहे."],
        swaraj: ["{name}, हे सोडवण्याची शक्ती तुमच्या हातात आहे. तुमचे थकीत ₹{overdue} आहे. तुमच्यासाठी काम करणारा परतफेड करण्याचा तक्ता निवडा."],
        sarvodaya: ["{name}, ₹{overdue} फेडल्याने तुमच्या कुटुंबाचे आर्थिक भविष्य सुरक्षित होते. तुमची मुले तुमच्या जबाबदारीवर अभिमान बाळगतील."],
        tapasya: ["लहान पावले मोठ्या विजयाकडे नेतात, {name}. तुमच्या ₹{overdue} साठी रोज फक्त ₹50 ने सुरुवात करा. {days} दिवसांत तुम्ही मुक्त व्हाल."],
        sadhana: ["{name}, आम्ही ₹{overdue} बद्दल हळूवारपणे आठवण करून देण्यासाठी इथे आहोत. काही घाई नाही, काही दबाव नाही - फक्त तपासत आहोत की आज तुम्ही पाऊल उचलण्यास तयार आहात का."],
    },
    'gu-IN': {
        satya: ["નમસ્તે {name}, અમે તમારા ₹{amount} ઋણ વિશે પારદર્શક બનવા માંગીએ છીએ. તમારું વર્તમાન બાકી ₹{overdue} છે. ચાલો સાથે મળીને ઉકેલ શોધીએ."],
        ahimsa: ["{name}, અમે તમારું અને તમારી પરિસ્થિતિનું સન્માન કરીએ છીએ. તમારા ખાતામાં ₹{overdue} છે, પરંતુ અમે સન્માનપૂર્વક ઉકેલ ઇચ્છીએ છીએ."],
        swaraj: ["{name}, આનો ઉકેલ કરવાની શક્તિ તમારા હાથમાં છે. તમારું બાકી ₹{overdue} છે. તમારા માટે કામ કરતી ચૂકવણી યોજના પસંદ કરો."],
        sarvodaya: ["{name}, ₹{overdue} ચૂકવવાથી તમારા કુટુંબનું આર્થિક ભવિષ્ય સુરક્ષિત થાય છે. તમારા બાળકો તમારી જવાબદારી પર ગૌરવ અનુભવશે."],
        tapasya: ["નાના પગલાં મોટી જીત તરફ દોરી જાય છે, {name}. તમારા ₹{overdue} માટે રોજિંદા માત્ર ₹50 થી શરૂઆત કરો. {days} દિવસમાં તમે મુક્ત થઈ જશો."],
        sadhana: ["{name}, અમે ₹{overdue} વિશે હળવેથી યાદ અપાવવા અહીં છીએ. કોઈ ઉતાવળ નથી, કોઈ દબાણ નથી - ફક્ત તપાસી રહ્યા છીએ કે આજે તમે પગલું લેવા તૈયાર છો કે નહીં."],
    },
    'kn-IN': {
        satya: ["ನಮಸ್ಕಾರ {name}, ನಾವು ನಿಮ್ಮ ₹{amount} ಸಾಲಿನ ಬಗ್ಗೆ ಪಾರದರ್ಶಕವಾಗಿರಲು ಬಯಸುತ್ತೇವೆ. ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಬಾಕಿ ₹{overdue} ಆಗಿದೆ. ಬನ್ನಿ ಒಟ್ಟಿಗೆ ಪರಿಹಾರ ಹುಡುಕೋಣ."],
        ahimsa: ["{name}, ನಾವು ನಿಮ್ಮನ್ನು ಮತ್ತು ನಿಮ್ಮ ಸನ್ನಿವೇಶವನ್ನು ಗೌರವಿಸುತ್ತೇವೆ. ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ₹{overdue} ಇದೆ, ಆದರೆ ನಾವು ಗೌರವಯುತವಾಗಿ ಪರಿಹಾರವನ್ನು ಬಯಸುತ್ತೇವೆ."],
        swaraj: ["{name}, ಇದನ್ನು ಪರಿಹರಿಸುವ ಶಕ್ತಿ ನಿಮ್ಮ ಕೈಗಳಲ್ಲಿದೆ. ನಿಮ್ಮ ಬಾಕಿ ₹{overdue} ಆಗಿದೆ. ನಿಮಗಾಗಿ ಕೆಲಸ ಮಾಡುವ ಪಾವತಿ ಯೋಜನೆಯನ್ನು ಆರಿಸಿ."],
        sarvodaya: ["{name}, ₹{overdue} ಪಾವತಿಸುವುದರಿಂದ ನಿಮ್ಮ ಕುಟುಂಬದ ಹಣಕಾಸು ಭವಿಷ್ಯ ಸುರಕ್ಷಿತವಾಗುತ್ತದೆ. ನಿಮ್ಮ ಮಕ್ಕಳು ನಿಮ್ಮ ಜವಾಬ್ದಾರಿಯ ಬಗ್ಗೆ ಹೆಮ್ಮೆಪಡುತ್ತಾರೆ."],
        tapasya: ["ಚಿಕ್ಕ ಹೆಜ್ಜೆಗಳು ದೊಡ್ಡ ವಿಜಯದತ್ತ ಕರೆದೊಯ್ಯುತ್ತವೆ, {name}. ನಿಮ್ಮ ₹{overdue} ಗಾಗಿ ಪ್ರತಿದಿನ ಕೇವಲ ₹50 ರಿಂದ ಪ್ರಾರಂಭಿಸಿ. {days} ದಿನಗಳಲ್ಲಿ ನೀವು ಮುಕ್ತರಾಗುತ್ತೀರಿ."],
        sadhana: ["{name}, ನಾವು ₹{overdue} ಬಗ್ಗೆ ಮೆಲ್ಲನೆ ನೆನಪಿಸಲು ಇಲ್ಲಿದ್ದೇವೆ. ಯಾವುದೇ ತುರ್ತು ಇಲ್ಲ, ಯಾವುದೇ ಒತ್ತಡ ಇಲ್ಲ - ಇಂದು ನೀವು ಹೆಜ್ಜೆ ಇಡಲು ಸಿದ್ಧರಿದ್ದೀರಾ ಎಂದು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇವೆ."],
    },
    'ml-IN': {
        satya: ["നമസ്തെ {name}, നിങ്ങളുടെ ₹{amount} വായ്പ്പയെക്കുറിച്ച് പാരദർശകരാകാൻ ഞങ്ങൾ ആഗ്രഹിക്കുന്നു. നിങ്ങളുടെ നിലവിലെ കുടിശ്ശിക ₹{overdue} ആണ്. നമുക്ക് ഒരുമിച്ച് ഒരു പരിഹാരം കണ്ടെത്താം."],
        ahimsa: ["{name}, ഞങ്ങൾ നിങ്ങളെയും നിങ്ങളുടെ സാഹചര്യത്തെയും ബഹുമാനിക്കുന്നു. നിങ്ങളുടെ അക്കൗണ്ടിൽ ₹{overdue} ഉണ്ട്, പക്ഷേ ഞങ്ങൾ ആദരവോടെ പരിഹാരം ആഗ്രഹിക്കുന്നു."],
        swaraj: ["{name}, ഇത് പരിഹരിക്കാൻ കഴിവ് നിങ്ങളുടെ കയ്യിലുണ്ട്. നിങ്ങളുടെ കുടിശ്ശിക ₹{overdue} ആണ്. നിങ്ങൾക്ക് വേണ്ടി പ്രവർത്തിക്കുന്ന ഒരു പേയ്മെന്റ് പ്ലാൻ തിരഞ്ഞെടുക്കുക."],
        sarvodaya: ["{name}, ₹{overdue} തിരിച്ചടയ്ക്കുന്നത് നിങ്ങളുടെ കുടുംബത്തിന്റെ financial ഭാവി സുരക്ഷിതമാക്കുന്നു. നിങ്ങളുടെ കുട്ടികൾ നിങ്ങളുടെ ഉത്തരവാദിത്തത്തിൽ അഭിമാനിക്കും."],
        tapasya: ["ചെറിയ നടകൾ വലിയ വിജയത്തിലേക്ക് നയിക്കുന്നു, {name}. നിങ്ങളുടെ ₹{overdue} നായി ദിവസവും വെറും ₹50 മുതൽ തുടങ്ങുക. {days} ദിവസത്തിൽ നിങ്ങൾ സ്വതന്ത്രരാകും."],
        sadhana: ["{name}, ഞങ്ങൾ ₹{overdue} എന്നത് പതുക്കെ ഓർമ്മിപ്പിക്കാൻ ഇവിടെയുണ്ട്. അത്യാവശ്യമൊന്നുമില്ല, സമ്മർദ്ദമൊന്നുമില്ല - ഇന്ന് നിങ്ങൾ ഒരു ചുവട് വെയ്ക്കാൻ തയ്യാറാണോ എന്ന് പരിശോധിക്കുന്നു."],
    },
    'pa-IN': {
        satya: ["ਸਤ ਸ੍ਰੀ ਅਕਾਲ {name}, ਅਸੀਂ ਤੁਹਾਡੇ ₹{amount} ਕਰਜ਼ੇ ਬਾਰੇ ਪਾਰਦਰਸ਼ੀ ਹੋਣਾ ਚਾਹੁੰਦੇ ਹਾਂ। ਤੁਹਾਡਾ ਮੌਜੂਦਾ ਬਕਾਇਆ ₹{overdue} ਹੈ। ਆਓ ਮਿਲ ਕੇ ਇੱਕ ਹੱਲ ਲੱਭੀਏ।"],
        ahimsa: ["{name}, ਅਸੀਂ ਤੁਹਾਡਾ ਅਤੇ ਤੁਹਾਡੀ ਸਥਿਤੀ ਦਾ ਆਦਰ ਕਰਦੇ ਹਾਂ। ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ₹{overdue} ਹੈ, ਪਰ ਅਸੀਂ ਆਦਰ ਨਾਲ ਹੱਲ ਚਾਹੁੰਦੇ ਹਾਂ।"],
        swaraj: ["{name}, ਇਸ ਨੂੰ ਹੱਲ ਕਰਨ ਦੀ ਸ਼ਕਤੀ ਤੁਹਾਡੇ ਹੱਥ ਵਿੱਚ ਹੈ। ਤੁਹਾਡਾ ਬਕਾਇਆ ₹{overdue} ਹੈ। ਆਪਣੇ ਲਈ ਕੰਮ ਕਰਨ ਵਾਲਾ ਭੁਗਤਾਨ ਯੋਜਨਾ ਚੁਣੋ।"],
        sarvodaya: ["{name}, ₹{overdue} ਦਾ ਭੁਗਤਾਨ ਕਰਨ ਨਾਲ ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਦਾ financial ਭਵਿੱਖ ਸੁਰੱਖਿਅਤ ਹੁੰਦਾ ਹੈ। ਤੁਹਾਡੇ ਬੱਚੇ ਤੁਹਾਡੀ ਜ਼ਿੰਮੇਵਾਰੀ 'ਤੇ ਮਾਣ ਮਹਿਸੂਸ ਕਰਨਗੇ।"],
        tapasya: ["ਛੋਟੇ ਕਦਮ ਵੱਡੀ ਜਿੱਤ ਵੱਲ ਲੈ ਜਾਂਦੇ ਹਨ, {name}. ਆਪਣੇ ₹{overdue} ਲਈ ਰੋਜ਼ਾਨਾ ਸਿਰਫ਼ ₹50 ਨਾਲ ਸ਼ੁਰੂ ਕਰੋ। {days} ਦਿਨਾਂ ਵਿੱਚ ਤੁਸੀਂ ਮੁਕਤ ਹੋ ਜਾਓਗੇ।"],
        sadhana: ["{name}, ਅਸੀਂ ₹{overdue} ਬਾਰੇ ਹੌਲੀ ਨਾਲ ਯਾਦ ਦਿਵਾਉਣ ਲਈ ਇੱਥੇ ਹਾਂ। ਕੋਈ ਜਲਦਬਾਜ਼ੀ ਨਹੀਂ, ਕੋਈ ਦਬਾਅ ਨਹੀਂ - ਸਿਰਫ਼ ਜਾਂਚ ਰਹੇ ਹਾਂ ਕਿ ਕੀ ਤੁਸੀਂ ਅੱਜ ਕਦਮ ਚੁੱਕਣ ਲਈ ਤਿਆਰ ਹੋ।"],
    },
    'or-IN': {
        satya: ["ନମସ୍କାର {name}, ଆମେ ଆପଣଙ୍କ ₹{amount} ଋଣ ବିଷୟରେ ସ୍ୱଚ୍ଛ ହେବାକୁ ଚାହୁଁଛୁ। ଆପଣଙ୍କର ବର୍ତ୍ତମାନ ବକେୟା ₹{overdue} ଅଟେ। ଆସନ୍ତୁ ମିଶିକରି ଏକ ସମାଧାନ ଖୋଜିବା।"],
        ahimsa: ["{name}, ଆମେ ଆପଣଙ୍କୁ ଏବଂ ଆପଣଙ୍କର ପରିସ୍ଥିତିକୁ ସମ୍ମାନ କରୁଛୁ। ଆପଣଙ୍କର ଖାତାରେ ₹{overdue} ଅଛି, କିନ୍ତୁ ଆମେ ସମ୍ମାନଜନକ ସମାଧାନ ଚାହୁଁଛୁ।"],
        swaraj: ["{name}, ଏହାକୁ ସମାଧାନ କରିବାର ଶକ୍ତି ଆପଣଙ୍କର ହାତରେ ଅଛି। ଆପଣଙ୍କର ବକେୟା ₹{overdue} ଅଟେ। ଆପଣଙ୍କ ପାଇଁ କାମ କରୁଥିବା ପାରିଶୋଧ ଯୋଜନା ବାଛନ୍ତୁ।"],
        sarvodaya: ["{name}, ₹{overdue} ପାରିଶୋଧ କରିବା ଆପଣଙ୍କର ପରିବାରର ଆର୍ଥିକ ଭବିଷ୍ୟତ୍ ସୁରକ୍ଷିତ କରେ। ଆପଣଙ୍କର ପିଲାମାନେ ଆପଣଙ୍କର ଦାୟିତ୍ୱ ଉପରେ ଗର୍ବ ଅନୁଭବ କରିବେ।"],
        tapasya: ["ସାନ ପଦକ୍ଷେପ ବଡ଼ ବିଜୟ ଆଡ଼େ ନେଇଥାଏ, {name}। ଆପଣଙ୍କର ₹{overdue} ପାଇଁ ପ୍ରତିଦିନ ମାତ୍ର ₹50 ରୁ ଆରମ୍ଭ କରନ୍ତୁ। {days} ଦିନରେ ଆପଣ ମୁକ୍ତ ହୋଇଯିବେ।"],
        sadhana: ["{name}, ଆମେ ₹{overdue} ବିଷୟରେ ଧୀରେ ସ୍ମରଣ କରାଇବାକୁ ଏଠାରେ ଅଛୁ। କୌଣସି ତାଡ଼ାହୁଡ଼ା ନାହିଁ, କୌଣସି ଚାପ ନାହିଁ - କେବଳ ଯାଞ୍ଚ କରୁଛୁ ଯେ ଆଜି ଆପଣ ପଦକ୍ଷେପ ନେବାକୁ ପ୍ରସ୍ତୁତ କି ନାହିଁ।"],
    },
    'ur-IN': {
        satya: ["السلام علیکم {name}، ہم آپ کے ₹{amount} قرض کے بارے میں شفاف ہونا چاہتے ہیں۔ آپ کی موجودہ واجب الادا رقم ₹{overdue} ہے۔ آئیے مل کر ایک حل تلاش کریں۔"],
        ahimsa: ["{name}، ہم آپ کی اور آپ کی صورت حال کی عزت کرتے ہیں۔ آپ کے کھاتے میں ₹{overdue} ہے، لیکن ہم عزت سے حل چاہتے ہیں۔"],
        swaraj: ["{name}، اسے حل کرنے کی طاقت آپ کے ہاتھ میں ہے۔ آپ کی واجب الادا رقم ₹{overdue} ہے۔ اپنے لیے کام کرنے والا ادائیگی کا منصوبہ منتخب کریں۔"],
        sarvodaya: ["{name}، ₹{overdue} ادا کرنے سے آپ کے خاندان کا مالی مستقبل محفوظ ہوتا ہے۔ آپ کے بچے آپ کی ذمہ داری پر فخر محسوس کریں گے۔"],
        tapasya: ["چھوٹے قدم بڑی کامیابی کی طرف لے جاتے ہیں، {name}۔ اپنے ₹{overdue} کے لیے روزانہ صرف ₹50 سے شروع کریں۔ {days} دنوں میں آپ آزاد ہو جائیں گے۔"],
        sadhana: ["{name}، ہم ₹{overdue} کے بارے میں آہستہ سے یاد دلانے کے لیے یہاں ہیں۔ کوئی جلدبازی نہیں، کوئی دباؤ نہیں - صرف چیک کر رہے ہیں کہ آج آپ قدم اٹھانے کے لیے تیار ہیں یا نہیں۔"],
    },
};

export default function GandhigiriMode() {
    const { loanData, appLanguage, selectedBank } = useApp();
    const lang = (appLanguage?.code || 'en-IN') as LanguageCode;
    const GANDHI_PRINCIPLES = useMemo(() => getGandhiPrinciples(lang), [lang]);

    const [selectedPrinciple, setSelectedPrinciple] = useState(GANDHI_PRINCIPLES[0]);
    const [previewMessage, setPreviewMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedBorrower, setSelectedBorrower] = useState<LoanRecord | null>(null);
    const [microPayment, setMicroPayment] = useState(50);

    const highRiskBorrowers = loanData.filter(d => d.risk.riskTier === 'High' || d.risk.riskTier === 'Critical').slice(0, 5);

    const generateMessage = () => {
        setIsGenerating(true);
        const templates = GANDHI_MESSAGE_TEMPLATES[lang]?.[selectedPrinciple.id] ||
            GANDHI_MESSAGE_TEMPLATES['en-IN'][selectedPrinciple.id];
        const template = templates[Math.floor(Math.random() * templates.length)];

        const borrower = selectedBorrower || highRiskBorrowers[0];
        if (!borrower) {
            setPreviewMessage('No borrower selected');
            setIsGenerating(false);
            return;
        }

        const days = Math.ceil(borrower.loan.overdueAmount / microPayment);

        const message = template
            .replace('{name}', borrower.customer.name.split(' ')[0])
            .replace('{amount}', borrower.loan.outstandingAmount.toLocaleString())
            .replace('{overdue}', borrower.loan.overdueAmount.toLocaleString())
            .replace('{days}', days.toString());

        setTimeout(() => {
            setPreviewMessage(message);
            setIsGenerating(false);
        }, 800);
    };

    const getDaysText = () => {
        if (!selectedBorrower) return '';
        const days = Math.ceil(selectedBorrower.loan.overdueAmount / microPayment);
        const template = t('gandhi.clearDebtDays', lang) || 'Clear debt in {days} days with ₹{amount}/day';
        return template.replace('{days}', days.toString()).replace('{amount}', microPayment.toString());
    };

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 40 }}>🕊️</span>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t('gandhi.title', lang)}
                    </h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 600 }}>
                    {t('gandhi.subtitle', lang)}
                </p>
            </div>

            {/* Message Studio Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* Left Column - Principles */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {t('gandhi.selectPrinciple', lang)}
                        </h3>

                        {GANDHI_PRINCIPLES.map(principle => (
                            <div
                                key={principle.id}
                                onClick={() => setSelectedPrinciple(principle)}
                                style={{
                                    padding: 16,
                                    borderRadius: 12,
                                    background: selectedPrinciple.id === principle.id ? `${principle.color}15` : 'var(--bg-surface)',
                                    border: `2px solid ${selectedPrinciple.id === principle.id ? principle.color : 'var(--border)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <span style={{ fontSize: 28 }}>{principle.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, color: principle.color }}>{principle.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{principle.description}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, paddingLeft: 40 }}>
                                    {principle.approach}
                                </div>
                            </div>
                        ))}

                        {/* Borrower Selection */}
                        <div style={{ marginTop: 16 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>{t('gandhi.selectBorrower', lang)}</h3>
                            <select
                                onChange={(e) => {
                                    const borrower = loanData.find(b => b.customer.id === e.target.value);
                                    setSelectedBorrower(borrower || null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    fontSize: '0.9rem',
                                }}
                            >
                                <option value="">{lang === 'hi-IN' ? 'ऋणी चुनें...' : lang === 'ta-IN' ? 'கடனாளியைத் தேர்வு செய்க...' : 'Select a borrower...'}</option>
                                {highRiskBorrowers.map(borrower => (
                                    <option key={borrower.customer.id} value={borrower.customer.id}>
                                        {borrower.customer.name} - ₹{borrower.loan.overdueAmount.toLocaleString()} {lang === 'hi-IN' ? 'बकाया' : 'overdue'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Micro-payment slider */}
                        <div style={{ marginTop: 16 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>
                                {t('gandhi.dailyMicroPayment', lang)}: ₹{microPayment}
                            </h3>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={microPayment}
                                onChange={(e) => setMicroPayment(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                {getDaysText()}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('gandhi.messagePreview', lang)}</h3>
                            <button
                                onClick={generateMessage}
                                disabled={isGenerating}
                                style={{
                                    padding: '10px 20px',
                                    background: 'var(--teal)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    opacity: isGenerating ? 0.7 : 1,
                                }}
                            >
                                {isGenerating ? t('gandhi.generating', lang) : t('gandhi.generateMessage', lang)}
                            </button>
                        </div>

                        <div style={{
                            background: 'var(--bg-surface)',
                            borderRadius: 16,
                            padding: 24,
                            border: '2px solid var(--border)',
                            minHeight: 200,
                        }}>
                            {previewMessage ? (
                                <div>
                                    <div style={{
                                        padding: 16,
                                        background: `${selectedPrinciple.color}10`,
                                        borderLeft: `4px solid ${selectedPrinciple.color}`,
                                        borderRadius: 8,
                                        fontSize: '1rem',
                                        lineHeight: 1.6,
                                        color: 'var(--text-primary)',
                                    }}>
                                        {previewMessage}
                                    </div>

                                    <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                                        <button
                                            style={{
                                                padding: '10px 20px',
                                                background: selectedPrinciple.color,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {t('gandhi.sendMessage', lang)}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                                    {lang === 'hi-IN' ? 'संदेश देखने के लिए "संदेश बनाएं" पर क्लिक करें' :
                                        lang === 'ta-IN' ? 'செய்தியைப் பார்க்க "செய்தியை உருவாக்கு" ஐக் கிளிக் செய்க' :
                                            'Click "Generate Message" to see Gandhigiri-powered recovery message'}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div style={{
                            background: 'linear-gradient(135deg, #16a34a15, #0d948815)',
                            borderRadius: 16,
                            padding: 20,
                            border: '1px solid #16a34a30',
                        }}>
                            <h4 style={{ fontWeight: 600, marginBottom: 12, color: '#16a34a' }}>{t('gandhi.impact', lang)}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>34%</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('gandhi.higherResponse', lang)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d9488' }}>89%</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('gandhi.satisfaction', lang)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>₹2.4Cr</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('gandhi.recovered', lang)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>0</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('gandhi.complaints', lang)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (


        </div>
    );
}
