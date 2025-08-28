"use client";

import React, { useState } from "react";
import ShaderBackground from "../../components/ShaderBackground";
import ConceptInputForm from "../../components/ConceptInputForm";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

const page = () => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState<"single" | "lessons">("single");
  const router = useRouter();

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar showBackButton={true} backPath="/" />

        <main className="flex-1 flex flex-col w-full">
          <div className="flex-1 flex flex-col justify-center w-full">
            {/* Mode Selector */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
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
                  Single Video
                </button>
                <button
                  onClick={() => setMode("lessons")}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    mode === "lessons"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Lesson Series
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
                  // Redirect to loading screen with topic and mode in query params
                  router.push(
                    `/loading?topic=${encodeURIComponent(trimmed)}&mode=${mode}`
                  );
                }
              }}
              mode={mode}
            />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ShaderBackground>
  );
};

export default page;
