import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.MURF_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'MURF_API_KEY not configured' },
        { status: 500 }
      );
    }

    console.log('Fetching voices from Murf API...');

    const response = await fetch('https://api.murf.ai/v1/speech/voices', {
      method: 'GET',
      headers: {
        'api-key': apiKey,
      },
    });

    console.log('Voices API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Voices API Error:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch voices: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched voices:', data);

    return NextResponse.json({
      success: true,
      voiceCount: data.voices?.length || 0,
      voices: data.voices || [],
      rawResponse: data,
    });

  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
