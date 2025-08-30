"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

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
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const getCurrentArticle = () => {
    return (
      articles.find((article) => article.part === currentArticle) || articles[0]
    );
  };

  const currentArticleData = getCurrentArticle();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [currentArticleData?.audioUrl]);

  // Reset audio state when switching articles
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsLoading(false);
  }, [currentArticle]);

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (isPlaying) {
      audioRef.current?.pause();
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !currentArticleData?.audioUrl) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setError("Failed to play audio");
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setPlaybackRate(speed);
    audio.playbackRate = speed;
  };

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setVolume(newVolume);
    audio.volume = newVolume;
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

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
      </motion.div>

      {/* Article Header with Voice Mode Toggle */}
      <motion.div
        className="flex items-center justify-between mb-8"
        key={`header-${currentArticle}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h3 className="text-2xl font-bold text-black mb-2 font-serif">
            Part {currentArticle}
          </h3>
          <h1 className="text-xl font-medium text-gray-700">
            {currentArticleData.title}
          </h1>
        </div>

        {currentArticleData.audioUrl && (
          <button
            onClick={toggleVoiceMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
              isVoiceMode
                ? "bg-pink-500 text-white shadow-lg"
                : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-white/50"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <path d="M12 18v4" />
              <path d="M8 22h8" />
            </svg>
            Voice Mode
          </button>
        )}
      </motion.div>

      {/* Voice Mode Controls */}
      {isVoiceMode && currentArticleData.audioUrl && (
        <motion.div
          className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Main Controls */}
          <div className="flex items-center gap-4 mb-4">
            {/* Skip Backward */}
            <button
              onClick={() => skipTime(-10)}
              className="bg-white/60 hover:bg-white/80 text-gray-700 p-3 rounded-full transition-all duration-200 border border-white/30 shadow-sm hover:shadow-md"
              title="Skip back 10 seconds"
            >
              <div className="flex items-center gap-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
                <span className="text-xs font-medium">10</span>
              </div>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayback}
              disabled={isLoading}
              className="bg-black/70 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
              ) : isPlaying ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skipTime(10)}
              className="bg-white/60 hover:bg-white/80 text-gray-700 p-3 rounded-full transition-all duration-200 border border-white/30 shadow-sm hover:shadow-md"
              title="Skip forward 10 seconds"
            >
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">10</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                </svg>
              </div>
            </button>

            {/* Progress Bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span className="font-medium">{formatTime(currentTime)}</span>
                <span className="font-medium">{formatTime(duration)}</span>
              </div>
              <div
                className="relative w-full bg-white/60 rounded-full h-3 cursor-pointer group border border-white/30 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={handleSeek}
              >
                <div
                  className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-200 ease-out relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Progress indicator dot */}
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center justify-between">
            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Speed:</span>
              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="bg-white/60 border border-white/30 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-gray-600"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) =>
                    handleVolumeChange(parseFloat(e.target.value))
                  }
                  className="w-24 h-2 bg-white/60 rounded-full appearance-none cursor-pointer border border-white/30 shadow-sm hover:shadow-md transition-all duration-200 slider-thumb"
                />
                <div className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round(volume * 100)}%
                </div>
              </div>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={currentArticleData.audioUrl}
            preload="metadata"
            key={currentArticle} // Force re-render when article changes
          />
        </motion.div>
      )}

      {/* Current Article Content */}
      <motion.div
        className="mb-8 space-y-6"
        key={`article-${currentArticle}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Introduction */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <p className="text-lg text-gray-800 leading-relaxed">
            {currentArticleData.introduction}
          </p>
        </div>

        {/* Sections */}
        {currentArticleData.sections.map((section, index) => (
          <div
            key={index}
            className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
          >
            <h4 className="text-xl font-serif font-medium text-black mb-4">
              {section.title}
            </h4>
            <div className="text-gray-800 leading-relaxed space-y-4">
              {section.content
                .split("\n")
                .map(
                  (paragraph, pIndex) =>
                    paragraph.trim() && <p key={pIndex}>{paragraph.trim()}</p>
                )}
            </div>
          </div>
        ))}

        {/* Conclusion */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <h4 className="text-xl font-serif font-medium text-black mb-4">
            Conclusion
          </h4>
          <p className="text-lg text-gray-800 leading-relaxed">
            {currentArticleData.conclusion}
          </p>
        </div>
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
            Back
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
