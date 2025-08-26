"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import ShaderBackground from "../../components/ShaderBackground";
import Navbar from "../../components/Navbar";

// Counter Component
const CounterAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Animation duration: 5 seconds
    const duration = 5000;
    // Update interval: 50ms (smooth animation)
    const interval = 50;
    // Calculate steps needed
    const steps = duration / interval;
    // Calculate increment per step
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setCount((prevCount) => {
        const newCount = prevCount + increment;
        // If counter reaches 100%, trigger the onComplete callback
        if (newCount >= 100) {
          clearInterval(timer);
          onComplete();
          return 100;
        }
        return newCount;
      });
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [onComplete]);

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

  const handleComplete = () => {
    setIsAnimationComplete(true);
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
              {/* Animated Heart */}
              <div className="mb-8">
                <AnimatedHeart />
              </div>

              {/* Counter animation */}
              <CounterAnimation onComplete={handleComplete} />
            </div>
          </div>
        </main>
      </div>
    </ShaderBackground>
  );
};

export default LoadingPage;
