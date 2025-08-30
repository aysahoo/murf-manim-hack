"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

interface ArticleSection {
  title: string;
  content: string;
}

interface ArticleDisplayProps {
  title: string;
  introduction: string;
  sections: ArticleSection[];
  conclusion: string;
  audioUrl?: string;
  className?: string;
}

const ArticleDisplay: React.FC<ArticleDisplayProps> = ({
  title,
  introduction,
  sections,
  conclusion,
  audioUrl,
  className = "",
}) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
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

    const handleError = () => {
      setError("Failed to load audio");
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    // Set initial volume and playback rate
    audio.volume = volume;
    audio.playbackRate = playbackRate;

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioUrl, volume, playbackRate]);

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (isPlaying) {
      audioRef.current?.pause();
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        setIsLoading(true);
        await audio.play();
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
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header with Voice Mode Toggle */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-serif font-medium text-black">
          {title}
        </h1>
        
        {audioUrl && (
          <button
            onClick={toggleVoiceMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
              isVoiceMode
                ? "bg-pink-500 text-white shadow-lg"
                : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-white/50"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
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
      {isVoiceMode && audioUrl && (
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
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all duration-200"
              title="Skip back 10 seconds"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                <text x="12" y="15" textAnchor="middle" fontSize="8" fill="currentColor">10</text>
              </svg>
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skipTime(10)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all duration-200"
              title="Skip forward 10 seconds"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                <text x="12" y="15" textAnchor="middle" fontSize="8" fill="currentColor">10</text>
              </svg>
            </button>

            {/* Progress Bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div 
                className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center justify-between">
            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Speed:</span>
              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="bg-white/60 border border-gray-300 rounded px-2 py-1 text-sm"
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
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <audio ref={audioRef} src={audioUrl} preload="metadata" />
        </motion.div>
      )}

      {/* Article Content */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Introduction */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <p className="text-lg text-gray-800 leading-relaxed">
            {introduction}
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <motion.div
            key={index}
            className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
          >
            <h2 className="text-2xl font-serif font-medium text-black mb-4">
              {section.title}
            </h2>
            <div className="text-gray-800 leading-relaxed space-y-4">
              {section.content.split('\n').map((paragraph, pIndex) => (
                paragraph.trim() && (
                  <p key={pIndex}>{paragraph.trim()}</p>
                )
              ))}
            </div>
          </motion.div>
        ))}

        {/* Conclusion */}
        <motion.div
          className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 + sections.length * 0.1 }}
        >
          <h2 className="text-2xl font-serif font-medium text-black mb-4">
            Conclusion
          </h2>
          <p className="text-lg text-gray-800 leading-relaxed">
            {conclusion}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ArticleDisplay;