// Utility to clear cached data for testing
// Run this in browser console if needed: clearLessonCache('Black holes')

export function clearLessonCache(topic: string) {
  const safeTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const keys = [
    `lesson_${safeTopic}`,
    `manim_${safeTopic}`,
    `voice_${safeTopic}`
  ];
  
  console.log(`Clearing cache for topic: ${topic}`);
  console.log(`Cache keys to clear: ${keys.join(', ')}`);
  
  // This would require API calls to delete from Vercel Blob
  // For now, just restart the server to get fresh data
  console.log('To clear cache completely, restart your dev server');
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as typeof window & { clearLessonCache: typeof clearLessonCache }).clearLessonCache = clearLessonCache;
}
