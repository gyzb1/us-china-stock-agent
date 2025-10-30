import { NextResponse } from 'next/server';
import { getUSStockNews } from '@/lib/eastmoney-news-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/news?symbol=AAPL&limit=5
 * 获取指定股票的新闻（使用东财API）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const news = await getUSStockNews(symbol, limit);
    
    return NextResponse.json({
      success: true,
      data: news,
      symbol,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/news:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch news'
      },
      { status: 500 }
    );
  }
}
