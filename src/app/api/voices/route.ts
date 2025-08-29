import { NextRequest, NextResponse } from 'next/server';
import { getMurfVoices } from '@/utils/murfTTS';

interface MurfVoice {
  voiceId: string;
  name: string;
  language: string;
  accent: string;
  gender: string;
  age: string;
  description: string;
}

export async function GET(_request: NextRequest) {
  try {
    const voices = await getMurfVoices();
    
    return NextResponse.json({
      success: true,
      voices: voices.map((voice: MurfVoice) => ({
        id: voice.voiceId,
        name: voice.name,
        language: voice.language,
        accent: voice.accent,
        gender: voice.gender,
        age: voice.age,
        description: voice.description
      }))
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch voices',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
