# Voice Cloning Setup for DhanSetu - Complete Guide

This guide explains how to set up real celebrity voice cloning for the **Gandhigiri Mode** feature using ElevenLabs API.

## 🎯 What You Get

With this setup, DhanSetu can:
- Generate recovery messages in **exact celebrity voices** (Amitabh Bachchan, Rajinikanth, etc.)
- Support **23 Indian languages** with authentic regional accents
- Use **AI-cloned voices** that sound virtually indistinguishable from real celebrities
- Automatically fall back to browser speech synthesis if the API is unavailable

---

## 🚀 Quick Start

### Step 1: Get ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io) and create an account
2. Navigate to **Profile → API Keys**
3. Generate a new API key (starts with `sk_`)
4. Copy the key

### Step 2: Configure Environment

Create a `.env.local` file in the `recover-ai/` directory:

```bash
cd recover-ai
cp .env.local.example .env.local
```

Edit `.env.local` and add your API key:

```env
ELEVENLABS_API_KEY=sk_your_actual_api_key_here
```

### Step 3: Install Dependencies (if needed)

```bash
npm install
```

No additional packages required - we use the native `fetch` API!

### Step 4: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the **Gandhigiri Mode** section
3. Select a celebrity voice
4. Click **"Listen"** or **"Play Voice"** to hear the cloned voice

---

## 🎭 Available Celebrity Voices

### Hindi Voices
- **Amitabh Bachchan** - Authoritative, fatherly, trustworthy (Trust Score: 94%)
- **Shah Rukh Khan** - Charming, romantic, persuasive (Trust Score: 92%)
- **Aamir Khan** - Intellectual, sincere, educational (Trust Score: 90%)
- **Kisan Advisor** - Rural, friendly, down-to-earth for farmers (Trust Score: 95%)

### Tamil Voices
- **Rajinikanth** - Humble, commanding, inspiring (Trust Score: 96%)
- **Vijay** - Youthful, energetic, motivational (Trust Score: 93%)

### Telugu Voices
- **Nagarjuna** - Elegant, respectful, sophisticated (Trust Score: 91%)
- **Mahesh Babu** - Charismatic, modern, trustworthy (Trust Score: 92%)

### Other Languages
- **Bengali**: Amitabh Bachchan
- **Marathi**: Nana Patekar
- **Gujarati**: Amitabh Bachchan
- **Kannada**: Puneeth Rajkumar, Yash
- **Malayalam**: Mohanlal, Mammootty
- **Punjabi**: Diljit Dosanjh

### English (Indian Accent)
- **Amitabh Bachchan** - Iconic, distinguished, fatherly
- **Irrfan Khan** - Deep, thoughtful, artistic
- **Priyanka Chopra** - Confident, modern, empowering

---

## 🔧 How It Works

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Gandhigiri    │────▶│  API Route      │────▶│  ElevenLabs     │
│   Component     │     │  /api/voice/    │     │  Voice API      │
│                 │◀────│  clone          │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│ Browser Speech  │                           │ AI Voice Clone  │
│ (Fallback)      │                           │ (Primary)       │
└─────────────────┘                           └─────────────────┘
```

### API Flow

1. **User clicks "Listen"** in Gandhigiri Mode
2. Frontend sends text + voice ID to `/api/voice/clone`
3. API routes to ElevenLabs with appropriate voice settings
4. ElevenLabs generates audio and returns it
5. Frontend plays the audio using HTML5 Audio API
6. If API fails → automatically falls back to browser speech synthesis

---

## 🛠️ Creating Custom Celebrity Voices

To create your own celebrity voice clones:

### Requirements
1. **1-5 minutes** of clear audio of the celebrity
2. **No background noise** or music
3. **Single speaker** (the celebrity)
4. **WAV or MP3** format

### Steps

1. **Go to ElevenLabs Dashboard**:
   - Visit [ElevenLabs Voice Lab](https://elevenlabs.io/app/voice-lab)
   - Click "Add a new voice"

2. **Upload Samples**:
   - Select "Clone a voice"
   - Upload 1-5 minutes of clear audio
   - Name it (e.g., "Amitabh_Bachchan_Hindi")
   - Wait for processing (few minutes)

3. **Get Voice ID**:
   - Click on your created voice
   - Copy the **Voice ID** (long alphanumeric string)

4. **Update Configuration**:
   - Open `recover-ai/lib/voices.ts`
   - Update the `elevenLabsVoiceId` for the celebrity:
   
   ```typescript
   {
     id: 'amitabh-hindi',
     name: 'Amitabh Bachchan',
     // ... other properties
     elevenLabsVoiceId: 'your_actual_elevenlabs_voice_id_here',
   }
   ```

5. **Test**:
   - Refresh the app
   - Select the updated voice
   - Click play!

---

## 📊 Voice Settings

The API uses these optimized settings for Indian languages:

```typescript
{
  model_id: 'eleven_multilingual_v2',  // Best for Indian languages
  voice_settings: {
    stability: 0.5,      // Balanced consistency vs. variety
    similarity_boost: 0.75, // High similarity to original voice
    style: 0.3,          // Slight style variation
    use_speaker_boost: true, // Enhanced clarity
  }
}
```

---

## 💰 Pricing

ElevenLabs offers:

| Plan | Characters/Month | Cost |
|------|------------------|------|
| Free | 10,000 | $0 |
| Starter | 30,000 | $5 |
| Creator | 100,000 | $22 |
| Pro | 500,000 | $99 |

**Cost Calculation**: Each character in your message counts. A Hindi message of 200 characters costs 200 credits.

---

## 🔒 Security

- **API Key**: Stored in `.env.local`, never exposed to frontend
- **Voice Cloning**: Requires explicit consent for real person voices
- **Compliance**: Follow RBI guidelines on digital communications

---

## 🐛 Troubleshooting

### "Voice API not available, using browser fallback"
**Cause**: ElevenLabs API key not configured or invalid
**Fix**: Add valid `ELEVENLABS_API_KEY` to `.env.local`

### Audio not playing
**Cause**: Browser autoplay policies or CORS
**Fix**: 
- Ensure user interacted with page first
- Check browser console for errors

### Voice sounds robotic
**Cause**: Using generic voices instead of cloned ones
**Fix**: 
- Create actual voice clones in ElevenLabs dashboard
- Update `elevenLabsVoiceId` in voices.ts

### High latency
**Cause**: First API call takes time to generate
**Fix**: 
- Pre-generate common messages
- Implement caching

---

## 🎨 Customization

### Add New Celebrity

1. Record/obtain audio samples
2. Clone in ElevenLabs dashboard
3. Add to `lib/voices.ts`:

```typescript
{
  id: 'celebrity-id',
  name: 'Celebrity Name',
  displayName: 'Name in Local Language',
  language: 'hi-IN',
  region: 'Region',
  style: 'Voice Style Description',
  avatar: '👤',
  sampleText: 'Namaste, main...',
  description: 'Why this voice works for recovery',
  gender: 'male',
  trustScore: 92,
  elevenLabsVoiceId: 'your_elevenlabs_voice_id',
}
```

### Adjust Voice Settings

Modify in `app/api/voice/clone/route.ts`:

```typescript
voice_settings: {
  stability: 0.7,      // More consistent
  similarity_boost: 0.9, // More like original
  style: 0.5,          // More expressive
}
```

---

## 📚 References

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [Voice Cloning Guide](https://elevenlabs.io/docs/voicelab)
- [API Reference](https://elevenlabs.io/docs/api-reference)

---

## ✅ Checklist

Before going live:

- [ ] ElevenLabs API key configured
- [ ] Celebrity voice clones created
- [ ] Voice IDs updated in `lib/voices.ts`
- [ ] Tested all language voices
- [ ] Fallback to browser speech working
- [ ] Privacy compliance verified
- [ ] Cost estimates calculated

---

## 🆘 Support

For issues:
1. Check browser console for errors
2. Verify API key is valid
3. Test with sample text first
4. Check ElevenLabs dashboard for usage

**Happy voice cloning! 🎙️✨**
