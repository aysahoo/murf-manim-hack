"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import ShaderBackground from "../../components/ShaderBackground";
import Navbar from "../../components/Navbar";

interface ManimResponse {
  topic: string;
  manimCode: string;
  generationMethod: string;
  execution: { logs: string[]; error: string | null; results: unknown[] };
  sandboxFiles: Array<{
    name: string;
    type: string;
    size?: number;
    modifiedTime?: string;
  }>;
  videoFiles: Array<{ path: string; size: number }>;
  videoUrls: string[];
  success: boolean;
}

// Counter Component with Video Generation
const CounterAnimation = ({
  onComplete,
  topic,
  mode,
}: {
  onComplete: () => void;
  topic: string;
  mode: string;
}) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("It's being cooked...");

  useEffect(() => {
    // Prevent duplicate requests
    let isGenerating = false;

    const funMessages =
      mode === "lessons"
        ? [
            "Breaking down the concept...",
            "Creating mini-lessons...",
            "Crafting lesson flow...",
            "Sequencing animations...",
            "Building lesson series...",
            "Structuring content...",
            "Organizing knowledge...",
            "Preparing lesson plan...",
            "Finalizing breakdown...",
            "Almost ready to teach!",
          ]
        : [
            "It's being cooked...",
            "Brewing some magic...",
            "Sparking up neurons...",
            "Painting with math...",
            "Launching animations...",
            "Conjuring visuals...",
            "Choreographing scenes...",
            "Sprinkling stardust...",
            "Setting up the show...",
            "Almost ready to wow you!",
          ];

    // Start generation immediately
    const generateContent = async () => {
      if (isGenerating) {
        console.log(
          "⚠️ Generation already in progress, skipping duplicate request"
        );
        return;
      }

      isGenerating = true;

      try {
        if (mode === "lessons") {
          console.log(`🚀 Starting lesson generation for: ${topic}`);
          // Generate lesson breakdown
          const res = await fetch("/api/generate-lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, includeVoice: true }),
          });

          const data = await res.json();
          console.log("Lesson series response:", data);

          // Store the lessons for the next page
          if (data && data.lessons && Array.isArray(data.lessons)) {
            sessionStorage.setItem(
              "generatedLessons",
              JSON.stringify({
                topic: data.topic,
                lessons: data.lessons,
                mode: "lessons",
              })
            );
          }
        } else {
          // Generate single video (existing logic)
          const res = await fetch("/api/generate-manim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, includeVoice: true }),
          });

          const data = await res.json();
          console.log("Video generation response:", data);

          // Store the result for the next page
          if (data.success && data.videoUrls?.[0]) {
            sessionStorage.setItem(
              "generatedVideo",
              JSON.stringify({
                videoUrl: data.videoUrls[0],
                audioUrl: data.voiceData?.audioUrl,
                script: data.voiceData?.script,
                segments: data.voiceData?.segments,
                mode: "single",
              })
            );
          }
        }
      } catch (error) {
        console.error("Content generation failed:", error);
      } finally {
        isGenerating = false;
      }
    };

    generateContent();

    // Animation duration: 8 seconds (longer for generation)
    const duration = 8000;
    const interval = 80;
    const steps = duration / interval;
    const increment = 100 / steps;

    // Change message every 800ms
    const messageInterval = setInterval(() => {
      setMessage(funMessages[Math.floor(Math.random() * funMessages.length)]);
    }, 800);

    const timer = setInterval(() => {
      setCount((prevCount) => {
        const newCount = prevCount + increment;
        // If counter reaches 100%, trigger the onComplete callback
        if (newCount >= 100) {
          clearInterval(timer);
          clearInterval(messageInterval);
          setMessage("Ready to serve!");
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return newCount;
      });
    }, interval);

    return () => {
      clearInterval(timer);
      clearInterval(messageInterval);
    };
  }, [onComplete, topic, mode]);

  return (
    <div className="text-center">
      <motion.h1
        className="text-6xl text-gray-900 h-20 flex items-center justify-center"
        style={{ fontFamily: "var(--font-instrument-serif)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.span>{Math.round(count)}%</motion.span>
      </motion.h1>
      <motion.p
        className="text-xl text-gray-600 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {message}
      </motion.p>
    </div>
  );
};

const LoadingPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const mode = searchParams.get("mode") || "single";
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [manimData, setManimData] = useState<ManimResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = () => {
    // Only complete if we have successful data or an error
    if (manimData?.success || error) {
      setIsAnimationComplete(true);
    }
  };

  const generateManimContent = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch("/api/generate-manim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate Manim content");
      }

      const data: ManimResponse = await response.json();
      setManimData(data);

      // Store the data in localStorage for the topic page to access
      if (topic) {
        localStorage.setItem(
          `manim_${encodeURIComponent(topic)}`,
          JSON.stringify(data)
        );
      }
    } catch (err) {
      console.error("Error generating Manim content:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  }, [topic]);

  // Generate Manim content when component mounts
  useEffect(() => {
    if (topic && !manimData && !error) {
      generateManimContent();
    }
  }, [topic, manimData, error, generateManimContent]);

  useEffect(() => {
    if (isAnimationComplete) {
      if (topic) {
        router.push(`/explain/${encodeURIComponent(topic)}?mode=${mode}`);
      } else {
        router.push("/explain");
      }
    }
  }, [isAnimationComplete, topic, mode, router]);

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 flex flex-col w-full">
          <div className="flex-1 flex flex-col justify-center items-center w-full">
            <div className="text-center space-y-8">
              {/* Counter animation */}
              <CounterAnimation
                onComplete={handleComplete}
                topic={topic || ""}
                mode={mode}
              />
            </div>
          </div>
        </main>
      </div>
    </ShaderBackground>
  );
};

const LoadingPage = () => {
  return (
    <Suspense
      fallback={
        <ShaderBackground>
          <div className="relative z-10 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col justify-center items-center w-full">
              <div className="text-center space-y-8">
                <motion.h1
                  className="text-6xl text-gray-900 h-20 flex items-center justify-center"
                  style={{ fontFamily: "var(--font-instrument-serif)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  Loading...
                </motion.h1>
              </div>
            </main>
          </div>
        </ShaderBackground>
      }
    >
      <LoadingPageContent />
    </Suspense>
  );
};

export default LoadingPage;
