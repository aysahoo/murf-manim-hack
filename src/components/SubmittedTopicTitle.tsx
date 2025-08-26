"use client";

import React from "react";
import { motion } from "motion/react";

type SubmittedTopicTitleProps = {
  topic: string;
};

const SubmittedTopicTitle: React.FC<SubmittedTopicTitleProps> = ({ topic }) => {
  return (
    <motion.div
      className="flex justify-center"
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
    </motion.div>
  );
};

export default SubmittedTopicTitle;
