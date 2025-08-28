"use client";

import React from "react";
import { motion } from "motion/react";

type SubmittedTopicTitleProps = {
  topic: string;
  mode?: "single" | "lessons";
};

const SubmittedTopicTitle: React.FC<SubmittedTopicTitleProps> = ({ topic, mode = "single" }) => {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.h1
        className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-gray-900 tracking-tight text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        {topic}
      </motion.h1>
      {mode === "lessons" && (
        <motion.div
          className="mt-2 px-4 py-1 bg-purple-100/60 backdrop-blur-sm rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <span className="text-sm font-medium text-purple-700">Lesson Series</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SubmittedTopicTitle;
