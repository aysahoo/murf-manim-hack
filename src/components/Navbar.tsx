import React from "react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  showBackButton?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showBackButton = false }) => {
  const router = useRouter();

  return (
    <nav className="px-8 py-6">
      <div className="w-full flex justify-center">
        <div className="flex justify-between items-center h-16 w-full">
          {showBackButton && (
            <button
              onClick={() => router.push("/explain")}
              className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center transition-colors hover:bg-gray-800 cursor-pointer"
              aria-label="Go back"
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
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          {!showBackButton && <div className="w-8"></div>}

          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 tracking-tight">
              <span className="inline-flex items-center gap-2">
                Mona
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-pink-500 inline-block align-middle"
                  aria-label="heart"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </h1>
          </div>

          <div className="w-8"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
