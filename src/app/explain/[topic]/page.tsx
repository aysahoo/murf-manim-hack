"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ShaderBackground from "../../../components/ShaderBackground";
import SubmittedTopicTitle from "../../../components/SubmittedTopicTitle";
import Navbar from "../../../components/Navbar";

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

const TopicPage = () => {
  const params = useParams<{ topic: string }>();
  const router = useRouter();
  const [manimData, setManimData] = useState<ManimResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topic = Array.isArray(params.topic)
    ? decodeURIComponent(params.topic[0])
    : decodeURIComponent(params.topic || "");

  useEffect(() => {
    // Try to retrieve Manim data from localStorage
    const storedData = localStorage.getItem(
      `manim_${encodeURIComponent(topic)}`
    );

    if (storedData) {
      try {
        const parsedData: ManimResponse = JSON.parse(storedData);
        setManimData(parsedData);
      } catch (err) {
        console.error("Error parsing stored Manim data:", err);
        setError("Failed to load animation data");
      }
    } else {
      setError(
        "No animation data found. Please try generating the animation again."
      );
    }

    setLoading(false);
  }, [topic]);

  const handleRetry = () => {
    // Clear the stored data and redirect to explain page
    localStorage.removeItem(`manim_${encodeURIComponent(topic)}`);
    router.push("/explain");
  };

  if (loading) {
    return (
      <ShaderBackground>
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar showBackButton={true} />
          <main className="flex-1 flex flex-col w-full">
            <SubmittedTopicTitle topic={topic} />
            <div className="mt-10 flex justify-center px-6">
              <div className="max-w-3xl w-full flex items-center justify-center">
                <div className="text-gray-600">Loading animation...</div>
              </div>
            </div>
          </main>
        </div>
      </ShaderBackground>
    );
  }

  if (error) {
    return (
      <ShaderBackground>
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar showBackButton={true} />
          <main className="flex-1 flex flex-col w-full">
            <SubmittedTopicTitle topic={topic} />
            <div className="mt-10 flex justify-center px-6">
              <div className="max-w-3xl w-full">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-800 mb-4">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Generate Animation
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ShaderBackground>
    );
  }

  const videoUrl = manimData?.videoUrls?.[0] || "/StringTheoryExplanation.mp4";

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar showBackButton={true} />
        <main className="flex-1 flex flex-col w-full">
          <SubmittedTopicTitle topic={topic} />

          <div className="mt-10 flex justify-center px-6">
            <div className="max-w-3xl w-full">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-2xl"
                autoPlay
                muted
              />
              {manimData?.videoUrls && manimData.videoUrls.length > 1 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Additional Videos:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {manimData.videoUrls.slice(1).map((url, index) => (
                      <video
                        key={index}
                        src={url}
                        controls
                        className="w-48 h-32 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ShaderBackground>
  );
};

export default TopicPage;
