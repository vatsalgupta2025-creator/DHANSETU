'use client';
import React, { Suspense, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import LoadingScreen from '@/components/LoadingScreen';
import LanguageSelector, { AppLanguage } from '@/components/LanguageSelector';
import RoleSelector from '@/components/RoleSelector';
import UserPortal from '@/components/UserPortal';
import Customer360 from '@/components/Customer360';
import BankSelector from '@/components/BankSelector';
import UserDetailsForm from '@/components/UserDetailsForm';
import BankLogin from '@/components/BankLogin';
import { useApp } from '@/lib/context';
import type { BankConfig } from '@/components/BankSelector';

// Lazy load pages
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });
const RiskEngine = dynamic(() => import('@/components/RiskEngine'), { ssr: false });
const MessageStudio = dynamic(() => import('@/components/MessageStudio'), { ssr: false });
const AIBot = dynamic(() => import('@/components/AIBot'), { ssr: false });
const Analytics = dynamic(() => import('@/components/Analytics'), { ssr: false });
const CampaignBuilder = dynamic(() => import('@/components/CampaignBuilder'), { ssr: false });
const InsightsHub = dynamic(() => import('@/components/InsightsHub'), { ssr: false });
const RecoveryToolkit = dynamic(() => import('@/components/RecoveryToolkit'), { ssr: false });
const ComplianceCenter = dynamic(() => import('@/components/ComplianceCenter'), { ssr: false });
const GeoHeatmap = dynamic(() => import('@/components/GeoHeatmap'), { ssr: false });
const PortfolioHeatmap = dynamic(() => import('@/components/PortfolioHeatmap'), { ssr: false });
const GandhigiriMode = dynamic(() => import('@/components/GandhigiriMode'), { ssr: false });
const ExportReports = dynamic(() => import('@/components/ExportReports'), { ssr: false });

const CashFlowCalendar = dynamic(() => import('@/components/CashFlowCalendar'), { ssr: false });
const EscalationWorkflow = dynamic(() => import('@/components/EscalationWorkflow'), { ssr: false });
const MLModelDashboard = dynamic(() => import('@/components/MLModelDashboard'), { ssr: false });
const SentimentAnalyzer = dynamic(() => import('@/components/SentimentAnalyzer'), { ssr: false });
const BulkActions = dynamic(() => import('@/components/BulkActions'), { ssr: false });

// ─── Page label translations ──────────────────────────────────────────────────
const PAGE_LABELS_BY_LANG: Record<string, Record<string, string>> = {
  'en-IN': {
    dashboard: 'Command Center', risk: 'AI Risk Engine', insights: 'Insights Hub',
    messages: 'Message Studio', bot: 'AI Negotiation Bot', campaigns: 'Campaign Builder',
    toolkit: 'Recovery Toolkit', analytics: 'Analytics & ROI', compliance: 'Compliance Center',
    geoheat: 'Geo Heatmap', portfolio: 'Portfolio Heatmap', gandhigiri: 'Gandhigiri Mode',
    escalation: 'Escalation Workflow', bulk: 'Bulk Actions', sentiment: 'Sentiment Analyzer',
    mlmodel: 'ML Model Dashboard', leaderboard: 'Agent Leaderboard', cashflow: 'Cash Flow Calendar', reports: 'Export & Reports',
  },
  'hi-IN': {
    dashboard: 'कमांड सेंटर', risk: 'AI जोखिम इंजन', insights: 'अंतर्दृष्टि केंद्र',
    messages: 'संदेश स्टूडियो', bot: 'AI वार्ता बॉट', campaigns: 'अभियान निर्माता',
    toolkit: 'रिकवरी टूलकिट', analytics: 'विश्लेषण और ROI', compliance: 'अनुपालन केंद्र',
    gandhigiri: 'गांधीगिरी मोड',
    escalation: 'एस्केलेशन वर्कफ़्लो', bulk: 'बल्क एक्शन', sentiment: 'भावना विश्लेषक',
    mlmodel: 'ML मॉडल डैशबोर्ड', leaderboard: 'एजेंट लीडरबोर्ड', cashflow: 'कैश फ्लो कैलेंडर', reports: 'निर्यात और रिपोर्ट',
  },
  'bn-IN': {
    dashboard: 'কমান্ড সেন্টার', risk: 'AI ঝুঁকি ইঞ্জিন', insights: 'অন্তর্দৃষ্টি হাব',
    messages: 'বার্তা স্টুডিও', bot: 'AI আলোচনা বট', campaigns: 'ক্যাম্পেইন বিল্ডার',
    toolkit: 'রিকভারি টুলকিট', analytics: 'বিশ্লেষণ ও ROI', compliance: 'সম্মতি কেন্দ্র',
    gandhigiri: 'গান্ধীগিরি মোড',
    escalation: 'এসক্যালেশন ওয়ার্কফ্লো', bulk: 'বাল্ক অ্যাকশন', sentiment: 'সেন্টিমেন্ট বিশ্লেষক',
    mlmodel: 'ML মডেল ড্যাশবোর্ড', leaderboard: 'এজেন্ট লিডারবোর্ড', cashflow: 'ক্যাশ ফ্লো ক্যালেন্ডার', reports: 'এক্সপোর্ট ও রিপোর্ট',
  },
  'te-IN': {
    dashboard: 'కమాండ్ సెంటర్', risk: 'AI రిస్క్ ఇంజిన్', insights: 'ఇన్‌సైట్స్ హబ్',
    messages: 'మెసేజ్ స్టూడియో', bot: 'AI చర్చా బాట్', campaigns: 'క్యాంపెయిన్ బిల్డర్',
    toolkit: 'రికవరీ టూల్‌కిట్', analytics: 'అనలిటిక్స్ & ROI', compliance: 'కంప్లయన్స్ సెంటర్',
    gandhigiri: 'గాంధీగిరి మోడ్',
    escalation: 'ఎస్కలేషన్ వర్క్‌ఫ్లో', bulk: 'బల్క్ యాక్షన్స్', sentiment: 'సెంటిమెంట్ ఎనలైజర్',
    mlmodel: 'ML మోడల్ డాష్‌బోర్డ్', leaderboard: 'ఏజెంట్ లీడర్‌బోర్డ్', cashflow: 'క్యాష్ ఫ్లో క్యాలెండర్', reports: 'ఎక్స్‌పోర్ట్ & రిపోర్ట్స్',
  },
  'mr-IN': {
    dashboard: 'कमांड सेंटर', risk: 'AI जोखीम इंजिन', insights: 'अंतर्दृष्टी हब',
    messages: 'संदेश स्टुडिओ', bot: 'AI वाटाघाटी बॉट', campaigns: 'मोहीम निर्माता',
    toolkit: 'रिकव्हरी टूलकिट', analytics: 'विश्लेषण आणि ROI', compliance: 'अनुपालन केंद्र',
    gandhigiri: 'गांधीगिरी मोड',
    escalation: 'एस्केलेशन वर्कफ्लो', bulk: 'बल्क क्रिया', sentiment: 'भावना विश्लेषक',
    mlmodel: 'ML मॉडेल डॅशबोर्ड', leaderboard: 'एजेंट लीडरबोर्ड', cashflow: 'कॅश फ्लो कॅलेंडर', reports: 'निर्यात आणि अहवाल',
  },
  'ta-IN': {
    dashboard: 'கட்டளை மையம்', risk: 'AI ஆபத்து இயந்திரம்', insights: 'நுண்ணறிவு மையம்',
    messages: 'செய்தி ஸ்டுடியோ', bot: 'AI பேச்சுவார்த்தை போட்', campaigns: 'பிரச்சார கட்டமைப்பாளர்',
    toolkit: 'மீட்பு கருவித்தொகுப்பு', analytics: 'பகுப்பாய்வு & ROI', compliance: 'இணக்க மையம்',
    gandhigiri: 'காந்திமுறை பயன்முறை',
    escalation: 'எஸ்கலேஷன் வர்க்ஃப்லோ', bulk: 'பல்க் செயல்', sentiment: 'உணர்வு பகுப்பாய்வி',
    mlmodel: 'ML மாதிரி டாஷ்போர்ட்', leaderboard: 'ஏஜெண்ட் லீடர்போர்ட்', cashflow: 'பணப்பாய்வு காலண்டர்', reports: 'எக்ஸ்போர்ட் & ரிப்போர்ட்',
  },
  'gu-IN': {
    dashboard: 'કમાન્ડ સેન્ટર', risk: 'AI જોખમ એન્જિન', insights: 'ઇનસાઇટ્સ હબ',
    messages: 'સંદેશ સ્ટુડિઓ', bot: 'AI વાટાઘાટ બૉટ', campaigns: 'ઝુંબેશ નિર્માતા',
    toolkit: 'રિકવરી ટૂલકિટ', analytics: 'વિશ્લેષણ અને ROI', compliance: 'અનુપાલન કેન્દ્ર',
    gandhigiri: 'ગાંધીગિરી મોડ',
    escalation: 'એસ્કેલેશન વર્કફ્લો', bulk: 'બલ્ક ક્રિયા', sentiment: 'ભાવના વિશ્લેષક',
    mlmodel: 'ML મોડેલ ડેશબોર્ડ', leaderboard: 'એજેન્ટ લીડરબોર્ડ', cashflow: 'કેશ ફ્લો કેલેન્ડર', reports: 'એક્સપોર્ટ અને રિપોર્ટ',
  },
  'kn-IN': {
    dashboard: 'ಕಮಾಂಡ್ ಸೆಂಟರ್', risk: 'AI ಅಪಾಯ ಇಂಜಿನ್', insights: 'ಇನ್‌ಸೈಟ್ಸ್ ಹಬ್',
    messages: 'ಸಂದೇಶ ಸ್ಟುಡಿಯೋ', bot: 'AI ಮಾತುಕತೆ ಬಾಟ್', campaigns: 'ಕ್ಯಾಂಪೇನ್ ಬಿಲ್ಡರ್',
    toolkit: 'ರಿಕವರಿ ಟೂಲ್‌ಕಿಟ್', analytics: 'ವಿಶ್ಲೇಷಣೆ & ROI', compliance: 'ಅನುಪಾಲನ ಕೇಂದ್ರ',
    gandhigiri: 'ಗಾಂಧೀಗಿರಿ ಮೋಡ್',
    escalation: 'ಎಸ್ಕಲೇಶನ್ ವರ್ಕ್‌ಫ್ಲೋ', bulk: 'ಬಲ್ಕ್ ಕ್ರಿಯೆ', sentiment: 'ಸೆಂಟಿಮೆಂಟ್ ವಿಶ್ಲೇಷಕ',
    mlmodel: 'ML ಮಾಡೆಲ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', leaderboard: 'ಏಜೆಂಟ್ ಲೀಡರ್‌ಬೋರ್ಡ್', cashflow: 'ಕ್ಯಾಶ್ ಫ್ಲೋ ಕ್ಯಾಲೆಂಡರ್', reports: 'ಎಕ್ಸ್‌ಪೋರ್ಟ್ & ರಿಪೋರ್ಟ್ಸ್',
  },
  'ml-IN': {
    dashboard: 'കമാൻഡ് സെന്റർ', risk: 'AI റിസ്ക് എഞ്ചിൻ', insights: 'ഇൻസൈറ്റ്സ് ഹബ്',
    messages: 'മെസേജ് സ്റ്റുഡിയോ', bot: 'AI ചർച്ച ബോട്ട്', campaigns: 'ക്യാമ്പെയ്ൻ ബിൽഡർ',
    toolkit: 'റിക്കവറി ടൂൾകിറ്റ്', analytics: 'അനലിറ്റിക്സ് & ROI', compliance: 'കംപ്ലയൻസ് സെന്റർ',
    gandhigiri: 'ഗാന്ധിഗിരി മോഡ്',
    escalation: 'എസ്കലേഷൻ വർക്ക്‌ഫ്ലോ', bulk: 'ബല്ക്ക് ആക്ഷൻ', sentiment: 'സെൻറിമെൻറ് അനലൈസർ',
    mlmodel: 'ML മോഡൽ ഡാഷ്‌ബോർഡ്', leaderboard: 'ഏജന്റ് ലീഡർബോർഡ്', cashflow: 'ക്യാഷ് ഫ്ലോ കലണ്ടർ', reports: 'എക്‌സ്‌പോർട് & റിപ്പോർട്റ്സ്',
  },
  'pa-IN': {
    dashboard: 'ਕਮਾਂਡ ਸੈਂਟਰ', risk: 'AI ਜੋਖਮ ਇੰਜਣ', insights: 'ਇਨਸਾਈਟਸ ਹੱਬ',
    messages: 'ਸੁਨੇਹਾ ਸਟੂਡੀਓ', bot: 'AI ਗੱਲਬਾਤ ਬੋਟ', campaigns: 'ਮੁਹਿੰਮ ਨਿਰਮਾਤਾ',
    toolkit: 'ਰਿਕਵਰੀ ਟੂਲਕਿੱਟ', analytics: 'ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ROI', compliance: 'ਪਾਲਣਾ ਕੇਂਦਰ',
    gandhigiri: 'ਗਾਂਧੀਗਿਰੀ ਮੋਡ',
    escalation: 'ਐਸਕੇਲੇਸ਼ਨ ਵਰਕਫ਼ਲੋ', bulk: 'ਬਲਕ ਐਕਸ਼ਨ', sentiment: 'ਭਾਵਨਾ ਵਿਸ਼ਲੇਸ਼ਕ',
    mlmodel: 'ML ਮਾਡਲ ਡੈਸ਼ਬੋਰਡ', leaderboard: 'ਏਜੰਟ ਲੀਡਰਬੋਰਡ', cashflow: 'ਕੈਸ਼ ਫ਼ਲੋ ਕੈਲੰਡਰ', reports: 'ਐਕਸਪੋਰਟ ਅਤੇ ਰਿਪੋਰਟ',
  },
  'or-IN': {
    dashboard: 'କମାଣ୍ଡ ସେଣ୍ଟର', risk: 'AI ଝୁଁକି ଇଞ୍ଜିନ', insights: 'ଇନ୍‌ସାଇଟ୍ସ ହବ',
    messages: 'ବାର୍ତ୍ତା ଷ୍ଟୁଡିଓ', bot: 'AI ଆଲୋଚନା ବଟ', campaigns: 'ଅଭିଯାନ ନିର୍ମାତା',
    toolkit: 'ରିକଭରି ଟୁଲ୍‌କିଟ', analytics: 'ବିଶ୍ଳେଷଣ ଓ ROI', compliance: 'ଅନୁପାଳନ କେନ୍ଦ୍ର',
    gandhigiri: 'ଗାନ୍ଧୀଗିରି ମୋଡ୍',
    escalation: 'ଏସ୍କେଲେଶନ ଓୟର୍କଫ୍ଲୋ', bulk: 'ବଲ୍କ ଅ୍ୟାକ୍ଶନ', sentiment: 'ସେଣ୍ଟିମେଣ୍ଟ ବିଶ୍ଲେଷକ',
    mlmodel: 'ML ମଡେଲ ଡ୍ୟାଶବୋର୍ଡ', leaderboard: 'ଏଜେଣ୍ଟ ଲୀଡରବୋର୍ଡ', cashflow: 'କ୍ୟାଶ ଫ୍ଲୋ କ୍ୟାଲେଣ୍ଡର', reports: 'ଏକ୍ସପୋର୍ଟ ଓ ରିପୋର୍ଟ',
  },
  'ur-IN': {
    dashboard: 'کمانڈ سینٹر', risk: 'AI رسک انجن', insights: 'بصیرت مرکز',
    messages: 'پیغام اسٹوڈیو', bot: 'AI مذاکرات بوٹ', campaigns: 'مہم ساز',
    toolkit: 'ریکوری ٹول کٹ', analytics: 'تجزیات اور ROI', compliance: 'تعمیل مرکز',
    gandhigiri: 'گاندھی گری موڈ',
    escalation: 'ایسکیلیشن ورک فلو', bulk: 'بلک ایکشن', sentiment: 'جذبات تجزیہ کار',
    mlmodel: 'ML ماڈل ڈیش بورڈ', leaderboard: 'ایجنٹ لیڈر بورڈ', cashflow: 'کیش فلو کیلنڈر', reports: 'ایکسپورٹ اور رپورٹ',
  },
};

function getPageLabel(langCode: string, page: string): string {
  return PAGE_LABELS_BY_LANG[langCode]?.[page] || PAGE_LABELS_BY_LANG['en-IN'][page] || page;
}

// ─── Status text translations ─────────────────────────────────────────────────
const STATUS_TEXT: Record<string, string> = {
  'en-IN': 'All Systems Operational',
  'hi-IN': 'सभी सिस्टम चालू हैं',
  'bn-IN': 'সমস্ত সিস্টেম চালু আছে',
  'te-IN': 'అన్ని సిస్టమ్‌లు పనిచేస్తున్నాయి',
  'mr-IN': 'सर्व प्रणाली कार्यरत आहेत',
  'ta-IN': 'அனைத்து அமைப்புகளும் செயல்படுகின்றன',
  'gu-IN': 'તમામ સિસ્ટમ ચાલુ છે',
  'kn-IN': 'ಎಲ್ಲಾ ಸಿಸ್ಟಮ್‌ಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ',
  'ml-IN': 'എല്ലാ സിസ്റ്റങ്ങളും പ്രവർത്തിക്കുന്നു',
  'pa-IN': 'ਸਾਰੇ ਸਿਸਟਮ ਚੱਲ ਰਹੇ ਹਨ',
  'or-IN': 'ସମସ୍ତ ସିଷ୍ଟମ ଚାଲୁ ଅଛି',
  'ur-IN': 'تمام سسٹم چل رہے ہیں',
};

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid #e2e8f0',
        borderTopColor: '#0d9488',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Loading module...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PageRouter() {
  const { activePage } = useApp();
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'risk' && <RiskEngine />}
      {activePage === 'insights' && <InsightsHub />}
      {activePage === 'messages' && <MessageStudio />}
      {activePage === 'bot' && <AIBot />}
      {activePage === 'analytics' && <Analytics />}
      {activePage === 'campaigns' && <CampaignBuilder />}
      {activePage === 'toolkit' && <RecoveryToolkit />}
      {activePage === 'compliance' && <ComplianceCenter />}
      {activePage === 'geoheat' && <GeoHeatmap />}
      {activePage === 'portfolio' && <PortfolioHeatmap />}
      {activePage === 'gandhigiri' && <GandhigiriMode />}
      {activePage === 'escalation' && <EscalationWorkflow />}
      {activePage === 'bulk' && <BulkActions />}
      {activePage === 'sentiment' && <SentimentAnalyzer />}
      {activePage === 'mlmodel' && <MLModelDashboard />}

      {activePage === 'cashflow' && <CashFlowCalendar />}
      {activePage === 'reports' && <ExportReports />}
    </Suspense>
  );
}

function ActivePageBreadcrumb() {
  const { activePage, appLanguage } = useApp();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#94a3b8' }}>
      <span style={{ fontWeight: 800, color: '#0d9488', fontSize: '0.82rem', fontFamily: 'Space Grotesk' }}>DhanSetu</span>
      <span>›</span>
      <span style={{ color: '#475569', fontWeight: 600 }}>{getPageLabel(appLanguage.code, activePage)}</span>
    </div>
  );
}

// ─── Main App Shell ───────────────────────────────────────────────────────────
// Bank-specific notifications generator
function generateBankNotifications(bank: BankConfig): Array<{ type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string }> {
  const notifications: Record<string, Array<{ type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string }>> = {
    sbi: [
      { type: 'success', title: 'NPA Recovery Milestone', message: 'SBI has recovered ₹2,400 Cr this quarter - highest in 3 years' },
      { type: 'info', title: 'Branch Expansion', message: 'New branches opened in Tier-3 cities to improve recovery reach' },
      { type: 'alert', title: 'High Risk Alert', message: 'SME portfolio requires attention - 15 accounts flagged' },
    ],
    hdfc: [
      { type: 'success', title: 'Digital Collections Up', message: 'WhatsApp-based recovery increased by 34%' },
      { type: 'info', title: 'AI Bot Deployment', message: 'New multilingual AI bot launched for customer engagement' },
    ],
    icici: [
      { type: 'warning', title: 'RBI Compliance Check', message: 'Quarterly compliance audit scheduled for next week' },
      { type: 'success', title: 'Campaign Success', message: 'Festive recovery campaign exceeded targets by 18%' },
    ],
    kotak: [
      { type: 'info', title: 'Product Launch', message: 'New settlement scheme launched for NPA accounts' },
      { type: 'success', title: 'Agent Performance', message: 'Recovery team achieved 92% of monthly target' },
    ],
    axis: [
      { type: 'alert', title: 'Critical Accounts', message: '5 accounts require immediate legal action' },
      { type: 'info', title: 'System Upgrade', message: 'DhanSetu platform updated to v2.4 with new features' },
    ],
    pnb: [
      { type: 'success', title: 'Regional Performance', message: 'North region recovery exceeds national average by 12%' },
      { type: 'warning', title: 'Staff Training', message: 'Mandatory AI tools training scheduled for all branches' },
    ],
    bob: [
      { type: 'info', title: 'International Recovery', message: 'NRI portfolio recovery improved by 28% this quarter' },
      { type: 'success', title: 'Partnership', message: 'New partnership with legal firms for faster recovery' },
    ],
    canara: [
      { type: 'success', title: 'Green Initiative', message: 'Paperless recovery process now at 85% adoption' },
      { type: 'info', title: 'Customer Satisfaction', message: 'Recovery process satisfaction score at 4.2/5' },
    ],
    union: [
      { type: 'warning', title: 'Portfolio Review', message: 'Q3 portfolio review meeting scheduled for tomorrow' },
      { type: 'success', title: 'Digital Payments', message: 'UPI-based EMI collection up by 45%' },
    ],
    indian: [
      { type: 'success', title: 'Indian Bank Recovery Portal Active', message: 'Tamil Nadu regional data loaded for Indian Bank' },
      { type: 'info', title: 'Branch Network', message: '5,800+ branches connected to recovery system' },
      { type: 'success', title: 'Merger Benefits', message: 'Allahabad Bank integration completed - unified recovery view' },
    ],
    all: [
      { type: 'success', title: 'Multi-Bank Dashboard Active', message: 'Aggregated view of all Indian banks recovery data' },
      { type: 'info', title: 'Unified Analytics', message: 'Cross-bank comparison and benchmarking enabled' },
      { type: 'success', title: 'Nationwide Recovery', message: 'Total NPA portfolio: ₹4.2L Cr across all banks' },
    ],
  };

  return notifications[bank.id as keyof typeof notifications] || notifications.indian;
}

// Real-time bank updates fetcher (simulating API calls)
async function fetchRealTimeBankUpdates(bankId: string): Promise<Array<{ type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string }>> {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Real-time updates based on actual banking news and market conditions
  const realTimeUpdates: Record<string, Array<{ type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string }>> = {
    sbi: [
      { type: 'success', title: 'RBI Dividend', message: 'SBI declares ₹5,400 Cr dividend to government for FY24 - highest ever' },
      { type: 'info', title: 'Digital Push', message: 'YONO app crosses 75 million downloads - digital transactions up 42%' },
      { type: 'alert', title: 'NPA Update', message: 'Gross NPA reduces to 2.24% - lowest in 8 years' },
    ],
    hdfc: [
      { type: 'success', title: 'Merger Complete', message: 'HDFC-HDFC Bank merger fully integrated - largest bank by market cap' },
      { type: 'info', title: 'Credit Growth', message: 'Retail loan book grows 19% YoY - highest in private sector' },
      { type: 'success', title: 'Profit Surge', message: 'Q3 net profit rises 33% to ₹16,373 Cr - beats estimates' },
    ],
    icici: [
      { type: 'warning', title: 'RBI Guidelines', message: 'New digital lending norms implemented - compliance updated' },
      { type: 'success', title: 'iMobile Success', message: 'iMobile Pay app users cross 25 million milestone' },
      { type: 'info', title: 'SME Focus', message: 'ICICI launches instant overdraft facility for MSMEs up to ₹50L' },
    ],
    kotak: [
      { type: 'success', title: 'Awards', message: 'Kotak wins Best Private Bank award at FinanceAsia 2024' },
      { type: 'info', title: '811 Growth', message: 'Kotak 811 digital savings accounts cross 1 crore milestone' },
    ],
    axis: [
      { type: 'success', title: 'CRED Partnership', message: 'Axis ties up with CRED for credit card payments - 15% cashback offer' },
      { type: 'alert', title: 'CASA Growth', message: 'Current account savings account ratio improves to 47%' },
    ],
    pnb: [
      { type: 'success', title: 'Fraud Recovery', message: 'PNB recovers ₹2,400 Cr from Nirav Modi case - 40% of claimed amount' },
      { type: 'info', title: 'Regional Push', message: 'Special loan mela in Punjab and Haryana - ₹5,000 Cr disbursed' },
    ],
    bob: [
      { type: 'success', title: 'International', message: 'Bank of Baroda opens 100th overseas branch in Dubai IFSC' },
      { type: 'info', title: 'Home Loans', message: 'Baroda Home Loan interest rates slashed to 8.45% - lowest in market' },
    ],
    canara: [
      { type: 'success', title: 'CSR Award', message: 'Canara Bank wins award for financial literacy programs in rural areas' },
      { type: 'info', title: 'Credit Cards', message: 'New co-branded credit card with Amazon - 5% cashback on purchases' },
    ],
    union: [
      { type: 'warning', title: 'System Maintenance', message: 'Scheduled maintenance on March 15, 2-4 AM - services may be limited' },
      { type: 'success', title: 'Agri Loans', message: 'Union Bank sanctions ₹12,000 Cr Kisan Credit Cards this quarter' },
    ],
    indian: [
      { type: 'success', title: 'Q4 Results', message: 'Indian Bank net profit jumps 52% to ₹2,950 Cr - highest quarterly profit' },
      { type: 'info', title: 'Branch Expansion', message: '100 new branches opened in FY24 - focus on unbanked areas' },
      { type: 'success', title: 'Digital Push', message: 'IndOASIS app crosses 1 crore downloads - 85% digital transactions' },
    ],
    all: [
      { type: 'info', title: 'RBI Policy', message: 'Repo rate unchanged at 6.5% - EMI burden stable for borrowers' },
      { type: 'success', title: 'PSB Profits', message: 'Public sector banks post record ₹1.4 lakh Cr profit in FY24' },
      { type: 'warning', title: 'Cyber Alert', message: 'RBI warns banks of new phishing attacks - enhanced security implemented' },
    ],
  };

  return realTimeUpdates[bankId] || realTimeUpdates.all;
}

// Notification Panel Component
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead, clearNotifications, selectedBank } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 8,
      width: 360, maxHeight: 480,
      background: 'white', borderRadius: 16,
      border: '1px solid #e2e8f0',
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
      zIndex: 200,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Notifications</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
            {selectedBank ? `${selectedBank.shortName} Updates` : 'System Updates'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={() => { notifications.forEach(n => !n.read && markNotificationRead(n.id)); }}
              style={{ fontSize: '0.7rem', color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Mark all read
            </button>
          )}
          <button onClick={clearNotifications}
            style={{ fontSize: '0.7rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔔</div>
            <div style={{ fontSize: '0.85rem' }}>No notifications yet</div>
            <div style={{ fontSize: '0.72rem', marginTop: 4 }}>Bank updates will appear here</div>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} onClick={() => markNotificationRead(n.id)}
              style={{
                padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
                background: n.read ? 'white' : '#f8fafc',
                cursor: 'pointer', transition: 'background 0.15s',
              }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                  background: n.type === 'success' ? '#16a34a' : n.type === 'warning' ? '#f59e0b' : n.type === 'alert' ? '#dc2626' : '#0d9488',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a', marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>
                    {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9488', flexShrink: 0 }} />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AppShell() {
  const { appLanguage, setAppLanguage, selectedBank, notifications, addNotification, userRole, selectedBorrower } = useApp();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const statusText = STATUS_TEXT[appLanguage.code] || STATUS_TEXT['en-IN'];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add bank-specific notifications when bank changes
  useEffect(() => {
    if (selectedBank) {
      // Add initial notifications
      const bankNotifications = generateBankNotifications(selectedBank);
      bankNotifications.forEach((n, i) => {
        setTimeout(() => addNotification(n), i * 500);
      });

      // Fetch real-time updates
      fetchRealTimeBankUpdates(selectedBank.id).then(updates => {
        updates.forEach((n, i) => {
          setTimeout(() => addNotification(n), (i + 3) * 800);
        });
      });
    }
  }, [selectedBank]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 252, minHeight: '100vh', overflowX: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 90,
          background: 'rgba(240, 244, 248, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <ActivePageBreadcrumb />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* System status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', animation: 'pulseGlow 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>System Online</span>
            </div>
            {/* Model badge */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 999, padding: '3px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#0d9488' }}>
              XGBoost + GPT-4 + Rasa
            </div>
            {/* Language switcher button */}
            <button
              onClick={() => setShowLangPicker(true)}
              title="Change language"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '5px 10px', cursor: 'pointer', fontSize: '0.72rem',
                fontWeight: 700, color: '#0f172a',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d9488'; (e.currentTarget as HTMLButtonElement).style.color = '#0d9488'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.color = '#0f172a'; }}
            >
              <span>{appLanguage.flag}</span>
              <span>{appLanguage.nativeName}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {/* Notification icon */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', position: 'relative' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#8b7355" strokeWidth="2" style={{ width: 12, height: 12 }}>
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: '#dc2626', border: '1.5px solid white' }} />
                )}
              </button>
              {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
            </div>
          </div>
        </div>
        <PageRouter />
      </main>

      {/* Customer 360 View panel */}
      {selectedBorrower && <Customer360 />}

      {/* Language picker overlay */}
      {showLangPicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }}>
          <LanguageSelector onSelect={(lang: AppLanguage) => {
            setAppLanguage(lang);
            setShowLangPicker(false);
          }} />
          {/* Close button */}
          <button
            onClick={() => setShowLangPicker(false)}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 9999,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(139, 90, 43, 0.08)', border: '1px solid rgba(139, 90, 43, 0.15)',
              color: '#3d2b1f', fontSize: '1.2rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Root: Loading → Language → Bank → UserDetails → Role → Login → App ────────────────────────────────────
export default function Home() {
  const [phase, setPhase] = useState<'loading' | 'language' | 'bank' | 'userdetails' | 'role' | 'login' | 'app'>('loading');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user' | null>(null);
  const { setAppLanguage, setUserRole, setSelectedBank, setUserDetails, userRole, selectedBank, userDetails } = useApp();

  const handleLoadingDone = useCallback(() => setPhase('language'), []);

  const handleLanguageSelect = useCallback((lang: AppLanguage) => {
    setAppLanguage(lang);
    setPhase('bank');
  }, [setAppLanguage]);

  const handleBankSelect = useCallback((bank: BankConfig) => {
    setSelectedBank(bank);
    setPhase('userdetails');
  }, [setSelectedBank]);

  const handleUserDetailsSubmit = useCallback((details: { name: string; phone: string }) => {
    setUserDetails(details);
    setPhase('role');
  }, [setUserDetails]);

  const handleRoleSelect = useCallback((role: 'admin' | 'user') => {
    setSelectedRole(role);
    setUserRole(role);
    setPhase('login');
  }, [setUserRole]);

  const handleLogin = useCallback(() => {
    setPhase('app');
  }, []);

  const handleBackToRole = useCallback(() => {
    setPhase('role');
  }, []);

  return (
    <>
      {phase === 'loading' && <LoadingScreen onDone={handleLoadingDone} />}
      {phase === 'language' && <LanguageSelector onSelect={handleLanguageSelect} />}
      {phase === 'bank' && <BankSelector onSelect={handleBankSelect} />}
      {phase === 'userdetails' && (
        <UserDetailsForm bank={selectedBank} onSubmit={handleUserDetailsSubmit} />
      )}
      {phase === 'role' && (
        <RoleSelector
          onSelect={handleRoleSelect}
          bankName={selectedBank?.shortName}
          bankAccent={selectedBank?.accent}
        />
      )}
      {phase === 'login' && (
        <BankLogin
          bank={selectedBank}
          role={selectedRole}
          userName={userDetails?.name || 'User'}
          onLogin={handleLogin}
          onBack={handleBackToRole}
        />
      )}
      {phase === 'app' && (
        userRole === 'user' ? <UserPortal /> : <AppShell />
      )}
    </>
  );
}
