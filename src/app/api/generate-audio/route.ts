import { NextRequest, NextResponse } from 'next/server';
import { generateArticleAudio, generateMultilingualArticleAudio } from '@/utils/murfTTS';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      articleContent, 
      languages, 
      voiceOptions = {},
      mode = 'single' // 'single' or 'multilingual'
    } = body;

    // Validate article content
    if (!articleContent) {
      return NextResponse.json(
        { error: 'Article content is required' },
        { status: 400 }
      );
    }

    const requiredFields = ['title', 'introduction', 'sections', 'conclusion'];
    for (const field of requiredFields) {
      if (!articleContent[field]) {
        return NextResponse.json(
          { error: `Article ${field} is required` },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(articleContent.sections)) {
      return NextResponse.json(
        { error: 'Article sections must be an array' },
        { status: 400 }
      );
    }

    if (mode === 'multilingual') {
      // Generate audio in multiple languages
      if (!languages || !Array.isArray(languages) || languages.length === 0) {
        return NextResponse.json(
          { error: 'Languages array is required for multilingual mode' },
          { status: 400 }
        );
      }

      console.log(`Generating multilingual audio for ${languages.length} languages`);

      const result = await generateMultilingualArticleAudio(
        articleContent,
        languages,
        voiceOptions
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        audioResults: result.audioResults,
        totalCreditsUsed: result.totalCreditsUsed,
        success: true,
      });

    } else {
      // Generate audio in single language (with optional translation)
      const { targetLanguage, translateFirst = false } = voiceOptions;

      console.log('Generating single language audio...');
      if (translateFirst && targetLanguage) {
        console.log(`Will translate to ${targetLanguage} before generating audio`);
      }

      const options = {
        ...voiceOptions,
        targetLanguage,
        translateFirst,
      };

      const result = await generateArticleAudio(articleContent, options);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        audioUrl: result.audioUrl,
        audioLengthInSeconds: result.audioLengthInSeconds,
        translationUsed: result.translationUsed,
        creditsUsed: result.creditsUsed,
        success: true,
      });
    }

  } catch (error) {
    console.error('Audio generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
