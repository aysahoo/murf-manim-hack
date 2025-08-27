"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import ShaderBackground from "../../components/ShaderBackground";
import Navbar from "../../components/Navbar";

interface ManimResponse {
  topic: string;
  manimCode: string;
  generationMethod: string;
  execution: any;
  sandboxFiles: any[];
  videoFiles: any[];
  videoUrls: string[];
  success: boolean;
}

// Counter Component
const CounterAnimation = ({
  onComplete,
  isGenerating,
  hasResult,
}: {
  onComplete: () => void;
  isGenerating: boolean;
  hasResult: boolean;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (hasResult) {
      // If we have a result, quickly animate to 100%
      setCount(100);
      setTimeout(() => {
        onComplete();
      }, 500);
      return;
    }

    if (isGenerating) {
      // While generating, show a slower animation up to 90%
      const duration = 3000; // 3 seconds to reach 90%
      const interval = 50;
      const steps = duration / interval;
      const increment = 90 / steps;

      const timer = setInterval(() => {
        setCount((prevCount) => {
          const newCount = prevCount + increment;
          if (newCount >= 90) {
            clearInterval(timer);
            return 90;
          }
          return newCount;
        });
      }, interval);

      return () => {
        clearInterval(timer);
      };
    } else {
      // If not generating and no result, stay at 0 or animate slowly
      const timer = setInterval(() => {
        setCount((prevCount) => {
          if (prevCount < 10) {
            return prevCount + 0.5;
          }
          return prevCount;
        });
      }, 100);

      return () => {
        clearInterval(timer);
      };
    }
  }, [onComplete, isGenerating, hasResult]);

  return (
    <motion.h1
      className="text-6xl text-gray-900 h-20 flex items-center justify-center"
      style={{ fontFamily: "var(--font-instrument-serif)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.span>{Math.round(count)}%</motion.span>
    </motion.h1>
  );
};

// Animated Heart Component with Pulse Only
const AnimatedHeart = () => {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Main Heart with smooth scale animation */}
      <div className="relative">
        <motion.svg
          className="w-32 h-32 text-pink-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </motion.svg>
      </div>
    </motion.div>
  );
};

const LoadingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [manimData, setManimData] = useState<ManimResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleComplete = () => {
    // Only complete if we have successful data or an error
    if (manimData?.success || error) {
      setIsAnimationComplete(true);
    }
  };

  // Generate Manim content when component mounts
  useEffect(() => {
    if (topic && !manimData && !error) {
      generateManimContent();
    }
  }, [topic, manimData, error]);

  const generateManimContent = async () => {
    setIsGenerating(true);
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
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isAnimationComplete) {
      if (topic) {
        router.push(`/explain/${encodeURIComponent(topic)}`);
      } else {
        router.push("/explain");
      }
    }
  }, [isAnimationComplete, topic, router]);

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
                isGenerating={isGenerating}
                hasResult={!!manimData || !!error}
              />

              {/* Status message */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {isGenerating && (
                  <p className="text-gray-600 text-lg">
                    Generating Manim animation for "{topic}"...
                  </p>
                )}
                {manimData?.success && !isAnimationComplete && (
                  <p className="text-green-600 text-lg font-medium">
                    Animation ready! Redirecting...
                  </p>
                )}
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-red-800 text-sm">{error}</p>
                  <button
                    onClick={generateManimContent}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Retrying..." : "Retry"}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ShaderBackground>
  );
};

export default LoadingPage;
