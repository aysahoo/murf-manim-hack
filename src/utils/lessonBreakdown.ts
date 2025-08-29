import { z } from "zod";
import { blobStorage } from "./blobStorage";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Initialize the OpenRouter provider
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

// Schema for lesson breakdown
const lessonBreakdownSchema = z.object({
  lessons: z
    .array(
      z.object({
        part: z.number().describe("Part number (1, 2, 3, etc.)"),
        script: z
          .string()
          .max(200)
          .describe("Narration script (≤30 words for 15 second duration)"),
        manim_code: z
          .string()
          .describe(
            "Python Manim code for this part with lightweight animations"
          ),
      })
    )
    .min(3)
    .max(4)
    .describe("3-4 sequential mini-lessons"),
});

/**
 * Generates a structured lesson breakdown for any topic
 */
export async function generateLessonBreakdown(topic: string): Promise<{
  lessons: Array<{
    part: number;
    script: string;
    manim_code: string;
  }>;
}> {
  try {
    // Check storage first
    console.log(`Checking storage for lesson breakdown: ${topic}`);
    const cachedBreakdown = await blobStorage.getLessonBreakdown(topic);

    if (cachedBreakdown) {
      console.log(
        `🎯 Storage HIT - Using stored lesson breakdown for: ${topic}`
      );
      return cachedBreakdown;
    }

    console.log(
      `🔄 Storage MISS - Generating new lesson breakdown for: ${topic}`
    );
    const { object } = await generateObject({
      model: openrouter("google/gemini-flash-1.5"),
      schema: lessonBreakdownSchema,
      prompt: `Break down the topic "${topic}" into 3-4 sequential mini-lessons for educational animation.

REQUIREMENTS:
1. Each lesson should be 15 seconds long
2. Narration script must be ≤25 words (fits in 15 seconds of speech)
3. Keep scripts short, clear, and engaging
4. Manim code must use ONLY: Write, FadeIn, FadeOut, Transform
5. Maximum 3-4 animations per scene
6. Set run_time so total scene duration is 15 seconds
7. Each scene class named Part1, Part2, Part3, etc.
8. Lessons must flow naturally from one to the next

MANIM CODE RULES:
- Use 'from manim import *' as only import
- Create Scene class that inherits from Scene
- Include construct method with complete animation logic
- Use proper 4-space indentation
- Add self.wait() calls for proper timing (at least 2-3 seconds total)
- Keep animations lightweight and fast
- Focus on visual clarity over complexity
- Use only basic Manim objects: Text, MathTex, Circle, Square, Line, Arrow
- Use Text() for plain text labels, never use MathTex with \\text{}
- Always use MathTex for mathematical expressions, never use Tex
- Position objects with next_to() method
- Use simple animations: Write, FadeIn, FadeOut, Transform

LESSON FLOW:
- Part 1: Introduction and basic definition
- Part 2: Key mechanism or process
- Part 3: Applications or implications
- Part 4 (optional): Advanced concepts or future directions

Make each part build naturally on the previous one while being understandable independently.

Topic: ${topic}`,
    });

    // Store the result
    await blobStorage.storeLessonBreakdown(topic, object);
    console.log(`💾 Stored lesson breakdown for future use: ${topic}`);

    return object;
  } catch (error) {
    console.error("Error generating lesson breakdown:", error);
    throw new Error(
      `Failed to generate lesson breakdown for topic: ${topic}. Original error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export { lessonBreakdownSchema };
