import React from "react";
import Link from "next/link";
import ShaderBackground from "../components/ShaderBackground";
import Footer from "../components/Footer";

const page = () => {
  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium text-gray-800">Mona</h2>
            <Link
              href="/explain"
              className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center transition-colors hover:bg-gray-800 cursor-pointer"
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
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="py-16 md:py-24">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-gray-900 tracking-tight max-w-4xl">
              <span className="inline-flex items-center gap-2">
                Mona
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-6 h-6 text-pink-500 inline-block align-middle"
                  aria-label="heart"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span>
                {" "}
                is a <span className="text-gray-600">manim</span> video
              </span>
              <br className="hidden md:block" /> generator & explainer:
            </h1>

            {/* Service Cards */}
            <div className="flex flex-wrap gap-4 mt-10">
              <div className="bg-blue-100/40 px-4 py-2 rounded-full">
                <span className="text-sm md:text-base text-gray-800">
                  Concept Explanation
                </span>
              </div>
              <div className="bg-yellow-50/40 px-4 py-2 rounded-full">
                <span className="text-sm md:text-base text-gray-800">
                  Animated Visualizations
                </span>
              </div>
            </div>
          </div>

          {/*Works Section */}
          <div className="pb-12 md:pb-24">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-medium text-gray-800">
                Featured Work
              </h2>
              <Link
                href="/library"
                className="bg-black text-white px-5 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                View All
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {/* Portfolio grid would go here */}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ShaderBackground>
  );
};

export default page;
