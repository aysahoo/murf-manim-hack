"use client";

import React, { useState } from "react";
import ShaderBackground from "../../components/ShaderBackground";
import ConceptInputForm from "../../components/ConceptInputForm";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";

const page = () => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  return (
    <ShaderBackground>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 flex flex-col w-full">
          <div className="flex-1 flex flex-col justify-center w-full">
            <ConceptInputForm
              inputValue={inputValue}
              isFocused={isFocused}
              onChange={setInputValue}
              onFocus={setIsFocused}
              onSubmit={() => {
                const trimmed = inputValue.trim();
                if (trimmed) {
                  router.push(`/explain/${encodeURIComponent(trimmed)}`);
                }
              }}
            />
          </div>
        </main>
      </div>
    </ShaderBackground>
  );
};

export default page;
