// Synthetic loan data for hackathon demo

export interface Customer {
  id: string;
  name: string;
  phone: string;
  language: string;
  languageName: string;
  region: string;
  occupation: string;
  age: number;
}

export interface Loan {
  loanId: string;
  product: string;
  principal: number;
  emiAmount: number;
  tenorMonths: number;
  disbursalDate: string;
  interestRate: number;
  outstandingAmount: number;
  overdueAmount: number;
  currentDpd: number;
  maxDpd12m: number;
  bounceCount6m: number;
  avgBalance3m: number;
  creditScore: number;
  previousResponses: string[];
}

export interface RiskProfile {
  riskScore: number; // 0-100
  riskTier: 'Critical' | 'High' | 'Medium' | 'Low';
  defaultProbability30d: number;
  defaultProbability60d: number;
  defaultProbability90d: number;
  expectedRecovery: number; // %
  bestChannel: 'whatsapp' | 'sms' | 'call' | 'email';
  bestTime: string;
  upliftScore: number; // persuadability
  predictedDefaultDate: string | null;
}

export interface LoanRecord {
  customer: Customer;
  loan: Loan;
  risk: RiskProfile;
}

// Compute risk tier from score
function getRiskTier(score: number): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

// Simulate XGBoost-like scoring with non-linear factors
function computeRiskScore(dpd: number, bounces: number, creditScore: number, avgBalance: number, emi: number): number {
  // Non-linear DPD penalty (steep increase after 30 days)
  const dpdFactor = dpd < 30 ? (dpd * 0.8) : (24 + Math.pow(dpd - 30, 1.2) * 0.6);
  // Exponential bounce penalty
  const bounceFactor = Math.pow(bounces, 1.5) * 6;
  // High penalty for poor credit, slight reward for good credit
  const creditFactor = creditScore < 650 ? Math.pow((650 - creditScore) / 10, 1.5) : (750 - creditScore) / 15;
  // Liquidity penalty
  const balanceRatio = avgBalance / emi;
  const balanceFactor = balanceRatio < 0.5 ? 20 : balanceRatio < 1 ? 12 : balanceRatio < 2 ? 5 : -5;
  
  const raw = Math.min(dpdFactor, 45) + Math.min(bounceFactor, 30) + Math.min(Math.max(creditFactor, -5), 25) + balanceFactor;
  // Add some pseudo-randomness representing unstructured data factors (device ping, sms data)
  const mlVariance = (Math.random() * 10 - 3); 
  return Math.min(Math.max(Math.round(raw + mlVariance), 5), 98);
}

const regions = [
  { region: 'Maharashtra', lang: 'mr', langName: 'Marathi' },
  { region: 'Tamil Nadu', lang: 'ta', langName: 'Tamil' },
  { region: 'Uttar Pradesh', lang: 'hi', langName: 'Hindi' },
  { region: 'Karnataka', lang: 'kn', langName: 'Kannada' },
  { region: 'West Bengal', lang: 'bn', langName: 'Bengali' },
  { region: 'Telangana', lang: 'te', langName: 'Telugu' },
  { region: 'Gujarat', lang: 'gu', langName: 'Gujarati' },
  { region: 'Punjab', lang: 'pa', langName: 'Punjabi' },
  { region: 'Rajasthan', lang: 'hi', langName: 'Hindi' },
  { region: 'Kerala', lang: 'ml', langName: 'Malayalam' },
];

const occupations = ['salaried', 'self_employed', 'small_business', 'farmer', 'professional'];
const products = [
  'Personal Loan', 'Home Loan', 'Vehicle Loan', 'Business Loan', 'Agricultural Loan',
  'Kisan Credit Card (KCC)', 'Mudra Loan (Shishu)', 'Mudra Loan (Kishore)', 'MSME Term Loan', 'Education Loan'
];
const channels: Array<'whatsapp' | 'sms' | 'call' | 'email'> = ['whatsapp', 'sms', 'call', 'email'];
const previousResponseOptions = [
  ['sms_opened'],
  ['call_disconnected'],
  ['sms_opened', 'call_answered'],
  ['no_response'],
  ['email_opened', 'link_clicked'],
  ['call_disconnected', 'sms_ignored'],
];

const namePool = [
  'Rajesh Kumar', 'Priya Sharma', 'Anil Patel', 'Sunita Devi', 'Mohan Das',
  'Kavitha Reddy', 'Suresh Nair', 'Fatima Sheikh', 'Ramesh Yadav', 'Deepa Iyer',
  'Vinod Singh', 'Meera Krishnan', 'Arjun Mehta', 'Lakshmi Pillai', 'Sandeep Gupta',
  'Anita Joshi', 'Ravi Teja', 'Pooja Verma', 'Kiran Kumar', 'Sujatha Rao',
  'Harish Malhotra', 'Geetha Subramanian', 'Dinesh Choudhary', 'Rekha Bose', 'Vijay Kulkarni',
  'Nandini Hegde', 'Sunil Tiwari', 'Anjali Mishra', 'Prakash Naik', 'Uma Shankar',
  'Ranjit Kaur', 'Sowmya Murthy', 'Ashok Pandey', 'Bharati Deore', 'Ganesh Patil',
  'Lalitha Krishnamurthy', 'Manoj Sahu', 'Padma Venkatesh', 'Satish Rathore', 'Jyothi Bhat',
  'Devendra Rane', 'Champa Gurung', 'Nilesh Jadhav', 'Vidya Nair', 'Hemant Sawant',
  'Sarita Pandav', 'Dilip Kulkarni', 'Mamta Agarwal', 'Yogesh Jagtap', 'Seema Tripathi',
];

function generatePhone(): string {
  const prefixes = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `+91-${prefix}${number.slice(0, 3)}-${number.slice(3, 7)}`;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDisbursalDate(): string {
  const y = 2022 + Math.floor(Math.random() * 2);
  const m = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
  const d = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function predictedDefaultDate(dpd: number, score: number): string | null {
  if (score < 40) return null;
  const daysUntil = Math.max(0, 90 - dpd - Math.floor(score / 5));
  if (daysUntil <= 0) return 'Imminent';
  const date = new Date();
  date.setDate(date.getDate() + daysUntil);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function generateLoanData(count: number = 500): LoanRecord[] {
  const records: LoanRecord[] = [];

  for (let i = 0; i < count; i++) {
    const regionInfo = randomPick(regions);
    const occupation = randomPick(occupations);
    const product = randomPick(products);
    const principal = Math.round((100000 + Math.random() * 900000) / 1000) * 1000;
    const rate = 10 + Math.random() * 10;
    const tenor = [12, 24, 36, 48, 60][Math.floor(Math.random() * 5)];
    const emi = Math.round((principal * (rate / 1200) * Math.pow(1 + rate / 1200, tenor)) / (Math.pow(1 + rate / 1200, tenor) - 1));
    const dpd = Math.floor(Math.random() * 90);
    const bounces = Math.min(Math.floor(dpd / 15 + Math.random() * 2), 6);
    const creditScore = Math.floor(600 + Math.random() * 200);
    const avgBalance = Math.round(emi * (0.3 + Math.random() * 2));
    const riskScore = computeRiskScore(dpd, bounces, creditScore, avgBalance, emi);
    const tier = getRiskTier(riskScore);
    const outstanding = Math.round(principal * (0.3 + Math.random() * 0.7));
    const overdue = dpd > 0 ? Math.round(emi * (1 + Math.floor(dpd / 30) * 0.5)) : 0;

    const customer: Customer = {
      id: `CUST-${String(i + 1001).padStart(5, '0')}`,
      name: randomPick(namePool),
      phone: generatePhone(),
      language: regionInfo.lang,
      languageName: regionInfo.langName,
      region: regionInfo.region,
      occupation,
      age: 22 + Math.floor(Math.random() * 40),
    };

    const loan: Loan = {
      loanId: `LN-2024-${String(10000 + i).padStart(5, '0')}`,
      product,
      principal,
      emiAmount: emi,
      tenorMonths: tenor,
      disbursalDate: generateDisbursalDate(),
      interestRate: Math.round(rate * 10) / 10,
      outstandingAmount: outstanding,
      overdueAmount: overdue,
      currentDpd: dpd,
      maxDpd12m: dpd + Math.floor(Math.random() * 15),
      bounceCount6m: bounces,
      avgBalance3m: avgBalance,
      creditScore,
      previousResponses: randomPick(previousResponseOptions),
    };

    const risk: RiskProfile = {
      riskScore,
      riskTier: tier,
      defaultProbability30d: Math.min(riskScore * 0.6 + Math.random() * 5, 95),
      defaultProbability60d: Math.min(riskScore * 0.75 + Math.random() * 5, 95),
      defaultProbability90d: Math.min(riskScore * 0.9 + Math.random() * 5, 98),
      expectedRecovery: Math.max(20, 95 - riskScore * 0.7 + Math.random() * 10),
      bestChannel: randomPick(channels),
      bestTime: randomPick(['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM']),
      upliftScore: Math.round(20 + Math.random() * 70),
      predictedDefaultDate: predictedDefaultDate(dpd, riskScore),
    };

    records.push({ customer, loan, risk });
  }

  // Sort by risk score descending
  return records.sort((a, b) => b.risk.riskScore - a.risk.riskScore);
}

// Pre-generated message templates for different languages and tones
export const messageTemplates: Record<string, Record<string, string>> = {
  hi: {
    empathetic: "प्रिय {name} जी, आपका ₹{amount} का EMI भुगतान {dpd} दिनों से लंबित है। हम समझते हैं कि कभी-कभी कठिनाइयाँ आती हैं। कृपया इस लिंक पर भुगतान करें या HELP लिखकर reply करें।",
    urgent: "प्रिय {name}, आपका ₹{amount} का भुगतान {dpd} दिन से बकाया है। यह आपके क्रेडिट स्कोर को प्रभावित कर रहा है। तुरंत भुगतान करें: {link}",
    firm: "{name} जी, ₹{amount} की देय राशि अब {dpd} दिन से अधिक हो गई है। अंतिम नोटिस: 5 दिनों में भुगतान न करने पर कानूनी कार्रवाई हो सकती है।"
  },
  ta: {
    empathetic: "அன்புள்ள {name}, உங்கள் ₹{amount} EMI {dpd} நாட்களாக நிலுவையில் உள்ளது. நாங்கள் உங்களுக்கு உதவ விரும்புகிறோம். இந்த இணைப்பில் செலுத்துங்கள் அல்லது HELP என்று பதிலளியுங்கள்.",
    urgent: "{name}, ₹{amount} தொகை {dpd} நாட்களாக நிலுவையில் உள்ளது. உங்கள் கடன் மதிப்பீடு பாதிக்கப்படுகிறது. உடனடியாக செலுத்துங்கள்।",
    firm: "{name}, ₹{amount} தொகை {dpd} நாட்களாக செலுத்தப்படவில்லை. இது உங்கள் கடன் கணக்கை NPA ஆக மாற்றலாம். 5 நாட்களில் நடவடிக்கை எடுக்கவும்."
  },
  te: {
    empathetic: "ప్రియమైన {name}, మీ ₹{amount} EMI {dpd} రోజులుగా పెండింగ్‌లో ఉంది. మేము మీకు సహాయం చేయాలని కోరుతున్నాము. దయచేసి ఈ లింక్‌లో చెల్లించండి.",
    urgent: "{name}, మీ ₹{amount} బకాయి {dpd} రోజులైంది. మీ క్రెడిట్ స్కోర్ ప్రభావితమవుతోంది. వెంటనే చెల్లించండి।",
    firm: "{name}, ₹{amount} చెల్లింపు {dpd} రోజులుగా పెండింగ్‌లో ఉంది. 5 రోజుల్లో చెల్లించకపోతే చట్టపరమైన చర్య తీసుకోబడుతుంది."
  },
  mr: {
    empathetic: "प्रिय {name}, तुमचे ₹{amount} चे EMI {dpd} दिवसांपासून थकीत आहे. आम्हाला तुम्हाला मदत करायची आहे. कृपया या लिंकवर पेमेंट करा।",
    urgent: "{name}, तुमचे ₹{amount} थकबाकी {dpd} दिवस झाले. तुमचा क्रेडिट स्कोर प्रभावित होत आहे. त्वरित पेमेंट करा।",
    firm: "{name}, ₹{amount} ची थकबाकी {dpd} दिवसांपेक्षा जास्त झाली आहे. 5 दिवसांत पेमेंट न केल्यास कायदेशीर कारवाई होऊ शकते."
  },
  bn: {
    empathetic: "প্রিয় {name}, আপনার ₹{amount} EMI {dpd} দিন ধরে বকেয়া আছে। আমরা আপনাকে সাহায্য করতে চাই। অনুগ্রহ করে এই লিঙ্কে পেমেন্ট করুন।",
    urgent: "{name}, আপনার ₹{amount} বকেয়া {dpd} দিন হয়েছে। আপনার ক্রেডিট স্কোর প্রভাবিত হচ্ছে। এখনই পেমেন্ট করুন।",
    firm: "{name}, ₹{amount} বকেয়া {dpd} দিনেরও বেশি হয়েছে। ৫ দিনের মধ্যে পেমেন্ট না করলে আইনি ব্যবস্থা নেওয়া হবে।"
  },
  kn: {
    empathetic: "ಪ್ರಿಯ {name}, ನಿಮ್ಮ ₹{amount} EMI {dpd} ದಿನಗಳಿಂದ ಬಾಕಿ ಇದೆ. ನಾವು ನಿಮ್ಮಿಗೆ ಸಹಾಯ ಮಾಡಲು ಬಯಸುತ್ತೇವೆ. ದಯವಿಟ್ಟು ಈ ಲಿಂಕ್‌ನಲ್ಲಿ ಪಾವತಿಸಿ.",
    urgent: "{name}, ನಿಮ್ಮ ₹{amount} ಬಾಕಿ {dpd} ದಿನಗಳಾಗಿವೆ. ನಿಮ್ಮ ಕ್ರೆಡಿಟ್ ಸ್ಕೋರ್ ಪ್ರಭಾವಿತವಾಗುತ್ತಿದೆ. ತಕ್ಷಣ ಪಾವತಿಸಿ.",
    firm: "{name}, ₹{amount} ಬಾಕಿ {dpd} ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ. 5 ದಿನಗಳಲ್ಲಿ ಪಾವತಿ ಮಾಡದಿದ್ದರೆ ಕಾನೂನು ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಲಾಗುತ್ತದೆ."
  },
  gu: {
    empathetic: "પ્રિય {name}, તમારું ₹{amount} EMI {dpd} દિવસથી બાકી છે. અમે તમને મદદ કરવા માંગીએ છીએ. કૃપા કરીને આ લિંક પર ચૂકવો।",
    urgent: "{name}, તમારું ₹{amount} બાકી {dpd} દિવસ થઈ ગયા. તમારો ક્રેડિટ સ્કોર અસર પામી રહ્યો છે. તાત્કાલિક ચૂકવો.",
    firm: "{name}, ₹{amount} ની બાકી {dpd} દિવસ થઈ ગઈ. 5 દિવસમાં ચૂકવણી ન થઈ તો કાનૂની કાર્યવાહી થઈ શકે."
  },
  pa: {
    empathetic: "ਪਿਆਰੇ {name} ਜੀ, ਤੁਹਾਡਾ ₹{amount} EMI {dpd} ਦਿਨਾਂ ਤੋਂ ਬਕਾਇਆ ਹੈ। ਅਸੀਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਇਸ ਲਿੰਕ 'ਤੇ ਭੁਗਤਾਨ ਕਰੋ।",
    urgent: "{name}, ਤੁਹਾਡਾ ₹{amount} ਬਕਾਇਆ {dpd} ਦਿਨ ਹੋ ਗਿਆ। ਤੁਹਾਡਾ ਕ੍ਰੈਡਿਟ ਸਕੋਰ ਪ੍ਰਭਾਵਿਤ ਹੋ ਰਿਹਾ ਹੈ। ਤੁਰੰਤ ਭੁਗਤਾਨ ਕਰੋ।",
    firm: "{name}, ₹{amount} ਦਾ ਬਕਾਇਆ {dpd} ਦਿਨਾਂ ਤੋਂ ਵੱਧ ਹੋ ਗਿਆ। 5 ਦਿਨਾਂ ਵਿੱਚ ਭੁਗਤਾਨ ਨਾ ਕਰਨ 'ਤੇ ਕਾਨੂੰਨੀ ਕਾਰਵਾਈ ਹੋ ਸਕਦੀ ਹੈ।"
  },
  ml: {
    empathetic: "പ്രിയ {name}, നിങ്ങളുടെ ₹{amount} EMI {dpd} ദിവസമായി കുടിശ്ശികയാണ്. ഞങ്ങൾ നിങ്ങളെ സഹായിക്കാൻ ആഗ്രഹിക്കുന്നു. ദയവായി ഈ ലിങ്കിൽ അടക്കൂ.",
    urgent: "{name}, നിങ്ങളുടെ ₹{amount} കുടിശ്ശിക {dpd} ദിവസമായി. നിങ്ങളുടെ ക്രെഡിറ്റ് സ്കോർ ബാധിക്കപ്പെടുന്നു. ഉടൻ അടക്കൂ.",
    firm: "{name}, ₹{amount} കുടിശ്ശിക {dpd} ദിവസത്തിലധികം ആയി. 5 ദിവസത്തിനുള്ളിൽ അടക്കില്ലെങ്കിൽ നിയമ നടപടി സ്വീകരിക്കും."
  },
  en: {
    empathetic: "Dear {name}, your EMI of ₹{amount} is {dpd} days overdue. We understand financial difficulties happen. Please pay via this link or reply HELP to explore options.",
    urgent: "Dear {name}, your ₹{amount} EMI is {dpd} days overdue, affecting your credit score. Please clear dues immediately or call us to discuss a repayment plan.",
    firm: "Dear {name}, outstanding of ₹{amount} is overdue by {dpd} days. Final notice: Legal proceedings may commence if payment is not received within 5 business days."
  }
};

export function generateMessage(
  customerName: string,
  amount: number,
  dpd: number,
  language: string,
  tone: 'empathetic' | 'urgent' | 'firm'
): string {
  const langTemplates = messageTemplates[language] || messageTemplates.en;
  const template = langTemplates[tone];
  return template
    .replace('{name}', customerName)
    .replace('{amount}', amount.toLocaleString('en-IN'))
    .replace('{dpd}', dpd.toString())
    .replace('{link}', 'pay.bank.ai/r/xxxxxx');
}

// KPI calculation
export function computeKPIs(data: LoanRecord[]) {
  const total = data.length;
  const criticalCount = data.filter(d => d.risk.riskTier === 'Critical').length;
  const highCount = data.filter(d => d.risk.riskTier === 'High').length;
  const mediumCount = data.filter(d => d.risk.riskTier === 'Medium').length;
  const lowCount = data.filter(d => d.risk.riskTier === 'Low').length;
  const totalOutstanding = data.reduce((s, d) => s + d.loan.outstandingAmount, 0);
  const totalOverdue = data.reduce((s, d) => s + d.loan.overdueAmount, 0);
  const avgRecovery = data.reduce((s, d) => s + d.risk.expectedRecovery, 0) / total;
  const avgRiskScore = data.reduce((s, d) => s + d.risk.riskScore, 0) / total;

  return {
    total,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    totalOutstanding,
    totalOverdue,
    avgRecovery: Math.round(avgRecovery * 10) / 10,
    avgRiskScore: Math.round(avgRiskScore),
    projectedRecovery: Math.round(totalOverdue * (avgRecovery / 100)),
  };
}

// Chart data helpers
export function getRiskDistributionData(data: LoanRecord[]) {
  const kpis = computeKPIs(data);
  return [
    { name: 'Critical', value: kpis.criticalCount, color: '#dc2626' },
    { name: 'High', value: kpis.highCount, color: '#ea580c' },
    { name: 'Medium', value: kpis.mediumCount, color: '#d97706' },
    { name: 'Low', value: kpis.lowCount, color: '#16a34a' },
  ];
}

export function getRecoveryTrendData() {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  return months.map((month, i) => ({
    month,
    baseline: 20 + i * 0.5 + Math.random() * 2,
    withAI: 30 + i * 2.5 + Math.random() * 2,
    contactRate: 45 + i * 3 + Math.random() * 3,
  }));
}

export function getChannelPerformanceData() {
  return [
    { channel: 'WhatsApp', contactRate: 68, responseRate: 42, conversionRate: 28, costPerContact: 2, color: '#16a34a' },
    { channel: 'SMS', contactRate: 45, responseRate: 18, conversionRate: 12, costPerContact: 1, color: '#0d9488' },
    { channel: 'Call', contactRate: 35, responseRate: 30, conversionRate: 22, costPerContact: 45, color: '#d97706' },
    { channel: 'Email', contactRate: 22, responseRate: 8, conversionRate: 5, costPerContact: 0.5, color: '#ea580c' },
  ];
}
