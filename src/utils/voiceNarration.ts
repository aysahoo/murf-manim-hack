import axios from "axios";
import { blobStorage } from "./blobStorage";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Schema for narration script generation
const narrationScriptSchema = z.object({
  script: z.string().describe("Complete narration script"),
  segments: z.array(
    z.object({
      text: z.string().describe("Text segment for this part"),
      duration: z.number().describe("Duration in seconds"),
      timestamp: z.number().describe("Start timestamp in seconds")
    })
  ).describe("Array of script segments with timing"),
  voiceStyle: z.string().describe("Voice style (educational, professional, etc.)"),
  speakingRate: z.number().describe("Speaking rate multiplier (0.5-2.0)")
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
  * Generates a narration script based on the topic
 */
export async function generateNarrationScript(topic: string): Promise<{
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

  // Generate AI-powered voice narration script
    
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: narrationScriptSchema,
      prompt: `Generate a BASIC OVERVIEW voice narration for a Manim animation about: "${topic}"

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
- Use educational voice style
- Set speaking rate to 1.0

Keep it simple, clear, and engaging for general audience.`
    });

    // Store the result
    await blobStorage.storeVoiceScript(topic, object);
    console.log(`💾 Stored voice script for future use: ${topic}`);

    return object;
  } catch (error) {
    console.error("Error generating narration script:", error);
    throw new Error(`Failed to generate narration script for topic: ${topic}. Original error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.warn("Murf API key not configured, cannot generate voice");
      throw new Error("Murf API key not configured");
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
 * Saves audio data to blob storage
 */
export async function saveAudioFile(
  audioData: Buffer,
  filename: string,
  topic: string
): Promise<string> {
  try {
    const blobResult = await blobStorage.storeAudioFile(
      topic,
      audioData,
      filename
    );
    return blobResult.url;
  } catch (error) {
    console.error("Error saving audio file to blob storage:", error);
    throw new Error("Failed to save audio file to blob storage");
  }
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
  audioUrl: string | null;
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
      narrationData = await generateNarrationScript(topic);
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

    // Check if API key is configured (audioData will be empty if not)
    if (audioResult.audioData.length === 0) {
      console.log("Murf API key not configured, using script data only");
      return {
        audioUrl: null, // Indicate no audio URL available
        script: narrationData.script,
        segments: narrationData.segments,
      };
    }

    // Save audio file
    const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const audioFilename = `${safeTopic}_${Date.now()}.mp3`;
    const audioUrl = await saveAudioFile(
      audioResult.audioData,
      audioFilename,
      topic
    );

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
