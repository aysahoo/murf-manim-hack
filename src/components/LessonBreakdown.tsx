"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import VideoWithAudio from "./VideoWithAudio";

interface Lesson {
  part: number;
  script: string;
  manim_code: string;
  videoUrl?: string;
  audioUrl?: string;
  voiceScript?: string;
  executionSuccess?: boolean;
}

interface LessonBreakdownProps {
  lessons: Lesson[];
  topic: string;
  className?: string;
}

const LessonBreakdown: React.FC<LessonBreakdownProps> = ({
  lessons,
  topic,
  className = "",
}) => {
  const [currentLesson, setCurrentLesson] = useState<number>(1);
  const [autoPlay, setAutoPlay] = useState<boolean>(true); // Start with autoplay enabled

  const handleLessonComplete = () => {
    console.log(`Lesson ${currentLesson} completed, advancing to next lesson`);
    // Auto-advance to next lesson when current one finishes
    if (currentLesson < lessons.length) {
      setTimeout(() => {
        console.log(
          `Moving from lesson ${currentLesson} to ${currentLesson + 1}`
        );
        setCurrentLesson(currentLesson + 1);
        setAutoPlay(true); // Auto-play next lesson
      }, 2000); // 2 second delay between lessons for smooth transition
    } else {
      console.log("All lessons completed!");
    }
  };

  const getCurrentLesson = () => {
    return (
      lessons.find((lesson) => lesson.part === currentLesson) || lessons[0]
    );
  };

  const currentLessonData = getCurrentLesson();

  // Debug logging
  console.log(`Current lesson ${currentLesson} data:`, currentLessonData);
  console.log(
    `Video URL for lesson ${currentLesson}:`,
    currentLessonData?.videoUrl
  );

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

      {/* Part Header and Description on Background */}
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
        {/* Video Player - No background box */}
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

      {/* Simple Navigation */}
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
                className={`w-14 h-14 rounded-2xl font-bold text-lg font-serif transition-all duration-200 backdrop-blur-sm border ${
                  currentLesson === lesson.part
                    ? "bg-black/80 text-white shadow-lg border-white/30"
                    : "bg-white/20 text-black hover:bg-white/30 border-white/20"
                }`}
              >
                {lesson.part}
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
    </div>
  );
};

export default LessonBreakdown;
