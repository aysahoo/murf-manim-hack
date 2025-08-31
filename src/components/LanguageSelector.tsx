'use client';

import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, getLanguageName } from '@/utils/translation';

interface LanguageSelectorProps {
  selectedLanguage?: string;
  onLanguageChange: (language: string) => void;
  showTranslateOption?: boolean;
  translateEnabled?: boolean;
  onTranslateToggle?: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function LanguageSelector({
  selectedLanguage = 'en-US',
  onLanguageChange,
  showTranslateOption = false,
  translateEnabled = false,
  onTranslateToggle,
  disabled = false,
  className = '',
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  const selectedLanguageData = SUPPORTED_LANGUAGES.find(
    lang => lang.code === selectedLanguage
  ) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`relative ${className}`}>
      {showTranslateOption && onTranslateToggle && (
        <div className="mb-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={translateEnabled}
              onChange={(e) => onTranslateToggle(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Translate content before generating audio
            </span>
          </label>
        </div>
      )}

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Language
        </label>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
        >
          <span className="block truncate">
            {getLanguageName(selectedLanguageData.code)}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => handleLanguageSelect(language.code)}
                className={`
                  relative w-full text-left cursor-default select-none py-2 pl-3 pr-9 hover:bg-pink-50
                  ${selectedLanguage === language.code ? 'bg-pink-100 text-pink-900' : 'text-gray-900'}
                `}
              >
                <span className="block truncate font-normal">
                  {getLanguageName(language.code)}
                </span>
                {selectedLanguage === language.code && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-pink-600">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface MultiLanguageSelectorProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  disabled?: boolean;
  className?: string;
  maxSelections?: number;
}

export function MultiLanguageSelector({
  selectedLanguages,
  onLanguagesChange,
  disabled = false,
  className = '',
  maxSelections = 5,
}: MultiLanguageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(language =>
    getLanguageName(language.code).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLanguage = (languageCode: string) => {
    if (selectedLanguages.includes(languageCode)) {
      onLanguagesChange(selectedLanguages.filter(code => code !== languageCode));
    } else if (selectedLanguages.length < maxSelections) {
      onLanguagesChange([...selectedLanguages, languageCode]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Select Languages (max {maxSelections})
      </label>

      <input
        type="text"
        placeholder="Search languages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
      />

      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
        {filteredLanguages.map((language) => {
          const isSelected = selectedLanguages.includes(language.code);
          const canSelect = !isSelected && selectedLanguages.length < maxSelections;

          return (
            <label
              key={language.code}
              className={`
                flex items-center p-3 hover:bg-gray-50 cursor-pointer
                ${isSelected ? 'bg-pink-50 border-l-2 border-pink-500' : ''}
                ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => (canSelect || isSelected) && toggleLanguage(language.code)}
                disabled={disabled || (!canSelect && !isSelected)}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
              />
              <span className="ml-3 text-sm text-gray-700">
                {getLanguageName(language.code)}
              </span>
            </label>
          );
        })}
      </div>

      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((languageCode) => (
            <span
              key={languageCode}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
            >
              {getLanguageName(languageCode)}
              <button
                type="button"
                onClick={() => toggleLanguage(languageCode)}
                disabled={disabled}
                className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-pink-400 hover:bg-pink-200 hover:text-pink-500 focus:outline-none focus:bg-pink-500 focus:text-white"
              >
                <span className="sr-only">Remove {getLanguageName(languageCode)}</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
