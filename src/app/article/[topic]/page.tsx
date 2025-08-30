"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ShaderBackground from "../../../components/ShaderBackground";
import SubmittedTopicTitle from "../../../components/SubmittedTopicTitle";
import Navbar from "../../../components/Navbar";
import ArticleDisplay from "../../../components/ArticleDisplay";
import LessonArticleDisplay from "../../../components/LessonArticleDisplay";
import Footer from "../../../components/Footer";

interface ArticleSection {
    title: string;
    content: string;
}

interface Article {
    title: string;
    introduction: string;
    sections: ArticleSection[];
    conclusion: string;
    audioUrl?: string;
}

interface LessonArticle extends Article {
    part: number;
}

const ArticleTopicPageContent = () => {
    const params = useParams<{ topic: string }>();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "single";

    // Single article mode state
    const [article, setArticle] = useState<Article | null>(null);

    // Lesson article mode state
    const [lessonArticles, setLessonArticles] = useState<LessonArticle[]>([]);

    // Common state
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const topic = Array.isArray(params.topic)
        ? decodeURIComponent(params.topic[0])
        : decodeURIComponent(params.topic || "");

    console.log("ArticleTopicPage component loaded, topic:", topic, "mode:", mode);

    useEffect(() => {
        const generateArticleContent = async () => {
            try {
                setLoading(true);
                setError(null);

                if (mode === "lessons") {
                    console.log("Generating lesson articles for topic:", topic);

                    // Generate multiple articles for lesson series
                    const lessonCount = 5; // Default number of lessons
                    const articlePromises = Array.from({ length: lessonCount }, async (_, index) => {
                        const partNumber = index + 1;
                        const res = await fetch("/api/generate-article", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                topic: `${topic} - Part ${partNumber}`,
                                length: "short",
                                style: "educational",
                                includeAudio: true,
                                voiceId: "en-US-natalie"
                            }),
                        });

                        const data = await res.json();
                        if (data.success) {
                            return {
                                part: partNumber,
                                title: data.title,
                                introduction: data.introduction,
                                sections: data.sections,
                                conclusion: data.conclusion,
                                audioUrl: data.audioUrl,
                            } as LessonArticle;
                        }
                        return null;
                    });

                    const results = await Promise.all(articlePromises);
                    const validArticles = results.filter((article): article is LessonArticle => article !== null);

                    console.log("Generated lesson articles:", validArticles);
                    setLessonArticles(validArticles);
                } else {
                    console.log("Generating single article for topic:", topic);

                    const res = await fetch("/api/generate-article", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            topic,
                            length: "medium",
                            style: "educational",
                            includeAudio: true,
                            voiceId: "en-US-natalie"
                        }),
                    });

                    const data = await res.json();
                    console.log("Article API response:", data);

                    if (data.success) {
                        setArticle({
                            title: data.title,
                            introduction: data.introduction,
                            sections: data.sections,
                            conclusion: data.conclusion,
                            audioUrl: data.audioUrl,
                        });
                    } else {
                        throw new Error("Failed to generate article");
                    }
                }
            } catch (error) {
                console.error("Error generating article content:", error);
                setError("Failed to generate article content.");
            } finally {
                setLoading(false);
            }
        };

        if (topic) {
            generateArticleContent();
        }
    }, [topic, mode]);

    const regenerateArticle = async () => {
        window.location.reload(); // Simple refresh to regenerate
    };

    return (
        <ShaderBackground>
            <div className="relative z-10 min-h-screen flex flex-col">
                <Navbar showBackButton={true} hideCreateButtons={true} />
                <main className="flex-1 flex flex-col w-full">
                    <SubmittedTopicTitle
                        topic={topic}
                        mode={mode as "single" | "lessons"}
                    />

                    <div className="mt-10 flex justify-center px-6">
                        <div className="max-w-5xl w-full">
                            {loading && (
                                <div className="text-center text-gray-700">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                                    <p className="mt-4">
                                        {mode === "lessons"
                                            ? "Generating your article series..."
                                            : "Generating your article..."}
                                    </p>
                                </div>
                            )}

                            {!loading && error && (
                                <div className="text-center text-red-600 mb-4">
                                    <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
                                        <p className="font-semibold">Error:</p>
                                        <p>{error}</p>
                                    </div>
                                    <button
                                        onClick={regenerateArticle}
                                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full transition-colors"
                                    >
                                        🔄 Try Again
                                    </button>
                                </div>
                            )}

                            {/* Lesson Article Mode */}
                            {mode === "lessons" && lessonArticles.length > 0 && !loading && (
                                <LessonArticleDisplay
                                    articles={lessonArticles}
                                    topic={topic}
                                    className="w-full"
                                />
                            )}

                            {/* Single Article Mode */}
                            {mode === "single" && article && !loading && (
                                <ArticleDisplay
                                    title={article.title}
                                    introduction={article.introduction}
                                    sections={article.sections}
                                    conclusion={article.conclusion}
                                    audioUrl={article.audioUrl}
                                    className="w-full"
                                />
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </ShaderBackground>
    );
};

const ArticleTopicPage = () => {
    return (
        <Suspense
            fallback={
                <ShaderBackground>
                    <div className="relative z-10 min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-1 flex flex-col justify-center items-center w-full">
                            <div className="text-center space-y-8">
                                <div className="text-2xl text-gray-900">Loading...</div>
                            </div>
                        </main>
                        <Footer />
                    </div>
                </ShaderBackground>
            }
        >
            <ArticleTopicPageContent />
        </Suspense>
    );
};

export default ArticleTopicPage;