import { put, list, del } from "@vercel/blob";

interface ManimCodeData {
  code: string;
  validatedCode: string;
}

interface VoiceScriptData {
  script: string;
  segments: Array<{ text: string; duration: number; timestamp: number }>;
  voiceStyle: string;
  speakingRate: number;
}

interface LessonBreakdownData {
  lessons: Array<{
    part: number;
    script: string;
    manim_code: string;
  }>;
}

interface VideoFileData {
  filename: string;
  url: string;
  size: number;
  contentType: string;
}

class BlobStorage {
  private blobStorePrefix: string;

  constructor() {
    this.blobStorePrefix = "data/";
  }

  private getBlobKey(
    type: "manim" | "voice" | "lesson" | "video",
    topic: string,
    extension: string = "json"
  ): string {
    const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, "_");
    return `${this.blobStorePrefix}${type}_${safeTopic}.${extension}`;
  }

  // Manim Code Storage
  async getManimCode(topic: string): Promise<ManimCodeData | null> {
    try {
      const blobKey = this.getBlobKey("manim", topic);
      const response = await fetch(
        `${
          process.env.BLOB_READ_WRITE_TOKEN
            ? "https://blob.vercel-storage.com"
            : "https://vercel-blob.vercel.app"
        }/${blobKey}`
      );

      if (!response.ok) {
        return null;
      }

      const data: ManimCodeData = await response.json();
      console.log(`Retrieved Manim code for topic: ${topic}`);
      return data;
    } catch (error) {
      console.error("Error reading Manim data from blob:", error);
      return null;
    }
  }

  async storeManimCode(
    topic: string,
    code: string,
    validatedCode: string
  ): Promise<string> {
    try {
      const blobKey = this.getBlobKey("manim", topic);
      const data: ManimCodeData = { code, validatedCode };

      const blob = await put(blobKey, JSON.stringify(data, null, 2), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: true,
      });

      console.log(`Stored Manim code for topic: ${topic} at ${blob.url}`);
      return blob.url;
    } catch (error) {
      console.error("Error storing Manim data to blob:", error);
      throw error;
    }
  }

  // Voice Script Storage
  async getVoiceScript(topic: string): Promise<VoiceScriptData | null> {
    try {
      const blobKey = this.getBlobKey("voice", topic);
      const response = await fetch(
        `${
          process.env.BLOB_READ_WRITE_TOKEN
            ? "https://blob.vercel-storage.com"
            : "https://vercel-blob.vercel.app"
        }/${blobKey}`
      );

      if (!response.ok) {
        return null;
      }

      const data: VoiceScriptData = await response.json();
      console.log(`Retrieved voice script for topic: ${topic}`);
      return data;
    } catch (error) {
      console.error("Error reading voice data from blob:", error);
      return null;
    }
  }

  async storeVoiceScript(
    topic: string,
    scriptData: VoiceScriptData
  ): Promise<string> {
    try {
      const blobKey = this.getBlobKey("voice", topic);

      const blob = await put(blobKey, JSON.stringify(scriptData, null, 2), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: true,
      });

      console.log(`Stored voice script for topic: ${topic} at ${blob.url}`);
      return blob.url;
    } catch (error) {
      console.error("Error storing voice data to blob:", error);
      throw error;
    }
  }

  // Lesson Breakdown Storage
  async getLessonBreakdown(topic: string): Promise<LessonBreakdownData | null> {
    try {
      const blobKey = this.getBlobKey("lesson", topic);
      const response = await fetch(
        `${
          process.env.BLOB_READ_WRITE_TOKEN
            ? "https://blob.vercel-storage.com"
            : "https://vercel-blob.vercel.app"
        }/${blobKey}`
      );

      if (!response.ok) {
        return null;
      }

      const data: LessonBreakdownData = await response.json();
      console.log(`Retrieved lesson breakdown for topic: ${topic}`);
      return data;
    } catch (error) {
      console.error("Error reading lesson breakdown from blob:", error);
      return null;
    }
  }

  async storeLessonBreakdown(
    topic: string,
    breakdownData: LessonBreakdownData
  ): Promise<string> {
    try {
      const blobKey = this.getBlobKey("lesson", topic);

      const blob = await put(blobKey, JSON.stringify(breakdownData, null, 2), {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: true,
      });

      console.log(`Stored lesson breakdown for topic: ${topic} at ${blob.url}`);
      return blob.url;
    } catch (error) {
      console.error("Error storing lesson breakdown to blob:", error);
      throw error;
    }
  }

  // Video File Storage
  async storeVideoFile(
    topic: string,
    videoBuffer: Buffer,
    filename: string
  ): Promise<VideoFileData> {
    try {
      const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const timestamp = Date.now();
      const videoFilename = `${safeTopic}_${timestamp}_${filename}`;

      const blob = await put(`videos/${videoFilename}`, videoBuffer, {
        access: "public",
        contentType: "video/mp4",
        addRandomSuffix: false,
      });

      const videoData: VideoFileData = {
        filename: videoFilename,
        url: blob.url,
        size: videoBuffer.length,
        contentType: "video/mp4",
      };

      console.log(`Stored video file for topic: ${topic} at ${blob.url}`);
      return videoData;
    } catch (error) {
      console.error("Error storing video file to blob:", error);
      throw error;
    }
  }

  // Audio File Storage
  async storeAudioFile(
    topic: string,
    audioBuffer: Buffer,
    filename: string
  ): Promise<{
    filename: string;
    url: string;
    size: number;
    contentType: string;
  }> {
    try {
      const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const timestamp = Date.now();
      const audioFilename = `${safeTopic}_${timestamp}_${filename}`;

      const blob = await put(`audio/${audioFilename}`, audioBuffer, {
        access: "public",
        contentType: "audio/mpeg",
        addRandomSuffix: false,
      });

      const audioData = {
        filename: audioFilename,
        url: blob.url,
        size: audioBuffer.length,
        contentType: "audio/mpeg",
      };

      console.log(`Stored audio file for topic: ${topic} at ${blob.url}`);
      return audioData;
    } catch (error) {
      console.error("Error storing audio file to blob:", error);
      throw error;
    }
  }

  async getVideoFiles(topic: string): Promise<VideoFileData[]> {
    try {
      const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const { blobs } = await list({ prefix: `videos/${safeTopic}` });

      const videoFiles: VideoFileData[] = blobs.map((blob) => ({
        filename: blob.pathname.split("/").pop() || "",
        url: blob.url,
        size: blob.size,
        contentType: "video/mp4",
      }));

      return videoFiles;
    } catch (error) {
      console.error("Error retrieving video files from blob:", error);
      return [];
    }
  }

  // General storage operations
  async listAllData(): Promise<
    Array<{ key: string; url: string; size: number }>
  > {
    try {
      const { blobs } = await list({ prefix: this.blobStorePrefix });
      return blobs.map((blob) => ({
        key: blob.pathname,
        url: blob.url,
        size: blob.size,
      }));
    } catch (error) {
      console.error("Error listing blob data:", error);
      return [];
    }
  }

  async deleteData(
    type: "manim" | "voice" | "lesson",
    topic: string
  ): Promise<void> {
    try {
      const blobKey = this.getBlobKey(type, topic);
      const blobUrl = `${
        process.env.BLOB_READ_WRITE_TOKEN
          ? "https://blob.vercel-storage.com"
          : "https://vercel-blob.vercel.app"
      }/${blobKey}`;
      await del(blobUrl);
      console.log(`Deleted data for topic: ${topic}`);
    } catch (error) {
      console.error("Error deleting blob data:", error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const { blobs } = await list({ prefix: this.blobStorePrefix });

      for (const blob of blobs) {
        await del(blob.url);
      }

      console.log("Cleared all stored data from blob storage");
    } catch (error) {
      console.error("Error clearing all data from blob:", error);
      throw error;
    }
  }
}

// Singleton instance
export const blobStorage = new BlobStorage();

// Export types for use in other modules
export type {
  ManimCodeData,
  VoiceScriptData,
  LessonBreakdownData,
  VideoFileData,
};
