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
}> {
  try {
    const {
      voiceId = 'en-US-natalie',
      rate = 0,
      pitch = 0,
      includeTitle = true,
      pauseBetweenSections = 2
    } = options;

    // Construct the full text for TTS
    let fullText = '';
    
    if (includeTitle) {
      fullText += `${cleanTextForTTS(articleContent.title)}. [pause 3s] `;
    }
    
    fullText += `${cleanTextForTTS(articleContent.introduction)} [pause ${pauseBetweenSections}s] `;
    
    articleContent.sections.forEach((section, index) => {
      fullText += `${cleanTextForTTS(section.title)}. [pause 1s] ${cleanTextForTTS(section.content)}`;
      if (index < articleContent.sections.length - 1) {
        fullText += ` [pause ${pauseBetweenSections}s] `;
      }
    });
    
    fullText += ` [pause ${pauseBetweenSections}s] ${cleanTextForTTS(articleContent.conclusion)}`;

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
        success: true
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
        success: true
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
