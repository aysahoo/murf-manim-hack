import { translateArticle } from './translation';

interface MurfTTSRequest {
  text: string;
  voiceId: string;
  format?: 'MP3' | 'WAV' | 'FLAC' | 'ALAW' | 'ULAW' | 'PCM' | 'OGG';
  modelVersion?: 'GEN1' | 'GEN2';
  channelType?: 'STEREO' | 'MONO';
  encodeAsBase64?: boolean;
  sampleRate?: number;
  rate?: number; // Speed: -50 to 50
  pitch?: number; // Pitch: -50 to 50
  variation?: number; // 0 to 5
  style?: string;
  multiNativeLocale?: string;
  audioDuration?: number;
  wordDurationsAsOriginalText?: boolean;
  pronunciationDictionary?: Record<string, {
    type: 'IPA' | 'SAY_AS';
    pronunciation: string;
  }>;
}

interface MurfTTSResponse {
  audioFile: string;
  audioLengthInSeconds: number;
  consumedCharacterCount: number;
  remainingCharacterCount: number;
  wordDurations: Array<{
    endMs: number;
    startMs: number;
    word: string;
    pitchScaleMaximum: number;
    pitchScaleMinimum: number;
    sourceWordIndex: number;
  }>;
  encodedAudio?: string;
  warning?: string;
}

interface ArticleAudioOptions {
  voiceId?: string;
  format?: 'MP3' | 'WAV';
  rate?: number;
  pitch?: number;
  includeTitle?: boolean;
  pauseBetweenSections?: number; // seconds
  targetLanguage?: string; // Language code for translation (e.g., 'es-ES')
  translateFirst?: boolean; // Whether to translate content before generating audio
}

interface MurfVoice {
  voiceId: string;
  name: string;
  language: string;
  accent: string;
  gender: string;
  age: string;
  description: string;
}

// Default voice mapping for supported languages
// Using known working voice IDs (starting with en-US-natalie as it's confirmed working)
const DEFAULT_VOICE_MAPPING: { [key: string]: string } = {
  'en-US': 'en-US-natalie',
  'en-UK': 'en-US-natalie', // Fallback to working voice for now
  'en-IN': 'en-US-natalie', // Fallback to working voice for now
  'en-AU': 'en-US-natalie', // Fallback to working voice for now
  'en-SCOTT': 'en-US-natalie', // Fallback to working voice for now
  'es-MX': 'en-US-natalie', // Fallback to working voice for now
  'es-ES': 'en-US-natalie', // Fallback to working voice for now
  'fr-FR': 'en-US-natalie', // Fallback to working voice for now
  'de-DE': 'en-US-natalie', // Fallback to working voice for now
  'it-IT': 'en-US-natalie', // Fallback to working voice for now
  'nl-NL': 'en-US-natalie', // Fallback to working voice for now
  'pt-BR': 'en-US-natalie', // Fallback to working voice for now
  'zh-CN': 'en-US-natalie', // Fallback to working voice for now
  'ja-JP': 'en-US-natalie', // Fallback to working voice for now
  'ko-KR': 'en-US-natalie', // Fallback to working voice for now
  'hi-IN': 'en-US-natalie', // Fallback to working voice for now
  'ta-IN': 'en-US-natalie', // Fallback to working voice for now
  'bn-IN': 'en-US-natalie', // Fallback to working voice for now
  'hr-HR': 'en-US-natalie', // Fallback to working voice for now
  'sk-SK': 'en-US-natalie', // Fallback to working voice for now
  'pl-PL': 'en-US-natalie', // Fallback to working voice for now
  'el-GR': 'en-US-natalie', // Fallback to working voice for now
};

/**
 * Get the best voice ID for a given language
 * @param targetLanguage Language code (e.g., 'es-ES')
 * @param availableVoices Optional list of available voices to choose from
 * @returns Voice ID to use
 */
/**
 * Get the best voice ID for a given language
 * @param targetLanguage Language code (e.g., 'es-ES')
 * @param availableVoices Optional list of available voices to choose from
 * @returns Voice ID to use
 */
function getBestVoiceForLanguage(targetLanguage: string, availableVoices?: MurfVoice[]): string {
  console.log(`getBestVoiceForLanguage called with: ${targetLanguage}`);
  
  // If we have available voices, try to find a match
  if (availableVoices && availableVoices.length > 0) {
    // Try exact language match first
    const exactMatch = availableVoices.find(voice => 
      voice.voiceId.toLowerCase().includes(targetLanguage.toLowerCase())
    );
    if (exactMatch) {
      console.log(`Found exact match in available voices: ${exactMatch.voiceId}`);
      return exactMatch.voiceId;
    }

    // Try language prefix match (e.g., 'es' for 'es-ES')
    const langPrefix = targetLanguage.split('-')[0];
    const prefixMatch = availableVoices.find(voice => 
      voice.voiceId.toLowerCase().startsWith(langPrefix.toLowerCase() + '-')
    );
    if (prefixMatch) {
      console.log(`Found prefix match: ${prefixMatch.voiceId}`);
      return prefixMatch.voiceId;
    }

    // Try language in voice language field
    const languageMatch = availableVoices.find(voice => 
      voice.language && voice.language.toLowerCase().includes(langPrefix.toLowerCase())
    );
    if (languageMatch) {
      console.log(`Found language match: ${languageMatch.voiceId}`);
      return languageMatch.voiceId;
    }
  }

  // First try exact mapping from our defaults
  if (DEFAULT_VOICE_MAPPING[targetLanguage]) {
    console.log(`Found exact mapping: ${targetLanguage} -> ${DEFAULT_VOICE_MAPPING[targetLanguage]}`);
    return DEFAULT_VOICE_MAPPING[targetLanguage];
  }

  console.log(`No exact mapping found for ${targetLanguage}`);

  // Fallback to English
  console.log(`Using fallback voice: en-US-natalie`);
  return 'en-US-natalie';
}

export async function generateArticleAudio(
  articleContent: {
    title: string;
    introduction: string;
    sections: Array<{ title: string; content: string }>;
    conclusion: string;
  },
  options: ArticleAudioOptions = {}
): Promise<{
  audioUrl: string;
  audioLengthInSeconds: number;
  success: boolean;
  error?: string;
  translationUsed?: boolean;
  creditsUsed?: number;
}> {
  try {
    const {
      rate = 0,
      pitch = 0,
      includeTitle = true,
      pauseBetweenSections = 2,
      targetLanguage,
      translateFirst = false,
      voiceId = getBestVoiceForLanguage(targetLanguage || 'en-US')
    } = options;

    console.log(`generateArticleAudio - targetLanguage: ${targetLanguage}, voiceId: ${voiceId}`);
    console.log(`translateFirst: ${translateFirst}`);

    let processedContent = articleContent;
    let translationCreditsUsed = 0;
    let translationUsed = false;

    // Translate content if requested
    if (translateFirst && targetLanguage) {
      console.log(`Translating content to ${targetLanguage} before generating audio...`);
      
      const translationResult = await translateArticle(articleContent, targetLanguage);
      
      if (!translationResult.success) {
        return {
          audioUrl: '',
          audioLengthInSeconds: 0,
          success: false,
          error: `Translation failed: ${translationResult.error}`,
        };
      }

      if (translationResult.translatedContent) {
        processedContent = translationResult.translatedContent;
        translationCreditsUsed = translationResult.creditsUsed;
        translationUsed = true;
        console.log(`Translation completed using ${translationCreditsUsed} credits`);
      }
    }

    // Construct the full text for TTS
    let fullText = '';
    
    if (includeTitle) {
      fullText += `${cleanTextForTTS(processedContent.title)}. [pause 3s] `;
    }
    
    fullText += `${cleanTextForTTS(processedContent.introduction)} [pause ${pauseBetweenSections}s] `;
    
    processedContent.sections.forEach((section, index) => {
      fullText += `${cleanTextForTTS(section.title)}. [pause 1s] ${cleanTextForTTS(section.content)}`;
      if (index < processedContent.sections.length - 1) {
        fullText += ` [pause ${pauseBetweenSections}s] `;
      }
    });
    
    fullText += ` [pause ${pauseBetweenSections}s] ${cleanTextForTTS(processedContent.conclusion)}`;

    console.log('Full text length:', fullText.length, 'characters');

    // Murf API has a 3000 character limit, so we need to split if necessary
    const maxLength = 2800; // Leave some buffer
    
    if (fullText.length <= maxLength) {
      // Text is short enough, generate single audio
      console.log('Text fits in single request, generating audio...');
      
      const murfRequest: MurfTTSRequest = {
        text: fullText,
        voiceId
      };

      // Only add optional parameters if they're not default values
      if (rate !== 0) murfRequest.rate = rate;
      if (pitch !== 0) murfRequest.pitch = pitch;

      const audioResponse = await generateMurfTTS(murfRequest);

      return {
        audioUrl: audioResponse.audioFile,
        audioLengthInSeconds: audioResponse.audioLengthInSeconds,
        success: true,
        translationUsed,
        creditsUsed: translationCreditsUsed
      };
    } else {
      // Text is too long, we need to split it
      console.log('Text is too long, splitting into chunks...');
      
      // For now, let's create a summary version instead of splitting
      // In a production environment, you might want to split and combine audio
      const summaryText = await createSummaryForTTS(articleContent, maxLength);
      
      console.log('Created summary text:', summaryText.length, 'characters');
      
      const murfRequest: MurfTTSRequest = {
        text: summaryText,
        voiceId
      };

      if (rate !== 0) murfRequest.rate = rate;
      if (pitch !== 0) murfRequest.pitch = pitch;

      const audioResponse = await generateMurfTTS(murfRequest);

      return {
        audioUrl: audioResponse.audioFile,
        audioLengthInSeconds: audioResponse.audioLengthInSeconds,
        success: true,
        translationUsed,
        creditsUsed: translationCreditsUsed
      };
    }

  } catch (error) {
    console.error('Error generating article audio:', error);
    return {
      audioUrl: '',
      audioLengthInSeconds: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate audio'
    };
  }
}

// Create a summary version of the article that fits within character limits
async function createSummaryForTTS(
  articleContent: {
    title: string;
    introduction: string;
    sections: Array<{ title: string; content: string }>;
    conclusion: string;
  },
  maxLength: number
): Promise<string> {
  // Strategy: Include title, brief intro, section titles with short content, and conclusion
  let summaryText = '';
  
  // Add title
  summaryText += `${cleanTextForTTS(articleContent.title)}. [pause 3s] `;
  
  // Add a shortened introduction (first 200 chars)
  const shortIntro = truncateText(cleanTextForTTS(articleContent.introduction), 200);
  summaryText += `${shortIntro} [pause 2s] `;
  
  // Add section titles and brief content
  articleContent.sections.forEach((section, index) => {
    const sectionTitle = cleanTextForTTS(section.title);
    summaryText += `${sectionTitle}. [pause 1s] `;
    
    // Add first sentence or first 150 characters of content
    const shortContent = truncateToFirstSentence(cleanTextForTTS(section.content), 150);
    summaryText += `${shortContent}`;
    
    if (index < articleContent.sections.length - 1) {
      summaryText += ` [pause 2s] `;
    }
  });
  
  // Add conclusion (shortened if necessary)
  const shortConclusion = truncateText(cleanTextForTTS(articleContent.conclusion), 300);
  summaryText += ` [pause 2s] ${shortConclusion}`;
  
  // If still too long, truncate further
  if (summaryText.length > maxLength) {
    summaryText = summaryText.substring(0, maxLength - 100) + '... [pause 1s] Thank you for listening.';
  }
  
  return summaryText;
}

// Helper function to truncate text to first sentence or max length
function truncateToFirstSentence(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  // Find the first sentence end
  const sentenceEnd = text.search(/[.!?]\s/);
  if (sentenceEnd > 0 && sentenceEnd < maxLength) {
    return text.substring(0, sentenceEnd + 1);
  }
  
  // If no sentence break found or it's too long, just truncate
  return text.substring(0, maxLength - 3) + '...';
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Function to clean text for TTS
function cleanTextForTTS(text: string): string {
  if (!text) return '';
  
  return text
    // Remove or replace problematic characters
    .replace(/[""]/g, '"')  // Replace smart quotes
    .replace(/['']/g, "'")  // Replace smart apostrophes
    .replace(/…/g, '...')   // Replace ellipsis
    .replace(/—/g, '-')     // Replace em dash
    .replace(/–/g, '-')     // Replace en dash
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove newlines and tabs
    .replace(/[\n\r\t]/g, ' ')
    .trim();
}

export async function generateMurfTTS(request: MurfTTSRequest): Promise<MurfTTSResponse> {
  const apiKey = process.env.MURF_API_KEY;
  
  if (!apiKey) {
    throw new Error('MURF_API_KEY environment variable is not set');
  }

  // Log the request for debugging
  console.log('Murf API Request:', {
    text: request.text.substring(0, 100) + '...',
    voiceId: request.voiceId,
    format: request.format,
    modelVersion: request.modelVersion,
    textLength: request.text.length
  });

  console.log('Full request body:', JSON.stringify(request, null, 2));

  const response = await fetch('https://api.murf.ai/v1/speech/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(request),
  });

  console.log('Murf API Response Status:', response.status);

  if (!response.ok) {
    let errorMessage = `Murf API error: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      console.error('Murf API Error Details:', errorData);
      
      // Extract more specific error information
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.details) {
        errorMessage = errorData.details;
      }
    } catch (parseError) {
      console.error('Could not parse error response:', parseError);
      // Try to get response text instead
      try {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        errorMessage += ` - ${errorText}`;
      } catch {
        // If we can't get any error details, use the default message
      }
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('Murf API Success - Audio Length:', data.audioLengthInSeconds, 'seconds');
  return data;
}

// Function to get available voices from Murf API
export async function getMurfVoices(): Promise<MurfVoice[]> {
  const apiKey = process.env.MURF_API_KEY;
  
  if (!apiKey) {
    throw new Error('MURF_API_KEY environment variable is not set');
  }

  console.log('Fetching Murf voices...');

  const response = await fetch('https://api.murf.ai/v1/speech/voices', {
    method: 'GET',
    headers: {
      'api-key': apiKey,
    },
  });

  console.log('Voices API Response Status:', response.status);

  if (!response.ok) {
    let errorMessage = `Failed to fetch voices: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      console.error('Voices API Error:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        console.error('Voices API Error Text:', errorText);
        errorMessage += ` - ${errorText}`;
      } catch {
        // Use default error message
      }
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('Successfully fetched', data.voices?.length || 0, 'voices');
  return data.voices || [];
}

// Function to split long text into chunks for TTS (respecting Murf's 3000 char limit)
export function splitTextForTTS(text: string, maxLength: number = 2800): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    const sentenceWithPeriod = trimmedSentence + '.';
    
    // Check if adding this sentence would exceed the limit
    if ((currentChunk + ' ' + sentenceWithPeriod).length <= maxLength) {
      currentChunk += (currentChunk ? ' ' : '') + sentenceWithPeriod;
    } else {
      // If current chunk has content, save it
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // If this single sentence is too long, truncate it
      if (sentenceWithPeriod.length > maxLength) {
        currentChunk = sentenceWithPeriod.substring(0, maxLength - 10) + '...';
      } else {
        currentChunk = sentenceWithPeriod;
      }
    }
  }

  // Add the last chunk if it has content
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : ['Unable to process text.'];
}

/**
 * Generate audio for an article in multiple languages
 * @param articleContent The article content to generate audio for
 * @param languages Array of language codes to generate audio for
 * @param baseOptions Base audio options
 * @returns Promise with audio URLs for each language
 */
export async function generateMultilingualArticleAudio(
  articleContent: {
    title: string;
    introduction: string;
    sections: Array<{ title: string; content: string }>;
    conclusion: string;
  },
  languages: string[],
  baseOptions: Omit<ArticleAudioOptions, 'targetLanguage' | 'translateFirst'> = {}
): Promise<{
  audioResults: Array<{
    language: string;
    audioUrl: string;
    audioLengthInSeconds: number;
    success: boolean;
    error?: string;
    creditsUsed?: number;
  }>;
  totalCreditsUsed: number;
  success: boolean;
  error?: string;
}> {
  try {
    const audioResults = [];
    let totalCreditsUsed = 0;

    // Get available voices to find appropriate voice for each language
    const availableVoices = await getMurfVoices();

    for (const targetLanguage of languages) {
      console.log(`Generating audio for language: ${targetLanguage}`);

      // Find a suitable voice for this language
      let voiceId = baseOptions.voiceId;
      
      if (!voiceId) {
        voiceId = getBestVoiceForLanguage(targetLanguage, availableVoices);
        console.log(`Selected voice for ${targetLanguage}: ${voiceId}`);
      }

      const audioOptions: ArticleAudioOptions = {
        ...baseOptions,
        voiceId,
        targetLanguage,
        translateFirst: true,
      };

      const result = await generateArticleAudio(articleContent, audioOptions);

      audioResults.push({
        language: targetLanguage,
        audioUrl: result.audioUrl,
        audioLengthInSeconds: result.audioLengthInSeconds,
        success: result.success,
        error: result.error,
        creditsUsed: result.creditsUsed || 0,
      });

      if (result.creditsUsed) {
        totalCreditsUsed += result.creditsUsed;
      }

      // Add a small delay between requests to avoid rate limiting
      if (languages.indexOf(targetLanguage) < languages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const overallSuccess = audioResults.every(result => result.success);

    return {
      audioResults,
      totalCreditsUsed,
      success: overallSuccess,
      error: overallSuccess ? undefined : 'Some audio generations failed',
    };

  } catch (error) {
    console.error('Error generating multilingual audio:', error);
    return {
      audioResults: [],
      totalCreditsUsed: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate multilingual audio',
    };
  }
}
