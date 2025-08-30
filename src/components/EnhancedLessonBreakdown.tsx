"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import VideoWithAudio from "./VideoWithAudio";
import ArticleDisplay from "./ArticleDisplay";

interface Lesson {
  part: number;
  script: string;
  manim_code: string;
  videoUrl?: string;
  audioUrl?: string;
  voiceScript?: string;
  executionSuccess?: boolean;
}

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

interface EnhancedLessonBreakdownProps {
  lessons: Lesson[];
  topic: string;
  className?: string;
}

const EnhancedLessonBreakdown: React.FC<EnhancedLessonBreakdownProps> = ({
  lessons,
  topic,
  className = "",
}) => {
  const [currentLesson, setCurrentLesson] = useState<number>(1);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [lessonArticles, setLessonArticles] = useState<LessonArticle[]>([]);
  const [articleLoading, setArticleLoading] = useState<boolean>(false);
  const [articlesGenerated, setArticlesGenerated] = useState<boolean>(false);

  const handleLessonComplete = () => {
    console.log(`Lesson ${currentLesson} completed, advancing to next lesson`);
    if (currentLesson < lessons.length) {
      setTimeout(() => {
        console.log(
          `Moving from lesson ${currentLesson} to ${currentLesson + 1}`
        );
        setCurrentLesson(currentLesson + 1);
        setAutoPlay(true);
      }, 2000);
    } else {
      console.log("All lessons completed!");
    }
  };

  const getCurrentLesson = () => {
    return (
      lessons.find((lesson) => lesson.part === currentLesson) || lessons[0]
    );
  };

  const getCurrentArticle = () => {
    return lessonArticles.find((article) => article.part === currentLesson);
  };

  const currentLessonData = getCurrentLesson();
  const currentArticleData = getCurrentArticle();

  // Auto-generate articles after lessons are loaded
  useEffect(() => {
    if (lessons.length > 0 && !articlesGenerated && !articleLoading) {
      const timer = setTimeout(() => {
        generateLessonArticles();
      }, 3000); // Generate articles 3 seconds after lessons load
      return () => clearTimeout(timer);
    }
  }, [lessons.length, articlesGenerated, articleLoading]);

  const generateLessonArticles = async () => {
    setArticleLoading(true);
    try {
      const articlePromises = lessons.map(async (lesson) => {
        const res = await fetch("/api/generate-article", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            topic: `${topic} - Part ${lesson.part}`,
            length: "short",
            style: "educational",
            includeAudio: true,
            voiceId: "en-US-natalie"
          }),
        });

        const data = await res.json();
        if (data.success) {
          return {
            part: lesson.part,
            title: data.title,
            introduction: data.introduction,
            sections: data.sections,
            conclusion: data.conclusion,
            audioUrl: data.audioUrl,
          } as LessonArticle;
        }
        return null;
      });

      const results = await Promise.all(articlePromises);
      const validArticles = results.filter((article): article is LessonArticle => article !== null);
      setLessonArticles(validArticles);
      setArticlesGenerated(true);
    } catch (error) {
      console.error("Error generating lesson articles:", error);
    } finally {
      setArticleLoading(false);
    }
  };

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
          {topic} - Lesson Series
        </h2>
      </motion.div>

      {/* Part Header and Description */}
      <motion.div
        className="text-center mb-8"
        key={`header-${currentLesson}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-black mb-2 font-serif">
          Part {currentLesson}
        </h3>
        <p className="text-black text-lg max-w-3xl mx-auto">
          {currentLessonData.script}
        </p>
      </motion.div>

      {/* Current Lesson Video */}
      <motion.div
        className="mb-8"
        key={`video-${currentLesson}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          {currentLessonData.videoUrl ? (
            <VideoWithAudio
              videoUrl={currentLessonData.videoUrl}
              audioUrl={currentLessonData.audioUrl}
              className="w-full rounded-xl"
              autoPlay={autoPlay}
              onEnded={handleLessonComplete}
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg text-gray-600 mb-2">
                  {currentLessonData.executionSuccess === false ? 
                    "Video generation failed" : 
                    "No video available"}
                </div>
                <div className="text-sm text-gray-500">
                  Part {currentLesson} of {lessons.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Article Section for Current Lesson */}
      <motion.div
        className="mb-8"
        key={`article-${currentLesson}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="text-center mb-6">
          <h4 className="text-xl font-serif font-medium text-black mb-2">
            Written Explanation - Part {currentLesson}
          </h4>
          <div className="w-16 h-0.5 bg-pink-500 mx-auto"></div>
        </div>

        {articleLoading && !currentArticleData && (
          <div className="text-center text-gray-700 py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-2 text-sm">Generating article for Part {currentLesson}...</p>
          </div>
        )}

        {currentArticleData && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <ArticleDisplay
              title={currentArticleData.title}
              introduction={currentArticleData.introduction}
              sections={currentArticleData.sections}
              conclusion={currentArticleData.conclusion}
              audioUrl={currentArticleData.audioUrl}
              className="max-w-none"
            />
          </div>
        )}

        {!articleLoading && !currentArticleData && articlesGenerated && (
          <div className="text-center py-8">
            <p className="text-gray-600">Article not available for this lesson</p>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={() => {
              if (currentLesson > 1) {
                setCurrentLesson(currentLesson - 1);
                setAutoPlay(true);
              }
            }}
            disabled={currentLesson === 1}
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
            Back
          </button>

          <div className="flex space-x-3">
            {lessons.map((lesson) => (
              <button
                key={lesson.part}
                onClick={() => {
                  setCurrentLesson(lesson.part);
                  setAutoPlay(true);
                }}
                className={`w-14 h-14 rounded-2xl font-bold text-lg font-serif transition-all duration-200 backdrop-blur-sm border relative ${
                  currentLesson === lesson.part
                    ? "bg-black/80 text-white shadow-lg border-white/30"
                    : "bg-white/20 text-black hover:bg-white/30 border-white/20"
                }`}
              >
                {lesson.part}
                {/* Article indicator */}
                {lessonArticles.find(a => a.part === lesson.part) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (currentLesson < lessons.length) {
                setCurrentLesson(currentLesson + 1);
                setAutoPlay(true);
              }
            }}
            disabled={currentLesson === lessons.length}
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

      {/* Generate Articles Button (if not generated yet) */}
      {!articlesGenerated && !articleLoading && (
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            onClick={generateLessonArticles}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full transition-colors flex items-center gap-2 mx-auto"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
            Generate Articles for All Lessons
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedLessonBreakdown;