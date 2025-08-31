import { NextRequest, NextResponse } from "next/server";
import { generateLessonBreakdown } from "@/utils/lessonBreakdown";
import { blobStorage } from "@/utils/blobStorage";
import { executeCodeAndListFiles } from "@/utils/sandbox";
import { generateVoiceNarration } from "@/utils/voiceNarration";
import { validateAndFixManimCode } from "@/utils/structuredManimGenerator";
import { convertEscapedNewlines } from "@/utils/formatManimCode";

async function generateSingleVideo(topic: string, includeVoice: boolean) {
  console.log(`🎬 Starting single video generation for: ${topic}`);

  // 1. Generate a single, detailed "lesson"
  const lessonBreakdown = await generateLessonBreakdown(topic, 1); // Force a single part
  if (!lessonBreakdown || lessonBreakdown.lessons.length === 0) {
    throw new Error("Failed to generate script for the topic.");
  }
  const lesson = lessonBreakdown.lessons[0];
  console.log("📝 Generated script:", lesson.script.substring(0, 150) + "...");

  // 2. Validate and prepare Manim code
  const validatedCode = validateAndFixManimCode(lesson.manim_code);
  const manimCode = convertEscapedNewlines(validatedCode);
  console.log("🤖 Manim code prepared.");

  // 3. Execute Manim code to generate video
  const executionResult = await executeCodeAndListFiles(manimCode);
  if (executionResult.error || executionResult.videoFiles.length === 0) {
    console.error("Manim execution failed:", executionResult.error);
    console.error("Execution logs:", executionResult.execution.logs);
    throw new Error(
      `Manim execution failed. Error: ${
        executionResult.error || "No video produced."
      }`
    );
  }
  console.log("📹 Video file generated:", executionResult.videoFiles[0].path);

  // 4. The video is already uploaded by executeCodeAndListFiles, so we just get the URL.
  const videoUrl = executionResult.videoFiles[0].path;
  console.log("☁️ Video URL retrieved:", videoUrl);

  let voiceData = null;
  if (includeVoice) {
    console.log("🗣️ Generating voice narration...");
    voiceData = await generateVoiceNarration(topic, lesson.script, {
      style: "professional",
    });
    console.log("🔊 Voice narration generated.");
  }

  return {
    topic,
    manimCode,
    videoUrl,
    voiceData,
    success: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { topic, includeVoice = true } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const result = await generateSingleVideo(topic, includeVoice);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in single video generation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
