import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredManimCode, validateAndFixManimCode } from '@/utils/structuredManimGenerator';
import {convertEscapedNewlines} from '@/utils/formatManimCode';
import { executeCodeAndListFiles } from '@/utils/sandbox';
import { generateVoiceNarration } from '@/utils/voiceNarration';
import { topicCache } from '@/utils/cache';
import path from 'path';



export async function POST(request: NextRequest) {
  try {
    const { topic, includeVoice = true, voiceOptions } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Clear expired cache entries periodically
    await topicCache.clearExpiredCache();

    // Generate structured Manim code (with built-in fallback)
    const manimCode = await generateStructuredManimCode(topic);
    const validatedCode = validateAndFixManimCode(manimCode);
    const multilineCode = convertEscapedNewlines(validatedCode);
    //generated Manim Code
    console.log(multilineCode);
    // Execute the generated Manim code in the sandbox and list files
    console.log('Executing Manim code in sandbox...');
    const result = await executeCodeAndListFiles(multilineCode);

    // Generate publicly accessible video URLs for the extracted videos
    let videoUrls: string[] = [];
    if (result.videoFiles && result.videoFiles.length > 0) {
      videoUrls = result.videoFiles.map(videoFile => {
        const fileName = path.basename(videoFile.path);
        return `/videos/${fileName}`;
      });
    }

    // Generate Murf AI voice narration if requested
    let voiceData = null;
    if (includeVoice) {
      try {
        console.log('Generating Murf AI voice narration...');
        voiceData = await generateVoiceNarration(topic, multilineCode, voiceOptions);
        console.log('Murf AI voice generation successful:', voiceData.audioUrl);
      } catch (error) {
        console.error('Murf AI voice generation failed:', error);
        console.log('🔇 Continuing without voice narration - check Murf API key');
        // Voice generation failed, but script was still generated
        voiceData = null;
      }
    }

    // If no video was generated, use existing fallback videos
    if (!videoUrls.length) {
      console.log('🎬 No video generated, using fallback videos...');
      const fallbackVideos = [
        '/videos/SimpleCircleAnimation.mp4',
        '/videos/GravityScene.mp4', 
        '/videos/EntropyScene.mp4',
        '/videos/BasicMathScene.mp4'
      ];
      
      // Pick a fallback video based on topic
      const topicLower = topic.toLowerCase();
      let selectedFallback = fallbackVideos[0]; // default
      
      if (topicLower.includes('math') || topicLower.includes('equation')) {
        selectedFallback = '/videos/BasicMathScene.mp4';
      } else if (topicLower.includes('gravity') || topicLower.includes('physics')) {
        selectedFallback = '/videos/GravityScene.mp4';
      } else if (topicLower.includes('entropy') || topicLower.includes('thermodynamics')) {
        selectedFallback = '/videos/EntropyScene.mp4';
      }
      
      videoUrls = [selectedFallback];
    }

    return NextResponse.json({
      topic,
      manimCode: multilineCode,
      generationMethod: result.success ? 'structured' : 'fallback',
      execution: result.execution,
      sandboxFiles: result.files,
      videoFiles: result.videoFiles || [],
      videoUrls,
      voiceData,
      success: true, // Always return success with fallbacks
      fallbackUsed: !result.success || !voiceData?.audioUrl
    });

  } catch (error) {
    console.error('Error generating Manim code:', error);
    return NextResponse.json(
      { error: 'Failed to generate Manim code' },
      { status: 500 }
    );
  }
}
