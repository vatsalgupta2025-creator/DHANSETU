# Voice Cloning Setup Guide for DhanSetu

This guide explains how to add real voice cloning capabilities to the Gandhigiri Mode feature.

## Overview

The current implementation uses browser-based `SpeechSynthesis` API which provides basic text-to-speech. For real celebrity/regional voice cloning, you'll need to integrate with a voice cloning service.

## Recommended Voice Cloning Services

### 1. ElevenLabs (Recommended)
- **Website**: https://elevenlabs.io
- **Best for**: High-quality voice cloning, multiple languages
- **Pricing**: Free tier available (10,000 characters/month)
- **Indian Languages Support**: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam

### 2. Microsoft Azure Speech Services
- **Website**: https://azure.microsoft.com/en-us/services/cognitive-services/speech-service/
- **Best for**: Enterprise, scalable solutions
- **Pricing**: Pay-per-use
- **Indian Languages**: Extensive support

### 3. Google Cloud Text-to-Speech
- **Website**: https://cloud.google.com/text-to-speech
- **Best for**: WaveNet voices, neural voices
- **Indian Languages**: Hindi, Bengali, Kannada, Malayalam, Tamil, Telugu

### 4. Murf.ai
- **Website**: https://murf.ai
- **Best for**: Indian accents, professional voices
- **Pricing**: Subscription-based

---

## ElevenLabs Integration Steps

### Step 1: Sign Up and Get API Key

1. Go to https://elevenlabs.io and create an account
2. Navigate to your Profile → API Keys
3. Generate a new API key
4. Copy the key (starts with `sk_`)

### Step 2: Install Required Packages

```bash
npm install elevenlabs
# OR
npm install @ elevenlabs/sdk
```

### Step 3: Create Voice Cloning API Route

Create a new file: `app/api/voice/clone/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs for different celebrities/personalities
const VOICE_IDS: Record<string, string> = {
  // You need to create these voices in ElevenLabs dashboard
  amitabh: 'your_amitabh_voice_id_here',
  rajinikanth: 'your_rajinikanth_voice_id_here',
  mohanlal: 'your_mohanlal_voice_id_here',
  // Add more voices...
};

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, language } = await req.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Text and voiceId are required' },
        { status: 400 }
      );
    }

    const actualVoiceId = VOICE_IDS[voiceId] || voiceId;

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${actualVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Supports Indian languages
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Voice cloning error:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice' },
      { status: 500 }
    );
  }
}
```

### Step 4: Add Environment Variable

Create or update `.env.local`:

```env
ELEVENLABS_API_KEY=your_api_key_here
```

### Step 5: Update GandhigiriMode Component

Replace the browser-based speech synthesis with the API call:

```typescript
const playVoiceSample = async (text: string, voiceId: string) => {
  try {
    setIsLoading(true);
    
    const response = await fetch('/api/voice/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text || selectedVoice.sampleText,
        voiceId: voiceId,
        language: lang,
      }),
    });

    if (!response.ok) throw new Error('Voice generation failed');

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      setIsLoading(false);
    };
  } catch (error) {
    console.error('Voice playback error:', error);
    // Fallback to browser speech synthesis
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi-IN' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
    setIsLoading(false);
  }
};
```

---

## Creating Custom Voices in ElevenLabs

### Option 1: Voice Cloning from Samples

1. **Prepare Audio Samples**:
   - Need 1-5 minutes of clear audio
   - No background noise
   - Single speaker
   - WAV or MP3 format

2. **Upload to ElevenLabs**:
   - Go to "Voices" → "Add a new voice"
   - Select "Clone a voice"
   - Upload your audio samples
   - Name the voice (e.g., "Amitabh_Bachchan_India")
   - Wait for processing (few minutes)

3. **Get Voice ID**:
   - Click on your created voice
   - Copy the Voice ID
   - Add to `VOICE_IDS` mapping

### Option 2: Using Professional Voice Actors

1. Record professional voice actor speaking:
   - Greeting messages
   - Debt recovery scripts
   - Regional language variations

2. Upload to ElevenLabs and clone

3. Test and fine-tune voice settings

---

## Regional Voice Configuration

### Hindi Voices
```typescript
const HINDI_VOICES = {
  amitabh: {
    id: 'elevenlabs_voice_id',
    name: 'Amitabh Bachchan',
    style: 'Authoritative, trustworthy',
    sample: 'Namaste, main Amitabh Bachchan bol raha hoon...',
  },
  farmer: {
    id: 'elevenlabs_voice_id',
    name: 'Kisan Advisor',
    style: 'Rural, friendly',
    sample: 'Kisan bhaiyon, aapka loan...',
  },
};
```

### Tamil Voices
```typescript
const TAMIL_VOICES = {
  rajinikanth: {
    id: 'elevenlabs_voice_id',
    name: 'Rajinikanth',
    style: 'Humble, commanding',
    sample: 'Vanakkam, naan Rajinikanth...',
  },
};
```

### Telugu Voices
```typescript
const TELUGU_VOICES = {
  nagarjuna: {
    id: 'elevenlabs_voice_id',
    name: 'Nagarjuna',
    style: 'Elegant, respectful',
    sample: 'Namaste, nenu Nagarjuna...',
  },
};
```

---

## Cost Estimation (ElevenLabs)

| Plan | Characters/Month | Cost | Approx. Messages |
|------|-----------------|------|------------------|
| Free | 10,000 | $0 | ~200 messages |
| Starter | 30,000 | $5 | ~600 messages |
| Creator | 100,000 | $22 | ~2,000 messages |
| Pro | 500,000 | $99 | ~10,000 messages |

**Note**: 1 message ≈ 50 characters on average

---

## Alternative: Using Pre-built Indian Voices

If voice cloning is not feasible, use pre-built neural TTS:

### Google Cloud Indian Voices
```typescript
const GOOGLE_VOICES = {
  'hi-IN': ['hi-IN-Neural2-A', 'hi-IN-Neural2-B', 'hi-IN-Neural2-C'],
  'ta-IN': ['ta-IN-Standard-A', 'ta-IN-Standard-B'],
  'te-IN': ['te-IN-Standard-A', 'te-IN-Standard-B'],
  'bn-IN': ['bn-IN-Standard-A', 'bn-IN-Standard-B'],
  // ... more languages
};
```

### Azure Indian Voices
```typescript
const AZURE_VOICES = {
  'hi-IN': ['hi-IN-MadhurNeural', 'hi-IN-SwaraNeural'],
  'ta-IN': ['ta-IN-ValluvarNeural', 'ta-IN-PallaviNeural'],
  'te-IN': ['te-IN-MohanNeural', 'te-IN-ShrutiNeural'],
  // ... more languages
};
```

---

## Testing Voice Quality

1. **A/B Testing**: Test different voices with sample borrowers
2. **Response Rate Tracking**: Measure which voices get better responses
3. **Trust Score Survey**: Ask borrowers which voice they trust more
4. **Regional Preference**: Test if local voices perform better

---

## Legal Considerations

⚠️ **Important**:
- Get permission before cloning celebrity voices
- Consider using parody/fair use for public figures
- Use generic voices for production
- Disclose that voice is AI-generated
- Follow RBI guidelines on communication

---

## Quick Start Checklist

- [ ] Sign up for ElevenLabs account
- [ ] Get API key
- [ ] Install elevenlabs package
- [ ] Create API route
- [ ] Add environment variable
- [ ] Record/upload voice samples
- [ ] Test voice generation
- [ ] Add to GandhigiriMode component
- [ ] Test in all 12 languages
- [ ] Monitor API usage and costs

---

## Support

For issues with voice cloning:
- ElevenLabs Docs: https://docs.elevenlabs.io
- ElevenLabs Discord: https://discord.gg/elevenlabs
- Email: support@elevenlabs.io
