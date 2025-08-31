"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import ArticleDisplay from "./ArticleDisplay";
import LanguageSelector, { MultiLanguageSelector } from "./LanguageSelector";
import { getLanguageName } from "@/utils/translation";

interface ArticleSection {
  title: string;
  content: string;
}

interface TranslatedArticleContent {
  title: string;
  introduction: string;
  sections: ArticleSection[];
  conclusion: string;
}

interface EnhancedArticleDisplayProps {
  title: string;
  introduction: string;
  sections: ArticleSection[];
  conclusion: string;
  className?: string;
}

interface GeneratedAudio {
  language: string;
  audioUrl: string;
  audioLengthInSeconds: number;
  success: boolean;
  error?: string;
  creditsUsed?: number;
}

export default function EnhancedArticleDisplay({
  title,
  introduction,
  sections,
  conclusion,
  className = "",
}: EnhancedArticleDisplayProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [translateEnabled, setTranslateEnabled] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>("");
  const [isMultilingualMode, setIsMultilingualMode] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [showAudioPanel, setShowAudioPanel] = useState(false);

  // Translation states
  const [translatedContent, setTranslatedContent] =
    useState<TranslatedArticleContent | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string>("");

  const articleContent = useMemo(
    () => ({
      title,
      introduction,
      sections,
      conclusion,
    }),
    [title, introduction, sections, conclusion]
  );

  const currentContent = translatedContent || articleContent;

  const handleTranslation = useCallback(async () => {
    if (!translateEnabled || selectedLanguage === "en-US") {
      setTranslatedContent(null);
      setTranslationError("");
      return;
    }

    setIsTranslating(true);
    setTranslationError("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "article",
          targetLanguage: selectedLanguage,
          data: {
            articleContent,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Translation failed");
      }

      const data = await response.json();

      if (data.success) {
        setTranslatedContent(data.translatedContent);
      } else {
        setTranslationError(data.error || "Translation failed");
      }
    } catch (err) {
      setTranslationError(
        err instanceof Error ? err.message : "Translation failed"
      );
    } finally {
      setIsTranslating(false);
    }
  }, [translateEnabled, selectedLanguage, articleContent]);

  // Handle translation when settings change
  React.useEffect(() => {
    // Auto-enable translation for non-English languages
    if (selectedLanguage !== "en-US" && !translateEnabled) {
      setTranslateEnabled(true);
    }

    if (translateEnabled) {
      handleTranslation();
    } else {
      setTranslatedContent(null);
      setTranslationError("");
    }
  }, [translateEnabled, selectedLanguage, handleTranslation]);

  const generateSingleAudio = async () => {
    setIsGeneratingAudio(true);
    setError("");

    try {
      // Determine if we need to translate
      const needsTranslation =
        selectedLanguage !== "en-US" && !translatedContent;

      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleContent: currentContent,
          mode: "single",
          voiceOptions: {
            targetLanguage: selectedLanguage,
            translateFirst: needsTranslation, // Translate if needed
            voiceId: undefined, // Let the system choose appropriate voice based on target language
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const data = await response.json();

      if (data.success) {
        const newAudio: GeneratedAudio = {
          language: selectedLanguage,
          audioUrl: data.audioUrl,
          audioLengthInSeconds: data.audioLengthInSeconds,
          success: true,
          creditsUsed: data.creditsUsed,
        };

        setGeneratedAudios([newAudio]);
        setCurrentAudioUrl(data.audioUrl);
        setShowAudioPanel(true);
      } else {
        setError(data.error || "Failed to generate audio");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const generateMultilingualAudio = async () => {
    if (selectedLanguages.length === 0) {
      setError("Please select at least one language");
      return;
    }

    setIsGeneratingAudio(true);
    setError("");

    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleContent: currentContent,
          mode: "multilingual",
          languages: selectedLanguages,
          voiceOptions: {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate multilingual audio"
        );
      }

      const data = await response.json();

      if (data.success) {
        setGeneratedAudios(data.audioResults);
        // Set the first successful audio as current
        const firstSuccessful = data.audioResults.find(
          (audio: GeneratedAudio) => audio.success
        );
        if (firstSuccessful) {
          setCurrentAudioUrl(firstSuccessful.audioUrl);
        }
        setShowAudioPanel(true);
      } else {
        setError(data.error || "Failed to generate multilingual audio");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleAudioSelect = (audioUrl: string) => {
    setCurrentAudioUrl(audioUrl);
  };

  const getTotalCreditsUsed = () => {
    return generatedAudios.reduce(
      (total, audio) => total + (audio.creditsUsed || 0),
      0
    );
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Audio Generation Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-100/60 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-white/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Audio Generation
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMultilingualMode(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !isMultilingualMode
                  ? "bg-black text-white shadow-lg"
                  : "bg-gray-100/60 text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
              }`}
            >
              Single Language
            </button>
            {/* <button
              onClick={() => setIsMultilingualMode(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isMultilingualMode
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-100/60 text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              Multilingual
            </button> */}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isMultilingualMode ? (
            <motion.div
              key="single"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                showTranslateOption={true}
                translateEnabled={translateEnabled}
                onTranslateToggle={setTranslateEnabled}
                disabled={isGeneratingAudio}
              />

              <button
                onClick={generateSingleAudio}
                disabled={isGeneratingAudio}
                className={`w-full px-4 py-3 rounded-full font-medium transition-all duration-300 shadow-lg ${
                  isGeneratingAudio
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                }`}
              >
                {isGeneratingAudio ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating Audio...</span>
                  </div>
                ) : (
                  `Generate Audio${
                    translateEnabled
                      ? ` (${getLanguageName(selectedLanguage)})`
                      : ""
                  }`
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="multi"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <MultiLanguageSelector
                selectedLanguages={selectedLanguages}
                onLanguagesChange={setSelectedLanguages}
                disabled={isGeneratingAudio}
                maxSelections={5}
              />

              <button
                onClick={generateMultilingualAudio}
                disabled={isGeneratingAudio || selectedLanguages.length === 0}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  isGeneratingAudio || selectedLanguages.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-pink-600 text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                }`}
              >
                {isGeneratingAudio ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating Multilingual Audio...</span>
                  </div>
                ) : (
                  `Generate Audio in ${selectedLanguages.length} Language${
                    selectedLanguages.length !== 1 ? "s" : ""
                  }`
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg shadow-sm"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Translation Status */}
      {isTranslating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-900 text-sm font-medium">
              Translating to {getLanguageName(selectedLanguage)}...
            </span>
          </div>
        </motion.div>
      )}

      {translationError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 10.414l1.707-1.707a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-900 text-sm font-medium">
              Translation Error: {translationError}
            </span>
          </div>
        </motion.div>
      )}

      {translatedContent && !isTranslating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-900 text-sm font-medium">
              Content translated to {getLanguageName(selectedLanguage)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Article Display with Audio */}
      <ArticleDisplay
        title={currentContent.title}
        introduction={currentContent.introduction}
        sections={currentContent.sections}
        conclusion={currentContent.conclusion}
        audioUrl={currentAudioUrl}
        className="mt-6"
      />
    </div>
  );
}
