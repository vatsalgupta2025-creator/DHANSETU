# DhanSetu - AI Debt Recovery Platform

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Next.js_16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/AI-XGBoost-blue?style=for-the-badge" alt="XGBoost">
  <img src="https://img.shields.io/badge/Languages-23-orange?style=for-the-badge" alt="Languages">
  <img src="https://img.shields.io/badge/Compliance-RBI-green?style=for-the-badge" alt="RBI Compliant">
</p>

## 📋 Project Overview

**DhanSetu** is an AI-powered debt recovery platform designed specifically for Indian banks and financial institutions. It leverages advanced machine learning, natural language processing, and multi-channel communication to maximize recovery rates while ensuring full regulatory compliance with Reserve Bank of India (RBI) guidelines.

### The Problem

Indian banks face significant challenges in debt recovery:

1. **Rising NPAs (Non-Performing Assets)** - India's banking sector has struggled with mounting bad loans
2. **Manual Processes** - Traditional recovery methods are labor-intensive and inefficient
3. **Language Barriers** - India has 23+ languages; generic messages have low engagement
4. **Regulatory Complexity** - RBI guidelines are stringent; non-compliance leads to penalties
5. **Limited Personalization** - One-size-fits-all approaches yield poor recovery rates
6. **Agent Productivity** - Human agents can't scale to handle thousands of defaulters

### The Solution

DhanSetu uses AI to automate and optimize the entire debt recovery workflow:
- **Intelligent Risk Scoring** - XGBoost ML models predict default probability
- **Multi-Language Outreach** - Messages in 23 Indian languages + dialects
- **Voice AI** - TTS/STT for conversational recovery calls
- **Compliance Guard** - Real-time RBI guideline monitoring
- **Campaign Optimization** - AI suggests best channels, timing, and messaging
- **ROI Tracking** - Measure recovery performance with detailed analytics

---

## 🎯 Key Features

### 1. Command Center (Dashboard)
- Real-time KPI tracking (Total Portfolio, Recovery Rate, At-Risk Amount)
- Borrower ranking by risk and recoverability
- AI-powered recommendations
- Trend analysis with month-over-month comparisons

### 2. AI Risk Engine
- **XGBoost-powered** risk scoring model
- 30/60/90-day default probability predictions
- Risk tier classification (Critical, High, Medium, Low)
- Best channel recommendations per borrower

### 3. Insights Hub
- **Uplift vs Risk Score Matrix** - Visual segment analysis
- Fraud intent detection
- Channel performance heatmaps
- Optimal contact scheduling
- Early warning signals

### 4. Message Studio
- **23 Indian Languages** supported:
  - Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Oriya, Assamese, Nepali, Sanskrit, Urdu, Konkani, Sindhi, Bodo, Dogri, Santali, Kashmiri, Manipuri, Khasi, Mizo
- **Tone Customization**: Formal, Friendly, Empathetic, Urgent
- **Channel Selection**: WhatsApp, SMS, Voice Call, Email
- Preview with live rendering

### 5. AI Negotiation Bot
- Conversational AI powered by GPT-4
- **Text-to-Speech (TTS)** - Voice output in multiple languages
- **Speech-to-Text (STT)** - Voice input recognition
- Real-time negotiation with payment plan discussions
- Maintains conversation context across interactions

### 6. Campaign Builder
- Visual step-by-step campaign creation
- Segment targeting (by risk, geography, product, DPD)
- Multi-channel delivery (WhatsApp, SMS, Call, Email)
- Scheduling with compliance-aware timing
- Live progress tracking

### 7. Recovery Toolkit
- **Promise-to-Pay (PTP)** management
- Credit score simulation with improvement projections
- Gamification with DhanPoints rewards
- Milestone tracking and achievement badges
- Settlement calculators

### 8. Analytics & ROI
- Incremental recovery vs baseline comparison
- NPA reduction projections (12-month)
- Agent performance dashboards
- AI vs Human productivity analysis
- A/B testing for campaign variants

### 9. Compliance Center
- **RBI Compliance** monitoring
- DLT (Distributed Ledger Technology) compliance
- Gender & regional fairness audits
- Communication logs with compliance scoring
- Auto-escalation for flagged accounts

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS |
| **AI/ML** | XGBoost, GPT-4, Rasa NLU |
| **Voice** | Web Speech API (TTS/STT) |
| **State** | React Context API |
| **Styling** | CSS Variables, Inline Styles |
| **Build** | Turbopack |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
cd recover-ai

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📊 Sample Data

The platform includes 500+ sample borrower records with:
- Customer demographics (name, ID, language, region)
- Loan details (product, amount, DPD, overdue amount)
- Risk scores (XGBoost-computed)
- Best communication channels
- Payment history

---

## 🎨 Design System

### Color Palette
- **Primary**: Teal (`#0d9488`)
- **Secondary**: Green (`#16a34a`)
- **Accent**: Gold (`#f5c842`)
- **Background**: Warm Cream (`#fdfbf7`)
- **Text**: Brown (`#3d2e1f`)

### Typography
- **Headings**: Space Grotesk
- **Body**: Inter / Outfit

---

## 📱 Multi-Language Support

DhanSetu supports **23 Indian languages** out of the box:

| Code | Language | Native Name |
|------|----------|-------------|
| en-IN | English | English |
| hi-IN | Hindi | हिंदी |
| bn-IN | Bengali | বাংলা |
| te-IN | Telugu | తెలుగు |
| mr-IN | Marathi | मराठी |
| ta-IN | Tamil | தமிழ் |
| gu-IN | Gujarati | ગુજરાતી |
| kn-IN | Kannada | ಕನ್ನಡ |
| ml-IN | Malayalam | മലയാളം |
| pa-IN | Punjabi | ਪੰਜਾਬੀ |
| or-IN | Odia | ଓଡ଼ିଆ |
| ur-IN | Urdu | اردو |
| as-IN | Assamese | অসমীয়া |
| sd-IN | Sindhi | سنڌي |
| kok | Konkani | कोंकणी |
| sa-IN | Sanskrit | संस्कृतम् |
| sat | Santali | ᱥᱟᱱᱛᱟᱲᱤ |
| ksh | Kashmiri | کٲشُر |
| mni | Manipuri | মৈতৈলোন |
| dl | Dograri | डोगरी |
| bxr | Bodo | बड़ो |
| khg | Khasi | Khasi |
| lus | Mizo | Mizo |

---

## 📄 Compliance

### RBI Guidelines Implemented
- **Fair Practices Code** compliance in all communications
- **Privacy Protection** - No unauthorized data sharing
- **Gender Fairness** - Equal treatment across demographics
- **Regional Equity** - No geographic discrimination
- **DLT Compliance** - Distributed Ledger Technology integration
- **Audit Logging** - Complete communication trail

---

## 📈 Performance Metrics

The platform tracks:
- Recovery Rate improvement
- Cost per recovery
- Agent productivity
- Channel effectiveness
- Customer satisfaction scores
- Compliance violations

---

## 🤝 License

This project is proprietary software for demonstration purposes.

---

<p align="center">
  <strong>DhanSetu</strong> - AI-Powered Debt Recovery for Indian Banks<br>
  Powered by GPT-4 · XGBoost · Rasa NLU
</p>
