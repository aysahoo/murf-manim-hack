"use client";

import React from "react";
import { motion } from "motion/react";

interface ContentModeSelectorProps {
  mode: "video" | "article";
  onModeChange: (mode: "video" | "article") => void;
  className?: string;
}

const ContentModeSelector: React.FC<ContentModeSelectorProps> = ({
  mode,
  onModeChange,
  className = "",
}) => {
  return (
    <motion.div
      className={`flex justify-center mb-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="bg-gray-100/60 backdrop-blur-sm rounded-full p-1 flex">
        <button
          onClick={() => onModeChange("video")}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            mode === "video"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          Video Mode
        </button>
        <button
          onClick={() => onModeChange("article")}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            mode === "article"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg
            width="16"
            height="16"
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
          Article Mode
        </button>
      </div>
    </motion.div>
  );
};

export default ContentModeSelector;