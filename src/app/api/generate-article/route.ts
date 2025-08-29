import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateArticleAudio } from '@/utils/murfTTS';

// Initialize the OpenRouter provider
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

interface ArticleSection {
  title: string;
  content: string;
}

interface ParsedArticle {
  title: string;
  introduction: string;
  sections: ArticleSection[];
  conclusion: string;
}

interface GenerateArticleResponse {
  topic: string;
  title: string;
  introduction: string;
  sections: ArticleSection[];
  conclusion: string;
  wordCount: number;
  audioUrl?: string;
  audioLengthInSeconds?: number;
  audioGenerated: boolean;
  success: boolean;
}

// Request deduplication - prevent multiple simultaneous requests for same topic
const activeRequests = new Map<string, Promise<GenerateArticleResponse>>();

export async function POST(request: NextRequest) {
  try {
    const { 
      topic, 
      length = 'medium', 
      style = 'educational',
      includeAudio = false,
      voiceId = 'en-US-natalie',
      audioRate = 0,
      audioPitch = 0
    } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Validate length parameter
    const validLengths = ['short', 'medium', 'long'];
    if (!validLengths.includes(length)) {
      return NextResponse.json(
        { error: 'Length must be one of: short, medium, long' },
        { status: 400 }
      );
    }

    // Validate style parameter
    const validStyles = ['educational', 'academic', 'casual', 'technical'];
    if (!validStyles.includes(style)) {
      return NextResponse.json(
        { error: 'Style must be one of: educational, academic, casual, technical' },
        { status: 400 }
      );
    }

    // Check if there's already an active request for this topic
    const requestKey = `${topic}_${length}_${style}_${includeAudio}`;
    if (activeRequests.has(requestKey)) {
      console.log(`Waiting for active request: ${requestKey}`);
      const result = await activeRequests.get(requestKey);
      return NextResponse.json(result);
    }

    // Create and store the promise for this request
    const requestPromise = generateArticleContent(topic, length, style, includeAudio, {
      voiceId,
      rate: audioRate,
      pitch: audioPitch
    });
    activeRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return NextResponse.json(result);
    } finally {
      // Clean up the active request
      activeRequests.delete(requestKey);
    }

  } catch (error) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    );
  }
}

async function generateArticleContent(
  topic: string, 
  length: string, 
  style: string,
  includeAudio: boolean = false,
  audioOptions: {
    voiceId?: string;
    rate?: number;
    pitch?: number;
  } = {}
): Promise<GenerateArticleResponse> {
  
  // Define word count targets based on length
  const wordCountTargets: Record<string, string> = {
    short: '800-1200',
    medium: '1500-2500', 
    long: '3000-5000'
  };

  // Define style guidelines
  const styleGuidelines: Record<string, string> = {
    educational: 'Write in a clear, accessible manner suitable for students. Use examples and analogies to explain complex concepts.',
    academic: 'Use formal academic language with proper citations and scholarly tone. Include technical terminology where appropriate.',
    casual: 'Write in a conversational, friendly tone that\'s easy to read. Use everyday language and relatable examples.',
    technical: 'Focus on technical details and specifications. Use precise terminology and include implementation details where relevant.'
  };

  const systemPrompt = `You are an expert writer tasked with creating a comprehensive article about "${topic}".

REQUIREMENTS:
- Length: ${wordCountTargets[length]} words
- Style: ${styleGuidelines[style]}
- Structure: Introduction, 4-6 main sections, and conclusion
- Format: Return ONLY a valid JSON object with the specified structure

The article should be informative, well-researched, and engaging. Cover the topic thoroughly from multiple angles including:
- Basic concepts and definitions
- Historical context or background
- Key principles or mechanisms
- Applications or examples
- Current developments or future prospects
- Practical implications

IMPORTANT JSON FORMATTING RULES:
1. Return ONLY the JSON object, no additional text or markdown
2. Ensure all quotes inside content are properly escaped as \"
3. Use \\n for line breaks within content
4. Do not use any special characters that could break JSON parsing
5. Keep content flowing naturally without unnecessary escaping

Return the response as a JSON object with this exact structure:
{
  "title": "An engaging title for the article",
  "introduction": "A compelling introduction that hooks the reader and outlines what will be covered",
  "sections": [
    {
      "title": "Section Title",
      "content": "Detailed content for this section"
    }
  ],
  "conclusion": "A strong conclusion that summarizes key points and provides final thoughts"
}

Make sure each section is substantial and the total content meets the word count requirement. Use clear, logical flow between sections.`;

  try {
    // Generate the article content
    const { text: articleJson } = await generateText({
      model: openrouter("openai/gpt-4o"),
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Generate a comprehensive article about: ${topic}. Return ONLY valid JSON without any markdown formatting or additional text.`
        }
      ],
      temperature: 0.3 // Lower temperature for more consistent JSON formatting
    });

    // Parse the JSON response
    let parsedArticle;
    try {
      console.log('Parsing AI response...');
      parsedArticle = extractArticleFromText(articleJson);
      console.log('Successfully parsed article JSON');
    } catch (parseError) {
      console.error('Failed to parse article JSON:', parseError);
      console.error('Raw response length:', articleJson.length);
      console.error('Raw response preview:', articleJson.substring(0, 500) + '...');
      throw new Error('Failed to parse generated article content');
    }

    // Validate the structure
    if (!parsedArticle.title || !parsedArticle.introduction || !parsedArticle.sections || !parsedArticle.conclusion) {
      throw new Error('Generated article missing required fields');
    }

    // Calculate word count
    const wordCount = calculateWordCount(parsedArticle);

    const result: GenerateArticleResponse = {
      topic,
      title: parsedArticle.title,
      introduction: parsedArticle.introduction,
      sections: parsedArticle.sections,
      conclusion: parsedArticle.conclusion,
      wordCount,
      audioGenerated: false,
      success: true
    };

    // Generate audio if requested
    if (includeAudio) {
      try {
        console.log('Generating audio for article...');
        const audioResult = await generateArticleAudio(
          {
            title: parsedArticle.title,
            introduction: parsedArticle.introduction,
            sections: parsedArticle.sections,
            conclusion: parsedArticle.conclusion
          },
          {
            voiceId: audioOptions.voiceId,
            rate: audioOptions.rate,
            pitch: audioOptions.pitch,
            format: 'MP3',
            includeTitle: true,
            pauseBetweenSections: 2
          }
        );

        if (audioResult.success) {
          result.audioUrl = audioResult.audioUrl;
          result.audioLengthInSeconds = audioResult.audioLengthInSeconds;
          result.audioGenerated = true;
          console.log(`Audio generated successfully: ${audioResult.audioLengthInSeconds}s`);
        } else {
          console.warn('Audio generation failed:', audioResult.error);
          // Don't fail the entire request if audio generation fails
        }
      } catch (audioError) {
        console.error('Error generating audio:', audioError);
        // Don't fail the entire request if audio generation fails
      }
    }

    return result;

  } catch (error) {
    console.error('Error in generateArticleContent:', error);
    throw error;
  }
}

function cleanJsonString(jsonString: string): string {
  // Remove markdown code blocks
  let cleaned = jsonString.replace(/```json\s*|\s*```/g, '').trim();
  
  // Fix common JSON issues
  cleaned = cleaned
    // Remove any trailing commas before closing braces/brackets
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix escaped newlines and quotes in content
    .replace(/\\n/g, '\\n')
    .replace(/\\"/g, '\\"');
  
  return cleaned;
}

function extractArticleFromText(text: string): ParsedArticle {
  // Try to extract JSON object from the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }
  
  let jsonString = jsonMatch[0];
  
  // Clean the JSON string
  jsonString = cleanJsonString(jsonString);
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    // If parsing still fails, try manual extraction
    console.log('JSON parsing failed, attempting manual extraction...');
    console.error('Parse error details:', error);
    
    const titleMatch = text.match(/"title"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    const introMatch = text.match(/"introduction"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    const conclusionMatch = text.match(/"conclusion"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    
    // Extract sections
    const sectionsMatch = text.match(/"sections"\s*:\s*\[([\s\S]*?)\]/);
    const sections = [];
    
    if (sectionsMatch) {
      // Extract individual sections
      const sectionPattern = /\{\s*"title"\s*:\s*"([^"]*(?:\\.[^"]*)*)"\s*,\s*"content"\s*:\s*"([^"]*(?:\\.[^"]*)*)"\s*\}/g;
      let sectionMatch;
      while ((sectionMatch = sectionPattern.exec(sectionsMatch[1])) !== null) {
        sections.push({
          title: sectionMatch[1].replace(/\\"/g, '"'),
          content: sectionMatch[2].replace(/\\"/g, '"').replace(/\\n/g, '\n')
        });
      }
    }
    
    if (titleMatch && introMatch && conclusionMatch && sections.length > 0) {
      return {
        title: titleMatch[1].replace(/\\"/g, '"'),
        introduction: introMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
        sections: sections,
        conclusion: conclusionMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
      };
    } else {
      throw new Error('Could not extract article content manually');
    }
  }
}

function calculateWordCount(article: ParsedArticle): number {
  let totalWords = 0;
  
  // Count words in title
  totalWords += countWords(article.title);
  
  // Count words in introduction
  totalWords += countWords(article.introduction);
  
  // Count words in all sections
  if (article.sections && Array.isArray(article.sections)) {
    article.sections.forEach((section: ArticleSection) => {
      totalWords += countWords(section.title);
      totalWords += countWords(section.content);
    });
  }
  
  // Count words in conclusion
  totalWords += countWords(article.conclusion);
  
  return totalWords;
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// GET method to retrieve article (optional - for caching if needed)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');

  if (!topic) {
    return NextResponse.json(
      { error: 'Topic query parameter is required' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: 'Use POST method to generate articles',
    example: {
      method: 'POST',
      body: {
        topic: 'Your topic here',
        length: 'medium', // optional: short, medium, long
        style: 'educational', // optional: educational, academic, casual, technical
        includeAudio: false, // optional: true to generate audio
        voiceId: 'en-US-natalie', // optional: voice for audio generation
        audioRate: 0, // optional: speech rate (-50 to 50)
        audioPitch: 0 // optional: speech pitch (-50 to 50)
      }
    }
  });
}
