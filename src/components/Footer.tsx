import React from "react";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full py-8 px-8 md:px-16 lg:px-24 max-w-7xl mx-auto font-serif text-base md:text-lg">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Made with love section */}
        <div className="flex items-center gap-2 text-gray-700">
          <span className="">Made with</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-pink-500"
            aria-label="heart"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span className="">by our team</span>
        </div>

        {/* Team members */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <a
              href="https://ayushh.xyz"
              className="hover:text-pink-500 transition-colors text-gray-700"
              style={{ fontSize: "1rem" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ayush R. Sahoo
            </a>
            <span className="text-gray-400 text-lg">•</span>
            <a
              href="https://www.linkedin.com/in/ayush-mishra-0a16542a4/"
              className="hover:text-pink-500 transition-colors text-gray-700"
              style={{ fontSize: "1rem" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ayush Mishra
            </a>
            <span className="text-gray-400 text-lg">•</span>
            <a
              href="https://ankit-two.vercel.app/"
              className="hover:text-pink-500 transition-colors text-gray-700"
              style={{ fontSize: "1rem" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ankit Kumar
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
