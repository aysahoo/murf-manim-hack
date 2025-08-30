"use client";

import React, { useState } from "react";
import ShaderBackground from "../../components/ShaderBackground";
import ConceptInputForm from "../../components/ConceptInputForm";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

const ArticlePage: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState<"single" | "lessons">("single");
  const router = useRouter();

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar showBackButton={true} backPath="/" hideCreateButtons={true} />

        <main className="flex-1 flex flex-col w-full">
          <div className="flex-1 flex flex-col justify-center w-full">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 tracking-tight mb-4">
                Generate Articles
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Create comprehensive written explanations with optional voice narration
              </p>
            </motion.div>

            {/* Mode Selector */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              <div className="bg-gray-100/60 backdrop-blur-sm rounded-full p-1 flex">
                <button
                  onClick={() => setMode("single")}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    mode === "single"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Single Article
                </button>
                <button
                  onClick={() => setMode("lessons")}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    mode === "lessons"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Article Series
                </button>
              </div>
            </motion.div>

            <ConceptInputForm
              inputValue={inputValue}
              isFocused={isFocused}
              onChange={setInputValue}
              onFocus={setIsFocused}
              onSubmit={() => {
                const trimmed = inputValue.trim();
                if (trimmed) {
                  // Redirect to article view with topic and mode
                  router.push(
                    `/article/${encodeURIComponent(trimmed)}?mode=${mode}`
                  );
                }
              }}
              mode={mode}
            //   placeholder={mode === "single" ? "Enter a topic for your article..." : "Enter a topic for your article series..."}
            />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ShaderBackground>
  );
};

export default ArticlePage;