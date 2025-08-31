import { NextRequest, NextResponse } from 'next/server';
import { translateText, translateArticle, SUPPORTED_LANGUAGES } from '@/utils/translation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, targetLanguage, data } = body;

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'text': {
        const { texts } = data;
        
        if (!texts || !Array.isArray(texts)) {
          return NextResponse.json(
            { error: 'Texts array is required for text translation' },
            { status: 400 }
          );
        }

        const result = await translateText(texts, targetLanguage);
        
        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 500 }
          );
        }

        return NextResponse.json({
          translations: result.translations,
          creditsUsed: result.creditsUsed,
          success: true,
        });
      }

      case 'article': {
        const { articleContent } = data;
        
        if (!articleContent) {
          return NextResponse.json(
            { error: 'Article content is required for article translation' },
            { status: 400 }
          );
        }

        // Validate article structure
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

        const result = await translateArticle(articleContent, targetLanguage);
        
        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 500 }
          );
        }

        return NextResponse.json({
          translatedContent: result.translatedContent,
          creditsUsed: result.creditsUsed,
          success: true,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid translation type. Use "text" or "article"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return supported languages
    return NextResponse.json({
      supportedLanguages: SUPPORTED_LANGUAGES,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
