"use client";

import React, { useRef, useEffect, useState } from "react";

interface VideoWithAudioProps {
  videoUrl: string;
  audioUrl?: string;
  className?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const VideoWithAudio: React.FC<VideoWithAudioProps> = ({
  videoUrl,
  audioUrl,
  className = "",
  autoPlay = false,
  onEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);

  // Handle video playback events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoPlay = () => {
      setIsPlaying(true);
    };

    const handleVideoPause = () => {
      setIsPlaying(false);
    };

    const handleVideoEnded = () => {
      const audio = audioRef.current;
      // If audio is still playing, restart the video immediately
      if (audio && audioUrl && !audio.ended && !audio.paused && isPlaying) {
        console.log(
          `Video ended but audio still playing (${audio.currentTime.toFixed(
            1
          )}/${audio.duration.toFixed(1)}s) - restarting video`
        );
        video.currentTime = 0; // Reset video to beginning
        video.play().catch((error) => {
          console.error("Failed to restart video:", error);
          // If video restart fails, stop everything
          setIsPlaying(false);
          if (audio) audio.pause();
          if (onEnded) onEnded();
        });
      } else {
        console.log("Video ended, no audio or audio finished");
        setIsPlaying(false);
        // Only call onEnded if there's no audio (video-only mode)
        if (!audioUrl && onEnded) {
          onEnded();
        }
      }
    };

    const handleTimeUpdate = () => {
      const audio = audioRef.current;

      // If we have audio, use audio time as the primary time source
      if (audio && audioUrl && isPlaying && !audio.paused && !audio.ended) {
        // Keep video in sync by looping it when audio goes beyond video length
        if (audio.currentTime > duration && duration > 0) {
          const videoPosition = audio.currentTime % duration;
          if (Math.abs(video.currentTime - videoPosition) > 0.5) {
            console.log(
              "Video loop sync: Setting video time to",
              videoPosition
            );
            video.currentTime = videoPosition;
          }
        } else {
          // Normal sync when within video duration
          const timeDiff = Math.abs(video.currentTime - audio.currentTime);
          if (timeDiff > 0.5) {
            // Increased threshold to reduce frequent resyncing
            console.log(
              "Resyncing video: Audio time:",
              audio.currentTime.toFixed(2),
              "Video time:",
              video.currentTime.toFixed(2)
            );
            video.currentTime = audio.currentTime;
          }
        }
      } else {
        // No audio or audio not playing, use video time
        // currentTime not needed for this implementation
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener("play", handleVideoPlay);
    video.addEventListener("pause", handleVideoPause);
    video.addEventListener("ended", handleVideoEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("play", handleVideoPlay);
      video.removeEventListener("pause", handleVideoPause);
      video.removeEventListener("ended", handleVideoEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl, isPlaying, duration, onEnded]); // Add dependencies for proper sync

  // Handle autoplay (with user interaction requirement)
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (autoPlay && video) {
      console.log("🎬 Autoplay requested, but waiting for user interaction");

      // Set up the media but don't play yet
      if (audio && audioUrl) {
        audio.loop = false;
        video.loop = true;
      } else {
        video.loop = true;
      }

      // Auto-trigger play after a short delay to attempt autoplay
      // If it fails, user will need to click play button
      const attemptAutoplay = async () => {
        try {
          if (audio && audioUrl) {
            // Reset both to start
            video.currentTime = 0;
            audio.currentTime = 0;

            await Promise.all([video.play(), audio.play()]);
            console.log("✅ Autoplay successful with audio");
          } else {
            video.currentTime = 0;
            await video.play();
            console.log("✅ Autoplay successful (video only)");
          }
          setIsPlaying(true);
        } catch {
          console.log(
            "🔒 Autoplay blocked - user interaction required. Click play to start."
          );
          // Don't set error state, just wait for user to click play
          setIsPlaying(false);
        }
      };

      const timer = setTimeout(attemptAutoplay, 500);
      return () => clearTimeout(timer);
    }
  }, [audioUrl, autoPlay]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    console.log(
      "🎮 Toggle playback - isPlaying:",
      isPlaying,
      "audioUrl:",
      audioUrl ? "Present" : "Missing"
    );

    if (isPlaying) {
      // Pause both
      setIsPlaying(false);

      try {
        video.pause();
        if (audio && audioUrl) {
          console.log("⏸️ Pausing audio at:", audio.currentTime.toFixed(2));
          audio.pause();
        }
      } catch (error) {
        console.error("❌ Pause failed:", error);
      }
    } else {
      // Play both
      try {
        // Ensure both are at the same time position before playing
        if (audio && audioUrl) {
          const syncTime = Math.max(video.currentTime, audio.currentTime);
          video.currentTime = syncTime;
          audio.currentTime = syncTime;
          console.log("▶️ Starting playback from:", syncTime.toFixed(2));

          await Promise.all([video.play(), audio.play()]);
        } else {
          await video.play();
        }

        setIsPlaying(true);
      } catch (error) {
        console.error("❌ Play failed:", error);
        setIsPlaying(false);
      }
    }
  };

  const changeSpeed = (speed: number) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    setPlaybackSpeed(speed);
    video.playbackRate = speed;
    if (audio && audioUrl) {
      audio.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  return (
    <div className={`${className}`}>
      {/* Video Container */}
      <div
        className={`relative ${
          className?.includes("absolute") ? "w-full h-full" : ""
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Player */}
        {!videoError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls={false}
            autoPlay={autoPlay}
            muted={!audioUrl}
            loop
            playsInline
            preload="metadata"
            width="100%"
            height="auto"
            crossOrigin="anonymous"
            style={{
              minHeight: className?.includes("h-full") ? "auto" : "300px",
            }}
            onEnded={() => {
              // This will be handled by handleVideoEnded
            }}
            className={`w-full h-full bg-gray-900 object-cover ${
              className?.includes("absolute") ? "" : "rounded-2xl"
            }`}
            onError={(e) => {
              console.error("Video error:", e, "Video URL:", videoUrl);
              console.error("Video error details:", {
                error: e,
                currentSrc: e.currentTarget?.currentSrc,
                networkState: e.currentTarget?.networkState,
                readyState: e.currentTarget?.readyState,
                videoUrl,
              });
              setVideoError(true);
            }}
            onLoadStart={() => console.log("Video load started:", videoUrl)}
            onLoadedData={() => console.log("Video data loaded:", videoUrl)}
            onCanPlay={() => console.log("Video can play:", videoUrl)}
          />
        ) : (
          <div className="w-full rounded-2xl bg-gray-900 p-4 text-white text-center">
            <p className="mb-4">Video failed to load. Trying fallback...</p>
            <video
              src={videoUrl}
              controls={true}
              autoPlay={false}
              muted={false}
              loop={true}
              className="w-full rounded-xl"
            />
          </div>
        )}

        {/* Centered Play/Pause Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayback}
            className={`bg-black/60 hover:bg-black/80 text-white p-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 backdrop-blur-sm border border-white/30 ${
              isPlaying ? "opacity-30 hover:opacity-80" : "opacity-100"
            }`}
          >
            {isPlaying ? (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Video Controls - Minimal, no progress bar */}
        <div
          className={`absolute bottom-4 right-4 transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-2">
            {/* Speed Control */}
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
              <span className="text-white text-xs">Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                className="bg-transparent text-white text-xs border-none outline-none"
              >
                <option value={0.5} className="bg-black">
                  0.5x
                </option>
                <option value={0.75} className="bg-black">
                  0.75x
                </option>
                <option value={1} className="bg-black">
                  1x
                </option>
                <option value={1.25} className="bg-black">
                  1.25x
                </option>
                <option value={1.5} className="bg-black">
                  1.5x
                </option>
                <option value={2} className="bg-black">
                  2x
                </option>
              </select>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded transition-all duration-200 backdrop-blur-sm"
              title="Toggle Fullscreen"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="auto"
            crossOrigin="anonymous"
            onLoadedMetadata={(e) => {
              const audio = e.target as HTMLAudioElement;
              console.log(
                "✅ Audio loaded successfully:",
                audio.duration + "s"
              );
            }}
            onCanPlay={() => {
              console.log("✅ Audio can play");
            }}
            onError={(e) => {
              console.error("❌ Audio failed to load:", audioUrl);
              console.error("Audio error event:", e);
              console.error("Audio element error:", audioRef.current?.error);

              // Check if file exists by trying to fetch it
              if (audioUrl) {
                fetch(audioUrl)
                  .then((response) => {
                    if (!response.ok) {
                      console.error(
                        `❌ Audio file not found: ${response.status} ${response.statusText}`
                      );
                    } else {
                      console.error(
                        "❌ Audio file exists but failed to load as audio"
                      );
                      console.log(
                        "Response headers:",
                        Object.fromEntries(response.headers.entries())
                      );
                    }
                  })
                  .catch((fetchError) => {
                    console.error("❌ Failed to check audio file:", fetchError);
                  });
              }

              // Continue with video-only playback on audio error
              console.log("🎬 Continuing with video-only playback");
            }}
            onEnded={() => {
              console.log("Audio playback completed");
              const video = videoRef.current;
              if (video && !video.paused) {
                video.pause(); // Stop video when audio ends
              }
              setIsPlaying(false);
              // Call onEnded callback when audio ends (this is the real end)
              if (onEnded) {
                onEnded();
              }
            }}
          />
        )}

        {/* Show helpful message */}
        {!isPlaying && (
          <div className="absolute bottom-3 left-2 bg-black/60 text-white p-3 rounded-lg text-xs backdrop-blur-sm border border-white/20">
            {autoPlay
              ? "🔒 Click play to start (autoplay blocked)"
              : "Click play to begin"}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoWithAudio;
