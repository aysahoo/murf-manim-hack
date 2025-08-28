"use client";

import React from "react";
import ShaderBackground from "../../components/ShaderBackground";
import VideoWithAudio from "../../components/VideoWithAudio";
import Footer from "../../components/Footer";

interface Example {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  audioUrl?: string;
  description: string;
}

const examples: Example[] = [
  // General Topics
  {
    id: "topic-scene",
    title: "Topic Scene",
    category: "General",
    videoUrl: "/videos/TopicScene.mp4",
    description: "General topic explanation scene",
  },
  {
    id: "part1",
    title: "Part 1",
    category: "General",
    videoUrl: "/videos/Part1.mp4",
    description: "First part of the explanation series",
  },
  {
    id: "part2",
    title: "Part 2",
    category: "General",
    videoUrl: "/videos/Part2.mp4",
    description: "Second part of the explanation series",
  },
  {
    id: "part3",
    title: "Part 3",
    category: "General",
    videoUrl: "/videos/Part3.mp4",
    description: "Third part of the explanation series",
  },

  // Data Structures - Dictionaries
  {
    id: "dictionaries-part1",
    title: "Dictionaries - Part 1",
    category: "Data Structures",
    videoUrl: "/videos/TopicScene.mp4", // Using general video as fallback
    audioUrl: "/audio/dictionaries_part_1_1756360603843.mp3",
    description: "Introduction to dictionary data structures",
  },
  {
    id: "dictionaries-part2",
    title: "Dictionaries - Part 2",
    category: "Data Structures",
    videoUrl: "/videos/TopicScene.mp4", // Using general video as fallback
    audioUrl: "/audio/dictionaries_part_2_1756360648854.mp3",
    description: "Advanced dictionary operations and use cases",
  },

  // Data Structures - Trees
  {
    id: "trees-1",
    title: "Trees - Concept 1",
    category: "Data Structures",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/trees_1756360606536.mp3",
    description: "Understanding tree data structures",
  },
  {
    id: "trees-2",
    title: "Trees - Concept 2",
    category: "Data Structures",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/trees_1756360625602.mp3",
    description: "Tree traversal algorithms",
  },
  {
    id: "trees-3",
    title: "Trees - Concept 3",
    category: "Data Structures",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/trees_1756360627385.mp3",
    description: "Binary search trees and balancing",
  },
  {
    id: "trees-4",
    title: "Trees - Concept 4",
    category: "Data Structures",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/trees_1756360638707.mp3",
    description: "Advanced tree operations",
  },
  {
    id: "trees-5",
    title: "Trees - Concept 5",
    category: "Data Structures",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/trees_1756360653070.mp3",
    description: "Tree applications and implementations",
  },
  {
    id: "trees-6",
    title: "Trees - Concept 6",
    category: "Data Structures",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/trees_1756360665445.mp3",
    description: "Specialized tree structures",
  },
  {
    id: "trees-7",
    title: "Trees - Concept 7",
    category: "Data Structures",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/trees_1756360665927.mp3",
    description: "Tree optimization techniques",
  },

  // Algorithms - Graphs
  {
    id: "graphs-part1",
    title: "Graphs - Part 1",
    category: "Algorithms",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/graphs_part_1_1756367275763.mp3",
    description: "Introduction to graph theory and representations",
  },
  {
    id: "graphs-part2",
    title: "Graphs - Part 2",
    category: "Algorithms",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/graphs_part_2_1756367300296.mp3",
    description: "Graph traversal algorithms",
  },
  {
    id: "graphs-part3",
    title: "Graphs - Part 3",
    category: "Algorithms",
    videoUrl: "/videos/TopicScene.mp4",
    audioUrl: "/audio/graphs_part_3_1756367341361.mp3",
    description: "Advanced graph algorithms and applications",
  },
];

const categories = [
  "All",
  ...Array.from(new Set(examples.map((example) => example.category))),
];

const LibraryPage = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredExamples =
    selectedCategory === "All"
      ? examples
      : examples.filter((example) => example.category === selectedCategory);

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-medium text-gray-800">
              Mona
            </h2>
            <a
              href="/explain"
              className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-800 hover:scale-110 cursor-pointer shadow-lg"
              title="Create New Explanation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19V5" />
              </svg>
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-6 md:px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto w-full pb-16">
          {/* Header Section */}
          <div className="py-6 md:py-8 lg:py-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-gray-900 tracking-tight max-w-4xl">
              Example Library
            </h1>
            <p className="text-base md:text-lg text-gray-600 mt-3 md:mt-4 max-w-3xl leading-relaxed">
              Explore our collection of Manim-generated educational videos and
              interactive explanations across different topics and categories.
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-black text-white shadow-lg scale-105"
                      : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 hover:shadow-md border border-white/50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Examples Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredExamples.map((example) => (
              <div
                key={example.id}
                className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/50"
              >
                {/* Video Preview */}
                <div className="aspect-[16/9] bg-gray-900 relative overflow-hidden">
                  <VideoWithAudio
                    videoUrl={example.videoUrl}
                    audioUrl={example.audioUrl}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </div>

                {/* Content */}
                <div className="p-4 md:p-4">
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 bg-purple-200 text-purple-500 text-xs font-medium rounded-full">
                      {example.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {example.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {example.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredExamples.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No examples found
              </h3>
              <p className="text-gray-600">
                Try selecting a different category or check back later for new
                content.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ShaderBackground>
  );
};

export default LibraryPage;
