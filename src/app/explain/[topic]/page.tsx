"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import ShaderBackground from "../../../components/ShaderBackground";
import SubmittedTopicTitle from "../../../components/SubmittedTopicTitle";
import Navbar from "../../../components/Navbar";

const TopicPage = () => {
  const params = useParams<{ topic: string }>();

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
            <div className="max-w-3xl w-full">
              <video
                src="/StringTheoryExplanation.mp4"
                controls
                className="w-full rounded-2xl"
                autoPlay
                muted
              />
            </div>
          </div>
        </main>
      </div>
    </ShaderBackground>
  );
};

export default TopicPage;
