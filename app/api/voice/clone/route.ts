import { NextRequest, NextResponse } from 'next/server';
import { ALL_VOICES, getVoiceById, getDefaultVoice } from '@/lib/voices';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default ElevenLabs pre-made voice IDs for fallback
// These are REAL ElevenLabs voice IDs that work out of the box
const FALLBACK_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam - deep male voice

export async function POST(req: NextRequest) {
    try {
        const { text, voiceId, language = 'en-IN', useFallback = true } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // If no API key is configured, return error with fallback option
        if (!ELEVENLABS_API_KEY) {
            if (useFallback) {
                return NextResponse.json(
                    {
                        error: 'ElevenLabs API key not configured',
                        useBrowserFallback: true,
                        message: 'Please add ELEVENLABS_API_KEY to your .env.local file'
                    },
                    { status: 503 }
                );
            }
            return NextResponse.json(
                { error: 'ElevenLabs API key not configured' },
                { status: 500 }
            );
        }

        // Resolve the actual ElevenLabs voice ID
        let actualVoiceId: string = FALLBACK_VOICE_ID;

        if (voiceId) {
            // First check our voice config for an ElevenLabs voice ID
            const voiceConfig = getVoiceById(voiceId);
            if (voiceConfig?.elevenLabsVoiceId) {
                actualVoiceId = voiceConfig.elevenLabsVoiceId;
            } else {
                // Maybe it's a raw ElevenLabs voice ID directly
                actualVoiceId = voiceId;
            }
        } else {
            // Use default voice for the language
            const defaultVoice = getDefaultVoice(language);
            if (defaultVoice?.elevenLabsVoiceId) {
                actualVoiceId = defaultVoice.elevenLabsVoiceId;
            }
        }

        console.log(`[Voice Clone] Using voice: ${actualVoiceId} for language: ${language}`);

        // Call ElevenLabs Text-to-Speech API
        const response = await fetch(
            `${ELEVENLABS_API_URL}/text-to-speech/${actualVoiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2', // Best for Hindi & Indian languages
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.8,
                        style: 0.35,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('ElevenLabs API error:', response.status, errorData);

            if (useFallback) {
                return NextResponse.json(
                    {
                        error: 'Voice generation failed',
                        details: errorData,
                        useBrowserFallback: true
                    },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: 'Voice generation failed', details: errorData },
                { status: 500 }
            );
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Voice cloning error:', error);
        return NextResponse.json(
            { error: 'Failed to generate voice', useBrowserFallback: true },
            { status: 500 }
        );
    }
}

// GET endpoint to list available voices  
export async function GET() {
    const voices = ALL_VOICES.map(voice => ({
        id: voice.id,
        name: voice.name,
        displayName: voice.displayName,
        language: voice.language,
        region: voice.region,
        style: voice.style,
        avatar: voice.avatar,
        gender: voice.gender,
        trustScore: voice.trustScore,
        hasElevenLabsVoice: !!voice.elevenLabsVoiceId && !voice.elevenLabsVoiceId.includes('_voice_id'),
    }));

    return NextResponse.json({ voices, apiConfigured: !!ELEVENLABS_API_KEY });
}
