import { NextRequest, NextResponse } from "next/server";
import {
  generateStructuredManimCode,
  validateAndFixManimCode,
} from "@/utils/structuredManimGenerator";
import { convertEscapedNewlines } from "@/utils/formatManimCode";
import { executeCodeAndListFiles } from "@/utils/sandbox";
import { generateVoiceNarration } from "@/utils/voiceNarration";
// Removed cache import - now using blob storage directly

export async function POST(request: NextRequest) {
  try {
    const { topic, includeVoice = true, voiceOptions } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Storage is handled automatically by blob storage
    const manimCode = await generateStructuredManimCode(topic);
    const validatedCode = validateAndFixManimCode(manimCode);
    const multilineCode = convertEscapedNewlines(validatedCode);
    //generated Manim Code
    console.log(multilineCode);
    // Execute the generated Manim code in the sandbox and list files
    console.log("Executing Manim code in sandbox...");
    const result = await executeCodeAndListFiles(multilineCode);

    // Use blob URLs for the extracted videos (they're already public URLs)
    let videoUrls: string[] = [];
    if (result.videoFiles && result.videoFiles.length > 0) {
      videoUrls = result.videoFiles.map((videoFile) => videoFile.path); // videoFile.path is now a blob URL
    }

    // Generate Murf AI voice narration if requested
    let voiceData = null;
    if (includeVoice) {
      try {
        console.log("Generating Murf AI voice narration...");
        voiceData = await generateVoiceNarration(
          topic,
          multilineCode,
          voiceOptions
        );
        if (voiceData.audioUrl) {
          console.log(
            "Murf AI voice generation successful:",
            voiceData.audioUrl
          );
        }
      } catch (voiceError) {
        console.error("Error generating voice narration:", voiceError);
        console.log("Continuing without voice narration");
        voiceData = null;
      }
    }

    return NextResponse.json({
      topic,
      manimCode: multilineCode,
      generationMethod: result.success ? "structured" : "sandbox_error",
      execution: result.execution,
      sandboxFiles: result.files,
      videoFiles: result.videoFiles || [],
      videoUrls,
      voiceData,
      success: true,
    });
  } catch (error) {
    console.error("Error generating Manim code:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
