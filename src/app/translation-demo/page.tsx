import React from 'react';
import EnhancedArticleDisplay from '@/components/EnhancedArticleDisplay';

export default function TranslationDemo() {
  const sampleArticle = {
    title: "The Future of Artificial Intelligence",
    introduction: "Artificial Intelligence (AI) has evolved from science fiction to reality, transforming industries and reshaping how we interact with technology. As we stand on the brink of unprecedented technological advancement, understanding AI's trajectory becomes crucial for navigating our digital future.",
    sections: [
      {
        title: "Current AI Applications",
        content: "Today's AI systems power everything from recommendation algorithms on streaming platforms to autonomous vehicles navigating city streets. Machine learning models process vast amounts of data to identify patterns, make predictions, and automate complex tasks that once required human intelligence."
      },
      {
        title: "Emerging Technologies",
        content: "The next generation of AI includes large language models, computer vision systems, and neural networks that can generate creative content. These technologies are pushing the boundaries of what machines can accomplish, from writing code to creating art and composing music."
      },
      {
        title: "Societal Impact",
        content: "As AI becomes more prevalent, it's reshaping employment, education, and social interactions. While some jobs may become automated, new opportunities emerge in AI development, data science, and human-AI collaboration. The key is preparing society for this technological transformation."
      }
    ],
    conclusion: "The future of AI holds immense promise and responsibility. By understanding its capabilities and limitations, we can harness AI's power to solve global challenges while ensuring it remains a force for positive change in human society."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Translation & Multilingual Audio Demo
            </h1>
            <p className="text-lg text-gray-600">
              Experience article translation and voice generation in multiple languages using Murf AI
            </p>
          </div>

          <EnhancedArticleDisplay
            title={sampleArticle.title}
            introduction={sampleArticle.introduction}
            sections={sampleArticle.sections}
            conclusion={sampleArticle.conclusion}
          />

          <div className="mt-12 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Features Demonstrated</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Translation Capabilities</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Translate articles to 22+ supported languages</li>
                  <li>• Maintain article structure and formatting</li>
                  <li>• High-quality translations using Murf AI</li>
                  <li>• Credit usage tracking</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Audio Generation</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Generate audio in original or translated text</li>
                  <li>• Multilingual audio generation</li>
                  <li>• Automatic voice selection for languages</li>
                  <li>• Audio playback controls</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">API Integration</h3>
            <p className="text-blue-800 text-sm mb-3">
              This demo integrates Murf AI&apos;s Translation and Speech Synthesis APIs:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded p-3 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">Translation API</h4>
                <code className="text-xs text-blue-700">POST /api/translate</code>
                <p className="text-xs text-blue-600 mt-1">
                  Translates article content to target languages
                </p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">Audio Generation API</h4>
                <code className="text-xs text-blue-700">POST /api/generate-audio</code>
                <p className="text-xs text-blue-600 mt-1">
                  Generates speech from text with optional translation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
