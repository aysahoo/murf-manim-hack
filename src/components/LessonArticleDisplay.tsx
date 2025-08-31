"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import EnhancedArticleDisplay from "./EnhancedArticleDisplay";

interface ArticleSection {
  title: string;
  content: string;
}

interface LessonArticle {
  part: number;
  title: string;
  introduction: string;
  sections: ArticleSection[];
  conclusion: string;
  audioUrl?: string;
}

interface LessonArticleDisplayProps {
  articles: LessonArticle[];
  topic: string;
  className?: string;
}

const LessonArticleDisplay: React.FC<LessonArticleDisplayProps> = ({
  articles,
  topic,
  className = "",
}) => {
  const [currentArticle, setCurrentArticle] = useState<number>(1);

  const getCurrentArticle = () => {
    return (
      articles.find((article) => article.part === currentArticle) || articles[0]
    );
  };

  const currentArticleData = getCurrentArticle();

  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-serif font-medium text-black mb-2">
          {topic} - Article Series
        </h2>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-black mb-2 font-serif">
            Part {currentArticle} of {articles.length}
          </h3>
        </div>
      </motion.div>

      {/* Enhanced Article Display */}
      <motion.div
        key={`article-${currentArticle}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <EnhancedArticleDisplay 
          title={currentArticleData.title}
          introduction={currentArticleData.introduction}
          sections={currentArticleData.sections}
          conclusion={currentArticleData.conclusion}
        />
      </motion.div>

      {/* Navigation */}
      <motion.div
        className="mb-8 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={() => {
              if (currentArticle > 1) {
                setCurrentArticle(currentArticle - 1);
              }
            }}
            disabled={currentArticle === 1}
            className="flex items-center px-6 py-3 bg-black/70 backdrop-blur-sm text-white rounded-2xl hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <div className="flex space-x-3">
            {articles.map((article) => (
              <button
                key={article.part}
                onClick={() => setCurrentArticle(article.part)}
                className={`w-14 h-14 rounded-2xl font-bold text-lg font-serif transition-all duration-200 backdrop-blur-sm border ${
                  currentArticle === article.part
                    ? "bg-black/80 text-white shadow-lg border-white/30"
                    : "bg-white/20 text-black hover:bg-white/30 border-white/20"
                }`}
              >
                {article.part}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (currentArticle < articles.length) {
                setCurrentArticle(currentArticle + 1);
              }
            }}
            disabled={currentArticle === articles.length}
            className="flex items-center px-6 py-3 bg-black/70 backdrop-blur-sm text-white rounded-2xl hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-white/20"
          >
            Next
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LessonArticleDisplay;
