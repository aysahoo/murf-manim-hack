import { NextRequest, NextResponse } from 'next/server';
import { topicCache } from '@/utils/cache';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await topicCache.getCacheStats();
        return NextResponse.json({
          success: true,
          stats,
          message: 'Cache statistics retrieved successfully'
        });

      case 'clear':
        await topicCache.clearAllCache();
        return NextResponse.json({
          success: true,
          message: 'All cache cleared successfully'
        });

      case 'cleanup':
        await topicCache.clearExpiredCache();
        return NextResponse.json({
          success: true,
          message: 'Expired cache entries cleared successfully'
        });

      default:
        // Default: return cache stats
        const defaultStats = await topicCache.getCacheStats();
        return NextResponse.json({
          success: true,
          stats: defaultStats,
          availableActions: ['stats', 'clear', 'cleanup'],
          message: 'Cache management API. Use ?action=stats|clear|cleanup'
        });
    }
  } catch (error) {
    console.error('Cache management error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to manage cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'clear':
        await topicCache.clearAllCache();
        return NextResponse.json({
          success: true,
          message: 'All cache cleared successfully'
        });

      case 'cleanup':
        await topicCache.clearExpiredCache();
        return NextResponse.json({
          success: true,
          message: 'Expired cache entries cleared successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "clear" or "cleanup"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cache management error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to manage cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

