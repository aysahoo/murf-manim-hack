import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import axios from "axios";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { blobStorage } from "./blobStorage";

const MURF_API_KEY = process.env.MURF_API_KEY;

// Fallback voice scripts when Gemini API is down
function getFallbackVoiceScript(topic: string) {
  const topicLower = topic.toLowerCase();

  if (
    topicLower.includes("math") ||
    topicLower.includes("addition") ||
    topicLower.includes("equation")
  ) {
    return {
      script:
        "Here we see the equation two plus three equals five. Watch as the equation appears on screen. Now we break it into individual parts - two, plus, three, equals, five. The number five lights up in yellow to show it's our final answer. This demonstrates basic addition in action.",
      segments: [
        {
          text: "Here we see the equation two plus three equals five.",
          duration: 3,
          timestamp: 0,
        },
        {
          text: "Watch as the equation appears on screen.",
          duration: 2,
          timestamp: 3,
        },
        {
          text: "Now we break it into individual parts - two, plus, three, equals, five.",
          duration: 4,
          timestamp: 5,
        },
        {
          text: "The number five lights up in yellow to show it's our final answer.",
          duration: 4,
          timestamp: 9,
        },
        {
          text: "This demonstrates basic addition in action.",
          duration: 3,
          timestamp: 13,
        },
      ],
      voiceStyle: "educational",
      speakingRate: 1.0,
    };
  }

  if (topicLower.includes("circle") || topicLower.includes("geometry")) {
    return {
      script:
        "Here's a perfect circle drawn in blue. Watch the title appear at the top. Now we see the circle form on screen. A red line appears - this is the radius, extending from center to edge. The letter R labels our radius. This shows how circles are defined by their radius.",
      segments: [
        {
          text: "Here's a perfect circle drawn in blue.",
          duration: 3,
          timestamp: 0,
        },
        {
          text: "Watch the title appear at the top.",
          duration: 2,
          timestamp: 3,
        },
        {
          text: "Now we see the circle form on screen.",
          duration: 3,
          timestamp: 5,
        },
        {
          text: "A red line appears - this is the radius, extending from center to edge.",
          duration: 4,
          timestamp: 8,
        },
        {
          text: "The letter R labels our radius. This shows how circles are defined by their radius.",
          duration: 4,
          timestamp: 12,
        },
      ],
      voiceStyle: "educational",
      speakingRate: 1.0,
    };
  }

  if (topicLower.includes("gravity") || topicLower.includes("physics")) {
    return {
      script:
        "Here we see gravity in action. The green circle represents Earth below. The small red circle is an apple above. Watch as the yellow arrow appears, showing gravitational force. The equation F equals mg appears, showing the force formula. Now the apple falls toward Earth, demonstrating gravity pulling objects downward.",
      segments: [
        { text: "Here we see gravity in action.", duration: 2, timestamp: 0 },
        {
          text: "The green circle represents Earth below. The small red circle is an apple above.",
          duration: 4,
          timestamp: 2,
        },
        {
          text: "Watch as the yellow arrow appears, showing gravitational force.",
          duration: 3,
          timestamp: 6,
        },
        {
          text: "The equation F equals mg appears, showing the force formula.",
          duration: 3,
          timestamp: 9,
        },
        {
          text: "Now the apple falls toward Earth, demonstrating gravity pulling objects downward.",
          duration: 4,
          timestamp: 12,
        },
      ],
      voiceStyle: "educational",
      speakingRate: 1.0,
    };
  }

  if (
    topicLower.includes("list") ||
    topicLower.includes("array") ||
    topicLower.includes("data")
  ) {
    return {
      script:
        "Here's how lists work in programming. We see three boxes containing A, B, and C. Below each box are numbers - zero, one, two. These are the index positions. Watch as each box lights up yellow one by one. This shows how we can access each element by its position in the list.",
      segments: [
        {
          text: "Here's how lists work in programming.",
          duration: 3,
          timestamp: 0,
        },
        {
          text: "We see three boxes containing A, B, and C.",
          duration: 3,
          timestamp: 3,
        },
        {
          text: "Below each box are numbers - zero, one, two. These are the index positions.",
          duration: 4,
          timestamp: 6,
        },
        {
          text: "Watch as each box lights up yellow one by one.",
          duration: 3,
          timestamp: 10,
        },
        {
          text: "This shows how we can access each element by its position in the list.",
          duration: 4,
          timestamp: 13,
        },
      ],
      voiceStyle: "educational",
      speakingRate: 1.0,
    };
  }

  if (topicLower.includes("tuple") || topicLower.includes("pair")) {
    return {
      script:
        "Here we see a tuple data structure. Tuples are like lists but immutable - they can't be changed. This tuple contains three elements: A, B, and C. The parentheses show it's a tuple, not a list. Each element has a position, starting from zero. Tuples are perfect for storing related data together.",
      segments: [
        {
          text: "Here we see a tuple data structure.",
          duration: 3,
          timestamp: 0,
        },
        {
          text: "Tuples are like lists but immutable - they can't be changed.",
          duration: 4,
          timestamp: 3,
        },
        {
          text: "This tuple contains three elements: A, B, and C.",
          duration: 3,
          timestamp: 7,
        },
        {
          text: "The parentheses show it's a tuple, not a list.",
          duration: 3,
          timestamp: 10,
        },
        {
          text: "Each element has a position, starting from zero. Tuples are perfect for storing related data together.",
          duration: 5,
          timestamp: 13,
        },
      ],
      voiceStyle: "educational",
      speakingRate: 1.0,
    };
  }

  // Default fallback for any topic
  return {
    script: `Let's explore the fascinating topic of ${topic} through visual animation. This concept plays an important role in understanding the world around us. Watch as we break down the key ideas step by step. The visual representation makes complex concepts easier to grasp. Understanding ${topic} opens up new ways of thinking about related subjects.`,
    segments: [
      {
        text: `Let's explore the fascinating topic of ${topic} through visual animation.`,
        duration: 4,
        timestamp: 0,
      },
      {
        text: "This concept plays an important role in understanding the world around us.",
        duration: 5,
        timestamp: 4,
      },
      {
        text: "Watch as we break down the key ideas step by step.",
        duration: 4,
        timestamp: 9,
      },
      {
        text: "The visual representation makes complex concepts easier to grasp.",
        duration: 5,
        timestamp: 13,
      },
      {
        text: `Understanding ${topic} opens up new ways of thinking about related subjects.`,
        duration: 5,
        timestamp: 18,
      },
    ],
    voiceStyle: "educational",
    speakingRate: 1.0,
  };
}

// Schema for voice narration script generation
const narrationScriptSchema = z.object({
  script: z
    .string()
    .describe("The complete narration script that explains the animation"),
  segments: z
    .array(
      z.object({
        text: z.string().describe("Text segment for voice synthesis"),
        duration: z
          .number()
          .describe("Estimated duration in seconds for this segment"),
        timestamp: z
          .number()
          .describe("Start time in the video when this segment should begin"),
      })
    )
    .describe("Timed segments for synchronization with video"),
  voiceStyle: z
    .string()
    .describe(
      "Recommended voice style (e.g., 'professional', 'educational', 'enthusiastic')"
    ),
  speakingRate: z.number().describe("Speaking rate multiplier (0.5-2.0)"),
});

/**
 * Configuration for Murf AI API
 */
const MURF_API_CONFIG = {
  baseUrl: "https://api.murf.ai/v1",
  // Note: You'll need to add your Murf AI API key to environment variables
  apiKey: process.env.MURF_API_KEY || "",
  defaultVoice: "en-US-natalie", // Default voice ID - Natalie supports Narration style
  defaultFormat: "mp3",
};

/**
 * Generates a narration script using Gemini AI based on the Manim code and topic
 */
export async function generateNarrationScript(
  topic: string,
  manimCode: string
): Promise<{
  script: string;
  segments: Array<{ text: string; duration: number; timestamp: number }>;
  voiceStyle: string;
  speakingRate: number;
}> {
  try {
    // Check cache first
    console.log(`Checking cache for voice script: ${topic}`);
    const cachedScript = await blobStorage.getVoiceScript(topic);

    if (cachedScript) {
      console.log(`🎯 Storage HIT - Using stored voice script for: ${topic}`);
      return cachedScript;
    }

    console.log(`🔄 Storage MISS - Generating new voice script for: ${topic}`);

    // Use fallback immediately instead of trying Gemini API (quota exceeded)
    console.log("🚨 Using fallback voice script (Gemini quota exceeded)...");
    const fallbackScript = getFallbackVoiceScript(topic);

    // Store the fallback for future use
    await blobStorage.storeVoiceScript(topic, fallbackScript);
    console.log(`💾 Stored fallback voice script for future use: ${topic}`);

    return fallbackScript;

    /* Commented out Gemini API call due to quota
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: narrationScriptSchema,
      prompt: `Generate a BASIC OVERVIEW voice narration for a Manim animation about: "${topic}"

Based on this Manim code:
${manimCode}

REQUIREMENTS:
1. **Basic Overview**: Simple explanation of what the topic is
2. **Extended Duration**: 25-30 seconds of narration for thorough explanation
3. **Simple Language**: Use everyday words everyone understands
4. **Natural Flow**: Smooth, conversational tone
5. **Complete Coverage**: Cover the core concept with examples

The script should be:
- Maximum 90-100 words total (for 25-30 second duration)
- 4-5 segments for better pacing
- Each segment 5-7 seconds duration
- Focus on "what it is", "how it works", and "why it matters"
- Include simple examples or applications

Keep it simple, clear, and engaging for general audience.`
    });

    // Store the result
    await blobStorage.storeVoiceScript(topic, object);
    console.log(`💾 Stored voice script for future use: ${topic}`);

    return object;
    */
  } catch (error) {
    console.error("Error generating narration script:", error);
    console.log("🚨 Gemini API failed for voice script, using fallback...");

    // Fallback: Generate script based on topic without AI
    const fallbackScript = getFallbackVoiceScript(topic);

    // Store the fallback
    await blobStorage.storeVoiceScript(topic, fallbackScript);
    console.log(`💾 Stored fallback voice script for future use: ${topic}`);

    return fallbackScript;
  }
}

/**
 * Converts text to speech using Murf AI API
 */
export async function textToSpeech(
  text: string,
  options: {
    voice?: string;
    style?: string;
    speakingRate?: number;
    outputFormat?: string;
  } = {}
): Promise<{ audioData: Buffer; audioUrl?: string }> {
  try {
    const {
      voice = MURF_API_CONFIG.defaultVoice,
      style = "professional",
      speakingRate = 1.0,
      outputFormat = MURF_API_CONFIG.defaultFormat,
    } = options;

    if (
      !MURF_API_CONFIG.apiKey ||
      MURF_API_CONFIG.apiKey === "your_murf_api_key_here"
    ) {
      throw new Error(
        "Murf API key not configured. Please set MURF_API_KEY environment variable with your actual API key from https://studio.murf.ai/"
      );
    }

    const response = await axios.post(
      `${MURF_API_CONFIG.baseUrl}/speech/generate`,
      {
        text,
        voice_id: voice,
        style,
        speaking_rate: speakingRate,
        format: outputFormat,
        sample_rate: 44100,
      },
      {
        headers: {
          "api-key": MURF_API_CONFIG.apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    // Murf API returns a JSON response with audioFile URL, not binary data
    const audioFileUrl = response.data.audioFile;
    if (!audioFileUrl) {
      throw new Error("No audio file URL returned from Murf API");
    }

    // Download the audio file
    const audioResponse = await axios.get(audioFileUrl, {
      responseType: "arraybuffer",
    });

    const audioData = Buffer.from(audioResponse.data);

    return {
      audioData,
      audioUrl: audioFileUrl,
    };
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate speech from text");
  }
}

/**
 * Saves audio data to a file
 */
export function saveAudioFile(audioData: Buffer, filename: string): string {
  const audioDir = path.join(process.cwd(), "public", "audio");

  // Create audio directory if it doesn't exist
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const filePath = path.join(audioDir, filename);
  fs.writeFileSync(filePath, audioData);

  return `/audio/${filename}`;
}

/**
 * Generates complete voice narration for a Manim animation
 */
export async function generateVoiceNarration(
  topic: string,
  scriptOrManimCode: string,
  voiceOptions?: {
    voice?: string;
    style?: string;
    speakingRate?: number;
  }
): Promise<{
  audioUrl: string;
  script: string;
  segments: Array<{ text: string; duration: number; timestamp: number }>;
}> {
  try {
    // Check if this is already a script (for lesson parts) or Manim code
    let narrationData;
    let fullScript;

    if (
      scriptOrManimCode.includes("from manim import") ||
      scriptOrManimCode.includes("class ")
    ) {
      // This is Manim code, generate narration script
      narrationData = await generateNarrationScript(topic, scriptOrManimCode);
      fullScript = narrationData.segments
        .map((segment) => segment.text)
        .join(" ");
    } else {
      // This is already a script (lesson part), use it directly
      fullScript = scriptOrManimCode;
      narrationData = {
        script: scriptOrManimCode,
        segments: [
          {
            text: scriptOrManimCode,
            duration: Math.ceil(scriptOrManimCode.split(" ").length / 3),
            timestamp: 0,
          },
        ],
        voiceStyle: "educational",
        speakingRate: 1.0,
      };
    }

    // Generate speech with custom options
    const audioResult = await textToSpeech(fullScript, {
      voice: voiceOptions?.voice || MURF_API_CONFIG.defaultVoice,
      style: voiceOptions?.style || narrationData.voiceStyle,
      speakingRate: voiceOptions?.speakingRate || narrationData.speakingRate,
    });

    // Save audio file
    const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const audioFilename = `${safeTopic}_${Date.now()}.mp3`;
    const audioUrl = saveAudioFile(audioResult.audioData, audioFilename);

    return {
      audioUrl,
      script: narrationData.script,
      segments: narrationData.segments,
    };
  } catch (error) {
    console.error("Error generating voice narration:", error);
    throw new Error("Failed to generate voice narration");
  }
}

/**
 * Gets available voices from Murf AI API
 */
interface VoiceData {
  id: string;
  name: string;
  language: string;
  gender?: string;
  accent?: string;
}

export async function getAvailableVoices(): Promise<VoiceData[]> {
  try {
    if (!MURF_API_CONFIG.apiKey) {
      throw new Error("Murf AI key not configured");
    }

    const response = await axios.get(`${MURF_API_CONFIG.baseUrl}/voices`, {
      headers: {
        "api-key": MURF_API_CONFIG.apiKey,
      },
    });

    return response.data.voices || [];
  } catch (error) {
    console.error("Error fetching voices:", error);
    return [];
  }
}
