# Murf AI Translation and Multilingual Audio Integration

This document explains how to use the newly integrated Murf AI Translation API for translating articles and generating multilingual audio.

## Features Added

### 1. Translation API Integration (`/src/utils/translation.ts`)

- **Translate Text**: Convert text strings to any of 22+ supported languages
- **Translate Articles**: Batch translate entire article structures
- **Language Support**: Full support for Murf's language catalog
- **Credit Tracking**: Monitor translation API usage

### 2. Multilingual Audio Generation (`/src/utils/murfTTS.ts`)

- **Enhanced Article Audio**: Generate audio with optional pre-translation
- **Multilingual Mode**: Generate audio in multiple languages simultaneously
- **Smart Voice Selection**: Automatically choose appropriate voices for target languages
- **Translation Integration**: Seamlessly combine translation and TTS workflows

### 3. UI Components (`/src/components/`)

- **LanguageSelector**: Single language selection with translation toggle
- **MultiLanguageSelector**: Multiple language selection for batch operations
- **EnhancedArticleDisplay**: Complete article display with translation and audio controls

### 4. API Endpoints

- **`POST /api/translate`**: Translation services
- **`POST /api/generate-audio`**: Enhanced audio generation with translation support

## Usage Examples

### Basic Translation

```typescript
import { translateText, translateArticle } from '@/utils/translation';

// Translate simple text
const result = await translateText(
  ['Hello, world!', 'How are you?'],
  'es-ES'
);

// Translate an article
const articleResult = await translateArticle(
  {
    title: 'My Article',
    introduction: 'Article intro...',
    sections: [{ title: 'Section 1', content: 'Content...' }],
    conclusion: 'Conclusion...'
  },
  'fr-FR'
);
```

### API Usage

```typescript
// Translate article via API
const response = await fetch('/api/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'article',
    targetLanguage: 'es-ES',
    data: { articleContent: myArticle }
  })
});

// Generate multilingual audio
const audioResponse = await fetch('/api/generate-audio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    articleContent: myArticle,
    mode: 'multilingual',
    languages: ['en-US', 'es-ES', 'fr-FR']
  })
});
```

### React Component Usage

```tsx
import EnhancedArticleDisplay from '@/components/EnhancedArticleDisplay';

function MyArticlePage() {
  const article = {
    title: 'AI and the Future',
    introduction: 'Artificial Intelligence is transforming...',
    sections: [
      { title: 'Current State', content: 'Today AI is...' },
      { title: 'Future Outlook', content: 'Tomorrow AI will...' }
    ],
    conclusion: 'In conclusion, AI represents...'
  };

  return (
    <EnhancedArticleDisplay
      title={article.title}
      introduction={article.introduction}
      sections={article.sections}
      conclusion={article.conclusion}
    />
  );
}
```

## Supported Languages

The integration supports all 22 languages from Murf's Translation API:

- **English**: US, UK, India, Australia, Scotland
- **Spanish**: Spain, Mexico
- **European**: French, German, Italian, Dutch, Portuguese, Polish, Croatian, Slovak, Greek
- **Asian**: Chinese, Japanese, Korean, Hindi, Tamil, Bengali

## Configuration

### Environment Variables

Ensure your `.env.local` file includes:

```env
MURF_API_KEY=your_murf_api_key_here
```

### API Limits

- **Rate Limit**: 1,000-10,000 requests/hour (depending on plan)
- **Concurrency**: Up to 5-15 concurrent requests
- **Text Limits**: 4,000 characters per sentence, 10 sentences per request

## Component Features

### EnhancedArticleDisplay

1. **Translation Controls**
   - Language selection dropdown
   - Translation toggle
   - Real-time translation status
   - Error handling and display

2. **Audio Generation**
   - Single language mode
   - Multilingual mode (up to 3 languages)
   - Audio playback controls
   - Credit usage tracking

3. **User Experience**
   - Loading states
   - Error messages
   - Success indicators
   - Responsive design

### LanguageSelector

- Dropdown with all supported languages
- Optional translation toggle
- Disabled state handling
- Accessible design

### MultiLanguageSelector

- Checkbox-based selection
- Search functionality
- Maximum selection limits
- Selected language chips

## Integration Benefits

1. **Seamless Workflow**: Translate and generate audio in one interface
2. **Cost Efficient**: Smart batching and caching reduce API calls
3. **User Friendly**: Intuitive controls and clear feedback
4. **Scalable**: Designed for production use with proper error handling
5. **Accessible**: Full keyboard navigation and screen reader support

## Demo

Try the translation and multilingual audio features at:
`http://localhost:3000/translation-demo`

This demo showcases:
- Article translation to multiple languages
- Multilingual audio generation
- Real-time translation status
- Audio playback controls
- Credit usage tracking

## Development Notes

- All components are TypeScript-typed for better development experience
- Error boundaries handle API failures gracefully
- Loading states provide clear user feedback
- Audio components handle cleanup properly
- Translation results are cached to avoid redundant API calls

## Future Enhancements

Potential improvements for the translation system:
1. Translation caching for frequently requested content
2. Batch translation optimization
3. Voice cloning for consistent multilingual narration
4. Real-time translation preview
5. Translation quality scoring
6. Custom pronunciation dictionaries per language
