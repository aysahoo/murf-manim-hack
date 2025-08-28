import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredManimCode, validateAndFixManimCode } from '@/utils/structuredManimGenerator';
import {convertEscapedNewlines} from '@/utils/formatManimCode';
import { executeCodeAndListFiles } from '@/utils/sandbox';
import path from 'path';

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
    //generated Manim Code
    console.log(multilineCode);
    // Execute the generated Manim code in the sandbox and list files
    console.log('Executing Manim code in sandbox...');
    const result = await executeCodeAndListFiles(multilineCode);

    // Generate publicly accessible video URLs for the extracted videos
    let videoUrls: string[] = [];
    if (result.videoFiles && result.videoFiles.length > 0) {
      videoUrls = result.videoFiles.map(videoFile => {
        const fileName = path.basename(videoFile.path);
        return `/videos/${fileName}`;
      });
    }

    return NextResponse.json({
      topic,
      manimCode: multilineCode,
      generationMethod: 'structured',
      execution: result.execution,
      sandboxFiles: result.files,
      videoFiles: result.videoFiles || [],
      videoUrls,
      success: result.success
    });

  } catch (error) {
    console.error('Error generating Manim code:', error);
    return NextResponse.json(
      { error: 'Failed to generate Manim code' },
      { status: 500 }
    );
  }
}
