import { NextResponse } from 'next/server';
import { getTopUSStocksByVolume } from '@/lib/eastmoney-service';
import { getBatchUSStockNews } from '@/lib/eastmoney-news-service';
import { summarizeNewsWithQwen } from '@/lib/qwen-ai-service';
import { StockWithNews } from '@/types/stock';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1分钟超时

/**
 * GET /api/stocks-with-news?limit=15
 * 获取成交额排名前N的美股公司及其新闻摘要（已过滤ETF）
 * 使用东方财富新闻API，无需API Key，响应速度快
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '15');

    // 1. 获取成交额排名前N的公司股票（已过滤ETF）
    const topStocks = await getTopUSStocksByVolume(limit);

    // 2. 获取这些股票的新闻（从东财）
    const symbols = topStocks.map(s => s.symbol);
    const newsMap = await getBatchUSStockNews(symbols, 5);

    // 3. 使用通义千问AI总结新闻
    const stocksWithNews: StockWithNews[] = await Promise.all(
      topStocks.map(async (stock) => {
        const news = newsMap.get(stock.symbol) || [];
        
        // 使用AI总结新闻
        const newsSummary = await summarizeNewsWithQwen(
          stock.symbol,
          stock.name,
          news
        );

        return {
          ...stock,
          news,
          newsSummary
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: stocksWithNews,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/stocks-with-news:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stocks with news'
      },
      { status: 500 }
    );
  }
}
