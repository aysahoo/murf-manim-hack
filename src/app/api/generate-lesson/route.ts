import { NextRequest, NextResponse } from "next/server";
import { generateLessonBreakdown } from "@/utils/lessonBreakdown";
import { blobStorage } from "@/utils/blobStorage";
import { executeCodeAndListFiles } from "@/utils/sandbox";
import { generateVoiceNarration } from "@/utils/voiceNarration";
import { validateAndFixManimCode } from "@/utils/structuredManimGenerator";
import { convertEscapedNewlines } from "@/utils/formatManimCode";

interface ProcessedLesson {
  part: number;
  script: string;
  manim_code: string;
  videoUrl: string | null;
  audioUrl: string | null;
  voiceScript: string;
  executionSuccess: boolean;
}

interface GenerateLessonResponse {
  topic: string;
  lessons: ProcessedLesson[];
  totalLessons: number;
  success: boolean;
}

// Request deduplication - prevent multiple simultaneous requests for same topic
const activeRequests = new Map<string, Promise<GenerateLessonResponse>>();

// Debug endpoint for testing individual parts
export async function PATCH(request: NextRequest) {
  try {
    const { topic, part } = await request.json();

    if (!topic || !part) {
      return NextResponse.json(
        { error: "Topic and part are required" },
        { status: 400 }
      );
    }

    console.log(`🔧 Testing video generation for ${topic} Part ${part}`);

    // Get lesson breakdown
    const lessonBreakdown = await generateLessonBreakdown(topic);
    const targetLesson = lessonBreakdown.lessons.find((l) => l.part === part);

    if (!targetLesson) {
      return NextResponse.json(
        { error: `Part ${part} not found for topic ${topic}` },
        { status: 404 }
      );
    }

    console.log(
      `Found lesson for Part ${part}:`,
      targetLesson.script.substring(0, 100) + "..."
    );

    // Validate and fix the Manim code
    const validatedCode = validateAndFixManimCode(targetLesson.manim_code);
    const multilineCode = convertEscapedNewlines(validatedCode);

    console.log(`Testing Manim code execution for Part ${part}...`);

    // Test execution
    const result = await executeCodeAndListFiles(multilineCode);

    return NextResponse.json({
      part,
      script: targetLesson.script,
      manimCode: multilineCode,
      executionResult: result,
      videoCount: result.videoFiles?.length || 0,
      videos: result.videoFiles || [],
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { topic, includeVoice = true } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Check if there's already an active request for this topic
    const requestKey = `${topic}_${includeVoice}`;
    if (activeRequests.has(requestKey)) {
      console.log(`⏳ Request already in progress for: ${topic}, waiting...`);
      try {
        const result = await activeRequests.get(requestKey);
        return NextResponse.json(result);
      } catch (error) {
        activeRequests.delete(requestKey);
        throw error;
      }
    }

    // Storage is handled automatically by blob storage

    console.log(`🎓 Generating lesson series with videos for topic: ${topic}`);

    // Create a promise for this request and store it
    const processingPromise = (async () => {
      // Generate structured lesson breakdown
      const lessonBreakdown = await generateLessonBreakdown(topic);
      console.log(
        `📚 Generated ${lessonBreakdown.lessons.length} lesson scripts`
      );

      // Process each lesson to generate video and audio with progressive responses
      // Create response stream for progressive loading
      const processLessonAsync = async (lesson: {
        part: number;
        script: string;
        manim_code: string;
      }) => {
        console.log(
          `🎬 Processing Part ${lesson.part}: Generating video and audio...`
        );

        try {
          // Validate and fix the Manim code for 15-second duration
          let validatedCode = validateAndFixManimCode(lesson.manim_code);

          // Log the original and validated code for debugging
          console.log(
            `Original Manim code for Part ${lesson.part}:`,
            lesson.manim_code.substring(0, 200) + "..."
          );
          console.log(
            `Validated Manim code for Part ${lesson.part}:`,
            validatedCode.substring(0, 200) + "..."
          );

          // Extend animation durations to 15 seconds total - but be more careful about replacements
          validatedCode = validatedCode
            .replace(/run_time=\d+(\.\d+)?/g, "run_time=2.5")
            .replace(/self\.wait\(\d+(\.\d+)?\)/g, "self.wait(1.5)")
            .replace(/self\.wait\(1\.5\)\s*$/m, "self.wait(3)"); // Longer final wait

          // Ensure we have proper scene class naming
          const sceneClassName = `Part${lesson.part}`;
          validatedCode = validatedCode.replace(
            /class\s+\w+\s*\(Scene\):/,
            `class ${sceneClassName}(Scene):`
          );

          console.log(
            `Final Manim code for Part ${lesson.part}:`,
            validatedCode.substring(0, 300) + "..."
          );

          const multilineCode = convertEscapedNewlines(validatedCode);

          // Execute the Manim code in sandbox
          console.log(`⚡ Executing Manim code for Part ${lesson.part}...`);
          const result = await executeCodeAndListFiles(multilineCode);

          // Use blob storage URL directly
          let videoUrl = null;
          if (result.videoFiles && result.videoFiles.length > 0) {
            // The sandbox already uploaded to blob storage and returns the blob URL
            videoUrl = result.videoFiles[0].path; // This is actually the blob URL from sandbox.ts
            console.log(
              `✅ Using blob storage video for Part ${lesson.part}: ${videoUrl}`
            );
          } else {
            console.warn(`⚠️ No video generated for Part ${lesson.part}`);
          }

          // Generate voice narration for this lesson
          let voiceData = null;
          if (includeVoice) {
            try {
              console.log(`🎤 Generating voice for Part ${lesson.part}...`);
              voiceData = await generateVoiceNarration(
                `${topic} Part ${lesson.part}`,
                lesson.script,
                {}
              );
              console.log(
                `✅ Generated voice for Part ${lesson.part}: ${voiceData.audioUrl}`
              );
            } catch (voiceError) {
              console.error(
                `❌ Voice generation failed for Part ${lesson.part}:`,
                voiceError
              );
              voiceData = null;
            }
          }

          return {
            part: lesson.part,
            script: lesson.script,
            manim_code: lesson.manim_code,
            videoUrl,
            audioUrl: voiceData?.audioUrl || null,
            voiceScript: voiceData?.script || lesson.script,
            executionSuccess: result.success,
          };
        } catch (lessonError) {
          console.error(
            `❌ Error processing Part ${lesson.part}:`,
            lessonError
          );
          return {
            part: lesson.part,
            script: lesson.script,
            manim_code: lesson.manim_code,
            videoUrl: null,
            audioUrl: null,
            voiceScript: lesson.script,
            executionSuccess: false,
            error:
              lessonError instanceof Error
                ? lessonError.message
                : "Unknown error",
          };
        }
      };

      // Process lessons sequentially to prevent file conflicts
      const processedLessons = [];

      console.log(
        `🔄 Processing ${lessonBreakdown.lessons.length} lessons sequentially...`
      );

      for (let i = 0; i < lessonBreakdown.lessons.length; i++) {
        const lesson = lessonBreakdown.lessons[i];
        console.log(
          `\n📚 Starting Part ${lesson.part} (${i + 1}/${
            lessonBreakdown.lessons.length
          })...`
        );

        const processedLesson = await processLessonAsync(lesson);
        processedLessons.push(processedLesson);

        console.log(
          `✅ Completed Part ${lesson.part} - Video: ${
            processedLesson.videoUrl
          }, Audio: ${processedLesson.audioUrl ? "✅" : "❌"}`
        );
      }

      console.log(
        `✅ Successfully processed ${processedLessons.length} lessons with videos and audio for: ${topic}`
      );

      // Return the processed lessons with videos and audio
      return {
        topic,
        lessons: processedLessons,
        totalLessons: processedLessons.length,
        success: true,
      };
    })();

    // Store the promise to prevent duplicate requests
    activeRequests.set(requestKey, processingPromise);

    try {
      const result = await processingPromise;
      return NextResponse.json(result, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } finally {
      // Clean up the active request
      activeRequests.delete(requestKey);
    }
  } catch (error) {
    console.error("Error generating lesson series:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson series" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to retrieve cached lesson breakdowns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const clearCache = searchParams.get("clear") === "true";

    if (!topic) {
      return NextResponse.json(
        { error: "Topic query parameter is required" },
        { status: 400 }
      );
    }

    // Clear cache if requested
    if (clearCache) {
      console.log(`Clearing cache for topic: ${topic}`);
      try {
        await blobStorage.deleteData("lesson", topic);
        await blobStorage.deleteData("manim", topic);
        await blobStorage.deleteData("voice", topic);
        console.log(`Cache cleared for topic: ${topic}`);
      } catch (clearError) {
        console.warn("Error clearing cache:", clearError);
      }
    }

    // Try to get from storage only
    const storedBreakdown = await blobStorage.getLessonBreakdown(topic);

    if (storedBreakdown) {
      return NextResponse.json(storedBreakdown.lessons);
    } else {
      return NextResponse.json(
        { error: "No stored lesson breakdown found for this topic" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error retrieving stored lesson breakdown:", error);
    return NextResponse.json(
      { error: "Failed to retrieve lesson breakdown" },
      { status: 500 }
    );
  }
}
