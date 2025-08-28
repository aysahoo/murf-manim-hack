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
      const processLessonAsync = async (
        lesson: { part: number; script: string; manim_code: string },
        index: number
      ) => {
        console.log(
          `🎬 Processing Part ${lesson.part}: Generating video and audio...`
        );

        try {
          // Validate and fix the Manim code for 15-second duration
          let validatedCode = validateAndFixManimCode(lesson.manim_code);

          // Extend animation durations to 15 seconds total
          validatedCode = validatedCode
            .replace(/run_time=\d+(\.\d+)?/g, "run_time=2.5")
            .replace(/self\.wait\(\d+(\.\d+)?\)/g, "self.wait(1.5)")
            .replace(/self\.wait\(1\.5\)\s*$/m, "self.wait(3)"); // Longer final wait

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
            console.warn(
              `⚠️ No video generated for Part ${lesson.part}, using fallback`
            );
            // Use available fallback videos from public/videos
            const fallbackVideos = [
              "/videos/Part1.mp4",
              "/videos/Part3.mp4",
              "/videos/TopicScene.mp4",
            ];
            videoUrl = fallbackVideos[index % fallbackVideos.length];
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

          // Return lesson with fallback video
          const fallbackVideos = [
            "/videos/Part1.mp4",
            "/videos/Part3.mp4",
            "/videos/TopicScene.mp4",
          ];
          return {
            part: lesson.part,
            script: lesson.script,
            manim_code: lesson.manim_code,
            videoUrl: fallbackVideos[index % fallbackVideos.length],
            audioUrl: null,
            voiceScript: lesson.script,
            executionSuccess: false,
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

        const processedLesson = await processLessonAsync(lesson, i);
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

    if (!topic) {
      return NextResponse.json(
        { error: "Topic query parameter is required" },
        { status: 400 }
      );
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
