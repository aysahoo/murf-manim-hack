import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredManimCode, validateAndFixManimCode } from '@/utils/structuredManimGenerator';
import {convertEscapedNewlines} from '@/utils/formatManimCode';
export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Use structured generation only
    const manimCode = await generateStructuredManimCode(topic);
    const validatedCode = validateAndFixManimCode(manimCode);
    const multilineCode = convertEscapedNewlines(validatedCode);

    return NextResponse.json({
      topic,
      manimCode: multilineCode,
      generationMethod: 'structured'
    });

  } catch (error) {
    console.error('Error generating Manim code:', error);
    return NextResponse.json(
      { error: 'Failed to generate Manim code' },
      { status: 500 }
    );
  }
}
