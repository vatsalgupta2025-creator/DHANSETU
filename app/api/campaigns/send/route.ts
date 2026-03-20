import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    const { campaignName, message, channels, toNumbers } = await request.json();

    // Initialize Twilio client using environment variables.
    // If keys are not present, we will simulate the live send to avoid crashing the app.
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken) {
      console.warn("Twilio credentials not found in env. Simulating live execution.");
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({
        success: true,
        message: 'Campaign simulated successfully (Twilio credentials missing).',
        data: { campaignName, channels, toNumbers, simulaton: true }
      });
    }

    const client = twilio(accountSid, authToken);

    const results = [];

    // Send messages using Twilio API
    for (const to of toNumbers) {
      if (channels.includes('sms')) {
        const result = await client.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: to
        });
        results.push({ channel: 'sms', to, sid: result.sid });
      }
      
      if (channels.includes('whatsapp')) {
        const result = await client.messages.create({
          body: message,
          from: `${twilioWhatsappNumber}`, // Usually formatted as 'whatsapp:+14155238886'
          to: `whatsapp:${to}`
        });
        results.push({ channel: 'whatsapp', to, sid: result.sid });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign executed successfully via Twilio.',
      results
    });

  } catch (error: any) {
    console.error("Campaign Send API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
