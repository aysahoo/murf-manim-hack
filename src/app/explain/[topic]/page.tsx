"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import ShaderBackground from "../../../components/ShaderBackground";
import SubmittedTopicTitle from "../../../components/SubmittedTopicTitle";
import Navbar from "../../../components/Navbar";

const TopicPage = () => {
  const params = useParams<{ topic: string }>();
  const router = useRouter();
  const topic = Array.isArray(params.topic)
    ? decodeURIComponent(params.topic[0])
    : decodeURIComponent(params.topic || "");

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar showBackButton={true} />
        <main className="flex-1 flex flex-col w-full">
          <SubmittedTopicTitle topic={topic} />
          <div className="mt-10 flex justify-center px-6">
            <div className="max-w-3xl w-full bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <p className="text-gray-800">
                We'll generate a manim explanation for the topic above. This is
                the post-submit view. Add progress, results, and actions here.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ShaderBackground>
  );
};

export default TopicPage;
