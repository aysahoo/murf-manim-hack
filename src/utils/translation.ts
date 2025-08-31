interface MurfTranslationResponse {
  metadata: {
    character_count: {
      total_source_text_length: number;
      total_translated_text_length: number;
    };
    credits_used: number;
    target_language: string;
  };
  translations: Array<{
    source_text: string;
    translated_text: string;
  }>;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  region?: string;
}

// Supported languages from Murf API documentation
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en-US", name: "English", region: "US & Canada" },
  { code: "en-UK", name: "English", region: "UK" },
  { code: "en-IN", name: "English", region: "India" },
  { code: "en-AU", name: "English", region: "Australia" },
  { code: "en-SCOTT", name: "English", region: "Scotland" },
  { code: "es-MX", name: "Spanish", region: "Mexico" },
  { code: "es-ES", name: "Spanish", region: "Spain" },
  { code: "fr-FR", name: "French", region: "France" },
  { code: "de-DE", name: "German", region: "Germany" },
  { code: "it-IT", name: "Italian", region: "Italy" },
  { code: "nl-NL", name: "Dutch", region: "Netherlands" },
  { code: "pt-BR", name: "Portuguese", region: "Brazil" },
  { code: "zh-CN", name: "Chinese", region: "China" },
  { code: "ja-JP", name: "Japanese", region: "Japan" },
  { code: "ko-KR", name: "Korean", region: "Korea" },
  { code: "hi-IN", name: "Hindi", region: "India" },
  { code: "ta-IN", name: "Tamil", region: "India" },
  { code: "bn-IN", name: "Bengali", region: "India" },
  { code: "hr-HR", name: "Croatian", region: "Croatia" },
  { code: "sk-SK", name: "Slovak", region: "Slovakia" },
  { code: "pl-PL", name: "Polish", region: "Poland" },
  { code: "el-GR", name: "Greek", region: "Greece" },
];

/**
 * Translate text using Murf's Translation API
 * @param texts Array of text strings to translate
 * @param targetLanguage Target language code (e.g., 'es-ES' for Spanish)
 * @returns Promise with translated texts
 */
export async function translateText(
  texts: string[],
  targetLanguage: string
): Promise<{
  translations: Array<{ sourceText: string; translatedText: string }>;
  creditsUsed: number;
  success: boolean;
  error?: string;
}> {
  try {
    const apiKey = process.env.MURF_API_KEY;

    if (!apiKey) {
      throw new Error("MURF_API_KEY environment variable is not set");
    }

    // Validate target language
    const isValidLanguage = SUPPORTED_LANGUAGES.some(
      (lang) => lang.code === targetLanguage
    );
    if (!isValidLanguage) {
      throw new Error(`Unsupported target language: ${targetLanguage}`);
    }

    // Validate texts array
    if (!texts || texts.length === 0) {
      throw new Error("No texts provided for translation");
    }

    // Check API limits: max 10 sentences per request, 4000 characters per sentence
    if (texts.length > 10) {
      throw new Error("Maximum 10 texts per request allowed");
    }

    for (const text of texts) {
      if (text.length > 4000) {
        throw new Error("Maximum 4000 characters per text allowed");
      }
    }

    console.log(`Translating ${texts.length} texts to ${targetLanguage}...`);

    const response = await fetch("https://api.murf.ai/v1/text/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        target_language: targetLanguage,
        texts: texts,
      }),
    });

    console.log("Translation API Response Status:", response.status);

    if (!response.ok) {
      let errorMessage = `Translation failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("Translation API Error:", errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          console.error("Translation API Error Text:", errorText);
          errorMessage += ` - ${errorText}`;
        } catch {
          // Use default error message
        }
      }
      throw new Error(errorMessage);
    }

    const data: MurfTranslationResponse = await response.json();
    console.log(
      "Translation Success - Credits used:",
      data.metadata.credits_used
    );

    return {
      translations: data.translations.map((t) => ({
        sourceText: t.source_text,
        translatedText: t.translated_text,
      })),
      creditsUsed: data.metadata.credits_used,
      success: true,
    };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      translations: [],
      creditsUsed: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Translate article content to a target language
 * @param articleContent The article content structure
 * @param targetLanguage Target language code
 * @returns Promise with translated article content
 */
export async function translateArticle(
  articleContent: {
    title: string;
    introduction: string;
    sections: Array<{ title: string; content: string }>;
    conclusion: string;
  },
  targetLanguage: string
): Promise<{
  translatedContent?: {
    title: string;
    introduction: string;
    sections: Array<{ title: string; content: string }>;
    conclusion: string;
  };
  creditsUsed: number;
  success: boolean;
  error?: string;
}> {
  try {
    // Collect all texts to translate
    const textsToTranslate: string[] = [
      articleContent.title,
      articleContent.introduction,
      ...articleContent.sections.flatMap((section) => [
        section.title,
        section.content,
      ]),
      articleContent.conclusion,
    ];

    // Split into batches if necessary (max 10 texts per request)
    const batches: string[][] = [];
    for (let i = 0; i < textsToTranslate.length; i += 10) {
      batches.push(textsToTranslate.slice(i, i + 10));
    }

    let allTranslations: Array<{ sourceText: string; translatedText: string }> =
      [];
    let totalCreditsUsed = 0;

    // Process each batch
    for (const batch of batches) {
      const result = await translateText(batch, targetLanguage);

      if (!result.success) {
        return {
          creditsUsed: totalCreditsUsed,
          success: false,
          error: result.error,
        };
      }

      allTranslations = [...allTranslations, ...result.translations];
      totalCreditsUsed += result.creditsUsed;
    }

    // Reconstruct the article with translated content
    let translationIndex = 0;

    const translatedContent = {
      title: allTranslations[translationIndex++].translatedText,
      introduction: allTranslations[translationIndex++].translatedText,
      sections: articleContent.sections.map(() => ({
        title: allTranslations[translationIndex++].translatedText,
        content: allTranslations[translationIndex++].translatedText,
      })),
      conclusion: allTranslations[translationIndex++].translatedText,
    };

    return {
      translatedContent,
      creditsUsed: totalCreditsUsed,
      success: true,
    };
  } catch (error) {
    console.error("Article translation error:", error);
    return {
      creditsUsed: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get language name from language code
 * @param languageCode Language code (e.g., 'es-ES')
 * @returns Language display name
 */
export function getLanguageName(languageCode: string): string {
  const language = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === languageCode
  );
  if (!language) return languageCode;

  return language.region
    ? `${language.name} (${language.region})`
    : language.name;
}
