"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ShaderBackground from "../../../components/ShaderBackground";
import SubmittedTopicTitle from "../../../components/SubmittedTopicTitle";
import Navbar from "../../../components/Navbar";
import VideoWithAudio from "../../../components/VideoWithAudio";
import LessonBreakdown from "../../../components/LessonBreakdown";
import EnhancedLessonBreakdown from "../../../components/EnhancedLessonBreakdown";
import ArticleDisplay from "../../../components/ArticleDisplay";
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

interface ArticleSection {
  title: string;
  content: string;
}

interface Article {
  title: string;
  introduction: string;
  sections: ArticleSection[];
  conclusion: string;
  audioUrl?: string;
}

interface LessonArticle extends Article {
  part: number;
}

const TopicPageContent = () => {
  const params = useParams<{ topic: string }>();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "single";

  // Auto-generate articles after videos load
  const [showArticles, setShowArticles] = useState<boolean>(false);

  // Single video mode state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Single article mode state
  const [article, setArticle] = useState<Article | null>(null);

  // Lesson mode state
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Common state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [articleLoading, setArticleLoading] = useState<boolean>(false);

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

          if (data.success && data.videoUrl) {
            console.log("Setting video URL:", data.videoUrl);
            setVideoUrl(data.videoUrl);

            if (data.voiceData) {
              setAudioUrl(data.voiceData.audioUrl);
              console.log("Setting audio URL:", data.voiceData.audioUrl);
            }
            setLoading(false);
            return;
          } else {
            // If nothing works, set an error
            console.warn("No video generated or API call failed.", data.error);
            setError(data.error || "Video generation failed.");
          }
        }
      } catch (error) {
        console.error("Error generating content:", error);

        if (mode === "lessons") {
          setError("Failed to generate lesson breakdown.");
        } else {
          setError("Failed to generate video.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      generateContent();
    }
  }, [topic, mode]);

  // Auto-generate articles for single mode after video is loaded
  useEffect(() => {
    if (
      !loading &&
      !articleLoading &&
      !article &&
      mode === "single" &&
      videoUrl
    ) {
      // Auto-generate article after a short delay
      const timer = setTimeout(() => {
        generateArticle();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, mode, videoUrl, article, articleLoading]);

  const generateArticle = async () => {
    setArticleLoading(true);
    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          length: "medium",
          style: "educational",
          includeAudio: true,
          voiceId: "en-US-natalie",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setArticle({
          title: data.title,
          introduction: data.introduction,
          sections: data.sections,
          conclusion: data.conclusion,
          audioUrl: data.audioUrl,
        });
      } else {
        throw new Error("Failed to generate article");
      }
    } catch (error) {
      console.error("Error generating article:", error);
      setError("Failed to generate article");
    } finally {
      setArticleLoading(false);
    }
  };

  const regenerateVideo = async () => {
    window.location.reload(); // Simple refresh to regenerate
  };

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar showBackButton={true} hideCreateButtons={true} />
        <main className="flex-1 flex flex-col w-full">
          <SubmittedTopicTitle
            topic={topic}
            mode={mode as "single" | "lessons"}
          />

          <div className="mt-6 flex justify-center px-6">
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

              {/* Video Content */}
              {!loading && (
                <>
                  {/* Lesson Video Mode with Integrated Articles */}
                  {mode === "lessons" && lessons.length > 0 && (
                    <EnhancedLessonBreakdown
                      lessons={lessons}
                      topic={topic}
                      className="w-full"
                    />
                  )}

                  {/* Single Video Mode */}
                  {mode === "single" && videoUrl && (
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
                </>
              )}

              {/* Article Section - Only for single mode (lessons have integrated articles) */}
              {!loading && mode === "single" && (
                <div className="mt-16">
                  {/* Section Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-serif font-medium text-black mb-2">
                      Written Explanation
                    </h2>
                    <p className="text-gray-600">
                      Comprehensive article with voice narration
                    </p>
                    <div className="w-16 h-0.5 bg-pink-500 mx-auto mt-4"></div>
                  </div>

                  {/* Article Loading State */}
                  {articleLoading && (
                    <div className="text-center text-gray-700 mb-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
                      <p className="mt-2 text-sm">Generating article...</p>
                    </div>
                  )}

                  {/* Single Article */}
                  {article && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                      <ArticleDisplay
                        title={article.title}
                        introduction={article.introduction}
                        sections={article.sections}
                        conclusion={article.conclusion}
                        audioUrl={article.audioUrl}
                        className="max-w-none"
                      />
                    </div>
                  )}

                  {/* Generate Article Button */}
                  {!article && !articleLoading && (
                    <div className="text-center">
                      <button
                        onClick={generateArticle}
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
                        Generate Article
                      </button>
                    </div>
                  )}
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
