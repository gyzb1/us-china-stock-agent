import { NextResponse } from 'next/server';
import { getTopUSStocksByVolume } from '@/lib/eastmoney-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stocks?limit=15
 * 获取成交额排名前N的美股公司（已过滤ETF）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '15');
    
    const stocks = await getTopUSStocksByVolume(limit);
    
    return NextResponse.json({
      success: true,
      data: stocks,
      count: stocks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/stocks:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stocks'
      },
      { status: 500 }
    );
  }
}
