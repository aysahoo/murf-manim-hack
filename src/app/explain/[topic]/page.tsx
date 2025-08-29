"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ShaderBackground from "../../../components/ShaderBackground";
import SubmittedTopicTitle from "../../../components/SubmittedTopicTitle";
import Navbar from "../../../components/Navbar";
import VideoWithAudio from "../../../components/VideoWithAudio";
import LessonBreakdown from "../../../components/LessonBreakdown";
import Footer from "../../../components/Footer";

interface Lesson {
  part: number;
  script: string;
  manim_code: string;
  videoUrl?: string;
  audioUrl?: string;
  voiceScript?: string;
  executionSuccess?: boolean;
}

const TopicPageContent = () => {
  const params = useParams<{ topic: string }>();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "single";

  // Single video mode state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Lesson mode state
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Common state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const topic = Array.isArray(params.topic)
    ? decodeURIComponent(params.topic[0])
    : decodeURIComponent(params.topic || "");

  console.log("TopicPage component loaded, topic:", topic);

  useEffect(() => {
    console.log("useEffect triggered, topic:", topic, "mode:", mode);

    // Check for lesson data first
    if (mode === "lessons") {
      const storedLessons = sessionStorage.getItem("generatedLessons");
      if (storedLessons) {
        try {
          const data = JSON.parse(storedLessons);
          console.log("Using stored lesson data:", data);

          setLessons(data.lessons || []);
          setLoading(false);

          // Clear the stored data
          sessionStorage.removeItem("generatedLessons");
          return;
        } catch (error) {
          console.error("Error parsing stored lesson data:", error);
          sessionStorage.removeItem("generatedLessons");
        }
      }
    } else {
      // Check for video data (existing logic)
      const storedData = sessionStorage.getItem("generatedVideo");
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          console.log("Using stored video data:", data);

          setVideoUrl(data.videoUrl);
          setAudioUrl(data.audioUrl);
          setLoading(false);

          // Clear the stored data
          sessionStorage.removeItem("generatedVideo");
          return;
        } catch (error) {
          console.error("Error parsing stored data:", error);
          sessionStorage.removeItem("generatedVideo");
        }
      }
    }

    const generateContent = async () => {
      try {
        setLoading(true);
        setError(null);

        if (mode === "lessons") {
          console.log("Generating lessons for topic:", topic);

          const res = await fetch("/api/generate-lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
          });

          const data = await res.json();
          console.log("Lesson API response:", data);

          if (data && data.lessons && Array.isArray(data.lessons)) {
            console.log("Setting lessons data:", data.lessons);
            // Log each lesson's video URL for debugging
            data.lessons.forEach((lesson: Lesson, index: number) => {
              console.log(`Lesson ${index + 1} videoUrl:`, lesson.videoUrl);
            });
            setLessons(data.lessons);
            setLoading(false);
            return;
          } else {
            throw new Error("Invalid lesson data received");
          }
        } else {
          console.log("Generating video for topic:", topic);

          const res = await fetch("/api/generate-manim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, includeVoice: true }),
          });

          const data = await res.json();
          console.log("API response data:", data);

          // Check if we have video files regardless of success flag
          if (data.videoFiles && data.videoFiles.length > 0) {
            const videoFile = data.videoFiles[0];
            // Use the path directly as it's already a blob storage URL
            const videoUrl = videoFile.path;

            console.log("Setting video URL:", videoUrl);
            setVideoUrl(videoUrl);

            // Set audio data if available
            if (data.voiceData) {
              setAudioUrl(data.voiceData.audioUrl);
              console.log("Setting audio URL:", data.voiceData.audioUrl);
            }

            setLoading(false);
            return;
          }

          // If no video files, try using the videoUrls
          if (data.videoUrls && data.videoUrls.length > 0) {
            console.log("Using videoUrls:", data.videoUrls[0]);
            setVideoUrl(data.videoUrls[0]);

            // Set audio data if available
            if (data.voiceData) {
              setAudioUrl(data.voiceData.audioUrl);
              console.log("Setting audio URL:", data.voiceData.audioUrl);
            }

            setLoading(false);
            return;
          }

          // If no video was generated, show error message
          console.warn("No video generated");
          setError("Video generation completed but no video file was created. Please try again.");
        }
      } catch (error) {
        console.error("Error generating content:", error);

        if (mode === "lessons") {
          setError("Failed to generate lesson breakdown. Please check your API configuration and try again.");
        } else {
          setError("Failed to generate video. Please check your API configuration and try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      generateContent();
    }
  }, [topic, mode]);

  const regenerateVideo = async () => {
    window.location.reload(); // Simple refresh to regenerate
  };

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar showBackButton={true} />
        <main className="flex-1 flex flex-col w-full">
          <SubmittedTopicTitle
            topic={topic}
            mode={mode as "single" | "lessons"}
          />
          <div className="mt-10 flex justify-center px-6">
            <div className="max-w-5xl w-full">
              {loading && (
                <div className="text-center text-gray-700">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="mt-4">
                    {mode === "lessons"
                      ? "Generating your lesson breakdown..."
                      : "Loading your generated content..."}
                  </p>
                </div>
              )}

              {!loading && error && (
                <div className="text-center text-red-600 mb-4">
                  <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                  </div>
                  <button
                    onClick={regenerateVideo}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full transition-colors"
                  >
                    🔄 Try Again
                  </button>
                </div>
              )}

              {/* Lesson Mode */}
              {mode === "lessons" && lessons.length > 0 && !loading && (
                <LessonBreakdown
                  lessons={lessons}
                  topic={topic}
                  className="w-full"
                />
              )}

              {/* Single Video Mode */}
              {mode === "single" && videoUrl && !loading && (
                <div className="max-w-3xl mx-auto">
                  <VideoWithAudio
                    videoUrl={videoUrl}
                    audioUrl={audioUrl || undefined}
                    className="w-full rounded-2xl"
                    autoPlay={false}
                    onEnded={() => {}}
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ShaderBackground>
  );
};

const TopicPage = () => {
  return (
    <Suspense
      fallback={
        <ShaderBackground>
          <div className="relative z-10 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col justify-center items-center w-full">
              <div className="text-center space-y-8">
                <div className="text-2xl text-gray-900">Loading...</div>
              </div>
            </main>
            <Footer />
          </div>
        </ShaderBackground>
      }
    >
      <TopicPageContent />
    </Suspense>
  );
};

export default TopicPage;
