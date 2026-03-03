'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/context';

interface Message {
    id: string;
    role: 'bot' | 'user';
    text: string;
    timestamp: Date;
    options?: { label: string; value: string }[];
}

type BotState = 'greeting' | 'reason' | 'hardship' | 'options' | 'option_selected' | 'confirm' | 'resolved' | 'escalate';

// ─── Indian Languages ────────────────────────────────────────────────────────
const INDIAN_LANGUAGES = [
    { code: 'en-IN', name: 'English', nativeName: 'English', flag: '🇮🇳' },
    { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'as-IN', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
    { code: 'ur-IN', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
    { code: 'sa-IN', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳' },
    { code: 'kok-IN', name: 'Konkani', nativeName: 'कोंकणी', flag: '🇮🇳' },
    { code: 'mai-IN', name: 'Maithili', nativeName: 'मैथिली', flag: '🇮🇳' },
    { code: 'doi-IN', name: 'Dogri', nativeName: 'डोगरी', flag: '🇮🇳' },
    { code: 'mni-IN', name: 'Manipuri', nativeName: 'মৈতৈলোন্', flag: '🇮🇳' },
    { code: 'sat-IN', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳' },
    { code: 'ks-IN', name: 'Kashmiri', nativeName: 'کٲشُر', flag: '🇮🇳' },
    { code: 'ne-IN', name: 'Nepali', nativeName: 'नेपाली', flag: '🇮🇳' },
    { code: 'sd-IN', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇮🇳' },
    { code: 'bho-IN', name: 'Bhojpuri', nativeName: 'भोजपुरी', flag: '🇮🇳' },
];

// ─── Translations ─────────────────────────────────────────────────────────────
type TranslationKey =
    | 'greeting' | 'pay_now_response' | 'need_time_response' | 'hardship_response'
    | 'dispute_response' | 'hardship_detail_response' | 'confirm_response' | 'resolved_response'
    | 'end_response' | 'generic_response' | 'opt_pay_now' | 'opt_need_time' | 'opt_hardship'
    | 'opt_dispute' | 'opt_job_loss' | 'opt_medical' | 'opt_business_loss' | 'opt_family'
    | 'opt_confirm' | 'opt_back' | 'opt_thanks' | 'typing_placeholder' | 'start_btn'
    | 'bot_ready_title' | 'bot_ready_desc' | 'reset_btn' | 'select_account' | 'account_summary'
    | 'bot_capabilities' | 'language_label' | 'tts_label' | 'stt_label' | 'listening'
    | 'stt_not_supported' | 'tts_not_supported';

type Translations = Record<TranslationKey, string>;
type LangTranslations = Record<string, Translations>;

const TRANSLATIONS: LangTranslations = {
    'en-IN': {
        greeting: `Hello {name}! 👋\n\nI'm the DhanSetu assistant from your bank. I noticed your {product} EMI of ₹{emi} is {dpd} days overdue, with ₹{outstanding} outstanding.\n\nI'm here to help find a solution that works for you. How can I assist you today?`,
        pay_now_response: `Excellent! 🎉 I'll send you a secure payment link right now.\n\nAmount: ₹{overdue}\n\n✅ Pay at: pay.bank.ai/recover/{id}\n\nOnce payment is confirmed, your account will be updated within 24 hours. Thank you!`,
        need_time_response: `I understand — life can be unpredictable. Let me offer you some flexible options:\n\nPlease choose the one that works best for you:`,
        hardship_response: `I hear you, and I'm sorry to hear you're going through a difficult time. 🙏\n\nCan you help me understand your situation better?`,
        dispute_response: `I'll connect you with a senior banking officer immediately.\n\n📞 Your case number is: DISP-{case}\n\nA dedicated agent will call you within 2 hours at {phone}. Please keep your loan agreement handy.`,
        hardship_detail_response: `Thank you for sharing that. We have a special hardship relief programme for situations like yours.\n\nBased on your account history, I'm authorized to offer you these options:`,
        confirm_response: `Great choice! Here's a summary of your selected plan:\n\n📋 {label}\n📌 {detail}\n\nThis plan will prevent any further penalties. Would you like to confirm?`,
        resolved_response: `🎉 Your restructuring plan has been confirmed!\n\nReference ID: REST-{ref}\n\nYou'll receive:\n• A confirmation SMS on {phone}\n• An email with the restructuring agreement\n• Your new payment schedule\n\nThank you for choosing to resolve this with us!`,
        end_response: `You're welcome! Have a great day. Remember, you can always reach us at:\n📞 1800-XXX-XXXX (toll-free)\n💬 WhatsApp: +91-9876543210\n\nTake care! 🙏`,
        generic_response: `I understand. Let me connect you with the right solution. What specifically would you like help with?`,
        opt_pay_now: '💳 I can pay now',
        opt_need_time: '⏰ I need more time',
        opt_hardship: '📉 Financial difficulty',
        opt_dispute: '❓ I have a dispute',
        opt_job_loss: '💼 Job loss / Income reduction',
        opt_medical: '🏥 Medical emergency',
        opt_business_loss: '🌾 Crop failure / Business loss',
        opt_family: '👪 Family emergency',
        opt_confirm: '✅ YES, confirm this plan',
        opt_back: '↩️ Show other options',
        opt_thanks: "👍 Thank you, that's all",
        typing_placeholder: 'Type a message (or use the quick reply buttons above)...',
        start_btn: '🚀 Start Bot Conversation',
        bot_ready_title: 'AI Negotiation Bot Ready',
        bot_ready_desc: "Start a live conversation simulation with {name}'s account. The bot will negotiate payment terms in real-time.",
        reset_btn: 'Reset',
        select_account: 'Select Account',
        account_summary: 'Account Summary',
        bot_capabilities: '🤖 Bot Capabilities',
        language_label: '🌐 Language',
        tts_label: '🔊 Text-to-Speech',
        stt_label: '🎤 Voice Input',
        listening: '🎤 Listening...',
        stt_not_supported: 'Speech recognition not supported in this browser.',
        tts_not_supported: 'Text-to-speech not supported in this browser.',
    },
    'hi-IN': {
        greeting: `नमस्ते {name}! 👋\n\nमैं आपके बैंक का DhanSetu सहायक हूँ। मैंने देखा कि आपकी {product} EMI ₹{emi} {dpd} दिनों से बकाया है, और ₹{outstanding} अभी भी देय है।\n\nमैं आपके लिए एक समाधान खोजने में मदद करने के लिए यहाँ हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?`,
        pay_now_response: `बहुत अच्छा! 🎉 मैं अभी आपको एक सुरक्षित भुगतान लिंक भेजूँगा।\n\nराशि: ₹{overdue}\n\n✅ यहाँ भुगतान करें: pay.bank.ai/recover/{id}\n\nभुगतान की पुष्टि होने के बाद, आपका खाता 24 घंटों के भीतर अपडेट हो जाएगा। धन्यवाद!`,
        need_time_response: `मैं समझता हूँ — जीवन अप्रत्याशित हो सकता है। मैं आपको कुछ लचीले विकल्प प्रदान करता हूँ:\n\nकृपया वह विकल्प चुनें जो आपके लिए सबसे अच्छा हो:`,
        hardship_response: `मैं आपकी बात सुन रहा हूँ, और मुझे खेद है कि आप कठिन समय से गुजर रहे हैं। 🙏\n\nक्या आप मुझे अपनी स्थिति के बारे में बेहतर समझने में मदद कर सकते हैं?`,
        dispute_response: `मैं आपको तुरंत एक वरिष्ठ बैंकिंग अधिकारी से जोड़ूँगा।\n\n📞 आपका केस नंबर है: DISP-{case}\n\nएक समर्पित एजेंट 2 घंटों के भीतर {phone} पर आपको कॉल करेगा।`,
        hardship_detail_response: `साझा करने के लिए धन्यवाद। आपकी जैसी स्थितियों के लिए हमारे पास एक विशेष कठिनाई राहत कार्यक्रम है।\n\nआपके खाते के इतिहास के आधार पर, मैं आपको ये विकल्प प्रदान करने के लिए अधिकृत हूँ:`,
        confirm_response: `बढ़िया चुनाव! आपकी चुनी हुई योजना का सारांश:\n\n📋 {label}\n📌 {detail}\n\nयह योजना किसी भी आगे के जुर्माने को रोकेगी। क्या आप पुष्टि करना चाहेंगे?`,
        resolved_response: `🎉 आपकी पुनर्संरचना योजना की पुष्टि हो गई है!\n\nसंदर्भ ID: REST-{ref}\n\nआपको मिलेगा:\n• {phone} पर एक पुष्टि SMS\n• पुनर्संरचना समझौते के साथ एक ईमेल\n• आपका नया भुगतान शेड्यूल\n\nहमारे साथ इसे हल करने के लिए धन्यवाद!`,
        end_response: `आपका स्वागत है! आपका दिन शुभ हो। याद रखें, आप हमसे हमेशा संपर्क कर सकते हैं:\n📞 1800-XXX-XXXX (टोल-फ्री)\n💬 WhatsApp: +91-9876543210\n\nख्याल रखें! 🙏`,
        generic_response: `मैं समझता हूँ। मुझे आपको सही समाधान से जोड़ने दें। आप विशेष रूप से किस चीज़ में मदद चाहते हैं?`,
        opt_pay_now: '💳 मैं अभी भुगतान कर सकता हूँ',
        opt_need_time: '⏰ मुझे और समय चाहिए',
        opt_hardship: '📉 वित्तीय कठिनाई',
        opt_dispute: '❓ मेरा विवाद है',
        opt_job_loss: '💼 नौकरी छूटना / आय में कमी',
        opt_medical: '🏥 चिकित्सा आपातकाल',
        opt_business_loss: '🌾 फसल विफलता / व्यापार हानि',
        opt_family: '👪 पारिवारिक आपातकाल',
        opt_confirm: '✅ हाँ, इस योजना की पुष्टि करें',
        opt_back: '↩️ अन्य विकल्प दिखाएं',
        opt_thanks: '👍 धन्यवाद, बस इतना ही',
        typing_placeholder: 'संदेश टाइप करें...',
        start_btn: '🚀 बातचीत शुरू करें',
        bot_ready_title: 'AI बातचीत बॉट तैयार है',
        bot_ready_desc: "{name} के खाते के साथ एक लाइव बातचीत सिमुलेशन शुरू करें।",
        reset_btn: 'रीसेट',
        select_account: 'खाता चुनें',
        account_summary: 'खाता सारांश',
        bot_capabilities: '🤖 बॉट क्षमताएं',
        language_label: '🌐 भाषा',
        tts_label: '🔊 टेक्स्ट-टू-स्पीच',
        stt_label: '🎤 वॉयस इनपुट',
        listening: '🎤 सुन रहा हूँ...',
        stt_not_supported: 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है।',
        tts_not_supported: 'इस ब्राउज़र में टेक्स्ट-टू-स्पीच समर्थित नहीं है।',
    },
    'bn-IN': {
        greeting: `নমস্কার {name}! 👋\n\nআমি আপনার ব্যাংকের DhanSetu সহকারী। আমি লক্ষ্য করেছি আপনার {product} EMI ₹{emi} {dpd} দিন ধরে বকেয়া, এবং ₹{outstanding} এখনও পরিশোধযোগ্য।\n\nআমি আপনার জন্য একটি সমাধান খুঁজে পেতে সাহায্য করতে এখানে আছি। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?`,
        pay_now_response: `চমৎকার! 🎉 আমি এখনই আপনাকে একটি নিরাপদ পেমেন্ট লিঙ্ক পাঠাব।\n\nপরিমাণ: ₹{overdue}\n\n✅ এখানে পেমেন্ট করুন: pay.bank.ai/recover/{id}\n\nপেমেন্ট নিশ্চিত হলে, আপনার অ্যাকাউন্ট ২৪ ঘণ্টার মধ্যে আপডেট হবে। ধন্যবাদ!`,
        need_time_response: `আমি বুঝতে পারছি — জীবন অনিশ্চিত হতে পারে। আমি আপনাকে কিছু নমনীয় বিকল্প অফার করছি:\n\nঅনুগ্রহ করে আপনার জন্য সবচেয়ে ভালো বিকল্পটি বেছে নিন:`,
        hardship_response: `আমি আপনার কথা শুনছি, এবং আপনি কঠিন সময়ের মধ্য দিয়ে যাচ্ছেন জেনে দুঃখিত। 🙏\n\nআপনি কি আমাকে আপনার পরিস্থিতি আরও ভালোভাবে বুঝতে সাহায্য করতে পারবেন?`,
        dispute_response: `আমি আপনাকে অবিলম্বে একজন সিনিয়র ব্যাংকিং অফিসারের সাথে সংযুক্ত করব।\n\n📞 আপনার কেস নম্বর: DISP-{case}\n\nএকজন নিবেদিত এজেন্ট ২ ঘণ্টার মধ্যে {phone} নম্বরে আপনাকে কল করবে।`,
        hardship_detail_response: `শেয়ার করার জন্য ধন্যবাদ। আপনার মতো পরিস্থিতির জন্য আমাদের একটি বিশেষ কষ্ট ত্রাণ কার্যক্রম আছে।\n\nআপনার অ্যাকাউন্টের ইতিহাসের উপর ভিত্তি করে, আমি আপনাকে এই বিকল্পগুলি অফার করতে অনুমোদিত:`,
        confirm_response: `দারুণ পছন্দ! আপনার নির্বাচিত পরিকল্পনার সারসংক্ষেপ:\n\n📋 {label}\n📌 {detail}\n\nএই পরিকল্পনা আরও জরিমানা প্রতিরোধ করবে। আপনি কি নিশ্চিত করতে চান?`,
        resolved_response: `🎉 আপনার পুনর্গঠন পরিকল্পনা নিশ্চিত হয়েছে!\n\nরেফারেন্স ID: REST-{ref}\n\nআপনি পাবেন:\n• {phone} নম্বরে একটি নিশ্চিতকরণ SMS\n• পুনর্গঠন চুক্তি সহ একটি ইমেইল\n• আপনার নতুন পেমেন্ট সময়সূচী\n\nআমাদের সাথে এটি সমাধান করার জন্য ধন্যবাদ!`,
        end_response: `আপনাকে স্বাগতম! আপনার দিনটি শুভ হোক। মনে রাখবেন, আপনি সবসময় আমাদের সাথে যোগাযোগ করতে পারেন:\n📞 1800-XXX-XXXX (টোল-ফ্রি)\n💬 WhatsApp: +91-9876543210\n\nভালো থাকুন! 🙏`,
        generic_response: `আমি বুঝতে পারছি। আমাকে আপনাকে সঠিক সমাধানের সাথে সংযুক্ত করতে দিন। আপনি বিশেষভাবে কী বিষয়ে সাহায্য চান?`,
        opt_pay_now: '💳 আমি এখন পেমেন্ট করতে পারি',
        opt_need_time: '⏰ আমার আরও সময় দরকার',
        opt_hardship: '📉 আর্থিক সংকট',
        opt_dispute: '❓ আমার একটি বিরোধ আছে',
        opt_job_loss: '💼 চাকরি হারানো / আয় হ্রাস',
        opt_medical: '🏥 চিকিৎসা জরুরি অবস্থা',
        opt_business_loss: '🌾 ফসল ব্যর্থতা / ব্যবসায়িক ক্ষতি',
        opt_family: '👪 পারিবারিক জরুরি অবস্থা',
        opt_confirm: '✅ হ্যাঁ, এই পরিকল্পনা নিশ্চিত করুন',
        opt_back: '↩️ অন্য বিকল্প দেখান',
        opt_thanks: '👍 ধন্যবাদ, এটুকুই',
        typing_placeholder: 'বার্তা টাইপ করুন...',
        start_btn: '🚀 কথোপকথন শুরু করুন',
        bot_ready_title: 'AI আলোচনা বট প্রস্তুত',
        bot_ready_desc: "{name} এর অ্যাকাউন্টের সাথে একটি লাইভ কথোপকথন সিমুলেশন শুরু করুন।",
        reset_btn: 'রিসেট',
        select_account: 'অ্যাকাউন্ট নির্বাচন করুন',
        account_summary: 'অ্যাকাউন্ট সারসংক্ষেপ',
        bot_capabilities: '🤖 বট ক্ষমতা',
        language_label: '🌐 ভাষা',
        tts_label: '🔊 টেক্সট-টু-স্পিচ',
        stt_label: '🎤 ভয়েস ইনপুট',
        listening: '🎤 শুনছি...',
        stt_not_supported: 'এই ব্রাউজারে স্পিচ রিকগনিশন সমর্থিত নয়।',
        tts_not_supported: 'এই ব্রাউজারে টেক্সট-টু-স্পিচ সমর্থিত নয়।',
    },
    'te-IN': {
        greeting: `నమస్కారం {name}! 👋\n\nనేను మీ బ్యాంక్ నుండి DhanSetu సహాయకుడిని. మీ {product} EMI ₹{emi} {dpd} రోజులు బకాయి ఉందని, ₹{outstanding} చెల్లించాల్సి ఉందని గమనించాను.\n\nమీకు పని చేసే పరిష్కారం కనుగొనడంలో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?`,
        pay_now_response: `అద్భుతం! 🎉 నేను ఇప్పుడే మీకు సురక్షిత చెల్లింపు లింక్ పంపుతాను.\n\nమొత్తం: ₹{overdue}\n\n✅ ఇక్కడ చెల్లించండి: pay.bank.ai/recover/{id}\n\nచెల్లింపు నిర్ధారించబడిన తర్వాత, మీ ఖాతా 24 గంటల్లో అప్‌డేట్ అవుతుంది. ధన్యవాదాలు!`,
        need_time_response: `నాకు అర్థమైంది — జీవితం అనిశ్చితంగా ఉంటుంది. నేను మీకు కొన్ని సౌకర్యవంతమైన ఎంపికలు అందిస్తాను:\n\nమీకు అత్యంత అనుకూలమైన దాన్ని ఎంచుకోండి:`,
        hardship_response: `నేను మీ మాట వింటున్నాను, మీరు కష్టమైన సమయం గడుపుతున్నారని విని చింతిస్తున్నాను. 🙏\n\nమీ పరిస్థితిని బాగా అర్థం చేసుకోవడంలో మీరు నాకు సహాయం చేయగలరా?`,
        dispute_response: `నేను మిమ్మల్ని వెంటనే సీనియర్ బ్యాంకింగ్ అధికారితో కనెక్ట్ చేస్తాను.\n\n📞 మీ కేస్ నంబర్: DISP-{case}\n\nఒక అంకితమైన ఏజెంట్ 2 గంటల్లో {phone} కి కాల్ చేస్తారు.`,
        hardship_detail_response: `పంచుకున్నందుకు ధన్యవాదాలు. మీలాంటి పరిస్థితుల కోసం మాకు ప్రత్యేక కష్ట ఉపశమన కార్యక్రమం ఉంది.\n\nమీ ఖాతా చరిత్ర ఆధారంగా, నేను మీకు ఈ ఎంపికలు అందించడానికి అధికారం పొందాను:`,
        confirm_response: `గొప్ప ఎంపిక! మీరు ఎంచుకున్న ప్లాన్ సారాంశం:\n\n📋 {label}\n📌 {detail}\n\nఈ ప్లాన్ మరింత జరిమానాలను నిరోధిస్తుంది. మీరు నిర్ధారించాలనుకుంటున్నారా?`,
        resolved_response: `🎉 మీ పునర్నిర్మాణ ప్లాన్ నిర్ధారించబడింది!\n\nరిఫరెన్స్ ID: REST-{ref}\n\nమీరు పొందుతారు:\n• {phone} కి నిర్ధారణ SMS\n• పునర్నిర్మాణ ఒప్పందంతో ఇమెయిల్\n• మీ కొత్త చెల్లింపు షెడ్యూల్\n\nమాతో దీన్ని పరిష్కరించుకున్నందుకు ధన్యవాదాలు!`,
        end_response: `స్వాగతం! మీ రోజు శుభంగా ఉండాలి. గుర్తుంచుకోండి, మీరు ఎప్పుడైనా మాకు చేరుకోవచ్చు:\n📞 1800-XXX-XXXX (టోల్-ఫ్రీ)\n💬 WhatsApp: +91-9876543210\n\nజాగ్రత్తగా ఉండండి! 🙏`,
        generic_response: `నాకు అర్థమైంది. మిమ్మల్ని సరైన పరిష్కారంతో కనెక్ట్ చేయనివ్వండి. మీకు ప్రత్యేకంగా ఏ విషయంలో సహాయం కావాలి?`,
        opt_pay_now: '💳 నేను ఇప్పుడు చెల్లించగలను',
        opt_need_time: '⏰ నాకు మరింత సమయం కావాలి',
        opt_hardship: '📉 ఆర్థిక ఇబ్బంది',
        opt_dispute: '❓ నాకు వివాదం ఉంది',
        opt_job_loss: '💼 ఉద్యోగం కోల్పోవడం / ఆదాయం తగ్గడం',
        opt_medical: '🏥 వైద్య అత్యవసర పరిస్థితి',
        opt_business_loss: '🌾 పంట వైఫల్యం / వ్యాపార నష్టం',
        opt_family: '👪 కుటుంబ అత్యవసర పరిస్థితి',
        opt_confirm: '✅ అవును, ఈ ప్లాన్ నిర్ధారించండి',
        opt_back: '↩️ ఇతర ఎంపికలు చూపించు',
        opt_thanks: '👍 ధన్యవాదాలు, అంతే',
        typing_placeholder: 'సందేశం టైప్ చేయండి...',
        start_btn: '🚀 సంభాషణ ప్రారంభించండి',
        bot_ready_title: 'AI చర్చా బాట్ సిద్ధంగా ఉంది',
        bot_ready_desc: "{name} ఖాతాతో లైవ్ సంభాషణ సిమ్యులేషన్ ప్రారంభించండి.",
        reset_btn: 'రీసెట్',
        select_account: 'ఖాతా ఎంచుకోండి',
        account_summary: 'ఖాతా సారాంశం',
        bot_capabilities: '🤖 బాట్ సామర్థ్యాలు',
        language_label: '🌐 భాష',
        tts_label: '🔊 టెక్స్ట్-టు-స్పీచ్',
        stt_label: '🎤 వాయిస్ ఇన్‌పుట్',
        listening: '🎤 వింటున్నాను...',
        stt_not_supported: 'ఈ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ మద్దతు లేదు.',
        tts_not_supported: 'ఈ బ్రౌజర్‌లో టెక్స్ట్-టు-స్పీచ్ మద్దతు లేదు.',
    },
    'mr-IN': {
        greeting: `नमस्कार {name}! 👋\n\nमी तुमच्या बँकेचा DhanSetu सहाय्यक आहे. मी पाहिले की तुमची {product} EMI ₹{emi} {dpd} दिवसांपासून थकीत आहे, आणि ₹{outstanding} अजूनही देय आहे.\n\nमी तुमच्यासाठी एक उपाय शोधण्यात मदत करण्यासाठी येथे आहे. आज मी तुम्हाला कशी मदत करू शकतो?`,
        pay_now_response: `उत्कृष्ट! 🎉 मी आत्ता तुम्हाला एक सुरक्षित पेमेंट लिंक पाठवतो.\n\nरक्कम: ₹{overdue}\n\n✅ येथे पेमेंट करा: pay.bank.ai/recover/{id}\n\nपेमेंट पुष्टी झाल्यावर, तुमचे खाते 24 तासांत अपडेट होईल. धन्यवाद!`,
        need_time_response: `मला समजते — जीवन अनिश्चित असू शकते. मी तुम्हाला काही लवचिक पर्याय देतो:\n\nकृपया तुमच्यासाठी सर्वोत्तम पर्याय निवडा:`,
        hardship_response: `मी तुमचे ऐकतो, आणि तुम्ही कठीण काळातून जात आहात हे ऐकून वाईट वाटते. 🙏\n\nतुम्ही मला तुमची परिस्थिती अधिक चांगल्या प्रकारे समजण्यास मदत करू शकता का?`,
        dispute_response: `मी तुम्हाला लगेच एका वरिष्ठ बँकिंग अधिकाऱ्याशी जोडतो.\n\n📞 तुमचा केस नंबर: DISP-{case}\n\nएक समर्पित एजंट 2 तासांत {phone} वर तुम्हाला कॉल करेल.`,
        hardship_detail_response: `सांगितल्याबद्दल धन्यवाद. तुमच्यासारख्या परिस्थितींसाठी आमच्याकडे एक विशेष कठीण काळ मदत कार्यक्रम आहे.\n\nतुमच्या खात्याच्या इतिहासावर आधारित, मला तुम्हाला हे पर्याय देण्याचा अधिकार आहे:`,
        confirm_response: `उत्तम निवड! तुमच्या निवडलेल्या योजनेचा सारांश:\n\n📋 {label}\n📌 {detail}\n\nही योजना कोणत्याही पुढील दंडाला प्रतिबंध करेल. तुम्ही पुष्टी करू इच्छिता का?`,
        resolved_response: `🎉 तुमची पुनर्रचना योजना पुष्टी झाली आहे!\n\nसंदर्भ ID: REST-{ref}\n\nतुम्हाला मिळेल:\n• {phone} वर एक पुष्टी SMS\n• पुनर्रचना करारासह एक ईमेल\n• तुमचे नवीन पेमेंट वेळापत्रक\n\nआमच्यासोबत हे सोडवण्यासाठी धन्यवाद!`,
        end_response: `स्वागत आहे! तुमचा दिवस चांगला जावो. लक्षात ठेवा, तुम्ही नेहमी आमच्याशी संपर्क साधू शकता:\n📞 1800-XXX-XXXX (टोल-फ्री)\n💬 WhatsApp: +91-9876543210\n\nकाळजी घ्या! 🙏`,
        generic_response: `मला समजते. मला तुम्हाला योग्य उपायाशी जोडू द्या. तुम्हाला विशेषतः कशात मदत हवी आहे?`,
        opt_pay_now: '💳 मी आत्ता पेमेंट करू शकतो',
        opt_need_time: '⏰ मला अधिक वेळ हवा आहे',
        opt_hardship: '📉 आर्थिक अडचण',
        opt_dispute: '❓ माझा वाद आहे',
        opt_job_loss: '💼 नोकरी गमावणे / उत्पन्न कमी होणे',
        opt_medical: '🏥 वैद्यकीय आणीबाणी',
        opt_business_loss: '🌾 पीक अपयश / व्यवसाय नुकसान',
        opt_family: '👪 कौटुंबिक आणीबाणी',
        opt_confirm: '✅ होय, ही योजना पुष्टी करा',
        opt_back: '↩️ इतर पर्याय दाखवा',
        opt_thanks: '👍 धन्यवाद, एवढेच',
        typing_placeholder: 'संदेश टाइप करा...',
        start_btn: '🚀 संभाषण सुरू करा',
        bot_ready_title: 'AI वाटाघाटी बॉट तयार आहे',
        bot_ready_desc: "{name} च्या खात्यासह एक लाइव्ह संभाषण सिम्युलेशन सुरू करा.",
        reset_btn: 'रीसेट',
        select_account: 'खाते निवडा',
        account_summary: 'खाते सारांश',
        bot_capabilities: '🤖 बॉट क्षमता',
        language_label: '🌐 भाषा',
        tts_label: '🔊 टेक्स्ट-टू-स्पीच',
        stt_label: '🎤 व्हॉइस इनपुट',
        listening: '🎤 ऐकत आहे...',
        stt_not_supported: 'या ब्राउझरमध्ये स्पीच रेकग्निशन समर्थित नाही.',
        tts_not_supported: 'या ब्राउझरमध्ये टेक्स्ट-टू-स्पीच समर्थित नाही.',
    },
    'ta-IN': {
        greeting: `வணக்கம் {name}! 👋\n\nநான் உங்கள் வங்கியின் DhanSetu உதவியாளர். உங்கள் {product} EMI ₹{emi} {dpd} நாட்களாக நிலுவையில் உள்ளது, ₹{outstanding} இன்னும் செலுத்த வேண்டியுள்ளது என்று கவனித்தேன்.\n\nஉங்களுக்கு ஏற்ற தீர்வு கண்டுபிடிக்க உதவ நான் இங்கே இருக்கிறேன். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?`,
        pay_now_response: `அருமை! 🎉 நான் இப்போதே உங்களுக்கு பாதுகாப்பான கட்டண இணைப்பை அனுப்புகிறேன்.\n\nதொகை: ₹{overdue}\n\n✅ இங்கே செலுத்துங்கள்: pay.bank.ai/recover/{id}\n\nகட்டணம் உறுதிப்படுத்தப்பட்டதும், உங்கள் கணக்கு 24 மணி நேரத்தில் புதுப்பிக்கப்படும். நன்றி!`,
        need_time_response: `நான் புரிந்துகொள்கிறேன் — வாழ்க்கை கணிக்க முடியாதது. நான் உங்களுக்கு சில நெகிழ்வான விருப்பங்களை வழங்குகிறேன்:\n\nதயவுசெய்து உங்களுக்கு மிகவும் பொருத்தமான ஒன்றை தேர்ந்தெடுங்கள்:`,
        hardship_response: `நான் உங்கள் பேச்சை கேட்கிறேன், நீங்கள் கடினமான நேரத்தில் இருக்கிறீர்கள் என்று கேட்டு வருந்துகிறேன். 🙏\n\nஉங்கள் நிலைமையை நான் சிறப்பாக புரிந்துகொள்ள உதவ முடியுமா?`,
        dispute_response: `நான் உங்களை உடனடியாக மூத்த வங்கி அதிகாரியுடன் இணைப்பேன்.\n\n📞 உங்கள் வழக்கு எண்: DISP-{case}\n\nஒரு அர்ப்பணிப்புள்ள முகவர் 2 மணி நேரத்தில் {phone} க்கு அழைப்பார்.`,
        hardship_detail_response: `பகிர்ந்துகொண்டதற்கு நன்றி. உங்களைப் போன்ற சூழ்நிலைகளுக்கு எங்களிடம் ஒரு சிறப்பு கஷ்ட நிவாரண திட்டம் உள்ளது.\n\nஉங்கள் கணக்கு வரலாற்றின் அடிப்படையில், இந்த விருப்பங்களை வழங்க நான் அங்கீகரிக்கப்பட்டுள்ளேன்:`,
        confirm_response: `சிறந்த தேர்வு! உங்கள் தேர்ந்தெடுக்கப்பட்ட திட்டத்தின் சுருக்கம்:\n\n📋 {label}\n📌 {detail}\n\nஇந்த திட்டம் மேலும் அபராதங்களை தடுக்கும். நீங்கள் உறுதிப்படுத்த விரும்புகிறீர்களா?`,
        resolved_response: `🎉 உங்கள் மறுகட்டமைப்பு திட்டம் உறுதிப்படுத்தப்பட்டது!\n\nமேற்கோள் ID: REST-{ref}\n\nநீங்கள் பெறுவீர்கள்:\n• {phone} க்கு உறுதிப்படுத்தல் SMS\n• மறுகட்டமைப்பு ஒப்பந்தத்துடன் மின்னஞ்சல்\n• உங்கள் புதிய கட்டண அட்டவணை\n\nஎங்களுடன் இதை தீர்த்துக்கொண்டதற்கு நன்றி!`,
        end_response: `வரவேற்கிறோம்! உங்கள் நாள் நல்லதாக இருக்கட்டும். நினைவில் வையுங்கள், நீங்கள் எப்போதும் எங்களை அணுகலாம்:\n📞 1800-XXX-XXXX (கட்டணமில்லா)\n💬 WhatsApp: +91-9876543210\n\nகவனமாக இருங்கள்! 🙏`,
        generic_response: `நான் புரிந்துகொள்கிறேன். சரியான தீர்வுடன் உங்களை இணைக்க அனுமதியுங்கள். குறிப்பாக எதில் உதவி வேண்டும்?`,
        opt_pay_now: '💳 என்னால் இப்போது செலுத்த முடியும்',
        opt_need_time: '⏰ எனக்கு அதிக நேரம் தேவை',
        opt_hardship: '📉 நிதி சிரமம்',
        opt_dispute: '❓ எனக்கு ஒரு தகராறு உள்ளது',
        opt_job_loss: '💼 வேலை இழப்பு / வருமான குறைப்பு',
        opt_medical: '🏥 மருத்துவ அவசரநிலை',
        opt_business_loss: '🌾 பயிர் தோல்வி / வணிக இழப்பு',
        opt_family: '👪 குடும்ப அவசரநிலை',
        opt_confirm: '✅ ஆம், இந்த திட்டத்தை உறுதிப்படுத்துங்கள்',
        opt_back: '↩️ மற்ற விருப்பங்களை காட்டு',
        opt_thanks: '👍 நன்றி, அவ்வளவுதான்',
        typing_placeholder: 'செய்தி தட்டச்சு செய்யுங்கள்...',
        start_btn: '🚀 உரையாடலை தொடங்குங்கள்',
        bot_ready_title: 'AI பேச்சுவார்த்தை போட் தயார்',
        bot_ready_desc: "{name} கணக்குடன் நேரடி உரையாடல் உருவகப்படுத்தலை தொடங்குங்கள்.",
        reset_btn: 'மீட்டமை',
        select_account: 'கணக்கை தேர்ந்தெடுங்கள்',
        account_summary: 'கணக்கு சுருக்கம்',
        bot_capabilities: '🤖 போட் திறன்கள்',
        language_label: '🌐 மொழி',
        tts_label: '🔊 உரை-முதல்-பேச்சு',
        stt_label: '🎤 குரல் உள்ளீடு',
        listening: '🎤 கேட்கிறேன்...',
        stt_not_supported: 'இந்த உலாவியில் பேச்சு அங்கீகாரம் ஆதரிக்கப்படவில்லை.',
        tts_not_supported: 'இந்த உலாவியில் உரை-முதல்-பேச்சு ஆதரிக்கப்படவில்லை.',
    },
    'gu-IN': {
        greeting: `નમસ્તે {name}! 👋\n\nહું તમારી બેંકનો DhanSetu સહાયક છું. મેં જોયું કે તમારી {product} EMI ₹{emi} {dpd} દિવસથી બાકી છે, અને ₹{outstanding} હજી ચૂકવવાની છે.\n\nહું તમારા માટે કામ કરે તેવો ઉકેલ શોધવામાં મદદ કરવા અહીં છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?`,
        pay_now_response: `ઉત્કૃષ્ટ! 🎉 હું અત્યારે જ તમને સુરક્ષિત ચૂકવણી લિંક મોકલીશ.\n\nરકમ: ₹{overdue}\n\n✅ અહીં ચૂકવો: pay.bank.ai/recover/{id}\n\nચૂકવણી પુષ્ટિ થયા પછી, તમારું ખાતું 24 કલાકમાં અપડેટ થઈ જશે. આભાર!`,
        need_time_response: `હું સમજું છું — જીવન અણધારી હોઈ શકે. હું તમને કેટલાક લવચીક વિકલ્પો આપું છું:\n\nકૃપા કરીને તમારા માટે સૌથી સારો વિકલ્પ પસંદ કરો:`,
        hardship_response: `હું તમારી વાત સાંભળું છું, અને તમે મુશ્કેલ સમયમાંથી પસાર થઈ રહ્યા છો તે સાંભળીને દુઃખ થાય છે. 🙏\n\nશું તમે મને તમારી પરિસ્થિતિ વધુ સારી રીતે સમજવામાં મદદ કરી શકો?`,
        dispute_response: `હું તમને તરત જ એક વરિષ્ઠ બેંકિંગ અધિકારી સાથે જોડીશ.\n\n📞 તમારો કેસ નંબર: DISP-{case}\n\nએક સમર્પિત એજન્ટ 2 કલાકમાં {phone} પર તમને કૉલ કરશે.`,
        hardship_detail_response: `શેર કરવા બદલ આભાર. તમારા જેવી પરિસ્થિતિઓ માટે અમારી પાસે એક ખાસ મુશ્કેલી રાહત કાર્યક્રમ છે.\n\nતમારા ખાતાના ઇતિહાસ પર આધારિત, હું તમને આ વિકલ્પો આપવા માટે અધિકૃત છું:`,
        confirm_response: `ઉત્તમ પસંદ! તમારી પસંદ કરેલ યોજનાનો સારાંશ:\n\n📋 {label}\n📌 {detail}\n\nઆ યોજના કોઈ પણ વધુ દંડ અટકાવશે. શું તમે પુષ્ટિ કરવા ઇચ્છો છો?`,
        resolved_response: `🎉 તમારી પુનર્ગઠન યોજના પુષ્ટિ થઈ ગઈ છે!\n\nસંદર્ભ ID: REST-{ref}\n\nતમને મળશે:\n• {phone} પર એક પુષ્ટિ SMS\n• પુનર્ગઠન કરારની ઇ-મેઇલ\n• તમારો નવો ચૂકવણી સમયપત્રક\n\nઅમારી સાથે આ ઉકેલ કરવા બદલ આભાર!`,
        end_response: `આવકાર! તમારો દિવસ સારો જાય. યાદ રાખો, તમે હંમેશા અમારો સંપર્ક કરી શકો:\n📞 1800-XXX-XXXX (ટોલ-ફ્રી)\n💬 WhatsApp: +91-9876543210\n\nકાળજી રાખો! 🙏`,
        generic_response: `હું સમજું છું. મને તમને સાચા ઉકેલ સાથે જોડવા દો. ખાસ કરીને શેમાં મદદ જોઈએ?`,
        opt_pay_now: '💳 હું અત્યારે ચૂકવી શકું છું',
        opt_need_time: '⏰ મને વધુ સમય જોઈએ',
        opt_hardship: '📉 નાણાકીય મુશ્કેલી',
        opt_dispute: '❓ મારો વિવાદ છે',
        opt_job_loss: '💼 નોકરી ગુમાવવી / આવક ઘટવી',
        opt_medical: '🏥 તબીબી કટોકટી',
        opt_business_loss: '🌾 પાક નિષ્ફળ / વ્યવસાય નુકસાન',
        opt_family: '👪 કૌટુંબિક કટોકટી',
        opt_confirm: '✅ હા, આ યોજના પુષ્ટિ કરો',
        opt_back: '↩️ અન્ય વિકલ્પો બતાવો',
        opt_thanks: '👍 આભાર, બસ',
        typing_placeholder: 'સંદેશ ટાઇપ કરો...',
        start_btn: '🚀 વાર્તાલાપ શરૂ કરો',
        bot_ready_title: 'AI વાટાઘાટ બૉટ તૈયાર',
        bot_ready_desc: "{name} ના ખાતા સાથે લાઇવ વાર્તાલાપ સિમ્યુલેશન શરૂ કરો.",
        reset_btn: 'રીસેટ',
        select_account: 'ખાતું પસંદ કરો',
        account_summary: 'ખાતા સારાંશ',
        bot_capabilities: '🤖 બૉટ ક્ષમતાઓ',
        language_label: '🌐 ભાષા',
        tts_label: '🔊 ટેક્સ્ટ-ટુ-સ્પીચ',
        stt_label: '🎤 વૉઇસ ઇનપુટ',
        listening: '🎤 સાંભળી રહ્યો છું...',
        stt_not_supported: 'આ બ્રાઉઝરમાં સ્પીચ રેકગ્નિશન સપોર્ટ નથી.',
        tts_not_supported: 'આ બ્રાઉઝરમાં ટેક્સ્ટ-ટુ-સ્પીચ સપોર્ટ નથી.',
    },
    'kn-IN': {
        greeting: `ನಮಸ್ಕಾರ {name}! 👋\n\nನಾನು ನಿಮ್ಮ ಬ್ಯಾಂಕ್‌ನ DhanSetu ಸಹಾಯಕ. ನಿಮ್ಮ {product} EMI ₹{emi} {dpd} ದಿನಗಳಿಂದ ಬಾಕಿ ಇದೆ, ₹{outstanding} ಇನ್ನೂ ಪಾವತಿಸಬೇಕಿದೆ ಎಂದು ಗಮನಿಸಿದೆ.\n\nನಿಮಗೆ ಕೆಲಸ ಮಾಡುವ ಪರಿಹಾರ ಕಂಡುಹಿಡಿಯಲು ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`,
        pay_now_response: `ಅದ್ಭುತ! 🎉 ನಾನು ಈಗಲೇ ನಿಮಗೆ ಸುರಕ್ಷಿತ ಪಾವತಿ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತೇನೆ.\n\nಮೊತ್ತ: ₹{overdue}\n\n✅ ಇಲ್ಲಿ ಪಾವತಿಸಿ: pay.bank.ai/recover/{id}\n\nಪಾವತಿ ದೃಢೀಕರಿಸಿದ ನಂತರ, ನಿಮ್ಮ ಖಾತೆ 24 ಗಂಟೆಗಳಲ್ಲಿ ನವೀಕರಿಸಲ್ಪಡುತ್ತದೆ. ಧನ್ಯವಾದ!`,
        need_time_response: `ನಾನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತೇನೆ — ಜೀವನ ಅನಿಶ್ಚಿತವಾಗಿರಬಹುದು. ನಾನು ನಿಮಗೆ ಕೆಲವು ಹೊಂದಿಕೊಳ್ಳುವ ಆಯ್ಕೆಗಳನ್ನು ನೀಡುತ್ತೇನೆ:\n\nದಯವಿಟ್ಟು ನಿಮಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾದದ್ದನ್ನು ಆರಿಸಿ:`,
        hardship_response: `ನಾನು ನಿಮ್ಮ ಮಾತು ಕೇಳುತ್ತಿದ್ದೇನೆ, ನೀವು ಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ಇದ್ದೀರಿ ಎಂದು ಕೇಳಿ ದುಃಖವಾಗುತ್ತದೆ. 🙏\n\nನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ಚೆನ್ನಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?`,
        dispute_response: `ನಾನು ನಿಮ್ಮನ್ನು ತಕ್ಷಣ ಹಿರಿಯ ಬ್ಯಾಂಕಿಂಗ್ ಅಧಿಕಾರಿಯೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತೇನೆ.\n\n📞 ನಿಮ್ಮ ಕೇಸ್ ಸಂಖ್ಯೆ: DISP-{case}\n\nಒಬ್ಬ ಮೀಸಲಾದ ಏಜೆಂಟ್ 2 ಗಂಟೆಗಳಲ್ಲಿ {phone} ಗೆ ಕರೆ ಮಾಡುತ್ತಾರೆ.`,
        hardship_detail_response: `ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ. ನಿಮ್ಮಂತಹ ಪರಿಸ್ಥಿತಿಗಳಿಗಾಗಿ ನಮ್ಮಲ್ಲಿ ವಿಶೇಷ ಕಷ್ಟ ಪರಿಹಾರ ಕಾರ್ಯಕ್ರಮ ಇದೆ.\n\nನಿಮ್ಮ ಖಾತೆ ಇತಿಹಾಸದ ಆಧಾರದ ಮೇಲೆ, ನಾನು ನಿಮಗೆ ಈ ಆಯ್ಕೆಗಳನ್ನು ನೀಡಲು ಅಧಿಕಾರ ಹೊಂದಿದ್ದೇನೆ:`,
        confirm_response: `ಉತ್ತಮ ಆಯ್ಕೆ! ನಿಮ್ಮ ಆಯ್ಕೆ ಮಾಡಿದ ಯೋಜನೆಯ ಸಾರಾಂಶ:\n\n📋 {label}\n📌 {detail}\n\nಈ ಯೋಜನೆ ಯಾವುದೇ ಮತ್ತಷ್ಟು ದಂಡವನ್ನು ತಡೆಯುತ್ತದೆ. ನೀವು ದೃಢೀಕರಿಸಲು ಬಯಸುತ್ತೀರಾ?`,
        resolved_response: `🎉 ನಿಮ್ಮ ಪುನರ್ರಚನೆ ಯೋಜನೆ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ!\n\nಉಲ್ಲೇಖ ID: REST-{ref}\n\nನೀವು ಪಡೆಯುತ್ತೀರಿ:\n• {phone} ಗೆ ದೃಢೀಕರಣ SMS\n• ಪುನರ್ರಚನೆ ಒಪ್ಪಂದದೊಂದಿಗೆ ಇಮೇಲ್\n• ನಿಮ್ಮ ಹೊಸ ಪಾವತಿ ವೇಳಾಪಟ್ಟಿ\n\nನಮ್ಮೊಂದಿಗೆ ಇದನ್ನು ಪರಿಹರಿಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ!`,
        end_response: `ಸ್ವಾಗತ! ನಿಮ್ಮ ದಿನ ಚೆನ್ನಾಗಿರಲಿ. ನೆನಪಿಡಿ, ನೀವು ಯಾವಾಗಲೂ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು:\n📞 1800-XXX-XXXX (ಟೋಲ್-ಫ್ರೀ)\n💬 WhatsApp: +91-9876543210\n\nಜಾಗ್ರತೆಯಿಂದಿರಿ! 🙏`,
        generic_response: `ನಾನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತೇನೆ. ನಿಮ್ಮನ್ನು ಸರಿಯಾದ ಪರಿಹಾರದೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಲು ಅನುಮತಿಸಿ. ನಿರ್ದಿಷ್ಟವಾಗಿ ಯಾವ ವಿಷಯದಲ್ಲಿ ಸಹಾಯ ಬೇಕು?`,
        opt_pay_now: '💳 ನಾನು ಈಗ ಪಾವತಿಸಬಲ್ಲೆ',
        opt_need_time: '⏰ ನನಗೆ ಹೆಚ್ಚು ಸಮಯ ಬೇಕು',
        opt_hardship: '📉 ಆರ್ಥಿಕ ತೊಂದರೆ',
        opt_dispute: '❓ ನನಗೆ ವಿವಾದ ಇದೆ',
        opt_job_loss: '💼 ಉದ್ಯೋಗ ನಷ್ಟ / ಆದಾಯ ಕಡಿತ',
        opt_medical: '🏥 ವೈದ್ಯಕೀಯ ತುರ್ತು',
        opt_business_loss: '🌾 ಬೆಳೆ ವಿಫಲತೆ / ವ್ಯಾಪಾರ ನಷ್ಟ',
        opt_family: '👪 ಕುಟುಂಬ ತುರ್ತು',
        opt_confirm: '✅ ಹೌದು, ಈ ಯೋಜನೆ ದೃಢೀಕರಿಸಿ',
        opt_back: '↩️ ಇತರ ಆಯ್ಕೆಗಳನ್ನು ತೋರಿಸಿ',
        opt_thanks: '👍 ಧನ್ಯವಾದ, ಅಷ್ಟೇ',
        typing_placeholder: 'ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...',
        start_btn: '🚀 ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ',
        bot_ready_title: 'AI ಮಾತುಕತೆ ಬಾಟ್ ಸಿದ್ಧ',
        bot_ready_desc: "{name} ಖಾತೆಯೊಂದಿಗೆ ನೇರ ಸಂಭಾಷಣೆ ಸಿಮ್ಯುಲೇಶನ್ ಪ್ರಾರಂಭಿಸಿ.",
        reset_btn: 'ರೀಸೆಟ್',
        select_account: 'ಖಾತೆ ಆಯ್ಕೆ ಮಾಡಿ',
        account_summary: 'ಖಾತೆ ಸಾರಾಂಶ',
        bot_capabilities: '🤖 ಬಾಟ್ ಸಾಮರ್ಥ್ಯಗಳು',
        language_label: '🌐 ಭಾಷೆ',
        tts_label: '🔊 ಪಠ್ಯ-ಮಾತು',
        stt_label: '🎤 ಧ್ವನಿ ಇನ್‌ಪುಟ್',
        listening: '🎤 ಕೇಳುತ್ತಿದ್ದೇನೆ...',
        stt_not_supported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಪೀಚ್ ರೆಕಗ್ನಿಷನ್ ಬೆಂಬಲಿಸಲ್ಪಡುವುದಿಲ್ಲ.',
        tts_not_supported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ಬೆಂಬಲಿಸಲ್ಪಡುವುದಿಲ್ಲ.',
    },
    'ml-IN': {
        greeting: `നമസ്കാരം {name}! 👋\n\nഞാൻ നിങ്ങളുടെ ബാങ്കിന്റെ DhanSetu അസിസ്റ്റന്റ് ആണ്. നിങ്ങളുടെ {product} EMI ₹{emi} {dpd} ദിവസമായി കുടിശ്ശിക ആണ്, ₹{outstanding} ഇനിയും അടക്കാനുണ്ട് എന്ന് ഞാൻ ശ്രദ്ധിച്ചു.\n\nനിങ്ങൾക്ക് ഉചിതമായ ഒരു പരിഹാരം കണ്ടെത്താൻ സഹായിക്കാൻ ഞാൻ ഇവിടെ ഉണ്ട്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?`,
        pay_now_response: `ഉഗ്രൻ! 🎉 ഞാൻ ഇപ്പോൾ തന്നെ നിങ്ങൾക്ക് ഒരു സുരക്ഷിത പേയ്‌മെന്റ് ലിങ്ക് അയക്കും.\n\nതുക: ₹{overdue}\n\n✅ ഇവിടെ അടക്കുക: pay.bank.ai/recover/{id}\n\nപേയ്‌മെന്റ് സ്ഥിരീകരിച്ചതിന് ശേഷം, നിങ്ങളുടെ അക്കൗണ്ട് 24 മണിക്കൂറിനുള്ളിൽ അപ്‌ഡേറ്റ് ആകും. നന്ദി!`,
        need_time_response: `ഞാൻ മനസ്സിലാക്കുന്നു — ജീവിതം അനിശ്ചിതമായിരിക്കാം. ഞാൻ നിങ്ങൾക്ക് ചില വഴക്കമുള്ള ഓപ്ഷനുകൾ നൽകുന്നു:\n\nദയവായി നിങ്ങൾക്ക് ഏറ്റവും അനുയോജ്യമായത് തിരഞ്ഞെടുക്കുക:`,
        hardship_response: `ഞാൻ നിങ്ങളുടെ വാക്കുകൾ കേൾക്കുന്നു, നിങ്ങൾ ബുദ്ധിമുട്ടുള്ള സമയത്തിലൂടെ കടന്നുപോകുന്നു എന്ന് കേട്ടതിൽ ദുഃഖം. 🙏\n\nനിങ്ങളുടെ സ്ഥിതി നന്നായി മനസ്സിലാക്കാൻ നിങ്ങൾ എന്നെ സഹായിക്കുമോ?`,
        dispute_response: `ഞാൻ നിങ്ങളെ ഉടൻ ഒരു സീനിയർ ബാങ്കിംഗ് ഓഫീസറുമായി ബന്ധിപ്പിക്കും.\n\n📞 നിങ്ങളുടെ കേസ് നമ്പർ: DISP-{case}\n\nഒരു ഡെഡിക്കേറ്റഡ് ഏജന്റ് 2 മണിക്കൂറിനുള്ളിൽ {phone} ൽ വിളിക്കും.`,
        hardship_detail_response: `പങ്കുവെച്ചതിന് നന്ദി. നിങ്ങളെ പോലുള്ള സാഹചര്യങ്ങൾക്കായി ഞങ്ങൾക്ക് ഒരു പ്രത്യേക ബുദ്ധിമുട്ട് ആശ്വാസ പ്രോഗ്രാം ഉണ്ട്.\n\nനിങ്ങളുടെ അക്കൗണ്ട് ചരിത്രത്തിന്റെ അടിസ്ഥാനത്തിൽ, ഈ ഓപ്ഷനുകൾ നൽകാൻ ഞാൻ അധികാരപ്പെട്ടിരിക്കുന്നു:`,
        confirm_response: `മികച്ച തിരഞ്ഞെടുപ്പ്! നിങ്ങൾ തിരഞ്ഞെടുത്ത പ്ലാനിന്റെ സംഗ്രഹം:\n\n📋 {label}\n📌 {detail}\n\nഈ പ്ലാൻ കൂടുതൽ പിഴകൾ തടയും. നിങ്ങൾ സ്ഥിരീകരിക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?`,
        resolved_response: `🎉 നിങ്ങളുടെ പുനർഘടന പ്ലാൻ സ്ഥിരീകരിച്ചു!\n\nറഫറൻസ് ID: REST-{ref}\n\nനിങ്ങൾക്ക് ലഭിക്കും:\n• {phone} ൽ ഒരു സ്ഥിരീകരണ SMS\n• പുനർഘടന കരാറോടൊപ്പം ഒരു ഇമെയിൽ\n• നിങ്ങളുടെ പുതിയ പേയ്‌മെന്റ് ഷെഡ്യൂൾ\n\nഞങ്ങളോടൊപ്പം ഇത് പരിഹരിച്ചതിന് നന്ദി!`,
        end_response: `സ്വാഗതം! നിങ്ങളുടെ ദിവസം ശുഭകരമാകട്ടെ. ഓർക്കുക, നിങ്ങൾക്ക് എപ്പോഴും ഞങ്ങളെ ബന്ധപ്പെടാം:\n📞 1800-XXX-XXXX (ടോൾ-ഫ്രീ)\n💬 WhatsApp: +91-9876543210\n\nശ്രദ്ധിക്കുക! 🙏`,
        generic_response: `ഞാൻ മനസ്സിലാക്കുന്നു. ശരിയായ പരിഹാരവുമായി നിങ്ങളെ ബന്ധിപ്പിക്കാൻ അനുവദിക്കൂ. പ്രത്യേകമായി എന്തിൽ സഹായം വേണം?`,
        opt_pay_now: '💳 എനിക്ക് ഇപ്പോൾ അടക്കാം',
        opt_need_time: '⏰ എനിക്ക് കൂടുതൽ സമയം വേണം',
        opt_hardship: '📉 സാമ്പത്തിക ബുദ്ധിമുട്ട്',
        opt_dispute: '❓ എനിക്ക് ഒരു തർക്കം ഉണ്ട്',
        opt_job_loss: '💼 ജോലി നഷ്ടം / വരുമാനം കുറഞ്ഞു',
        opt_medical: '🏥 വൈദ്യ അടിയന്തരാവസ്ഥ',
        opt_business_loss: '🌾 വിള നഷ്ടം / ബിസിനസ് നഷ്ടം',
        opt_family: '👪 കുടുംബ അടിയന്തരാവസ്ഥ',
        opt_confirm: '✅ അതെ, ഈ പ്ലാൻ സ്ഥിരീകരിക്കുക',
        opt_back: '↩️ മറ്റ് ഓപ്ഷനുകൾ കാണിക്കുക',
        opt_thanks: '👍 നന്ദി, അത്രമതി',
        typing_placeholder: 'സന്ദേശം ടൈപ്പ് ചെയ്യുക...',
        start_btn: '🚀 സംഭാഷണം ആരംഭിക്കുക',
        bot_ready_title: 'AI ചർച്ച ബോട്ട് തയ്യാർ',
        bot_ready_desc: "{name} ന്റെ അക്കൗണ്ടുമായി ലൈവ് സംഭാഷണ സിമുലേഷൻ ആരംഭിക്കുക.",
        reset_btn: 'റീസെറ്റ്',
        select_account: 'അക്കൗണ്ട് തിരഞ്ഞെടുക്കുക',
        account_summary: 'അക്കൗണ്ട് സംഗ്രഹം',
        bot_capabilities: '🤖 ബോട്ട് കഴിവുകൾ',
        language_label: '🌐 ഭാഷ',
        tts_label: '🔊 ടെക്സ്റ്റ്-ടു-സ്പീച്ച്',
        stt_label: '🎤 വോയ്‌സ് ഇൻപുട്ട്',
        listening: '🎤 കേൾക്കുന്നു...',
        stt_not_supported: 'ഈ ബ്രൗസറിൽ സ്പീച്ച് റെക്കഗ്നിഷൻ പിന്തുണയ്ക്കുന്നില്ല.',
        tts_not_supported: 'ഈ ബ്രൗസറിൽ ടെക്സ്റ്റ്-ടു-സ്പീച്ച് പിന്തുണയ്ക്കുന്നില്ല.',
    },
    'pa-IN': {
        greeting: `ਸਤ ਸ੍ਰੀ ਅਕਾਲ {name}! 👋\n\nਮੈਂ ਤੁਹਾਡੇ ਬੈਂਕ ਦਾ DhanSetu ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਦੇਖਿਆ ਕਿ ਤੁਹਾਡੀ {product} EMI ₹{emi} {dpd} ਦਿਨਾਂ ਤੋਂ ਬਕਾਇਆ ਹੈ, ਅਤੇ ₹{outstanding} ਅਜੇ ਵੀ ਅਦਾ ਕਰਨੀ ਹੈ।\n\nਮੈਂ ਤੁਹਾਡੇ ਲਈ ਕੰਮ ਕਰਨ ਵਾਲਾ ਹੱਲ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?`,
        pay_now_response: `ਸ਼ਾਨਦਾਰ! 🎉 ਮੈਂ ਹੁਣੇ ਤੁਹਾਨੂੰ ਇੱਕ ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਲਿੰਕ ਭੇਜਾਂਗਾ।\n\nਰਕਮ: ₹{overdue}\n\n✅ ਇੱਥੇ ਭੁਗਤਾਨ ਕਰੋ: pay.bank.ai/recover/{id}\n\nਭੁਗਤਾਨ ਦੀ ਪੁਸ਼ਟੀ ਹੋਣ ਤੋਂ ਬਾਅਦ, ਤੁਹਾਡਾ ਖਾਤਾ 24 ਘੰਟਿਆਂ ਵਿੱਚ ਅੱਪਡੇਟ ਹੋ ਜਾਵੇਗਾ। ਧੰਨਵਾਦ!`,
        need_time_response: `ਮੈਂ ਸਮਝਦਾ ਹਾਂ — ਜ਼ਿੰਦਗੀ ਅਣਕਿਆਸੀ ਹੋ ਸਕਦੀ ਹੈ। ਮੈਂ ਤੁਹਾਨੂੰ ਕੁਝ ਲਚਕੀਲੇ ਵਿਕਲਪ ਦਿੰਦਾ ਹਾਂ:\n\nਕਿਰਪਾ ਕਰਕੇ ਉਹ ਵਿਕਲਪ ਚੁਣੋ ਜੋ ਤੁਹਾਡੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਹੋਵੇ:`,
        hardship_response: `ਮੈਂ ਤੁਹਾਡੀ ਗੱਲ ਸੁਣ ਰਿਹਾ ਹਾਂ, ਅਤੇ ਤੁਸੀਂ ਔਖੇ ਸਮੇਂ ਵਿੱਚੋਂ ਲੰਘ ਰਹੇ ਹੋ ਇਹ ਸੁਣ ਕੇ ਦੁੱਖ ਹੋਇਆ। 🙏\n\nਕੀ ਤੁਸੀਂ ਮੈਨੂੰ ਆਪਣੀ ਸਥਿਤੀ ਬਾਰੇ ਬਿਹਤਰ ਸਮਝਣ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦੇ ਹੋ?`,
        dispute_response: `ਮੈਂ ਤੁਹਾਨੂੰ ਤੁਰੰਤ ਇੱਕ ਸੀਨੀਅਰ ਬੈਂਕਿੰਗ ਅਧਿਕਾਰੀ ਨਾਲ ਜੋੜਾਂਗਾ।\n\n📞 ਤੁਹਾਡਾ ਕੇਸ ਨੰਬਰ: DISP-{case}\n\nਇੱਕ ਸਮਰਪਿਤ ਏਜੰਟ 2 ਘੰਟਿਆਂ ਵਿੱਚ {phone} 'ਤੇ ਕਾਲ ਕਰੇਗਾ।`,
        hardship_detail_response: `ਸਾਂਝਾ ਕਰਨ ਲਈ ਧੰਨਵਾਦ। ਤੁਹਾਡੇ ਵਰਗੀਆਂ ਸਥਿਤੀਆਂ ਲਈ ਸਾਡੇ ਕੋਲ ਇੱਕ ਵਿਸ਼ੇਸ਼ ਮੁਸ਼ਕਲ ਰਾਹਤ ਪ੍ਰੋਗਰਾਮ ਹੈ।\n\nਤੁਹਾਡੇ ਖਾਤੇ ਦੇ ਇਤਿਹਾਸ ਦੇ ਆਧਾਰ 'ਤੇ, ਮੈਂ ਤੁਹਾਨੂੰ ਇਹ ਵਿਕਲਪ ਦੇਣ ਲਈ ਅਧਿਕਾਰਤ ਹਾਂ:`,
        confirm_response: `ਵਧੀਆ ਚੋਣ! ਤੁਹਾਡੀ ਚੁਣੀ ਹੋਈ ਯੋਜਨਾ ਦਾ ਸਾਰ:\n\n📋 {label}\n📌 {detail}\n\nਇਹ ਯੋਜਨਾ ਕਿਸੇ ਵੀ ਹੋਰ ਜੁਰਮਾਨੇ ਨੂੰ ਰੋਕੇਗੀ। ਕੀ ਤੁਸੀਂ ਪੁਸ਼ਟੀ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?`,
        resolved_response: `🎉 ਤੁਹਾਡੀ ਪੁਨਰਗਠਨ ਯੋਜਨਾ ਦੀ ਪੁਸ਼ਟੀ ਹੋ ਗਈ ਹੈ!\n\nਹਵਾਲਾ ID: REST-{ref}\n\nਤੁਹਾਨੂੰ ਮਿਲੇਗਾ:\n• {phone} 'ਤੇ ਇੱਕ ਪੁਸ਼ਟੀ SMS\n• ਪੁਨਰਗਠਨ ਸਮਝੌਤੇ ਦੇ ਨਾਲ ਇੱਕ ਈਮੇਲ\n• ਤੁਹਾਡਾ ਨਵਾਂ ਭੁਗਤਾਨ ਸਮਾਂ-ਸਾਰਣੀ\n\nਸਾਡੇ ਨਾਲ ਇਸ ਨੂੰ ਹੱਲ ਕਰਨ ਲਈ ਧੰਨਵਾਦ!`,
        end_response: `ਜੀ ਆਇਆਂ ਨੂੰ! ਤੁਹਾਡਾ ਦਿਨ ਚੰਗਾ ਰਹੇ। ਯਾਦ ਰੱਖੋ, ਤੁਸੀਂ ਹਮੇਸ਼ਾ ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰ ਸਕਦੇ ਹੋ:\n📞 1800-XXX-XXXX (ਟੋਲ-ਫ੍ਰੀ)\n💬 WhatsApp: +91-9876543210\n\nਖਿਆਲ ਰੱਖੋ! 🙏`,
        generic_response: `ਮੈਂ ਸਮਝਦਾ ਹਾਂ। ਮੈਨੂੰ ਤੁਹਾਨੂੰ ਸਹੀ ਹੱਲ ਨਾਲ ਜੋੜਨ ਦਿਓ। ਖਾਸ ਤੌਰ 'ਤੇ ਕਿਸ ਵਿੱਚ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?`,
        opt_pay_now: '💳 ਮੈਂ ਹੁਣ ਭੁਗਤਾਨ ਕਰ ਸਕਦਾ ਹਾਂ',
        opt_need_time: '⏰ ਮੈਨੂੰ ਹੋਰ ਸਮਾਂ ਚਾਹੀਦਾ ਹੈ',
        opt_hardship: '📉 ਵਿੱਤੀ ਮੁਸ਼ਕਲ',
        opt_dispute: '❓ ਮੇਰਾ ਵਿਵਾਦ ਹੈ',
        opt_job_loss: '💼 ਨੌਕਰੀ ਗੁਆਉਣਾ / ਆਮਦਨ ਘਟਣਾ',
        opt_medical: '🏥 ਡਾਕਟਰੀ ਐਮਰਜੈਂਸੀ',
        opt_business_loss: '🌾 ਫਸਲ ਅਸਫਲਤਾ / ਕਾਰੋਬਾਰ ਨੁਕਸਾਨ',
        opt_family: '👪 ਪਰਿਵਾਰਕ ਐਮਰਜੈਂਸੀ',
        opt_confirm: '✅ ਹਾਂ, ਇਸ ਯੋਜਨਾ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
        opt_back: '↩️ ਹੋਰ ਵਿਕਲਪ ਦਿਖਾਓ',
        opt_thanks: '👍 ਧੰਨਵਾਦ, ਬੱਸ',
        typing_placeholder: 'ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ...',
        start_btn: '🚀 ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ',
        bot_ready_title: 'AI ਗੱਲਬਾਤ ਬੋਟ ਤਿਆਰ',
        bot_ready_desc: "{name} ਦੇ ਖਾਤੇ ਨਾਲ ਲਾਈਵ ਗੱਲਬਾਤ ਸਿਮੂਲੇਸ਼ਨ ਸ਼ੁਰੂ ਕਰੋ।",
        reset_btn: 'ਰੀਸੈੱਟ',
        select_account: 'ਖਾਤਾ ਚੁਣੋ',
        account_summary: 'ਖਾਤਾ ਸਾਰ',
        bot_capabilities: '🤖 ਬੋਟ ਸਮਰੱਥਾਵਾਂ',
        language_label: '🌐 ਭਾਸ਼ਾ',
        tts_label: '🔊 ਟੈਕਸਟ-ਟੂ-ਸਪੀਚ',
        stt_label: '🎤 ਵੌਇਸ ਇਨਪੁੱਟ',
        listening: '🎤 ਸੁਣ ਰਿਹਾ ਹਾਂ...',
        stt_not_supported: 'ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸਪੀਚ ਰਿਕੋਗਨੀਸ਼ਨ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ।',
        tts_not_supported: 'ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਟੈਕਸਟ-ਟੂ-ਸਪੀਚ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ।',
    },
};

// Fallback for languages without full translations - use English
function getTranslation(langCode: string, key: TranslationKey): string {
    const lang = TRANSLATIONS[langCode] || TRANSLATIONS['en-IN'];
    return lang[key] || TRANSLATIONS['en-IN'][key];
}

function interpolate(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

function calculateRestructure(outstanding: number, emi: number, dpd: number) {
    return [
        {
            id: 'ext3',
            label: `Pay ₹${Math.round(emi * 0.33).toLocaleString('en-IN')} now + 3 installments`,
            detail: `₹${Math.round(emi * 0.33).toLocaleString('en-IN')} today, then ₹${Math.round((outstanding - emi * 0.33) / 3).toLocaleString('en-IN')}/month × 3`,
        },
        {
            id: 'emi_reduce',
            label: `Reduce EMI to ₹${Math.round(emi * 0.65).toLocaleString('en-IN')} for 6 months`,
            detail: `New EMI: ₹${Math.round(emi * 0.65).toLocaleString('en-IN')}/month for 6 months, then original EMI. Tenor extended by 8 months.`,
        },
        {
            id: 'settlement',
            label: `One-time settlement: ₹${Math.round(outstanding * 0.75).toLocaleString('en-IN')} (25% waiver)`,
            detail: `Clear dues with ₹${Math.round(outstanding * 0.75).toLocaleString('en-IN')} — saves ₹${Math.round(outstanding * 0.25).toLocaleString('en-IN')} in interest.`,
        },
    ];
}

const BOT_AVATAR = (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
            <path d="M12 8V4H8" /><rect x="2" y="8" width="20" height="12" rx="2" fill="white" fillOpacity="0.9" />
            <circle cx="8" cy="14" r="1.5" fill="#0d9488" /><circle cx="12" cy="14" r="1.5" fill="#0d9488" /><circle cx="16" cy="14" r="1.5" fill="#0d9488" />
        </svg>
    </div>
);

// ─── Web Speech API Types ─────────────────────────────────────────────────────
interface ISpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    continuous: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
    onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
    onerror: ((this: ISpeechRecognition, ev: Event) => void) | null;
    onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
}

interface ISpeechRecognitionEvent extends Event {
    results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionResultList {
    [index: number]: ISpeechRecognitionResult;
    length: number;
}

interface ISpeechRecognitionResult {
    [index: number]: ISpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface ISpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

declare global {
    interface Window {
        SpeechRecognition: new () => ISpeechRecognition;
        webkitSpeechRecognition: new () => ISpeechRecognition;
    }
}

export default function AIBot() {
    const { loanData, selectedRecord: preselected, appLanguage } = useApp();
    const [record, setRecord] = useState(preselected || loanData[0]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [state, setState] = useState<BotState>('greeting');
    const [typing, setTyping] = useState(false);
    const [chosenOption, setChosenOption] = useState<string | null>(null);
    const [started, setStarted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // ── Language & TTS/STT State ──────────────────────────────────────────────
    // Default to global app language; user can override locally in the bot panel
    const [selectedLang, setSelectedLang] = useState(appLanguage.code);
    const [ttsEnabled, setTtsEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [ttsSupported, setTtsSupported] = useState(true);
    const [sttSupported, setSttSupported] = useState(true);
    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    const t = useCallback((key: TranslationKey) => getTranslation(selectedLang, key), [selectedLang]);

    useEffect(() => {
        if (preselected) setRecord(preselected);
    }, [preselected]);

    // Sync bot language when global app language changes
    useEffect(() => {
        setSelectedLang(appLanguage.code);
        setStarted(false);
        setMessages([]);
        setState('greeting');
    }, [appLanguage.code]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    // ── TTS/STT Init ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setTtsSupported('speechSynthesis' in window);
            setSttSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
            if ('speechSynthesis' in window) {
                synthRef.current = window.speechSynthesis;
            }
        }
    }, []);

    // Stop TTS when language changes
    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
        }
    }, [selectedLang]);

    function speakText(text: string) {
        if (!ttsEnabled || !synthRef.current || !ttsSupported) return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLang;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to find a voice for the selected language
        const voices = synthRef.current.getVoices();
        const langVoice = voices.find(v => v.lang === selectedLang || v.lang.startsWith(selectedLang.split('-')[0]));
        if (langVoice) utterance.voice = langVoice;

        synthRef.current.speak(utterance);
    }

    function startSTT() {
        if (!sttSupported) {
            alert(t('stt_not_supported'));
            return;
        }
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = selectedLang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: ISpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }

    function stopSTT() {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }

    function addBotMessage(text: string, options?: { label: string; value: string }[], delay = 800) {
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'bot',
                text,
                timestamp: new Date(),
                options,
            }]);
            speakText(text);
        }, delay);
    }

    function startConversation() {
        setStarted(true);
        setMessages([]);
        setState('greeting');
        const greeting = interpolate(t('greeting'), {
            name: record.customer.name,
            product: record.loan.product,
            emi: record.loan.emiAmount.toLocaleString('en-IN'),
            dpd: record.loan.currentDpd,
            outstanding: record.loan.overdueAmount.toLocaleString('en-IN'),
        });
        addBotMessage(greeting, [
            { label: t('opt_pay_now'), value: 'pay_now' },
            { label: t('opt_need_time'), value: 'need_time' },
            { label: t('opt_hardship'), value: 'hardship' },
            { label: t('opt_dispute'), value: 'dispute' },
        ], 600);
    }

    function handleOptionClick(value: string) {
        const label = messages[messages.length - 1]?.options?.find(o => o.value === value)?.label || value;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: label, timestamp: new Date() }]);

        if (value === 'pay_now') {
            setState('resolved');
            addBotMessage(interpolate(t('pay_now_response'), {
                overdue: record.loan.overdueAmount.toLocaleString('en-IN'),
                id: record.customer.id,
            }));
        } else if (value === 'need_time') {
            setState('options');
            const opts = calculateRestructure(record.loan.outstandingAmount, record.loan.emiAmount, record.loan.currentDpd);
            addBotMessage(t('need_time_response'), opts.map(o => ({ label: o.label, value: o.id })));
        } else if (value === 'hardship') {
            setState('hardship');
            addBotMessage(t('hardship_response'), [
                { label: t('opt_job_loss'), value: 'job_loss' },
                { label: t('opt_medical'), value: 'medical' },
                { label: t('opt_business_loss'), value: 'business_loss' },
                { label: t('opt_family'), value: 'family' },
            ]);
        } else if (value === 'dispute') {
            setState('escalate');
            addBotMessage(interpolate(t('dispute_response'), {
                case: Date.now().toString().slice(-6),
                phone: record.customer.phone,
            }));
        } else if (['job_loss', 'medical', 'business_loss', 'family'].includes(value)) {
            setState('options');
            const opts = calculateRestructure(record.loan.outstandingAmount, record.loan.emiAmount, record.loan.currentDpd);
            addBotMessage(t('hardship_detail_response'), opts.map(o => ({ label: o.label, value: o.id })));
        } else if (['ext3', 'emi_reduce', 'settlement'].includes(value)) {
            setChosenOption(value);
            setState('confirm');
            const opts = calculateRestructure(record.loan.outstandingAmount, record.loan.emiAmount, record.loan.currentDpd);
            const chosen = opts.find(o => o.id === value)!;
            addBotMessage(interpolate(t('confirm_response'), {
                label: chosen.label,
                detail: chosen.detail,
            }), [
                { label: t('opt_confirm'), value: 'confirmed' },
                { label: t('opt_back'), value: 'need_time' },
            ]);
        } else if (value === 'confirmed') {
            setState('resolved');
            addBotMessage(interpolate(t('resolved_response'), {
                ref: Date.now().toString().slice(-8),
                phone: record.customer.phone,
            }), [
                { label: t('opt_thanks'), value: 'end' },
            ]);
        } else if (value === 'end') {
            addBotMessage(t('end_response'));
        }
    }

    function handleSend() {
        if (!input.trim()) return;
        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText, timestamp: new Date() }]);

        const lower = userText.toLowerCase();
        if (lower.includes('pay') || lower.includes('payment') || lower.includes('भुगतान') || lower.includes('পেমেন্ট') || lower.includes('ਭੁਗਤਾਨ') || lower.includes('ادا')) {
            addBotMessage(interpolate(t('pay_now_response'), {
                overdue: record.loan.overdueAmount.toLocaleString('en-IN'),
                id: record.customer.id,
            }), [
                { label: t('opt_pay_now'), value: 'pay_now' },
                { label: t('opt_need_time'), value: 'need_time' },
            ]);
        } else if (lower.includes('restructur') || lower.includes('emi') || lower.includes('reduce') || lower.includes('पुनर्') || lower.includes('পুনর্')) {
            handleOptionClick('need_time');
        } else if (lower.includes('can\'t') || lower.includes('cannot') || lower.includes('job') || lower.includes('hospital') || lower.includes('sick') || lower.includes('नौकरी') || lower.includes('बीमार') || lower.includes('চাকরি')) {
            handleOptionClick('hardship');
        } else if (lower.includes('dispute') || lower.includes('wrong') || lower.includes('incorrect') || lower.includes('विवाद') || lower.includes('বিরোধ')) {
            handleOptionClick('dispute');
        } else {
            addBotMessage(t('generic_response'), [
                { label: t('opt_pay_now'), value: 'pay_now' },
                { label: t('opt_need_time'), value: 'need_time' },
                { label: t('opt_hardship'), value: 'hardship' },
                { label: t('opt_dispute'), value: 'dispute' },
            ]);
        }
    }

    const currentLangInfo = INDIAN_LANGUAGES.find(l => l.code === selectedLang) || INDIAN_LANGUAGES[0];

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1200, display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, height: 'calc(100vh - 56px)' }}>
            {/* Left Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>AI Negotiation Bot</h2>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Multilingual AI debt negotiation</p>
                </div>

                {/* ── Language Selector ── */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                        {t('language_label')}
                    </div>
                    <select
                        value={selectedLang}
                        onChange={e => {
                            setSelectedLang(e.target.value);
                            if (started) {
                                setStarted(false);
                                setMessages([]);
                                setState('greeting');
                            }
                        }}
                        style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #0d9488', borderRadius: 8, fontSize: '0.82rem', fontFamily: 'Inter', outline: 'none', cursor: 'pointer', background: '#f0fdf4', color: '#0f172a', fontWeight: 600 }}
                    >
                        {INDIAN_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>
                                {lang.flag} {lang.nativeName} ({lang.name})
                            </option>
                        ))}
                    </select>
                    <div style={{ marginTop: 8, padding: '6px 10px', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: '0.75rem', color: '#065f46', fontWeight: 600, textAlign: 'center' }}>
                        {currentLangInfo.flag} {currentLangInfo.nativeName} — {currentLangInfo.name}
                    </div>
                </div>

                {/* ── TTS / STT Controls ── */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Voice Options</div>

                    {/* TTS Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '8px 10px', background: ttsEnabled ? '#f0fdf4' : '#f8fafc', borderRadius: 8, border: `1px solid ${ttsEnabled ? '#0d9488' : '#e2e8f0'}` }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{t('tts_label')}</div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                {ttsSupported ? 'Auto-read bot messages' : t('tts_not_supported')}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (!ttsSupported) { alert(t('tts_not_supported')); return; }
                                setTtsEnabled(p => !p);
                                if (ttsEnabled && synthRef.current) synthRef.current.cancel();
                            }}
                            style={{
                                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: ttsEnabled ? '#0d9488' : '#cbd5e1',
                                position: 'relative', transition: 'background 0.2s',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{
                                width: 18, height: 18, borderRadius: '50%', background: 'white',
                                position: 'absolute', top: 3, left: ttsEnabled ? 23 : 3,
                                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </button>
                    </div>

                    {/* STT Info */}
                    <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{t('stt_label')}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {sttSupported ? 'Click 🎤 in chat to speak' : t('stt_not_supported')}
                        </div>
                    </div>

                    {/* Supported Languages Info */}
                    <div style={{ marginTop: 8, padding: '6px 8px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fde68a', fontSize: '0.68rem', color: '#92400e' }}>
                        ⚠️ TTS/STT quality depends on browser support for the selected language. Chrome recommended.
                    </div>
                </div>

                {/* Account picker */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>{t('select_account')}</div>
                    <select
                        value={record.customer.id}
                        onChange={e => {
                            const r = loanData.find(r => r.customer.id === e.target.value);
                            if (r) { setRecord(r); setStarted(false); setMessages([]); setState('greeting'); }
                        }}
                        style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.82rem', fontFamily: 'Inter', outline: 'none', cursor: 'pointer' }}
                    >
                        {loanData.slice(0, 50).map(r => (
                            <option key={r.customer.id} value={r.customer.id}>
                                {r.customer.name} ({r.risk.riskTier})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Account summary */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>{t('account_summary')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #ccfbf1, #d1fae5)', border: '2px solid #0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#0d9488' }}>
                            {record.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{record.customer.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{record.customer.phone}</div>
                        </div>
                    </div>
                    {[
                        ['Product', record.loan.product],
                        ['Overdue', `₹${record.loan.overdueAmount.toLocaleString('en-IN')}`],
                        ['DPD', `${record.loan.currentDpd} days`],
                        ['Outstanding', `₹${record.loan.outstandingAmount.toLocaleString('en-IN')}`],
                        ['Risk', record.risk.riskTier],
                        ['Uplift Score', `${record.risk.upliftScore}/100`],
                    ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f8fafc', fontSize: '0.78rem' }}>
                            <span style={{ color: '#64748b' }}>{k}</span>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{v}</span>
                        </div>
                    ))}
                </div>

                {/* Bot capabilities */}
                <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)', borderRadius: 14, padding: '14px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', marginBottom: 10 }}>{t('bot_capabilities')}</div>
                    {[
                        `23 Indian languages supported`,
                        'TTS: Auto-read responses',
                        'STT: Voice input support',
                        'Intent recognition (9 categories)',
                        'Dynamic restructuring calculation',
                        'Hardship pathway detection',
                        'Auto human escalation',
                    ].map(c => (
                        <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0d9488', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.73rem', color: '#065f46' }}>{c}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
                {/* Chat Header */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #0d9488, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                            <path d="M12 8V4H8" /><rect x="2" y="8" width="20" height="12" rx="2" fill="white" fillOpacity="0.9" />
                            <circle cx="8" cy="14" r="1.5" fill="#0d9488" /><circle cx="12" cy="14" r="1.5" fill="#0d9488" /><circle cx="16" cy="14" r="1.5" fill="#0d9488" />
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>DhanSetu Bot</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Active • Serving {record.customer.name}</span>
                        </div>
                    </div>
                    {/* Language badge in header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {ttsEnabled && (
                            <div style={{ fontSize: '0.7rem', color: '#0d9488', background: '#f0fdf4', border: '1px solid #0d9488', borderRadius: 6, padding: '3px 7px', fontWeight: 600 }}>
                                🔊 TTS ON
                            </div>
                        )}
                        <div style={{ fontSize: '0.7rem', color: '#0f172a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 8px', fontWeight: 700 }}>
                            {currentLangInfo.flag} {currentLangInfo.nativeName}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 14, background: '#fafcff' }}>
                    {!started ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '40px' }}>
                            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #ccfbf1, #d1fae5)', border: '2px solid #0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                🤖
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', marginBottom: 6 }}>{t('bot_ready_title')}</div>
                                <div style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 340 }}>
                                    {interpolate(t('bot_ready_desc'), { name: record.customer.name })}
                                </div>
                                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#0d9488', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>
                                        {currentLangInfo.flag} {currentLangInfo.nativeName}
                                    </span>
                                    {ttsEnabled && <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>🔊 TTS</span>}
                                    {sttSupported && <span style={{ fontSize: '0.72rem', background: '#fdf4ff', color: '#a855f7', border: '1px solid #e9d5ff', borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>🎤 STT</span>}
                                </div>
                            </div>
                            <button onClick={startConversation}
                                style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #0d9488, #16a34a)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(13,148,136,0.3)' }}>
                                {t('start_btn')}
                            </button>
                        </div>
                    ) : (
                        <>
                            {messages.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-end' }}>
                                    {msg.role === 'bot' && BOT_AVATAR}
                                    <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                            <div
                                                className={msg.role === 'bot' ? 'chat-bubble-bot' : 'chat-bubble-user'}
                                                style={{ padding: '10px 14px', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-line', wordBreak: 'break-word', flex: 1 }}>
                                                {msg.text}
                                            </div>
                                            {/* TTS replay button for bot messages */}
                                            {msg.role === 'bot' && ttsEnabled && ttsSupported && (
                                                <button
                                                    onClick={() => speakText(msg.text)}
                                                    title="Read aloud"
                                                    style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, marginTop: 4 }}>
                                                    🔊
                                                </button>
                                            )}
                                        </div>
                                        {msg.options && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {msg.options.map(opt => (
                                                    <button key={opt.value} onClick={() => handleOptionClick(opt.value)}
                                                        style={{ padding: '7px 12px', background: '#f0fdf4', color: '#0d9488', border: '1.5px solid #0d9488', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}
                                                        onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#0d9488'; (e.target as HTMLButtonElement).style.color = 'white'; }}
                                                        onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#f0fdf4'; (e.target as HTMLButtonElement).style.color = '#0d9488'; }}>
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                            {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#475569', flexShrink: 0 }}>
                                            U
                                        </div>
                                    )}
                                </div>
                            ))}
                            {typing && (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                                    {BOT_AVATAR}
                                    <div className="chat-bubble-bot" style={{ padding: '10px 16px' }}>
                                        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                            {[0, 1, 2].map(i => (
                                                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', animation: `bounceDot 1.4s ease-in-out ${i * 0.16}s infinite` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </>
                    )}
                </div>

                {/* Input Bar */}
                {started && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* STT Button */}
                        <button
                            onClick={isListening ? stopSTT : startSTT}
                            title={isListening ? 'Stop listening' : t('stt_label')}
                            style={{
                                width: 40, height: 40, borderRadius: '50%', border: `2px solid ${isListening ? '#ef4444' : sttSupported ? '#0d9488' : '#cbd5e1'}`,
                                background: isListening ? '#fef2f2' : sttSupported ? '#f0fdf4' : '#f8fafc',
                                cursor: sttSupported ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
                                animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none',
                            }}>
                            {isListening ? '⏹️' : '🎤'}
                        </button>

                        <input
                            value={isListening ? t('listening') : input}
                            onChange={e => !isListening && setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !isListening && handleSend()}
                            placeholder={t('typing_placeholder')}
                            readOnly={isListening}
                            style={{
                                flex: 1, padding: '10px 14px', border: `1.5px solid ${isListening ? '#ef4444' : '#e2e8f0'}`,
                                borderRadius: 24, fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter',
                                background: isListening ? '#fef2f2' : '#f8fafc',
                                color: isListening ? '#ef4444' : '#0f172a',
                            }}
                        />

                        <button onClick={handleSend}
                            style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #16a34a)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>

                        <button onClick={() => {
                            setStarted(false); setMessages([]); setState('greeting');
                            if (synthRef.current) synthRef.current.cancel();
                            if (recognitionRef.current) recognitionRef.current.stop();
                            setIsListening(false);
                        }}
                            style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.75rem', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {t('reset_btn')}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(239,68,68,0); }
                }
            `}</style>
        </div>
    );
}

